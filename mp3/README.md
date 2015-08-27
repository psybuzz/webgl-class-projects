# MP3 - Teapot
# Erik Luo - erikluo2
# 11/4/14

This project is my third machine problem submission for CS418: Interactive
Computer Graphics at UIUC.  The goal of the assignment was to create a realistic
teapot with lighting and textures.  Many of the texture resources were found
online via Google Images for this educational context.  The light probe for
environment mapping came from Paul Debevec's site: http://debevec.org/Probes
Additional help came from these tutorials: http://learningwebgl.com/blog/


### Structure

Source code can be found under 'src/'.  Screenshots can be found under
'screenshots/'.  A video demo can be found at http://youtu.be/7RD8DgkvmTs

The HTML page "index.html" is the starting point for this WebGL graphics
program.  When you launch it in your browser, it will load along with the
required JavaScript and CSS assets.  Vertex and fragment shaders are included
inline within the HTML; their source is read from "js/app.js", where the rest of
the graphics-related code is mainly found.

To calculate and display a frames per second meter on the page, the "js/fps.js"
file provides a generic object used to do so.


### Mechanics

Most of the work to make the lighting work is in the fragment shader.  It
calculates weightings for the point light and a directional light which together
make a more realistic effect.

In terms of textures, there is a user-selected texture mapped directly onto the
teapot by vertex.  Furthermore, a light probe of Soda Hall is used to make
environment reflections on the surface.


### Running the Program

Since this machine problem utilizes many local resources in a web page, it
should be run from a local webserver.  If you have Python installed on your
machine, then you can open up a terminal/command line and navigate to the src/
directory.  Type "python -m SimpleHTTPServer", which should start a web server.

Next, open up your favorite WebGl-compatible web browser, such as Google Chrome,
Safari, Firefox, or IE 11.  Navigate to "http://localhost:8000", which should
be the default url for Python's simple server.

The page should open up the WebGL MP.

