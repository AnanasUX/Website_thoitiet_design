from bs4 import BeautifulSoup
import json

with open("phuquy.html", "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

# Let's search for some tables or divs containing gold price.
# PhuQuy usually has a price table.
tables = soup.find_all("table")
for i, t in enumerate(tables):
    print(f"Table {i}: {t.text[:100].strip()}")

# If no tables, look for something with 'SJC' or '9999'
import re
for el in soup.find_all(string=re.compile("SJC|9999")):
    print("Found:", el.parent.text.strip())
