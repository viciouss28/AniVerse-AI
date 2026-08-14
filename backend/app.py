import streamlit as st
from pipeline.pipeline import AnimeRecommenderPipeline
from dotenv import load_dotenv

st.set_page_config(page_title="Anime Recommender",layout="wide")

load_dotenv()

@st.cache_resource
def init_pipeline():
    return AnimeRecommenderPipeline()

pipeline = init_pipeline()

st.title("AI Anime Recommender")
st.write("LEts go manga")

query = st.text_input("Enter your anime preferences eg. : light hearted anime with school settings")
if query:
    with st.spinner("Fetching recommendations for you....."):
        response = pipeline.recommend(query)
        st.markdown("### Recommendations")
        st.write(response)