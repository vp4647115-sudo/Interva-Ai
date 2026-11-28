import urllib.request
import urllib.error
import json
import re

def test_url(name, url, method="GET"):
    req = urllib.request.Request(url, headers={"User-Agent": "WebAppTester/1.0"}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            status = response.status
            body = response.read().decode('utf-8', errors='ignore')
            title = ""
            m = re.search(r"<title>(.*?)</title>", body, re.IGNORECASE | re.DOTALL)
            if m:
                title = m.group(1).strip()
            print(f"[PASS] {name:<26} -> {url:<40} (HTTP {status}) {title}")
            return True, status
    except urllib.error.HTTPError as e:
        print(f"[FAIL] {name:<26} -> {url:<40} (HTTP {e.code}) {e.reason}")
        return False, e.code
    except Exception as e:
        print(f"[ERR]  {name:<26} -> {url:<40} {type(e).__name__}: {e}")
        return False, 0

print("=" * 80)
print("INTERVA AI: COMPREHENSIVE WEB APPLICATION TEST SUITE")
print("=" * 80)

# 1. Backend API & Docs (Port 8000)
print("\n--- 1. BACKEND SERVICE TESTS (FastAPI - Port 8000) ---")
backend_routes = [
    ("API Health Check", "http://localhost:8000/health"),
    ("OpenAPI Documentation", "http://localhost:8000/docs"),
    ("OpenAPI JSON Schema", "http://localhost:8000/openapi.json"),
]
for name, url in backend_routes:
    test_url(name, url)

# 2. Frontend Core Pages (Port 3000)
print("\n--- 2. FRONTEND CORE & APP ROUTES (Next.js - Port 3000) ---")
frontend_routes = [
    ("Landing Page", "http://localhost:3000/"),
    ("Login Page", "http://localhost:3000/auth/login"),
    ("Register Page", "http://localhost:3000/auth/register"),
    ("Reset Password", "http://localhost:3000/auth/reset-password"),
    ("Dashboard", "http://localhost:3000/dashboard"),
    ("Mock Interviews", "http://localhost:3000/mock-interviews"),
    ("Interview Buddy", "http://localhost:3000/interview-buddy"),
    ("Question Bank", "http://localhost:3000/question-bank"),
    ("Resume Builder", "http://localhost:3000/resume"),
    ("User Profile", "http://localhost:3000/profile"),
    ("Preferences", "http://localhost:3000/preferences"),
    ("Answer Library", "http://localhost:3000/answer-library"),
    ("Jobs Search", "http://localhost:3000/jobs"),
    ("Saved Jobs", "http://localhost:3000/saved-jobs"),
    ("Cover Letters", "http://localhost:3000/cover-letters"),
    ("Onboarding", "http://localhost:3000/onboarding"),
    ("FAQ", "http://localhost:3000/faq"),
    ("About", "http://localhost:3000/about"),
    ("Contact", "http://localhost:3000/contact"),
    ("Help Center", "http://localhost:3000/help-center"),
]

passed = 0
failed = 0
for name, url in frontend_routes:
    success, _ = test_url(name, url)
    if success:
        passed += 1
    else:
        failed += 1

print("\n" + "=" * 80)
print(f"SUMMARY: Frontend Routes Tested: {len(frontend_routes)} | Passed: {passed} | Failed: {failed}")
print("=" * 80)
