import os
from dotenv import load_dotenv

load_dotenv(verbose=True)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_NAME = "llama-3.3-70b-versatile"