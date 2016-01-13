WGS84Util = require('../')
expect = require('expect.js')
PI = Math.PI
SFO = null
Sydney = null
Miami = null
Ushuaia = null

describe 'WGS84Coord', ->
   beforeEach ->
      # 37° 37′ 08.0004″N
      # 122° 22′ 30.0000″W
      SFO =
         "type": "Point"
         "coordinates": [-122.375, 37.618889]

      # 33° 51′ 54.0000″S
      # 151° 12′ 33.9984″E
      Sydney =
         "type": "Point"
         "coordinates": [151.209444, -33.865]

      # 54° 48′ 0″ S
      # 68° 18′ 0″ W
      Ushuaia =
         "type": "Point"
         "coordinates": [-68.3, -54.8]

      # 25° 46′ 31″ N
      # 80° 12′ 32″ W
      Miami =
         "type": "Point"
         "coordinates": [-80.208889, 25.775278]

   describe 'degToRad(deg)', ->

      it 'should calculate correct radians from deg', ->
         expect(WGS84Util.degToRad(90)).to.equal (PI / 2)

   describe 'radToDeg(rad)', ->

      it 'should calculate correct degrees from rad', ->
         expect(WGS84Util.radToDeg(PI / 2)).to.equal 90

   describe 'LLtoUTM(ll)', ->

      it 'should convert a GeoJSON point to UTM point (North)', ->
         utm = WGS84Util.LLtoUTM(SFO);

         expect(utm.geometry.coordinates[0]).to.equal 555156.4
         expect(utm.geometry.coordinates[1]).to.equal 4163715
         expect(utm.properties.zoneLetter).to.equal 'N'
         expect(utm.properties.zoneNumber).to.equal 10

      it 'should convert a GeoJSON point to UTM point (South)', ->
         utm = WGS84Util.LLtoUTM(Sydney)

         expect(utm.geometry.coordinates[0]).to.equal 334374.6
         expect(utm.geometry.coordinates[1]).to.equal 6251370
         expect(utm.properties.zoneLetter).to.equal 'S'
         expect(utm.properties.zoneNumber).to.equal 56

   describe 'UTMtoLL(utm)', ->

      it 'should convert a UTM point to GeoJSON point with longitude and latitude (North)', ->
         utm =
            "type": "Feature"
            "geometry": WGS84Util.LLtoUTM(SFO).geometry
            "properties": {"zoneLetter": 'N', "zoneNumber": 10}

         latlng = WGS84Util.UTMtoLL(utm)

         expect(latlng.coordinates[0]).to.equal -122.3749996641
         expect(latlng.coordinates[1]).to.equal 37.6188892858

      it 'should convert a UTM point to GeoJSON point with longitude and latitude (South)', ->
         utm =
            "type": "Feature"
            "geometry": WGS84Util.LLtoUTM(Sydney).geometry
            "properties": {"zoneLetter": 'S', "zoneNumber": 56}

         latlng = WGS84Util.UTMtoLL(utm);

         expect(latlng.coordinates[0]).to.equal 151.2094438586
         expect(latlng.coordinates[1]).to.equal -33.8649998489

   describe 'distanceBetween(pointA, pointB, bearings)', ->

      it 'should calculate the distance between two points (North)', ->
         distance = WGS84Util.distanceBetween(Sydney, SFO)
         expect(distance).to.equal 11929093.5189

      it 'should calculate the distance between two points (South)', ->
         distance = WGS84Util.distanceBetween(SFO, Sydney)
         expect(distance).to.equal 11929093.5189

      it 'should also return distance and bearings when setting bearings switch', ->
         results = WGS84Util.distanceBetween(SFO, Sydney, true)
         expect(results.distance).to.equal 11929093.5189
         expect(results.initialBearing).to.equal 240.45353888221996
         expect(results.finalBearing).to.equal 236.1028035327904

   describe 'bearingsBetween(pointA, pointB)', ->

      it 'should calculate the initial and final bearings between two points (North)', ->
         bearings = WGS84Util.bearingsBetween(Sydney, SFO)
         expect(bearings.initialBearing).to.equal 56.102803532790425
         expect(bearings.finalBearing).to.equal 60.453538882219966

      it 'should calculate the initial and final bearings between two points (South)', ->
         bearings = WGS84Util.bearingsBetween(SFO, Sydney)
         expect(bearings.initialBearing).to.equal 240.45353888221996
         expect(bearings.finalBearing).to.equal 236.1028035327904

   describe 'destination(point, bearing, distance)', ->
      it 'should calculate the destination point and final bearing given initial bearing and distance (North)', ->
         destination = WGS84Util.destination(Ushuaia, 349.123708, 8999490.846)
         expect(destination.point.coordinates[0]).to.equal -80.2088887002
         expect(destination.point.coordinates[1]).to.equal 25.7752778026
         expect(destination.finalBearing).to.equal 353.05145586712024

      it 'should calculate the destination point and final bearing given initial bearing and distance (South)', ->
         destination = WGS84Util.destination(Miami, 173.051456, 8999490.846)
         expect(destination.point.coordinates[0]).to.equal -68.3000005798
         expect(destination.point.coordinates[1]).to.equal -54.7999998325
         expect(destination.finalBearing).to.equal 169.12370827323568
