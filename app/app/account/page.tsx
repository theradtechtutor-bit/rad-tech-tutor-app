import Link from 'next/link';
import Card from '../_components/Card';

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Account</h1>
          <p className="mt-1 text-sm text-white/70">Front-end placeholder.</p>
        </div>
        <Link
          href="/upgrade"
          className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
        >
          Manage membership
        </Link>
      </div>

      <Card>
        <div className="text-sm font-semibold">Profile</div>
        <div className="mt-2 text-sm text-white/70">
          Name, email, and progress will appear here once auth is connected.
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold">Study timeline</div>
        <div className="mt-2 text-sm text-white/70">
          (Planned) Enter exam date → weekly target score → on-track indicator.
        </div>
      </Card>
    </div>
  );
}
