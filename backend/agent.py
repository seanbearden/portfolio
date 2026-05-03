import os
from typing import TypedDict, Annotated, List, Union
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_anthropic import ChatAnthropic
from .tools import search_blog, search_publications, list_projects, get_about, get_resume, get_cv, get_publication_pdf
from .prompt import SYSTEM_PROMPT

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], lambda x, y: x + y]

def get_model():
    provider = os.getenv("LLM_PROVIDER", "google").lower()
    if provider == "anthropic":
        return ChatAnthropic(model="claude-3-5-sonnet-20240620", temperature=0).bind_tools(tools)
    else:
        # Default to Gemini
        return ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0).bind_tools(tools)

tools = [search_blog, search_publications, list_projects, get_about, get_resume, get_cv, get_publication_pdf]
tool_node = ToolNode(tools)

def call_model(state: AgentState):
    messages = state['messages']
    # Ensure system prompt is at the start
    if not any(isinstance(m, SystemMessage) for m in messages):
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + messages

    model = get_model()
    response = model.invoke(messages)
    return {"messages": [response]}

def should_continue(state: AgentState):
    last_message = state['messages'][-1]
    if last_message.tool_calls:
        return "tools"
    return END

workflow = StateGraph(AgentState)

workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)

workflow.set_entry_point("agent")
workflow.add_conditional_edges("agent", should_continue)
workflow.add_edge("tools", "agent")

app = workflow.compile()
