import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update state type for chartData
content = content.replace(
    'const [chartData, setChartData] = useState<{ real: number[], forecast: number[] }>({ real: [], forecast: [] });',
    'const [chartData, setChartData] = useState<{ real: any[], forecast: any[] }>({ real: [], forecast: [] });'
)

# 2. Update generateDynamicData to return OHLC
old_gen = """    const generateDynamicData = (currentPrice: number) => {
      const currentHour = new Date().getHours();
      
      // Exactly currentHour + 1 points for reality
      const real = new Array(currentHour + 1).fill(0);
      real[currentHour] = currentPrice;
      for (let i = currentHour - 1; i >= 0; i--) {
        const change = real[i+1] * (Math.random() * 0.008 - 0.004); 
        real[i] = Math.round((real[i+1] + change) / 10000) * 10000;
      }
      
      // Exactly 25 points for forecast (0 to 24)
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
    };"""

new_gen = """    const generateDynamicData = (currentPrice: number) => {
      const currentHour = new Date().getHours();
      
      const realArr = new Array(currentHour + 1).fill(0);
      realArr[currentHour] = currentPrice;
      for (let i = currentHour - 1; i >= 0; i--) {
        const change = realArr[i+1] * (Math.random() * 0.008 - 0.004); 
        realArr[i] = Math.round((realArr[i+1] + change) / 10000) * 10000;
      }
      
      const forecastArr = new Array(25).fill(0);
      for (let i=0; i<=currentHour; i++) {
         forecastArr[i] = Math.round((realArr[i] * (1 + (Math.random()*0.004 - 0.002)))/10000)*10000;
      }
      for(let i=currentHour+1; i<25; i++) {
         const trend = (Math.random() > 0.4 ? 1 : -1); 
         const change = forecastArr[i-1] * (Math.random() * 0.006 * trend);
         forecastArr[i] = Math.round((forecastArr[i-1] + change)/10000)*10000;
      }

      const makeOhlc = (arr: number[]) => {
          return arr.map((val, i) => {
              const open = i === 0 ? val : arr[i-1];
              const close = val;
              const minOC = Math.min(open, close);
              const maxOC = Math.max(open, close);
              const high = maxOC + Math.round((maxOC * (Math.random()*0.003))/10000)*10000;
              const low = minOC - Math.round((minOC * (Math.random()*0.003))/10000)*10000;
              return { o: open, h: high, l: low, c: close };
          });
      };

      return { real: makeOhlc(realArr), forecast: makeOhlc(forecastArr) };
    };"""

content = content.replace(old_gen, new_gen)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated generator.")