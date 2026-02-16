import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/adminClient';

interface IncomingOpportunity {
  title: string;
  summary?: string;
  category?: string;
  tags?: string[] | string;
  status?: string;
  sourceUrl?: string;
  notes?: string;
  scoreBreakdown?: {
    demandFit?: number;
    budgetPotential?: number;
    executionConfidence?: number;
  };
  totalScore?: number;
  evidenceLinks?: string[];
}

const normalizeTags = (value: string[] | string | undefined): string[] => {
  if (Array.isArray(value)) return value.map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  return [];
};

const validateUrl = async (
  sourceUrl: string,
): Promise<{ status: 'ok' | 'dead' | 'timeout' | 'redirected'; finalUrl?: string }> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(sourceUrl, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });

    const finalUrl = response.url;
    const redirected = finalUrl && finalUrl !== sourceUrl;
    if (response.ok && redirected) return { status: 'redirected', finalUrl };
    if (response.ok) return { status: 'ok', finalUrl };
    return { status: 'dead', finalUrl };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { status: 'timeout' };
    }
    return { status: 'dead' };
  } finally {
    clearTimeout(timeout);
  }
};

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret');
  if (!process.env.WEBHOOK_SECRET || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const userId = body?.userId as string | undefined;
  const opportunities = (body?.opportunities ?? []) as IncomingOpportunity[];

  if (!userId || !Array.isArray(opportunities)) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  const adminClient = getAdminClient();
  let upserted = 0;

  for (const opportunity of opportunities) {
    if (!opportunity.title) continue;

    const demandFit = Number(opportunity.scoreBreakdown?.demandFit ?? 0);
    const budgetPotential = Number(opportunity.scoreBreakdown?.budgetPotential ?? 0);
    const executionConfidence = Number(opportunity.scoreBreakdown?.executionConfidence ?? 0);

    let validationStatus: 'ok' | 'dead' | 'timeout' | 'redirected' | 'unknown' = 'unknown';
    if (opportunity.sourceUrl) {
      const validation = await validateUrl(opportunity.sourceUrl);
      validationStatus = validation.status;
    }

    const payload = {
      user_id: userId,
      title: opportunity.title.trim(),
      summary: opportunity.summary ?? '',
      category: opportunity.category ?? '',
      tags: normalizeTags(opportunity.tags),
      status: opportunity.status ?? 'new',
      source_url: opportunity.sourceUrl ?? null,
      notes: opportunity.notes ?? '',
      demand_fit: demandFit,
      budget_potential: budgetPotential,
      execution_confidence: executionConfidence,
      total_score: opportunity.totalScore ?? demandFit + budgetPotential + executionConfidence,
      validation_status: validationStatus,
      last_validated_at: new Date().toISOString(),
      evidence_links: opportunity.evidenceLinks ?? [],
    };

    if (payload.source_url) {
      const { error } = await adminClient
        .from('opportunities')
        .upsert(payload, { onConflict: 'user_id,source_url', ignoreDuplicates: false });

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }
      upserted += 1;
      continue;
    }

    const { data: existing, error: selectError } = await adminClient
      .from('opportunities')
      .select('id,title')
      .eq('user_id', userId)
      .ilike('title', payload.title.trim())
      .limit(1)
      .maybeSingle();

    if (selectError) {
      return NextResponse.json({ ok: false, error: selectError.message }, { status: 500 });
    }

    if (existing?.id) {
      const { error } = await adminClient.from('opportunities').update(payload).eq('id', existing.id);
      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await adminClient.from('opportunities').insert(payload);
      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }
    }

    upserted += 1;
  }

  return NextResponse.json({ ok: true, upserted });
}
