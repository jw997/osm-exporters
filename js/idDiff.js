'use strict';

import fs from 'fs'
import * as turf from "@turf/turf";

for (let j = 0; j < process.argv.length; j++) {
	console.log(j + ' -> ' + (process.argv[j]));
}

// find all the ids of 2 feature collcection files and report the diffs
const leftFile = process.argv[2] ?? 'left.geojson';
const rightFile = process.argv[3] ?? 'rigth.geojson';

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
const leftJson = fs.readFileSync(leftFile);
const left = JSON.parse(leftJson)

const rightJson = fs.readFileSync(rightFile);
const right = JSON.parse(rightJson);

const arrLeftIds = []
const arrRightIds = []

const setLeftIds = new Set()
const setRightIds = new Set()

for (const f of left.features) {
	const id = f.properties.id;
	if (id) {
		arrLeftIds.push(id)
		setLeftIds.add(id)
	} else {
		console.log("No id for feature ", f)
	}
}

for (const f of right.features) {
	const id = f.properties.id;
	if (id) {
		arrRightIds.push(id)
		setRightIds.add(id)
	} else {
		console.log("No id for feature ", f)
	}
}

// now show the diffs
for (const id of arrLeftIds) {
	if (!setRightIds.has(id)) {
		console.log ("< ", id)
	}
}

for (const id of arrRightIds) {
	if (!setLeftIds.has(id)) {
		console.log ("> ", id)
	}
}
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



console.log('bye')