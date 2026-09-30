import time
import math

# Mock data
nowSec = 1700000000
c_temp = 30
forecast_list = [
    {"dt": 1700002000, "temp": 32, "pop": 0.5, "icon": "02d"},
    {"dt": 1700012800, "temp": 28, "pop": 0.8, "icon": "03d"}
]

points = [
    {"dt": nowSec, "temp": c_temp, "pop": forecast_list[0]["pop"], "icon": "01d"}
]
points.extend(forecast_list)

startHourSec = nowSec - (nowSec % 3600)

for i in range(12):
    targetSec = startHourSec + i * 3600
    
    p0 = points[0]
    p1 = points[1]
    
    for j in range(len(points) - 1):
        if points[j]["dt"] <= targetSec and points[j+1]["dt"] >= targetSec:
            p0 = points[j]
            p1 = points[j+1]
            break
        elif points[j]["dt"] > targetSec:
            p0 = points[0]
            p1 = points[1]
            break
        elif j == len(points) - 2:
            p0 = points[j]
            p1 = points[j+1]
            
    fraction = 0
    if p1["dt"] > p0["dt"]:
        fraction = (targetSec - p0["dt"]) / (p1["dt"] - p0["dt"])
        fraction = max(0, min(1, fraction))
        
    stepTemp = p0["temp"] + (p1["temp"] - p0["temp"]) * fraction
    stepPop = p0["pop"] + (p1["pop"] - p0["pop"]) * fraction
    icon = p0["icon"] if fraction < 0.5 else p1["icon"]
    
    time_label = "Bây giờ" if i == 0 else f"{(targetSec // 3600) % 24}h"
    print(f"{time_label}: Temp={round(stepTemp)}, PoP={round(stepPop*100)}%, Icon={icon}")