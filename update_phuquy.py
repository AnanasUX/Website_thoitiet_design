with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """    const loadData = async () => {
      // 1. Fetch News"""

replacement = """    const loadData = async () => {
      // 1. Fetch Gold Price from Phu Quy
      try {
        const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent('https://phuquygroup.vn/')}`);
        if (res.ok) {
           const html = await res.text();
           // Attempt to match Phu Quy Gold price (Nhẫn tròn)
           const match = html.match(/Nhẫn tr&#242;n Ph&#250; Qu&#253; 999\.9<\/td>\s*<td[^>]*>([0-9,]+)<\/td>\s*<td[^>]*>([0-9,]+)<\/td>/i);
           if (match) {
             const npqBuyStr = match[1].replace(/,/g, '');
             const npqSellStr = match[2].replace(/,/g, '');
             const buyPrice = parseInt(npqBuyStr) * 1000;
             const sellPrice = parseInt(npqSellStr) * 1000;
             if (sellPrice > 0) {
               setLiveOverrides(prev => ({
                 ...prev,
                 npqBuy: buyPrice,
                 npqSell: sellPrice
               }));
             }
           }
        }
      } catch (e) {
        console.log("Failed to fetch Phu Quy gold price", e);
      }

      // 2. Fetch News"""

content = content.replace(target, replacement)

target2 = """      const rows = document.querySelectorAll('#Banggia_Vang_TuDo tbody tr');
      let npqBuy = 0; let npqSell = 0;
      rows.forEach(tr => {
        const tdName = tr.querySelector('td:nth-child(2)');
        if (tdName && tdName.textContent.includes('Nhẫn tròn')) { // NPQ is Nhẫn tròn trơn
          const buyTd = tr.querySelector('td:nth-child(3)');
          const sellTd = tr.querySelector('td:nth-child(4)');
          if (buyTd) npqBuy = parseInt(buyTd.textContent.replace(/\\./g, '')) * 1000;
          if (sellTd) npqSell = parseInt(sellTd.textContent.replace(/\\./g, '')) * 1000;
        }
      });
      if (npqBuy > 0 && npqSell > 0) {
        setLiveOverrides(prev => ({
          ...prev,
          npqBuy,
          npqSell
        }));
      }"""

content = content.replace(target2, "      // Legacy DOM parsing removed to exclusively use Phu Quy API")

target3 = """    const intervalId = setInterval(loadData, 5 * 60 * 1000); // 5 minutes"""
replacement3 = """    const intervalId = setInterval(loadData, 90 * 1000); // 1.5 minutes (90s) for Real-time Gold updates"""

content = content.replace(target3, replacement3)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated gold scraper for PhuQuy.")