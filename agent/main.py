from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio

app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/api/chat")
async def chat():
    async def event_generator():
        yield "data: Agent stub initialized. Retrieval and LangGraph coming in #153 and #154.\n\n"
        await asyncio.sleep(1)
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
