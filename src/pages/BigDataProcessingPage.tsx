import { useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Database, FileSpreadsheet, Loader2, Play, Sparkles, Upload, Wand2, XCircle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { SectionTitle } from '@/components/ui/Feedback';
import { parseCSV } from '@/utils/export';
import { ORDERS } from '@/data/dataset';

type Step = 'idle' | 'processing' | 'done';
type Row = Record<string, string>;

const PIPELINE_STAGES = [
  { name: 'Ingest (read CSV)', pct: 12 },
  { name: 'Parse & schema inference', pct: 25 },
  { name: 'Missing value detection', pct: 42 },
  { name: 'Duplicate removal', pct: 60 },
  { name: 'Type conversion', pct: 75 },
  { name: 'Aggregation (MapReduce)', pct: 88 },
  { name: 'Materialize results', pct: 100 },
];

export function BigDataProcessingPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [cleaned, setCleaned] = useState<Row[] | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [stats, setStats] = useState<{ missing: number; duplicates: number; dropped: number } | null>(null);
  const [timer, setTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  function loadSample() {
    const sample: Row[] = ORDERS.slice(0, 200).map((o) => ({
      'Order ID': o.orderId,
      'Customer ID': o.customerId,
      'Product ID': o.productId,
      'Product Name': o.productName,
      Category: o.category,
      Quantity: String(o.quantity),
      Price: o.price.toFixed(2),
      'Order Date': o.orderDate,
      Country: o.country,
      'Payment Method': o.paymentMethod,
    }));
    ingest(`sample_ecommerce_200_rows.csv (built-in)`, sample);
  }

  function ingest(name: string, data: Row[]) {
    setFileName(name);
    setRows(data);
    setCleaned(null);
    setStats(null);
    setStep('idle');
    setProgress(0);
    setStage('');
    setElapsed(0);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const parsed = parseCSV(text);
      ingest(file.name, parsed);
    };
    reader.readAsText(file);
  }

  function runProcessing() {
    if (!rows) return;
    setStep('processing');
    setProgress(0);
    setElapsed(0);
    const start = Date.now();
    const t = setInterval(() => {
      setElapsed(Math.round((Date.now() - start) / 100) / 10);
    }, 100);
    setTimer(t);

    let i = 0;
    const tick = () => {
      const s = PIPELINE_STAGES[i];
      setStage(s.name);
      setProgress(s.pct);
      if (i >= PIPELINE_STAGES.length - 1) {
        clearInterval(loop);
        clearInterval(t);
        finishProcessing();
        return;
      }
      i++;
    };
    tick();
    const loop = setInterval(tick, 700);
  }

  function finishProcessing() {
    if (!rows) return;
    // Cleaning: drop fully-empty rows, trim whitespace, drop duplicates by Order ID
    const seen = new Set<string>();
    let missing = 0;
    let dupes = 0;
    const out: Row[] = [];
    for (const r of rows) {
      const isEmpty = Object.values(r).every((v) => !v || !v.trim());
      if (isEmpty) { dupes++; continue; }
      const key = r['Order ID'] || JSON.stringify(r);
      if (seen.has(key)) { dupes++; continue; }
      seen.add(key);
      for (const k of Object.keys(r)) {
        if (!r[k] || !r[k].trim()) missing++;
        r[k] = (r[k] || '').trim();
      }
      out.push(r);
    }
    setStats({ missing, duplicates: dupes, dropped: rows.length - out.length });
    setCleaned(out);
    setStep('done');
  }

  const preview = (cleaned || rows) || [];

  return (
    <div className="animate-fade-in">
      <SectionTitle title="Big Data Processing" subtitle="Simulated Apache Spark / PySpark-style distributed processing pipeline" />

      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        <AlertTriangle size={16} className="mr-1.5 inline" />
        Simulated processing: Apache Spark is not connected in this demo. Metrics below mimic a real Spark job for demonstration purposes.
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Dataset Upload" subtitle="Upload a CSV file or load the built-in sample dataset" icon={Upload} />
          <CardBody>
            <div
              onClick={() => inputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 text-center transition-colors hover:border-navy-400 hover:bg-navy-50/40"
            >
              <div className="rounded-full bg-navy-100 p-4 text-navy-600"><Upload size={26} /></div>
              <p className="mt-3 text-sm font-medium text-slate-700">Click to upload a CSV file</p>
              <p className="text-xs text-slate-400">Expected columns: Order ID, Customer ID, Product Name, Category, Quantity, Price, Order Date, Country, Payment Method</p>
              <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={onFile} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button onClick={loadSample} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <FileSpreadsheet size={16} /> Load sample dataset
              </button>
              {rows && (
                <span className="text-sm text-slate-500">
                  Loaded <span className="font-semibold text-slate-800">{fileName}</span> — {rows.length.toLocaleString()} records
                </span>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Processing Controls" subtitle="Run the simulated pipeline" icon={Sparkles} />
          <CardBody>
            <button
              onClick={runProcessing}
              disabled={!rows || step === 'processing'}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-50"
            >
              {step === 'processing' ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
              {step === 'processing' ? 'Processing...' : 'Run Processing'}
            </button>
            <div className="mt-4 space-y-3 text-sm">
              <Stat label="Processing status">
                {step === 'idle' && <span className="text-slate-500">Idle</span>}
                {step === 'processing' && <span className="flex items-center gap-1 text-amber-600"><Loader2 size={14} className="animate-spin" /> Running</span>}
                {step === 'done' && <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 size={14} /> Complete</span>}
              </Stat>
              <Stat label="Records processed">
                <span className="font-semibold text-slate-800">{(cleaned || rows)?.length.toLocaleString() || 0}</span>
              </Stat>
              <Stat label="Processing time">
                <span className="flex items-center gap-1 font-semibold text-slate-800"><Clock size={14} /> {elapsed.toFixed(1)}s</span>
              </Stat>
            </div>
          </CardBody>
        </Card>
      </div>

      {step === 'processing' && (
        <Card className="mt-4">
          <CardBody>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{stage}</span>
              <span className="text-slate-500">{progress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {PIPELINE_STAGES.map((s) => (
                <span key={s.name} className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${progress >= s.pct ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {progress >= s.pct ? <CheckCircle2 size={11} className="mr-1 inline" /> : <Clock size={11} className="mr-1 inline" />}
                  {s.name}
                </span>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {stats && step === 'done' && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardBody className="flex items-center justify-between">
            <div><p className="text-xs text-slate-500">Input Records</p><p className="mt-1 text-2xl font-bold text-slate-900">{(rows?.length || 0).toLocaleString()}</p></div>
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600"><Database size={22} /></div>
          </CardBody></Card>
          <Card><CardBody className="flex items-center justify-between">
            <div><p className="text-xs text-slate-500">Missing Values</p><p className="mt-1 text-2xl font-bold text-slate-900">{stats.missing.toLocaleString()}</p></div>
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600"><AlertTriangle size={22} /></div>
          </CardBody></Card>
          <Card><CardBody className="flex items-center justify-between">
            <div><p className="text-xs text-slate-500">Duplicates Removed</p><p className="mt-1 text-2xl font-bold text-slate-900">{stats.duplicates.toLocaleString()}</p></div>
            <div className="rounded-lg bg-rose-50 p-3 text-rose-600"><XCircle size={22} /></div>
          </CardBody></Card>
          <Card><CardBody className="flex items-center justify-between">
            <div><p className="text-xs text-slate-500">Clean Records</p><p className="mt-1 text-2xl font-bold text-slate-900">{(cleaned?.length || 0).toLocaleString()}</p></div>
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600"><CheckCircle2 size={22} /></div>
          </CardBody></Card>
        </div>
      )}

      {preview.length > 0 && (
        <Card className="mt-4">
          <CardHeader title="Dataset Preview" subtitle={cleaned ? 'After cleaning & transformation' : 'Raw uploaded data'} icon={Wand2} />
          <CardBody>
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    {Object.keys(preview[0]).map((h) => <th key={h} className="whitespace-nowrap px-3 py-2">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 100).map((r, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      {Object.keys(preview[0]).map((h) => <td key={h} className="whitespace-nowrap px-3 py-2 text-slate-600">{r[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-400">Showing {Math.min(100, preview.length)} of {preview.length.toLocaleString()} rows</p>
          </CardBody>
        </Card>
      )}

      {timer && step !== 'processing' && (() => { clearInterval(timer); return null; })()}
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      {children}
    </div>
  );
}
