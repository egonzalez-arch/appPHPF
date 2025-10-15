import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEncounterAudit } from '../useEncounterAudit';
import * as React from 'react';

// Mock fetch globally
global.fetch = jest.fn();

describe('useEncounterAudit', () => {
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

  it('returns empty array when encounterId is undefined', () => {
    const { result } = renderHook(() => useEncounterAudit(undefined), { wrapper });
    
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('fetches audit events successfully', async () => {
    const mockEvents = [
      {
        id: '1',
        encounterId: 'enc-123',
        action: 'create',
        createdAt: '2025-10-15T10:00:00Z',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockEvents,
    });

    const { result } = renderHook(() => useEncounterAudit('enc-123'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    expect(result.current.data).toEqual(mockEvents);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/encounters/enc-123/audit'),
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      })
    );
  });

  it('returns empty array on 404 response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useEncounterAudit('enc-404'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    expect(result.current.data).toEqual([]);
  });

  it('throws error for non-404 failures', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    });

    const { result } = renderHook(() => useEncounterAudit('enc-500'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    
    expect(result.current.error).toBeTruthy();
  });

  it('includes CSRF token in request headers', async () => {
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'csrf_token=test-token-123',
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    const { result } = renderHook(() => useEncounterAudit('enc-csrf'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { 'X-CSRF-Token': 'test-token-123' },
      })
    );
  });

  it('handles non-array response by returning empty array', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: 'not an array' }),
    });

    const { result } = renderHook(() => useEncounterAudit('enc-obj'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    expect(result.current.data).toEqual([]);
  });
});
