import httpx
for name, url in [('backend','http://localhost:8000/health'),('frontend','http://localhost:3000')]:
    try:
        r = httpx.get(url, timeout=5)
        print(name, r.status_code)
    except Exception as e:
        print(name, 'DOWN', type(e).__name__)
