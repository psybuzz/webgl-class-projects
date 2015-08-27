# MP2 - Flight Simulator
# Erik Luo - erikluo2
# 10/10/14

This project is my second machine problem submission for CS418: Interactive
Computer Graphics at UIUC.  The goal of the assignment was to create a flight
simulator program where users can guide the camera through a generated terrain
using the arrow keys to control pitch and roll.


### Structure

Source code can be found under 'src/'.  Screenshots can be found under
'screenshots/'.  A video demo can be found at http://youtu.be/PMhpbefoYyo

The HTML page "index.html" is the starting point for this WebGL graphics
program.  When you launch it in your browser, it will load along with the
required JavaScript and CSS assets.  Vertex and fragment shaders are included
inline within the HTML; their source is read from "js/app.js", where the rest of
the graphics-related code is mainly found.

To calculate and display a frames per second meter on the page, the "js/fps.js"
file provides a generic object used to do so.


### Mechanics

In order to simulate the rotation system, the program keeps an internal state of
the current camera position, direction, and orientation.  The GlMatrix v0.9.5
library provided several essential functions, such as matrix functions
(lookAt() and perspective()) and vector functions (cross() and normalize()).


### Running the Program

There are no compilation steps required.  Simply open up "src/index.html" in a
web browser that supports WebGL, such as Chrome, Safari, Firefox, or IE 11.
This was tested on a Mac running the latest version of Chrome.

Once open, the web page should display the canvas in the center.  Pressing the
arrow keys controls the pitch (up/down) and roll (left/right) of the simulated
plane.  Pressing the spacebar/enter key will toggle a fullscreen experience.
