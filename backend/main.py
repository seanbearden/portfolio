import os
from typing import List, Optional
from fastapi import FastAPI, Query
from pydantic import BaseModel
from backend.agent import app as agent_app
from langchain_core.messages import HumanMessage, AIMessage

app = FastAPI(title="Sean Bearden Portfolio Agent API")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    content: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, backend: Optional[str] = Query(None)):
    # Convert request messages to LangChain messages
    messages = []
    for msg in request.messages:
        if msg.role == "user":
            messages.append(HumanMessage(content=msg.content))
        else:
            messages.append(AIMessage(content=msg.content))

    if backend == "ae":
        # In a real scenario, this might call the Vertex AI Reasoning Engine endpoint
        # For this portfolio demo, we'll simulate the alternate path or
        # actually call the Reasoning Engine if configured.
        # For now, we use the same agent but could add specific AE headers/logging.
        print("Routing to Agent Engine (Simulated)")

    # Run the LangGraph agent
    result = await agent_app.ainvoke({"messages": messages})

    # Get the last message from the result
    last_message = result["messages"][-1]

    return ChatResponse(content=last_message.content)

@app.get("/api/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
