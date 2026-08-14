from src.data_loader import AnimeDataLoader
from src.vector_store import VectorStoreBuilder
from dotenv import load_dotenv
from utils.logger import get_logger
from utils.custom_exceptions import CustomException

load_dotenv()

logger = get_logger(__name__)

def main():
    try:
        logger.info("Starting to build pipeline.......")

        loader = AnimeDataLoader("data/anime_with_sypnopsis.csv","data/anime_updated.csv")
        processed_csv = loader.load_and_process()

        logger.info("data loaded and processed successfully.....")

        vector_builder = VectorStoreBuilder(processed_csv)
        vector_builder.build_and_save_vectorstore()


        logger.info("Vector store built successfully.....")

        logger.info("Pipeline built successfully.......")
    except Exception as e:
        logger.error(f"Failed to execute pipeline. {e}")
        raise CustomException("Error during pipeline ", e)

if __name__ == "__main__":
    main()