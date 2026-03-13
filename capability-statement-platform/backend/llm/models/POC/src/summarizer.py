import re
import subprocess
from pathlib import Path


class LocalSummarizer:
    """
    Uses a bundled llama.cpp binary (recommended: bin/llama-completion) + local GGUF model (models/model.gguf).
    Runs fully offline.
    """

    def __init__(self, llama_bin: Path, model_path: Path):
        self.llama_bin = str(llama_bin)
        self.model_path = str(model_path)

    @staticmethod
    def _clean_llm_paragraph(text: str) -> str:
        """
        Post-process output to remove common meta/disclaimer spillover and keep a polished paragraph.
        """
        t = " ".join((text or "").strip().split())

        # If the model leaks meta commentary, truncate at the first occurrence.
        banned_phrases = [
            "note:",
            "please let me know",
            "not provided",
            "i had to",
            "i've followed",
            "as per the rules",
            "the original paragraph",
            "this meets your requirements",
            "(note:",
        ]
        lower = t.lower()
        cut = len(t)
        for ph in banned_phrases:
            idx = lower.find(ph)
            if idx != -1:
                cut = min(cut, idx)
        t = t[:cut].strip()
        # Remove bracketed end markers if they appear
        t = re.sub(r"\[\s*end\s*of\s*text\s*\]\s*$", "", t, flags=re.IGNORECASE).strip()
        t = re.sub(r"\[\s*end\s*of\s*text\s*\]", "", t, flags=re.IGNORECASE).strip()


        # Remove trailing dangling punctuation / parentheses
        t = re.sub(r"\s*\(\s*$", "", t)
        t = t.rstrip(" ,;:-")

        return t

    def summarize_one_paragraph(
        self,
        source_text: str,
        tone: str,
        instructions: str,
        max_words: int = 140,
    ) -> str:
        prompt = f"""
Write ONE polished paragraph for a client-facing document.

Constraints:
- Output ONLY the paragraph. No preface, no notes, no disclaimers, no meta-commentary, no quotes.
- Do NOT mention these instructions.
- Do NOT include concluding or summary phrases (e.g. “in short”, “we are trusted”, “our clients appreciate”).
- If information is missing, omit it silently.
- Keep the paragraph under {max_words} words.

Style:
{tone}

Task:
{instructions}

Source text:
{source_text}

Paragraph:
""".strip()

        # Use llama.cpp completion-style binary (e.g., llama-completion) with conversation disabled.
        # Note: Some binaries are chat-first; -no-cnv prevents interactive/conversation behavior.
        result = subprocess.run(
            [
                self.llama_bin,
                "-m",
                self.model_path,
                "-p",
                prompt,
                "-no-cnv",
                "--no-display-prompt",
                "--color",
                "off",
                "--verbosity",
                "1",
                "-n",
                "220",
                "--temp",
                "0.2",
                "--top-p",
                "0.9",
            ],
            capture_output=True,
            text=True,
            check=True,
        )

        # Prefer stdout; if stdout is empty, fall back to stderr (some builds log differently).
        raw = (result.stdout or "").strip()
        if not raw:
            raw = (result.stderr or "").strip()

        # Strip logs if present: keep the last chunk of non-empty lines, then clean.
        lines = [ln.strip() for ln in raw.splitlines() if ln.strip()]
        if not lines:
            return ""

        # Heuristic: last 8 lines tend to contain the completion even if logs appear above.
        candidate = " ".ndjoin(lines[-8:]) if False else " ".join(lines[-8:])

        return self._clean_llm_paragraph(candidate)
