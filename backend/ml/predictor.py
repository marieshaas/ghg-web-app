import json
from dotenv import load_dotenv
import mysql.connector
from datetime import datetime
import pandas as pd
import numpy as np
from pathlib import Path
import xgboost as xgb
import sys
import os

load_dotenv()

class GHGPredictor:
    def __init__(self):
        self.model_path = Path(__file__).parent / 'models'
        self.model = None          # xgb_small (kept for health check compat)
        self.xgb_small = None
        self.xgb_large = None
        self.threshold = None
        self.feature_cols = None
        self.metadata = {'training_date': 'xgboost_segmented'}
        self.load_model()

    def load_model(self):
        try:
            bundle_file = self.model_path / 'xgboost_segmented_bundle.json'
            with open(bundle_file, 'r') as f:
                bundle = json.load(f)

            self.threshold = bundle['threshold']
            self.feature_cols = bundle['feature_cols']

            self.xgb_small = xgb.Booster()
            self.xgb_small.load_model(bytearray(bundle['xgb_small_str'].encode()))
            self.xgb_large = xgb.Booster()
            self.xgb_large.load_model(bytearray(bundle['xgb_large_str'].encode()))
            self.model = self.xgb_small   # health check compat

            print(f"[predictor] Loaded segmented XGBoost bundle. threshold={self.threshold:.6f}")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise

    def get_supplier_monthly_data(self):
        """Query monthly aggregated emissions per (plant_id, supplier) from transport table."""
        try:
            conn = mysql.connector.connect(
                host=os.getenv('DB_HOST'),
                port=os.getenv('DB_PORT', 3306),
                user=os.getenv('DB_USER'),
                password=os.getenv('DB_PASSWORD'),
                database=os.getenv('DB_NAME')
            )
            cursor = conn.cursor()
            query = """
                SELECT plant_id, supplier, year, month,
                       SUM(emission) as total_emission,
                       COUNT(*) as freq
                FROM emissions_transport_demo
                WHERE supplier IS NOT NULL AND supplier != ''
                GROUP BY plant_id, supplier, year, month
                ORDER BY year, month
            """
            cursor.execute(query)
            rows = cursor.fetchall()
            cursor.close()
            conn.close()

            df = pd.DataFrame(rows, columns=['plant_id', 'supplier', 'year', 'month', 'total_emission', 'freq'])
            df['total_emission'] = df['total_emission'].astype(float)
            df['freq'] = df['freq'].astype(int)
            return df

        except Exception as e:
            print(f"Database error: {e}", file=sys.stderr)
            return None

    def _build_features(self, df):
        """Add lag features, rolling stats, month dummies, and encodings to aggregated df."""
        df = df.sort_values(['supplier', 'plant_id', 'year', 'month']).reset_index(drop=True)

        for lag in [1, 2, 3]:
            df[f'emission_lag_{lag}'] = df.groupby(['supplier', 'plant_id'])['total_emission'].shift(lag)

        df['emission_rolling_mean_3'] = df.groupby(['supplier', 'plant_id'])['total_emission'].transform(
            lambda x: x.shift(1).rolling(3, min_periods=1).mean()
        )
        df['emission_rolling_std_3'] = df.groupby(['supplier', 'plant_id'])['total_emission'].transform(
            lambda x: x.shift(1).rolling(3, min_periods=1).std()
        )

        for lag in [1, 2]:
            df[f'freq_lag_{lag}'] = df.groupby(['supplier', 'plant_id'])['freq'].shift(lag)

        # One-hot encode month (month_1 … month_12)
        for m in range(1, 13):
            df[f'month_{m}'] = (df['month'] == m).astype(int)

        # Label encode: sort unique values alphabetically (same as sklearn LabelEncoder)
        suppliers_sorted = sorted(df['supplier'].unique())
        supplier_map = {s: i for i, s in enumerate(suppliers_sorted)}
        df['supplier_encoded'] = df['supplier'].map(supplier_map)

        plants_sorted = sorted(df['plant_id'].unique())
        plant_map = {p: i for i, p in enumerate(plants_sorted)}
        df['plant_id_encoded'] = df['plant_id'].map(plant_map)

        return df

    def predict_next_month(self, plant_id=None, current_month=None, current_year=None, historical_data=None):
        """Predict next month total emission for a given plant (or all plants)."""
        try:
            df = self.get_supplier_monthly_data()
            if df is None or df.empty:
                raise ValueError("No data from database")

            df = self._build_features(df)
            df = df.dropna(subset=self.feature_cols).reset_index(drop=True)

            if df.empty:
                raise ValueError("No data after computing lag features (need at least 3 months of history)")

            # Use most recent row per (plant_id, supplier) as basis for next-month prediction
            last_rows = df.sort_values(['year', 'month']).groupby(['plant_id', 'supplier']).last().reset_index()

            # Shift lags forward by 1 month
            last_rows['emission_lag_3'] = last_rows['emission_lag_2']
            last_rows['emission_lag_2'] = last_rows['emission_lag_1']
            last_rows['emission_lag_1'] = last_rows['total_emission']
            last_rows['freq_lag_2'] = last_rows['freq_lag_1']
            last_rows['freq_lag_1'] = last_rows['freq']
            last_rows['emission_rolling_mean_3'] = last_rows[['emission_lag_1', 'emission_lag_2', 'emission_lag_3']].mean(axis=1)
            last_rows['emission_rolling_std_3'] = last_rows[['emission_lag_1', 'emission_lag_2', 'emission_lag_3']].std(axis=1).fillna(0)

            # Compute next month
            last_date = pd.to_datetime(
                df['year'].astype(str) + '-' + df['month'].astype(str).str.zfill(2) + '-01'
            ).max()
            next_date = last_date + pd.DateOffset(months=1)
            next_month_num = next_date.month

            for m in range(1, 13):
                last_rows[f'month_{m}'] = int(m == next_month_num)

            X_pred = last_rows[self.feature_cols]
            dmatrix = xgb.DMatrix(X_pred)

            # Segmented prediction
            small_mask = last_rows['emission_lag_1'].values <= self.threshold
            predictions = np.where(
                small_mask,
                self.xgb_small.predict(dmatrix),
                np.expm1(self.xgb_large.predict(dmatrix))
            )
            last_rows['predicted_emission'] = np.maximum(predictions, 0)

            # Filter by plant_id if specified
            if plant_id is not None:
                target_rows = last_rows[last_rows['plant_id'] == plant_id]
                if target_rows.empty:
                    raise ValueError(f"No data for plant_id={plant_id}")
                total_pred = float(target_rows['predicted_emission'].sum())
                last_emission = float(target_rows['emission_lag_1'].sum())
            else:
                total_pred = float(last_rows['predicted_emission'].sum())
                last_emission = float(last_rows['emission_lag_1'].sum())

            percentage_change = ((total_pred - last_emission) / last_emission * 100) if last_emission > 0 else 0
            confidence = 'high' if abs(percentage_change) < 10 else 'medium'

            return {
                'success': True,
                'plant_id': plant_id,
                'predicted_emission': round(total_pred, 2),
                'next_month': next_month_num,
                'percentage_change': round(percentage_change, 1),
                'confidence': confidence,
                'model_version': 'xgboost_segmented'
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'plant_id': plant_id
            }

    def predict_per_supplier(self):
        """Return per-supplier predictions for next month, sorted by predicted emission descending."""
        try:
            df = self.get_supplier_monthly_data()
            if df is None or df.empty:
                raise ValueError("No data from database")

            df = self._build_features(df)
            df = df.dropna(subset=self.feature_cols).reset_index(drop=True)

            if df.empty:
                raise ValueError("No data after computing lag features")

            last_rows = df.sort_values(['year', 'month']).groupby(['plant_id', 'supplier']).last().reset_index()

            last_rows['emission_lag_3'] = last_rows['emission_lag_2']
            last_rows['emission_lag_2'] = last_rows['emission_lag_1']
            last_rows['emission_lag_1'] = last_rows['total_emission']
            last_rows['freq_lag_2'] = last_rows['freq_lag_1']
            last_rows['freq_lag_1'] = last_rows['freq']
            last_rows['emission_rolling_mean_3'] = last_rows[['emission_lag_1', 'emission_lag_2', 'emission_lag_3']].mean(axis=1)
            last_rows['emission_rolling_std_3'] = last_rows[['emission_lag_1', 'emission_lag_2', 'emission_lag_3']].std(axis=1).fillna(0)

            last_date = pd.to_datetime(
                df['year'].astype(str) + '-' + df['month'].astype(str).str.zfill(2) + '-01'
            ).max()
            next_date = last_date + pd.DateOffset(months=1)
            next_month_num = next_date.month

            for m in range(1, 13):
                last_rows[f'month_{m}'] = int(m == next_month_num)

            X_pred = last_rows[self.feature_cols]
            dmatrix = xgb.DMatrix(X_pred)
            small_mask = last_rows['emission_lag_1'].values <= self.threshold
            predictions = np.where(
                small_mask,
                self.xgb_small.predict(dmatrix),
                np.expm1(self.xgb_large.predict(dmatrix))
            )
            last_rows['predicted_emission'] = np.maximum(predictions, 0)

            result = last_rows[['supplier', 'plant_id', 'predicted_emission']].copy()
            result['predicted_emission'] = result['predicted_emission'].round(4)
            result = result.sort_values('predicted_emission', ascending=False).reset_index(drop=True)

            return {
                'success': True,
                'next_month': int(next_month_num),
                'suppliers': result.to_dict('records')
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}


# Global predictor instance
predictor = GHGPredictor()

# API endpoints
def predict_plant_emission(plant_id, historical_data=None):
    return predictor.predict_next_month(plant_id=plant_id)

def predict_total_emission(historical_data_both_plants=None):
    plant1_pred = predictor.predict_next_month(plant_id=1)
    plant2_pred = predictor.predict_next_month(plant_id=2)

    if plant1_pred['success'] and plant2_pred['success']:
        total = plant1_pred['predicted_emission'] + plant2_pred['predicted_emission']
        return {
            'success': True,
            'total_predicted': round(total, 2),
        }
    else:
        return {'success': False, 'error': 'Prediction failed for one or both plants'}
