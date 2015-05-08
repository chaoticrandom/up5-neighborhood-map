<h3>Frontend Web Developer NanoDegree Udacity Project5</h3>
<h4>GitHub Pages link:</h4>
http://v-yussupov.github.io/up5-neighborhood-map/
<h4>Edinburgh Neighborhood map</h4>
<h4>Description:</h4>
I really enjoyed travelling in Scotland with my wife and decided to refresh my memories and use Edinburgh as a location for Project 5. This is a map with some interesting places in Edinburgh. App gets information and photos from Foursquare API, and description and suggested links from Wikipedia. Places are categorized and each category has a list of related subcategories. User can filter places list by category/subcategory visibility and search place by its name.

<h4>Installation instructions:</h4>
Project's build folder contains development build, not minified and not concatenated.<br>
Github.io page contains production build, minified and concatenated.<br>
Build:<br>
1) Download project<br>
2) cd to project's directory<br>
3) run npm install<br>
4) after completion run gulp<br>
Use NODE_ENV variable to switch between development and production builds.<br>
to switch it on Windows: set NODE_ENV=production or set NODE_ENV=development<br>
to check build mode: echo %NODE_ENV%<br>
to switch it on Linux/Mac: export NODE_ENV=production or export NODE_ENV=development<br>
to check build mode: echo $NODE_ENV<br>
<h4>Libraries used:</h4>
1) Knockout JS http://knockoutjs.com/<br>
2) JQuery http://jquery.com/<br>
3) Semantic UI http://semantic-ui.com/<br>
4) InfoBubble http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobubble/examples/example.html<br>
<h4>APIs used:</h4>
1) Google Maps APIv3 https://developers.google.com/maps/documentation/javascript/<br>
2) Foursquare API https://developer.foursquare.com/<br>
3) Wikipedia API http://www.mediawiki.org/wiki/API:Main_page<br>
<h4>Project structure:</h4>
source - project's source files<br>
build - project's build folder<br>
gulpfile.js - gulp file<br>
package.json - npm package file<br>
<h4>Project's source folder structure:</h4>
-css - css files, concatenated and minified in production build<br>
&nbsp;--libs - Semantic UI components files<br>
&nbsp;--scss - Sass files<br>
-images - marker images files, taken from https://mapicons.mapsmarker.com/<br>
-js - js files<br>
&nbsp;--app - application files (custom-bindings.js, data.js, viewmodel.js), comments included; concatenated and minified into main.js in production build<br>
&nbsp;--vendor - vendor js files, concatenated and minified into libs.js in production build<br>
-template - html templates for "gulp-preprocess" module, minified in production build<br>
-favicon.ico<br>
-index.html - app entry point<br>
