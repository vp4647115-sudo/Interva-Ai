import subprocess
import sys

result = subprocess.run([sys.executable, "-m", "pip_audit"], capture_output=True, text=True, cwd="d:/my sfotware and web develope/Interva Ai - Copy/backend")
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)
print("Return code:", result.returncode)