// Web Worker for LTTB sampling - runs in background thread to prevent UI blocking

export interface LttbWorkerMessage {
  type: 'sample';
  data: any[];
  maxPoints: number;
  valueKey: string;
  requestId: string;
}

export interface LttbWorkerResult {
  type: 'result';
  data: any[];
  requestId: string;
  originalLength: number;
  sampledLength: number;
}

// LTTB algorithm implementation for worker
function lttbDownsampleWorker(data: any[], threshold: number, valueKey: string): any[] {
  if (data.length <= threshold || threshold < 3) {
    return data;
  }

  const dataLength = data.length;
  const sampled: any[] = [];
  
  // Always include first point
  sampled.push(data[0]);
  
  // Bucket size
  const bucketSize = (dataLength - 2) / (threshold - 2);
  
  let a = 0; // Initially the first point
  
  for (let i = 0; i < threshold - 2; i++) {
    // Calculate point average for next bucket (C)
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, dataLength);
    
    let avgX = 0;
    let avgY = 0;
    let avgCount = 0;
    
    for (let j = avgRangeStart; j < avgRangeEnd; j++) {
      const val = data[j][valueKey];
      if (val !== null && val !== undefined && !isNaN(Number(val))) {
        avgX += j;
        avgY += Number(val);
        avgCount++;
      }
    }
    
    if (avgCount === 0) {
      avgX = (avgRangeStart + avgRangeEnd) / 2;
      avgY = 0;
    } else {
      avgX /= avgCount;
      avgY /= avgCount;
    }
    
    // Get point A value
    const pointAVal = data[a][valueKey];
    const pointAY = pointAVal !== null && pointAVal !== undefined && !isNaN(Number(pointAVal)) 
      ? Number(pointAVal) 
      : 0;
    
    // Find point in current bucket (B) with largest triangle area
    const rangeStart = Math.floor(i * bucketSize) + 1;
    const rangeEnd = Math.min(Math.floor((i + 1) * bucketSize) + 1, dataLength);
    
    let maxArea = -1;
    let maxAreaIndex = rangeStart;
    
    for (let j = rangeStart; j < rangeEnd; j++) {
      const val = data[j][valueKey];
      const pointY = val !== null && val !== undefined && !isNaN(Number(val)) ? Number(val) : 0;
      
      // Calculate triangle area using cross product
      const area = Math.abs((a - avgX) * (pointY - pointAY) - (a - j) * (avgY - pointAY)) * 0.5;
      
      if (area > maxArea) {
        maxArea = area;
        maxAreaIndex = j;
      }
    }
    
    sampled.push(data[maxAreaIndex]);
    a = maxAreaIndex;
  }
  
  // Always include last point
  sampled.push(data[dataLength - 1]);
  
  return sampled;
}

// Worker message handler
self.onmessage = (event: MessageEvent<LttbWorkerMessage>) => {
  const { type, data, maxPoints, valueKey, requestId } = event.data;
  
  if (type === 'sample') {
    const result = lttbDownsampleWorker(data, maxPoints, valueKey);
    
    const response: LttbWorkerResult = {
      type: 'result',
      data: result,
      requestId,
      originalLength: data.length,
      sampledLength: result.length,
    };
    
    self.postMessage(response);
  }
};
