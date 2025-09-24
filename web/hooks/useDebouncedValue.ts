import { useState, useEffect } from 'react';

/**
 * Hook simple para debouncing. Devuelve el valor tras el delay.
 * @param value valor a “debouncear”
 * @param delay ms (default 300)
 */
export function useDebouncedValue<T = any>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}