"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function GitaFrameworkPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-serif pb-20">
      {/* ---------------- HEADER ---------------- */}
      <section className="px-6 md:px-20 pt-16 pb-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-6"
        >
          The Gita Personality Framework
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed opacity-80"
        >
          “उद्धरेदात्मनाऽत्मानं नात्मानमवसादयेत्” — *Uplift yourself by yourself; let not yourself
          fall.* (Bhagavad Gita 6.5)  
          <br />
          Self-knowledge is the beginning of mastery.  
        </motion.p>
      </section>

      {/* ---------------- VENN DIAGRAM SECTION ---------------- */}
      <section className="px-6 md:px-20 py-16 bg-gradient-to-b from-yellow-50 to-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          How the Gita Framework Complements Modern Psychology
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="rounded-2xl border p-6 text-center shadow-sm bg-white"
          >
            <h3 className="font-bold text-xl mb-3">Modern Models</h3>
            <p className="opacity-70 text-sm leading-relaxed">
              Big 5, MBTI, Enneagram — they map traits, cognitive preferences and motivations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border p-6 text-center shadow-sm bg-yellow-100/70"
          >
            <h3 className="font-bold text-xl mb-3">Gita Archetypes</h3>
            <p className="opacity-70 text-sm leading-relaxed">
              A narrative-psychology model rooted in Dharma, self-regulation, shadow integration,
              and conscious action.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="rounded-2xl border p-6 text-center shadow-sm bg-white"
          >
            <h3 className="font-bold text-xl mb-3">Unique USP</h3>
            <p className="opacity-70 text-sm leading-relaxed">
              Unlike modern models, the Gita adds moral reasoning, inner conflicts, karmic drivers,
              and actionable practice for transformation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ---------------- ARCHETYPES SECTION ---------------- */}
      <section className="px-6 md:px-20 py-16 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">The Seven Archetypes</h2>
        <p className="text-center opacity-70 max-w-2xl mx-auto mb-12">
        Each archetype includes strengths, shadows, childhood drivers, cognitive biases,
    leadership patterns, and a growth plan — making it more holistic than standard
    personality frameworks.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[
  {
    name: "Arjuna",
    summary:
      "The seeker of truth — courageous, reflective, duty-bound, yet prone to self-doubt before major decisions.",
  },
  {
    name: "Karna",
    summary:
      "The resilient striver — loyal, disciplined, driven by belonging, yet torn between duty and wounded pride.",
  },
  {
    name: "Krishna",
    summary:
      "The wise strategist — emotionally balanced, intuitive, purpose-led, able to guide without losing clarity.",
  },
  {
    name: "Yudhishthira",
    summary:
      "The principled stabilizer — rational, calm, justice-oriented, sometimes rigid or conflict-avoidant.",
  },
  {
    name: "Draupadi",
    summary:
      "The passionate catalyst — perceptive, assertive, truth-speaking, yet prone to emotional intensity.",
  },
  {
    name: "Bhishma",
    summary:
      "The dutiful guardian — protective, steady, sacrificial, but often attached to vows and tradition.",
  },
  {
    name: "Duryodhana",
    summary:
      "The competitive enforcer — bold, persistent, ambitious, yet driven by scarcity and envy.",
  },
].map(({ name, summary }) => (
  <Link key={name} href={`/archetypes/${name}`}>
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="p-6 border rounded-2xl shadow-sm bg-white hover:shadow-md cursor-pointer transition"
    >
      <h3 className="font-semibold text-xl mb-2">{name}</h3>
      <p className="text-sm opacity-70 leading-relaxed">
        {summary}
      </p>
    </motion.div>
  </Link>
))}

    </div>
    </section>


      {/* ---------------- ACTIONABLE SECTION ---------------- */}
      <section className="px-6 md:px-20 py-16 bg-yellow-50/50">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Why the Gita Framework Works
        </h2>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-6 rounded-xl border bg-white shadow-sm">
            <h4 className="font-semibold mb-2">1. Narrative Psychology</h4>
            <p className="opacity-70 text-sm">
              People understand themselves through stories. Archetypes provide story-based
              self-understanding.
            </p>
          </div>

          <div className="p-6 rounded-xl border bg-white shadow-sm">
            <h4 className="font-semibold mb-2">2. Trait + Shadow Integration</h4>
            <p className="opacity-70 text-sm">
              Other models focus on strengths or traits; the Gita adds *shadow patterns,
              attachments, biases, and Dharma misalignment*.
            </p>
          </div>

          <div className="p-6 rounded-xl border bg-white shadow-sm">
            <h4 className="font-semibold mb-2">3. Actionable Growth Plans</h4>
            <p className="opacity-70 text-sm">
              Each archetype comes with a ready 7-day micro-practice plan based on behavioral
              psychology, habit loops, and Gita-based self-regulation.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- REFERENCES ---------------- */}
      <section className="px-6 md:px-20 py-16 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Research Foundations</h2>
        <p className="opacity-80 text-sm max-w-2xl mx-auto text-center mb-8">
          The Gita Framework is inspired by contemporary psychology:
        </p>

        <div className="max-w-3xl mx-auto text-sm space-y-4 opacity-70">
          <p>• McAdams (Narrative Identity Theory)</p>
          <p>• Kahneman & Tversky (Cognitive Biases)</p>
          <p>• Carver & Scheier (Self-Regulation Theory)</p>
          <p>• Baumeister (Willpower & Ego-Depletion)</p>
          <p>• Acceptance & Commitment Therapy (ACT)</p>
          <p>• Gita’s framework of Gunas + Dharma + Viveka</p>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="text-center mt-16">
        <Link href="/gita-assessment">
          <button className="px-6 py-3 bg-black text-white rounded-lg shadow hover:bg-gray-800 transition">
            Take the Gita Personality Assessment →
          </button>
        </Link>
      </section>
    </div>
  );
}
