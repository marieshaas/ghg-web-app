export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const plants = [
  { value: 'A', label: 'Plant A' },
  { value: 'B', label: 'Plant B' },
];

export const categories = [
  { value: '1', label: '1 - Direct Emissions' },
  { value: '2', label: '2 - Indirect Emissions' },
  { value: '3', label: '3 - Other Indirect Emissions (Transportation)' },
  { value: '4', label: '4 - Other Indirect Emissions (Product/Material)' },
];

export const subcategories = {
  '1': [
    { value: '1.1', label: '1.1 - Stationary Combustion' },
    { value: '1.2', label: '1.2 - Mobile Combustion' },
    { value: '1.3', label: '1.3 - Fugitive Emissions' },
    { value: '1.4', label: '1.4 - Refrigerant Emissions' },
  ],
  '2': [
    { value: '2.1', label: '2.1 - Purchased Electricity' }
  ],
  '3': [
    { value: '3.1', label: '3.1 - Upstream Transportation Direct' },
    { value: '3.11', label: '3.1 - Upstream Transportation Indirect' },
    { value: '3.2', label: '3.2 - Downstream Transportation Indirect' },
    { value: '3.5', label: '3.5 - Business Travel' },
  ],
  '4': [
    { value: '4.1', label: '4.1 - Purchased Goods' }
  ],
};

export const subAreas = {
  '1.1': {
    'A': [ // Bogor
      { value: 'tungku', label: 'Tungku Bakar (FA, FB, Boiler Besar)' },
      { value: 'mini_boiler', label: 'Mini Boiler' },
      { value: 'genset', label: 'Genset' },
      
    ],
    'B': [ // Maja
      { value: 'tungku', label: 'Tungku Bakar & Boiler' }
    ]
  },
  
  '1.2': [
  {value: 'forklift', label: 'Forklift'},
  {value: 'vehicle_transport', label: 'Vehicle Transport'},
  ],

  '2.1': [
  {value: 'office', label: 'Office'},
  {value: 'maintenance', label: 'Maintenance'},
  {value: 'production', label: 'Production'},
  ]
};

export const months = [
  { value: '1', label: 'January', short: 'Jan' },
  { value: '2', label: 'February', short: 'Feb' },
  { value: '3', label: 'March', short: 'Mar' },
  { value: '4', label: 'April', short: 'Apr' },
  { value: '5', label: 'May', short: 'May' },
  { value: '6', label: 'June', short: 'Jun' },
  { value: '7', label: 'July', short: 'Jul' },
  { value: '8', label: 'August', short: 'Aug' },
  { value: '9', label: 'September', short: 'Sep' },
  { value: '10', label: 'October', short: 'Oct' },
  { value: '11', label: 'November', short: 'Nov' },
  { value: '12', label: 'December', short: 'Dec' },
];