import Card from '../_components/Card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-white/70">Front-end placeholder.</p>
      </div>

      <Card>
        <div className="text-sm font-semibold">Theme</div>
        <div className="mt-2 text-sm text-white/70">
          Teal = success, Yellow = neutral/CTA, Red = danger.
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold">Notifications</div>
        <div className="mt-2 text-sm text-white/70">Coming later.</div>
      </Card>
    </div>
  );
}
