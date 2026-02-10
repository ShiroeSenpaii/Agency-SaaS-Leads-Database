import { AppData, Client, Opportunity, ScoreBreakdown } from '@/types';
import { seedData } from './seed';

const STORAGE_KEY = 'opportunity-operator-v1';

const isBrowser = () => typeof window !== 'undefined';

const calculateTotalScore = (breakdown: ScoreBreakdown): number =>
  breakdown.demandFit + breakdown.budgetPotential + breakdown.executionConfidence;

const parseData = (raw: string | null): AppData | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppData;
  } catch {
    return null;
  }
};

const safeWrite = (data: AppData) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getData = (): AppData => {
  if (!isBrowser()) return seedData;

  const parsed = parseData(window.localStorage.getItem(STORAGE_KEY));
  if (parsed) return parsed;

  safeWrite(seedData);
  return seedData;
};

export const replaceData = (data: AppData) => {
  safeWrite(data);
};

export const exportData = (): string => JSON.stringify(getData(), null, 2);

export const importData = (json: string): { ok: boolean; error?: string } => {
  try {
    const parsed = JSON.parse(json) as AppData;
    if (!Array.isArray(parsed.opportunities) || !Array.isArray(parsed.clients)) {
      return { ok: false, error: 'Invalid JSON structure.' };
    }
    safeWrite(parsed);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not parse JSON.' };
  }
};

export const getOpportunities = (): Opportunity[] => getData().opportunities;

export const getClients = (): Client[] => getData().clients;

export const createOpportunity = (
  opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'totalScore'>,
): Opportunity => {
  const data = getData();
  const now = new Date().toISOString();
  const next: Opportunity = {
    ...opportunity,
    id: crypto.randomUUID(),
    totalScore: calculateTotalScore(opportunity.scoreBreakdown),
    createdAt: now,
    updatedAt: now,
  };
  data.opportunities.unshift(next);
  safeWrite(data);
  return next;
};

export const updateOpportunity = (id: string, patch: Partial<Opportunity>): Opportunity | null => {
  const data = getData();
  const index = data.opportunities.findIndex((opportunity) => opportunity.id === id);
  if (index === -1) return null;

  const current = data.opportunities[index];
  const scoreBreakdown = patch.scoreBreakdown ?? current.scoreBreakdown;
  const updated: Opportunity = {
    ...current,
    ...patch,
    scoreBreakdown,
    totalScore: calculateTotalScore(scoreBreakdown),
    updatedAt: new Date().toISOString(),
  };

  data.opportunities[index] = updated;
  safeWrite(data);
  return updated;
};

export const deleteOpportunity = (id: string) => {
  const data = getData();
  data.opportunities = data.opportunities.filter((opportunity) => opportunity.id !== id);
  data.clients = data.clients.map((client) => ({
    ...client,
    savedOpportunityIds: client.savedOpportunityIds.filter((savedId) => savedId !== id),
    updatedAt: new Date().toISOString(),
  }));
  safeWrite(data);
};

export const createClient = (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client => {
  const data = getData();
  const now = new Date().toISOString();
  const next: Client = {
    ...client,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  data.clients.unshift(next);
  safeWrite(data);
  return next;
};

export const updateClient = (id: string, patch: Partial<Client>): Client | null => {
  const data = getData();
  const index = data.clients.findIndex((client) => client.id === id);
  if (index === -1) return null;

  const updated: Client = {
    ...data.clients[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  data.clients[index] = updated;
  safeWrite(data);
  return updated;
};

export const deleteClient = (id: string) => {
  const data = getData();
  data.clients = data.clients.filter((client) => client.id !== id);
  safeWrite(data);
};

export const saveOpportunityToClient = (clientId: string, opportunityId: string) => {
  const data = getData();
  const index = data.clients.findIndex((client) => client.id === clientId);
  if (index === -1) return;

  const existing = data.clients[index].savedOpportunityIds;
  if (existing.includes(opportunityId)) return;

  data.clients[index] = {
    ...data.clients[index],
    savedOpportunityIds: [...existing, opportunityId],
    updatedAt: new Date().toISOString(),
  };

  safeWrite(data);
};

export const removeOpportunityFromClient = (clientId: string, opportunityId: string) => {
  const data = getData();
  const index = data.clients.findIndex((client) => client.id === clientId);
  if (index === -1) return;

  data.clients[index] = {
    ...data.clients[index],
    savedOpportunityIds: data.clients[index].savedOpportunityIds.filter((id) => id !== opportunityId),
    updatedAt: new Date().toISOString(),
  };

  safeWrite(data);
};
