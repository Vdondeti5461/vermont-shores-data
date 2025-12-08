import { useCallback, useEffect, useRef, useState } from 'react';

// Types for worker messages (duplicated to avoid importing worker file)
interface LttbWorkerMessage {
  type: 'sample';
  data: any[];
  maxPoints: number;
  valueKey: string;
  requestId: string;
}

interface LttbWorkerResult {
  type: 'result';
  data: any[];
  requestId: string;
  originalLength: number;
  sampledLength: number;
}

// Hook to manage LTTB sampling in a Web Worker for non-blocking UI
export function useLttbWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRequests = useRef<Map<string, (data: any[]) => void>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Initialize worker
  useEffect(() => {
    // Create inline worker blob to avoid bundler issues
    const workerCode = `
      function lttbDownsampleWorker(data, threshold, valueKey) {
        if (data.length <= threshold || threshold < 3) return data;
        
        const dataLength = data.length;
        const sampled = [];
        sampled.push(data[0]);
        
        const bucketSize = (dataLength - 2) / (threshold - 2);
        let a = 0;
        
        for (let i = 0; i < threshold - 2; i++) {
          const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
          const avgRangeEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, dataLength);
          
          let avgX = 0, avgY = 0, avgCount = 0;
          
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
          
          const pointAVal = data[a][valueKey];
          const pointAY = pointAVal !== null && pointAVal !== undefined && !isNaN(Number(pointAVal)) 
            ? Number(pointAVal) : 0;
          
          const rangeStart = Math.floor(i * bucketSize) + 1;
          const rangeEnd = Math.min(Math.floor((i + 1) * bucketSize) + 1, dataLength);
          
          let maxArea = -1, maxAreaIndex = rangeStart;
          
          for (let j = rangeStart; j < rangeEnd; j++) {
            const val = data[j][valueKey];
            const pointY = val !== null && val !== undefined && !isNaN(Number(val)) ? Number(val) : 0;
            const area = Math.abs((a - avgX) * (pointY - pointAY) - (a - j) * (avgY - pointAY)) * 0.5;
            if (area > maxArea) {
              maxArea = area;
              maxAreaIndex = j;
            }
          }
          
          sampled.push(data[maxAreaIndex]);
          a = maxAreaIndex;
        }
        
        sampled.push(data[dataLength - 1]);
        return sampled;
      }
      
      self.onmessage = function(event) {
        const { type, data, maxPoints, valueKey, requestId } = event.data;
        if (type === 'sample') {
          const result = lttbDownsampleWorker(data, maxPoints, valueKey);
          self.postMessage({
            type: 'result',
            data: result,
            requestId,
            originalLength: data.length,
            sampledLength: result.length,
          });
        }
      };
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    workerRef.current = new Worker(workerUrl);
    
    workerRef.current.onmessage = (event: MessageEvent<LttbWorkerResult>) => {
      const { requestId, data } = event.data;
      const callback = pendingRequests.current.get(requestId);
      if (callback) {
        callback(data);
        pendingRequests.current.delete(requestId);
      }
      
      if (pendingRequests.current.size === 0) {
        setIsProcessing(false);
      }
    };
    
    return () => {
      workerRef.current?.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, []);
  
  // Sample data using worker
  const sampleAsync = useCallback(<T extends { timestamp: string; [key: string]: any }>(
    data: T[],
    maxPoints: number,
    valueKey: string
  ): Promise<T[]> => {
    return new Promise((resolve) => {
      // Short circuit for small datasets
      if (data.length <= maxPoints || maxPoints === Infinity) {
        resolve(data);
        return;
      }
      
      // Fallback if worker not available
      if (!workerRef.current) {
        console.warn('[LTTB] Worker not available, using sync sampling');
        const { lttbDownsample } = require('@/utils/lttbSampling');
        resolve(lttbDownsample(data, maxPoints, valueKey) as T[]);
        return;
      }
      
      setIsProcessing(true);
      const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      pendingRequests.current.set(requestId, (result) => {
        resolve(result as T[]);
      });
      
      const message: LttbWorkerMessage = {
        type: 'sample',
        data,
        maxPoints,
        valueKey,
        requestId,
      };
      
      workerRef.current.postMessage(message);
    });
  }, []);
  
  return { sampleAsync, isProcessing };
}
