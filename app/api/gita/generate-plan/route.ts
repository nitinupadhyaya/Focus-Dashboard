// app/api/gita/generate-plan/route.ts

import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import type { Database } from "@/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: Request) {
  let supabase: SupabaseClient<Database>;

  try {
    // Use your new working server client
    supabase = createRouteClient();
  } catch (err) {
    console.error("generate-plan: failed to init Supabase client", err);
    return NextResponse.json({ error: "Supabase init error" }, { status: 500 });
  }

  // -----------------------
  // PARSE BODY
  // -----------------------
  let body: { archetypeId?: string; problemAreaId?: string } | null = null;

  try {
    body = await req.json();
  } catch (err) {
    console.error("generate-plan: invalid JSON body", err);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const archetypeId = body?.archetypeId ?? null;
  const problemAreaId = body?.problemAreaId ?? null;

  if (!archetypeId || !problemAreaId) {
    return NextResponse.json(
      { error: "Missing archetypeId or problemAreaId" },
      { status: 400 }
    );
  }

  // -----------------------
  // AUTH CHECK
  // -----------------------
  let userId: string;

  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userId = session.user.id;
  } catch (err) {
    console.error("generate-plan: session fetch error", err);
    return NextResponse.json({ error: "Session fetch error" }, { status: 500 });
  }

  // -----------------------
  // FETCH ARCHETYPE (NARROW TYPE)
  // -----------------------
  type ArchetypeSelect = {
    summary: string | null;
    growth_plan: Database["public"]["Tables"]["gita_archetypes"]["Row"]["growth_plan"];
    verse_refs: Database["public"]["Tables"]["gita_archetypes"]["Row"]["verse_refs"];
  };

  let archetypeRow: ArchetypeSelect | null = null;

  try {
    const { data, error } = await supabase
      .from("gita_archetypes")
      .select("summary, growth_plan, verse_refs")
      .eq("id", archetypeId)
      .maybeSingle();

    if (error) throw error;

    // ensure type
    archetypeRow = data as ArchetypeSelect;
  } catch (err) {
    console.error("generate-plan: error fetching archetype", err);
    return NextResponse.json({ error: "Error fetching archetype" }, { status: 500 });
  }

  // -----------------------
  // FETCH PROBLEM AREA (OK)
  // -----------------------
  type ProblemSelect = {
    label: string;
    description: string;
  };

  let problemRow: ProblemSelect | null = null;

  try {
    const { data, error } = await supabase
      .from("gita_problem_areas")
      .select("label, description")
      .eq("id", problemAreaId)
      .maybeSingle();

    if (error) throw error;

    problemRow = data as ProblemSelect;
  } catch (err) {
    console.error("generate-plan: error fetching problem area", err);
    return NextResponse.json({ error: "Error fetching problem area" }, { status: 500 });
  }

  // -----------------------
  // LLM PROMPT
  // -----------------------
  const prompt = `Create a clear, actionable 7-day growth plan (daily tasks + reflection prompts) tailored to:
Archetype: ${archetypeId}
Archetype summary: ${archetypeRow?.summary ?? ""}
Problem: ${problemRow?.label ?? ""} — ${problemRow?.description ?? ""}

Format the plan as JSON: { "days": [ { "day": 1, "tasks": ["..."], "reflection": "..." }, ... ] }`;

  let planText = "";

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    planText = response?.choices?.[0]?.message?.content ?? "";

    if (!planText) {
      throw new Error("Empty plan text from Groq");
    }
  } catch (err) {
    console.error("generate-plan: Groq error", err);
    return NextResponse.json({ error: "Groq generation failed" }, { status: 500 });
  }

  // -----------------------
  // PARSE JSON SAFELY
  // -----------------------
  type PlanType = Database["public"]["Tables"]["user_growth_plans"]["Row"]["plan"];

  let planJson: PlanType;

  try {
    planJson = JSON.parse(planText) as PlanType;
  } catch {
    planJson = { text: planText } as PlanType;
  }

  // -----------------------
  // INSERT PLAN
  // -----------------------
  let savedRow:
    | Database["public"]["Tables"]["user_growth_plans"]["Row"]
    | null = null;

  const insertPayload: Database["public"]["Tables"]["user_growth_plans"]["Insert"] = {
    user_id: userId,
    archetype_id: archetypeId,
    problem_area_id: problemAreaId,
    plan: planJson,
  };

  try {
    const { data, error } = await supabase
      .from("user_growth_plans")
      .insert([insertPayload])
      .select()
      .maybeSingle();

    if (error) throw error;
    savedRow = data;
  } catch (err) {
    console.error("generate-plan: insert error", err);
    return NextResponse.json({ error: "Plan insert failed" }, { status: 500 });
  }

  return NextResponse.json({
    planId: savedRow?.id ?? null,
    saved: savedRow,
  });
}
