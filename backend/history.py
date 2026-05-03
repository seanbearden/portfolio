from typing import List
from langchain_core.messages import BaseMessage, messages_from_dict, messages_to_dict
from google.cloud import firestore
import os

class FirestoreHistory:
    def __init__(self, session_id: str, collection: str = "chat_history"):
        self.session_id = session_id
        self.collection = collection
        self.db = firestore.Client() if os.getenv("GOOGLE_APPLICATION_CREDENTIALS") else None

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
