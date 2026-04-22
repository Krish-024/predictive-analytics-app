/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Database, 
  TrendingUp, 
  BarChart3, 
  RefreshCw, 
  BrainCircuit, 
  Info,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DataUploader from './components/DataUploader';
import ForecastChart from './components/ForecastChart';
import { DataPoint, ModelType, cleanData, runForecast, ForecastResult } from './lib/analytics';
import { GoogleGenAI } from '@google/genai';
import { SAMPLE_SALES_DATA, SAMPLE_STOCK_DATA } from './constants';

export default function App() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [columns, setColumns] = useState<string[]>([]);
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');
  const [modelType, setModelType] = useState<ModelType>('linear');
  const [horizon, setHorizon] = useState(30);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const handleDataLoaded = (loadedData: any[], name: string, autoRun = false) => {
    setData(loadedData);
    setFileName(name);
    if (loadedData.length > 0) {
      const keys = Object.keys(loadedData[0]);
      setColumns(keys);
      // Guess columns
      const likelyDate = keys.find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('time') || k.toLowerCase().includes('year'));
      const likelyValue = keys.find(k => !k.toLowerCase().includes('date') && typeof loadedData[0][k] === 'number');
      const xKey = likelyDate || keys[0];
      const yKey = likelyValue || keys[1] || keys[0];
      setXAxis(xKey);
      setYAxis(yKey);

      if (autoRun) {
        // We use a small timeout to ensure state is updated or just pass values
        setTimeout(() => executeAnalysis(loadedData, xKey, yKey), 100);
      }
    }
  };

  const executeAnalysis = async (overrideData?: any[], overrideX?: string, overrideY?: string) => {
    const targetData = overrideData || data;
    const targetX = overrideX || xAxis;
    const targetY = overrideY || yAxis;

    if (!targetData.length || !targetX || !targetY) return;
    setIsAnalyzing(true);
    
    const cleaned = cleanData(targetData, [targetY]);
    const result = runForecast(cleaned, targetX, targetY, modelType, horizon);
    setForecastResult(result);

    // Try to get AI Insight
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this dataset statistics for trend forecasting. 
        Historical Data Length: ${data.length}
        Target Variable: ${yAxis} over ${xAxis}
        Model Used: ${modelType}
        Forecast Horizon: ${horizon} units
        Stats: R-Squared: ${result.metrics.rSquared?.toFixed(4) || 'N/A'}, MAE: ${result.metrics.mae?.toFixed(2) || 'N/A'}.
        Please provide a brief 2-3 sentence executive insight on the trend direction and data reliability.`,
      });
      
      setAiInsight(response.text);
    } catch (e) {
      console.error("AI Insight failed", e);
    }
    
    setIsAnalyzing(false);
  };

  const downloadCSV = () => {
    if (!forecastResult) return;
    const combined = [...forecastResult.historical, ...forecastResult.forecast];
    const csv = Papa.unparse(combined);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `forecast_${fileName}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">PredictiTrend</h1>
            <p className="text-xs text-slate-500 font-medium">Historical Predictive Analytics</p>
          </div>
        </div>
        {data.length > 0 && (
          <button 
            onClick={() => setData([])}
            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Reset Analysis
          </button>
        )}
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {!data.length ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Insights from History, <br/><span className="text-blue-600 underline decoration-blue-200">Vision for Tomorrow.</span></h2>
              <p className="text-slate-500 max-w-lg mx-auto text-lg">
                Powerful time-series forecasting and regression models. Upload your historical data to start predicting.
              </p>
            </motion.div>
            <DataUploader onDataLoaded={handleDataLoaded} />
            
            <div className="mt-12 w-full max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles size={20} className="text-blue-500" />
                <h3 className="text-lg font-bold text-slate-800">Quick Start with Sample Sets</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => handleDataLoaded(SAMPLE_SALES_DATA, 'Retail_Sales_Growth.csv', true)}
                  className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all text-left group"
                >
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Retail Sales Data</h4>
                    <p className="text-sm text-slate-500 mt-1">20 days of sales trends with volume and date tracking.</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleDataLoaded(SAMPLE_STOCK_DATA, 'Market_Stock_Prices.csv', true)}
                  className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-400 hover:shadow-md transition-all text-left group"
                >
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Stock Market Simulation</h4>
                    <p className="text-sm text-slate-500 mt-1">Linear growth dataset for testing accuracy metrics.</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Configuration */}
            <div className="lg:col-span-4 space-y-6">
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                  <Database size={18} className="text-blue-500" />
                  <h3 className="font-bold">Dataset Config</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Time/X-Axis Column</label>
                    <select 
                      value={xAxis}
                      onChange={(e) => setXAxis(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    >
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Target/Y-Axis Column</label>
                    <select 
                      value={yAxis}
                      onChange={(e) => setYAxis(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    >
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                  <Layers size={18} className="text-indigo-500" />
                  <h3 className="font-bold">Model Settings</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Forecasting Model</label>
                    <div className="grid grid-cols-1 gap-2">
                       {['linear', 'moving-average'].map((type) => (
                         <button
                           key={type}
                           onClick={() => setModelType(type as ModelType)}
                           className={`h-11 px-4 rounded-xl text-sm font-medium flex items-center justify-between border transition-all ${
                             modelType === type 
                             ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                             : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'
                           }`}
                         >
                           {type === 'linear' ? 'Linear Regression' : 'Simple Moving Avg'}
                           {modelType === type && <ChevronRight size={16} />}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Predict Horizon ({horizon} steps)</label>
                    <input 
                      type="range"
                      min="5"
                      max="100"
                      step={1}
                      value={horizon}
                      onChange={(e) => setHorizon(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <button
                    onClick={executeAnalysis}
                    disabled={isAnalyzing}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? <RefreshCw className="animate-spin" /> : <TrendingUp size={20} />}
                    Run Model Analysis
                  </button>
                </div>
              </section>

              {forecastResult && (
                <section className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={18} />
                    <h3 className="font-bold">Model Accuracy</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-indigo-100 text-sm">R-Squared (Fit)</span>
                      <span className="font-mono text-lg font-bold">{forecastResult.metrics.rSquared?.toFixed(4) || '0.000'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-100 text-sm">Mean Abs Error</span>
                      <span className="font-mono text-lg font-bold">{forecastResult.metrics.mae?.toFixed(2) || '0.00'}</span>
                    </div>
                    <p className="text-[10px] text-indigo-200/60 leading-relaxed italic">
                      Disclaimer: Projections are based on historical correlation and should be used as decision support, not financial advice.
                    </p>
                  </div>
                </section>
              )}
            </div>

            {/* Main Visuals area */}
            <div className="lg:col-span-8 space-y-6">
              {forecastResult ? (
                <>
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-black text-slate-800">Historical & Predicted Trends</h3>
                      <div className="inline-flex items-center bg-slate-50 px-3 py-1 rounded-full text-xs font-bold text-slate-500 gap-1.5 border border-slate-100">
                        <Calendar size={12} />
                        Active Variable: {yAxis}
                      </div>
                    </div>
                    <p className="text-slate-500 mb-8 border-b border-slate-50 pb-4">Analyzing patterns from {fileName} using {modelType} model.</p>
                    <ForecastChart data={forecastResult} />
                  </div>

                  <AnimatePresence>
                    {aiInsight && (
                      <motion.section 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-blue-100 p-8 shadow-sm relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <BrainCircuit size={20} />
                          </div>
                          <h3 className="font-bold text-slate-800">Intelligent Insights</h3>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-lg italic">
                          "{aiInsight}"
                        </p>
                      </motion.section>
                    )}
                  </AnimatePresence>

                  <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                        <Download size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Export Final Forecast</p>
                        <p className="text-xs text-slate-400">Download the combined dataset as CSV</p>
                      </div>
                    </div>
                    <button 
                      onClick={downloadCSV}
                      className="px-6 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                      Download CSV
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-white h-full flex flex-col items-center justify-center rounded-2xl border border-slate-200 border-dashed p-20 text-center space-y-4">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                     <TrendingUp size={40} />
                   </div>
                   <h3 className="text-xl font-bold text-slate-400">Waiting for Configuration</h3>
                   <p className="text-slate-400 max-w-sm">Select your dimensions and model settings on the left and click 'Run Model Analysis' to see predictions.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <footer className="mt-20 border-t border-slate-200 py-12 px-8 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <TrendingUp size={16} />
            <span className="text-xs font-bold tracking-widest uppercase">Analytics Engine v1.0</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900">Privacy</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900">Security</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
