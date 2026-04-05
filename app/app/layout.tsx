import type { ReactNode } from 'react';
import { MasteryProvider } from '@/app/app/_components/MasteryProvider';

export default function AppRootLayout({ children }: { children: ReactNode }) {
  return <MasteryProvider>{children}</MasteryProvider>;
}
