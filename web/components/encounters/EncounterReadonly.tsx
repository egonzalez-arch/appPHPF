'use client';

import React from 'react';
import { EncounterEntity } from '@/lib/api/api.encounters';

interface Props {
  encounter: EncounterEntity;
  doctors?: any[];
  patients?: any[];
  clinics?: any[];
}

/**
 * Presenta un encuentro en modo solo lectura. No renderiza botones de edición.
 * Este componente puede usarse en la nueva página dinámica o en otros lugares donde
 * se necesite mostrar un encuentro iniciado sin permitir editarlo.
 */
export function EncounterReadonly({ encounter, doctors = [], patients = [], clinics = [] }: Props) {
  function findDoctorName(id?: string) {
    const d = doctors?.find((x) => x.id === id);
    const full = [d?.user?.firstName, d?.user?.lastName].filter(Boolean).join(' ');
    return full || id || '-';
  }

  function findPatientName(id?: string) {
    const p = patients?.find((x) => x.id === id);
    const full = [p?.user?.firstName, p?.user?.lastName].filter(Boolean).join(' ');
    return full || id || '-';
  }

  function findClinicName(id?: string) {
    return clinics?.find((c) => c.id === id)?.name || id || '-';
  }

  return (
    <div className="bg-white border rounded shadow p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-500">Paciente</div>
          <div className="font-medium">{findPatientName(encounter.patientId)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Doctor</div>
          <div className="font-medium">{findDoctorName(encounter.doctorId)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Clínica</div>
          <div className="font-medium">{findClinicName(encounter.clinicId)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Fecha</div>
          <div className="font-medium">
            {encounter.startedAt
              ? new Date(encounter.startedAt).toLocaleString()
              : encounter.createdAt
              ? new Date(encounter.createdAt).toLocaleString()
              : '-'}
          </div>
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-500">Notas</div>
        <div className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
          {encounter.notes || '-'}
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-500">Signos vitales registrados</div>
        {Array.isArray(encounter.vitals) && encounter.vitals.length > 0 ? (
          <ul className="mt-2 space-y-2 text-sm">
            {encounter.vitals.map((v: any) => (
              <li key={v.id} className="flex justify-between bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-600">{v.type}</div>
                <div className="font-medium">{String(v.value)}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-2 text-sm text-gray-500">No hay signos vitales registrados.</div>
        )}
      </div>

      <div className="text-sm text-gray-500">
        Acciones de edición bloqueadas para encuentros iniciados. Para editar este encuentro,
        utiliza el flujo administrativo en el backend o solicita desbloqueo.
      </div>
    </div>
  );
}