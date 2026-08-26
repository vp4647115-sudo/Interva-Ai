import httpx, time
for _ in range(15):
    try:
        r = httpx.get('http://localhost:8000/health', timeout=2)
        print('health', r.status_code); break
    except Exception:
        time.sleep(1)
else:
    print('backend did not start')
