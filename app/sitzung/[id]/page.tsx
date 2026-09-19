import { ConversationView } from "@/components/training/ConversationView";
import { hasRealtimeKey } from "@/lib/openai-realtime";
import { whisperKey } from "@/lib/whisper";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ConversationView
      sessionId={id}
      whisperReady={Boolean(whisperKey())}
      liveVoice={hasRealtimeKey()}
    />
  );
}
