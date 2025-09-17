import dynamic from 'next/dynamic';
export const HeavyComponent = dynamic(() => import('../components/HeavyComponent'), {
  ssr: false,
  loading: () => null,
});