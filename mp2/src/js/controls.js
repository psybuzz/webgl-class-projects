/**
 * This file contains logic for the camera/airplane controls.
 */

/**
 * Trigger flight controls for navigation when arrow keys are pressed.
 *
 * @param {Event} e The keyup event.
 */
document.onkeydown = function (e){
	if (e.keyCode === 37) {
		app.left = true;
		app.right = false;
	} else if (e.keyCode === 38) {
		app.up = true;
		app.down = false;
	} else if (e.keyCode === 39) {
		app.left = false;
		app.right = true;
	} else if (e.keyCode === 40) {
		app.up = false;
		app.down = true;
	}
}

/**
 * Toggle the night-mode cover behind the canvas when a space/enter is pressed.
 * Also releases flying controls.
 *
 * @param {Event} e The keyup event.
 */
document.onkeyup = function (e){
	if (e.keyCode === 32 || e.keyCode === 27){		// Space or Esc.
		app.coverEl.style.opacity = app.coverEl.style.opacity === '1' ? 0 : 1;

		// Grow or shrink the content area.
		if (!app.fullscreen){
			app.contentEl.classList.add('fullscreen');
		} else {
			app.contentEl.classList.remove('fullscreen');
		}
		app.fullscreen = !app.fullscreen;

	} else if (e.keyCode === 37) {
		app.left = false;
	} else if (e.keyCode === 38) {
		app.up = false;
	} else if (e.keyCode === 39) {
		app.right = false;
	} else if (e.keyCode === 40) {
		app.down = false;
	}
}
