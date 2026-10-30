#!/bin/bash
set -e

curl -o vacancy1.geojson https://postpass.geofabrik.de/api/interpreter --data-urlencode "data=
  SELECT osm_id, osm_type, tags, geom 
  FROM postpass_pointlinepolygon
  WHERE (
  tags->>'tourism'='hotel' 
  OR
   tags->>'tourism'='motel' 
  OR   
   tags ?| ARRAY['amenity','craft', 'shop', 'office','leisure','healthcare']
  OR   
   tags ?| ARRAY[ 'disused:amenity', 'disused:shop', 'disused:leisure', 'disused:building',
     'disused:craft', 'disused:office', 'disused:healthcare' ]
  OR (
   tags->>'disused'='yes'  AND tags ? 'building'
  )
  OR
   tags->>'vacant'='yes' 
  OR
   tags->>'abandoned'='yes' 
  OR
   tags ? 'landuse'
  )
  AND geom && ST_SetSRID(ST_MakeBox2D(ST_MakePoint(-122.367,37.835), 
                         ST_MakePoint(-122.234,37.907)), 4326)
"

#ogr2ogr -f geojson -clipsrc Land_Boundary.geojson vacancy.berk.geojson vacancy.geojson

#jq -c  '
#  .features[] |= (
#    if .properties.osm_type == "N" then .properties.type = "node"
#    elif .properties.osm_type == "W" then .properties.type = "way"
#    elif .properties.osm_type == "R" then .properties.type = "relation"
#    else .
#    end
#    | .properties |= del(.osm_type)
#  )
#' vacancy.berk.geojson > vacancy.geojson
node js/movePropertiesToTags.js vacancy1.geojson vacancy2.geojson

node js/clipToBerkeley.js   vacancy2.geojson vacancyPostpass.geojson



 ogrinfo -al -so vacancyPostpass.geojson | grep Feature
