/**
 * LTTB (Largest Triangle Three Buckets) Algorithm
 * 
 * Industry-standard downsampling algorithm for time series data.
 * Used by Grafana, InfluxDB, and other major visualization platforms.
 * 
 * This algorithm preserves the visual characteristics of the data
 * while dramatically reducing the number of points to render.
 * 
 * Reference: Sveinn Steinarsson's thesis
 * "Downsampling Time Series for Visual Representation"
 */

export interface DataPoint {
  timestamp: string;
  [key: string]: string | number | null;
}

/**
 * LTTB downsampling for a single value series
 * @param data - Array of data points
 * @param threshold - Target number of points
 * @param valueKey - Key of the value to use for LTTB calculation
 * @returns Downsampled array preserving visual shape
 */
export function lttbDownsample<T extends DataPoint>(
  data: T[],
  threshold: number,
  valueKey: string
): T[] {
  const dataLength = data.length;
  
  // Return original if below threshold or threshold is invalid
  if (threshold >= dataLength || threshold <= 2) {
    return data;
  }

  const sampled: T[] = [];
  
  // Bucket size calculation
  const bucketSize = (dataLength - 2) / (threshold - 2);
  
  // Always include first point
  sampled.push(data[0]);
  let previousIndex = 0;
  
  for (let i = 0; i < threshold - 2; i++) {
    // Calculate bucket boundaries
    const bucketStart = Math.floor((i + 1) * bucketSize) + 1;
    const bucketEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, dataLength - 1);
    
    // Calculate average point in next bucket for triangle calculation
    let avgX = 0;
    let avgY = 0;
    let avgCount = 0;
    
    const nextBucketStart = Math.floor((i + 2) * bucketSize) + 1;
    const nextBucketEnd = Math.min(Math.floor((i + 3) * bucketSize) + 1, dataLength - 1);
    
    for (let j = nextBucketStart; j < nextBucketEnd; j++) {
      const value = data[j]?.[valueKey];
      if (value !== null && value !== undefined && !isNaN(Number(value))) {
        avgX += j;
        avgY += Number(value);
        avgCount++;
      }
    }
    
    if (avgCount === 0) {
      avgX = (nextBucketStart + nextBucketEnd) / 2;
      avgY = 0;
    } else {
      avgX /= avgCount;
      avgY /= avgCount;
    }
    
    // Get the previous selected point
    const prevValue = data[previousIndex]?.[valueKey];
    const pointA = {
      x: previousIndex,
      y: prevValue !== null && prevValue !== undefined ? Number(prevValue) : 0
    };
    
    // Find the point in current bucket with largest triangle area
    let maxArea = -1;
    let maxAreaIndex = bucketStart;
    
    for (let j = bucketStart; j < bucketEnd; j++) {
      const currentValue = data[j]?.[valueKey];
      const currentY = currentValue !== null && currentValue !== undefined ? Number(currentValue) : 0;
      
      // Calculate triangle area using cross-product method
      const area = Math.abs(
        (pointA.x - avgX) * (currentY - pointA.y) -
        (pointA.x - j) * (avgY - pointA.y)
      ) * 0.5;
      
      if (area > maxArea) {
        maxArea = area;
        maxAreaIndex = j;
      }
    }
    
    sampled.push(data[maxAreaIndex]);
    previousIndex = maxAreaIndex;
  }
  
  // Always include last point
  sampled.push(data[dataLength - 1]);
  
  return sampled;
}

/**
 * LTTB downsampling for multiple databases/series
 * Preserves corresponding points across all series for proper comparison
 * @param datasets - Array of {database, data} objects
 * @param threshold - Target number of points per series
 * @param valueKey - Key of the value to use for LTTB calculation
 * @returns Downsampled datasets
 */
export function lttbMultiSeriesDownsample<T extends DataPoint>(
  datasets: { database: string; data: T[] }[],
  threshold: number,
  valueKey: string
): { database: string; data: T[] }[] {
  // Find the dataset with the most points to use as reference
  const maxDataset = datasets.reduce((max, current) => 
    current.data.length > max.data.length ? current : max
  , datasets[0]);
  
  if (!maxDataset || maxDataset.data.length === 0) {
    return datasets;
  }
  
  // If all datasets are small enough, return as-is
  if (maxDataset.data.length <= threshold) {
    return datasets;
  }
  
  // Get the reference timestamps from LTTB-sampled largest dataset
  const sampledReference = lttbDownsample(maxDataset.data, threshold, valueKey);
  const referenceTimestamps = new Set(sampledReference.map(d => d.timestamp));
  
  // Filter other datasets to include only the reference timestamps
  // Plus include their own important peaks/valleys
  return datasets.map(({ database, data }) => {
    if (database === maxDataset.database) {
      return { database, data: sampledReference };
    }
    
    // For other datasets: include reference timestamps + LTTB selected points
    const dataMap = new Map(data.map(d => [d.timestamp, d]));
    const ownSampled = lttbDownsample(data, Math.ceil(threshold / 2), valueKey);
    const ownTimestamps = new Set(ownSampled.map(d => d.timestamp));
    
    // Combine: all reference timestamps + own important points
    const combinedTimestamps = new Set([...referenceTimestamps, ...ownTimestamps]);
    
    const result = Array.from(combinedTimestamps)
      .filter(ts => dataMap.has(ts))
      .map(ts => dataMap.get(ts)!)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    return { database, data: result };
  });
}

/**
 * Simple min-max sampling for extreme value preservation
 * Useful for quick overview when LTTB is overkill
 * @param data - Array of data points
 * @param buckets - Number of buckets
 * @param valueKey - Key of the value to sample
 * @returns Sampled array with min/max per bucket
 */
export function minMaxSample<T extends DataPoint>(
  data: T[],
  buckets: number,
  valueKey: string
): T[] {
  if (data.length <= buckets * 2) {
    return data;
  }
  
  const bucketSize = Math.ceil(data.length / buckets);
  const result: T[] = [];
  
  for (let i = 0; i < data.length; i += bucketSize) {
    const bucket = data.slice(i, i + bucketSize);
    
    let minPoint = bucket[0];
    let maxPoint = bucket[0];
    let minVal = Infinity;
    let maxVal = -Infinity;
    
    bucket.forEach(point => {
      const val = Number(point[valueKey]);
      if (!isNaN(val)) {
        if (val < minVal) {
          minVal = val;
          minPoint = point;
        }
        if (val > maxVal) {
          maxVal = val;
          maxPoint = point;
        }
      }
    });
    
    // Add in chronological order
    if (new Date(minPoint.timestamp) <= new Date(maxPoint.timestamp)) {
      result.push(minPoint);
      if (minPoint !== maxPoint) result.push(maxPoint);
    } else {
      result.push(maxPoint);
      if (minPoint !== maxPoint) result.push(minPoint);
    }
  }
  
  return result;
}
