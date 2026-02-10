export type OpportunityStatus = 'new' | 'reviewing' | 'applied' | 'won' | 'lost';

export interface ScoreBreakdown {
  demandFit: number;
  budgetPotential: number;
  executionConfidence: number;
}

export interface Opportunity {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  status: OpportunityStatus;
  sourceUrl: string;
  notes: string;
  scoreBreakdown: ScoreBreakdown;
  totalScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  niche: string;
  constraints: string;
  notes: string;
  savedOpportunityIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  opportunities: Opportunity[];
  clients: Client[];
}
