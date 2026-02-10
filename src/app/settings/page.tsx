'use client';

import { useState } from 'react';
import { exportData, importData } from '@/lib/storage';

export default function SettingsPage() {
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');

  const downloadExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'opportunity-operator-data.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const runImport = () => {
    const result = importData(importText);
    if (result.ok) {
      setMessage('Import successful.');
      return;
    }
    setMessage(result.error ?? 'Import failed.');
  };

  return (
    <section className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Local Data Controls</h2>
      <button className="bg-slate-900 text-white" onClick={downloadExport} type="button">
        Export JSON
      </button>

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
