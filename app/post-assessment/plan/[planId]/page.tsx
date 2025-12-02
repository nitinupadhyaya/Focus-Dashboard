import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/serverClient";

export default async function PlanViewPage({
  params,
}: {
  params: { planId: string };
}) {
  const supabase = createServerClient();

  const { data: planRow, error } = await supabase
    .from("user_growth_plans")
    .select("*")
    .eq("id", params.planId)
    .maybeSingle();

  if (error || !planRow) return notFound();

  let planContent = planRow.plan;
  try {
    if (typeof planContent === "string") {
      planContent = JSON.parse(planContent);
    }
  } catch {}

  return (
    <pre className="bg-gray-100 p-4 text-sm whitespace-pre-wrap">
      {JSON.stringify(planContent, null, 2)}
    </pre>
  );
}


