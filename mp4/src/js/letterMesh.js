/**
 * This file contains logic related to the mesh for the letter 'I'.
 */

/**
 * Constructs an array of vertices representing the quads of the specified 'I',
 * including the front layer, back layer, and extrusion quads.
 * 
 * @param  {number} width   	The full width of the letter.
 * @param  {number} height  	The full height of the letter.
 * @param  {number} trunkWidth  The width of the narrow trunk section.
 * @param  {number} trunkHeight The height of the narrow trunk section.
 * @param  {number} zBack		The back-facing z-axis position of each vertex.
 * @param  {number} zFront		The front-facing z-axis position of each vertex.
 * 
 * @return {Array.number}       The list of vertices.
 */
function getIMeshVerts (width, height, trunkWidth, trunkHeight, zBack, zFront){
	var halfFullWidth = width / 2;
	var halfFullHeight = height / 2;
	var halfTrunkWidth = trunkWidth / 2;
	var halfTrunkHeight = trunkHeight / 2;
	
	// Generate 3D outlines for both front and back layers.  These vertices will
	// act as a set of unique vertices to pick from.
	var backI = getIOutlineVertices(width, height, trunkWidth, trunkHeight,
			zBack);
	var frontI = getIOutlineVertices(width, height, trunkWidth, trunkHeight,
			zFront);

	// Store the final extruded letter mesh vertices.
	var finalVerts = [];

	// Use indices to access points along the outline that represent quads.
	var frontBackQuadIndices = [
		// Top quads.
		0, 1, 2, 3,
		0, 3, 12, 15,
		12, 13, 14, 15,

		// Middle quad.
		3, 4, 11, 12,

		// Bottom quads.
		4, 5, 6, 7,
		4, 7, 8, 11,
		8, 9, 10, 11
	];

	// Add the front and back layer quads to the final vertices.
	finalVerts = finalVerts
			.concat(
				frontBackQuadIndices.map(function (index){
					return pick(frontI, index);
				}).reduce(function (a, b){
					return a.concat(b);
				}, [])
			).concat(
				frontBackQuadIndices.map(function (index){
					return pick(backI, index);
				}).reduce(function (a, b){
					return a.concat(b);
				}, [])
			);

	// Add quads resulting from extrusion.
	for (var i=0; i<(frontI.length/3)-1; i++){
		var extrusionQuad = [
				pick(frontI, i+1),
				pick(backI, i+1),
				pick(backI, i),
				pick(frontI, i),
			].reduce(function (a, b){ return a.concat(b); }, []);
		finalVerts = finalVerts.concat(extrusionQuad);
	}
	// Add a final quad that connects the start with the end.
	var lastExtrusionQuad = [
		pick(frontI, 0),
		pick(backI, 0),
		pick(backI, (backI.length/3)-1),
		pick(frontI, (frontI.length/3)-1),
	].reduce(function (a, b){ return a.concat(b); }, []);
	finalVerts = finalVerts.concat(lastExtrusionQuad);

	// Return the final vertices, consisting of the front layer, back layer, and
	// extrusion quads.
	return finalVerts;
}

/**
 * Constructs an array of vertices representing the outline of the specified
 * 'I'.  These will be 3-dimensional points that all lie in the same plane.
 * 
 * @param  {number} width   	The full width of the letter.
 * @param  {number} height  	The full height of the letter.
 * @param  {number} trunkWidth  The width of the narrow trunk section.
 * @param  {number} trunkHeight The height of the narrow trunk section.
 * @param  {number} zpos		The z-axis position of each vertex.
 * 
 * @return {Array.number}       The list of vertices.
 */
function getIOutlineVertices (width, height, trunkWidth, trunkHeight, zpos){
	var halfFullWidth = width / 2;
	var halfFullHeight = height / 2;
	var halfTrunkWidth = trunkWidth / 2;
	var halfTrunkHeight = trunkHeight / 2;

	return [
		// Left side, top to bottom.
		-halfTrunkWidth, halfFullHeight, zpos,
		-halfFullWidth, halfFullHeight, zpos,
		-halfFullWidth, halfTrunkHeight, zpos,
		-halfTrunkWidth, halfTrunkHeight, zpos,
		-halfTrunkWidth, -halfTrunkHeight, zpos,
		-halfFullWidth, -halfTrunkHeight, zpos,
		-halfFullWidth, -halfFullHeight, zpos,
		-halfTrunkWidth, -halfFullHeight, zpos,

		// Right side, top to bottom.
		halfTrunkWidth, -halfFullHeight, zpos,
		halfFullWidth, -halfFullHeight, zpos,
		halfFullWidth, -halfTrunkHeight, zpos,
		halfTrunkWidth, -halfTrunkHeight, zpos,
		halfTrunkWidth, halfTrunkHeight, zpos,
		halfFullWidth, halfTrunkHeight, zpos,
		halfFullWidth, halfFullHeight, zpos,
		halfTrunkWidth, halfFullHeight, zpos
	];
}

/**
 * Converts a list of 3-dimensional vertices of quads into a list of
 * 3-dimensional vertices of triangles representing the same mesh.
 * 
 * @param  {Array.number} quadVerts 	The 3D quad vertices.
 * 
 * @return {Array.number}           	The 3D triangle vertices.
 */
function getTrianglesFromQuads (quadVerts){
	var triVerts = [];
	for (var i=0; i<quadVerts.length; i+=4){
		// Split the quad into two triangles using a set of indices.
		var triVertIndices = [
			i, i+1, i+2,
			i+2, i+3, i
		];

		// Add the two triangles to the triangle vertex list.
		var newTriVerts = triVertIndices.map(function (index){
			return pick(quadVerts, index);
		}).reduce(function (a, b){
			return a.concat(b);
		}, []);
		triVerts = triVerts.concat(newTriVerts);
	}

	return triVerts;
}

/**
 * Given a list of triangle vertices, this computes a map from triangles to
 * their corresponding normal vector.
 * 
 * @param  {Array.number} verts 	The flat array of triangle vertices.
 * 
 * @return {Array.number}   		The flat array of corresponding vertex
 *                                	normals.
 */
function getNormalsFromTriangles (verts){
	var numVerts = verts.length / 3;
	var numTriangles = numVerts / 3;

	// Every triangle (3 vertices, 9 coordinates), add the triangle to the
	// vertex to normals of neighbor faces map.
	var vertexToNormal = {};
	for (var i=0; i<numTriangles; i++){
		var v1 = pick(verts, 3*i);
		var v2 = pick(verts, 3*i+1);
		var v3 = pick(verts, 3*i+2);
		var triangle = [v1, v2, v3];
		var vkeys = triangle.map(JSON.stringify);

		// Compute the triangle's normal vector.
		var normal = getFaceNormal(v1, v2, v3);

		// Create an empty normal vector in the hashmap if necessary.
		vertexToNormal[vkeys[0]] = vertexToNormal[vkeys[0]] || vec3.create();
		vertexToNormal[vkeys[1]] = vertexToNormal[vkeys[1]] || vec3.create();
		vertexToNormal[vkeys[2]] = vertexToNormal[vkeys[2]] || vec3.create();

		// Add the triangle's normal to the existing hashed normal.
		vec3.add(vertexToNormal[vkeys[0]], normal);
		vec3.add(vertexToNormal[vkeys[1]], normal);
		vec3.add(vertexToNormal[vkeys[2]], normal);
	}

	// Normalize the sums.
	for (i=0; i<numVerts; i++){
		var v = pick(verts, i);
		var vkey = JSON.stringify(v);
		vertexToNormal[vkey] = vertexToNormal[vkey] ||
				vec3.normalize(vertexToNormal[vkey]);
	}

	// Convert the original list of vertices into a similar list of normals.
	var normals = [];
	for (i=0; i<numVerts; i++){
		v = pick(verts, i);
		vkey = JSON.stringify(v);
		normal = vertexToNormal[vkey];
		normals = normals.concat([normal[0], normal[1], normal[2]]);
	}

	return normals;
}

/**
 * Computes the face normal given a triangular face's vertices.
 *
 * @param {Array.number} v1 	The first vertex.
 * @param {Array.number} v2 	The second vertex.
 * @param {Array.number} v3 	The third vertex.
 * 
 * @return {vec3}               The normal vector to the face.
 */
function getFaceNormal (v1, v2, v3){
	var normal = vec3.create();
	var v1 = vec3.create(v1);
	var v2 = vec3.create(v2);
	var v3 = vec3.create(v3);

	var edge1 = vec3.create(), edge2 = vec3.create();
	vec3.subtract(v2, v1, edge1);
	vec3.subtract(v3, v1, edge2);

	var normal = vec3.cross(edge1, edge2, vec3.create());
	return normal;
}

/**
 * Picks the subarray representing the 3D vertex at the specified index in
 * the original array.
 * 
 * @param  {Array.number} arr       The original data.
 * @param  {number} tripleIndex 	The n-th triple to pick, indexed at 0.
 * 
 * @return {Array.number}           The picked vertex.
 */
function pick (arr, tripleIndex){
	return arr.slice(3*tripleIndex, 3*tripleIndex + 3);
}
