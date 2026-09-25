import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add video to WeatherTheme interface
content = content.replace(
    '  routeItems?: string[];\n}',
    '  routeItems?: string[];\n  video?: { title: string, link: string };\n}'
)

# Parse video from JSON
content = content.replace(
    '      theme.routeItems = (json.routeItems as string[]) || [];',
    '      theme.routeItems = (json.routeItems as string[]) || [];\n      theme.video = json.video as { title: string, link: string } | undefined;'
)

# Render video block in WeatherSection
video_jsx = """      {theme.video && (
        <div className="bg-[#fff0f3] border border-[#ffb3c6] flex flex-col gap-2 items-start overflow-hidden p-4 rounded-2xl text-[13px] w-full">
          <p className="font-['Inter:Bold'] font-bold text-[#ff315f] whitespace-nowrap">📺 VIDEO CẢNH BÁO</p>
          <a href={theme.video.link} target="_blank" rel="noopener noreferrer" className="font-['Inter:Regular'] font-normal leading-5 text-[#5f687b] hover:text-[#ff315f] underline decoration-1 underline-offset-2">
            {theme.video.title}
          </a>
        </div>
      )}
"""
content = content.replace(
    '      {/* Route Advisory - Am u */}',
    video_jsx + '      {/* Route Advisory - Am u */}'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated video in App.tsx")
