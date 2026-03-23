import re
import subprocess
import json
import time
from pathlib import Path


class LocalSummarizer:

    def __init__(self, llama_bin: Path, model_path: Path):
        self.llama_bin = str(llama_bin)
        self.model_path = str(model_path)

    # =====================================================
    # DEBUG LOGGER (SAFE)
    # =====================================================

    def _log(self, title, content, max_len=1500):
        print(f"\n[LLM DEBUG] ===== {title} =====", flush=True)

        try:
            if isinstance(content, (dict, list)):
                print(json.dumps(content, indent=2, ensure_ascii=False), flush=True)
            else:
                text = str(content)
                if len(text) > max_len:
                    print(text[:max_len] + "\n...[TRUNCATED]", flush=True)
                else:
                    print(text, flush=True)
        except Exception:
            print(content, flush=True)

    # =====================================================
    # CLEAN OUTPUT
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
    # EXTRACT OUTPUT
    # =====================================================

    @staticmethod
    def _extract_real_output(raw: str) -> str:

        filtered_lines = []
        for line in raw.splitlines():
            if "common_perf_print:" in line:
                continue
            if "llama_memory_breakdown_print:" in line:
                continue
            filtered_lines.append(line)

        cleaned = "\n".join(filtered_lines)

        markers = ["Output:", "Paragraph:"]

        for marker in markers:
            idx = cleaned.rfind(marker)
            if idx != -1:
                return cleaned[idx + len(marker):].strip()

        return cleaned.strip()

    # =====================================================
    # MAIN FUNCTION
    # =====================================================

    def summarize_one_paragraph(
        self,
        source_text: str,
        tone: str,
        instructions: str,
        max_words: int = 140,
    ) -> str:

        start_time = time.time()

        prompt = f"""
Write ONE polished paragraph for a client-facing document.

Constraints:
- Output ONLY the paragraph.
- No preface, no notes, no disclaimers.
- Do NOT mention these instructions.
- Keep under {max_words} words.

Style:
{tone}

Task:
{instructions}

Source text:
{source_text}

Output:
""".strip()

        # =====================================================
        # 🔥 INPUT LOGGING
        # =====================================================

        self._log("MODEL PATH", self.model_path)
        self._log("PROMPT LENGTH (CHARS)", len(prompt))

        approx_tokens = int(len(prompt) / 4)
        self._log("APPROX TOKEN COUNT", approx_tokens)

        self._log("INSTRUCTIONS", instructions)
        self._log("TONE", tone)
        self._log("MAX WORDS", max_words)
        self._log("SOURCE TEXT (TRUNCATED)", source_text)

        self._log("FULL PROMPT PREVIEW", prompt[:1200])

        # =====================================================
        # RUN MODEL
        # =====================================================

        process = subprocess.Popen(
            [
                self.llama_bin,
                "-m", self.model_path,
                "-p", prompt,
                "-no-cnv",
                "--no-warmup",
                "--no-perf",
                "-n", "512",
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

        duration = round(time.time() - start_time, 2)
        self._log("GENERATION TIME (seconds)", duration)

        if process.returncode != 0:
            raise RuntimeError(
                f"Llama process failed with exit code {process.returncode}"
            )

        raw = "".join(output_lines).strip()

        # =====================================================
        # RAW OUTPUT LOGGING
        # =====================================================

        self._log("RAW MODEL OUTPUT", raw)

        if not raw:
            self._log("ERROR", "No output received")
            return ""

        cleaned_raw = self._extract_real_output(raw)

        self._log("EXTRACTED OUTPUT", cleaned_raw)

        if not cleaned_raw:
            self._log("ERROR", "Empty after extraction")
            return ""

        cleaned_raw = cleaned_raw.strip()

        # =====================================================
        # JSON DETECTION
        # =====================================================

        if cleaned_raw.startswith("{") or cleaned_raw.startswith("["):
            try:
                parsed = json.loads(cleaned_raw)
                self._log("JSON OUTPUT VALIDATED", parsed)
                return cleaned_raw
            except Exception as e:
                self._log("JSON VALIDATION FAILED", str(e))

        # =====================================================
        # CLEANING
        # =====================================================

        cleaned_text = self._clean_llm_paragraph(cleaned_raw)

        self._log("FINAL CLEANED OUTPUT", cleaned_text)

        self._log("PIPELINE COMPLETE", "Returning final text to Node")

        return cleaned_text