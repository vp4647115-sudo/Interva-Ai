import http.client

# PUT preflight (the failing request)
c = http.client.HTTPConnection("localhost", 8000, timeout=5)
c.request(
    "OPTIONS",
    "/api/onboarding/state",
    headers={
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "PUT",
        "Access-Control-Request-Headers": "authorization,content-type",
    },
)
r = c.getresponse()
r.read()
print("PUT PREFLIGHT STATUS", r.status)
print("PUT PREFLIGHT ACAO", r.getheader("Access-Control-Allow-Origin"))
print("ALLOW-METHODS", r.getheader("Access-Control-Allow-Methods"))
print("ALLOW-HEADERS", r.getheader("Access-Control-Allow-Headers"))
c.close()
