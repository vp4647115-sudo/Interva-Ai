try:
    import httpx

    def get_status(url: str, timeout: int = 5) -> int:
        r = httpx.get(url, timeout=timeout, follow_redirects=True)
        return r.status_code
except ImportError:
    import urllib.error
    import urllib.request

    def get_status(url: str, timeout: int = 5) -> int:
        req = urllib.request.Request(url, headers={"User-Agent": "HealthCheck/1.0"})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                return response.status
        except urllib.error.HTTPError as e:
            return e.code

endpoints = [
    ("backend", "http://localhost:8000/health"),
    ("frontend", "http://localhost:3000"),
]

all_up = True
print("--- Interva AI Health Check ---")
for name, url in endpoints:
    try:
        code = get_status(url, timeout=5)
        if code < 400:
            print(f"[UP]   {name:<10} -> {url} (HTTP {code})")
        else:
            all_up = False
            print(f"[WARN] {name:<10} -> {url} (HTTP {code})")
    except Exception as e:
        all_up = False
        print(f"[DOWN] {name:<10} -> {url} ({type(e).__name__})")

if not all_up:
    print("\nTo start local servers, run: .\\start-local.ps1")


