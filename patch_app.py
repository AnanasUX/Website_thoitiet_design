import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Update the main App wrappers
old_app = """      <div className="md:hidden">
        <MobileLayout condKey={condKey} liveData={liveData} liveNews={liveNews} liveOverrides={liveOverrides} />
        
      </div>
      <div className="hidden md:block xl:hidden">
        <TabletLayout condKey={condKey} liveData={liveData} liveNews={liveNews} liveOverrides={liveOverrides} />
      </div>
      <div className="hidden xl:block">
        <DesktopLayout condKey={condKey} liveData={liveData} liveNews={liveNews} liveOverrides={liveOverrides} />
      </div>"""

new_app = """      <div className="md:hidden w-[min(100%-32px,1200px)] mx-auto">
        <MobileLayout condKey={condKey} liveData={liveData} liveNews={liveNews} liveOverrides={liveOverrides} />
        
      </div>
      <div className="hidden md:block xl:hidden w-[min(100%-32px,1200px)] mx-auto">
        <TabletLayout condKey={condKey} liveData={liveData} liveNews={liveNews} liveOverrides={liveOverrides} />
      </div>
      <div className="hidden xl:block w-[min(100%-32px,1200px)] mx-auto">
        <DesktopLayout condKey={condKey} liveData={liveData} liveNews={liveNews} liveOverrides={liveOverrides} />
      </div>"""
content = content.replace(old_app, new_app)

# Ensure typography is also applied correctly in TabletLayout and MobileLayout

# TabletLayout Typography
old_tablet_title = """<p className="font-['Inter:Bold'] font-bold leading-5 text-[#182033] text-[14px] w-full line-clamp-2">"""
new_tablet_title = """<p className="font-['Inter:Bold'] font-bold text-[#182033] text-[length:var(--font-h4)] w-full line-clamp-2 mt-2">"""
content = content.replace(old_tablet_title, new_tablet_title)

old_tablet_body = """<p className="font-['Inter:Regular'] font-normal leading-[18px] text-[#5f687b] text-[12px] w-full line-clamp-2">"""
new_tablet_body = """<p className="font-['Inter:Regular'] font-normal text-[#5f687b] text-[length:var(--font-caption)] w-full line-clamp-2 mt-1">"""
content = content.replace(old_tablet_body, new_tablet_body)

# MobileLayout Typography (this is slightly different format)
old_mobile_title = """<p className="font-['Inter:Semi_Bold'] font-semibold text-[#182033] text-[14px] line-clamp-2">"""
new_mobile_title = """<p className="font-['Inter:Semi_Bold'] font-semibold text-[#182033] text-[length:var(--font-h4)] line-clamp-2">"""
content = content.replace(old_mobile_title, new_mobile_title)

old_mobile_body = """<p className="font-['Inter:Regular'] font-normal leading-[21px] text-[#182033] text-[14px]">"""
new_mobile_body = """<p className="font-['Inter:Regular'] font-normal text-[#182033] text-[length:var(--font-body)] mt-2">"""
content = content.replace(old_mobile_body, new_mobile_body)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")