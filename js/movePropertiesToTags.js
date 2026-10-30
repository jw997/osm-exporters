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



	//const bInside = turf.inside(pt, feature);

	//	if (bInside) {
	//	console.log("Contains Berkeley");
	//}

	return feature;
}

// read  berkely boundary

// read ncic codes
//const berkJson = fs.readFileSync('./data/Land_Boundary.geojson');
//const berk = JSON.parse(berkJson);
//const berkPolygon = makeTurfFromFeature(berk.features[0].geometry)

//const berkJson = fs.readFileSync('./berkborderpp.geojson');
//const berk = JSON.parse(berkJson);
//const berkPolygon = makeTurfFromFeature(berk.features[0].geometry)

//2409837

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
const kvArray = [
  ["N", "node"],
  ["W", "way"],
  ["R", 'relation']
];

const mapOsmTypeToType = new Map(kvArray);

function fixProperties(props) {
    // make sure there is a tags property
	props.tags = props.tags ?? {};

	// rename osm_id to id, osm_type to type
/*
	 "type": "Feature",
      "properties": {
        "osm_id": 12986930869,
        "osm_type": "N",
*/
	if (props.osm_id) {
		const val = props.osm_id;
		props.id = val;
		delete props.osm_id;
	}
	if (props.osm_type) {
		const val = props.osm_type;
		props.type = mapOsmTypeToType.get(val);
		// change N to node, W to way, R to relation

		delete props.osm_type;
	}

	

	for (const property in props) {
		if (['id', 'type', 'tags'].includes(property)) {
			// do nothing
		} else {
			// move it to tags
			const val = props[property];
			props.tags[property] = val;
			delete props[property];

		}
	}
}


for (const f of input.features) {
	fixProperties( f.properties)



}

/*
const berkFeatures = [];
for (const f of input.features) {

	 
	// if (turf.booleanContains( berkPolygon, f)) {
	if (turf.booleanIntersects( berkPolygon, f)) {        
		berkFeatures.push(f)
	} else {
		console.log( "Skipping feature ", f.properties.id, f.properties.type)

	}

}

input.features = berkFeatures;
*/


// write out new geojson
const str = JSON.stringify(input, null, 2)
fs.writeFileSync(outFile, str)


console.log('bye')