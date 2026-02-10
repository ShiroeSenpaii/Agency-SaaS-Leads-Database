'use client';

import { FormEvent, useState } from 'react';
import {
  createClient,
  deleteClient,
  getClients,
  getOpportunities,
  removeOpportunityFromClient,
  saveOpportunityToClient,
  updateClient,
} from '@/lib/storage';
import { Client, Opportunity } from '@/types';

const emptyForm = { name: '', niche: '', constraints: '', notes: '' };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(getClients());
  const [opportunities] = useState<Opportunity[]>(getOpportunities());
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>('');

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const payload = { ...form, savedOpportunityIds: [] as string[] };
    if (editingId) {
      updateClient(editingId, form);
    } else {
      createClient(payload);
    }
    setClients(getClients());
    resetForm();
  };

  const edit = (client: Client) => {
    setEditingId(client.id);
    setForm({
      name: client.name,
      niche: client.niche,
      constraints: client.constraints,
      notes: client.notes,
    });
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr,2fr]">
      <form onSubmit={submit} className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">{editingId ? 'Edit client' : 'New client'}</h2>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
        <input required value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} placeholder="Niche" />
        <textarea value={form.constraints} onChange={(e) => setForm({ ...form, constraints: e.target.value })} placeholder="Constraints" />
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" />
        <div className="flex gap-2">
          <button className="bg-slate-900 text-white" type="submit">{editingId ? 'Update' : 'Create'}</button>
          {editingId ? <button className="bg-slate-200" onClick={resetForm} type="button">Cancel</button> : null}
        </div>
      </form>

      <ul className="space-y-3">
        {clients.map((client) => {
          const saved = opportunities.filter((opportunity) => client.savedOpportunityIds.includes(opportunity.id));
          return (
            <li key={client.id} className="rounded-lg bg-white p-4 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{client.name}</h3>
                  <p className="text-sm text-slate-600">{client.niche}</p>
                </div>
                <div className="flex gap-2 text-sm">
                  <button className="bg-slate-100" onClick={() => edit(client)}>Edit</button>
                  <button
                    className="bg-red-100 text-red-800"
                    onClick={() => {
                      deleteClient(client.id);
                      setClients(getClients());
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p className="text-sm">Constraints: {client.constraints || 'none'}</p>
              <p className="mb-2 text-sm">Notes: {client.notes || 'none'}</p>

              <div className="mb-2 flex gap-2">
                <select value={selectedOpportunityId} onChange={(e) => setSelectedOpportunityId(e.target.value)}>
                  <option value="">Select opportunity to save</option>
                  {opportunities.map((opportunity) => (
                    <option value={opportunity.id} key={opportunity.id}>
                      {opportunity.title}
                    </option>
                  ))}
                </select>
                <button
                  className="bg-slate-900 text-white"
                  onClick={() => {
                    if (!selectedOpportunityId) return;
                    saveOpportunityToClient(client.id, selectedOpportunityId);
                    setClients(getClients());
                  }}
                  type="button"
                >
                  Save Opportunity
                </button>
              </div>

              <h4 className="text-sm font-semibold">Saved opportunities</h4>
              <ul className="mt-1 space-y-1 text-sm">
                {saved.map((opportunity) => (
                  <li key={opportunity.id} className="flex items-center justify-between rounded border border-slate-200 px-2 py-1">
                    <span>{opportunity.title}</span>
                    <button
                      className="bg-slate-100"
                      onClick={() => {
                        removeOpportunityFromClient(client.id, opportunity.id);
                        setClients(getClients());
                      }}
                      type="button"
                    >
                      Remove
                    </button>
                  </li>
                ))}
                {saved.length === 0 ? <li className="text-slate-500">No saved opportunities.</li> : null}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
