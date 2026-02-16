'use client';

import { AppData, Client, Opportunity, ScoreBreakdown } from '@/types';
import { browserClient } from '@/lib/supabase/browserClient';

const calculateTotalScore = (breakdown: ScoreBreakdown): number =>
  breakdown.demandFit + breakdown.budgetPotential + breakdown.executionConfidence;

const normalizeTags = (value: string[] | string | null | undefined): string[] => {
  if (Array.isArray(value)) {
    return value.map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
};

const mapOpportunityFromRow = (row: Record<string, unknown>): Opportunity => ({
  id: String(row.id),
  title: String(row.title ?? ''),
  summary: String(row.summary ?? ''),
  category: String(row.category ?? ''),
  tags: normalizeTags(row.tags as string[] | string | null),
  status: String(row.status ?? 'new') as Opportunity['status'],
  sourceUrl: String(row.source_url ?? ''),
  notes: String(row.notes ?? ''),
  scoreBreakdown: {
    demandFit: Number(row.demand_fit ?? 0),
    budgetPotential: Number(row.budget_potential ?? 0),
    executionConfidence: Number(row.execution_confidence ?? 0),
  },
  totalScore: Number(row.total_score ?? 0),
  createdAt: String(row.created_at ?? new Date().toISOString()),
  updatedAt: String(row.updated_at ?? new Date().toISOString()),
  lastValidatedAt: row.last_validated_at ? String(row.last_validated_at) : null,
  validationStatus: String(row.validation_status ?? 'unknown') as Opportunity['validationStatus'],
  evidenceLinks: Array.isArray(row.evidence_links) ? (row.evidence_links as string[]) : [],
});

const getCurrentUserId = async (): Promise<string> => {
  const {
    data: { user },
    error,
  } = await browserClient.auth.getUser();

  if (error || !user) {
    throw new Error('You must be logged in to access data.');
  }

  return user.id;
};

export const getOpportunities = async (): Promise<Opportunity[]> => {
  const userId = await getCurrentUserId();
  const { data, error } = await browserClient
    .from('opportunities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapOpportunityFromRow(row));
};

export const getClients = async (): Promise<Client[]> => {
  const userId = await getCurrentUserId();
  const { data, error } = await browserClient
    .from('clients')
    .select('*, client_saved_opportunities(opportunity_id)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    name: String(row.name ?? ''),
    niche: String(row.niche ?? ''),
    constraints: String(row.constraints ?? ''),
    notes: String(row.notes ?? ''),
    savedOpportunityIds: Array.isArray(row.client_saved_opportunities)
      ? (row.client_saved_opportunities as { opportunity_id: string }[]).map((entry) => entry.opportunity_id)
      : [],
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  }));
};

export const createOpportunity = async (
  opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'totalScore'>,
): Promise<Opportunity> => {
  const userId = await getCurrentUserId();
  const payload = {
    user_id: userId,
    title: opportunity.title,
    summary: opportunity.summary,
    category: opportunity.category,
    tags: normalizeTags(opportunity.tags),
    status: opportunity.status,
    source_url: opportunity.sourceUrl || null,
    notes: opportunity.notes,
    demand_fit: opportunity.scoreBreakdown.demandFit,
    budget_potential: opportunity.scoreBreakdown.budgetPotential,
    execution_confidence: opportunity.scoreBreakdown.executionConfidence,
    total_score: calculateTotalScore(opportunity.scoreBreakdown),
    evidence_links: opportunity.evidenceLinks ?? [],
  };

  const { data, error } = await browserClient.from('opportunities').insert(payload).select('*').single();
  if (error) throw error;
  return mapOpportunityFromRow(data as Record<string, unknown>);
};

export const updateOpportunity = async (id: string, patch: Partial<Opportunity>): Promise<Opportunity | null> => {
  const userId = await getCurrentUserId();
  const scoreBreakdown = patch.scoreBreakdown;

  const payload: Record<string, unknown> = {
    ...(patch.title !== undefined ? { title: patch.title } : {}),
    ...(patch.summary !== undefined ? { summary: patch.summary } : {}),
    ...(patch.category !== undefined ? { category: patch.category } : {}),
    ...(patch.tags !== undefined ? { tags: normalizeTags(patch.tags) } : {}),
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.sourceUrl !== undefined ? { source_url: patch.sourceUrl || null } : {}),
    ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
    ...(patch.evidenceLinks !== undefined ? { evidence_links: patch.evidenceLinks } : {}),
  };

  if (scoreBreakdown) {
    payload.demand_fit = scoreBreakdown.demandFit;
    payload.budget_potential = scoreBreakdown.budgetPotential;
    payload.execution_confidence = scoreBreakdown.executionConfidence;
    payload.total_score = calculateTotalScore(scoreBreakdown);
  }

  const { data, error } = await browserClient
    .from('opportunities')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapOpportunityFromRow(data as Record<string, unknown>);
};

export const deleteOpportunity = async (id: string): Promise<void> => {
  const userId = await getCurrentUserId();
  const { error } = await browserClient.from('opportunities').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
};

export const createClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
  const userId = await getCurrentUserId();
  const payload = {
    user_id: userId,
    name: client.name,
    niche: client.niche,
    constraints: client.constraints,
    notes: client.notes,
  };

  const { data, error } = await browserClient.from('clients').insert(payload).select('*').single();
  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    niche: data.niche,
    constraints: data.constraints ?? '',
    notes: data.notes ?? '',
    savedOpportunityIds: [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const updateClient = async (id: string, patch: Partial<Client>): Promise<Client | null> => {
  const userId = await getCurrentUserId();
  const payload = {
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.niche !== undefined ? { niche: patch.niche } : {}),
    ...(patch.constraints !== undefined ? { constraints: patch.constraints } : {}),
    ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
  };

  const { data, error } = await browserClient
    .from('clients')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*, client_saved_opportunities(opportunity_id)')
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    niche: data.niche,
    constraints: data.constraints ?? '',
    notes: data.notes ?? '',
    savedOpportunityIds: Array.isArray(data.client_saved_opportunities)
      ? data.client_saved_opportunities.map((entry: { opportunity_id: string }) => entry.opportunity_id)
      : [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const deleteClient = async (id: string): Promise<void> => {
  const userId = await getCurrentUserId();
  const { error } = await browserClient.from('clients').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
};

export const saveOpportunityToClient = async (clientId: string, opportunityId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  const { error } = await browserClient.from('client_saved_opportunities').upsert(
    {
      user_id: userId,
      client_id: clientId,
      opportunity_id: opportunityId,
    },
    { onConflict: 'client_id,opportunity_id' },
  );

  if (error) throw error;
};

export const removeOpportunityFromClient = async (clientId: string, opportunityId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  const { error } = await browserClient
    .from('client_saved_opportunities')
    .delete()
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .eq('opportunity_id', opportunityId);

  if (error) throw error;
};

export const exportData = async (): Promise<string> => {
  const [opportunities, clients] = await Promise.all([getOpportunities(), getClients()]);
  const payload: AppData = { opportunities, clients };
  return JSON.stringify(payload, null, 2);
};

export const importData = async (json: string): Promise<{ ok: boolean; error?: string }> => {
  try {
    const parsed = JSON.parse(json) as AppData;
    if (!Array.isArray(parsed.opportunities) || !Array.isArray(parsed.clients)) {
      return { ok: false, error: 'Invalid JSON structure.' };
    }

    const userId = await getCurrentUserId();
    const opportunityIdMap = new Map<string, string>();

    for (const item of parsed.opportunities) {
      if (!item?.title) continue;

      const rowPayload = {
        user_id: userId,
        title: item.title,
        summary: item.summary ?? '',
        category: item.category ?? '',
        tags: normalizeTags(item.tags),
        status: item.status ?? 'new',
        source_url: item.sourceUrl || null,
        notes: item.notes ?? '',
        demand_fit: item.scoreBreakdown?.demandFit ?? 0,
        budget_potential: item.scoreBreakdown?.budgetPotential ?? 0,
        execution_confidence: item.scoreBreakdown?.executionConfidence ?? 0,
        total_score:
          item.totalScore ??
          calculateTotalScore({
            demandFit: item.scoreBreakdown?.demandFit ?? 0,
            budgetPotential: item.scoreBreakdown?.budgetPotential ?? 0,
            executionConfidence: item.scoreBreakdown?.executionConfidence ?? 0,
          }),
        evidence_links: item.evidenceLinks ?? [],
      };

      let createdId = '';
      if (rowPayload.source_url) {
        const { data, error } = await browserClient
          .from('opportunities')
          .upsert(rowPayload, { onConflict: 'user_id,source_url' })
          .select('id')
          .single();
        if (error) throw error;
        createdId = data.id;
      } else {
        const { data, error } = await browserClient.from('opportunities').insert(rowPayload).select('id').single();
        if (error) throw error;
        createdId = data.id;
      }

      if (item.id) {
        opportunityIdMap.set(item.id, createdId);
      }
    }

    const clientIdMap = new Map<string, string>();
    for (const item of parsed.clients) {
      if (!item?.name) continue;

      const { data, error } = await browserClient
        .from('clients')
        .insert({
          user_id: userId,
          name: item.name,
          niche: item.niche ?? '',
          constraints: item.constraints ?? '',
          notes: item.notes ?? '',
        })
        .select('id')
        .single();

      if (error) throw error;
      if (item.id) {
        clientIdMap.set(item.id, data.id);
      }
    }

    for (const client of parsed.clients) {
      if (!client.id || !Array.isArray(client.savedOpportunityIds)) continue;
      const mappedClientId = clientIdMap.get(client.id);
      if (!mappedClientId) continue;

      for (const savedId of client.savedOpportunityIds) {
        const mappedOpportunityId = opportunityIdMap.get(savedId);
        if (!mappedOpportunityId) continue;

        const { error } = await browserClient.from('client_saved_opportunities').upsert(
          {
            user_id: userId,
            client_id: mappedClientId,
            opportunity_id: mappedOpportunityId,
          },
          { onConflict: 'client_id,opportunity_id' },
        );
        if (error) throw error;
      }
    }

    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not import JSON.' };
  }
};
