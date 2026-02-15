'use client';

import { useEffect, useMemo, useState } from 'react';
import { getClients, getOpportunities } from '@/lib/storage';
import { Client, Opportunity } from '@/types';
import { ClientOnly } from '@/components/ClientOnly';

export default function DashboardPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setOpportunities(getOpportunities());
    setClients(getClients());
  }, []);

  const topOpportunities = useMemo(
    () => [...opportunities].sort((a, b) => b.totalScore - a.totalScore).slice(0, 5),
    [opportunities],
  );

  return (
    <ClientOnly fallback={<div className="p-6">Loading…</div>}>
      <section className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="text-sm text-slate-500">Total Opportunities</h2>
          <p className="text-2xl font-bold">{opportunities.length}</p>
        </article>
        <article className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="text-sm text-slate-500">Total Clients</h2>
          <p className="text-2xl font-bold">{clients.length}</p>
        </article>
        <article className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="text-sm text-slate-500">Saved Matches</h2>
          <p className="text-2xl font-bold">
            {clients.reduce((acc, client) => acc + client.savedOpportunityIds.length, 0)}
          </p>
        </article>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Top Opportunities</h2>
        <ul className="space-y-2">
          {topOpportunities.map((opportunity) => (
            <li key={opportunity.id} className="rounded border border-slate-200 p-3">
              <p className="font-medium">{opportunity.title}</p>
              <p className="text-sm text-slate-600">{opportunity.category}</p>
              <p className="text-sm">Score: {opportunity.totalScore}</p>
            </li>
          ))}
          {topOpportunities.length === 0 ? <li className="text-sm text-slate-500">No opportunities yet.</li> : null}
        </ul>
      </div>
      </section>
    </ClientOnly>
  );
}
