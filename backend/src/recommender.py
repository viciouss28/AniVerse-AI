from langchain_groq import ChatGroq
from langchain.tools import tool
from langchain_core.messages import HumanMessage,SystemMessage
from src.prompt_template import get_anime_prompt
import os

def build_anime_retriever_tool(retriever):
    """
    Returns a langchain tool to retrieve anime information from the vector store.
    :param retriever:
    :return:
    """
    @tool
    def retrieve_anime_tool(query : str) -> str:
        """
            Use this tool to search the anime knowledge base.

            Always call this tool to search for anime-related questions such as: recommendation , similarity search, genres , or plot summaries.

            input : - query : User's anime preference or question.

            output : - Relevant anime information retrieved from the vector database.
            :param query:
            :return:
        """
        docs = retriever.invoke(query)

        return "\n\n".join(doc.page_content for doc in docs)
    return retrieve_anime_tool


class AnimeRecommender:
    def __init__(self,retriever,model_name : str):
        """
        Initializes the AnimeRecommender object with a retriever and LLM.
        :param retriever:
        :param model_name:
        """
        self.retriever = retriever

        # we use the prompt template text as a system message
        self.prompt_template = get_anime_prompt()

        self.llm = ChatGroq(model=model_name,
                            api_key=os.getenv("GROQ_API_KEY"),
                            temperature=0
                            )

        # Build the tool
        self.anime_tool = build_anime_retriever_tool(self.retriever)

        # Bind the tool to llm
        self.chain_with_tool = self.llm.bind_tools([self.anime_tool])

    def get_recommendation(self,query:str) -> str:
        """
        Generates anime recommendation based on a query using LLM + tool chain.
        :param query: str
        :return: str
        """

        try:
            # Construct messages with system instruction
            # We extract the template text to use as system prompt, ignoring variables
            # as the flow us slightly different from a standard chain

            system_instruction = self.prompt_template.template

            messages = [
                SystemMessage(content=system_instruction),
                HumanMessage(content=query)
            ]

            # Model decides tool usage
            ai_msg = self.chain_with_tool.invoke(messages)
            messages.append(ai_msg)

            # Execute tools if required
            if ai_msg.tool_calls:
                for tool_call in ai_msg.tool_calls:
                    if tool_call["name"] == "retrieve_anime_tool":
                        tool_result = self.anime_tool.invoke(tool_call)
                        messages.append(tool_result)

                response = self.chain_with_tool.invoke(messages)
                return response.content

            return ai_msg.content
        except Exception as e:
            raise Exception(f"LLM recommendation failed : {e}")

    def get_recommendation_stream(self, query: str):
        """
        Generates anime recommendation streaming token chunks based on a query using LLM + tool chain.
        :param query: str
        """
        try:
            system_instruction = self.prompt_template.template
            messages = [
                SystemMessage(content=system_instruction),
                HumanMessage(content=query)
            ]

            ai_msg = self.chain_with_tool.invoke(messages)
            messages.append(ai_msg)

            if ai_msg.tool_calls:
                for tool_call in ai_msg.tool_calls:
                    if tool_call["name"] == "retrieve_anime_tool":
                        tool_result = self.anime_tool.invoke(tool_call)
                        messages.append(tool_result)

                for chunk in self.chain_with_tool.stream(messages):
                    if hasattr(chunk, 'content') and chunk.content:
                        if isinstance(chunk.content, str):
                            yield chunk.content
                        elif isinstance(chunk.content, list):
                            for part in chunk.content:
                                if isinstance(part, str):
                                    yield part
                                elif isinstance(part, dict) and 'text' in part:
                                    yield part['text']
            else:
                if hasattr(ai_msg, 'content') and ai_msg.content:
                    yield ai_msg.content
                else:
                    for chunk in self.chain_with_tool.stream(messages):
                        if hasattr(chunk, 'content') and chunk.content:
                            if isinstance(chunk.content, str):
                                yield chunk.content
        except Exception as e:
            raise Exception(f"LLM streaming recommendation failed : {e}")



