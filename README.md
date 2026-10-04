# AniVerse AI

An anime recommendation system. Give it an anime you liked and it suggests
similar ones. [One sentence on how: content-based / collaborative / hybrid.]

![screenshot](docs/screenshot.png)

## What it does

- Recommends anime based on [title / genres / user ratings]
- Streamlit web app for trying it out
- FastAPI backend if you want to use the recommendations in your own code

## How it works (short version)

I used [approach] because [honest reason, e.g. "the dataset has no user
ratings, so collaborative filtering wasn't an option"]. More detail in
[docs/architecture.md](docs/architecture.md).


##  Quick Start

### 1. Clone

```bash
git clone https://github.com/<your-username>/AniVerse-AI.git
cd "AniVerse AI"
```

### 2. Create Environment

```bash
python -m venv animeenv
```

Windows:

```bash
animeenv\Scripts\activate
```

Linux/macOS:

```bash
source animeenv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Create a `.env` file with your API keys.

```env
GROQ_API_KEY=your_api_key
LANGSMITH_API_KEY=your_api_key
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=AniVerse
```

### 5. Run

```bash
python -m streamlit run app.py
```

Open:

```text
http://localhost:8501
```

> 📖 **Detailed setup:** [`docs/setup.md`](docs/setup.md)

---

##  Documentation

| Document | Description |
|---|---|
| [`Architecture`](docs/architecture.md) | System architecture and component interactions |
| [`Setup`](docs/setup.md) | Installation and environment configuration |
| [`Pipeline`](docs/pipeline.md) | Recommendation and RAG pipeline |
| [`Evaluation`](docs/evaluation.md) | LangSmith evaluation and experiments |
| [`Configuration`](docs/configuration.md) | Models, environment variables, and settings |

---
## Project structure

| Folder | What's in it |
|---|---|
| `api/` | FastAPI app |
| `data_pipeline/` | Scripts that download and clean the data |
| `src/` | Core recommendation code |
| `experiments/` | Notebooks from trying different models |
| `docs/` | Architecture and design notes |
---
##  Example

**Input**

```text
I want an anime with a genius protagonist,
lots of mind games and unexpected twists.
```

**AniVerse**

```text
🔹 Recommendation 1
🔹 Recommendation 2
🔹 Recommendation 3
```

The recommendations are generated using retrieved anime context rather than relying purely on the LLM's internal knowledge.

---

##  Preview

<!-- Add screenshots/GIF here -->

![AniVerse](docs/screenshots/home.png)

---
## 👩‍💻 Author

**Rishika Kaur**


---

### 🎌 AniVerse AI

**Describe your vibe. Find your next anime.**
