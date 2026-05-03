import functools
import os
from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import BaseMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_anthropic import ChatAnthropic
from .tools import search_blog, search_publications, list_projects, get_about, get_resume, get_cv, get_publication_pdf
from .prompt import SYSTEM_PROMPT
from .otel import agent_step_span, llm_span


def _provider_and_model() -> tuple[str, str]:
    """Read the LLM provider/model env config once for span attributes.
    Mirrors the dispatch in get_model() so the labels can't drift."""
    provider = os.getenv("LLM_PROVIDER", "google").lower()
    if provider == "anthropic":
        return ("anthropic", "claude-3-5-sonnet-20240620")
    return ("google", "gemini-1.5-pro")


class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], lambda x, y: x + y]

# Cache the model so we don't re-instantiate on every LangGraph step. The
# tool list is static, env-driven config (LLM_PROVIDER) is read once.
@functools.lru_cache(maxsize=1)
def get_model():
    provider = os.getenv("LLM_PROVIDER", "google").lower()
    if provider == "anthropic":
        return ChatAnthropic(model="claude-3-5-sonnet-20240620", temperature=0).bind_tools(tools)
    return ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0).bind_tools(tools)

tools = [search_blog, search_publications, list_projects, get_about, get_resume, get_cv, get_publication_pdf]
tool_node = ToolNode(tools)

def call_model(state: AgentState):
    messages = state['messages']
    # Ensure system prompt is at the start
    if not any(isinstance(m, SystemMessage) for m in messages):
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + messages

    provider, request_model = _provider_and_model()
    with agent_step_span("call_model"):
        with llm_span(system=provider, request_model=request_model) as span:
            model = get_model()
            response = model.invoke(messages)
            # GenAI semconv usage attrs — mirrors what F500 ML platform
            # teams collect. usage_metadata is langchain's normalized shape.
            usage = getattr(response, "usage_metadata", None) or {}
            if "input_tokens" in usage:
                span.set_attribute("gen_ai.usage.input_tokens", usage["input_tokens"])
            if "output_tokens" in usage:
                span.set_attribute("gen_ai.usage.output_tokens", usage["output_tokens"])
            if "total_tokens" in usage:
                span.set_attribute("gen_ai.usage.total_tokens", usage["total_tokens"])
            # Mark whether the response is a tool call so downstream queries
            # can split "agent step that decided to call a tool" from
            # "agent step that produced final output".
            tool_calls = getattr(response, "tool_calls", None) or []
            span.set_attribute("gen_ai.response.has_tool_calls", bool(tool_calls))
            span.set_attribute("gen_ai.response.tool_call_count", len(tool_calls))
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
