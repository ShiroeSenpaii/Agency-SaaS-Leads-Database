'use client';

import { FormEvent, useMemo, useState } from 'react';
import { createOpportunity, deleteOpportunity, getOpportunities, updateOpportunity } from '@/lib/storage';
import { Opportunity, OpportunityStatus } from '@/types';


const emptyForm = {
  title: '',
  summary: '',
  category: '',
  tags: '',
  status: 'new' as OpportunityStatus,
  sourceUrl: '',
  notes: '',
  demandFit: 5,
  budgetPotential: 5,
  executionConfidence: 5,
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(getOpportunities());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({ category: '', tags: '', status: '', minScore: 0, sort: 'newest' });

  const selected = opportunities.find((item) => item.id === selectedId) ?? null;

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      title: form.title,
      summary: form.summary,
      category: form.category,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      status: form.status,
      sourceUrl: form.sourceUrl,
      notes: form.notes,
      scoreBreakdown: {
        demandFit: Number(form.demandFit),
        budgetPotential: Number(form.budgetPotential),
        executionConfidence: Number(form.executionConfidence),
      },
    };

    if (editingId) {
      updateOpportunity(editingId, payload);
    } else {
      createOpportunity(payload);
    }

    setOpportunities(getOpportunities());
    resetForm();
  };

  const onEdit = (opportunity: Opportunity) => {
    setEditingId(opportunity.id);
    setForm({
      title: opportunity.title,
      summary: opportunity.summary,
      category: opportunity.category,
      tags: opportunity.tags.join(', '),
      status: opportunity.status,
      sourceUrl: opportunity.sourceUrl,
      notes: opportunity.notes,
      demandFit: opportunity.scoreBreakdown.demandFit,
      budgetPotential: opportunity.scoreBreakdown.budgetPotential,
      executionConfidence: opportunity.scoreBreakdown.executionConfidence,
    });
  };

  const filtered = useMemo(() => {
    return opportunities
      .filter((opportunity) => {
        const matchesCategory = !filters.category || opportunity.category.toLowerCase().includes(filters.category.toLowerCase());
        const matchesTags =
          !filters.tags ||
          opportunity.tags.some((tag) => tag.toLowerCase().includes(filters.tags.toLowerCase()));
        const matchesStatus = !filters.status || opportunity.status === filters.status;
        const matchesScore = opportunity.totalScore >= Number(filters.minScore || 0);
        return matchesCategory && matchesTags && matchesStatus && matchesScore;
      })
      .sort((a, b) => {
        if (filters.sort === 'totalScore') return b.totalScore - a.totalScore;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [filters, opportunities]);

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr,2fr]">
      <form onSubmit={submit} className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">{editingId ? 'Edit opportunity' : 'New opportunity'}</h2>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" />
        <textarea required value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Summary" />
        <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" />
        <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma-separated)" />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as OpportunityStatus })}>
          <option value="new">new</option>
          <option value="reviewing">reviewing</option>
          <option value="applied">applied</option>
          <option value="won">won</option>
          <option value="lost">lost</option>
        </select>
        <input value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="Source URL" />
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" />
        <div className="grid grid-cols-3 gap-2 text-sm">
          <label>Demand fit<input type="number" min={0} max={10} value={form.demandFit} onChange={(e) => setForm({ ...form, demandFit: Number(e.target.value) })} /></label>
          <label>Budget<input type="number" min={0} max={10} value={form.budgetPotential} onChange={(e) => setForm({ ...form, budgetPotential: Number(e.target.value) })} /></label>
          <label>Execution<input type="number" min={0} max={10} value={form.executionConfidence} onChange={(e) => setForm({ ...form, executionConfidence: Number(e.target.value) })} /></label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-slate-900 text-white">{editingId ? 'Update' : 'Create'}</button>
          {editingId ? (
            <button type="button" onClick={resetForm} className="bg-slate-200">Cancel</button>
          ) : null}
        </div>
      </form>

      <div className="space-y-3">
        <div className="grid gap-2 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-5">
          <input placeholder="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
          <input placeholder="Tag" value={filters.tags} onChange={(e) => setFilters({ ...filters, tags: e.target.value })} />
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">Any status</option>
            <option value="new">new</option>
            <option value="reviewing">reviewing</option>
            <option value="applied">applied</option>
            <option value="won">won</option>
            <option value="lost">lost</option>
          </select>
          <input type="number" min={0} placeholder="Min score" value={filters.minScore} onChange={(e) => setFilters({ ...filters, minScore: Number(e.target.value) })} />
          <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
            <option value="newest">Newest</option>
            <option value="totalScore">Total score</option>
          </select>
        </div>

        <ul className="space-y-2">
          {filtered.map((opportunity) => (
            <li key={opportunity.id} className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{opportunity.title}</h3>
                  <p className="text-sm text-slate-600">{opportunity.category} · {opportunity.status}</p>
                  <p className="text-sm">Score: {opportunity.totalScore}</p>
                </div>
                <div className="flex gap-2 text-sm">
                  <button className="bg-slate-100" onClick={() => setSelectedId(opportunity.id)}>Details</button>
                  <button className="bg-slate-100" onClick={() => onEdit(opportunity)}>Edit</button>
                  <button
                    className="bg-red-100 text-red-800"
                    onClick={() => {
                      deleteOpportunity(opportunity.id);
                      setOpportunities(getOpportunities());
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {selected ? (
          <aside className="rounded-lg border border-slate-300 bg-white p-4">
            <h3 className="mb-2 font-semibold">{selected.title}</h3>
            <p className="mb-2 text-sm">{selected.summary}</p>
            <p className="text-sm">Tags: {selected.tags.join(', ') || 'none'}</p>
            <p className="text-sm">Notes: {selected.notes || 'none'}</p>
            <p className="text-sm">Source: {selected.sourceUrl || 'none'}</p>
            <p className="text-sm">Breakdown: {selected.scoreBreakdown.demandFit}/{selected.scoreBreakdown.budgetPotential}/{selected.scoreBreakdown.executionConfidence}</p>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
