import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import type { Database } from "@/types/supabase";

export async function POST(req: Request) {
const supabase = createRouteClient();
const body = await req.json();
const { problemAreaIds } = body;

const { data: { session } } = await supabase.auth.getSession();

if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const userId = session.user.id;

// Clear old
await supabase.from("user_problem_areas").delete().eq("user_id", userId);

// Insert new
const inserts = problemAreaIds.map((id: string) => ({ user_id: userId, problem_area_id: id }));
await supabase.from("user_problem_areas").insert(inserts);

return NextResponse.json({ success: true });
}