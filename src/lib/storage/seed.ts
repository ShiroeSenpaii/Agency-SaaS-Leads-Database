import { AppData } from '@/types';

const now = new Date().toISOString();

export const seedData: AppData = {
  opportunities: [
    {
      id: 'opp-1',
      title: 'B2B SaaS Landing Page Optimization',
      summary: 'Improve conversion rates for a SaaS homepage and pricing page.',
      category: 'Conversion',
      tags: ['saas', 'landing-page', 'cro'],
      status: 'reviewing',
      sourceUrl: 'https://example.com/saas-cro-opportunity',
      notes: 'Strong fit for product-led growth agencies.',
      scoreBreakdown: {
        demandFit: 8,
        budgetPotential: 7,
        executionConfidence: 9,
      },
      totalScore: 24,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'opp-2',
      title: 'Local Services Google Ads Management',
      summary: 'Monthly PPC management for regional legal services firm.',
      category: 'Paid Acquisition',
      tags: ['ppc', 'google-ads', 'legal'],
      status: 'new',
      sourceUrl: 'https://example.com/legal-ppc-opportunity',
      notes: 'Needs clear lead quality tracking setup.',
      scoreBreakdown: {
        demandFit: 7,
        budgetPotential: 9,
        executionConfidence: 7,
      },
      totalScore: 23,
      createdAt: now,
      updatedAt: now,
    },
  ],
  clients: [
    {
      id: 'client-1',
      name: 'North Star Growth',
      niche: 'B2B SaaS',
      constraints: 'No cold outreach campaigns',
      notes: 'Prioritizes high-ticket retained engagements.',
      savedOpportunityIds: ['opp-1'],
      createdAt: now,
      updatedAt: now,
    },
  ],
};
