
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/routeClient";

export async function POST(req: Request) {
  const supabase = createRouteClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const computedArchetypeId = "Arjuna";

  const insertPayload = {
    user_id: userId,
    archetype_id: computedArchetypeId,
  };

  const { data, error } = await supabase
    .from("user_archetypes")
    .upsert([insertPayload], { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({ saved: data });
}
