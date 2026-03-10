from fastapi import FastAPI
from pydantic import BaseModel
from pathlib import Path
import json

from summarizer import LocalSummarizer

ROOT = Path(__file__).resolve().parent
model_path = ROOT / "models" / "model.gguf"
llama_bin = ROOT / "bin" / "llama-completion.exe"

summarizer = LocalSummarizer(llama_bin=llama_bin, model_path=model_path)

app = FastAPI()


class LLMTask(BaseModel):
    template_variable: str
    prompt: str
    input_data: dict


class LLMRequest(BaseModel):
    knowledge_pool: dict
    tasks: list[LLMTask]


@app.post("/generate")
def generate(req: LLMRequest):

    results = []

    for task in req.tasks:

        # Combine knowledge pool + specific input data
        combined_context = {
            "knowledge_pool": req.knowledge_pool,
            "relevant_data": task.input_data
        }

        full_prompt = f"""
{task.prompt}

Relevant Data JSON:
{json.dumps(combined_context, ensure_ascii=False)}

Output:
""".strip()

        response = summarizer.summarize_one_paragraph(
            source_text=full_prompt,
            tone="formal, professional",
            instructions="Follow the instructions above exactly.",
            max_words=120
        )

        results.append({
            "template_variable": task.template_variable,
            "response": response
        })

    return {
        "results": results
    }