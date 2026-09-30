import re
with open("font_download.zip", "r", encoding="utf-8", errors="ignore") as f:
    html = f.read()
form_match = re.search(r'<form id="download-form".*?</form>', html, re.DOTALL)
if form_match:
    form = form_match.group(0)
    inputs = re.findall(r'<input type="hidden" name="(.*?)" value="(.*?)">', form)
    import urllib.parse
    params = urllib.parse.urlencode(dict(inputs))
    print(f"https://drive.usercontent.google.com/download?{params}")