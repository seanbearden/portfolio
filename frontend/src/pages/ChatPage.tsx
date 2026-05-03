import { ChatInterface } from "@/components/chatbot/ChatInterface";

export function ChatPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">AI Resume Chatbot</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Ask questions about Sean's experience, skills, and publications.
        </p>
      </div>

      <ChatInterface />

      <div className="mt-12 p-6 rounded-xl border border-border bg-muted/20 text-sm text-muted-foreground">
        <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Safety & Guardrails
        </h2>
        <p>
          This agent is protected by production safety guardrails. We filter for prompt injections, PII (personal information), and off-topic requests.
          If a guardrail is triggered, you'll see a transparent notification explaining why.
          Daily usage is also capped by a cost ceiling to ensure sustainability.
        </p>
      </div>
    </div>
  );
}
