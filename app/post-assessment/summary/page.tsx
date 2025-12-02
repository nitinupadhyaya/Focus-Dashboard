"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";
import { useRouter } from "next/navigation";

type ProblemArea =
  Database["public"]["Tables"]["gita_problem_areas"]["Row"];

export default function SummaryPage() {
  const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
  
  const router = useRouter();

  const [archetype, setArchetype] = useState<string | null>(null);

  const [problems, setProblems] = useState<ProblemArea[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  const [plan, setPlan] = useState<string[] | null>(null);

  // --------------------------------------
  // Load user archetype + problem areas
  // --------------------------------------

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }

      const userId = session.user.id;

      // 1. Fetch archetype
      const { data: row } = await supabase
        .from("user_archetypes")
        .select("archetype_id")
        .eq("user_id", userId)
        .maybeSingle<
          Database["public"]["Tables"]["user_archetypes"]["Row"]
        >();

      setArchetype(row?.archetype_id ?? null);

      // 2. Fetch list of problem areas
      const { data: probs } = await supabase
        .from("gita_problem_areas")
        .select("*")
        .order("label");

      setProblems(probs ?? []);
      setLoading(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    load();
  }, []);

  // --------------------------------------
  // Save selected problem areas
  // --------------------------------------

  async function saveProblems() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const userId = session.user.id;

  const rows: Database["public"]["Tables"]["user_problem_areas"]["Insert"][] =
  selected.map((pid) => ({
    user_id: userId,
    problem_area_id: pid,
    notes: notes || null,
  }));


  try {
    console.log("ROWS BEING INSERTED:", rows);

    const { data, error } = await supabase
    .from("user_problem_areas")
    .insert<Database["public"]["Tables"]["user_problem_areas"]["Insert"]>(rows);

    console.log("SUPABASE INSERT DATA:", data);
    console.log("SUPABASE INSERT ERROR:", error);

    if (error) throw error;
  } catch (err) {
    console.error("INSERT FAILED:", err);
  }



    // Generate the simple plan (replace with GROQ later)
    const generated = generatePlan(archetype, problems, selected);
    setPlan(generated);
  }

  if (loading) return <div className="p-6">Loading…</div>;

  // --------------------------------------
  // UI
  // --------------------------------------

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Archetype Summary</h1>

      <p className="mb-4">
        Dominant Archetype:
        <strong className="ml-2">{archetype ?? "—"}</strong>
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Select Problem Areas</h2>

      <div className="space-y-2 mb-4">
        {problems.map(p => (
          <label key={p.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(p.id)}
              onChange={() => {
                setSelected(prev =>
                  prev.includes(p.id)
                    ? prev.filter(x => x !== p.id)
                    : [...prev, p.id]
                );
              }}
            />
            {p.label}
          </label>
        ))}
      </div>

      <textarea
        className="w-full p-2 border rounded mb-4"
        rows={4}
        placeholder="Add notes if you like..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button
        onClick={saveProblems}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Save & Generate Plan
      </button>

      {plan && (
        <div className="mt-8 p-4 border rounded bg-gray-50">
          <h3 className="text-xl font-bold mb-3">Your 7-Day Plan</h3>
          <ol className="list-decimal ml-6 space-y-2">
            {plan.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------
// SIMPLE static plan (you will replace with GROQ soon)
// -----------------------------------------------------

function generatePlan(
  archetype: string | null,
  allProblems: ProblemArea[],
  selected: string[]
) {
  const problemLabels = allProblems
    .filter(p => selected.includes(p.id))
    .map(p => p.label);

  const base = archetype
    ? `Based on ${archetype} tendencies`
    : "Based on your pattern";

  return [
    `${base}, spend 10 minutes identifying triggers for: ${problemLabels.join(", ")}`,
    "Do a 2-minute breathing practice before any stressful task.",
    "Write a short reflection on one repeated emotion you felt today.",
    "Perform one small courageous act aligned with your archetype.",
    "Reframe one negative thought using ‘What is the smallest next action?’",
    "Share one difficulty with a trusted friend or journal openly.",
    "Review the week, list wins, and plan 1 micro-habit for next week."
  ];
}





