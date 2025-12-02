"use client";

import { useState } from "react";
//import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createBrowserClient } from '@supabase/ssr'

import { Button } from "@/components/ui/button";
import { Inter } from "next/font/google";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

function getEmailInitials(email: string): string {
  const localPart = email.split("@")[0];
  const parts = localPart.split(/[\.\-_]+/);
  const initials = parts.map((p) => p[0]?.toUpperCase()).join("");
  return initials.slice(0, 2);
}

export default function AuthPage() {
  const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter a valid email.");
      return;
    }

    const { error: supabaseError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo:
          process.env.NEXT_PUBLIC_SITE_URL
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
            : "http://localhost:3000/auth/callback",
      },
    });

    if (supabaseError) {
      setError(supabaseError.message);
    } else {
      setStep("otp");
      setMessage("We’ve sent a 6-digit code to your email. Enter it below.");
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!otp) {
      setError("Please enter the code from your email.");
      return;
    }

    const { data, error: supabaseError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (supabaseError) {
      setError(supabaseError.message);
    } else if (data?.session) {
      const initials = getEmailInitials(email);

      await supabase.auth.updateUser({
        data: { full_name: initials },
      });

      router.push("/gita-assessment"); // session will now persist
    }
  };

  return (
    <main
      className={`${inter.className} min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-teal-50 px-6`}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Sign In to Your Emotional Portfolio
        </h1>

        {step === "email" && (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <Button type="submit" className="bg-teal-600 text-white rounded-xl py-3 hover:bg-teal-700">
              Send OTP
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400 tracking-widest text-center"
            />
            <Button type="submit" className="bg-teal-600 text-white rounded-xl py-3 hover:bg-teal-700">
              Verify OTP
            </Button>
          </form>
        )}

        {message && <p className="mt-4 text-green-600 text-center font-medium">{message}</p>}
        {error && <p className="mt-4 text-red-600 text-center font-medium">{error}</p>}
      </motion.div>
    </main>
  );
}
