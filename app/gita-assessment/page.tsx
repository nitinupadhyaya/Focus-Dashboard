"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

import type { Database } from "@/types/supabase";

import { useRouter } from "next/navigation";

type QuestionRow = Database["public"]["Tables"]["gita_questions"]["Row"];
type OptionRow = Database["public"]["Tables"]["gita_question_options"]["Row"];
type AssessmentInsert = Database["public"]["Tables"]["gita_assessments"]["Insert"];

const ARCHETYPES = [
  "Arjuna",
  "Karna",
  "Krishna",
  "Draupadi",
  "Bhishma",
  "Yudhishthira",
  "Duryodhana",
] as const;

type Archetype = (typeof ARCHETYPES)[number];
type ScoreVector = Record<Archetype, number>;

function zeroVector(): ScoreVector {
  return {
    Arjuna: 0,
    Karna: 0,
    Krishna: 0,
    Draupadi: 0,
    Bhishma: 0,
    Yudhishthira: 0,
    Duryodhana: 0,
  };
}

function optionScoresToVector(opt: OptionRow): ScoreVector {
  return {
    Arjuna: opt.score_arjuna ?? 0,
    Karna: opt.score_karna ?? 0,
    Krishna: opt.score_krishna ?? 0,
    Draupadi: opt.score_draupadi ?? 0,
    Bhishma: opt.score_bhishma ?? 0,
    Yudhishthira: opt.score_yudhishthira ?? 0,
    Duryodhana: opt.score_duryodhana ?? 0,
  };
}

function addVector(a: ScoreVector, b: ScoreVector): ScoreVector {
  const out: ScoreVector = { ...a };
  (Object.keys(out) as Array<Archetype>).forEach((k) => {
    out[k] = out[k] + b[k];
  });
  return out;
}

function sortedArchetypes(vec: ScoreVector): [Archetype, number][] {
  return Object.entries(vec)
    .map(([k, v]) => [k as Archetype, v] as [Archetype, number])
    .sort((a, b) => b[1] - a[1]);
}

function normalizeToPercent(vec: ScoreVector): Record<Archetype, number> {
  const total = Object.values(vec).reduce((s, n) => s + n, 0) || 1;
  const res: Record<Archetype, number> = {
    Arjuna: Math.round((vec.Arjuna / total) * 100),
    Karna: Math.round((vec.Karna / total) * 100),
    Krishna: Math.round((vec.Krishna / total) * 100),
    Draupadi: Math.round((vec.Draupadi / total) * 100),
    Bhishma: Math.round((vec.Bhishma / total) * 100),
    Yudhishthira: Math.round((vec.Yudhishthira / total) * 100),
    Duryodhana: Math.round((vec.Duryodhana / total) * 100),
  };
  return res;
}

function pickNextQuestion(
  remainingQuestions: Array<{ q: QuestionRow; options: OptionRow[] }>,
): { q: QuestionRow; options: OptionRow[] } | null {
  if (remainingQuestions.length === 0) return null;

  let best: { q: QuestionRow; options: OptionRow[] } | null = null;
  let bestScore = -Infinity;

  for (const candidate of remainingQuestions) {
    const archetypeValues = ARCHETYPES.map((a) =>
      candidate.options.map((opt) => optionScoresToVector(opt)[a]),
    );

    let totalVar = 0;
    for (const vals of archetypeValues) {
      const mean = vals.reduce((s, x) => s + x, 0) / (vals.length || 1);
      const varSum = vals.reduce((s, x) => s + (x - mean) ** 2, 0) / (vals.length || 1);
      totalVar += varSum;
    }

    if (totalVar > bestScore) {
      bestScore = totalVar;
      best = candidate;
    }
  }

  return best;
}

export default function GitaAssessmentPage(): React.ReactElement {
  const [questions, setQuestions] = useState<Array<{ q: QuestionRow; options: OptionRow[] }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [current, setCurrent] = useState<{ q: QuestionRow; options: OptionRow[] } | null>(null);
  const [answeredOrder, setAnsweredOrder] = useState<string[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<string, string>>({});
  const [scoreVector, setScoreVector] = useState<ScoreVector>(zeroVector());
  const [finished, setFinished] = useState<boolean>(false);
  const [resultPercent, setResultPercent] = useState<Record<Archetype, number> | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // New state for inline OTP auth
  const [showAuthInline, setShowAuthInline] = useState<boolean>(false);
  const [authStep, setAuthStep] = useState<"email" | "otp">("email");
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authOtp, setAuthOtp] = useState<string>("");
  const [authMessage, setAuthMessage] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  // store pending payload if user is not logged in when they finish
  const [pendingPayload, setPendingPayload] = useState<AssessmentInsert | null>(null);

  const maxQuestions = 12;
  const confidenceGap = 20; // percent gap

  const router = useRouter();

  // NEW: check if user already has an assessment
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [existingArchetype, setExistingArchetype] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;

      if (!user) {
        setCheckingExisting(false);
        return; // user not logged in → allow assessment
      }

      const { data: row, error } = await supabase
        .from("gita_assessments")
        .select("archetype")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (row?.archetype) {
        setExistingArchetype(row.archetype);
      }

      setCheckingExisting(false);
    }

    check();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);

      // fetch questions
      const { data: qData, error: qErr } = await supabase
        .from("gita_questions")
        .select("*")
        .order("created_at", { ascending: true })
        .returns<QuestionRow[]>();

      if (qErr || !qData) {
        console.warn("Failed to load questions", qErr);
        setLoading(false);
        return;
      }

      const qIds = qData.map((r) => r.id);

      // fetch options for those questions
      const { data: optData, error: optErr } = await supabase
        .from("gita_question_options")
        .select("*")
        .in("question_id", qIds)
        .returns<OptionRow[]>();

      if (optErr || !optData) {
        console.warn("Failed to load options", optErr);
        setLoading(false);
        return;
      }

      const grouped = qData.map((q) => ({
        q,
        options: optData.filter((o) => o.question_id === q.id),
      }));

      if (!mounted) return;
      setQuestions(grouped);

      const first = pickNextQuestion(grouped);
      setCurrent(first);
      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (finished) return;
    if (!current && questions.length > 0 && answeredOrder.length < Math.min(maxQuestions, questions.length)) {
      const remaining = questions.filter((x) => !answeredOrder.includes(x.q.id));
      const next = pickNextQuestion(remaining);
      setCurrent(next);
    }
  }, [current, questions, answeredOrder, finished]);

  async function handleSelect(optionId: string) {
    if (!current) return;
    const qid = current.q.id;
    const opt = current.options.find((o) => o.id === optionId);
    if (!opt) {
      console.warn("Option not found for id", optionId);
      return;
    }

    // Build new answered order up front (avoid closure stale)
    const newAnsweredOrder = [...answeredOrder, qid];
    setAnsweredOrder(newAnsweredOrder);

    // update answers map
    setAnswersMap((prev) => ({ ...prev, [qid]: optionId }));

    // compute prospective vector now (before state update race)
    const prospective = addVector(scoreVector, optionScoresToVector(opt));

    // update score vector state
    setScoreVector(prospective);

    // compute next question using the newAnsweredOrder
    const remaining = questions.filter((x) => !newAnsweredOrder.includes(x.q.id));
    const next = pickNextQuestion(remaining);
    setCurrent(next ?? null);

    // Check stopping criteria using normalized percents
    const normalized = normalizeToPercent(prospective);
    const sorted = sortedArchetypes(prospective);
    const topVal = sorted[0]?.[1] ?? 0;
    const secondVal = sorted[1]?.[1] ?? 0;
    const total = Object.values(prospective).reduce((s, n) => s + n, 0) || 1;
    const topPercent = Math.round((topVal / total) * 100);
    const secondPercent = Math.round((secondVal / total) * 100);
    const gapPercent = topPercent - secondPercent;
    const questionsAnswered = newAnsweredOrder.length;

    if (questionsAnswered >= maxQuestions || gapPercent >= confidenceGap) {
      setTimeout(() => finalizeAssessment(), 200);
    }
  }

  async function finalizeAssessment() {
    if (finished) return;
    setFinished(true);

    const finalVec = scoreVector;
    const normalized = normalizeToPercent(finalVec);
    setResultPercent(normalized);

    const sorted = sortedArchetypes(finalVec);
    const primary = sorted[0]?.[0] ?? "Arjuna";

    const payload: AssessmentInsert = {
      answers: answersMap as Database["public"]["Tables"]["gita_assessments"]["Row"]["answers"],
      archetype: primary,
      // store vector in DB in ARCHETYPES order
      score_vector: ARCHETYPES.map((a) => finalVec[a]),
      routing_metadata: {
        answered_order: answeredOrder,
        finished_at: new Date().toISOString(),
      } as Database["public"]["Tables"]["gita_assessments"]["Row"]["routing_metadata"],
    };

    try {
      // Ensure user is logged in - if not, show inline auth section (no redirect)
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;
      if (!user) {
        // hold payload and present inline auth UI
        setPendingPayload(payload);
        setShowAuthInline(true);
        setAuthStep("email");
        setAuthMessage("");
        setAuthError("");
        return;
      }

      // attach user id and save immediately
      await saveAssessmentForUser(user.id, payload);
    } catch (e) {
      console.warn("Exception preparing assessment save:", e);
    }
  }

  // helper: update user metadata initials (small helper)
  function getEmailInitials(email: string) {
    const localPart = email.split("@")[0] || "";
    const parts = localPart.split(/[\.\-_]+/);
    const initials = parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
    return initials.slice(0, 2);
  }

  // Save pending payload to DB once we have a user id
  async function saveAssessmentForUser(userId: string, payload: AssessmentInsert) {
    setSaving(true);
    try {
      // attach user id to payload copy
      const toInsert: AssessmentInsert = { ...payload, user_id: userId };

      // Insert assessment
      const { error: insertErr } = await supabase.from("gita_assessments").insert(toInsert);
      if (insertErr) {
        console.warn("Failed to save assessment:", insertErr);
      }

      // Upsert user_archetypes
      try {
        const { error: upsertErr } = await supabase.from("user_archetypes").upsert(
          { user_id: userId, archetype_id: toInsert.archetype as string },
          { onConflict: "user_id" }
        );
        if (upsertErr) {
          console.warn("user_archetypes upsert error:", upsertErr);
        }
      } catch (e) {
        console.warn("Failed to upsert user archetype (table may not exist):", e);
      }

      setSaving(false);
      // Redirect to post-assessment summary where they can create/generate plans
      router.push("/post-assessment/summary");
    } catch (e) {
      console.warn("Exception saving assessment:", e);
      setSaving(false);
    }
  }

  // Inline OTP: request code
  async function handleRequestOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setAuthMessage("");
    setAuthError("");

    if (!authEmail) {
      setAuthError("Please enter a valid email.");
      return;
    }

    try {
      const { error: supabaseError } = await supabase.auth.signInWithOtp({
        email: authEmail,
        options: {
          shouldCreateUser: true,
          // On successful OTP verification the session will be returned by verifyOtp
          // We keep redirect handling inside this page, so we don't rely on emailRedirectTo here.
        },
      });

      if (supabaseError) {
        setAuthError(supabaseError.message);
      } else {
        setAuthStep("otp");
        setAuthMessage("We’ve sent a 6-digit code to your email. Enter it below.");
      }
    } catch (err) {
      console.warn("send otp error", err);
      setAuthError("Failed to send OTP. Try again.");
    }
  }

  // Inline OTP: verify code and save assessment
  async function handleVerifyOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setAuthMessage("");
    setAuthError("");

    if (!authOtp) {
      setAuthError("Please enter the code from your email.");
      return;
    }

    try {
      const { data, error: supabaseError } = await supabase.auth.verifyOtp({
        email: authEmail,
        token: authOtp,
        type: "email",
      });

      if (supabaseError) {
        setAuthError(supabaseError.message);
        return;
      }

      // data.session should exist on successful verification
      const session = data?.session;
      if (!session?.user?.id) {
        // In some flows (magic link) session may not be present; fetch current user
        const { data: userRes } = await supabase.auth.getUser();
        if (!userRes?.user?.id) {
          setAuthError("Could not verify login. Try again or check your email link.");
          return;
        }
        const uid = userRes.user.id;

        // update metadata
        try {
          const initials = getEmailInitials(authEmail);
          await supabase.auth.updateUser({ data: { full_name: initials } });
        } catch (err) {
          console.warn("update metadata error", err);
        }

        // save pending payload
        if (pendingPayload) await saveAssessmentForUser(uid, pendingPayload);
        return;
      }

      // we have session + user
      const uid = session.user.id;

      // update metadata
      try {
        const initials = getEmailInitials(authEmail);
        await supabase.auth.updateUser({ data: { full_name: initials } });
      } catch (err) {
        console.warn("update metadata error", err);
      }

      // save pending payload
      if (pendingPayload) await saveAssessmentForUser(uid, pendingPayload);
    } catch (err) {
      console.warn("verify otp error", err);
      setAuthError("Failed to verify code. Try again.");
    }
  }

  const progress = useMemo(() => answeredOrder.length, [answeredOrder.length]);

  // --- Early return: show loading if checking existing assessment ----
if (checkingExisting) {
  return <div className="p-10 text-center">Checking your assessment…</div>;
}

// --- Early return: user already has an assessment ----
if (existingArchetype) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10">
      <h1 className="text-3xl font-serif mb-4">You’ve Already Completed the Assessment</h1>
      <p className="text-lg mb-6 opacity-80">
        Your primary archetype: <strong>{existingArchetype}</strong>
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => router.push("/post-assessment/summary")}
          className="px-6 py-3 bg-black text-white rounded-lg"
        >
          Go to Dashboard
        </button>

        <button
          onClick={() => router.refresh()} // retake assessment
          className="px-6 py-3 border rounded-lg"
        >
          Retake Test
        </button>
      </div>
    </div>
  );
  }

  return (

    <div className="min-h-screen bg-white font-serif py-12 px-6 md:px-20">
       
      
      <div className="max-w-4xl mx-auto">
         {/* -------------------------------------------- */}
        {/* FLOWCHART / EXPLANATION SECTION */}
        {/*    -------------------------------------------- */}
        

        <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 bg-white/60 border border-yellow-50 shadow rounded-2xl p-6 md:p-10"
        >
        <h2 className="text-3xl font-serif text-center mb-6">
            How the Gita Personality Assessment Works
        </h2>

        {/* Flowchart container */}
        <div className="grid gap-8">
        {/* Step 1 */}
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-start space-x-4"
            >
            <div className="text-3xl">①</div>
            <div>
            <div className="font-semibold text-xl">Answer Adaptive Questions</div>
        <p className="text-sm opacity-80 mt-1">
          You answer 8–12 smartly chosen questions. The system uses a
          <span className="font-medium"> variance-based adaptive algorithm</span> to pick the next question
          that best distinguishes your archetype scores.
        </p>
      </div>
    </motion.div>

    {/* Arrow */}
    <div className="text-center text-2xl opacity-30">↓</div>

    {/* Step 2 */}
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex items-start space-x-4"
    >
      <div className="text-3xl">②</div>
      <div>
        <div className="font-semibold text-xl">Your Gita Personality Vector</div>
        <p className="text-sm opacity-80 mt-1">
          Each response updates a 7-dimensional score vector across the archetypes:
          Arjuna • Karna • Krishna • Draupadi • Bhishma • Yudhishthira • Duryodhana.
        </p>
      </div>
    </motion.div>

    {/* Arrow */}
    <div className="text-center text-2xl opacity-30">↓</div>

    {/* Step 3 */}
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex items-start space-x-4"
    >
      <div className="text-3xl">③</div>
      <div>
        <div className="font-semibold text-xl">Confidence-Based Stopping</div>
        <p className="text-sm opacity-80 mt-1">
          The test ends automatically when your top archetype is at least
          <strong> 20% clearer</strong> than the next — giving accuracy without long tests.
        </p>
      </div>
    </motion.div>

    {/* Arrow */}
    <div className="text-center text-2xl opacity-30">↓</div>

    {/* Step 4 */}
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex items-start space-x-4"
    >
      <div className="text-3xl">④</div>
      <div>
        <div className="font-semibold text-xl">Your Archetype Report</div>
        <p className="text-sm opacity-80 mt-1">
          After completing, you’ll get a detailed personality report pulled from the
          <span className="font-medium"> Gita Archetypes behavioral database</span> — including:
        </p>
        <ul className="list-disc ml-6 mt-2 text-sm opacity-80 space-y-1">
          <li>Summary of your archetype</li>
          <li>Strengths & shadows</li>
          <li>Childhood drivers & cognitive biases</li>
          <li>Stress + relationship patterns</li>
          <li>Leadership style</li>
          <li>Key Bhagavad Gita verses</li>
        </ul>
        </div>
        </motion.div>

        {/* Arrow */}
        <div className="text-center text-2xl opacity-30">↓</div>

        {/* Step 5 */}
        <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex items-start space-x-4"
        >
        <div className="text-3xl">⑤</div>
        <div>
        <div className="font-semibold text-xl">7-Day Personalized Habit Plan</div>
        <p className="text-sm opacity-80 mt-1">
          Finally, we match your archetype with a curated, actionable
          <span className="font-medium"> 7-day growth plan</span> —
          behavioral, spiritual, and reflective exercises optimized for your type.
        </p>
        </div>
        </motion.div>
        </div>
        </motion.div>

        <header className="text-center mb-8">
          <motion.h1 initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl md:text-5xl">
            Gita Personality Assessment
          </motion.h1>
          <p className="mt-3 text-lg opacity-80 max-w-2xl mx-auto">
            Short hybrid-adaptive assessment — we balance depth with speed. The system shows a concise question and
            adapts the next one based on your responses.
          </p>
        </header>

        <section className="mb-8">
          <div className="bg-white/60 rounded-2xl p-6 md:p-8 shadow border border-yellow-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm opacity-70">Progress</div>
                <div className="font-medium text-lg">{progress} answered</div>
              </div>
              <div className="text-sm opacity-70">Adaptive • Max {maxQuestions} Qs</div>
            </div>

            {loading && <div className="py-8 text-center opacity-70">Loading questions…</div>}

            {!loading && !finished && current && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-4 text-sm opacity-60 flex items-center justify-between">
                  <div>Question</div>
                  <div className="text-xs text-yellow-700">Gita Framework</div>
                </div>

                <h2 className="text-xl md:text-2xl mb-6">{current.q.question_text}</h2>

                <div className="grid gap-3">
                  {current.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      className="text-left border rounded-lg p-3 hover:shadow transition flex items-center"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{opt.option_text}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 text-xs opacity-60">Tap an option to continue — the assessment adapts as you answer.</div>
              </motion.div>
            )}

            {!loading && !finished && !current && (
              <div className="py-8 text-center">
                <div className="mb-4">No more adaptive questions available.</div>
                <button onClick={() => finalizeAssessment()} className="bg-black text-white px-6 py-2 rounded">
                  Complete Assessment
                </button>
              </div>
            )}

            {finished && resultPercent && (
              <div className="py-6">
                <h3 className="text-2xl mb-2">Your Primary Archetype</h3>
                <div className="mb-4 text-lg font-semibold">{sortedArchetypes(scoreVector)[0][0]}</div>

                <p className="mb-4 opacity-80">Score breakdown</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ARCHETYPES.map((a) => (
                    <div key={a} className="p-3 bg-white border rounded text-center">
                      <div className="text-sm opacity-70">{a}</div>
                      <div className="text-xl font-bold mt-1">{resultPercent[a]}%</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      setFinished(false);
                      setAnswersMap({});
                      setAnsweredOrder([]);
                      setScoreVector(zeroVector());
                      setResultPercent(null);
                      const first = pickNextQuestion(questions);
                      setCurrent(first);
                    }}
                    className="mr-3 px-4 py-2 border rounded"
                  >
                    Retake
                  </button>

                  {/* If user is logged in, this will go to summary because finalizeAssessment already saved.
                      If not logged in, finalizeAssessment will show the inline auth section below. */}
                  <button
                    onClick={() => {
                      /* call finalizeAssessment again to ensure saved */
                      finalizeAssessment();
                    }}
                    className="px-4 py-2 bg-black text-white rounded"
                  >
                    Save & Continue
                  </button>
                </div>

                {/* Inline Auth Section (Option 3) - appears only when we need login to save */}
                {showAuthInline && (
                  <div className="mt-8 p-4 border rounded bg-white">
                    <h4 className="font-semibold mb-2">Sign in to save your assessment</h4>

                    {authStep === "email" && (
                      <form onSubmit={handleRequestOtp} className="space-y-3">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full px-3 py-2 border rounded"
                        />
                        <div className="flex items-center gap-3">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-amber-700 text-white rounded"
                          >
                            Send OTP
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // cancel auth, keep results visible
                              setShowAuthInline(false);
                              setPendingPayload(null);
                            }}
                            className="px-3 py-2 border rounded"
                          >
                            Maybe later
                          </button>
                        </div>
                        {authMessage && <div className="text-sm text-green-600">{authMessage}</div>}
                        {authError && <div className="text-sm text-red-600">{authError}</div>}
                      </form>
                    )}

                    {authStep === "otp" && (
                      <form onSubmit={handleVerifyOtp} className="space-y-3">
                        <input
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={authOtp}
                          onChange={(e) => setAuthOtp(e.target.value)}
                          className="w-full px-3 py-2 border rounded tracking-widest text-center"
                        />
                        <div className="flex items-center gap-3">
                          <button type="submit" className="px-4 py-2 bg-amber-700 text-white rounded">
                            Verify & Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // back to email step
                              setAuthStep("email");
                              setAuthOtp("");
                              setAuthMessage("");
                              setAuthError("");
                            }}
                            className="px-3 py-2 border rounded"
                          >
                            Change email
                          </button>
                        </div>
                        {authMessage && <div className="text-sm text-green-600">{authMessage}</div>}
                        {authError && <div className="text-sm text-red-600">{authError}</div>}
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <footer className="text-center opacity-80 mt-8">
          Built on the Gita Personality Framework — narrative psychology + practical habits.
        </footer>
      </div>
    </div>
  );
}

