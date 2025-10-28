'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePatientRecord } from '@/hooks/usePatientRecord';

export default function PatientRecordPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const router = useRouter();
  const { data, isLoading, isError, error } = usePatientRecord(patientId);

  if (isLoading) return <div className="p-6">Cargando expediente...</div>;
  if (isError) return <div className="p-6 text-red-600">Error: {String(error)}</div>;

  const p = data?.patient;

  return (
    <div className="p-6 flex gap-6">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border rounded p-4 h-fit">
        <div className="font-semibold text-lg mb-3">Expediente</div>
        <nav className="flex flex-col gap-2 text-sm">
          <a href="#resumen" className="text-teal-700 hover:underline">Resumen</a>
          <a href="#encuentros" className="text-teal-700 hover:underline">Encuentros</a>
          <a href="#vitales" className="text-teal-700 hover:underline">Signos vitales</a>
          {/* Futuro: <a href="#documentos">Documentos</a>, <a href="#labs">Laboratorios</a> */}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col gap-6">
        {/* Header paciente */}
        <div className="bg-white border rounded p-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {p?.user?.firstName} {p?.user?.lastName}
              </h1>
              <div className="text-sm text-gray-600">
                ID: {p?.id}
              </div>
            </div>
            <button
              className="px-3 py-2 rounded border hover:bg-gray-50"
              onClick={() => router.push('/dashboard/appointments')}
            >
              Ir a Citas
            </button>
          </div>
        </div>

        {/* Resumen */}
        <section id="resumen" className="bg-white border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Resumen</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Próxima cita</div>
              <div>{data?.summary.nextAppointment
                ? new Date(data.summary.nextAppointment.startAt).toLocaleString()
                : '—'}</div>
            </div>
            <div>
              <div className="text-gray-600">Encuentros</div>
              <div>{data?.summary.encountersCount || 0}</div>
            </div>
            <div>
              <div className="text-gray-600">Últimos vitales</div>
              <div>
                {data?.summary.lastVitals
                  ? `${data.summary.lastVitals.weight}kg / ${data.summary.lastVitals.height}cm (HR ${data.summary.lastVitals.hr}, SpO2 ${data.summary.lastVitals.spo2}%)`
                  : '—'}
              </div>
            </div>
          </div>
        </section>

        {/* Encuentros */}
        <section id="encuentros" className="bg-white border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Encuentros</h2>
          {data?.encounters.length === 0 ? (
            <div className="text-sm text-gray-600">Sin encuentros.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-max text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left">Fecha</th>
                    <th className="px-3 py-2 text-left">Motivo</th>
                    <th className="px-3 py-2 text-left">Diagnóstico</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                    <th className="px-3 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.encounters
                    .slice()
                    .sort((a, b) => new Date(b.encounterDate || '').getTime() - new Date(a.encounterDate || '').getTime())
                    .map(e => (
                    <tr key={e.id} className="border-b">
                      <td className="px-3 py-2">{new Date(e.encounterDate || '').toLocaleString()}</td>
                      <td className="px-3 py-2">{e.reason || '—'}</td>
                      <td className="px-3 py-2">{e.diagnosis || '—'}</td>
                      <td className="px-3 py-2">{e.status}</td>
                      <td className="px-3 py-2">
                        <button
                          className="px-2 py-1 rounded bg-blue-600 text-white"
                          onClick={() => {
                            // Abre la página de gestión de encuentro existente
                            window.location.href = `/dashboard/encounters/manage?encounterId=${e.id}`;
                          }}
                        >
                          Ver / Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* VITALES */}
        <section id="vitales" className="bg-white border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Signos vitales</h2>
          {data?.vitals.length === 0 ? (
            <div className="text-sm text-gray-600">Sin registros.</div>
          ) : (
            <ul className="text-sm space-y-1">
              {data?.vitals
                .slice()
                .sort((a, b) => new Date(b.recordedAt || '').getTime() - new Date(a.recordedAt || '').getTime())
                .map(v => (
                <li key={v.id}>
                  <strong>{new Date(v.recordedAt || '').toLocaleString()}:</strong>{' '}
                  {v.height}cm, {v.weight}kg, IMC {v.bmi?.toFixed(2)}, HR {v.hr}, BP {v.bp}, SpO2 {v.spo2}%
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}