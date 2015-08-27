/**
 * This file contains logic for the UI controls.
 */

var options = {
	animate: true,
	subdivide: 0,
	width: 3,
	height: 7,
	trunkWidth: 1,
	trunkHeight: 3,
	extrusion: 1,
	'random normals': false,
	wireframe: false,
	camera: '1',
	'ambient color': [0.3*255, 0.3*255, 0.5*255]
}

// Add a dat.GUI for the options.
var gui = new dat.GUI();
gui.add(options, 'width', 0.5, 12).onFinishChange(recomputeMeshGeometry);
gui.add(options, 'height', 0.5, 12).onFinishChange(recomputeMeshGeometry);
gui.add(options, 'trunkWidth', 0.1, 4).onFinishChange(recomputeMeshGeometry);
gui.add(options, 'trunkHeight', 0.5, 8).onFinishChange(recomputeMeshGeometry);
gui.add(options, 'extrusion', 0.1, 2.5).onFinishChange(recomputeMeshGeometry);
gui.add(options, 'subdivide', { None: 0, Once: 1, Twice: 2, Thrice: 3 })
		.onFinishChange(recomputeMeshGeometry);
gui.add(options, 'random normals').onFinishChange(recomputeMeshGeometry);
gui.add(options, 'wireframe');
gui.add(options, 'camera', ['1', '2']);
gui.add(options, 'animate');
gui.addColor(options, 'ambient color');

// Style hack to avoid overflow.
document.getElementsByClassName('hue-field')[0].style.border = "";

/**
 * Recomputes the mesh geometry using the options.
 */
function recomputeMeshGeometry (){
	var letterData = getIMeshVerts(
			options.width,
			options.height,
			options.trunkWidth,
			options.trunkHeight,
			-options.extrusion / 2,
			options.extrusion / 2);
	var subdata = letterData;
	for (var i=0; i<options.subdivide; i++){
		subdata = subdivide(subdata);
	}
	var data = getTrianglesFromQuads(subdata);
	var normals = getNormalsFromTriangles(data);
	if (options['random normals']){
		normals = normals.map(function (el){
			return (Math.random()-0.5)*0.3+0.7*el
		});
	}

	// Change the value of the global meshData variable.
	meshData = {
		vertices: data,
		normals: normals
	}

	// Reset buffers.
	initBuffers();
}

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
