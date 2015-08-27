/**
 * This class contains geometry classes used for subdivision and space curves.
 */


/**
 * A custom point class to simplify dealing with multiple point operations.
 * 
 * @param {number} xc 	The x coordinate.
 * @param {number} yc 	The y coordinate.
 * @param {number} zc 	The z coordinate.
 */
function Point (xc, yc, zc){
	var x, y, z;
	if (typeof yc === 'undefined'){		// Assume x is a coordinate array.
		x = xc[0]; y = xc[1]; z = xc[2];
	} else {
		x = xc; y = yc; z = zc;
	}

	// Internally save the coordinates.
	this.x = x;
	this.y = y;
	this.z = z;
}

/**
 * Adds the current point with another and returns the resulting point.
 * 
 * @param {Point} pt2 	The point to be added.
 * 
 * @return {Point} The resulting point.
 */
Point.prototype.add = function(pt2) {
	var sumPoint = new Point(this.x + pt2.x, this.y + pt2.y, this.z + pt2.z);
	return sumPoint;
};

/**
 * Multiplies the current point with a scalar and returns the resulting point.
 * 
 * @param {numbers} scalar 	The scalar to be multiplied.
 *
 * @return {Point} The resulting point.
 */
Point.prototype.mult = function(scalar) {
	var newPoint = new Point(this.x*scalar, this.y*scalar, this.z*scalar);
	return newPoint;
};

/**
 * Converts the point into an array form.
 * 
 * @return {Array.number} 	The point's array form.
 */
Point.prototype.toArray = function(){
	return [this.x, this.y, this.z];
};

/**
 * A custom quadrilateral class to simplify dealing with multiple quads which
 * lie on a 2D plane.  Note, that this class computes some properties such as
 * the face's center vertex on construction.
 * 
 * @param {Array.number} points 	The flat-array representation of the four
 *                               	ordered points related to the quad.
 */
function Quad (points){
	this.points = points;

	this.center = [
		(points[0]+points[3]+points[6]+points[9])/4,	// x coord.
		(points[1]+points[4]+points[7]+points[10])/4,	// y coord.
		(points[2]+points[5]+points[8]+points[11])/4,	// z coord.
	];

	this.edges = [
		[points.slice(0,3), points.slice(3,6)].sort(),
		[points.slice(3,6), points.slice(6,9)].sort(),
		[points.slice(6,9), points.slice(9,12)].sort(),
		[points.slice(9,12), points.slice(0,3)].sort()
	];
}
