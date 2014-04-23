Geographic coordinate utilities using WGS84 datum

Installation
-------------
    $ npm install wgs84-util

Methods
--------
    distanceBetween(coordA, coordB)
> From: Haversine formula - RW Sinnott, "Virtues of the Haversine",
> Sky and Telescope, vol 68, no 2, 1984


> **Parameters**

> **coordA**:  *object*,  


> **coordB**:  *object*,  


> **Returns**

> *number*,  the distance from this point to the supplied point, in km

    destinationPoint(coordA, bearing, dist)
> Returns the destination point from this point having travelled the given distance (in m) on the 
> given initial bearing (bearing may vary before destination is reached)
> see http://williams.best.vwh.net/avform.htm#LL


> **Parameters**

> **coordA**:  *object*, initial point


> **bearing**:  *object*,  angular bearing from the supplied point, in degrees

> **dist**:  *object*, the distance from the supplied point, in m 


> **Returns**

> *object*,  the destination point


    degToRad(deg)
> Conversion from degrees to radians.


> **Parameters**

> **deg**:  *number*,  the angle in degrees.

> **Returns**

> *number*,  the angle in radians.

    radToDeg(rad)

> Conversion from radians to degrees.

> **Parameters**

> **rad**:  *number*,  the angle in radians.

> **Returns**

> *number*,  the angle in degrees.

    LLtoUTM(ll)

> Converts a set of Longitude and Latitude co-ordinates to UTM
> using the WGS84 ellipsoid.

> representing the WGS84 coordinate to be converted.
> northing, zoneNumber and zoneLetter properties, and an optional
> accuracy property in digits. Returns null if the conversion failed.

> **Parameters**
> **ll**:  *object*,  Object literal with lat and lon properties

> **Returns**

> *object*,  Object literal containing the UTM value with easting,

    UTMtoLL(utm)
> Converts UTM coords to lat/long, using the WGS84 ellipsoid. This is a convenience
> class where the Zone can be specified as a single string eg."60N" which
> is then broken down into the ZoneNumber and ZoneLetter.

> and zoneLetter properties. If an optional accuracy property is
> provided (in meters), a bounding box will be returned instead of
> latitude and longitude.
> (if no accuracy was provided), or top, right, bottom and left values
> for the bounding box calculated according to the provided accuracy.
> Returns null if the conversion failed.


> **Parameters**

> **utm**:  *object*,  An object literal with northing, easting, zoneNumber

> **Returns**

> *object*,  An object literal containing either lat and lon values


Running Tests
--------------
Install the development dependencies:

    $ npm install

Then run the tests:

    $ npm test


## License

Copyright (c) 2013 Christopher Brandt

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.