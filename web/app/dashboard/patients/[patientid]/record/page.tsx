'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePatientRecord } from '@/hooks/usePatientRecord';
import Trends from '@/components/patients/Trends';

const ENCOUNTERS_PAGE_SIZE = 10;
const VITALS_PAGE_SIZE = 10;

export default function PatientRecordPage() {
  const params = useParams() as
    | (Record<string, string | string[]> & { patientId?: string; patientid?: string })
    | null;

  const rawParam = params?.patientId ?? params?.patientid;
  const patientId =
    Array.isArray(rawParam) ? (rawParam[0] as string) : (rawParam as string | undefined);

  const router = useRouter();
  const { data, isLoading, isError, error } = usePatientRecord(patientId);

  // Pagination states
  const [encountersPage, setEncountersPage] = useState(0);
  const [vitalsPage, setVitalsPage] = useState(0);

  if (!patientId) {
    return (
      <div className="p-6 text-red-600">
        Ruta inválida: falta patientId en la URL (verifica el nombre de la carpeta dinámica).
      </div>
    );
  }

  if (isLoading) return <div className="p-6">Cargando expediente...</div>;
  if (isError) return <div className="p-6 text-red-600">Error: {String(error)}</div>;

  const p = data?.patient;

  // Pagination logic for encounters
  const sortedEncounters = data?.encounters
    .slice()
    .sort((a, b) => new Date(b.encounterDate || '').getTime() - new Date(a.encounterDate || '').getTime()) || [];
  const totalEncountersPages = Math.ceil(sortedEncounters.length / ENCOUNTERS_PAGE_SIZE);
  const paginatedEncounters = sortedEncounters.slice(
    encountersPage * ENCOUNTERS_PAGE_SIZE,
    (encountersPage + 1) * ENCOUNTERS_PAGE_SIZE
  );

  // Pagination logic for vitals
  const sortedVitals = data?.vitals
    .slice()
    .sort((a, b) => new Date(b.recordedAt || '').getTime() - new Date(a.recordedAt || '').getTime()) || [];
  const totalVitalsPages = Math.ceil(sortedVitals.length / VITALS_PAGE_SIZE);
  const paginatedVitals = sortedVitals.slice(
    vitalsPage * VITALS_PAGE_SIZE,
    (vitalsPage + 1) * VITALS_PAGE_SIZE
  );

  return (
    <div className="p-6 flex gap-6">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border rounded p-4 h-fit sticky top-6">
        <div className="font-semibold text-lg mb-3">Expediente</div>
        <nav className="flex flex-col gap-2 text-sm">
          <a href="#resumen" className="text-teal-700 hover:underline">Resumen</a>
          <a href="#tendencias" className="text-teal-700 hover:underline">Tendencias</a>
          <a href="#encuentros" className="text-teal-700 hover:underline">Encuentros</a>
          <a href="#vitales" className="text-teal-700 hover:underline">Signos vitales</a>
          <a href="#problemas" className="text-teal-700 hover:underline">Problemas</a>
          <a href="#alergias" className="text-teal-700 hover:underline">Alergias</a>
          <a href="#medicacion" className="text-teal-700 hover:underline">Medicación</a>
          <a href="#documentos" className="text-teal-700 hover:underline">Documentos</a>
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
                ID: {p?.id || patientId /* fallback */}
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

        {/* Tendencias */}
        <section id="tendencias" className="bg-white border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Tendencias</h2>
          <Trends vitals={data?.vitals || []} />
        </section>

        {/* Encuentros */}
        <section id="encuentros" className="bg-white border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Encuentros</h2>
          {sortedEncounters.length === 0 ? (
            <div className="text-sm text-gray-600">Sin encuentros.</div>
          ) : (
            <>
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
                    {paginatedEncounters.map(e => (
                      <tr key={e.id} className="border-b">
                        <td className="px-3 py-2">{new Date(e.encounterDate || '').toLocaleString()}</td>
                        <td className="px-3 py-2">{e.reason || '—'}</td>
                        <td className="px-3 py-2">{e.diagnosis || '—'}</td>
                        <td className="px-3 py-2">{e.status}</td>
                        <td className="px-3 py-2">
                          <button
                            className="px-2 py-1 rounded bg-blue-600 text-white text-xs"
                            onClick={() => {
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
              {totalEncountersPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <button
                    className="px-3 py-1 rounded border disabled:opacity-50"
                    disabled={encountersPage === 0}
                    onClick={() => setEncountersPage(p => p - 1)}
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-600">
                    Página {encountersPage + 1} de {totalEncountersPages}
                  </span>
                  <button
                    className="px-3 py-1 rounded border disabled:opacity-50"
                    disabled={encountersPage >= totalEncountersPages - 1}
                    onClick={() => setEncountersPage(p => p + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* VITALES */}
        <section id="vitales" className="bg-white border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Signos vitales</h2>
          {sortedVitals.length === 0 ? (
            <div className="text-sm text-gray-600">Sin registros.</div>
          ) : (
            <>
              <ul className="text-sm space-y-1">
                {paginatedVitals.map(v => (
                  <li key={v.id}>
                    <strong>{new Date(v.recordedAt || '').toLocaleString()}:</strong>{' '}
                    {v.height}cm, {v.weight}kg, IMC {v.bmi?.toFixed(2)}, HR {v.hr}, BP {v.bp}, SpO2 {v.spo2}%
                  </li>
                ))}
              </ul>
              {totalVitalsPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <button
                    className="px-3 py-1 rounded border disabled:opacity-50"
                    disabled={vitalsPage === 0}
                    onClick={() => setVitalsPage(p => p - 1)}
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-600">
                    Página {vitalsPage + 1} de {totalVitalsPages}
                  </span>
                  <button
                    className="px-3 py-1 rounded border disabled:opacity-50"
                    disabled={vitalsPage >= totalVitalsPages - 1}
                    onClick={() => setVitalsPage(p => p + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Problemas - Placeholder */}
        <section id="problemas" className="bg-white border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Problemas / Diagnósticos Activos</h2>
          <div className="text-sm text-gray-600">
            Sin registros.
            {/* TODO: Implementar lista de problemas/diagnósticos activos.
                Requiere backend endpoint y modelo de datos. */}
          </div>
        </section>

        {/* Alergias - Placeholder */}
        <section id="alergias" className="bg-white border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Alergias</h2>
          <div className="text-sm text-gray-600">
            Sin registros.
            {/* TODO: Implementar lista de alergias con severidad (alta, media, baja).
                Requiere backend endpoint y modelo de datos. */}
          </div>
        </section>

        {/* Medicación - Placeholder */}
        <section id="medicacion" className="bg-white border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Medicación Activa</h2>
          <div className="text-sm text-gray-600">
            Sin registros.
            {/* TODO: Implementar lista de medicación activa.
                Requiere backend endpoint y modelo de datos. */}
          </div>
        </section>

        {/* Documentos - Placeholder */}
        <section id="documentos" className="bg-white border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Documentos</h2>
          <div className="text-sm text-gray-600">
            Sin documentos adjuntos.
            {/* TODO: Implementar carga y consulta de documentos (PDF, imágenes).
                Requiere backend endpoint para file upload y storage. */}
          </div>
        </section>
      </main>
    </div>
  );
}