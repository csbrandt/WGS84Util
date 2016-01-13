/** @fileOverview Geographic coordinate utilities using WGS84 datum
 *  @author cs_brandt
 *  @date 02/25/2013
 */


/** @module wgs84-util */
var WGS84Util = exports;

// Semi-Major Axis (Equatorial Radius)
var SEMI_MAJOR_AXIS = 6378137.0;
// Semi-Minor Axis
var SEMI_MINOR_AXIS = 6356752.314245;
// f = 1/298.257223563
var FLATTENING = 0.0033528106647474805;
// First Eccentricity Squared
var ECC_SQUARED = 0.006694380004260827;

/**
 * Calculate the distance between a set of GeoJSON points in meters
 * Uses Vincenty inverse calculation
 * Adapted from http://www.movable-type.co.uk/scripts/latlong-vincenty.html
 *
 * @param {object} pointA GeoJSON point
 * @param {object} pointB GeoJSON point
 * @param {boolean} bearings optional switch for including the bearings in degrees
 * @return {number | object} the distance from this point to the supplied point
 * in meters or an object that includes distance, initial and final bearings
 * @throws  {Error}  if formula failed to converge
 */
WGS84Util.distanceBetween = function(pointA, pointB, bearings) {
   var L = this.degToRad(pointB.coordinates[0]) - this.degToRad(pointA.coordinates[0]);

   var tanU1 = (1 - FLATTENING) * Math.tan(this.degToRad(pointA.coordinates[1])),
      cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)),
      sinU1 = tanU1 * cosU1;
   var tanU2 = (1 - FLATTENING) * Math.tan(this.degToRad(pointB.coordinates[1])),
      cosU2 = 1 / Math.sqrt((1 + tanU2 * tanU2)),
      sinU2 = tanU2 * cosU2;

   var lambda = L,
      lambdaPrime, iterationLimit = 100;

   do {
      var sinLambda = Math.sin(lambda),
         cosLambda = Math.cos(lambda);
      var sinSqSigma = (cosU2 * sinLambda) * (cosU2 * sinLambda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda);
      var sinSigma = Math.sqrt(sinSqSigma);

      if (sinSigma === 0) {
         return 0; // co-incident points
      }

      var cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
      var sigma = Math.atan2(sinSigma, cosSigma);
      var sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
      var cosSqAlpha = 1 - sinAlpha * sinAlpha;
      var cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;

      if (isNaN(cos2SigmaM)) {
         cos2SigmaM = 0; // equatorial line: cosSqAlpha=0 (§6)
      }

      var C = FLATTENING / 16 * cosSqAlpha * (4 + FLATTENING * (4 - 3 * cosSqAlpha));
      lambdaPrime = lambda;
      lambda = L + (1 - C) * FLATTENING * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));

   } while (Math.abs(lambda - lambdaPrime) > 1e-12 && --iterationLimit > 0);

   if (iterationLimit === 0) {
      throw new Error('Formula failed to converge');
   }

   var uSq = cosSqAlpha * (SEMI_MAJOR_AXIS * SEMI_MAJOR_AXIS - SEMI_MINOR_AXIS * SEMI_MINOR_AXIS) / (SEMI_MINOR_AXIS * SEMI_MINOR_AXIS);
   var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
   var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
   var deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
      B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));

   var s = SEMI_MINOR_AXIS * A * (sigma - deltaSigma);

   var alpha1 = Math.atan2(cosU2 * sinLambda, cosU1 * sinU2 - sinU1 * cosU2 * cosLambda);
   var alpha2 = Math.atan2(cosU1 * sinLambda, -sinU1 * cosU2 + cosU1 * sinU2 * cosLambda);

   var solution = {
      "distance": Number(s.toFixed(4)),
      "initialBearing": this.radToDeg((alpha1 + 2 * Math.PI) % (2 * Math.PI)),
      "finalBearing": this.radToDeg((alpha2 + 2 * Math.PI) % (2 * Math.PI))
   };

   if (bearings) {
      return solution;
   } else {
      return solution.distance;
   }
};

/**
 * Convenience function for returning only the initial and final bearings
 * between the givin coordinates (forward azimuths at each point)
 *
 * @param {object} pointA GeoJSON point
 * @param {object} pointB GeoJSON point
 * @return {object} forward azimuths (initial and final bearings) at each point in degrees
 *
 */
WGS84Util.bearingsBetween = function(pointA, pointB) {
   var solution = this.distanceBetween(pointA, pointB, true);

   return {
      "initialBearing": solution.initialBearing,
      "finalBearing": solution.finalBearing
   };
};

/**
 * Calculate the destination point from this point having travelled the given
 * distance in meters on the given initial bearing
 * Uses Vincenty direct calculation
 * Adapted from http://www.movable-type.co.uk/scripts/latlong-vincenty.html
 *
 * @param   {object} point  GeoJSON point
 * @param   {number} bearing  initial bearing in degrees from north
 * @param   {number} distance  distance along bearing in meters
 * @returns {object} GeoJSON destination point, finalBearing
 * @throws  {Error}  if formula failed to converge
 */
WGS84Util.destination = function(point, bearing, distance) {
   var alpha1 = this.degToRad(bearing);
   var s = distance;

   var sinAlpha1 = Math.sin(alpha1);
   var cosAlpha1 = Math.cos(alpha1);

   var tanU1 = (1 - FLATTENING) * Math.tan(this.degToRad(point.coordinates[1])),
      cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)),
      sinU1 = tanU1 * cosU1;
   var sigma1 = Math.atan2(tanU1, cosAlpha1);
   var sinAlpha = cosU1 * sinAlpha1;
   var cosSqAlpha = 1 - sinAlpha * sinAlpha;
   var uSq = cosSqAlpha * (SEMI_MAJOR_AXIS * SEMI_MAJOR_AXIS - SEMI_MINOR_AXIS * SEMI_MINOR_AXIS) / (SEMI_MINOR_AXIS * SEMI_MINOR_AXIS);
   var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
   var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

   var cos2SigmaM, sinSigma, cosSigma, deltaSigma;

   var sigma = s / (SEMI_MINOR_AXIS * A),
      sigmaPrime, iterations = 0;

   do {
      cos2SigmaM = Math.cos(2 * sigma1 + sigma);
      sinSigma = Math.sin(sigma);
      cosSigma = Math.cos(sigma);
      deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
         B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
      sigmaPrime = sigma;
      sigma = s / (SEMI_MINOR_AXIS * A) + deltaSigma;
   } while (Math.abs(sigma - sigmaPrime) > 1e-12 && ++iterations < 200);

   if (iterations >= 200) {
      throw new Error('Formula failed to converge'); // not possible?
   }

   var x = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
   var phi2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1, (1 - FLATTENING) * Math.sqrt(sinAlpha * sinAlpha + x * x));
   var lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1);
   var C = FLATTENING / 16 * cosSqAlpha * (4 + FLATTENING * (4 - 3 * cosSqAlpha));
   var L = lambda - (1 - C) * FLATTENING * sinAlpha *
      (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));

   var lambda2 = (this.degToRad(point.coordinates[0]) + L + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // normalise to -180...+180
   var alpha2 = Math.atan2(sinAlpha, -x);

   return {
      "point": {
         "type": "Point",
         "coordinates": [Number(this.radToDeg(lambda2).toFixed(10)), Number(this.radToDeg(phi2).toFixed(10))]
      },
      "finalBearing": this.radToDeg((alpha2 + 2 * Math.PI) % (2 * Math.PI))
   };
};

/**
 * Conversion from degrees to radians
 *
 * @param {number} deg angle in degrees
 * @return {number} angle in radians
 */
WGS84Util.degToRad = function(deg) {
   return (deg * (Math.PI / 180.0));
};

/**
 * Conversion from radians to degrees
 *
 * @param {number} rad angle in radians
 * @return {number} angle in degrees
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

   return {
      "type": "Feature",
      "geometry": {
         "type": "Point",
         "coordinates": [Number(UTMEasting.toFixed(1)), Number(UTMNorthing.toFixed(1))]
      },
      "properties": {
         "zoneLetter": zoneLetter,
         "zoneNumber": ZoneNumber
      }
   };
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

   var result = {
      "type": "Point",
      "coordinates": []
   };
   if (utm.accuracy) {
      var topRight = this.UTMtoLL({
         "northing": utm.northing + utm.accuracy,
         "easting": utm.easting + utm.accuracy,
         "zoneLetter": utm.zoneLetter,
         "zoneNumber": utm.zoneNumber
      });
      result = {
         "top": topRight.lat,
         "right": topRight.lon,
         "bottom": lat,
         "left": lon
      };
   } else {
      result.coordinates[0] = Number(lon.toFixed(10));
      result.coordinates[1] = Number(lat.toFixed(10));
   }

   return result;
};
