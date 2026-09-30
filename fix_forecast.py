with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "forecast[i] = Math.round((real[i] * (1 + (Math.random()*0.004 - 0.002)))/10000)*10000;",
    "forecast[i] = real[i];"
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated forecast to match real data for past hours.")