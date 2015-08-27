# MP4 - Subdivision Surfaces
# Erik Luo - erikluo2
# 12/5/14

This project is my fourth machine problem submission for CS418: Interactive
Computer Graphics at UIUC.  The goal of the assignment was to create a 3D rendering of the letter 'I' that uses extrusion, subdivision surfaces, and cubic space curves.

In order to add interactive controls, I used a freely available library, dat-gui:
https://code.google.com/p/dat-gui/


### Structure

Source code can be found under 'src/'.  Screenshots can be found under
'screenshots/'.  A video demo can be found at http://youtu.be/YPNdEmhCdbg

The HTML page "index.html" is the starting point for this WebGL graphics
program.  When you launch it in your browser, it will load along with the
required JavaScript and CSS assets.  Vertex and fragment shaders are included
inline within the HTML; their source is read from "js/app.js", where the rest of
the graphics-related code is mainly found.

To calculate and display a frames per second meter on the page, the "js/fps.js"
file provides a generic object used to do so.


### Mechanics

The mesh data for the letter 'I' is generated when the page is loaded.  This logic is handled in js/letterMesh.js.  UI controls are defined in the js/controls.js, where an options object holds configurations.  That file also holds code to recompute the mesh data after an option is changed, such as changing the subdivision level or the ambient color, for example.  

Subdivison logic resides in js/subdivision.js, and camera path along with bezier curve logic resides in js/camera.js.

The 'I' shown is a simple mesh with configurable dimensions, rendered with phong lighting.  There are two camera paths to choose from.


### Running the Program

Open up your favorite WebGl-compatible web browser, such as Google Chrome,
Safari, Firefox, or IE 11 and navigate to "src/index.html"

The page should open up the WebGL MP.
