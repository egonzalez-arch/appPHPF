'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { VitalsEntity } from '@/lib/api/api.vitals';

interface TrendsProps {
  vitals: VitalsEntity[];
}

export default function Trends({ vitals }: TrendsProps) {
  const chartData = useMemo(() => {
    // Sort vitals by recordedAt ascending for chronological display
    const sorted = vitals
      .slice()
      .filter(v => {
        // Validate recordedAt exists and is a valid date
        if (!v.recordedAt) return false;
        const date = new Date(v.recordedAt);
        return !isNaN(date.getTime());
      })
      .sort((a, b) => new Date(a.recordedAt!).getTime() - new Date(b.recordedAt!).getTime());

    return sorted.map((v) => {
      // Calculate BMI if not present and we have height and weight
      // Assumption: height is in centimeters (as per VitalsEntity standard)
      let bmi = v.bmi;
      if (!bmi && v.height && v.weight && v.height > 0) {
        const heightInMeters = v.height / 100;
        bmi = v.weight / (heightInMeters * heightInMeters);
      }

      // Parse BP - if it's a string like "120/80", extract systolic
      let bpValue: number | undefined;
      if (typeof v.bp === 'string') {
        const match = v.bp.match(/^(\d+)/);
        if (match) {
          bpValue = parseInt(match[1], 10);
        }
      } else if (typeof v.bp === 'number') {
        bpValue = v.bp;
      }

      return {
        date: new Date(v.recordedAt!).toLocaleDateString(),
        weight: v.weight || undefined,
        bmi: bmi ? parseFloat(bmi.toFixed(2)) : undefined,
        hr: v.hr || undefined,
        bp: bpValue,
        spo2: v.spo2 || undefined,
      };
    });
  }, [vitals]);

  if (chartData.length === 0) {
    return (
      <div className="text-sm text-gray-600">
        No hay suficientes datos para mostrar tendencias.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Weight and BMI Chart */}
      <div>
        <h3 className="text-md font-semibold mb-2">Peso e IMC</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="weight"
              stroke="#3b82f6"
              name="Peso (kg)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="bmi"
              stroke="#10b981"
              name="IMC"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Heart Rate Chart */}
      <div>
        <h3 className="text-md font-semibold mb-2">Frecuencia Cardíaca</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="hr"
              stroke="#f59e0b"
              name="HR (bpm)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Blood Pressure Chart */}
      <div>
        <h3 className="text-md font-semibold mb-2">Presión Arterial</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="bp"
              stroke="#ef4444"
              name="BP (mmHg - sistólica)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* SpO2 Chart */}
      <div>
        <h3 className="text-md font-semibold mb-2">Saturación de Oxígeno</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[90, 100]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="spo2"
              stroke="#8b5cf6"
              name="SpO2 (%)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
