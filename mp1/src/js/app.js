/**
 * Initial setup.
 */

var canvas = document.getElementById("canvas");
var gl = initWebGL(canvas);		// Initialize the GL context
var t = 0;						// Frame count, used for animation.
var letterVertices = getIVertices(0.7, 1.5, 0.2, 1.0);
var vertexPositionAttribute;
var vertexColorAttribute;

// State variables.
var app = {
	// Whether or not we are only showing the I's wireframe.
	wireframe: false,

	// Whether or not we are only showing the I's outline.
	outline: true,
};

if (gl){
	gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
	gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
	gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.

	// Initialize vertex and fragment shaders.
	initShaders();

	// Start rendering.
	draw();
}

function draw (){
	gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.

	// Draw the I and its outline.
	drawIMesh();
	drawIOutline();

	update();
	FPSMeter.fpsCount();
	requestAnimationFrame(draw);
}

/**
 * Draws the I mesh using vertex and color buffers.
 */
function drawIMesh (){
	var vertexBufferData = triangleBufferDataFromVertices(letterVertices);

	// Setup the color buffer for the vertex colors.
	var vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    var colorSet = [
    		[1.0, 0.0, 0.0, 1.0],
        	[0.0, 1.0, 0.0, 1.0],
        	[0.0, 0.0, 1.0, 1.0]];
    var colors = [];
    for (var i=0; i<vertexBufferData.lines.length; i++){
    	colors = colors.concat(colorSet[i % 3]);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexColorAttribute,
    		2 /* attribute size */,
    		gl.FLOAT,
    		false /* normalized */,
    		0 /* stride */,
			0 /* offset */);
    
	// Setup the position buffer for the shape's vertices.
	var vertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
	gl.vertexAttribPointer(
			vertexPositionAttribute,
			2 /* attribute size */,
			gl.FLOAT,
			false /* normalized */,
			0 /* stride */,
			0 /* offset */);

	if (!app.wireframe){
		// Draw the vertices using the TRIANGLE_STRIP method.
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexBufferData.top), gl.STATIC_DRAW);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0 /* firstIndex */, vertexBufferData.top.length / 2);

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexBufferData.trunk), gl.STATIC_DRAW);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0 /* firstIndex */, vertexBufferData.trunk.length / 2);

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexBufferData.bottom), gl.STATIC_DRAW);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0 /* firstIndex */, vertexBufferData.bottom.length / 2);
	} else {
		// Draw the wireframe lines.
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexBufferData.lines), gl.STATIC_DRAW)
		gl.drawArrays(gl.LINE_STRIP, 0 /* firstIndex */, vertexBufferData.lines.length / 2);
	}
}


/**
 * Draws the I's outline.
 */
function drawIOutline (){
	// Setup the color buffer for the vertex colors.
	var vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    var colors = [];
    for (var i=0; i<letterVertices.length; i++){
    	colors = colors.concat([0.5, 0.0, 1.0, 0.2]);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexColorAttribute,
    		2 /* attribute size */,
    		gl.FLOAT,
    		false /* normalized */,
    		0 /* stride */,
			0 /* offset */);

	// Setup the position buffer for the shape's vertices.
	var vertexPositionBuffer = gl.createBuffer();
	var vertexBufferData = letterVertices;
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
	gl.bufferData(
			gl.ARRAY_BUFFER, 
			new Float32Array(vertexBufferData),
			gl.STATIC_DRAW);
	gl.vertexAttribPointer(
			vertexPositionAttribute,
			2 /* attribute size */,
			gl.FLOAT,
			false /* normalized */,
			0 /* stride */,
			0 /* offset */);

	// Set extra line width.
	gl.lineWidth(50);

	// Draw the vertices using the LINE_LOOP method.
	if (app.outline){
		gl.drawArrays(gl.LINE_LOOP, 0 /* firstIndex */, vertexBufferData.length / 2);
	}
}

/**
 * Update each vertex's coordinates based on a trigonometric function.
 */
function update (){
	// Increment time.
	t++;

	var len = len = letterVertices.length;
	var halfLen = len / 2;
	for (var i = 0; i < len; i++) {
		if (i % 2 === 0){		// Affects x-coordinates.
			letterVertices[i] += 0.001*Math.cos(t/(i-halfLen+0.5));
		} else {				// Affects y-coordinates.
			letterVertices[i] += 0.005*Math.sin(t/(i-halfLen+0.1));
		}
	}
}



/**
 * Initializes the shaders and enables the vertex array buffer attributes.
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
}

/**
 * Constructs an array of vertices representing the specified 'I'.
 * 
 * @param  {number} fullWidth   The full width of the letter.
 * @param  {number} fullHeight  The full height of the letter.
 * @param  {number} trunkWidth  The width of the narrow trunk section.
 * @param  {number} trunkHeight The height of the narrow trunk section.
 * 
 * @return {Array.number}       The list of vertices.
 */
function getIVertices (fullWidth, fullHeight, trunkWidth, trunkHeight){
	var halfFullWidth = fullWidth / 2;
	var halfFullHeight = fullHeight / 2;
	var halfTrunkWidth = trunkWidth / 2;
	var halfTrunkHeight = trunkHeight / 2;

	return [
		// Left side, top to bottom.
		-halfFullWidth, halfFullHeight,
		-halfFullWidth, halfTrunkHeight,
		-halfTrunkWidth, halfTrunkHeight,
		-halfTrunkWidth, -halfTrunkHeight,
		-halfFullWidth, -halfTrunkHeight,
		-halfFullWidth, -halfFullHeight,

		// Right side, top to bottom.
		halfFullWidth, -halfFullHeight,
		halfFullWidth, -halfTrunkHeight,
		halfTrunkWidth, -halfTrunkHeight,
		halfTrunkWidth, halfTrunkHeight,
		halfFullWidth, halfTrunkHeight,
		halfFullWidth, halfFullHeight,
	];
}

/**
 * Turns a list of ordered vertices corresponding to the letter I and returns a vertex array to be
 * passed into the buffer data as triangles.
 * 
 * @param  {Array.number} pts The ordered points from top left, going counter-clockwise.
 * 
 * @return {Object}     	  An object containing triangle buffer data.
 */
function triangleBufferDataFromVertices (pts) {
	return {
		// Top.
		top: [
			pts[2], pts[3], pts[0], pts[1], pts[4], pts[5],
			pts[22], pts[23], pts[18], pts[19], pts[20], pts[21]],

		// Trunk.
		trunk: [
			pts[4], pts[5], pts[6], pts[7], pts[18], pts[19],
			pts[16], pts[17], pts[18], pts[19]],

		// Bottom.
		bottom: [
			pts[8], pts[9], pts[6], pts[7], pts[10], pts[11],
			pts[16], pts[17], pts[12], pts[13], pts[14], pts[15]],

		// Triangle lines.
		lines: [
			// Top.
			pts[0], pts[1], pts[2], pts[3], pts[4], pts[5],
			pts[0], pts[1], pts[4], pts[5], pts[18], pts[19],
			pts[0], pts[1], pts[22], pts[23], pts[18], pts[19],
			pts[22], pts[23], pts[20], pts[21], pts[18], pts[19],

			// Trunk.
			pts[4], pts[5], pts[6], pts[7], pts[18], pts[19],
			pts[6], pts[7], pts[16], pts[17], pts[18], pts[19],

			// Bottom.
			pts[6], pts[7], pts[8], pts[9], pts[10], pts[11],
			pts[6], pts[7], pts[10], pts[11], pts[16], pts[17],
			pts[10], pts[11], pts[12], pts[13], pts[16], pts[17],
			pts[12], pts[13], pts[14], pts[15], pts[16], pts[17]]
	};
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
	gl = null;
	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		gl.viewport(0, 0, canvas.width, canvas.height);
	}
	catch (e){}

	if (!gl) alert("Unable to initialize WebGL. Your browser may not support it.");
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

/**
 * Toggle the night-mode cover behind the canvas when a certain key is pressed.
 *
 * @param {Event} e The keyup event.
 */
document.onkeyup = function (e){
	if (e.keyCode === 32 || e.keyCode === 27){		// Space or Esc.
		var coverEl = document.getElementById('cover');
		coverEl.style.opacity = coverEl.style.opacity === '1' ? 0 : 1;
	}
}

var wireButton = document.getElementById('toggleWire');
var outlineButton = document.getElementById('toggleOutline');
/**
 * Toggle wireframe mode when the button is clicked.
 */
wireButton.addEventListener('click', function (e){
	app.wireframe = !app.wireframe;
});

/**
 * Toggle outline mode when the button is clicked.
 */
outlineButton.addEventListener('click', function (e){
	app.outline = !app.outline;
});
