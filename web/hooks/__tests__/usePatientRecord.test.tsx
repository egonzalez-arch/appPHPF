import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePatientRecord } from '../usePatientRecord';
import * as React from 'react';

// Mock fetch globally
global.fetch = jest.fn();

describe('usePatientRecord', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('returns undefined when patientId is not provided', () => {
    const { result } = renderHook(() => usePatientRecord(undefined), { wrapper });
    
    expect(result.current.data.patient).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('fetches and filters patient data correctly', async () => {
    const mockPatient = {
      id: 'patient-1',
      user: { firstName: 'John', lastName: 'Doe' },
    };
    const mockAppointments = [
      { id: 'apt-1', patientId: 'patient-1', startAt: '2025-12-01T10:00:00Z', endAt: '2025-12-01T11:00:00Z', status: 'CONFIRMED' },
      { id: 'apt-2', patientId: 'patient-2', startAt: '2025-12-02T10:00:00Z', endAt: '2025-12-02T11:00:00Z', status: 'CONFIRMED' },
    ];
    const mockEncounters = [
      { id: 'enc-1', appointmentId: 'apt-1', status: 'COMPLETED', encounterDate: '2025-11-01T10:00:00Z' },
      { id: 'enc-2', appointmentId: 'apt-2', status: 'COMPLETED', encounterDate: '2025-11-02T10:00:00Z' },
    ];
    const mockVitals = [
      { id: 'vit-1', encounterId: 'enc-1', height: 170, weight: 70, bmi: 24, hr: 72, bp: '120/80', spo2: 98, recordedAt: '2025-11-01T10:30:00Z' },
      { id: 'vit-2', encounterId: 'enc-2', height: 175, weight: 75, bmi: 24, hr: 75, bp: '125/85', spo2: 97, recordedAt: '2025-11-02T10:30:00Z' },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ // fetchPatients
        ok: true,
        status: 200,
        json: async () => [mockPatient],
      })
      .mockResolvedValueOnce({ // fetchAppointments
        ok: true,
        status: 200,
        json: async () => mockAppointments,
      })
      .mockResolvedValueOnce({ // fetchEncounters
        ok: true,
        status: 200,
        json: async () => mockEncounters,
      })
      .mockResolvedValueOnce({ // fetchVitals
        ok: true,
        status: 200,
        json: async () => mockVitals,
      });

    const { result } = renderHook(() => usePatientRecord('patient-1'), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Should have patient data
    expect(result.current.data.patient).toEqual(mockPatient);
    
    // Should filter appointments for this patient only
    expect(result.current.data.appointments).toHaveLength(1);
    expect(result.current.data.appointments[0].id).toBe('apt-1');
    
    // Should filter encounters by patient's appointments
    expect(result.current.data.encounters).toHaveLength(1);
    expect(result.current.data.encounters[0].id).toBe('enc-1');
    expect(result.current.data.encounters[0].appointmentId).toBe('apt-1');
    
    // Should filter vitals by patient's encounters
    expect(result.current.data.vitals).toHaveLength(1);
    expect(result.current.data.vitals[0].id).toBe('vit-1');
    expect(result.current.data.vitals[0].encounterId).toBe('enc-1');
  });

  it('calculates summary correctly', async () => {
    const now = new Date().toISOString();
    const future = new Date(Date.now() + 86400000).toISOString(); // +1 day
    
    const mockPatient = { id: 'patient-1' };
    const mockAppointments = [
      { id: 'apt-1', patientId: 'patient-1', startAt: future, endAt: future, status: 'CONFIRMED' },
    ];
    const mockEncounters = [
      { id: 'enc-1', appointmentId: 'apt-1', status: 'COMPLETED', encounterDate: now },
      { id: 'enc-2', appointmentId: 'apt-1', status: 'COMPLETED', encounterDate: now },
    ];
    const mockVitals = [
      { id: 'vit-1', encounterId: 'enc-1', height: 170, weight: 70, bmi: 24, hr: 72, bp: '120/80', spo2: 98, recordedAt: now },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [mockPatient] })
      .mockResolvedValueOnce({ ok: true, json: async () => mockAppointments })
      .mockResolvedValueOnce({ ok: true, json: async () => mockEncounters })
      .mockResolvedValueOnce({ ok: true, json: async () => mockVitals });

    const { result } = renderHook(() => usePatientRecord('patient-1'), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Should have next appointment
    expect(result.current.data.summary.nextAppointment).toBeTruthy();
    expect(result.current.data.summary.nextAppointment?.id).toBe('apt-1');
    
    // Should have encounters count
    expect(result.current.data.summary.encountersCount).toBe(2);
    
    // Should have last vitals
    expect(result.current.data.summary.lastVitals).toBeTruthy();
    expect(result.current.data.summary.lastVitals?.id).toBe('vit-1');
  });
});
