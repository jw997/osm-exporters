#!/bin/bash
set -e

# download from postpass using the bbox for Berkeley
rm -f parking.pp.geojson postpassParking.geojson  postpassParkingBerkeley.geojson

curl -o parking.pp.geojson https://postpass.geofabrik.de/api/interpreter --data-urlencode "data=
  SELECT osm_id, osm_type,
  tags, geom 
  FROM postpass_pointpolygon
  WHERE tags->>'amenity'='parking' 

  AND geom && ST_SetSRID(ST_MakeBox2D(ST_MakePoint(-122.367,37.835), 
                         ST_MakePoint(-122.234,37.907)), 4326)
"


#ogr2ogr -f geojson -clipsrc Land_Boundary.geojson parking.geojson parking.op.geojson
#ogr2ogr -f geojson -clipsrc berkborderpp.geojson parking.geojson parking.op.geojson
rm -f postpassParkingBerkeley.geojson
node js/clipToBerkeley.js  parking.pp.geojson postpassParkingBerkeley.geojson 

node js/movePropertiesToTags.js postpassParkingBerkeley.geojson postpassParking.geojson
# print feature count
ogrinfo -al -so postpassParking.geojson | grep Feature