import { EvaluationView } from "@/components/training/EvaluationView";

export default async function EvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EvaluationView sessionId={id} />;
}
