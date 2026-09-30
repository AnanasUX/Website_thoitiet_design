import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_gold = """  useEffect(() => {
    fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://be.phuquy.com.vn/jewelry/product-payment-service/api/sync-price-history/get-sync-table-history'))
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          const keys = ['24K', 'NPQ', 'SJC'];
          const filtered = data.data.filter((item: any) => keys.includes(item.productType));
          if (filtered.length >= 3) {
            filtered.sort((a: any, b: any) => keys.indexOf(a.productType) - keys.indexOf(b.productType));
            setGoldData(filtered.slice(0, 3));
          }
        }
      })
      .catch(() => console.error("Gold API failed, using fallback"));
  }, []);"""

new_gold = """  useEffect(() => {
    const fetchGold = () => {
      fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://be.phuquy.com.vn/jewelry/product-payment-service/api/sync-price-history/get-sync-table-history'))
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            const keys = ['24K', 'NPQ', 'SJC'];
            const filtered = data.data.filter((item: any) => keys.includes(item.productType));
            if (filtered.length >= 3) {
              filtered.sort((a: any, b: any) => keys.indexOf(a.productType) - keys.indexOf(b.productType));
              setGoldData(filtered.slice(0, 3));
            }
          }
        })
        .catch(() => console.error("Gold API failed, using fallback"));
    };

    fetchGold();
    const interval = setInterval(fetchGold, 2 * 60 * 1000); // Poll every 2 mins
    return () => clearInterval(interval);
  }, []);"""

if old_gold in content:
    content = content.replace(old_gold, new_gold)
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Added polling to GoldPriceSection")
else:
    print("Could not find exact Gold block")