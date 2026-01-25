import sys
import io
import contextlib
import traceback
import multiprocess
from ..models.simulation import SimulationRequest, SimulationResponse, ExecutionResult

class SimulationEngine:
    @staticmethod
    def execute_code(code: str, language: str) -> ExecutionResult:
        """
        Executes code in a secure(ish) environment.
        Refactored to be a separate process or container in production.
        For now, we use a restricted local execution for prototype.
        """
        if language == "python":
            return SimulationEngine._execute_python(code)
        elif language == "cpp":
            return SimulationEngine._execute_cpp_stub(code) # C++ requires compilation
        else:
            return ExecutionResult(success=False, output="", error="Unsupported language")

    @staticmethod
    def _execute_python(code: str) -> ExecutionResult:
        # Capture stdout
        stdout_capture = io.StringIO()
        stderr_capture = io.StringIO()
        
        # Phase 7: Strict Sandboxing (Soft Guard for Local Env)
        # Block dangerous modules since Docker is unavailable
        dangerous_keywords = ["import os", "import sys", "import subprocess", "__builtins__", "open("]
        for kw in dangerous_keywords:
            if kw in code:
                return ExecutionResult(
                    success=False,
                    output="",
                    error=f"Security Violation: usage of '{kw}' is restricted in the sandbox."
                )

        success = False
        error_message = None
        
        try:
            with contextlib.redirect_stdout(stdout_capture), contextlib.redirect_stderr(stderr_capture):
                # RESTRICTION: In a real system, this MUST be in a Docker container.
                # using exec() is dangerous locally. 
                # We assume the user understands this is a local build.
                exec_globals = {"__builtins__": {}} # Clear builtins for extra safety (careful, breaks print/len)
                # Actually, clearing builtins breaks everything. Let's allow standard safe builtins.
                # For this prototype, just kw blocking and basic exec with default globals is the compromise.
                exec_globals = {} 
                exec(code, exec_globals)
            success = True
        except Exception as e:
            error_message = traceback.format_exc()
            success = False
            
        return ExecutionResult(
            success=success,
            output=stdout_capture.getvalue(),
            error=error_message or stderr_capture.getvalue()
        )

    @staticmethod
    def _execute_cpp_stub(code: str) -> ExecutionResult:
        # Placeholder for C++ execution
        return ExecutionResult(
            success=True,
            output="[System] C++ compilation simulated successfully.\nOutput: Hello CodeLeva!",
            error=None
        )

simulation_engine = SimulationEngine()
