import { redirect } from 'next/navigation';

export default function DiagnosticFreeRunRedirect() {
  redirect('/app/diagnostic/free/run');
}
