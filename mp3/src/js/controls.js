/**
 * This file contains logic for the camera/airplane controls.
 */

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
