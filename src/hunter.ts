import type { Env, LeadSourceRow } from "./types";
import { searchPlaces, getPlaceDetails } from "./lib/places";
import { newId } from "./lib/db";
import { resolveTargetLanguage } from "./lib/language";

interface HunterResult {
  newLeadIds: string[];
  skippedNoWebsite: number;
  skippedExisting: number;
}

/** Queries one lead source, dedupes against existing leads, and inserts newly discovered ones. */
export async function runHunterForSource(env: Env, source: LeadSourceRow): Promise<HunterResult> {
  const query = source.region ? `${source.query} in ${source.region}` : source.query;
  const results = await searchPlaces(env.GOOGLE_PLACES_API_KEY, query);

  const session = source.hunt_session_id
    ? await env.DB.prepare("SELECT language, region FROM hunt_sessions WHERE id = ?")
        .bind(source.hunt_session_id)
        .first<{ language?: string; region?: string }>()
    : null;

  const newLeadIds: string[] = [];
  let skippedNoWebsite = 0;
  let skippedExisting = 0;

  for (const place of results) {
    const existing = await env.DB.prepare("SELECT id FROM leads WHERE place_id = ?").bind(place.place_id).first();
    if (existing) {
      skippedExisting++;
      continue;
    }

    let details;
    try {
      details = await getPlaceDetails(env.GOOGLE_PLACES_API_KEY, place.place_id);
    } catch (placeErr) {
      console.error(`Failed to get details for place ${place.place_id}:`, placeErr);
      continue;
    }
    if (!details.website) {
      skippedNoWebsite++;
      continue;
    }

    const leadLang = resolveTargetLanguage(
      session?.language,
      source.region || session?.region || place.formatted_address,
      details.website
    );

    const id = newId();
    try {
      await env.DB.prepare(
        `INSERT INTO leads (id, business_name, url, place_id, phone, address, category, source_id, status, language)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'discovered', ?)`,
      )
        .bind(
          id,
          place.name,
          details.website,
          place.place_id,
          details.formatted_phone_number ?? null,
          place.formatted_address ?? null,
          source.category,
          source.id,
          leadLang,
        )
        .run();
      newLeadIds.push(id);
    } catch {
      // URL already exists under a different place_id — skip.
      skippedExisting++;
    }
  }

  await env.DB.prepare("UPDATE lead_sources SET last_run_at = datetime('now') WHERE id = ?").bind(source.id).run();

  return { newLeadIds, skippedNoWebsite, skippedExisting };
}

/** Runs every cron-enabled lead source and kicks off a Workflow instance per newly discovered lead. */
export async function runHunterCycle(env: Env): Promise<{ sourcesRun: number; leadsCreated: number }> {
  const { results: sources } = await env.DB.prepare("SELECT * FROM lead_sources WHERE cron_enabled = 1").all<LeadSourceRow>();

  const allNewLeadIds: string[] = [];
  for (const source of sources) {
    const result = await runHunterForSource(env, source);
    allNewLeadIds.push(...result.newLeadIds);
  }

  const BATCH_SIZE = 100;
  for (let i = 0; i < allNewLeadIds.length; i += BATCH_SIZE) {
    const chunk = allNewLeadIds.slice(i, i + BATCH_SIZE);
    const instances = await env.LEAD_PIPELINE.createBatch(chunk.map((leadId) => ({ id: leadId, params: { leadId } })));
    for (const instance of instances) {
      await env.DB.prepare("UPDATE leads SET workflow_instance_id = ? WHERE id = ?").bind(instance.id, instance.id).run();
    }
  }

  return { sourcesRun: sources.length, leadsCreated: allNewLeadIds.length };
}
