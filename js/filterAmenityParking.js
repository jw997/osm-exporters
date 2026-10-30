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


function isAmenityParking(f) {
	const val = f.properties.tags.amenity;
	const retval = (val == 'parking');
	return retval
}
const arrAmenityParking = [];

for (const f of input.features) {
	if (isAmenityParking(f)) {
		arrAmenityParking.push(f)
	} else {
		console.log('skipping feature ', f)
	}
}

input.features = arrAmenityParking;

// write out new geojson
const str = JSON.stringify(input, null, 2)
fs.writeFileSync(outFile, str)

console.log('bye')