/**
 * This file contains logic for loading .OBJ format files into Javascript.
 * Note, some functionality in the parsing functions, such as computing normals,
 * depends on the vector class in the glMatrix library.
 */

/**
 * Loads an OBJ file and parses it into a set of faces and vertices.
 * 
 * @param  {String} filename 	The name of the OBJ file.
 * @param  {Function} callback 	The callback to be executed with the results.
 * 
 * @return {Object}          	The parsed vertex and face data.
 */
function loadObj (filename, callback){
	var x = new XMLHttpRequest();
	x.overrideMimeType("application/json");
	x.open('GET', filename, true /* async */);
	x.onreadystatechange = function(){
		if (x.readyState === 4){
			console.log('Loaded obj file:', filename);
			callback(parseObj(x.responseText));
		}
	};

	x.send();
}

/**
 * Parses an OBJ formatted string into float-valued data.
 * 
 * @param  {String} text 	The OBJ data in string format.
 * 
 * @return {Object}      	The parsed data, including vertices, faces, and
 *                          per-vertex normals.
 */
function parseObj (text){
	var lines = text.split('\n');
	var vertices = [], faces = [];
	var faceIndex = 0, vertexToFaceHash = {};

	// Extract a list of vertices and faces, line-by-line.
	for (var i=0; i<lines.length; i++){
		var line = lines[i];

		if (line[0] === 'v'){				// Vertex
			var vert = line.slice(1)
					.trim()
					.split(' ')
					.map(parseFloat);
			vertices.push(vert);

		} else if (line[0] === 'f'){		// Face
			var face = line.slice(1)
					.trim()
					.split(' ')
					.map(function (num){
						// Faces are defined by indices that start at 1.
						// Now they are indexed at 0.
						return parseInt(num, 10) - 1;
					});
			faces.push(face);

			// Update the vertex to face hash.
			for (var j=0; j<face.length; j++) {
				var vertIndex = face[j];	// Indexed at 0.
				vertexToFaceHash[vertIndex] = vertexToFaceHash[vertIndex] || [];
				vertexToFaceHash[vertIndex].push(faceIndex);
			}
			faceIndex++;

		} else if (line[0] === '#'){		// Comment
			continue;
		} else if (line[0] === 'g'){		// Group
			continue;
		}
	}

	// Get vertex normals.
	var normals = getVertexNormals(vertices, faces, vertexToFaceHash);

	// Flatten the vertices, faces, and normals.
	vertices = [].concat.apply([], vertices);
	faces = [].concat.apply([], faces);

	// Normals requires a loop to flatten because the nested arrays are of
	// Float32Array type.
	var flatNormals = [];
	for (i=0; i<normals.length; i++){
		flatNormals.push(normals[i][0]);
		flatNormals.push(normals[i][1]);
		flatNormals.push(normals[i][2]);
	}

	return {
		vertices: vertices,
		faces: faces,
		normals: flatNormals
	}
}

/**
 * Computes the face normal given the face's vertex indices relative to a set of
 * vertices.
 * 
 * @param  {Array.Number} vertexIndices The face's vertex indices indexed at 0.
 * @param  {Array.Array} vertices      	The set of vertices to choose from.
 * 
 * @return {vec3}               		The normal vector to the face.
 */
function getFaceNormal (vertexIndices, vertices){
	var normal = vec3.create();
	var v1 = vec3.create(vertices[vertexIndices[0]]);
	var v2 = vec3.create(vertices[vertexIndices[1]]);
	var v3 = vec3.create(vertices[vertexIndices[2]]);

	var edge1 = vec3.create(), edge2 = vec3.create();
	vec3.subtract(v2, v1, edge1);
	vec3.subtract(v3, v1, edge2);

	var normal = vec3.cross(edge1, edge2, vec3.create());
	return normal;
}

/**
 * Computes a list of normal vectors for each vertex relative to a set of faces
 * and provided a vertex-to-face hash.
 * 
 * @param  {Array.Array} vertices         	The set of vertices.
 * @param  {Array.Array} faces            	The set of faces.
 * @param  {Object} vertexToFaceHash 		A map from vertex indices to a face.
 * 
 * @return {Array.vec3}                  	The list of vertex normals.
 */
function getVertexNormals (vertices, faces, vertexToFaceHash){
	var normals = [];
	var faceNormals = [];

	for (var i = 0; i < faces.length; i++){
		faceNormals[i] = getFaceNormal(faces[i], vertices);
	}
	
	// Calculate per-vertex normals.
	for (i = 0; i < vertices.length; i++){
		var neighborFaces = vertexToFaceHash[i];	// Indexed at 0.

		// Once all neighbor normals are computed, sum the normals of
		// neighboring faces to get the vertex's normal.
		var vertNormal = vec3.create();
		for (var j = 0; j < neighborFaces.length; j++){
			var neighborFaceIndex = neighborFaces[j];		// Indexed at 0.
			vec3.add(vertNormal, faceNormals[neighborFaceIndex]);
		}

		// Normalize the vertex normal.
		vec3.normalize(vertNormal);

		// Save the current vertex's normal vector.
		normals[i] = vertNormal;
	}

	return normals;
}
