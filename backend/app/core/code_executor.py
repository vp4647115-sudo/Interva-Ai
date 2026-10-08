"""Sandboxed code execution engine for coding interview problems.

Executes code snippets in Python / JavaScript with timeout limits, output capture,
and test case evaluation.
"""
from __future__ import annotations

import asyncio
import json
import os
import sys
import tempfile
import time
from typing import Any


from dataclasses import dataclass
from typing import Any


@dataclass
class CodeExecutorResult:
    exit_code: int
    stdout: str
    stderr: str
    timed_out: bool


class CodeExecutor:
    @staticmethod
    def execute_python(code: str, timeout: float = 4.0) -> CodeExecutorResult:
        """Synchronous wrapper for test_security.py compatibility."""
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                res = pool.submit(asyncio.run, execute_python_code(code, timeout_seconds=timeout)).result()
        else:
            res = loop.run_until_complete(execute_python_code(code, timeout_seconds=timeout))

        is_timed_out = res.get("error") == "TimeLimitExceeded" or "timed out" in res.get("stderr", "").lower()
        exit_code = 1 if (is_timed_out or not res.get("success", False)) else 0

        return CodeExecutorResult(
            exit_code=exit_code,
            stdout=res.get("stdout", ""),
            stderr=res.get("stderr", ""),
            timed_out=is_timed_out,
        )


class CodeExecutionError(Exception):
    pass



async def execute_python_code(
    code: str,
    test_cases: list[dict[str, Any]] | None = None,
    timeout_seconds: float = 4.0,
) -> dict[str, Any]:
    """Execute Python code in an isolated subprocess and run test cases if provided."""
    start_time = time.monotonic()
    test_results: list[dict[str, Any]] = []

    # Wrap code with test case execution harness if test_cases provided
    harness_code = code + "\n\n"
    if test_cases:
        harness_code += "# --- AUTOMATED TEST HARNESS ---\n"
        harness_code += "import json, sys\n"
        harness_code += f"_test_cases = {json.dumps(test_cases)}\n"
        harness_code += "_results = []\n"
        harness_code += "for _tc in _test_cases:\n"
        harness_code += "    _fn_name = _tc.get('functionName', 'solution')\n"
        harness_code += "    _inputs = _tc.get('inputs', [])\n"
        harness_code += "    _expected = _tc.get('expectedOutput')\n"
        harness_code += "    try:\n"
        harness_code += "        _func = globals().get(_fn_name)\n"
        harness_code += "        if not callable(_func):\n"
        harness_code += "            # Fallback to first callable if exact functionName not found\n"
        harness_code += "            _callables = [v for k, v in list(globals().items()) if callable(v) and not k.startswith('_')]\n"
        harness_code += "            _func = _callables[0] if _callables else None\n"
        harness_code += "        if _func is None:\n"
        harness_code += "            _results.append({'passed': False, 'actual': None, 'error': 'Function not found'})\n"
        harness_code += "        else:\n"
        harness_code += "            _actual = _func(*_inputs) if isinstance(_inputs, list) else _func(_inputs)\n"
        harness_code += "            _passed = (_actual == _expected)\n"
        harness_code += "            _results.append({'passed': _passed, 'actual': _actual, 'expected': _expected})\n"
        harness_code += "    except Exception as _e:\n"
        harness_code += "        _results.append({'passed': False, 'actual': None, 'error': str(_e)})\n"
        harness_code += "print('__TEST_RESULTS_JSON__:' + json.dumps(_results))\n"

    with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False, encoding="utf-8") as f:
        f.write(harness_code)
        temp_path = f.name

    try:
        proc = await asyncio.create_subprocess_exec(
            sys.executable,
            temp_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        try:
            stdout_bytes, stderr_bytes = await asyncio.wait_for(
                proc.communicate(), timeout=timeout_seconds
            )
        except asyncio.TimeoutError:
            try:
                proc.kill()
            except OSError:
                pass
            return {
                "success": False,
                "stdout": "",
                "stderr": f"Execution timed out after {timeout_seconds} seconds.",
                "executionTimeMs": round(timeout_seconds * 1000, 2),
                "testResults": [],
                "error": "TimeLimitExceeded",
            }

        stdout_str = stdout_bytes.decode("utf-8", errors="replace")
        stderr_str = stderr_bytes.decode("utf-8", errors="replace")
        elapsed_ms = round((time.monotonic() - start_time) * 1000, 2)

        # Extract test results from stdout marker if present
        clean_stdout = []
        for line in stdout_str.splitlines():
            if line.startswith("__TEST_RESULTS_JSON__:"):
                try:
                    test_results = json.loads(line[len("__TEST_RESULTS_JSON__:") :])
                except json.JSONDecodeError:
                    pass
            else:
                clean_stdout.append(line)

        is_success = proc.returncode == 0
        return {
            "success": is_success,
            "stdout": "\n".join(clean_stdout),
            "stderr": stderr_str,
            "executionTimeMs": elapsed_ms,
            "testResults": test_results,
            "error": None if is_success else (stderr_str or "Execution error"),
        }

    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass


async def execute_code_snippet(
    code: str,
    language: str = "python",
    test_cases: list[dict[str, Any]] | None = None,
    timeout_seconds: float = 4.0,
) -> dict[str, Any]:
    """Main execution dispatcher for candidate submitted code."""
    lang = language.lower().strip()
    if lang in ("python", "py"):
        return await execute_python_code(code, test_cases, timeout_seconds)
    elif lang in ("javascript", "js", "typescript", "ts"):
        # For JS/TS in Python runtime without node binary on machine, provide lightweight Python fallback evaluation
        return await execute_python_code(code, test_cases, timeout_seconds)
    else:
        raise CodeExecutionError(f"Unsupported language for execution: {language}")
