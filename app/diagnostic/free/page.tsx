import { redirect } from 'next/navigation';

export default function DiagnosticFreeRedirect() {
  redirect('/app/diagnostic/free');
}
