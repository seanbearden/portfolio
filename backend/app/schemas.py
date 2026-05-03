from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str
    session_id: str

class ChatResponse(BaseModel):
    response: str
    safety_trigger: bool = False
    trigger_type: Optional[str] = None
    links: Optional[List[dict]] = None
