(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** @fileOverview Geographic coordinate utilities using WGS84 datum
 *  @author cs_brandt
 *  @date 02/25/2013
 */


/** @module wgs84-util */
var WGS84Util = exports;

// Semi-Major Axis (Equatorial Radius)
var SEMI_MAJOR_AXIS = 6378137.0;
// First Eccentricity Squared
var ECC_SQUARED = 0.006694380004260827;

/**
 * From: Haversine formula - RW Sinnott, "Virtues of the Haversine",
 *       Sky and Telescope, vol 68, no 2, 1984
 *
 * @param {object} coordA GeoJSON point
 * @param {object} coordB GeoJSON point
 * @return {number} the distance from this point to the supplied point, in km
 * (using Haversine formula)
 *
 */
WGS84Util.distanceBetween = function(coordA, coordB) {
  var lat1 = this.degToRad(coordA.coordinates[1]), lon1 = this.degToRad(coordA.coordinates[0]);
  var lat2 = this.degToRad(coordB.coordinates[1]), lon2 = this.degToRad(coordB.coordinates[0]);
  var dLat = lat2 - lat1;
  var dLon = lon2 - lon1;

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1) * Math.cos(lat2) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = SEMI_MAJOR_AXIS * c;
  return d;
};

/**
 * Returns the destination point from this point having travelled the given distance (in m) on the
 * given initial bearing (bearing may vary before destination is reached)
 *
 *   see http://williams.best.vwh.net/avform.htm#LL
 *
 * @param   {object} coordA GeoJSON point
 * @param   {Number} brng: Initial bearing in degrees
 * @param   {Number} dist: Distance in m
 *
 * @returns {object} GeoJSON destination point
 */
WGS84Util.destinationPoint = function(coordA, brng, dist) {
  dist = typeof(dist) == 'number' ? dist : typeof(dist) == 'string' && dist.trim() != '' ? +dist : NaN;
  dist = dist / SEMI_MAJOR_AXIS;  // convert dist to angular distance in radians
  brng = this.degToRad(brng);  //
  var lat1 = this.degToRad(coordA.coordinates[1]), lon1 = this.degToRad(coordA.coordinates[0]);

  var lat2 = Math.asin( Math.sin(lat1) * Math.cos(dist) +
                        Math.cos(lat1) * Math.sin(dist) * Math.cos(brng) );
  var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) * Math.cos(lat1),
                               Math.cos(dist) - Math.sin(lat1) * Math.sin(lat2));
  lon2 = (lon2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI;  // normalise to -180..+180º

  return {
    "type": "Point",
    "coordinates": [parseFloat(this.radToDeg(lon2).toFixed(10)), parseFloat(this.radToDeg(lat2).toFixed(10))]
  };
};

/**
 * Conversion from degrees to radians.
 *
 * @param {number} deg the angle in degrees.
 * @return {number} the angle in radians.
 */
WGS84Util.degToRad = function(deg) {
    return (deg * (Math.PI / 180.0));
};

/**
 * Conversion from radians to degrees.
 *
 * @param {number} rad the angle in radians.
 * @return {number} the angle in degrees.
 */
WGS84Util.radToDeg = function(rad) {
    return (180.0 * (rad / Math.PI));
};

/**
 * Converts a set of Longitude and Latitude co-ordinates to UTM
 * using the WGS84 ellipsoid.
 *
 * @param {object} ll Object literal with lat and lon properties
 *     representing the WGS84 coordinate to be converted.
 * @return {object} Object literal containing the UTM value with easting,
 *     northing, zoneNumber and zoneLetter properties, and an optional
 *     accuracy property in digits. Returns null if the conversion failed.
 */
WGS84Util.LLtoUTM = function(ll) {
    var Lat = ll.coordinates[1];
    var Long = ll.coordinates[0];
    var k0 = 0.9996;
    var LongOrigin;
    var eccPrimeSquared;
    var N, T, C, A, M;
    var LatRad = this.degToRad(Lat);
    var LongRad = this.degToRad(Long);
    var LongOriginRad;
    var ZoneNumber;
    var zoneLetter = 'N';
    // (int)
    ZoneNumber = Math.floor((Long + 180) / 6) + 1;

    //Make sure the longitude 180.00 is in Zone 60
    if (Long === 180) {
        ZoneNumber = 60;
    }

    // Special zone for Norway
    if (Lat >= 56.0 && Lat < 64.0 && Long >= 3.0 && Long < 12.0) {
        ZoneNumber = 32;
    }

    // Special zones for Svalbard
    if (Lat >= 72.0 && Lat < 84.0) {
        if (Long >= 0.0 && Long < 9.0) {
            ZoneNumber = 31;
        } else if (Long >= 9.0 && Long < 21.0) {
            ZoneNumber = 33;
        } else if (Long >= 21.0 && Long < 33.0) {
            ZoneNumber = 35;
        } else if (Long >= 33.0 && Long < 42.0) {
            ZoneNumber = 37;
        }
    }

    LongOrigin = (ZoneNumber - 1) * 6 - 180 + 3; //+3 puts origin
    // in middle of
    // zone
    LongOriginRad = this.degToRad(LongOrigin);

    eccPrimeSquared = (ECC_SQUARED) / (1 - ECC_SQUARED);

    N = SEMI_MAJOR_AXIS / Math.sqrt(1 - ECC_SQUARED * Math.sin(LatRad) * Math.sin(LatRad));
    T = Math.tan(LatRad) * Math.tan(LatRad);
    C = eccPrimeSquared * Math.cos(LatRad) * Math.cos(LatRad);
    A = Math.cos(LatRad) * (LongRad - LongOriginRad);

    M = SEMI_MAJOR_AXIS * ((1 - ECC_SQUARED / 4 - 3 * ECC_SQUARED * ECC_SQUARED / 64 - 5 * ECC_SQUARED * ECC_SQUARED * ECC_SQUARED / 256) * LatRad - (3 * ECC_SQUARED / 8 + 3 * ECC_SQUARED * ECC_SQUARED / 32 + 45 * ECC_SQUARED * ECC_SQUARED * ECC_SQUARED / 1024) * Math.sin(2 * LatRad) + (15 * ECC_SQUARED * ECC_SQUARED / 256 + 45 * ECC_SQUARED * ECC_SQUARED * ECC_SQUARED / 1024) * Math.sin(4 * LatRad) - (35 * ECC_SQUARED * ECC_SQUARED * ECC_SQUARED / 3072) * Math.sin(6 * LatRad));

    var UTMEasting = (k0 * N * (A + (1 - T + C) * A * A * A / 6.0 + (5 - 18 * T + T * T + 72 * C - 58 * eccPrimeSquared) * A * A * A * A * A / 120.0) + 500000.0);

    var UTMNorthing = (k0 * (M + N * Math.tan(LatRad) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24.0 + (61 - 58 * T + T * T + 600 * C - 330 * eccPrimeSquared) * A * A * A * A * A * A / 720.0)));

    if (Lat < 0.0) {
        UTMNorthing += 10000000.0; //10000000 meter offset for
        // southern hemisphere
        zoneLetter = 'S';
    }

    return {"type": "Feature", "geometry": {"type": "Point", "coordinates": [parseFloat(UTMEasting.toFixed(1)), parseFloat(UTMNorthing.toFixed(1))]}, "properties": {"zoneLetter": zoneLetter, "zoneNumber": ZoneNumber}};
};

/**
 * Converts UTM coords to lat/long, using the WGS84 ellipsoid. This is a convenience
 * class where the Zone can be specified as a single string eg."60N" which
 * is then broken down into the ZoneNumber and ZoneLetter.
 *
 * @param {object} utm An object literal with northing, easting, zoneNumber
 *     and zoneLetter properties. If an optional accuracy property is
 *     provided (in meters), a bounding box will be returned instead of
 *     latitude and longitude.
 * @return {object} An object literal containing either lat and lon values
 *     (if no accuracy was provided), or top, right, bottom and left values
 *     for the bounding box calculated according to the provided accuracy.
 *     Returns null if the conversion failed.
 */
WGS84Util.UTMtoLL = function(utm) {
    var UTMNorthing = utm.geometry.coordinates[1];
    var UTMEasting = utm.geometry.coordinates[0];
    var zoneLetter = utm.properties.zoneLetter;
    var zoneNumber = utm.properties.zoneNumber;
    // check the ZoneNummber is valid
    if (zoneNumber < 0 || zoneNumber > 60) {
        return null;
    }

    var k0 = 0.9996;
    var eccPrimeSquared;
    var e1 = (1 - Math.sqrt(1 - ECC_SQUARED)) / (1 + Math.sqrt(1 - ECC_SQUARED));
    var N1, T1, C1, R1, D, M;
    var LongOrigin;
    var mu, phi1Rad;

    // remove 500,000 meter offset for longitude
    var x = UTMEasting - 500000.0;
    var y = UTMNorthing;

    // We must know somehow if we are in the Northern or Southern
    // hemisphere, this is the only time we use the letter So even
    // if the Zone letter isn't exactly correct it should indicate
    // the hemisphere correctly
    if (zoneLetter === 'S') {
        y -= 10000000.0; // remove 10,000,000 meter offset used
        // for southern hemisphere
    }

    // There are 60 zones with zone 1 being at West -180 to -174
    LongOrigin = (zoneNumber - 1) * 6 - 180 + 3; // +3 puts origin
    // in middle of
    // zone
    eccPrimeSquared = (ECC_SQUARED) / (1 - ECC_SQUARED);

    M = y / k0;
    mu = M / (SEMI_MAJOR_AXIS * (1 - ECC_SQUARED / 4 - 3 * ECC_SQUARED * ECC_SQUARED / 64 - 5 * ECC_SQUARED * ECC_SQUARED * ECC_SQUARED / 256));

    phi1Rad = mu + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu) + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu) + (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu);
    // double phi1 = ProjMath.radToDeg(phi1Rad);
    N1 = SEMI_MAJOR_AXIS / Math.sqrt(1 - ECC_SQUARED * Math.sin(phi1Rad) * Math.sin(phi1Rad));
    T1 = Math.tan(phi1Rad) * Math.tan(phi1Rad);
    C1 = eccPrimeSquared * Math.cos(phi1Rad) * Math.cos(phi1Rad);
    R1 = SEMI_MAJOR_AXIS * (1 - ECC_SQUARED) / Math.pow(1 - ECC_SQUARED * Math.sin(phi1Rad) * Math.sin(phi1Rad), 1.5);
    D = x / (N1 * k0);

    var lat = phi1Rad - (N1 * Math.tan(phi1Rad) / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * eccPrimeSquared) * D * D * D * D / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * eccPrimeSquared - 3 * C1 * C1) * D * D * D * D * D * D / 720);
    lat = this.radToDeg(lat);

    var lon = (D - (1 + 2 * T1 + C1) * D * D * D / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * eccPrimeSquared + 24 * T1 * T1) * D * D * D * D * D / 120) / Math.cos(phi1Rad);
    lon = LongOrigin + this.radToDeg(lon);

    var result = { "type": "Point", "coordinates": [] };
    if (utm.accuracy) {
        var topRight = this.UTMtoLL({
            northing: utm.northing + utm.accuracy,
            easting: utm.easting + utm.accuracy,
            zoneLetter: utm.zoneLetter,
            zoneNumber: utm.zoneNumber
        });
        result = {
            top: topRight.lat,
            right: topRight.lon,
            bottom: lat,
            left: lon
        };
    } else {
        result.coordinates[0] = parseFloat(lon.toFixed(8));
        result.coordinates[1] = parseFloat(lat.toFixed(8));
    }

    return result;
};

},{}]},{},[1])