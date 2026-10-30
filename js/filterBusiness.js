'use strict';

import fs from 'fs'
import * as turf from "@turf/turf";

for (let j = 0; j < process.argv.length; j++) {
	console.log(j + ' -> ' + (process.argv[j]));
}

const inputGeoJson = process.argv[2] ?? 'input.geojson';
const outFile = process.argv[3] ?? 'movedTags.geojson';

var lastTime = 0;
function getMS(msg) {
	const thisTime = Date.now();
	const diff = thisTime - lastTime;
	lastTime = thisTime;

	if (msg) {
		console.log(msg, ':', diff, ' ms')
	}
	return diff;
}

function makeTurfFromFeature(geometry) {

	//var pt = turf.point([-122.2788, 37.847100]);

	var feature = turf.feature(geometry);
	feature.bbox = turf.bbox(feature);
	return feature;
}



// read input feature collection json
const inputJson = fs.readFileSync(inputGeoJson);
const input = JSON.parse(inputJson)

/*
# update properties to match old overpass format
# properties id, type, tags
# all others under tags
#       {
#            "type": "Feature",
#            "properties": {
#                "type": "node",
#                "id": 12918571280,
#                "tags": {
#                    "access": "yes",
#                    "amenity": "parking",
#                    "capacity": "59",
#                    "layer": "-1",
#                    "parking": "underground"
#                }
#            },
#            "geometry": {
#                "type": "Point",
#                "coordinates": [
#                    -122.2634762,
#                    37.867576
#                ]
#            }
#        },

*/

/*
 nwr["tourism"="hotel"](area.searchArea);
   nwr["tourism"="motel"](area.searchArea);
   nwr["amenity"] (area.searchArea);
   nwr["craft"] (area.searchArea);
   nwr["shop"]      (area.searchArea);
   nwr["office"]      (area.searchArea);
   nwr["leisure"] (area.searchArea); 
   nwr["healthcare"] (area.searchArea); 
    
   nwr["disused:amenity"] (area.searchArea);
   nwr["disused:shop"] (area.searchArea);
   nwr["disused:leisure"] (area.searchArea);
   nwr["disused:building"] (area.searchArea);
   nwr["disused:craft"] (area.searchArea);
   nwr["disused:office"] (area.searchArea);
   nwr["disused:healthcare"] (area.searchArea);

   nwr["building"="industrial"]["disused"="yes"](area.searchArea);
   nwr["building"]["disused"="yes"](area.searchArea);

   node["vacant"="yes"] (area.searchArea);
   nwr["abandoned"="yes"] (area.searchArea);
   nwr["landuse"] (area.searchArea);
*/

const arrKeysToKeep = ['amenity','craft', 'shop', 'office','leisure', 'healthcare',
'disused:amenity','disused:shop', 'disused:leisure', 'disused:building','disused:craft','disused:office', 'disused:healthcare',
'landuse'
]

const arrKVToKeep = [['tourism','motel'],['tourism','hotel']]

function isDisused(f) {
	const val = f.properties.tags.disused;
	const retval = (val == 'yes');
	return retval
}
const YES = 'yes'

function isCommercial(f) {
	const tags = f.properties.tags;
	const isDisused = (tags.disused == YES);
	const isVacant = (tags.vacant == YES);
	const isAbandoned = (tags.abandoned == YES)
	const isBuilding = (tags.building != undefined)
	
	for (const category of arrKeysToKeep) {
		if (tags[category]) {
			return true;
		}
	}
	for (const [k,v] of arrKVToKeep) {
		if (tags[k] == v) {
			return true;
		}
	}
	if (isVacant || isAbandoned) {
		return true;
	}
	if (isBuilding && isDisused) {
		return true;
	}
	return false
}
const arrAmenityParking = [];

for (const f of input.features) {
	if (isCommercial(f)) {
		arrAmenityParking.push(f)
	} else {
		//console.log('skipping feature ', f)
	}
}

input.features = arrAmenityParking;

// write out new geojson
const str = JSON.stringify(input, null, 2)
fs.writeFileSync(outFile, str)

console.log('bye')