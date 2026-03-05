import { StateData } from '@/components/StateMapPlotter';

/**
 * Generates a color scale for states based on their values
 */
export const generateColorScale = (
  data: StateData[], 
  colorRange: string[] = ['#fee5d9', '#de2d26']
): StateData[] => {
  if (data.length === 0) return data;

  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  return data.map(state => {
    const normalizedValue = (state.value - minValue) / (maxValue - minValue);
    const color = interpolateColor(colorRange[0], colorRange[1], normalizedValue);
    
    return {
      ...state,
      color: color
    };
  });
};

/**
 * Interpolates between two hex colors
 */
export const interpolateColor = (color1: string, color2: string, factor: number): string => {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substr(0, 2), 16);
  const g1 = parseInt(hex1.substr(2, 2), 16);
  const b1 = parseInt(hex1.substr(4, 2), 16);
  
  const r2 = parseInt(hex2.substr(0, 2), 16);
  const g2 = parseInt(hex2.substr(2, 2), 16);
  const b2 = parseInt(hex2.substr(4, 2), 16);
  
  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Predefined color palettes for state maps
 */
export const colorPalettes = {
  blues: ['#f7fbff', '#08519c'],
  greens: ['#f7fcf5', '#196619'],
  reds: ['#fff5f0', '#a50f15'],
  oranges: ['#fff5eb', '#b94000'],
  purples: ['#fcfbfd', '#6a0dad'],
  viridis: ['#440154', '#21908c', '#5dc963', '#fde725'],
  plasma: ['#0d0887', '#7e03a8', '#cc4778', '#f89441', '#f0f921']
};

/**
 * Maps CSV/Excel data to StateData format
 */
export const mapDataToStates = (
  rawData: Array<{ [key: string]: any }>,
  stateNameField: string,
  valueField: string,
  colorField?: string
): StateData[] => {
  return rawData.map(row => ({
    name: row[stateNameField],
    value: parseFloat(row[valueField]) || 0,
    color: colorField ? row[colorField] : undefined
  }));
};

/**
 * Normalizes state names to match GeoJSON properties
 */
export const normalizeStateName = (name: string): string => {
  const nameMapping: { [key: string]: string } = {
    'A&N Islands': 'Andaman and Nicobar',
    'Arunachal': 'Arunachal Pradesh',
    'Assam': 'Assam',
    'Bihar': 'Bihar',
    'Chandigarh': 'Chandigarh',
    'Chhattisgarh': 'Chhattisgarh',
    'D&N Haveli': 'Dadra and Nagar Haveli and Daman and Diu',
    'Daman & Diu': 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi': 'Delhi',
    'Goa': 'Goa',
    'Gujarat': 'Gujarat',
    'Haryana': 'Haryana',
    'Himachal Pradesh': 'Himachal Pradesh',
    'Jammu & Kashmir': 'Jammu and Kashmir',
    'J&K': 'Jammu and Kashmir',
    'Jharkhand': 'Jharkhand',
    'Karnataka': 'Karnataka',
    'Kerala': 'Kerala',
    'Ladakh': 'Ladakh',
    'Lakshadweep': 'Lakshadweep',
    'Madhya Pradesh': 'Madhya Pradesh',
    'MP': 'Madhya Pradesh',
    'Maharashtra': 'Maharashtra',
    'Manipur': 'Manipur',
    'Meghalaya': 'Meghalaya',
    'Mizoram': 'Mizoram',
    'Nagaland': 'Nagaland',
    'Odisha': 'Odisha',
    'Orissa': 'Odisha',
    'Puducherry': 'Puducherry',
    'Pondicherry': 'Puducherry',
    'Punjab': 'Punjab',
    'Rajasthan': 'Rajasthan',
    'Sikkim': 'Sikkim',
    'Tamil Nadu': 'Tamil Nadu',
    'TN': 'Tamil Nadu',
    'Telangana': 'The Nilgiris', // Note: This might need adjustment based on your GeoJSON
    'Tripura': 'Tripura',
    'Uttar Pradesh': 'Uttar Pradesh',
    'UP': 'Uttar Pradesh',
    'Uttarakhand': 'Uttarakhand',
    'West Bengal': 'West Bengal',
    'WB': 'West Bengal'
  };
  
  return nameMapping[name] || name;
};

/**
 * Calculates statistics for the state data
 */
export const calculateStats = (data: StateData[]) => {
  const values = data.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const median = [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((a, b) => a + b, 0);
  
  return { mean, median, min, max, sum, count: values.length };
};