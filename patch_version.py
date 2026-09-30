import re
import datetime

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add a timestamp label at the very bottom
timestamp = datetime.datetime.now().strftime("%H:%M:%S")
old_footer = """</button>
    </div>
  );"""
new_footer = f"""</button>
      <div className="w-full text-center py-2 text-[10px] text-gray-400">Phiên bản: {timestamp}</div>
    </div>
  );"""

content = content.replace(old_footer, new_footer)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")