from src.vector_store import VectorStoreBuilder
from src.recommender import AnimeRecommender
from config.config import MODEL_NAME
from utils.logger import get_logger
from utils.custom_exceptions import CustomException

logger = get_logger(__name__)

class AnimeRecommenderPipeline:
    def __init__(self):
        try:
            logger.info("Initializing Recommendation Pipeline.....")

            vector_builder = VectorStoreBuilder(csv_path="")

            retriever = vector_builder.get_retriever()

            self.recommender = AnimeRecommender(retriever=retriever,model_name=MODEL_NAME)

            logger.info("Recommendation pipeline initialized....")
        except Exception as e:
            logger.error(f"Failed to initialize Recommendation Pipeline: {e}")
            raise CustomException(f"Error during pipeline initialization: {e}")

    def recommend(self,query:str) -> str:
        try:
            logger.info(f"Recived query : {query}")
            return self.recommender.get_recommendation(query)

        except Exception as e:
            logger.error(f"Recommendation failed {str(e)}")
            raise CustomException(f"Error during recommendation ",e)

