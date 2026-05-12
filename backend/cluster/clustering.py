# python/clustering.py
import sys
import json
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, davies_bouldin_score

def remove_outliers_iqr(data):
    df = data.copy()
    for col in ['total_emission', 'frequency']:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR
        df = df[(df[col] >= lower) & (df[col] <= upper)]
    return df

def perform_clustering(df):
    X = df[['total_emission', 'frequency']].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    df['cluster'] = kmeans.fit_predict(X_scaled)
    
    silhouette = silhouette_score(X_scaled, df['cluster'])
    davies_bouldin = davies_bouldin_score(X_scaled, df['cluster'])
    
    cluster_stats = []
    for i in range(3):
        cluster_data = df[df['cluster'] == i]
        avg_emission = cluster_data['total_emission'].mean()
        avg_frequency = cluster_data['frequency'].mean()
        emission_per_transaction = avg_emission / avg_frequency if avg_frequency > 0 else 0
        
        cluster_stats.append({
            'cluster': int(i),
            'supplier_count': int(len(cluster_data)),
            'avg_emission': float(avg_emission),
            'avg_frequency': float(avg_frequency),
            'emission_per_transaction': float(emission_per_transaction),
            'total_emission': float(cluster_data['total_emission'].sum())
        })
    
    cluster_stats = sorted(cluster_stats, key=lambda x: x['emission_per_transaction'], reverse=True)
    cluster_stats[0]['intensity'] = 'High Intensity'
    cluster_stats[1]['intensity'] = 'Medium Intensity'
    cluster_stats[2]['intensity'] = 'Low Intensity'
    
    suppliers_list = df[['plant_id', 'supplier', 'total_emission', 'frequency', 'cluster']].to_dict('records')
    
    return {
        'metrics': {
            'silhouette_score': float(silhouette),
            'davies_bouldin_index': float(davies_bouldin)
        },
        'clusters': cluster_stats,
        'suppliers': suppliers_list
    }

if __name__ == '__main__':
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    with open(input_file, 'r', encoding='utf-8') as f:
        payload = json.load(f)
    
    suppliers = payload['suppliers']
    remove_outliers = payload['removeOutliers']
    
    df = pd.DataFrame(suppliers)
    
    if remove_outliers:
        df = remove_outliers_iqr(df)
    
    if len(df) == 0:
        result = { 'metrics': { 'silhouette_score': 0, 'davies_bouldin_index': 0 }, 'clusters': [], 'suppliers': [] }
    else:
        result = perform_clustering(df)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f)