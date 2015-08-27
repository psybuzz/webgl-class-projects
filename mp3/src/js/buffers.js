/**
 * This file contains buffer initialization logic.
 */

/**
 * Initializes the buffers.
 */
function initBuffers (){
	// Setup the position buffer for the shape's vertices.
	teapotVerticesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, teapotVerticesBuffer);
	gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(teapotData.vertices),
			gl.STATIC_DRAW);

	// Element indices.
	teapotIndicesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotIndicesBuffer);
	gl.bufferData(
			gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(teapotData.faces),
			gl.STATIC_DRAW);

	// Normals.
	vertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
	gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(teapotData.normals),
			gl.STATIC_DRAW);

	// Texture mapping.
	teapotTextureCoords = [];
	for (var i = 0; i < (1/3)*teapotData.vertices.length; i++) {
		// Map vertices into texture coordinates using a cylindrical projection.
		var vx = teapotData.vertices[3*i];
		var vy = teapotData.vertices[3*i+1];
		var vz = teapotData.vertices[3*i+2];
		var stCoords = getTextureCoordsFromVertex(vx, vy, vz);

		teapotTextureCoords.push(stCoords.s);
		teapotTextureCoords.push(stCoords.t);
	}
	teapotTextureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, teapotTextureBuffer);
	gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(teapotTextureCoords),
			gl.STATIC_DRAW);
}
