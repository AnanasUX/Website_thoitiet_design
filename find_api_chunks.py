import urllib.request
import re

chunks = ["chunk-SV2EPDY2.js", "chunk-GD6AZYUM.js", "chunk-R7NCQHP3.js", "chunk-LE5HA4UG.js", "chunk-SIDK2YNR.js", "chunk-IEOTKJ7A.js", "chunk-4YPCVJ6M.js", "chunk-GXQDLXKE.js", "chunk-NNAZFMFH.js", "chunk-UI65T5SL.js"]
urls = set()
for chunk in chunks:
    try:
        req = urllib.request.Request(f'https://phuquy.com.vn/{chunk}', headers={'User-Agent': 'Mozilla/5.0'})
        js = urllib.request.urlopen(req).read().decode('utf-8')
        urls.update(re.findall(r'https?://[a-zA-Z0-9./\-_]+', js))
        urls.update(re.findall(r'/api/[a-zA-Z0-9./\-_]+', js))
    except:
        pass
print("\n".join(urls))