import asyncio
import os
import httpx
from dotenv import load_dotenv

load_dotenv("backend/.env")

gemini_key = os.getenv("GEMINI_API_KEY")
print(f"Testing GEMINI_API_KEY: {gemini_key[:10]}...")

async def test_token():
    url = "https://generativelanguage.googleapis.com/v1alpha/auth_tokens"
    async with httpx.AsyncClient(timeout=15) as client:
        res = await client.post(
            url,
            params={"key": gemini_key},
            json={
                "uses": 1,
                "expireTime": "2026-09-14T18:30:00Z",
                "newSessionExpireTime": "2026-09-14T18:02:00Z",
            }
        )
        print("Status code:", res.status_code)
        print("Response body:", res.text)

if __name__ == "__main__":
    asyncio.run(test_token())
