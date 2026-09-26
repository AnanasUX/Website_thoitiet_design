import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

cdata_block = """
    // 🟢 Ưu tiên ?cdata= (bot đã nén zlib + base64) 🟢
    if (cData) {
      (async () => {
        try {
          setApiStatus("loading");
          const b64 = cData.replace(/-/g, "+").replace(/_/g, "/");
          const binaryStr = atob(b64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          const ds = new DecompressionStream("deflate");
          const writer = ds.writable.getWriter();
          writer.write(bytes);
          writer.close();
          const reader = ds.readable.getReader();
          const chunks = [];
          let totalLen = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            totalLen += value.length;
          }
          const decompressed = new Uint8Array(totalLen);
          let offset = 0;
          for (const chunk of chunks) {
            decompressed.set(chunk, offset);
            offset += chunk.length;
          }
          const decodedStr = new TextDecoder("utf-8").decode(decompressed);
          const json = JSON.parse(decodedStr);
          processJson(json);
        } catch (e) {
          console.error(e);
          setApiStatus("error");
        }
      })();
      return;
    }
"""

# Find where rawData is handled
idx = content.find("if (rawData) {")
if idx != -1:
    content = content[:idx] + cdata_block + "\n    " + content[idx:]

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Added cdata decompression to App.tsx")