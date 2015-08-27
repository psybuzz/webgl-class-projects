/**
 * This file contains the main logic for the application.
 */

var vertexPositionAttribute;
var vertexColorAttribute;
var vertexColorBuffer, vertexPositionBuffer;

var pMatrixUniform, mvMatrixUniform;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();

var camera = vec3.create();
var lastCamera = vec3.create();
var direction = vec3.create();
var dirDiff = vec3.create();
var lookAt = vec3.create();
var up = vec3.create();
var upDiff = vec3.create();

// Initialize the camera's last position to be 'behind' the starting position.
lastCamera.set([30, 2, 101]);
camera.set([30, 2, 100]);
direction.set([0, 0, -1]);
dirDiff.set(direction);
up.set([0, 1, 0]);
upDiff.set(up);

var program = null;
var canvas = document.getElementById("canvas");
var gl = null;

// The application's configurable state variables.
var app = {
	coverEl: document.getElementById('cover'),
	contentEl: document.getElementById('content'),
	fullscreen: false,
	velocity: 4,
	pitchVelocity: 0.04,
	rollVelocity: 0.4,
	rows: 30,
	cols: 50,
	gridSpacing: 2,
	lastTime: performance.now ? performance.now() : Date.now(),
	left: false,
	right: false,
	up: false,
	down: false
}

// Start the main program.
initWebGL(canvas);

function getMatrixUniforms (){
  pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
  mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");          
}

function setMatrixUniforms (){
  gl.uniformMatrix4fv(pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(mvMatrixUniform, false, mvMatrix);
}


function draw (){
	// Set the clear color to 0% black and clear buffer bits.
	gl.clearColor(0.0, 0.0, 0.0, 0.0);
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

	// Draw the terrain.
	drawTerrain();

	// Apply camera look-at transformation to the model view matrix.
	mat4.lookAt(
			camera,			// Viewer's eye.
			lookAt,			// Lookat point.
			up,				// Up vector.
			mvMatrix);
	
	// Set the matrix uniforms to provide updates to the shaders.
	setMatrixUniforms();

	update();
	FPSMeter.fpsCount();
	requestAnimationFrame(draw);
}

/**
 * Draws the terrain using vertex and color buffers.
 */
function drawTerrain (){
	// Setup the color buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.vertexAttribPointer(vertexColorAttribute,
    		3 /* attribute size */,
    		gl.FLOAT,
    		false /* normalized */,
    		0 /* stride */,
			0 /* offset */);

	// Setup the position buffer for the shape's vertices.
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
	gl.vertexAttribPointer(
			vertexPositionAttribute,
			3 /* attribute size */,
			gl.FLOAT,
			false /* normalized */,
			0 /* stride */,
			0 /* offset */);

	// Draw the vertices using the TRIANGLES method.
	gl.drawArrays(gl.TRIANGLES, 0 /* firstIndex */, vertexBufferData.length/3);
}

/**
 * Update each vertex's coordinates based on a trigonometric function.
 */
function update (){
	// Update time.
	var now = performance.now ? performance.now() : Date.now();
	var delta = now - app.lastTime;
	app.lastTime = now;


	// Get the current direction.
	vec3.subtract(camera, lastCamera, direction);
	vec3.normalize(direction);
	vec3.scale(direction, app.velocity * delta / 1000);

	// Save the last camera position.
	lastCamera.set(camera);

	// Normalize the up vector before applying scaling.
	vec3.normalize(up);

	// Initialize the difference vectors to the last direction.
	dirDiff.set(direction);

	// Apply rotation transformations to the direction vector.
	if (app.left){
		// Calculate the up vector's change.
		vec3.cross(up, direction, upDiff);
		vec3.normalize(upDiff);
		vec3.scale(upDiff, app.rollVelocity * delta / 1000);

		vec3.add(up, upDiff);

	} else if (app.right){
		// Calculate the up vector's change.
		vec3.cross(up, direction, upDiff);
		vec3.normalize(upDiff);
		vec3.scale(upDiff, app.rollVelocity * delta / 1000);

		vec3.subtract(up, upDiff);
		
	}

	// Break left/right and up/down into separate cases so that we can apply
	// both together.
	if (app.up){
		// Add the up vector to the direction.
		vec3.scale(up, app.pitchVelocity * delta / 1000);
		vec3.add(direction, up);

		// Correct the up vector using the old direction.
		vec3.cross(dirDiff, direction);	// Now, dirDiff x newDir = newUp.
		vec3.cross(dirDiff, direction, up);

	} else if (app.down){
		// Add the up vector to the direction.
		vec3.scale(up, app.pitchVelocity * delta / 1000);
		vec3.subtract(direction, up);

		// Correct the up vector using the old direction.
		vec3.cross(dirDiff, direction);	// Now, newDir x dirDiff = newUp.
		vec3.cross(direction, dirDiff, up);

	}

	// Renormalize up vector.
	vec3.normalize(up);

	// Add direction to get the new camera, and one more to get a lookAt vector.
	vec3.add(camera, direction);
	vec3.add(camera, direction, lookAt);
}



/**
 * Initializes the shaders and enables the vertex array buffer attributes as
 * well as matrix uniforms.
 */
function initShaders (){
	var vertexShader = createShaderFromScriptElement(gl, "vertex-shader");
	var fragmentShader = createShaderFromScriptElement(gl, "fragment-shader");
	program = createProgram(gl, [vertexShader, fragmentShader]);
	gl.useProgram(program);

	vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
	gl.enableVertexAttribArray(vertexPositionAttribute);
	
	vertexColorAttribute = gl.getAttribLocation(program, "aVertexColor");
	gl.enableVertexAttribArray(vertexColorAttribute);

	program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
	program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
}

/**
 * Initializes the buffers.
 */
function initBuffers (){
	// Build an array of colors.
    var colorSet = [
    		[1.0, 0.0, 0.0, 1.0],
        	[0.0, 1.0, 0.0, 1.0],
        	[0.0, 0.0, 1.0, 1.0]];
    var colors = [];
    for (var i=0; i<6*app.rows*app.cols; i++){
    	colors = colors.concat(colorSet[i % 3]);
    }

	// Setup the color buffer for the vertex colors.
	vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	// Setup the position buffer for the shape's vertices.
	vertexPositionBuffer = gl.createBuffer();
	vertexBufferData = getTerrainVertices();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
	gl.bufferData(
			gl.ARRAY_BUFFER, 
			new Float32Array(vertexBufferData),
			gl.STATIC_DRAW);
}

/**
 * Builds an array of vertices representing a grid with dimensions specified by
 * app.rows and app.cols.
 * 
 * @return {Array.Number} The terrain vertices.
 */
function getTerrainVertices (){
	var rows = app.rows, cols = app.cols;
	var spacing = app.gridSpacing;
	var maxHeight = 2;
	var bigHeight = 5;
	var heightMap = [];

	// Construct a 2D heightmap, giving a numeric height to each cell.
	for (var i = 0; i < rows; i++) {
		heightMap[i] = [];
		for (var j = 0; j < cols; j++) {
			if (Math.random() > 0.9){
				heightMap[i][j] = Math.random()*bigHeight;
			} else {
				heightMap[i][j] = Math.random()*maxHeight;
			}
		}
	}

	// Construct an array of grid vertices based on the heightmap values.
	var grid = [];
	for (i = 0; i < rows - 1; i++) {
		for (j = 0; j < cols - 1; j++) {
			grid = grid.concat([
					// Upper left triangle.
					spacing*i, heightMap[i][j], spacing*j,
					spacing*i, heightMap[i][j+1], spacing*(j+1),
					spacing*(i+1), heightMap[i+1][j+1], spacing*(j+1),

					// Lower right triangle.
					spacing*i, heightMap[i][j], spacing*j,
					spacing*(i+1), heightMap[i+1][j], spacing*j, 
					spacing*(i+1), heightMap[i+1][j+1], spacing*(j+1)]);
		}
	}

	return grid;
}



/**
 * User interface and setup logic.
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

			// Enable depth testing.
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);

			// Fetch matrix uniforms that we can set later.
			getMatrixUniforms();

			// Establish viewport and perspective.
			gl.viewport(0, 0, canvas.width, canvas.height);
			mat4.perspective(45, canvas.width/canvas.height, 0.1, 100, pMatrix);

			// Begin animation loop.
			draw();
		}
	}
	catch (e){}

	if (!gl) alert(
			"Unable to initialize WebGL. Your browser may not support it.");

	return gl;
}

/**
 * Updates the width and height of the canvas element and resets the viewport.
 */
window.onresize = function (){
	var resizeDebounceTime = 500;

	// Holds a time to wait until resize is enabled.
	this.resizeAfterTime = this.resizeAfterTime || 0;

	// Schedule the resize function after debounce time has passed.
	setTimeout(function (){
		var now = Date.now();
		if (now > resizeAfterTime){
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			if (gl) gl.viewport(0, 0, canvas.width, canvas.height);

			// Buy extra time before the next resize.
			this.resizeAfterTime = now + resizeDebounceTime;
		}
	}.bind(this), resizeDebounceTime);
};
