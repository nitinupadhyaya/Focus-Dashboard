"use client";

import { useRouter } from "next/navigation";

export default function PostAssessmentPage() {
  const router = useRouter();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Assessment Complete</h1>
      <p className="mb-6">
        We have computed your Gita archetype.  
        Next, select your current problem areas to generate a personal 7-day growth plan.
      </p>

      <button
        onClick={() => router.push("/post-assessment/summary")}
        className="px-4 py-2 bg-blue-600 text-white rounded shadow"
      >
        Continue
      </button>
    </div>
  );
}
