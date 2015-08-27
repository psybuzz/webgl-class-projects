// Frames Per Second meter.
var FPSMeter = {
	// The meter's HTML element.
	el: document.getElementById('fpsMeter'),

	// The number of frames elapsed.
	frames_: 0,

	// The timing function for the current time.
	now: function (){
		return performance.now ? performance.now() : Date.now();
	},

	// The last recorded time.
	lastTime: Date.now(),

	// The array of previously recorded FPS readings.
	fpsBuffer: [],

	// The number of readings to hold in the FPS buffer.
	fpsBufferLength: 3,

	// The current index in the FPS buffer array.
	bufferIndex: 3,

	// The current time-averaged FPS reading.
	fps: 0,

	/**
	 * Takes a frame tick into account and updates the FPS meter.
	 */
	fpsCount: function (){
		this.frames_++;

		// Calculate the FPS using the current and last recorded time.
		var time = this.now();
		var fps = 1000/(time - this.lastTime);
		this.lastTime = time;

		// Update the FPS buffer to better predict average FPS.
		this.fpsBuffer[this.bufferIndex] = fps;
		this.bufferIndex = (this.bufferIndex + 1) % this.fpsBufferLength;
		var bufferSum = 0;
		for (var i = 0; i < this.fpsBufferLength; i++) {
			bufferSum += this.fpsBuffer[i] || 0;
		}
		this.fps = Math.floor(bufferSum / this.fpsBufferLength);

		// Update the element every 30 frames.
		if (this.frames_ % 30 === 0){
			this.el.innerText = 'FPS: ' + this.fps;
		}
	}

};
