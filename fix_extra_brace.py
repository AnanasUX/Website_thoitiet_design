import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

bad_str = """      return { real: makeOhlc(realArr), forecast: makeOhlc(forecastArr) };
    };
  };

  
    useEffect(() => {"""

good_str = """      return { real: makeOhlc(realArr), forecast: makeOhlc(forecastArr) };
    };

    useEffect(() => {"""

content = content.replace(bad_str, good_str)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Removed extra };")