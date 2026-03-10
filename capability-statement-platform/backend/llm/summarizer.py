import re
import subprocess
import json
from pathlib import Path


class LocalSummarizer:
    """
    Uses a bundled llama.cpp binary (e.g., bin/llama-completion.exe)
    + local GGUF model (models/model.gguf).
    Runs fully offline.
    """

    def __init__(self, llama_bin: Path, model_path: Path):
        self.llama_bin = str(llama_bin)
        self.model_path = str(model_path)

    # =====================================================
    # CLEAN PARAGRAPH OUTPUT
    # =====================================================

    @staticmethod
    def _clean_llm_paragraph(text: str) -> str:
        t = " ".join((text or "").strip().split())

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

        t = re.sub(r"\[\s*end\s*of\s*text\s*\]\s*$", "", t, flags=re.IGNORECASE)
        t = re.sub(r"\[\s*end\s*of\s*text\s*\]", "", t, flags=re.IGNORECASE)

        t = re.sub(r"\s*\(\s*$", "", t)
        t = t.rstrip(" ,;:-")

        return t.strip()

    # =====================================================
    # EXTRACT ONLY REAL MODEL OUTPUT
    # =====================================================

    @staticmethod
    def _extract_real_output(raw: str) -> str:
        """
        Extract ONLY the actual model output.
        Everything before 'Output:' or 'Paragraph:' is discarded.
        """

        # Remove obvious perf/memory logs first
        filtered_lines = []
        for line in raw.splitlines():
            if "common_perf_print:" in line:
                continue
            if "llama_memory_breakdown_print:" in line:
                continue
            filtered_lines.append(line)

        cleaned = "\n".join(filtered_lines)

        # 🔥 Extract from LAST occurrence of Output/Paragraph
        markers = ["Output:", "Paragraph:"]

        for marker in markers:
            idx = cleaned.rfind(marker)
            if idx != -1:
                return cleaned[idx + len(marker):].strip()

        # Fallback if markers not found
        return cleaned.strip()

    # =====================================================
    # MAIN GENERATION FUNCTION
    # =====================================================

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
- Do NOT include concluding or summary phrases.
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

        print("\n[LLM] Starting generation...")
        print(f"[LLM] Model: {self.model_path}")
        print(f"[LLM] Prompt length (chars): {len(prompt)}")

        process = subprocess.Popen(
            [
                self.llama_bin,
                "-m", self.model_path,
                "-p", prompt,
                "-no-cnv",
                "--no-warmup",
                "--no-perf",
                "-n", "200",
                "--temp", "0.2",
                "--top-p", "0.9",
                "--repeat-penalty", "1.1",
                "--ctx-size", "8192",
                "--threads", "16",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )

        output_lines = []

        for line in process.stdout:
            output_lines.append(line)

        process.wait()

        if process.returncode != 0:
            raise RuntimeError(
                f"Llama process failed with exit code {process.returncode}"
            )

        raw = "".join(output_lines).strip()

        if not raw:
            print("[LLM] No output received.\n")
            return ""

        # 🔥 Extract only the real output section
        cleaned_raw = self._extract_real_output(raw)

        if not cleaned_raw:
            print("[LLM] Output empty after extraction.\n")
            return ""

        cleaned_raw = cleaned_raw.strip()

        # =====================================================
        # JSON HANDLING
        # =====================================================

        if cleaned_raw.startswith("{") or cleaned_raw.startswith("["):
            try:
                json.loads(cleaned_raw)  # validate JSON
                print("[LLM] JSON output detected and validated.\n")
                print(cleaned_raw, "\n")
                return cleaned_raw
            except Exception as e:
                print("[LLM] JSON validation failed. Returning cleaned text.")
                print("Error:", e)

        # =====================================================
        # NORMAL PARAGRAPH HANDLING
        # =====================================================

        cleaned_text = self._clean_llm_paragraph(cleaned_raw)

        print("[LLM] Final returned text:\n")
        print(cleaned_text, "\n")
        print("[LLM] Generation complete.\n")

        return cleaned_text