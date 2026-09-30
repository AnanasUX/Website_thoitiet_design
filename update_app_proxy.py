with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """        const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent('https://phuquygroup.vn/')}`);
        if (res.ok) {
           const html = await res.text();
           // Attempt to match Phu Quy Gold price (Nhẫn tròn)
           const match = html.match(/Nhẫn tr&#242;n Ph&#250; Qu&#253; 999\\.9<\\/td>\\s*<td[^>]*>([0-9,]+)<\\/td>\\s*<td[^>]*>([0-9,]+)<\\/td>/i);
           if (match) {
             const npqBuyStr = match[1].replace(/,/g, '');
             const npqSellStr = match[2].replace(/,/g, '');
             const buyPrice = parseInt(npqBuyStr) * 1000;
             const sellPrice = parseInt(npqSellStr) * 1000;"""

replacement = """        const res = await fetch(`/api/phuquy`);
        if (res.ok) {
           const html = await res.text();
           // Attempt to match Phu Quy Gold price (Nhẫn tròn)
           const match = html.match(/Nhẫn tr&#242;n Ph&#250; Qu&#253; 999\\.9<\\/td>\\s*<td[^>]*>([0-9,]+)<\\/td>\\s*<td[^>]*>([0-9,]+)<\\/td>/i);
           if (match) {
             const npqBuyStr = match[1].replace(/,/g, '');
             const npqSellStr = match[2].replace(/,/g, '');
             // The values from phuquygroup.vn are already fully written (e.g., 14,080,000) or we must ensure we don't multiply incorrectly.
             // Usually gold prices are around 88,000,000. If the value is 14080000, it's 14M. Let's just use it directly.
             const buyPrice = parseInt(npqBuyStr);
             const sellPrice = parseInt(npqSellStr);"""

content = content.replace(target, replacement)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated App.tsx to use local proxy and fixed multiplier.")