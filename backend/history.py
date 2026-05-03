import logging
from typing import List
from langchain_core.messages import BaseMessage, messages_from_dict, messages_to_dict
from google.cloud import firestore

logger = logging.getLogger(__name__)

class FirestoreHistory:
    def __init__(self, session_id: str, collection: str = "chat_history"):
        self.session_id = session_id
        self.collection = collection
        # Don't gate on GOOGLE_APPLICATION_CREDENTIALS — on Cloud Run / App
        # Engine the library auto-discovers Application Default Credentials
        # without that env var, and gating on it would silently disable
        # history in production. Try to construct and fall back if it fails
        # (e.g., local dev with no credentials).
        try:
            self.db = firestore.Client()
        except Exception as exc:
            logger.warning("FirestoreHistory disabled: %s", exc)
            self.db = None

    def get_messages(self) -> List[BaseMessage]:
        if not self.db:
            return []

        doc_ref = self.db.collection(self.collection).document(self.session_id)
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            return messages_from_dict(data.get("messages", []))
        return []

    def set_messages(self, messages: List[BaseMessage]):
        if not self.db:
            return

        doc_ref = self.db.collection(self.collection).document(self.session_id)
        doc_ref.set({
            "messages": messages_to_dict(messages),
            "session_id": self.session_id
        })

def get_history(session_id: str) -> List[BaseMessage]:
    history = FirestoreHistory(session_id)
    return history.get_messages()

def save_history(session_id: str, messages: List[BaseMessage]):
    history = FirestoreHistory(session_id)
    history.set_messages(messages)
