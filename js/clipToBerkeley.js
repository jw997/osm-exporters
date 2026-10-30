'use strict';

import fs from 'fs'
import * as turf from "@turf/turf"; 

for (let j = 0; j < process.argv.length; j++) {
	console.log(j + ' -> ' + (process.argv[j]));
}

const inputGeoJson = process.argv[2] ?? 'input.geojson';
const outFile  = process.argv[3] ?? 'clipped.geojson';

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

const berkJson = fs.readFileSync('./data/berkborderpp.geojson');
const berk = JSON.parse(berkJson);
const berkPolygon = makeTurfFromFeature(berk.features[0].geometry)

//2409837

// read input feature collection json
const inputJson = fs.readFileSync( inputGeoJson);
const input =JSON.parse(inputJson)


const berkFeatures = [];
for (const f of input.features) {

	 
	// if (turf.booleanContains( berkPolygon, f)) {
    if (turf.booleanIntersects( berkPolygon, f)) {        
        berkFeatures.push(f)
    } else {
		//console.log( "Skipping feature ", f.properties.id, f.properties.type)

	}

}

input.features = berkFeatures;



// write out new geojson
const str = JSON.stringify(input,null, 2)
fs.writeFileSync(outFile, str)

// make a turn polygon for the border of berkley



console.log('bye')