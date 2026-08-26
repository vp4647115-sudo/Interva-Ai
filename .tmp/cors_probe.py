import http.client

c = http.client.HTTPConnection("localhost", 8000, timeout=5)
c.request("GET", "/api/onboarding/state", headers={"Origin": "http://localhost:3000"})
r = c.getresponse()
r.read()
print("STATUS", r.status)
print("ACAO", r.getheader("Access-Control-Allow-Origin"))
print("SERVER", r.getheader("Server"))
c.close()

c2 = http.client.HTTPConnection("localhost", 8000, timeout=5)
c2.request(
    "OPTIONS",
    "/api/onboarding/state",
    headers={
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "authorization,content-type",
    },
)
r2 = c2.getresponse()
r2.read()
print("PREFLIGHT STATUS", r2.status)
print("PREFLIGHT ACAO", r2.getheader("Access-Control-Allow-Origin"))
c2.close()
