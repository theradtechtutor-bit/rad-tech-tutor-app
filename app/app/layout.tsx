import type { ReactNode } from 'react';
import { MasteryProvider } from '@/app/app/_components/MasteryProvider';
import AccessBlockGate from '@/app/app/_components/AccessBlockGate';

export default function AppRootLayout({ children }: { children: ReactNode }) {
  return (
    <AccessBlockGate>
      <MasteryProvider>{children}</MasteryProvider>
    </AccessBlockGate>
  );
}
