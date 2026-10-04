# AniVerse AI — Architecture

AniVerse is a **RAG-based anime recommendation system** that combines semantic search with an LLM to generate relevant recommendations.

## Architecture

```text
                         👤 User
                           │
                           ▼
                    ┌──────────────┐
                    │  Streamlit   │
                    │      UI      │
                    └──────┬───────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ Recommendation    │
                 │    Pipeline       │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ Hugging Face      │
                 │    Embeddings     │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │      Qdrant       │
                 │   Vector Search   │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ Retrieved Anime   │
                 │     Context       │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │       LLM         │
                 │  Recommendation   │
                 └─────────┬─────────┘
                           │
                           ▼
                    💬 Response
```

## How It Works

1. **User Query** — The user describes the anime they want in natural language.
2. **Embedding** — The query is converted into a vector using `BAAI/bge-base-en-v1.5`.
3. **Retrieval** — Qdrant performs semantic similarity search against the anime dataset.
4. **Context** — Relevant anime information is retrieved and passed to the LLM.
5. **Generation** — The LLM generates the final recommendation.
6. **Response** — The result is displayed through Streamlit.

## Core Components

| Component | Purpose |
|---|---|
| **Streamlit** | User interface |
| **LangChain** | Pipeline & LLM orchestration |
| **Hugging Face** | Text embeddings |
| **Qdrant** | Vector storage & similarity search |
| **LLM** | Recommendation generation |
| **LangSmith** | Tracing & evaluation |

## RAG Flow

```text
User Query
    ↓
Embedding
    ↓
Qdrant Search
    ↓
Relevant Anime
    ↓
LLM + Context
    ↓
Recommendation
```

For detailed information, see:

- [`pipeline.md`](pipeline.md) — Recommendation pipeline
- [`setup.md`](setup.md) — Setup & installation
- [`evaluation.md`](evaluation.md) — Evaluation
- [`configuration.md`](configuration.md) — Configuration