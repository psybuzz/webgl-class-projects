/**
 * This file contains user interface related logic.
 */

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
 * Manage the selection of texture material types.
 */
var selectedChoice = document.getElementsByClassName('selected')[0];
var choices = document.getElementsByClassName('choice');

for (var i = 0; i < choices.length; i++) {
	// Attach event listener to each choice.
	choices[i].onclick = function (){
		app.ready = false;
		window.cancelAnimationFrame(app.requestId);

		// Update user interface.
		selectedChoice.classList.remove('selected');
		this.classList.add('selected');
		selectedChoice = this;

		// Apply action.
		potTexture.image.src = this.dataset.choice;
	}
}
