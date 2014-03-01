**Author:** cs_brandt

distanceBetween(coordA, coordB)
-------------------------------
From: Haversine formula - RW Sinnott, "Virtues of the Haversine",
Sky and Telescope, vol 68, no 2, 1984

(using Haversine formula)



**Parameters**

**coordA**:  *object*,  


**coordB**:  *object*,  


**Returns**

*number*,  the distance from this point to the supplied point, in km

degToRad(deg)
-------------
Conversion from degrees to radians.



**Parameters**

**deg**:  *number*,  the angle in degrees.

**Returns**

*number*,  the angle in radians.

radToDeg(rad)
-------------
Conversion from radians to degrees.



**Parameters**

**rad**:  *number*,  the angle in radians.

**Returns**

*number*,  the angle in degrees.

LLtoUTM(ll)
-----------
Converts a set of Longitude and Latitude co-ordinates to UTM
using the WGS84 ellipsoid.

representing the WGS84 coordinate to be converted.
northing, zoneNumber and zoneLetter properties, and an optional
accuracy property in digits. Returns null if the conversion failed.


**Parameters**

**ll**:  *object*,  Object literal with lat and lon properties

**Returns**

*object*,  Object literal containing the UTM value with easting,

UTMtoLL(utm)
------------
Converts UTM coords to lat/long, using the WGS84 ellipsoid. This is a convenience
class where the Zone can be specified as a single string eg."60N" which
is then broken down into the ZoneNumber and ZoneLetter.

and zoneLetter properties. If an optional accuracy property is
provided (in meters), a bounding box will be returned instead of
latitude and longitude.
(if no accuracy was provided), or top, right, bottom and left values
for the bounding box calculated according to the provided accuracy.
Returns null if the conversion failed.


**Parameters**

**utm**:  *object*,  An object literal with northing, easting, zoneNumber

**Returns**

*object*,  An object literal containing either lat and lon values

