{/*
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/serverClient";
import type { Database } from "@/types/supabase";

type Archetype = Database["public"]["Tables"]["gita_archetypes"]["Row"];

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("gita_archetypes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return notFound();

  const archetype = data as Archetype;

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold">{archetype.id}</h1>
      <p>{archetype.summary}</p>
    </main>
  );
}
*/}

import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/serverClient";
import type { Database } from "@/types/supabase";

import {
  Sparkles,
  Flame,
  Heart,
  Brain,
  Compass,
  BookOpen,
} from "lucide-react";

type Archetype = Database["public"]["Tables"]["gita_archetypes"]["Row"];

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("gita_archetypes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return notFound();

  const archetype = data as Archetype;

  const arr = (x: unknown): string[] =>
    Array.isArray(x) ? (x as string[]) : [];

  const strengths = arr(archetype.strengths);
  const shadows = arr(archetype.shadows);
  const drivers = arr(archetype.childhood_drivers);
  const biases = arr(archetype.cognitive_biases);
  const growth = arr(archetype.growth_plan);
  const verses = arr(archetype.verse_refs);

  const title = archetype.id
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main className="max-w-4xl mx-auto px-6 py-16 font-serif">

      {/* HEADER */}
      <header className="text-center mb-16">
        <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
          {archetype.summary}
        </p>
      </header>

      <Divider />

      <Section icon={<Sparkles />} title="Core Strengths" items={strengths} />
      <Section icon={<Flame />} title="Shadow Patterns" items={shadows} />
      <Section icon={<Heart />} title="Childhood Drivers" items={drivers} />
      <Section icon={<Brain />} title="Cognitive Biases" items={biases} />

      <TextBlock
        title="Stress Pattern"
        text={archetype.stress_pattern}
        icon={<Compass />}
      />

      <TextBlock
        title="Relationship Pattern"
        text={archetype.relationship_pattern}
        icon={<Heart />}
      />

      <TextBlock
        title="Leadership Style"
        text={archetype.leadership_style}
        icon={<BookOpen />}
      />

      <Section
        icon={<Sparkles />}
        title="7-Day Micro Habit Plan"
        items={growth}
      />

      <Section icon={<BookOpen />} title="Key Gita Verses" items={verses} />

      {/* Back link */}
      <div className="text-center mt-20">
        <a
          href="/gita-framework"
          className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl shadow hover:bg-gray-700 transition"
        >
          ← Back to All Archetypes
        </a>
      </div>
    </main>
  );
}

/* ---------- Components ---------- */

function Divider() {
  return (
    <div className="h-0.5 w-40 mx-auto mb-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" />
  );
}

function Section({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
}) {
  if (!items?.length) return null;

  return (
    <section className="mb-12">
      <h2 className="flex items-center gap-3 text-2xl font-bold mb-3">
        <span className="text-orange-600">{icon}</span>
        {title}
      </h2>

      <ul className="ml-6 list-disc text-gray-700 space-y-2">
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </section>
  );
}

function TextBlock({
  title,
  text,
  icon,
}: {
  title: string;
  text: string | null;
  icon: React.ReactNode;
}) {
  if (!text) return null;

  return (
    <section className="mb-12">
      <h2 className="flex items-center gap-3 text-2xl font-bold mb-3">
        <span className="text-orange-600">{icon}</span>
        {title}
      </h2>
      <p className="text-gray-700 leading-relaxed">{text}</p>
    </section>
  );
}

