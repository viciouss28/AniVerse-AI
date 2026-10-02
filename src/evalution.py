from dotenv import load_dotenv
load_dotenv()

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import re
import pandas as pd
from langsmith import Client, evaluate
from pipeline.pipeline import AnimeRecommenderPipeline


# 1. Initialize Pipeline

def get_pipeline_output(intput : dict):
    """
    Wrapper function for getting the pipeline output given an input dictionary
    :param intput:
    :return:
    """

    pipeline = AnimeRecommenderPipeline()
    query = intput.get('question')
    response = pipeline.recommend(query)
    return {'output': response}

# 2. Define Evaluators  , LLM AS A JUDGE  , METIRCS , RELEVANCY , FAITHFULLNESS

def llm_relevance_evaluator(run, example):
    """
    LLM-as-a-Judge: semantically grades the recommendation quality against
    a ground truth reference output and context.
    :param run:
    :param example:
    :return:
    """

    from langchain.chat_models import init_chat_model
    from langchain_core.messages import HumanMessage

    query = example.inputs.get("question", "")
    output = run.outputs.get("output", "")
    reference_output = example.outputs.get("expected_output", "")
    reference_context = example.outputs.get("context", "")

    judge_llm = init_chat_model("groq:qwen/qwen3.8-27b")

    prompt = f"""
                 You are an expert evaluator for an AI anime recommender.
    
                User Query: "{query}"
                AI Response: "{output}"
    
                Reference "Golden" Answer: "{reference_output}"
                Reference Context: "{reference_context}"
    
                Grading Criteria:
                1. Relevance (0-1): Does the AI response match the intent of the query and the quality of the reference answer?
                2. Faithfulness (0-1): Is the AI response consistent with the Reference Context provided? (No hallucinations)
    
                Provide your evaluation in JSON format:
                {{
                    "relevance_score": <float>,
                    "faithfulness_score": <float>,
                    "reasoning": "<brief_explanation>"
                }}
    """


    try:
        response = judge_llm.invoke([HumanMessage(content=prompt)])

        json_str = re.search(r'\{.*\}', response.content, re.DOTALL).group(0)

        import json

        data = json.loads(json_str)

        overall_score = (data.get("relevance_score", 0) + data.get("faithfulness_score", 0))/2

        return {
            "key" : "relevance",
            "score" : overall_score,
            "metadata" :{
                "relevance" : data.get("relevance_score", 0),
                "faithfulness" : data.get("faithfulness_score", 0),
                "reasoning" : data.get("reasoning", "")
            }
        }
    except Exception as e:
        return {
            "key" : "relevance",
            "score" : 0.0,
            "comment": f"Evaluation error: {str(e)}"
        }


# 3. Main evaluation Run

def run_evaluation():
    client = Client()
    dataset_name = "AniVerse Golden Dataset"
    csv_path = os.path.join("data", "anime_llm_evaluation_dataset.csv")


    if not os.path.isfile(csv_path):
        raise FileNotFoundError(f"{csv_path} does not exist")
        return

    df = pd.read_csv(csv_path)

    if not client.has_dataset(dataset_name=dataset_name):
        dataset = client.create_dataset(
            dataset_name=dataset_name,
            description="Golden Dataset for anime recommendation with reference output and context "
        )

        for _,row in df.iterrows():
            client.create_example(
                inputs={"question": row["input"]},
                outputs={
                    "expected_output": row["expected_output"],
                    "context": row["context"]
                },
                dataset_id=dataset.id
            )
        print(f"Created new dataset: {dataset_name} with {len(df)} examples.")
    else:
         print(f"Dataset '{dataset_name}' already exists. Using existing examples.")

    print(f"Starting evaluation on: {dataset_name}...")

    # Run evaluation
    results = evaluate(
        get_pipeline_output,
        data=dataset_name,
        evaluators=[llm_relevance_evaluator],
        experiment_prefix="golden-ref-v1",
        metadata={
            "judge_model": "groq:qwen/qwen3.8-27b",
            "version": "1.2.0"
        }
    )

    print("Evaluation complete!")
    print(f"Checkout the semantic scores at: {results.experiment_name}")


if __name__ == "__main__":
    try:
        run_evaluation()
    except Exception as e:
        print(f"Evaluation failed: {e}")