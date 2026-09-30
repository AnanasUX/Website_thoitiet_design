import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the inline proxy logic with a robust helper function
helper_func = """function getProxyImageUrl(url: string) {
  if (!url) return "";
  let cleanUrl = url.trim();
  if (cleanUrl.startsWith("//")) cleanUrl = "https:" + cleanUrl;
  if (cleanUrl.startsWith("http") && !cleanUrl.includes("wsrv.nl")) {
    return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}`;
  }
  return cleanUrl;
}
"""

if "function getProxyImageUrl" not in content:
    content = content.replace("function App() {", helper_func + "\nfunction App() {")

# Update processJson
old_process = 'img:    (item.image && item.image.startsWith("http") && !item.image.includes("wsrv.nl")) ? `https://wsrv.nl/?url=${encodeURIComponent(item.image)}` : (item.image || images[i % images.length]),'
new_process = 'img:    item.image ? getProxyImageUrl(item.image) : images[i % images.length],'
content = content.replace(old_process, new_process)

# Update background fetcher
old_fetcher = 'const newImg = `https://wsrv.nl/?url=${encodeURIComponent(ogMatch[1])}`;'
new_fetcher = 'const newImg = getProxyImageUrl(ogMatch[1]);'
content = content.replace(old_fetcher, new_fetcher)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")