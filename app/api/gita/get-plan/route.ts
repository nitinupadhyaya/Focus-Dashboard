import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";
import type { Database } from "@/types/supabase";

export async function POST(req: Request) {
  const supabase = createRouteClient();
  const body = await req.json();
  const { planId } = body;

  // 🔐 validate session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Fetch plan by id
  const { data: plan, error } = await supabase
    .from("user_growth_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ plan });
}
