import os
import re

from langchain_groq import ChatGroq
from langchain.tools import tool
from langchain_core.messages import HumanMessage, SystemMessage
from src.prompt_template import get_anime_prompt

# Used ONLY for call 1 (the model decides whether to search and what to search for)
ROUTER_PROMPT = (
    "You are an anime recommendation assistant. "
    "For any anime-related request, call retrieve_anime_tool with a short "
    "search query describing the genres, themes, or style wanted. "
    "If the request is not about anime, answer it directly."
)


def build_anime_retriever_tool(retriever):
    """
    Returns a langchain tool to retrieve anime information from the vector store.
    The model uses it in call 1 to decide the search query; the actual retrieval
    and filtering happen in AnimeRecommender._retrieve_context.
    """

    @tool
    def retrieve_anime_tool(query: str) -> str:
        """
        Use this tool to search the anime knowledge base.

        Always call this tool for anime-related questions such as
        recommendations, similarity search, genres, or plot summaries.

        input : - query : User's anime preference or question.
        output : - Relevant anime information retrieved from the vector database.
        """
        docs = retriever.invoke(query)
        return "\n\n".join(doc.page_content for doc in docs)

    return retrieve_anime_tool


# ---------- helpers for excluding the title the user mentioned ----------

def _doc_title(doc) -> str:
    m = re.search(r"Title:\s*(.*?)\s*Overview:", doc.page_content, re.S)
    return m.group(1).strip().lower() if m else ""


def _referenced_title(user_query: str) -> str:
    """Extracts 'naruto' from 'suggest anime like naruto' / 'similar to naruto'."""
    m = re.search(r"(?:like|similar to)\s+(.+?)[\s.?!]*$", user_query.strip(), re.I)
    return m.group(1).strip().lower() if m else ""


def _is_excluded(doc, user_query: str) -> bool:
    """True if the doc is the title the user mentioned (or a sequel/spin-off)."""
    title = _doc_title(doc)
    if not title:
        return False

    # exact title mentioned anywhere in the user's query (word boundaries)
    if re.search(r"\b" + re.escape(title) + r"\b", user_query.lower()):
        return True

    # catches sequels/spin-offs, e.g. "naruto: shippuden" when user said "naruto"
    ref = _referenced_title(user_query)
    if ref and ref in title:
        return True

    return False


class AnimeRecommender:
    def __init__(self, retriever, model_name: str):
        self.retriever = retriever

        # answer-style prompt, used for the final call
        self.prompt_template = get_anime_prompt()

        self.llm = ChatGroq(
            model=model_name,
            api_key=os.getenv("GROQ_API_KEY"),
            temperature=0,
        )

        self.anime_tool = build_anime_retriever_tool(self.retriever)
        self.chain_with_tool = self.llm.bind_tools([self.anime_tool])

    # ------------------------------------------------------------------
    def _retrieve_context(self, ai_msg, user_query: str) -> str:
        """
        Runs the retrieval the model asked for. Keeps the model's own search
        query (better semantic search) but removes the anime the user mentioned.
        Returns plain text context.
        """
        parts = []
        for tc in ai_msg.tool_calls:
            if tc["name"] != "retrieve_anime_tool":
                continue
            search_q = tc["args"].get("query") or user_query
            docs = self.retriever.invoke(search_q)

            kept = [d for d in docs if not _is_excluded(d, user_query)]
            docs = kept or docs  # never end up with zero docs

            parts.append("\n\n".join(d.page_content for d in docs))

        if not parts:  # safety net: model called an unknown tool
            docs = self.retriever.invoke(user_query)
            kept = [d for d in docs if not _is_excluded(d, user_query)]
            parts.append("\n\n".join(d.page_content for d in (kept or docs)))

        return "\n\n".join(parts)

    def _router_messages(self, query: str):
        return [
            SystemMessage(content=ROUTER_PROMPT),
            HumanMessage(content=query),
        ]

    def _final_messages(self, query: str, context: str):
        """Final call: no tool messages, retrieved text goes in as plain context."""
        return [
            SystemMessage(content=self.prompt_template.template),
            HumanMessage(
                content=(
                    f"User request: {query}\n\n"
                    f"Retrieved anime information:\n{context}"
                )
            ),
        ]

    # ------------------------------------------------------------------
    def get_recommendation(self, query: str) -> str:
        try:
            # Call 1: tools bound, model decides whether/what to search
            ai_msg = self.chain_with_tool.invoke(self._router_messages(query))

            if ai_msg.tool_calls:
                context = self._retrieve_context(ai_msg, query)

                # Call 2: plain LLM, plain-text context, no tool history
                response = self.llm.invoke(self._final_messages(query, context))
                return response.content

            return ai_msg.content
        except Exception as e:
            raise Exception(f"LLM recommendation failed : {e}")

    def get_recommendation_stream(self, query: str):
        try:
            ai_msg = self.chain_with_tool.invoke(self._router_messages(query))

            if ai_msg.tool_calls:
                context = self._retrieve_context(ai_msg, query)
                stream = self.llm.stream(self._final_messages(query, context))
            elif ai_msg.content:
                yield ai_msg.content
                return
            else:
                context = self._retrieve_context(ai_msg, query)
                stream = self.llm.stream(self._final_messages(query, context))

            for chunk in stream:
                content = chunk.content
                if isinstance(content, str):
                    if content:
                        yield content
                elif isinstance(content, list):
                    for part in content:
                        if isinstance(part, str):
                            yield part
                        elif isinstance(part, dict) and part.get("text"):
                            yield part["text"]
        except Exception as e:
            raise Exception(f"LLM streaming recommendation failed : {e}")