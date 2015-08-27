/**
 * This file contains logic related to the camera and its motion.  It uses a
 * Bezier curve method.
 */

var camera = vec3.create();
var lookAt = vec3.create();
var up = vec3.create();

// Initialize the camera's last position to be 'behind' the starting position.
camera.set([0, 5, 11]);
up.set([0, 1, 0]);
lookAt.set([0, 0, -2]);

// Camera paths defined by four control points.
var path1 = {
	p0: new Point([0, 19, 10]),
	p1: new Point([10, 1, 5]),
	p2: new Point([0, 3, -1]),
	p3: new Point([-4, -3, 8]),
};

var path2 = {
	p0: new Point([-20, -3, 10]),
	p1: new Point([2, -5, 15]),
	p2: new Point([8, 7, 2]),
	p3: new Point([7, 5, -8]),
};

/**
 * Computes the camera's position given a time and a path.
 * 
 * @param  {Number} time 		The current time.
 * @param  {Number} num  		The camera path to use.
 * 
 * @return {Array.Number}      	The camera's new position.
 */
function cameraPath (time, num){
	// Normalize the time to a [0,1] range that lasts for a duration.
	var duration = 5000;
	var t = (time % duration) / duration;

	// Get the camera path.
	var path = num === '2' ? path2 : path1;

	return cubicBezier(t, path.p0, path.p1, path.p2, path.p3);
}

/**
 * Computes the value of a path along a cubic bezier curve at a given time.
 * 
 * @param  {Number} t  The time normalized between [0, 1].
 * @param  {Point} p0 The first control point.
 * @param  {Point} p1 The second control point.
 * @param  {Point} p2 The third control point.
 * @param  {Point} p3 The fourth control point.
 * 
 * @return {Array.Number}    The position along the curve.
 */
function cubicBezier (t, p0, p1, p2, p3){
	var newPoint = p0.mult(Math.pow(1-t, 3))
			.add(p1.mult(3*Math.pow(1-t, 2)*t))
			.add(p2.mult(3*(1-t)*t*t))
			.add(p3.mult(Math.pow(t, 3)))

	return newPoint.toArray();
}
