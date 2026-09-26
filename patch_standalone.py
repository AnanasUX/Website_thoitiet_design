import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

standalone_logic = """
    // Nếu không có dữ liệu từ Bot và không có apiUrl, trang web tự động fetch dữ liệu thực tế
    if (!cData && !rawData && !apiUrl) {
      setApiStatus("loading");
      const apiKey = "a201c471567522a7d0b7a0567ad245fe";
      const lat = 20.9716;
      const lon = 105.7725;
      
      Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`).then(r => r.json()),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`).then(r => r.json()),
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`).then(r => r.json()),
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3Dth%25E1%25BB%259Di%2Bti%25E1%25BA%25BFt%26hl%3Dvi%26gl%3DVN%26ceid%3DVN%3Avi`).then(r => r.json())
      ]).then(([weather, forecast, aqi, news]) => {
        const c_temp = Math.round(weather.main?.temp || 0);
        const feels_like = Math.round(weather.main?.feels_like || 0);
        const humidity = weather.main?.humidity || 0;
        const c_desc = weather.weather?.[0]?.description || "";
        // Mapping simple icon codes
        const iconCode = weather.weather?.[0]?.icon || "";
        const c_icon = iconCode.includes("d") ? "☀️" : "🌙";
        
        const n_item = forecast.list?.[0] || {};
        const n_temp = Math.round(n_item.main?.temp || c_temp);
        const n_pop = Math.round((n_item.pop || 0) * 100);
        const n_desc = n_item.weather?.[0]?.description || c_desc;
        
        const pm25 = aqi.list?.[0]?.components?.pm2_5 || 0;
        const aqi_level = aqi.list?.[0]?.main?.aqi || 1;
        
        // Simple logic for status
        let trang_thai = "NANG";
        if (n_pop > 50) trang_thai = "MUA";
        else if (c_temp > 35) trang_thai = "NANG_GAT";
        
        const newsItems = (news.items || []).slice(0, 10).map((item: any) => ({
          title: item.title,
          link: item.link,
          source: "Báo Mới", // Fallback source name
          time: new Date(item.pubDate).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })
        }));

        const json = {
          location: "Quận Hà Đông, VN",
          weather: {
            current: { temp: c_temp, feels_like, humidity, desc: c_desc, icon: c_icon, pm25, aqi_level },
            forecast_3h: { temp: n_temp, pop: n_pop, desc: n_desc },
            status: trang_thai
          },
          news: newsItems.length > 0 ? newsItems : undefined
        };
        processJson(json);
      }).catch(e => {
        console.error("Standalone fetch error:", e);
        setApiStatus("error"); // Fallback to mock if fetch fails entirely
      });
      return;
    }
"""

content = content.replace('    if (apiUrl) {', standalone_logic + '\n    if (apiUrl) {')

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Injected standalone fetch logic into App.tsx")