from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from .agent import app as agent_app
from .history import get_history, save_history
from langchain_core.messages import HumanMessage, AIMessage

app = FastAPI(title="Sean Bearden Portfolio Agent API")

class QueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = "anonymous"

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/chat")
async def chat(request: QueryRequest):
    try:
        # Load history
        history = get_history(request.session_id)

        # Add current message
        current_messages = history + [HumanMessage(content=request.query)]

        # Run agent
        state = {"messages": current_messages}
        result = agent_app.invoke(state)

        # Extract last message (response)
        last_message = result["messages"][-1]

        # Save updated history
        save_history(request.session_id, result["messages"])

        return {
            "response": last_message.content,
            "session_id": request.session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
