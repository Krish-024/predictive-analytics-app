/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DataUploaderProps {
  onDataLoaded: (data: any[], fileName: string) => void;
}

export default function DataUploader({ onDataLoaded }: DataUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setError('The CSV file is empty.');
          return;
        }
        onDataLoaded(results.data, file.name);
        setError(null);
      },
      error: (err) => {
        setError(`Error parsing CSV: ${err.message}`);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        id="drop-zone"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={
          `relative border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer text-center
          ${isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 bg-white shadow-sm'}`
        }
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="hidden"
          accept=".csv"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-blue-100 rounded-full text-blue-600">
            <Upload size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Upload Historical Data</h3>
            <p className="text-slate-500 text-sm mt-1">Drag and drop your .csv file here or click to browse</p>
          </div>
          <div className="flex gap-2 text-xs text-slate-400 font-mono mt-4 uppercase tracking-wider">
            <span>Sales History</span>
            <span>•</span>
            <span>Stock Prices</span>
            <span>•</span>
            <span>IoT Sensors</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600"
          >
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
