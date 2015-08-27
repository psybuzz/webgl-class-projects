/**
 * This file contains the main logic for the application.
 */

var program = null;
var canvas = document.getElementById("canvas");
var gl = null;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();

// The application's configurable state variables.
var app = {
	coverEl: document.getElementById('cover'),
	contentEl: document.getElementById('content'),
	fullscreen: false,
	ready: false,
	lastTime: performance.now ? performance.now() : Date.now()
}

// Create the initial mesh data.
var letterData = getIMeshVerts(3, 7, 1, 3, -3, -2);
var subdata = ((letterData));
var data = getTrianglesFromQuads(subdata);
var normals = getNormalsFromTriangles(data);
var meshData = {
	vertices: data,
	normals: normals
}
initWebGL(canvas);

/**
 * The main animation call to draw.
 */
function draw (){
	if (!app.ready) return;

	// Set the clear color to 0% black and clear buffer bits.
	gl.clearColor(0.0, 0.0, 0.0, 0.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Apply camera look-at transformation to the model view matrix.
	mat4.lookAt(camera,	lookAt,	up,	mvMatrix);

	// Draw the mesh.
	drawMesh();

	if (options.animate){
		update();
	}
	FPSMeter.fpsCount();

	app.requestId = requestAnimationFrame(draw);
}

/**
 * Update the scene.
 */
function update (){
	// Update time.
	var now = performance.now ? performance.now() : Date.now();
	var delta = now - app.lastTime;
	app.lastTime = now;

	// Set the camera to its new position on its curved path.
	camera.set(cameraPath(now, options.camera));
}

/**
 * Draws the terrain using vertex and color buffers.
 */
function drawMesh (){
	// Draw normals.
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
	gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

	// Setup the position buffer for the shape's vertices.
	gl.bindBuffer(gl.ARRAY_BUFFER, meshVerticesBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	// Lighting.
	var ambientColor = options['ambient color'];
	if (ambientColor.length <= 3){
		ambientColor = ambientColor.map(function (e){ return e/255 });
	} else {
		ambientColor = [0.7, 0.7, 0.8];
	}
	gl.uniform1i(program.useLightingUniform, true /* useLighting */);
	gl.uniform1f(program.materialShininessUniform, 1.0);
	gl.uniform3f(program.ambientColorUniform, ambientColor[0], ambientColor[1], ambientColor[2]);
	gl.uniform3f(program.pointLightLocationUniform, 5, 4, 5);
	gl.uniform3f(program.pointLightSpecularColorUniform, 0.2, 0.2, 0.2);
	gl.uniform3f(program.pointLightingDirectionalColorUniform, 0.2, 0.2, 0.2);

	// Set the matrix uniforms to provide updates to the shaders whenever
	// matrices are updated.
	setMatrixUniforms();

	// Draw triangles or wireframe.
	if (options.wireframe){
		gl.drawArrays(gl.LINES, 0 /* firstIndex */, meshData.vertices.length/3);
	} else {
		gl.drawArrays(gl.TRIANGLES, 0 /* firstIndex */, meshData.vertices.length/3);
	}

	// OR
	
	// Draw the vertices using the TRIANGLES method.
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshIndicesBuffer);
	// 
	// Draw indexed faces.
	// gl.drawElements(
	// 		gl.TRIANGLES,
	// 		meshData.faces.length,
	// 		gl.UNSIGNED_SHORT /* type */,
	// 		0 /* offset */);
}



/**
 * INITIALIZATION AND SETUP
 */

/**
 * Attempts to initialize a WebGL context via the provided canvas element.
 * 
 * @param  {Element} canvas 		The <canvas> element.
 * 
 * @return {WebGLRenderingContext}  The WebGL context instance.
 */
function initWebGL(canvas) {
	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		if (gl){
			// Initialize shaders and buffers.
			initShaders();
			initBuffers();

			// Enable depth testing (use the Z-buffer) and setup the
			// viewport and perspective.
			gl.enable(gl.DEPTH_TEST);
			gl.viewport(0, 0, canvas.width, canvas.height);
			mat4.perspective(45, canvas.width/canvas.height, 0.1, 100, pMatrix);

			// Begin animation loop.
			app.ready = true;
			draw();
		}
	}
	catch (e){}
	if (!gl) alert("Unable to setup WebGL. Your browser may not support it.");

	return gl;
}
