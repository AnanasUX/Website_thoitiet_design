with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Starts
content = content.replace("{/* Featured feed card */}", "{isFetchingCategory ? <NewsSkeleton /> : (<>\n          {/* Featured feed card */}")
content = content.replace("{/* Featured article */}", "{isFetchingCategory ? <NewsSkeleton /> : (<>\n          {/* Featured article */}")

# End Mobile
mobile_old = "</a>\n          ))}\n        </div>\n      </div>\n    </div>\n  );\n}"
mobile_new = "</a>\n          ))}\n          </>)}\n        </div>\n      </div>\n    </div>\n  );\n}"
content = content.replace(mobile_old, mobile_new)

# End Tablet
tablet_old = "</a>\n            ))}\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n}"
tablet_new = "</a>\n            ))}\n          </div>\n          </>)}\n        </div>\n      </div>\n    </div>\n  );\n}"
content = content.replace(tablet_old, tablet_new)

# End Desktop
desktop_old = "</a>\n            ))}\n          </div>\n\n          <div className=\"flex items-start justify-center py-2 w-full\">"
desktop_new = "</a>\n            ))}\n          </div>\n          </>)}\n\n          <div className=\"flex items-start justify-center py-2 w-full\">"
content = content.replace(desktop_old, desktop_new)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Safe explicit replace applied")