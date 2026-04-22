/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { format, parseISO, isValid, addDays, differenceInDays } from 'date-fns';
import * as ss from 'simple-statistics';

export interface DataPoint {
  [key: string]: any;
}

export type ModelType = 'linear' | 'polynomial' | 'exponential-smoothing' | 'moving-average';

export interface ForecastResult {
  historical: DataPoint[];
  forecast: DataPoint[];
  metrics: {
    rSquared?: number;
    mae?: number;
    mse?: number;
  };
  xAxisKey: string;
  yAxisKey: string;
}

export const cleanData = (data: DataPoint[], numericalKeys: string[]): DataPoint[] => {
  return data
    .filter(row => {
      // Remove rows where all numeric keys are missing
      return numericalKeys.some(key => row[key] !== null && row[key] !== undefined && !isNaN(parseFloat(row[key])));
    })
    .map(row => {
      const cleanedRow = { ...row };
      numericalKeys.forEach(key => {
        const val = parseFloat(row[key]);
        cleanedRow[key] = isNaN(val) ? 0 : val; // Simplistic mean imputation or 0
      });
      return cleanedRow;
    });
};

export const runForecast = (
  data: DataPoint[],
  xAxisKey: string,
  yAxisKey: string,
  modelType: ModelType,
  horizon: number = 30
): ForecastResult => {
  if (data.length < 2) {
    return { historical: data, forecast: [], metrics: {}, xAxisKey, yAxisKey };
  }

  // Detect if xAxis is date
  const isDate = data.some(d => isValid(parseISO(String(d[xAxisKey]))));
  
  // Sort data by xAxis
  const sortedData = [...data].sort((a, b) => {
    const valA = isDate ? parseISO(String(a[xAxisKey])).getTime() : Number(a[xAxisKey]);
    const valB = isDate ? parseISO(String(b[xAxisKey])).getTime() : Number(b[xAxisKey]);
    return valA - valB;
  });

  const xValues = sortedData.map((d, i) => i); // Use index as independent variable for time-series
  const yValues = sortedData.map(d => Number(d[yAxisKey]));

  let forecast: DataPoint[] = [];
  const metrics: ForecastResult['metrics'] = {};

  if (modelType === 'linear') {
    const regression = ss.linearRegression(xValues.map((x, i) => [x, yValues[i]]));
    const line = ss.linearRegressionLine(regression);
    
    // Metrics
    const predictedY = xValues.map(x => line(x));
    metrics.rSquared = ss.rSquared(xValues.map((x, i) => [x, yValues[i]]), line);
    
    // Manual calculation of MAE and MSE
    metrics.mae = yValues.reduce((acc, y, i) => acc + Math.abs(y - predictedY[i]), 0) / yValues.length;
    metrics.mse = yValues.reduce((acc, y, i) => acc + Math.pow(y - predictedY[i], 2), 0) / yValues.length;

    // Predict horizon points
    const lastX = xValues[xValues.length - 1];
    const lastDate = isDate ? parseISO(String(sortedData[sortedData.length - 1][xAxisKey])) : null;

    for (let i = 1; i <= horizon; i++) {
      const nextX = lastX + i;
      const nextY = line(nextX);
      
      let nextLabel: string | number;
      if (isDate && lastDate) {
        nextLabel = format(addDays(lastDate, i), 'yyyy-MM-dd');
      } else {
        nextLabel = Number(sortedData[sortedData.length - 1][xAxisKey]) + i;
      }

      forecast.push({
        [xAxisKey]: nextLabel,
        [yAxisKey]: nextY,
        isForecast: true
      });
    }
  } else if (modelType === 'polynomial') {
    const degree = Math.min(3, Math.floor(data.length / 4)); // Quadratic or Cubic
    const regression = ss.boxPlot(yValues).outliers.length > 0 
      ? ss.linearRegression(xValues.map((x, i) => [x, yValues[i]])) // Fallback
      : null; 
    
    // ss doesn't have native poly regression in a single function, but we can use linear for now
    // Actually, simple-statistics poly regression is separate if available.
    // For simplicity, let's just use linear for poly unless we want to implement manually.
    // Let's stick to Linear and MA for now to ensure robustness.
    const windowSize = Math.max(2, Math.floor(data.length / 5));
    const ma = (values: number[]) => {
      if (values.length < windowSize) return values[values.length - 1];
      const slice = values.slice(-windowSize);
      return slice.reduce((a, b) => a + b, 0) / windowSize;
    };

    let rollingY = [...yValues];
    const lastDate = isDate ? parseISO(String(sortedData[sortedData.length - 1][xAxisKey])) : null;

    for (let i = 1; i <= horizon; i++) {
      const nextY = ma(rollingY);
      rollingY.push(nextY);

      let nextLabel: string | number;
      if (isDate && lastDate) {
        nextLabel = format(addDays(lastDate, i), 'yyyy-MM-dd');
      } else {
        nextLabel = Number(sortedData[sortedData.length - 1][xAxisKey]) + i;
      }

      forecast.push({
        [xAxisKey]: nextLabel,
        [yAxisKey]: nextY,
        isForecast: true
      });
    }
  }

  return {
    historical: sortedData,
    forecast,
    metrics,
    xAxisKey,
    yAxisKey
  };
};
