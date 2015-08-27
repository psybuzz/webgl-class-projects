/**
 * This file contains logic related to subdividing a mesh.  The implementation
 * is based off of the Catmull-Clark subdivision method applied to quadrilateral
 * based meshes.
 */

/**
 * Subdivides the provided quad vertices of a mesh one level using the 
 * Catmull-Clark subdivision algorithm.
 * 
 * @param  {Array.number} verts The quad vertices to be subdivided.
 * 
 * @return {Array.number}       The newly subdivided quad vertices.
 */
function subdivide (verts){
	// Convert every set of four 3D points into a quad object.
	var quads = [];
	for (var i=0; i<verts.length; i+=12){
		quads.push(new Quad(verts.slice(i, i+12)));
	}

	// Calculate centers of the original quad faces.
	var faceToCenterMap = {};
	quads.map(function (quad, i){ faceToCenterMap[i] = quad.center; });

	// Construct an edge-to-face map.  This will let us find an edge's 
	// neighboring quad faces.  Simultaneously, construct a point-to-face map.
	// This will let us find a point's neighboring quad faces.
	var edgeToFaceMap = {}, pointToFaceMap = {}, pointToEdgeMap = {};
	for (i=0; i<quads.length; i++){
		// Get and hash each edge into the map.
		var edges = quads[i].edges;
		for (var j=0; j<edges.length; j++){
			var edge = edges[j];
			var edgeKey = edge[0]+':'+edge[1];
			addToHash(edgeToFaceMap, edgeKey, quads[i]);

			// Add this edge into the point-to-edge map for its endpoints.
			var edgeStartPointKey = edge[0][0]+':'+edge[0][1]+':'+edge[0][2];
			var edgeEndPointKey = edge[1][0]+':'+edge[1][1]+':'+edge[1][2];
			addToHash(pointToEdgeMap, edgeStartPointKey, edge);
			addToHash(pointToEdgeMap, edgeEndPointKey, edge);
		}

		// Get and hash each 3D point into the map.
		var points = quads[i].points;
		for (var j=0; j<points.length; j+=3){
			var pointKey = points[j]+':'+points[j+1]+':'+points[j+2];
			addToHash(pointToFaceMap, pointKey, quads[i]);
		}
	}

	// Calculate edge 'midpoints' using averages.
	var edgeToPointMap = {};
	for (i=0; i<quads.length; i++){
		var edges = quads[i].edges;
		for (j=0; j<edges.length; j++){
			var edge = edges[j];
			var edgeKey = edge[0]+':'+edge[1];

			// Average the edge's endpoints and the edge's neighboring faces'
			// center points.
			var points = edgeToFaceMap[edgeKey]
					.map(function (face){ return face.center; })
					.concat(edge)
					.reduce(function (a, b){ return a.concat(b); }, []);

			// Save the average point in the map.
			edgeToPointMap[edgeKey] = flatAvg(points, 3 /* dimension */);
		}
	}

	// Calculate the transformed quad control points, assuming that all points
	// have only 4 neighboring points.
	var vertTransformMap = {};
	for (i=0; i<quads.length; i++){
		// Extract the quad's corner points.
		var points = quads[i].points;

		// Transform each unique point as necessary.
		for (j=0; j<points.length; j+=3){
			point = points.slice(j, j+3);
			var pointKey = point[0]+':'+point[1]+':'+point[2];

			// Calculate if transformation if we haven't already.
			if (!vertTransformMap[pointKey]){
				var neighboringEdgePoint = pointToEdgeMap[pointKey].map(
							function (edge){
								// Get the edge's 'midpoint'.
								return edgeToPointMap[edge[0]+':'+edge[1]];
							}
						).reduce(function (a, b){ return a.concat(b); }, []);
				var neighboringFaceCenters = pointToFaceMap[pointKey].map(
							function (face){ return face.center; }
						).reduce(function (a, b){ return a.concat(b); }, []);
				var neighborEdgePointAvg = flatAvg(neighboringEdgePoint, 3);
				var neighborFaceAvg = flatAvg(neighboringFaceCenters, 3);

				// Combine the values into a newly transformed vertex using a
				// formula dependent on the point's valence (# of adjacent
				// edges).
				var valence = pointToEdgeMap[pointKey].length;
				var neighborFacePart = (new Point(neighborFaceAvg))
						.mult(1 / valence);
				var neighborEdgePart = (new Point(neighborEdgePointAvg))
						.mult(2 / valence);
				var transformedVert = (new Point(point))
						.mult((valence - 3) / valence)
						.add(neighborEdgePart)
						.add(neighborFacePart);


				// Save the transformed vertex in a hash.
				vertTransformMap[pointKey] = transformedVert.toArray();
			}
		}
	}

	// Assemble new quads from the newly calculated points.	
	var newQuads = [];
	for (i=0; i<quads.length; i++){
		// Extract the quad's corner points.
		quad = quads[i];
		points = quad.points;

		// Transform each unique point as necessary.
		var nextPoint, prevPoint;
		for (j=0; j<4; j++){
			point = points.slice(3*j, 3*j+3);
			pointKey = point[0]+':'+point[1]+':'+point[2];

			// Take the next point, looping around to the start if necessary.
			if (j >= 3){
				nextPoint = points.slice(0, 3);
			} else {
				nextPoint = points.slice(3*(j+1), 3*(j+1)+3);
			}

			// Take the previous point, looping around to the end if necessary.
			if (j <= 0){
				prevPoint = points.slice(9, 12);
			} else {
				prevPoint = points.slice(3*(j-1), 3*(j-1)+3);
			}

			// Compute the edge keys.
			var nextEdge = [point, nextPoint].sort();
			var prevEdge = [prevPoint, point].sort();
			var nextEdgeKey = nextEdge[0]+':'+nextEdge[1];
			var prevEdgeKey = prevEdge[0]+':'+prevEdge[1];

			// Combine the points into a flattened array.
			var quadPoints = [
				vertTransformMap[pointKey],
				edgeToPointMap[nextEdgeKey],
				quad.center,
				edgeToPointMap[prevEdgeKey]
			].reduce(function (a, b){ return a.concat(b); }, []);

			// Create a new quad representing the subdivison that includes the
			// current corner point.
			var q = new Quad(quadPoints);
			newQuads.push(q);
		}
	}

	// Finally, convert the quads into a flat list of vertices.
	var newVerts = [];
	for (i=0; i<newQuads.length; i++){
		newVerts = newVerts.concat(newQuads[i].points);
	}

	return newVerts;
}

/**
 * Adds a value to a hashmap's key-hashed array of unique values.  If no value
 * existed for the key, a new array containing the value will be created.
 * E.g. addToHash('a', 'b') -->
 * 		map = {
 * 			'a': ['b']
 * 		}
 *      addToHash('a', 'c') -->
 * 		map = {
 * 			'a': ['b', 'c']
 * 		}
 *
 * @param {Object} map   The hashmap.
 * @param {String} key   The key to access.
 * @param {Object} value The value to be added.
 */
function addToHash (map, key, value){
	// Create an empty array if needed.
	map[key] = map[key] || [];

	// Add the value to the array if necessary.
	var stringifiedBin = map[key].map(JSON.stringify);
	if (stringifiedBin.indexOf(JSON.stringify(value)) === -1){
		map[key].push(value);
	}
}

/**
 * Computes the average of a flat array of points where each has the specified
 * dimension.
 * E.g. flatAvg([1, 1, 2, 2], 2) --> average([1, 1], [2, 2]) --> [1.5, 1.5]
 * 
 * @param  {Array.number} arr       The flat array to be averaged.
 * @param  {number} dim 			The size of each point; the number of
 *                         			numbers used to describe a point.
 *                         			
 * @return {Array.number}           An averaged point of dimension 'dim'.
 */
function flatAvg (arr, dim){
	var avg = [];
	var numPoints = Math.floor(arr.length / dim);

	// Initialize the average to a zero-filled array.
	for (var i=0; i<dim; i++) {
		avg[i] = 0;
	}

	// Sum up the values of the provided array.
	for (i=0; i<arr.length; i++){
		avg[i%dim] += arr[i];
	}

	// Divide the sums by the number of points.
	for (i=0; i<dim; i++) {
		avg[i] /= numPoints;
	}

	return avg;
}
