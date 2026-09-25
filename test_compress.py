import zlib
import base64
import json

data = json.dumps({"test": "hello world from compression! " * 20}).encode('utf-8')
compressed = zlib.compress(data)
b64 = base64.urlsafe_b64encode(compressed).decode('ascii')
print(b64)