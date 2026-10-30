import { useState } from 'react';
import { Bell, Globe, Moon, Palette, Save, Sliders, Sun } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { SectionTitle } from '@/components/ui/Feedback';

export function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [accent, setAccent] = useState('blue');
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('English');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="animate-fade-in max-w-4xl">
      <SectionTitle title="Settings" subtitle="Configure dashboard appearance and preferences" />
      <div className="space-y-4">
        <Card>
          <CardHeader title="Appearance" subtitle="Theme and accent color" icon={Palette} />
          <CardBody>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Theme</label>
                <div className="mt-2 flex gap-2">
                  {(['light', 'dark'] as const).map((t) => (
                    <button key={t} onClick={() => setTheme(t)} className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm capitalize ${theme === t ? 'border-navy-400 bg-navy-50 text-navy-700' : 'border-slate-200 text-slate-600'}`}>
                      {t === 'light' ? <Sun size={15} /> : <Moon size={15} />} {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Accent Color</label>
                <div className="mt-2 flex gap-2">
                  {['blue', 'purple', 'emerald', 'amber'].map((c) => (
                    <button key={c} onClick={() => setAccent(c)} className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ${accent === c ? 'ring-navy-500' : 'ring-transparent'}`} style={{ backgroundColor: c === 'blue' ? '#3b82f6' : c === 'purple' ? '#8b5cf6' : c === 'emerald' ? '#22c55e' : '#f59e0b' }} />
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Regional" subtitle="Currency and language" icon={Globe} />
          <CardBody>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none">
                  <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option><option>JPY</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none">
                  <option>English</option><option>Spanish</option><option>French</option><option>German</option><option>Hindi</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Notifications" subtitle="Alert preferences" icon={Bell} />
          <CardBody>
            <div className="space-y-3">
              <Toggle label="Email alerts for sales milestones" value={emailAlerts} onChange={setEmailAlerts} />
              <Toggle label="Weekly analytics digest" value={weeklyDigest} onChange={setWeeklyDigest} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Data & Processing" subtitle="Big data processing configuration" icon={Sliders} />
          <CardBody>
            <div className="space-y-3 text-sm">
              <Row label="Processing engine" value="Simulated PySpark (demo)" />
              <Row label="Default dataset" value="Built-in e-commerce sample" />
              <Row label="Record batch size" value="10,000" />
              <Row label="Retention window" value="12 months" />
            </div>
          </CardBody>
        </Card>

        <div className="flex items-center gap-3">
          <button onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90">
            <Save size={16} /> Save Settings
          </button>
          {saved && <span className="text-sm text-emerald-600">Settings saved</span>}
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">{label}</span>
      <button onClick={() => onChange(!value)} className={`relative h-6 w-11 rounded-full transition-colors ${value ? 'bg-navy-600' : 'bg-slate-200'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
