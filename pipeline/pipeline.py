
from pathlib import Path

from src.vector_store import VectorStoreBuilder
from src.recommender import AnimeRecommender
from src.data_loader import AnimeDataLoader
from config.config import MODEL_NAME
from utils.logger import get_logger
from utils.custom_exceptions import CustomException

logger = get_logger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent


class AnimeRecommenderPipeline:
    def __init__(self):
        try:
            logger.info("Initializing Recommendation Pipeline...")

            original_csv = BASE_DIR / "data" / "anime_with_sypnopsis.csv"
            processed_csv = BASE_DIR / "artifacts" / "anime_updated.csv"

            processed_csv.parent.mkdir(parents=True, exist_ok=True)

            # Step 1: Process the original dataset
            data_loader = AnimeDataLoader(
                original_csv=str(original_csv),
                processed_csv_path=str(processed_csv),
            )
            processed_path = data_loader.load_and_process()

            # Step 2: Build/populate the vector store
            vector_builder = VectorStoreBuilder(
                csv_path=processed_path
            )

            # Step 3: Create the retriever
            retriever = vector_builder.get_retriever()

            # Step 4: Initialize the recommender
            self.recommender = AnimeRecommender(
                retriever=retriever,
                model_name=MODEL_NAME,
            )

            logger.info("Recommendation pipeline initialized.")

        except Exception as e:
            logger.exception("Failed to initialize Recommendation Pipeline")
            raise CustomException(
                f"Error during pipeline initialization: {e}"
            ) from e

    def recommend(self, query: str) -> str:
        try:
            logger.info(f"Received query: {query}")
            return self.recommender.get_recommendation(query)
        except Exception as e:
            logger.exception("Recommendation failed")
            raise CustomException(
                f"Error during recommendation: {e}"
            ) from e

    def recommend_stream(self, query: str):
        try:
            logger.info(f"Received streaming query: {query}")
            yield from self.recommender.get_recommendation_stream(query)
        except Exception as e:
            logger.exception("Streaming recommendation failed")
            raise CustomException(
                f"Error during recommendation stream: {e}"
            ) from e
