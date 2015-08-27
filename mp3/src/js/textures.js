/**
 * This file contains texture related logic.
 */

/**
 * Initializes textures to be processed.
 * 
 * @param  {Function} callback The callback when textures are done loading.
 */
function initTextures (callback){
	var finished = 0;

	sodaTexture = gl.createTexture();
	sodaTexture.image = new Image();
	sodaTexture.image.onload = function (){
		finished++;
		loadedTexture(sodaTexture);
		console.log("Loaded texture: "+sodaTexture.image.src);

		if (finished >= 2) callback();
	};
	sodaTexture.image.src = "soda_hall_probe.jpg";

	potTexture = gl.createTexture();
	potTexture.image = new Image();
	potTexture.image.onload = function (){
		finished++
		loadedTexture(potTexture);
		console.log("Loaded texture: "+potTexture.image.src);
		
		if (finished >= 2) callback();
	};
	potTexture.image.src = "wood.jpg";
	// potTexture.image.src = "bamboo.jpg";
	// potTexture.image.src = "cushion.jpg";
	// potTexture.image.src = "elephant.jpg";
	// potTexture.image.src = "leather.jpg";
	// potTexture.image.src = "silk.jpg";
	// potTexture.image.src = "silk2.jpg";
	// potTexture.image.src = "sponge.jpg";
	// potTexture.image.src = "sponge2.jpg";
	// potTexture.image.src = "orange.jpg";
	// potTexture.image.src = "meat.jpeg";
	// potTexture.image.src = "bread.jpg";
}

/**
 * Load a texture are prepare it for use.
 * 
 * @param  {GL.Texture} texture The texture to prepare.
 */
function loadedTexture (texture){
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0 /* detail */, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);

	// Clear current texture.
	gl.bindTexture(gl.TEXTURE_2D, null);
}

/**
 * Map vertex positions on the teapot to their respective texture coordinates.
 * 
 * @param  {Number} x The x coordinate.
 * @param  {Number} y The y coordinate.
 * @param  {Number} z The z coordinate
 * 
 * @return {Object}   The texture coordinates for the vertex.
 */
function getTextureCoordsFromVertex (x, y, z){
	var s = (Math.atan2(z, x) + Math.PI) / (2*Math.PI);
	var t = y / 2.5;

	return {
		s: s / .5,
		t: t / .5
	}
}
