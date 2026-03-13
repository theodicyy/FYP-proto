import json
from pathlib import Path

from docxtpl import DocxTemplate

from summarizer import LocalSummarizer


ROOT = Path(__file__).resolve().parents[1]


def load_spec(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def stringify_knowledge(knowledge_pool: dict, source_collections: list[str]) -> str:
    """
    Convert selected knowledge_pool collections into a single text blob
    for the LLM to summarize.
    """
    chunks: list[str] = []

    for name in source_collections:
        items = knowledge_pool.get(name, [])
        if not items:
            continue

        chunks.append(f"=== {name.upper()} ===")

        # Items may be list[dict] or list[str]; normalize
        for i, item in enumerate(items, start=1):
            if isinstance(item, dict):
                # Prefer a "source_text" field, else dump key fields.
                if "source_text" in item and item["source_text"]:
                    chunks.append(f"{i}. {item['source_text']}")
                else:
                    # Dump a compact representation
                    parts = []
                    for k in ["title", "client", "jurisdictions", "year", "practice_areas", "value", "summary", "text"]:
                        if k in item and item[k]:
                            parts.append(f"{k}: {item[k]}")
                    if parts:
                        chunks.append(f"{i}. " + " | ".join(parts))
                    else:
                        chunks.append(f"{i}. {json.dumps(item, ensure_ascii=False)}")
            else:
                chunks.append(f"{i}. {str(item)}")

        chunks.append("")  # spacing between collections

    return "\n".join(chunks).strip()


def build_context(spec: dict, summarizer: LocalSummarizer) -> dict:
    context: dict = {}

    # 1) Make document_context vars available in template (optional but useful)
    doc_ctx = spec.get("document_context", {})
    if isinstance(doc_ctx, dict):
        context.update(doc_ctx)

    # 2) Direct 1-to-1 variables resolved by UI
    resolved = spec.get("resolved_variables", {})
    if not isinstance(resolved, dict):
        raise ValueError("resolved_variables must be an object/dict in input.json")
    context.update(resolved)

    # 3) LLM-generated variables from knowledge_pool + generation_tasks
    knowledge_pool = spec.get("knowledge_pool", {})
    tasks = spec.get("generation_tasks", [])

    if tasks:
        if not isinstance(tasks, list):
            raise ValueError("generation_tasks must be a list in input.json")

        for task in tasks:
            template_var = task["template_variable"]
            source_cols = task.get("source_collections", [])
            instructions = task.get("instructions", "")
            tone = task.get("tone", "formal, professional, client-facing")
            max_sentences = int(task.get("max_sentences", 2))

            # Approx word budget: ~20–30 words per sentence in formal tone.
            # For 1–2 sentence summaries, 55 words is a good default.
            max_words = int(task.get("max_words", 55 if max_sentences <= 2 else 90))

            knowledge_text = stringify_knowledge(knowledge_pool, source_cols)

            if not knowledge_text:
                context[template_var] = ""
                continue

            context[template_var] = summarizer.summarize_one_paragraph(
                source_text=knowledge_text,
                tone=tone,
                instructions=instructions,
                max_words=max_words,
            )

    return context


def main():
    template_path = ROOT / "templates" / "template.docx"
    spec_path = ROOT / "data" / "input.json"
    model_path = ROOT / "models" / "model.gguf"

    # IMPORTANT: use llama-completion for automation
    llama_bin = ROOT / "bin" / "llama-completion"

    out_dir = ROOT / "out"
    out_dir.mkdir(exist_ok=True)
    output_path = out_dir / "output.docx"

    for label, p in [
        ("template.docx", template_path),
        ("input.json", spec_path),
        ("model.gguf", model_path),
        ("llama binary", llama_bin),
    ]:
        if not p.exists():
            raise FileNotFoundError(f"Missing {label}: {p}")

    spec = load_spec(spec_path)
    summarizer = LocalSummarizer(llama_bin=llama_bin, model_path=model_path)

    context = build_context(spec, summarizer)

    doc = DocxTemplate(str(template_path))
    doc.render(context)
    doc.save(str(output_path))

    print(f"✅ Generated: {output_path}")


if __name__ == "__main__":
    main()
