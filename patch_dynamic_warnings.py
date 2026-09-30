import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update WeatherEntry type
old_type = """  uvIndex: string; dewPoint: string; hourlyForecast: HourlyItem[];
};"""
new_type = """  uvIndex: string; dewPoint: string; hourlyForecast: HourlyItem[];
  warningText?: string; suggestionItems?: string[];
};"""
content = content.replace(old_type, new_type)

# 2. Update fetchRealtimeWeather to generate dynamic warnings
# First find the definition of mappedCondKey, we insert before `const now = new Date();`
find_str = """      const isRaining = c_desc.toLowerCase().includes("mưa") || c_desc.toLowerCase().includes("rain");
      let mappedCondKey: ConditionKey = isRaining ? "mua-nho" : "nang-nhe";"""

insert_str = """      const isRaining = c_desc.toLowerCase().includes("mưa") || c_desc.toLowerCase().includes("rain");
      let mappedCondKey: ConditionKey = isRaining ? "mua-nho" : "nang-nhe";
      if (c_temp >= 35) mappedCondKey = "nang-gat";
      else if (c_temp >= 30) mappedCondKey = "nang";
      
      let dynamicWarnings: string[] = [];
      let dynamicSuggestions: string[] = [];
      
      const uv = Math.round(uviRes.value || 0);
      if (uv >= 8) {
        dynamicWarnings.push(`Chỉ số UV rất cao (${uv}). Nguy cơ say nắng, phỏng da nếu hoạt động ngoài trời lâu.`);
        dynamicSuggestions.push("Trang bị: Bắt buộc đội mũ rộng vành, đeo kính râm UV400, bôi kem chống nắng SPF50+.");
      } else if (uv >= 6) {
        dynamicWarnings.push(`Chỉ số UV cao (${uv}). Cần che chắn bảo vệ da khi ra ngoài.`);
      }
      
      if (c_temp >= 35) {
        dynamicWarnings.push(`Nắng nóng gay gắt (${c_temp}°C). Nguy cơ mất nước, kiệt sức.`);
        dynamicSuggestions.push("Lịch trình: Hạn chế di chuyển giờ cao điểm nắng (11h-15h). Để xe ở nơi có bóng râm, kiểm tra áp suất lốp.");
      } else if (c_temp <= 15) {
        dynamicWarnings.push(`Trời rét (${c_temp}°C). Nguy cơ nhiễm lạnh cao.`);
        dynamicSuggestions.push("Trang bị: Mặc áo ấm, giữ ấm cổ và tay khi đi xe máy.");
      }
      
      if (windKmh > 30) {
        dynamicWarnings.push(`Gió giật mạnh (${windKmh} km/h). Chú ý biển báo, cây cối dễ gãy đổ.`);
        dynamicSuggestions.push("Điều khiển phương tiện: Giữ vững tay lái, giảm tốc độ, tránh đỗ xe dưới gốc cây lớn.");
      }
      
      if (popPercent >= 50) {
        dynamicWarnings.push(`Khả năng mưa rất cao (${popPercent}%). Mặt đường trơn trượt.`);
        dynamicSuggestions.push("Trang bị: Mang theo áo mưa/ô. Điều khiển xe chậm lại, tránh phanh gấp.");
      }
      
      if (pm25 > 50) {
        dynamicWarnings.push(`Ô nhiễm không khí (PM2.5: ${pm25.toFixed(1)}). Nguy cơ ảnh hưởng đường hô hấp.`);
        dynamicSuggestions.push("Trang bị: Đeo khẩu trang lọc bụi mịn (N95) khi di chuyển.");
      }
      
      const visibilityKm = (weather.visibility || 10000) / 1000;
      if (visibilityKm < 4) {
        dynamicWarnings.push(`Tầm nhìn hạn chế (${visibilityKm.toFixed(1)} km).`);
        dynamicSuggestions.push("Điều khiển phương tiện: Bật đèn sương mù hoặc đèn chiếu gần, giữ khoảng cách an toàn.");
      }
      
      const finalWarning = dynamicWarnings.length > 0 ? dynamicWarnings.join("\\n") : undefined;
      const finalSuggestions = dynamicSuggestions.length > 0 ? dynamicSuggestions : undefined;
"""
content = content.replace(find_str, insert_str)

# 3. Add to entry
entry_str = """        dewPoint: `${dewPoint}°C`,
        hourlyForecast
      };"""
entry_new_str = """        dewPoint: `${dewPoint}°C`,
        hourlyForecast,
        warningText: finalWarning,
        suggestionItems: finalSuggestions
      };"""
content = content.replace(entry_str, entry_new_str)

# 4. Update WeatherSection to prioritize WEATHER.warningText and WEATHER.suggestionItems
old_ws = """    const warningText = liveOverrides?.warningText ?? baseTheme.warningText;
    const suggestionItems = liveOverrides?.suggestionItems ?? baseTheme.suggestionItems;"""
new_ws = """    const warningText = liveOverrides?.warningText ?? WEATHER.warningText ?? baseTheme.warningText;
    const suggestionItems = liveOverrides?.suggestionItems ?? WEATHER.suggestionItems ?? baseTheme.suggestionItems;"""
content = content.replace(old_ws, new_ws)

# Fix emojis in suggestion blocks
old_emoji = """<p className="font-['Inter:Bold'] font-bold text-[#182033] whitespace-nowrap">dYs" CNH BA?O TRONG TA,M</p>"""
new_emoji = """<p className="font-['Inter:Bold'] font-bold text-[#182033] whitespace-nowrap">🚨 CẢNH BÁO TRỌNG TÂM</p>"""
content = content.replace(old_emoji, new_emoji)

old_emoji2 = """<p className="font-['Inter:Bold'] font-bold text-[#182033] whitespace-nowrap">dY' GI A? LSCH TRAONH THC T_</p>"""
new_emoji2 = """<p className="font-['Inter:Bold'] font-bold text-[#182033] whitespace-nowrap">💡 GỢI Ý LỊCH TRÌNH THỰC TẾ</p>"""
content = content.replace(old_emoji2, new_emoji2)

# Fix regex emoji replacement if they didn't match perfectly
content = re.sub(r'<p[^>]*>.*?CẢNH BÁO TRỌNG TÂM.*?</p>', new_emoji, content)
content = re.sub(r'<p[^>]*>.*?GỢI Ý LỊCH TRÌNH THỰC TẾ.*?</p>', new_emoji2, content)

# I should use re.sub for emojis just in case
content = re.sub(r'<p className="font-\[\'Inter:Bold\'\] font-bold text-\[\#182033\] whitespace-nowrap">[^<]*CNH BA\?O TRONG TA,M</p>', new_emoji, content)
content = re.sub(r'<p className="font-\[\'Inter:Bold\'\] font-bold text-\[\#182033\] whitespace-nowrap">[^<]*G.I A\? L.SCH TRAONH TH.C T._</p>', new_emoji2, content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")