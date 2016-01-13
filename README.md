[![NPM](https://nodei.co/npm/wgs84-util.png?downloads=true&stars=true)](https://nodei.co/npm/wgs84-util/)

Geographic coordinate utilities using WGS84 datum

Installation
-------------
    $ npm install wgs84-util

Methods
--------
    distanceBetween(pointA, pointB [, bearings ])
> Calculate the distance between a set of GeoJSON points in meters
>
> Uses [Vincenty inverse](https://en.wikipedia.org/wiki/Vincenty's_formulae#Inverse_problem) calculation
>
> Adapted from http://www.movable-type.co.uk/scripts/latlong-vincenty.html
>
> **Parameters**
>
> **pointA**:  *object*,  GeoJSON point
>
> **pointB**:  *object*,  GeoJSON point
>
> **bearings**: *boolean*,  optional switch for including the bearings in degrees
>
> **Returns**
>
> *number | object*,  distance from this point to the supplied point
> in meters or an object that includes distance, initial and final bearings
>
> **throws**: *Error*,  if formula failed to converge

    bearingsBetween(pointA, pointB)
> Convenience function for returning only the initial and final bearings
> between the given coordinates (forward azimuths at each point)
>
> **Parameters**
>
> **pointA**:  *object*,  GeoJSON point
>
> **pointB**:  *object*,  GeoJSON point
>
> **Returns**
>
> *object*,  forward azimuths (initial and final bearings) at each point in degrees

    destination(point, bearing, distance)
> Calculate the destination point from this point having travelled the given
> distance in meters on the given initial bearing
>
> Uses [Vincenty direct](https://en.wikipedia.org/wiki/Vincenty's_formulae#Direct_Problem) calculation
>
> Adapted from http://www.movable-type.co.uk/scripts/latlong-vincenty.html
>
> **Parameters**
>
> **point**:  *object*, GeoJSON point
>
> **bearing**:  *number*,  initial bearing in degrees from north
>
> **distance**:  *number*,  distance along bearing in meters
>
> **Returns**
>
> *object*,  GeoJSON destination point, finalBearing
>
> **throws**: *Error*,  if formula failed to converge

    degToRad(deg)
> Conversion from degrees to radians
>
> **Parameters**
>
> **deg**:  *number*,  angle in degrees
>
> **Returns**
>
> *number*,  angle in radians

    radToDeg(rad)

> Conversion from radians to degrees
>
> **Parameters**
>
> **rad**:  *number*,  angle in radians
>
> **Returns**
>
> *number*,  angle in degrees

    LLtoUTM(ll)

> Converts a set of Longitude and Latitude coordinates to UTM
> using the WGS84 ellipsoid.
>
> **Parameters**
>
> **ll**:  *object*, GeoJSON point representing the coordinate to be converted
>
> **Returns**
>
> *object*,  GeoJSON feature containing the UTM value with easting,
> northing, zoneNumber and zoneLetter properties, and an optional
> accuracy property in digits. Returns null if the conversion failed.

    UTMtoLL(utm)
> Converts UTM coordinates to lat/long, using the WGS84 ellipsoid
>
> **Parameters**
>
> **utm**:  *object*, with northing, easting, zoneNumber
> and zoneLetter properties. If an optional accuracy property is
> provided (in meters), a bounding box will be returned instead of
> latitude and longitude.
>
> **Returns**
>
> *object*, GeoJSON object containing either lat and lon values
> (if no accuracy was provided), or top, right, bottom and left values
> for the bounding box calculated according to the provided accuracy.
> Returns null if the conversion failed.

Running Tests
--------------
Install the development dependencies:

    $ npm install

Then run the tests:

    $ npm test

Code Coverage
--------------
Install the development dependencies:

    $ npm install

Then run coverage

    $ npm run coverage

View coverage reports

    $ firefox coverage/lcov-report/index.html

Browser Bundle
---------------
    $ npm run build

## License

Copyright (c) 2016 Christopher Brandt

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
