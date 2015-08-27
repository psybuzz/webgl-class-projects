/**
 * This file contains buffer initialization logic.
 */

var vertexColorBuffer, vertexPositionBuffer;

/**
 * Initializes the buffers.
 */
function initBuffers (){
	// Setup the position buffer for the shape's vertices.
	meshVerticesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, meshVerticesBuffer);
	gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(meshData.vertices),
			gl.STATIC_DRAW);

	// Normals.
	vertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
	gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(meshData.normals),
			gl.STATIC_DRAW);

	// // Alternative code for element indices.
	// meshIndicesBuffer = gl.createBuffer();
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshIndicesBuffer);
	// gl.bufferData(
	// 		gl.ELEMENT_ARRAY_BUFFER,
	// 		new Uint16Array(meshData.faces),
	// 		gl.STATIC_DRAW);
}
