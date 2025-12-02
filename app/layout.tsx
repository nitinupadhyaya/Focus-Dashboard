"use client";

import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import {
  Youtube,
  Linkedin,
  Facebook,
  Moon,
  Sun,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import "next-pwa/register";
import { ThemeProvider, useTheme } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

interface UserProfile {
  email?: string;
  user_metadata?: { full_name?: string };
}

function Header({
  user,
  onLogout,
}: {
  user: UserProfile | null;
  onLogout: () => void;
}) {
  const { theme, setTheme } = useTheme();

  function getInitials(): string {
    if (!user) return "";
    const name: string = user.user_metadata?.full_name || user.email || "";
    const words: string[] = name.trim().split(/\s+/);
    return (
      words
        .slice(0, 2)
        .map((w) => w.charAt(0).toUpperCase())
        .join("") || "?"
    );
  }

  return (
    <header className="w-full px-6 py-4 bg-white/70 dark:bg-gradient-to-r dark:from-[#0a0a0a]/90 dark:to-[#1a1a1a]/90 backdrop-blur-md shadow-sm transition-all duration-700 border-b border-gray-200/40 dark:border-gray-700/40 ">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/">
          <Image
            src="/RelationshipsLabLogo.png"
            alt="The Relationships Lab"
            width={150}
            height={150}
            className="rounded-2xl drop-shadow-sm hover:scale-[1.02] transition-transform duration-300"
          />
        </Link>
        
        <div className="flex items-center space-x-4">
          {/* 🌗 Dark Mode Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md bg-gray-100/70 dark:bg-[#222]/70 hover:bg-gray-200/90 dark:hover:bg-[#333] transition"
            aria-label="Toggle Dark Mode"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700" />
            )}
          </button>

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold select-none shadow-inner">
                {getInitials()}
              </div>
              <div className="text-gray-700 dark:text-gray-200 font-semibold">
                {user.email}
              </div>
              <button
                onClick={onLogout}
                className="ml-4 px-3 py-1 rounded bg-gray-100/70 dark:bg-[#222]/70 hover:bg-gray-200/90 dark:hover:bg-[#333] text-gray-700 dark:text-gray-200 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔐 Handle user session
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    }
    getUser();

    const { data: subscriptionData } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscriptionData.subscription.unsubscribe();
    };
  }, []);

  // 🎵 Handle background music
  useEffect(() => {
    const audio = new Audio("/audio/IkOnkar.mp3");
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    const fadeIn = setInterval(() => {
      if (audio.volume < 0.25) {
        audio.volume += 0.01;
      } else {
        clearInterval(fadeIn);
      }
    }, 200);

    if (isPlaying) {
      audio.play().catch(() => console.log("Autoplay blocked by browser."));
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [isPlaying]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      const fadeOut = setInterval(() => {
        if (audioRef.current!.volume > 0.01) {
          audioRef.current!.volume -= 0.01;
        } else {
          clearInterval(fadeOut);
          audioRef.current!.pause();
        }
      }, 100);
    } else {
      audioRef.current!.play();
      audioRef.current!.volume = 0;
      const fadeIn = setInterval(() => {
        if (audioRef.current!.volume < 0.25) {
          audioRef.current!.volume += 0.01;
        } else {
          clearInterval(fadeIn);
        }
      }, 100);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen flex flex-col transition-all duration-700 
        bg-light-gradient dark:bg-gradient-to-b dark:from-[#050505] dark:via-[#0a0a0a] dark:to-[#1a1a1a] 
        text-gray-900 dark:text-gray-100`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Header user={user} onLogout={handleLogout} />

          {/* 🎧 Floating Music Control */}
          <button
            onClick={toggleMusic}
            className="fixed bottom-6 right-6 bg-white/70 dark:bg-[#222]/70 backdrop-blur-lg p-3 rounded-full shadow-lg hover:bg-white/90 dark:hover:bg-[#333] transition z-50 border border-gray-200/40 dark:border-gray-700/40"
            aria-label="Toggle Background Music"
          >
            {isPlaying ? (
              <Volume2 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            ) : (
              <VolumeX className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* 🌸 Main Content */}
          <main className="flex-1 flex justify-center items-start px-4 py-10 bg-white/70 dark:bg-[#121212]/70 backdrop-blur-lg rounded-t-3xl shadow-inner transition-all duration-700">
            <div className="w-full max-w-6xl">{children}</div>
          </main>

          {/* 🌷 Footer */}
          <footer className="w-full bg-white/70 dark:bg-gradient-to-r dark:from-[#0a0a0a]/90 dark:to-[#1a1a1a]/90 backdrop-blur-md border-t border-gray-200/40 dark:border-gray-700/40 transition-colors duration-700">
            <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
                  The Relationships Lab
                </h2>
                <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
                  Building stronger emotional bonds, one nudge at a time.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  WhatsApp Us: +919540964715
                </p>
                <div className="flex space-x-4">
                  <a
                    href="https://www.youtube.com/@TheRelationshipsLabs"
                    target="_blank"
                    className="text-gray-600 dark:text-gray-400 hover:text-teal-400 transition"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/therelationshipslab/"
                    target="_blank"
                    className="text-gray-600 dark:text-gray-400 hover:text-teal-400 transition"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.facebook.com/TheRelationshipsLab"
                    target="_blank"
                    className="text-gray-600 dark:text-gray-400 hover:text-teal-400 transition"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <a href="/about" className="hover:text-teal-500 block">
                    About Us
                  </a>
                  <a href="/careers" className="hover:text-teal-500 block">
                    Careers
                  </a>
                  <a href="/privacy" className="hover:text-teal-500 block">
                    Privacy Policy
                  </a>
                </div>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <a href="/terms" className="hover:text-teal-500 block">
                    Terms of Service
                  </a>
                  <a href="/contact" className="hover:text-teal-500 block">
                    Contact
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200/40 dark:border-gray-700/40 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} The Relationships Lab · All rights reserved.
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}

