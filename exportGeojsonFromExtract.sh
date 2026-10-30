#!/bin/bash
set -e
#download norcal latest

#extract berkeley  from it 
osmium extract --strategy=smart -S types=any -p berkborderpp.geojson --overwrite -o berkeley1.pbf norcal-latest.osm.pbf 
osmium extract --strategy=complete_ways  -p berkborderpp.geojson --overwrite -o berkeley2.pbf norcal-latest.osm.pbf 
osmium extract --strategy=simple  -p berkborderpp.geojson --overwrite -o berkeley3.pbf norcal-latest.osm.pbf 


#convert to geojson
osmium export -c config.osmium.export --overwrite -o berkeley1.geojson berkeley1.pbf
osmium export -c config.osmium.export --overwrite -o berkeley2.geojson berkeley2.pbf
osmium export -c config.osmium.export --overwrite -o berkeley3.geojson berkeley3.pbf
 
#use js to put the tags in the old overpass format
node js/movePropertiesToTags.js berkeley1.geojson  berkeleyAllTags.geojson
  
#use js to filter to the appropriate tags
node js/filterBusiness.js berkeleyAllTags.geojson berkeleyVacancy1.geojson
node js/filterAmenityParking.js berkeleyAllTags.geojson berkeleyExtractParking1.geojson
 
#use js to trim again to berkeley
node js/clipToBerkeley.js  berkeleyVacancy1.geojson berkeleyExtractVacancy.geojson
node js/clipToBerkeley.js  berkeleyParking1.geojson berkeleyExtractParking.geojson


ogrinfo -al -so berkeleyExtractParking.geojson | grep Feature
ogrinfo -al -so berkeleyExtractVacancy.geojson | grep Feature

 
 
 
