/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Area, 
  AreaChart, 
  ComposedChart 
} from 'recharts';
import { ForecastResult } from '../lib/analytics';

interface ForecastChartProps {
  data: ForecastResult;
}

export default function ForecastChart({ data }: ForecastChartProps) {
  const combinedData = [...data.historical, ...data.forecast];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-lg text-sm">
          <p className="font-semibold text-slate-900 mb-2">{label}</p>
          {payload.map((p: any) => (
            <div key={p.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-slate-500">{p.name}:</span>
              <span className="font-mono text-slate-900">
                {typeof p.value === 'number' ? p.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : p.value}
              </span>
            </div>
          ))}
          {payload[0].payload.isForecast && (
            <p className="mt-2 text-[10px] uppercase tracking-wider font-bold text-blue-500">Predicted Trend</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[450px] bg-white p-6 rounded-2xl border border-slate-200 mt-6 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey={data.xAxisKey} 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#64748b' }}
            dy={10}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#64748b' }}
            tickFormatter={(val) => val.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: 20, fontSize: 13, textTransform: 'capitalize' }}
          />
          
          <Area 
            type="monotone" 
            dataKey={data.yAxisKey} 
            stroke="none" 
            fillOpacity={1} 
            fill="url(#colorValue)" 
            connectNulls
          />

          {/* Historical Line */}
          <Line
            type="monotone"
            data={data.historical}
            dataKey={data.yAxisKey}
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="Historical"
          />

          {/* Forecast Line */}
          <Line
            type="monotone"
            data={data.forecast}
            dataKey={data.yAxisKey}
            stroke="#6366f1"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={false}
            name="Forecast"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
