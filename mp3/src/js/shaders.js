/**
 * This file contains shader logic.
 */

/**
 * Get uniforms for matrices as well as other properties.
 */
function getMatrixUniforms (){
	program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
	program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
	program.nMatrixUniform = gl.getUniformLocation(program, "uNMatrix");
	program.samplerUniform = gl.getUniformLocation(program, "uSampler");
	program.worldSamplerUniform = gl.getUniformLocation(program, "uWorldSampler");
	program.materialShininessUniform = gl.getUniformLocation(program, "uMaterialShininess");
	program.useLightingUniform = gl.getUniformLocation(program, "uUseLighting");
	program.ambientColorUniform = gl.getUniformLocation(program, "uAmbientColor");
	program.directionalColorUniform = gl.getUniformLocation(program, "uDirectionalColor");
	program.lightingDirectionUniform = gl.getUniformLocation(program, "uLightingDirection");
	program.pointLightLocationUniform = gl.getUniformLocation(program, "uPointLightLocation");
   	program.pointLightSpecularColorUniform = gl.getUniformLocation(program, "uPointLightSpecularColor");
}

/**
 * Set matrix uniforms related to the modelView, perspective, and normals.
 */
function setMatrixUniforms (){
	gl.uniformMatrix4fv(program.pMatrixUniform, false /* transpose */, pMatrix);
	gl.uniformMatrix4fv(program.mvMatrixUniform, false /* transpose */, mvMatrix);

	// While angent vectors can be transformed via the mvMatrix, normal vectors
	// cannot.  Thus, we transform the normal via this new technique to preserve
	// the orthogonality.  For more info, see
	// http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/
	var normalMatrix = mat3.create();
	mat4.toInverseMat3(mvMatrix, normalMatrix);
	mat3.transpose(normalMatrix);
	gl.uniformMatrix3fv(program.nMatrixUniform, false /* transpose */, normalMatrix);
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

	vertexNormalAttribute = gl.getAttribLocation(program, "aVertexNormal");
	gl.enableVertexAttribArray(vertexNormalAttribute);

	textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");
	gl.enableVertexAttribArray(textureCoordAttribute);

	// Get matrix uniforms.
	getMatrixUniforms();
}
