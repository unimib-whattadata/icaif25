#!/usr/bin/env python3
"""Extract cartography from an Overpass JSON snapshot.
Usage: python3 scripts/prepare-venue-map.py /tmp/icaif-venue-osm.json
Reproduce the query in assets/venue/overpass.txt; see assets/venue/README.md.
"""
import json
import sys
from collections import Counter
from pathlib import Path

raw = json.loads(Path(sys.argv[1]).read_text())
features = []
for item in raw['elements']:
    tags = item.get('tags', {})
    if item['type'] == 'node':
        if tags.get('railway') == 'station':
            features.append({'type':'Feature','properties':{'kind':'station','name':tags.get('name','')},'geometry':{'type':'Point','coordinates':[item['lon'],item['lat']]}})
        continue
    coords = [[round(p['lon'],5),round(p['lat'],5)] for p in item.get('geometry', [])]
    coords = [p for i,p in enumerate(coords) if i == 0 or p != coords[i-1]]
    if len(coords) < 2:
        continue
    props = {'name': tags.get('name', ''), 'osm_id':item['id']}
    polygon = False
    if 'highway' in tags:
        props['kind'] = 'road'
        props['class'] = 'major' if tags['highway'] in {'primary','secondary'} else 'secondary' if tags['highway'] == 'tertiary' else 'minor'
    elif tags.get('natural') == 'water':
        props['kind'] = 'water'; polygon = True
    elif 'waterway' in tags:
        props['kind'] = 'waterway'
    elif tags.get('leisure') == 'park':
        props['kind'] = 'park'; polygon = True
    elif 'building' in tags:
        props['kind'] = 'venue' if item['id'] == 35780519 else 'building'; polygon = True
    elif tags.get('amenity') == 'university':
        props['kind'] = 'campus'; polygon = True
    else:
        continue
    if polygon:
        if len(coords) < 4 or coords[0] != coords[-1]:
            continue
        area = sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(coords,coords[1:]))
        if area > 0:
            coords.reverse()
    features.append({'type':'Feature','properties':props,'geometry':{'type':'Polygon' if polygon else 'LineString','coordinates':[coords] if polygon else coords}})
result = {'type':'FeatureCollection','attribution':'© OpenStreetMap contributors, ODbL','snapshot':raw.get('osm3s',{}).get('timestamp_osm_base'),'features':features}
out = Path(__file__).resolve().parent.parent / 'assets/venue/milan.geojson'
out.write_text(json.dumps(result,separators=(',',':'),ensure_ascii=False))
print(Counter(f['properties']['kind'] for f in features))
