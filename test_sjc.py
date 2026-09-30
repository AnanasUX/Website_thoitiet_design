import urllib.request
import xml.etree.ElementTree as ET

url = "https://sjc.com.vn/xml/tygiavang.xml"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as response:
        xml_data = response.read().decode('utf-8')
        root = ET.fromstring(xml_data)
        for ratelist in root.findall('ratelist'):
            for city in ratelist.findall('city'):
                for item in city.findall('item'):
                    print(item.get('type'), item.get('buy'), item.get('sell'))
except Exception as e:
    print("Direct fail:", e)

proxy_url = "https://api.allorigins.win/raw?url=" + url
req = urllib.request.Request(proxy_url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as response:
        xml_data = response.read().decode('utf-8')
        print("Proxy success!")
except Exception as e:
    print("Proxy fail:", e)