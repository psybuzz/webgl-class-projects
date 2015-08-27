/**
 * This file contains the main logic for the application.
 */

var vertexPositionAttribute;
var vertexColorAttribute;
var vertexNormalAttribute;
var vertexColorBuffer, vertexPositionBuffer;
var vertexBufferData, teapotIndexData;
var teapotData;
var textureCoordAttribute, worldTextureCoordAttribute;
var sodaTexture, potTexture;

var pMatrixUniform, mvMatrixUniform;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();

var camera = vec3.create();
var lookAt = vec3.create();
var up = vec3.create();

var program = null;
var canvas = document.getElementById("canvas");
var gl = null;

// The application's configurable state variables.
var app = {
	coverEl: document.getElementById('cover'),
	contentEl: document.getElementById('content'),
	fullscreen: false,
	ready: false,
	lastTime: performance.now ? performance.now() : Date.now(),
	left: false,
	right: false,
	up: false,
	down: false,
	rotation: 0
}

// Initialize the camera's last position to be 'behind' the starting position.
camera.set([0, 5, 7]);
up.set([0, 1, 0]);
lookAt.set([0, 0, -1]);

// Start the main program after loading teapot data.
loadObj('teapot_0.obj', function (data) {
	teapotData = data;

	initWebGL(canvas);
});

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
	mat4.rotate(mvMatrix, app.rotation, [0, 1, 0]);

	// Draw the mesh.
	drawMesh();

	update();
	FPSMeter.fpsCount();
	app.requestId = requestAnimationFrame(draw);
}

/**
 * Update each vertex's coordinates based on a trigonometric function.
 */
function update (){
	// Update time.
	var now = performance.now ? performance.now() : Date.now();
	var delta = now - app.lastTime;
	app.lastTime = now;
	app.rotation += delta / 4096;

	// Texture drift.
	for (var i = 0; i < teapotTextureCoords.length; i++) {
		teapotTextureCoords[i] += 0.0001;
	}
}

/**
 * Draws the terrain using vertex and color buffers.
 */
function drawMesh (){
	// Draw normals.
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
	gl.vertexAttribPointer(
			vertexNormalAttribute,
			3 /* attribute size */,
			gl.FLOAT,
			false /* normalized */,
			0 /* stride */,
			0 /* offset */);

	// Bind textures, add drift.
	gl.bindBuffer(gl.ARRAY_BUFFER, teapotTextureBuffer);
	gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(teapotTextureCoords),
			gl.STATIC_DRAW);
	gl.vertexAttribPointer(
			textureCoordAttribute,
			2 /* attribute size */,
			gl.FLOAT,
			false /* normalized */,
			0 /* stride */,
			0 /* offset */);

	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, potTexture);
    gl.uniform1i(program.samplerUniform, 0 /* textureIndex */);

    // Bind environment map texture.
	gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, sodaTexture);
    gl.uniform1i(program.worldSamplerUniform, 1 /* textureIndex */);

	// Setup the position buffer for the shape's vertices.
	gl.bindBuffer(gl.ARRAY_BUFFER, teapotVerticesBuffer);
	gl.vertexAttribPointer(
			vertexPositionAttribute,
			3 /* attribute size */,
			gl.FLOAT,
			false /* normalized */,
			0 /* stride */,
			0 /* offset */);

	// Lighting.
	gl.uniform1i(program.useLightingUniform, true /* useLighting */);
	gl.uniform1f(program.materialShininessUniform, 20.0);
	gl.uniform3f(program.ambientColorUniform, 0.2, 0.2, 0.2);
	gl.uniform3f(program.pointLightLocationUniform, 5, 4, 5);
	gl.uniform3f(program.pointLightSpecularColorUniform, 0.8, 0.8, 0.8);
	gl.uniform3f(program.pointLightingDirectionalColorUniform, 0.8, 0.8, 0.8);

	// Draw the vertices using the TRIANGLES method.
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotIndicesBuffer);

	// Set the matrix uniforms to provide updates to the shaders whenever
	// matrices are updated.
	setMatrixUniforms();

	// Draw.
	gl.drawElements(
			gl.TRIANGLES,
			teapotData.faces.length,
			gl.UNSIGNED_SHORT /* type */,
			0 /* offset */);
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
			// Load textures before anything else.
			initTextures(function (){
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
			});
		}
	}
	catch (e){}
	if (!gl) alert("Unable to setup WebGL. Your browser may not support it.");

	return gl;
}
