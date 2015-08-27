# MP1 - The Dancing 'I'

This project is my first machine problem submission for CS418: Interactive Computer Graphics at UIUC.  The goal of the assignment was to create a rendered, animated model of a dancing letter 'I'.


### Structure

Source code can be found under 'src/'.  Screenshots can be found under 'screenshots/'.  A video demo can be found at http://youtu.be/DfQaDqSqZ0M

The HTML page "index.html" is the starting point for this WebGL graphics program.  When you launch it in your browser, it will load along with the required JavaScript and CSS assets.  Vertex and fragment shaders are included inline within the HTML; their source is read from "js/app.js", where the rest of the graphics-related code is mainly found.

To calculate and display a frames per second meter on the page, the "js/fps.js" file provides a generic object used to do so.


### Running the Program

There are no compilation steps required.  Simply open up "src/index.html" in a web browser that supports WebGL, such as Chrome, Safari, Firefox, or IE 11.  This was tested on a Mac running the latest version of Chrome.

Once open, the web page should display an animated, rendered letter 'I' in the center.  You can click the 'Toggle wireframe' and 'Outline' links to toggle the wireframe and outline respectively.
