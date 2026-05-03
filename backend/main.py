import logging
from typing import Optional

from fastapi import FastAPI, HTTPException
from langchain_core.messages import HumanMessage
from pydantic import BaseModel

from .agent import app as agent_app
from .history import get_history, save_history

logger = logging.getLogger(__name__)
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
        history = get_history(request.session_id)
        current_messages = history + [HumanMessage(content=request.query)]
        state = {"messages": current_messages}
        result = agent_app.invoke(state)
        last_message = result["messages"][-1]
        save_history(request.session_id, result["messages"])
        return {
            "response": last_message.content,
            "session_id": request.session_id,
        }
    except Exception:
        # Log full traceback server-side; return generic message to client so
        # we don't leak file paths, env config, or stack frames.
        logger.exception("chat endpoint failed for session %s", request.session_id)
        raise HTTPException(status_code=500, detail="An internal error occurred.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
