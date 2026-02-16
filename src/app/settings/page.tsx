'use client';

import { useState } from 'react';
import { exportData, importData } from '@/lib/storage';
import soc2IsoDataset from '@/lib/examples/soc2-iso27001-import.json';

export default function SettingsPage() {
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');

  const downloadExport = async () => {
    const blob = new Blob([await exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'opportunity-operator-data.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };


  const loadSoc2Examples = async () => {
    const payloadText = JSON.stringify(soc2IsoDataset, null, 2);
    setImportText(payloadText);
    const result = await importData(payloadText);

    if (result.ok) {
      setMessage('SOC 2 / ISO 27001 examples imported successfully.');
      return;
    }

    setMessage(result.error ?? 'SOC 2 / ISO 27001 import failed.');
  };

  const runImport = async () => {
    const result = await importData(importText);
    if (result.ok) {
      setMessage('Import successful.');
      return;
    }
    setMessage(result.error ?? 'Import failed.');
  };

  return (
    <section className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Data Controls</h2>
      <div className="flex flex-wrap gap-2">
        <button className="bg-slate-900 text-white" onClick={downloadExport} type="button">
          Export JSON
        </button>
        <button className="bg-slate-200 text-slate-900" onClick={loadSoc2Examples} type="button">
          Import SOC 2 / ISO 27001 examples
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Import JSON</label>
        <textarea
          className="min-h-48 w-full"
          onChange={(event) => setImportText(event.target.value)}
          placeholder="Paste exported JSON here"
          value={importText}
        />
        <button className="bg-slate-900 text-white" onClick={runImport} type="button">
          Import JSON
        </button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </div>
    </section>
  );
}
