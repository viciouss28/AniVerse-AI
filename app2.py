import json

import requests
import streamlit as st

API_BASE = "http://127.0.0.1:8000"

st.set_page_config(page_title="AniVerse", page_icon="🎌", layout="centered")
st.title("🎌 AniVerse")
st.caption("AI-powered anime recommendations")

# ---------------- Sidebar ----------------
with st.sidebar:
    st.header("Settings")
    api_base = st.text_input("API URL", value=API_BASE)
    use_stream = st.toggle("Stream response", value=True)

    st.divider()
    st.subheader("Try these")
    examples = [
        "Light hearted anime with school settings",
        "Suggest anime like Naruto",
        "Dark psychological thrillers",
        "5 romance anime with a happy ending",
    ]
    for ex in examples:
        if st.button(ex, use_container_width=True):
            st.session_state["pending_query"] = ex

    st.divider()
    if st.button("Clear chat", use_container_width=True):
        st.session_state["messages"] = []
        st.rerun()

    # Health check
    try:
        r = requests.get(f"{api_base}/", timeout=3)
        st.success("API is running" if r.ok else f"API error {r.status_code}")
    except requests.RequestException:
        st.error("Cannot reach API")


# ---------------- API helpers ----------------
def fetch_recommendation(query: str) -> str:
    """Non-streaming call to /api/recommendations."""
    resp = requests.post(
        f"{api_base}/api/recommendations",
        json={"query": query},
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()["recommendations"]


def stream_recommendation(query: str):
    """Streaming call to /api/recommendations/stream (SSE). Yields text chunks."""
    with requests.post(
        f"{api_base}/api/recommendations/stream",
        json={"query": query},
        stream=True,
        timeout=120,
    ) as resp:
        resp.raise_for_status()
        resp.encoding = "utf-8"
        for line in resp.iter_lines(decode_unicode=True):
            if not line or not line.startswith("data: "):
                continue
            event = json.loads(line[len("data: "):])
            if event["type"] == "chunk":
                yield event["content"]
            elif event["type"] == "error":
                raise RuntimeError(event.get("message", "Streaming error"))
            elif event["type"] == "done":
                break


# ---------------- Chat state ----------------
if "messages" not in st.session_state:
    st.session_state["messages"] = []

for msg in st.session_state["messages"]:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# ---------------- Input ----------------
user_query = st.chat_input("What kind of anime are you in the mood for?")
if "pending_query" in st.session_state:
    user_query = st.session_state.pop("pending_query")

if user_query:
    user_query = user_query.strip()
    st.session_state["messages"].append({"role": "user", "content": user_query})
    with st.chat_message("user"):
        st.markdown(user_query)

    with st.chat_message("assistant"):
        try:
            if use_stream:
                answer = st.write_stream(stream_recommendation(user_query))
            else:
                with st.spinner("Finding anime..."):
                    answer = fetch_recommendation(user_query)
                st.markdown(answer)
        except requests.RequestException as e:
            answer = f"⚠️ Could not reach the API: {e}"
            st.error(answer)
        except Exception as e:
            answer = f"⚠️ Something went wrong: {e}"
            st.error(answer)

    st.session_state["messages"].append({"role": "assistant", "content": answer})