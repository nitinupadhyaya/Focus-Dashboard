"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Inter } from "next/font/google";
import { MandalaAnimation } from "./MandalaAnimation";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className={`${inter.className} bg-white text-gray-900`}>
      
      {/* ============================== */}
      {/* HERO SECTION */}
      {/* ============================== */}

      <section className="flex flex-col items-center text-center px-6 py-28 space-y-8 bg-gradient-to-b from-white to-amber-50">
        
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold text-gray-700 leading-tight"
        >
          Discover Your Inner <span className="text-amber-700">Archetype</span>  
          <br />
          through the Wisdom of Indian Knowledge Systems
        </motion.h1>

        <motion.p
    initial={{ opacity: 0, y: 25 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    className="text-lg md:text-xl text-gray-700 max-w-1xl"
  >
  <span>Our unique framework fuses traditional Indian wisdom with Modern Psychology.</span>
  <span className="block">Work with us to transform your patterns, relationships, and find purpose with timeless clarity.</span>
  </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="flex gap-4 flex-wrap justify-center"
        >
          <Link href="/gita-assessment">
            <button className="bg-amber-700 text-white px-6 py-3 rounded-xl shadow-md hover:bg-amber-800 transition">
              Take the Gita Assessment (Free)
            </button>
          </Link>

          <Link href="/gita-framework">
            <button className="border-amber-700 border px-6 py-3 rounded-xl text-amber-700 hover:bg-amber-100 transition">
              Explore the Framework
            </button>
          </Link>

          <Link href="/blog">
            <button className="border-amber-700 border px-6 py-3 rounded-xl text-amber-700 hover:bg-amber-100 transition">
              Read our blogs
            </button>
          </Link>

        </motion.div>
      </section>

            {/* ============================== */}
      {/* MANDALA ANIMATION */}
      {/* ============================== */}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
        viewport={{ once: true }}
        className="mt-12 flex justify-center"
      >
        <svg width="420" height="420" viewBox="0 0 420 420">
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#facc15" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Glowing background */}
          <circle cx="210" cy="210" r="160" fill="url(#glow)" />

          {/* Rotating mandala lines */}
          <g transform="translate(210,210)">
            {[...Array(12)].map((_, i) => (
              <line
                key={i}
                x1="0"
                y1="-150"
                x2="0"
                y2="-180"
                stroke="#b45309"
                strokeWidth="3"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0`}
                  to={`360`}
                  dur={`${10 + i}s`}
                  repeatCount="indefinite"
                />
              </line>
            ))}
          </g>

          {/* Center circle */}
          <circle cx="210" cy="210" r="40" fill="#b45309" opacity="0.8" />
        </svg>
      </motion.div>

      {/* IMPROVED MANDALA ANIMATION */}
      {/* <MandalaAnimation /> */}


      {/* ============================== */}
      {/* HOW IT WORKS (NEW MODEL) */}
      {/* ============================== */}

      <section className="max-w-4xl mx-auto px-6 py-24 space-y-16">
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center text-gray-700"
        >
          How the Gita Personality System Works
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-12 text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-8 bg-white rounded-xl shadow-lg border"
          >
            <h3 className="text-xl font-semibold text-amber-700 mb-3">1. Assess</h3>
            <p className="text-gray-600">
              Take a 7-minute assessment based on emotional patterns, stress responses, 
              decision-making, and relational habits.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-8 bg-white rounded-xl shadow-lg border"
          >
            <h3 className="text-xl font-semibold text-amber-700 mb-3">2. Discover</h3>
            <p className="text-gray-600">
              Explore your Gita archetype — strengths, shadows, childhood drivers, and biases.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-8 bg-white rounded-xl shadow-lg border"
          >
            <h3 className="text-xl font-semibold text-amber-700 mb-3">3. Transform</h3>
            <p className="text-gray-600">
              Receive a personalized 7-day micro-habit plan to shift your state and unlock growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================== */}
      {/* FRAMEWORK IMAGE (YOUR CHOICE) */}
      {/* ============================== */}

      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <Image
            src="/portfolio-preview.png"
            width={500}
            height={400}
            alt="Gita Personality Framework"
            className="rounded-2xl shadow-lg"
          />
          <div>
            <h2 className="text-3xl font-bold mb-4 text-gray-700">
              A Framework Rooted in Eternal Wisdom
            </h2>
            <p className="text-gray-600 mb-6">
              The Gita personality model blends archetypes, cognitive patterns, and dharmic 
              psychology to form a holistic understanding of the Self.
            </p>
            <Link href="/gita-framework">
              <button className="bg-amber-700 text-white px-6 py-3 rounded-xl hover:bg-amber-800">
                Learn the 7 Archetypes
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* TESTIMONIALS (KEEP FOR TRUST) */}
      {/* ============================== */}

      <section className="px-6 py-20 bg-amber-50">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-700">
          What People Are Saying
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              quote:
                "This system helped me understand my internal patterns better than any Western framework.",
              name: "Aarav, 31",
            },
            {
              quote:
                "The 7-day plan gave me real clarity — it’s simple but transformative.",
              name: "Megha, 27",
            },
            {
              quote:
                "Feels both ancient and modern. Beautifully done.",
              name: "Rohit, 42",
            },
          ].map((t, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border shadow-sm text-center hover:shadow-md transition"
            >
              <p className="italic text-gray-700 mb-4">“{t.quote}”</p>
              <h4 className="font-semibold text-gray-900">{t.name}</h4>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}


