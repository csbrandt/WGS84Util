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
	it('LLtoUTM({"type": "Point", "coordinates": [37.6194847, -122.3738936]}) should return 10N 555253.6E 4163781.7N', function() {
		var latlng = {"type": "Point", "coordinates": [37.6194847, -122.3738936]};

		var utm = WGS84Util.LLtoUTM(latlng);

		assert.equal(utm.geometry.coordinates[0], 555253.6);
		assert.equal(utm.geometry.coordinates[1], 4163781.7);
		assert.equal(utm.properties.zoneLetter, 'N');
		assert.equal(utm.properties.zoneNumber, 10);
		
	});

   // Sydney, Australia
	it('LLtoUTM({"type": "Point", "coordinates": [-34, 151]}) should return 56S 315290.2E 6236040.9N', function() {
		var latlng = {"type": "Point", "coordinates": [-34, 151]};

		var utm = WGS84Util.LLtoUTM(latlng);

		assert.equal(utm.geometry.coordinates[0], 315290.2);
		assert.equal(utm.geometry.coordinates[1], 6236040.9);
		assert.equal(utm.properties.zoneLetter, 'S');
		assert.equal(utm.properties.zoneNumber, 56);
		
	});

   // SFO
	it('UTMtoLL({"type": "Feature", "geometry": {"type": "Point", "coordinates": [555253.6, 4163781.7]}, "properties": {"zoneLetter": "N", "zoneNumber": 10}})\n should return {"type": "Point", "coordinates": [37.61948461, -122.37389327]}', function() {
		var utm = { 
			"type": "Feature",
         "geometry": {"type": "Point", "coordinates": [555253.6, 4163781.7]},
         "properties": {"zoneLetter": 'N', "zoneNumber": 10}
      };

		var latlng = WGS84Util.UTMtoLL(utm);

		assert.equal(latlng.coordinates[0], 37.61948461);
		assert.equal(latlng.coordinates[1], -122.37389327);

	});

   // Sydney, Australia
	it('UTMtoLL({"type": "Feature", "geometry": {"type": "Point", "coordinates": [315290.2, 6237546.4]}, "properties": {"zoneLetter": "S", "zoneNumber": 56}})\n should return {"type": "Point", "coordinates": [-33.98642995, 151.00031839]}', function() {
		var utm = { 
			"type": "Feature",
         "geometry": {"type": "Point", "coordinates": [315290.2, 6237546.4]},
         "properties": {"zoneLetter": 'S', "zoneNumber": 56}
      };

		var latlng = WGS84Util.UTMtoLL(utm);

		assert.equal(latlng.coordinates[0], -33.98642995);
		assert.equal(latlng.coordinates[1], 151.00031839);

	});	

	it('distanceBetween({"type": "Point", "coordinates": [40, -70]}, {"type": "Point", "coordinates": [40.7419, -73.9930]}) should return 348.5387223209787 km', function() {
		assert.equal(WGS84Util.distanceBetween({"type": "Point", "coordinates": [40, -70]}, {"type": "Point", "coordinates": [40.7419, -73.9930]}) / 1000, 348.5387223209787);
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