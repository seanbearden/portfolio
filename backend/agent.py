import os
import json
from typing import Annotated, TypedDict, List
from pathlib import Path

from langchain_google_vertexai import ChatVertexAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages

# Define the state for the agent
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]

def get_context():
    """Load context from content files."""
    root = Path(__file__).resolve().parent.parent
    content_path = root / "content"

    context = ""

    # Load home data
    home_file = content_path / "home.json"
    if home_file.exists():
        home_data = json.loads(home_file.read_text())
        context += f"Name: {home_data.get('hero', {}).get('name')}\n"
        context += f"Headline: {home_data.get('hero', {}).get('headline')}\n"
        context += f"About: {home_data.get('about')}\n"
        context += "Bio:\n" + "\n".join(home_data.get('bio', [])) + "\n\n"

        context += "Experience:\n"
        for exp in home_data.get('experience', []):
            context += f"- {exp.get('role')} at {exp.get('company')} ({exp.get('period')})\n"
            for highlight in exp.get('highlights', []):
                context += f"  - {highlight}\n"
        context += "\n"

    # Load portfolio data (simplified)
    portfolio_path = content_path / "portfolio"
    if portfolio_path.exists():
        context += "Selected Projects:\n"
        for p_file in sorted(portfolio_path.glob("*.md")):
            # Just read the first 500 chars of each project for context
            context += f"Project: {p_file.name}\n"
            context += p_file.read_text()[:500] + "...\n\n"

    return context

def create_agent():
    """Create the LangGraph agent."""
    llm = ChatVertexAI(model_name="gemini-1.5-flash")

    context = get_context()

    system_prompt = f"""You are a helpful AI assistant for Sean Bearden's portfolio website.
    You answer questions about Sean's professional background, research, and projects.

    Use the following context to answer questions:
    {context}

    If you don't know the answer, say you don't know, but encourage the user to reach out to Sean via LinkedIn.
    Be professional, concise, and friendly.
    """

    def call_model(state: AgentState):
        messages = [SystemMessage(content=system_prompt)] + state['messages']
        response = llm.invoke(messages)
        return {"messages": [response]}

    # Define the graph
    workflow = StateGraph(AgentState)
    workflow.add_node("agent", call_model)
    workflow.set_entry_point("agent")
    workflow.add_edge("agent", END)

    return workflow.compile()

# This is the graph instance
app = create_agent()
