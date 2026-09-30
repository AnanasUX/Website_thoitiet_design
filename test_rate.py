import asyncio
import aiohttp
import time
import urllib.parse
import sys

sys.stdout.reconfigure(encoding='utf-8')

feeds = [
  "https://dantri.com.vn/rss/tin-moi-nhat.rss",
  "https://vnexpress.net/rss/tin-moi-nhat.rss",
  "https://tuoitre.vn/rss/tin-moi-nhat.rss",
  "https://thanhnien.vn/rss/home.rss",
  "https://www.baogiaothong.vn/rss/thoi-su.rss"
]

async def fetch(session, url):
    api_url = f"https://api.rss2json.com/v1/api.json?rss_url={urllib.parse.quote(url)}"
    async with session.get(api_url) as response:
        return await response.json()

async def main():
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in feeds]
        results = await asyncio.gather(*tasks)
        for r in results:
            print(r.get('status'), r.get('message', ''))

asyncio.run(main())