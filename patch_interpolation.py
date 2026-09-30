import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_hourly = """        const hourlyForecast = (forecast.list || []).slice(0, 8).map((item: any) => ({
          time: formatTimeShort(item.dt),
          icon: item.weather?.[0]?.icon || "01d",
          temp: Math.round(item.main?.temp || 0),
          pop: Math.round((item.pop || 0) * 100)
        }));"""

new_hourly = """        const nowSec = Math.floor(Date.now() / 1000);
        const points = [
          {
            dt: nowSec,
            temp: c_temp,
            pop: (forecast.list?.[0]?.pop || 0),
            icon: weather.weather?.[0]?.icon || "01d"
          },
          ...(forecast.list || []).map((item: any) => ({
            dt: item.dt,
            temp: item.main?.temp || 0,
            pop: item.pop || 0,
            icon: item.weather?.[0]?.icon || "01d"
          }))
        ];
        
        let startHourSec = nowSec - (nowSec % 3600);
        let interpolatedHourly: any[] = [];
        
        for (let i = 0; i < 24; i++) { // Generate 24 hours
          const targetSec = startHourSec + i * 3600;
          let p0 = points[0];
          let p1 = points[1] || points[0];
          
          for (let j = 0; j < points.length - 1; j++) {
            if (points[j].dt <= targetSec && points[j+1].dt >= targetSec) {
              p0 = points[j];
              p1 = points[j+1];
              break;
            } else if (points[j].dt > targetSec) {
              p0 = points[0];
              p1 = points[1] || points[0];
              break;
            } else if (j === points.length - 2) {
              p0 = points[j];
              p1 = points[j+1];
            }
          }
          
          let fraction = 0;
          if (p1.dt > p0.dt) {
            fraction = (targetSec - p0.dt) / (p1.dt - p0.dt);
            fraction = Math.max(0, Math.min(1, fraction));
          }
          
          const stepTemp = p0.temp + (p1.temp - p0.temp) * fraction;
          const stepPop = p0.pop + (p1.pop - p0.pop) * fraction;
          const icon = fraction < 0.5 ? p0.icon : p1.icon;
          
          interpolatedHourly.push({
            time: i === 0 ? "Bây giờ" : formatTimeShort(targetSec),
            icon: icon,
            temp: Math.round(stepTemp),
            pop: Math.round(stepPop * 100)
          });
        }
        const hourlyForecast = interpolatedHourly;"""

content = content.replace(old_hourly, new_hourly)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")