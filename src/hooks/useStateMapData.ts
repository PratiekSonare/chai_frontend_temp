import { useState, useEffect, useCallback } from 'react';
import { StateData } from '@/components/StateMapPlotter';
import { generateColorScale, colorPalettes, calculateStats } from '@/lib/mapUtils';

interface UseStateMapDataOptions {
  initialData?: StateData[];
  autoColorScale?: boolean;
  colorPalette?: string[];
  sortBy?: 'name' | 'value' | 'none';
  sortOrder?: 'asc' | 'desc';
}

interface Statistics {
  mean: number;
  median: number;
  min: number;
  max: number;
  sum: number;
  count: number;
}

export const useStateMapData = (options: UseStateMapDataOptions = {}) => {
  const {
    initialData = [],
    autoColorScale = false,
    colorPalette = colorPalettes.blues,
    sortBy = 'none',
    sortOrder = 'desc'
  } = options;

  const [data, setData] = useState<StateData[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  // Update statistics when data changes
  useEffect(() => {
    if (data.length > 0) {
      setStatistics(calculateStats(data));
    } else {
      setStatistics(null);
    }
  }, [data]);

  // Process and sort data
  const processedData = useCallback(() => {
    let processed = [...data];

    // Apply auto color scale
    if (autoColorScale && processed.length > 0) {
      processed = generateColorScale(processed, colorPalette);
    }

    // Apply sorting
    if (sortBy !== 'none') {
      processed.sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'value') {
          comparison = a.value - b.value;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return processed;
  }, [data, autoColorScale, colorPalette, sortBy, sortOrder]);

  // Load data from API or external source
  const loadData = useCallback(async (url: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
      }
      
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading state data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add or update state data
  const updateState = useCallback((stateName: string, value: number, color?: string) => {
    setData(prevData => {
      const existingIndex = prevData.findIndex(item => item.name === stateName);
      
      if (existingIndex >= 0) {
        // Update existing state
        const updatedData = [...prevData];
        updatedData[existingIndex] = { 
          ...updatedData[existingIndex], 
          value, 
          color: color || updatedData[existingIndex].color 
        };
        return updatedData;
      } else {
        // Add new state
        return [...prevData, { name: stateName, value, color }];
      }
    });
  }, []);

  // Remove state data
  const removeState = useCallback((stateName: string) => {
    setData(prevData => prevData.filter(item => item.name !== stateName));
  }, []);

  // Clear all data
  const clearData = useCallback(() => {
    setData([]);
    setError(null);
  }, []);

  // Filter data based on criteria
  const filterData = useCallback((predicate: (state: StateData) => boolean) => {
    return data.filter(predicate);
  }, [data]);

  // Get top N states by value
  const getTopStates = useCallback((n: number = 5) => {
    return [...data]
      .sort((a, b) => b.value - a.value)
      .slice(0, n);
  }, [data]);

  // Get states within a value range
  const getStatesInRange = useCallback((min: number, max: number) => {
    return data.filter(state => state.value >= min && state.value <= max);
  }, [data]);

  // Apply color scale to current data
  const applyColorScale = useCallback((palette?: string[]) => {
    const colors = palette || colorPalette;
    const coloredData = generateColorScale(data, colors);
    setData(coloredData);
  }, [data, colorPalette]);

  return {
    data: processedData(),
    rawData: data,
    loading,
    error,
    statistics,
    
    // Data manipulation functions
    loadData,
    updateState,
    removeState,
    clearData,
    setData,
    
    // Query functions
    filterData,
    getTopStates,
    getStatesInRange,
    
    // Utility functions
    applyColorScale
  };
};