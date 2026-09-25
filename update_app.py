import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

s_old = """    const params  = new URLSearchParams(window.location.search);
    const rawData = params.get("data");   // base64 JSON từ bot
    const apiUrl  = params.get("api");    // URL API fallback

    function processJson(json: Record<string, unknown>) {"""

s_new = """    const params  = new URLSearchParams(window.location.search);
    const rawData = params.get("data");   // base64 JSON từ bot
    const cData   = params.get("cdata");  // zlib compressed base64 JSON từ bot
    const apiUrl  = params.get("api");    // URL API fallback

    function processJson(json: Record<string, unknown>) {"""
content = content.replace(s_old, s_new)

block_old = """    // 🟢 Ưu tiên ?data= (bot đã fetch sẵn, decode base64 là dùng được luôn) 🟢
    if (rawData) {
      try {
        setApiStatus("loading");"""

block_new = """    // 🟢 Ưu tiên ?cdata= (compressed zlib base64) 🟢
    if (cData) {
      setApiStatus("loading");
      (async () => {
        try {
          const b64 = cData.replace(/-/g, "+").replace(/_/g, "/");
          const binaryStr = atob(b64);
          const bytes = new Uint8Array(binaryStr.length);
          for(let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
          
          const ds = new DecompressionStream('deflate');
          const writer = ds.writable.getWriter();
          writer.write(bytes);
          writer.close();
          
          const reader = ds.readable.pipeThrough(new TextDecoderStream()).getReader();
          let text = '';
          while(true) {
            const {value, done} = await reader.read();
            if(done) break;
            text += value;
          }
          const json = JSON.parse(text) as Record<string, unknown>;
          processJson(json);
        } catch (err) {
          console.error("Lỗi giải nén cdata:", err);
          setApiStatus("error");
        }
      })();
      return;
    }

    // 🟢 Fallback ?data= (bot đã fetch sẵn, decode base64 là dùng được luôn) 🟢
    if (rawData) {
      try {
        setApiStatus("loading");"""
content = content.replace(block_old, block_new)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated App.tsx")