"use client";

import { useEffect, useState } from "react";

// -------------------------------
// Types
// -------------------------------
type ActivityRow = {
  id: number;
  title: string | null;
  url: string | null;
  analysis: string | null;
  created_at: string;
  task_type: string | null;
};

export default function FocusDashboard() {
  // ---------------------------------------------------------
  // 1. EXTENSION CONNECTION + STATE SYNC
  // ---------------------------------------------------------
  const [extConnected, setExtConnected] = useState(false);
  const [extActive, setExtActive] = useState(false);

  // Ping the extension once on load
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.data?.source === "focus-extension") {
        setExtConnected(true);
        if (event.data.state !== undefined) {
          setExtActive(event.data.state.focusActive);
        }
      }
    };

    window.addEventListener("message", listener);

    // Ask extension for its state
    window.postMessage({ command: "getExtensionState" }, "*");

    return () => window.removeEventListener("message", listener);
  }, []);

  // ---------------------------------------------------------
  // 2. ACTIVITY FETCHING
  // ---------------------------------------------------------
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchActivities() {
    try {
      const res = await fetch("/api/activities");
      const data = await res.json();
      if (data?.ok) {
        setActivities(data.activities || []);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchActivities();
    const intv = setInterval(fetchActivities, 7000);
    return () => clearInterval(intv);
  }, []);

  // ---------------------------------------------------------
  // 3. TASK TYPE SYNC WITH EXTENSION
  // ---------------------------------------------------------
  const taskTypes = [
    "Research – Exploration",
    "Research – Deep Dive",
    "Routine Work",
    "Study / Homework",
    "Writing / Notes",
    "Coding",
  ];

  const [taskType, setTaskType] = useState<string>(() => {
    if (typeof window === "undefined") return taskTypes[0];
    return localStorage.getItem("taskType") || taskTypes[0];
  });

  useEffect(() => {
    localStorage.setItem("taskType", taskType);
    window.postMessage({ command: "setTaskType", taskType }, "*");
  }, [taskType]);

  // ---------------------------------------------------------
  // 4. POMODORO TIMER + CONTROL EXTENSION
  // ---------------------------------------------------------
  const DEFAULT_WORK = 25 * 60;
  const DEFAULT_BREAK = 5 * 60;

  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_WORK;
    return Number(localStorage.getItem("secondsLeft") || DEFAULT_WORK);
  });

  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("isBreak") === "true";
  });

  // Persist timer state
  useEffect(() => {
    localStorage.setItem("secondsLeft", String(secondsLeft));
    localStorage.setItem("isBreak", String(isBreak));
  }, [secondsLeft, isBreak]);

  // Timer tick logic
  useEffect(() => {
    if (!isRunning) return;

    // Tell extension to start tracking
    window.postMessage({ command: "startFocus" }, "*");
    setExtActive(true);

    const interval = setInterval(() => {
      setSecondsLeft((sec) => {
        if (sec > 1) return sec - 1;

        // Switch to next session
        const next = isBreak ? DEFAULT_WORK : DEFAULT_BREAK;
        setIsBreak(!isBreak);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isBreak]);

  // Whenever timer pauses, stop extension tracking
  useEffect(() => {
    if (!isRunning) {
      window.postMessage({ command: "stopFocus" }, "*");
      setExtActive(false);
    }
  }, [isRunning]);

  function resetTimer() {
    setSecondsLeft(DEFAULT_WORK);
    setIsBreak(false);
    setIsRunning(false);
    window.postMessage({ command: "stopFocus" }, "*");
    setExtActive(false);
  }

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <main className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🧘 Focus Dashboard</h1>

        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            extConnected
              ? extActive
                ? "bg-green-200 text-green-700"
                : "bg-yellow-200 text-yellow-700"
              : "bg-red-200 text-red-700"
          }`}
        >
          {extConnected
            ? extActive
              ? "Extension Active"
              : "Extension Idle"
            : "Extension Not Connected"}
        </span>
      </div>

      {/* TIMER */}
      <section className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">⏳ Pomodoro Timer</h2>

        <div className="text-center mb-4">
          <p className="text-5xl font-bold">{formatTime(secondsLeft)}</p>
          <p className="text-gray-500 mt-1">
            {isBreak ? "Break Session" : "Work Session"}
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          {!isRunning ? (
            <button
              onClick={() => setIsRunning(true)}
              className="px-5 py-2 text-white bg-green-600 rounded-lg shadow"
            >
              ▶ Start
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(false)}
              className="px-5 py-2 text-white bg-yellow-500 rounded-lg shadow"
            >
              ⏸ Pause
            </button>
          )}

          <button
            onClick={resetTimer}
            className="px-5 py-2 bg-gray-300 rounded-lg shadow"
          >
            ↺ Reset
          </button>
        </div>
      </section>

      {/* TASK TYPE */}
      <section className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">📝 Task Type</h2>

        <div className="space-y-2">
          {taskTypes.map((t) => (
            <label key={t} className="flex items-center gap-2">
              <input
                type="radio"
                name="taskType"
                value={t}
                checked={taskType === t}
                onChange={() => setTaskType(t)}
              />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </section>

      {/* ACTIVITY LOG */}
      <h2 className="text-xl font-semibold mb-3">📊 Activity Log</h2>

      {loading ? (
        <p>Loading...</p>
      ) : activities.length === 0 ? (
        <p>No activity yet.</p>
      ) : (
        <div className="space-y-4">
          {activities.slice(0, 20).map((a) => (
            <div key={a.id} className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="font-semibold">{a.title ?? "(No title)"}</h3>
              <p className="text-gray-600 text-sm">
                {a.url ? new URL(a.url).hostname : ""}
              </p>
              <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                {a.analysis}
              </p>
              <p className="text-sm font-medium text-green-600">
                {a.task_type || "Unspecified"}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                {new Date(a.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
