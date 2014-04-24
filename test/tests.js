var WGS84Util = require('../');
var assert = require('assert');
var PI = Math.PI;

describe('WGS84Coord', function()
{
	it('degToRad(90) should return pi/2 radians', function() {
		assert.equal(WGS84Util.degToRad(90), (PI / 2));
	});

	it('radToDeg(pi/2) should return 90 degrees', function() {
		assert.equal(WGS84Util.radToDeg(PI / 2), 90);
	});

   // SFO
	it('LLtoUTM({latitude: 37.6194847, longitude: -122.3738936}) should return 10N 555253.6E 4163781.7N', function() {
		var latlng = {
			latitude: 37.6194847,
			longitude: -122.3738936
		};

		var utm = WGS84Util.LLtoUTM(latlng);

		assert.equal(utm.easting, 555253.6);
		assert.equal(utm.northing, 4163781.7);
		assert.equal(utm.gridZone, 10);
		
	});

   // Sydney, Australia
	it('LLtoUTM({latitude: -34, longitude: 151}) should return 56S 315290.2E 6236040.9N', function() {
		var latlng = {
			latitude: -34,
			longitude: 151
		};

		var utm = WGS84Util.LLtoUTM(latlng);

		assert.equal(utm.easting, 315290.2);
		assert.equal(utm.northing, 6236040.9);
		assert.equal(utm.gridZone, 56);
		
	});

   // SFO
	it('UTMtoLL({easting: 555253.6, northing: 4163781.7, zoneLetter: N, zoneNumber: 10}) should return {latitude: 37.61948461, longitude: -122.37389327}', function() {
		var utm = {
			easting: 555253.6,
			northing: 4163781.7,
			zoneLetter: 'N',
			zoneNumber: 10
		};

		var latlng = WGS84Util.UTMtoLL(utm);

		assert.equal(latlng.latitude, 37.61948461);
		assert.equal(latlng.longitude, -122.37389327);

	});

   // Sydney, Australia
	it('UTMtoLL({easting: 315290.2, northing: 6237546.4, zoneLetter: S, zoneNumber: 56}) should return {latitude: -33.98642995, longitude: 151.00031839}', function() {
		var utm = {
			easting: 315290.2,
			northing: 6237546.4,
			zoneLetter: 'S',
			zoneNumber: 56
		};

		var latlng = WGS84Util.UTMtoLL(utm);

		assert.equal(latlng.latitude, -33.98642995);
		assert.equal(latlng.longitude, 151.00031839);

	});	

	it('distanceBetween({latitude: 40, longitude: -70}, {latitude: 40.7419, longitude: -73.9930}) should return 348.5387223209787 km', function() {
		assert.equal(WGS84Util.distanceBetween({latitude: 40, longitude: -70}, {latitude: 40.7419, longitude: -73.9930}) / 1000, 348.5387223209787);
	});

   // SFO
	it('destinationPoint({"type": "Point", "coordinates": [37.6194847, -122.3738936]}, 45.333333333333336, 59200) should return {"type": "Point", "coordinates": [37.9923622446, -121.8939734865]}', function() {
		var destCoordinate = WGS84Util.destinationPoint({"type": "Point", "coordinates": [37.6194847, -122.3738936]}, 45.333333333333336, 59200);

		assert.equal(destCoordinate.coordinates[0], 37.9923622446);
		assert.equal(destCoordinate.coordinates[1], -121.8939734865);
	});

	// Sydney, Australia
	it('destinationPoint({"type": "Point", "coordinates": [-33.98642995, 151.00031839]}, 0, 59200) should return {"type": "Point", "coordinates": [-33.4546273018, 151.0003183900]}', function() {
		var destCoordinate = WGS84Util.destinationPoint({"type": "Point", "coordinates": [-33.98642995, 151.00031839]}, 0, 59200);

		assert.equal(destCoordinate.coordinates[0], -33.4546273018);
		assert.equal(destCoordinate.coordinates[1], 151.0003183900);
	});

});