import urllib.request
import json
req = urllib.request.Request("https://api.github.com/repos/AnanasUX/Website_thoitiet_design/actions/runs")
res = urllib.request.urlopen(req)
data = json.loads(res.read().decode("utf-8"))
runs = data.get("workflow_runs", [])
if runs:
    print("Latest run:", runs[0]["conclusion"], runs[0]["status"])
else:
    print("No runs")