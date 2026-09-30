import json

currTime = 1790424000 # e.g. 12:00
nextTime = 1790434800 # 3 hours later, 15:00
cTemp = 30
nTemp = 33

for step in range(3):
    fraction = step / 3
    stepTime = currTime + step * 3600
    stepTemp = cTemp + (nTemp - cTemp) * fraction
    print(stepTime, stepTemp)