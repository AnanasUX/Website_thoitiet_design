import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Restore chartData type
content = content.replace(
    'const [chartData, setChartData] = useState<{ real: any[], forecast: any[] }>({ real: [], forecast: [] });',
    'const [chartData, setChartData] = useState<{ real: number[], forecast: number[] }>({ real: [], forecast: [] });'
)

# 2. Restore generateDynamicData
idx = content.find("const generateDynamicData = (currentPrice: number) => {")
end_idx = content.find("useEffect(() => {", idx)

new_gen = """const generateDynamicData = (currentPrice: number) => {
      const currentHour = new Date().getHours();
      
      const real = new Array(currentHour + 1).fill(0);
      real[currentHour] = currentPrice;
      for (let i = currentHour - 1; i >= 0; i--) {
        const change = real[i+1] * (Math.random() * 0.008 - 0.004); 
        real[i] = Math.round((real[i+1] + change) / 10000) * 10000;
      }
      
      const forecast = new Array(25).fill(0);
      for (let i=0; i<=currentHour; i++) {
         forecast[i] = Math.round((real[i] * (1 + (Math.random()*0.004 - 0.002)))/10000)*10000;
      }
      for(let i=currentHour+1; i<25; i++) {
         const trend = (Math.random() > 0.4 ? 1 : -1); 
         const change = forecast[i-1] * (Math.random() * 0.006 * trend);
         forecast[i] = Math.round((forecast[i-1] + change)/10000)*10000;
      }

      return { real, forecast };
    };

    """
content = content[:idx] + new_gen + content[end_idx:]

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Restored chartData type and generator.")