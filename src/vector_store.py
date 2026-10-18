import os

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_qdrant import QdrantVectorStore
from langchain_community.document_loaders.csv_loader import CSVLoader
from langchain_huggingface import HuggingFaceEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

class VectorStoreBuilder:

    def __init__(self, csv_path: str):
        self.csv_path = csv_path

        self.embedding = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
        )

        self.client = QdrantClient(
            url=os.getenv("QDRANT_URL", "http://localhost:6333"),
            api_key=os.getenv("QDRANT_API_KEY") or None,
        )

        self.collection_name = "Anime_Data"

        if not self.client.collection_exists(self.collection_name):
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=384,
                    distance=Distance.COSINE,
                ),
            )

        # Populate the collection only if it is empty.
        point_count = self.client.count(
            collection_name=self.collection_name,
            exact=True,
        ).count

        if point_count == 0 and self.csv_path:
            if not os.path.isfile(self.csv_path):
                raise FileNotFoundError(
                    f"Anime CSV dataset not found: {self.csv_path}"
                )

            self.build_and_save_vectorstore()

    def build_and_save_vectorstore(self):

        loader = CSVLoader(
            file_path=self.csv_path,
            encoding="utf-8",
        )

        documents = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=0,
        )

        split_docs = splitter.split_documents(documents)

        vectorstore = QdrantVectorStore(
            client=self.client,
            collection_name=self.collection_name,
            embedding=self.embedding,
            )

        vectorstore.add_documents(split_docs)



        return vectorstore

    def get_vectorstore(self):

        return QdrantVectorStore(
            client=self.client,
            collection_name=self.collection_name,
            embedding=self.embedding,
        )

    def get_retriever(self):
        vectorstore = self.get_vectorstore()

        retriever = vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={
                "k": 8
            }
        )

        return retriever