"use strict";

var homework1 = function() {
var canvas;
var gl;


var index = 0;

var texSize = 64;

var numPositions = 108;

// declare arrays for the geometry
var positionsArray = [];
var normalsArray = [];
var texCoordsArray = [];

// variables for the texture
var texture;
var textFlagLoc;
var textFlag = 1.0;

// declare the vertices of our geometry
var vertices = [
  vec4(0.5, 0.1,  0.0, 1.0),
  vec4(1.0,  0.2,  0.0, 1.0),
  vec4(1.0,  0.6,  0.0, 1.0),
  vec4(0.6, 0.6,  0.0, 1.0),
  vec4(0.6, 0.2,  1.0, 1.0),
  vec4(1.0,  0.2,  1.0, 1.0),
  vec4(1.0,  0.6,  1.0, 1.0),
  vec4(0.6, 0.6,  1.0, 1.0),
  vec4(0.3, 0.2, 1.0, 1.0),
  vec4(1.3, 0.2, 1.0, 1.0),
  vec4(1.3, 0.6, 1.0, 1.0),
  vec4(0.2, 0.6, 0.9, 1.0),
  vec4(0.3, 0.2, 1.4, 1.0),
  vec4(1.5, 0.2, 1.6, 1.0),
  vec4(1.5, 0.6, 1.6, 1.0),
  vec4(0.2, 0.6, 1.5, 1.0),
  vec4(0.6, 0.6, 0.3, 1.0),
  vec4(1.0, 0.6, 0.3, 1.0),
  vec4(1.1, 1.2, 0.3, 1.0),
  vec4(0.6, 1.1, 0.3, 1.0),
  vec4(0.6, 0.6, 0.7, 1.0),
  vec4(1.0, 0.6, 0.7, 1.0),
  vec4(1.1, 0.8, 0.7, 1.0),
  vec4(0.6, 1.1, 0.7, 1.0),
];

// declare the texture coordinates 
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

// parameters for the projectionMatrix
var near = 0.3;
var far = 9.0;
var radius = -2.7;
var theta = 0.9;
var phi = -0.43;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 55.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect = 1.0;       // Viewport aspect ratio

// parameters for the modelViewMatrix
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// parameters of the directional light
var dirLightPosition = vec4(-10.0, 10.0, 0.0, 0.0);
var dirLightAmbient = vec4(0.1, 0.1, 0.1, 1.0);
var dirLightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);

// parameters of material
var materialAmbient = vec4(1.0, 0.3, 0.2, 1.0);
var materialDiffuse = vec4(0.78, 0.53, 0.32, 1.0);

// parameters of the spotlight
var spotLightPosition = vec4(-50.0, -50.0, -50.0, 1.0 );
var spotLightAmbient = vec4(0.8, 0.8, 0.1, 1.0 );
var spotLightDiffuse = vec4(0.8, 0.8, 0.1, 1.0 );
var spotLightDirection = vec4(-0.59, -0.64, -0.24, 1.0);
var spotLightDirectionLoc;
var cutOff=0.3144;
var spotAlhpa = 1;
var cutOffVal, spotAlphaVal;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var nMatrix, nMatrixLoc;


function configureTexture(program,  image ) {
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "uTextureMap"), 0);
}

function quad(a, b, c, d) {

	 // compute normal vector for one triangle that compose a face
     var t1 = subtract(vertices[c], vertices[a]);
     var t2 = subtract(vertices[b], vertices[a]);
     var normal = cross(t1, t2);
     normal = vec4(normal[0], normal[1], normal[2], 1.0);

	 // add vertices to the array of vertices
	 // add the same normal for each vertex that compose a face
	 // add texture coordinates
	 
     positionsArray.push(vertices[a]);
     normalsArray.push(normal);
     texCoordsArray.push(texCoord[0]);

     positionsArray.push(vertices[b]);
     normalsArray.push(normal);
     texCoordsArray.push(texCoord[1]);

     positionsArray.push(vertices[c]);
     normalsArray.push(normal);
     texCoordsArray.push(texCoord[2]);

     positionsArray.push(vertices[a]);
     normalsArray.push(normal);
     texCoordsArray.push(texCoord[0]);

     positionsArray.push(vertices[c]);
     normalsArray.push(normal);
     texCoordsArray.push(texCoord[2]);

     positionsArray.push(vertices[d]);
     normalsArray.push(normal);
     texCoordsArray.push(texCoord[3]);
     console.log("normal " + normal);
}


function colorCube()
{
	// create faces of the object
	
    quad(3, 2, 1, 0);
    quad(5, 4, 0, 1);
    quad(4, 7, 3, 0);
    quad(1, 2, 6, 5);
    quad(13, 12, 8, 9);
    quad(15, 12, 13, 14);
    quad(15, 11, 8, 12);
    quad(14, 13, 9, 10);
    quad(10, 9, 5, 6);
    quad(7, 4, 8, 11);
    quad(15, 14, 10, 11);
    quad(16, 17, 2, 3);
    quad(6, 21, 20, 7);
    quad(23, 19, 16, 20);
    quad(22, 18, 19, 23);
    quad(22, 21, 17, 18);
    quad(19, 18, 17, 16);
    quad(21, 22, 23, 20);
    
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

	// compute coefficients of the shading model for directional light
    var comp1_dir = mult(dirLightAmbient, materialAmbient);
    var comp2_dir = mult(dirLightAmbient, materialAmbient);
    var comp3_dir = mult(dirLightDiffuse, materialDiffuse);

	// compute coefficients of the shading model for spotlight
    var comp1_spot = mult(dirLightAmbient, materialAmbient);
    var comp2_spot = mult(spotLightAmbient, materialAmbient);
    var comp3_spot = mult(spotLightDiffuse, materialDiffuse);


    colorCube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
    nMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

	// take image element from the HTML
    var image = document.getElementById("texImage");

    configureTexture(program, image);

    // sliders for viewing and projection parameters

    document.getElementById("zNearSlider").oninput = function (event) {
        if(this.valueAsNumber !== far){
            near = this.valueAsNumber;
            console.log("near: " + near);
        }
    };
    document.getElementById("zFarSlider").oninput = function (event) {
        if(this.valueAsNumber !== near){
            far = this.valueAsNumber;
            console.log("far: " + far);
        }
    };
    document.getElementById("radiusSlider").oninput = function(event) {
        if(this.valueAsNumber !== radius){
            radius = this.valueAsNumber;
            console.log("radius: " + radius);
        }
    };
    document.getElementById("thetaSlider").oninput = function(event) {
      if(this.valueAsNumber !== theta){
        theta = this.valueAsNumber* Math.PI/180.0;
        console.log("theta " + theta);
      }
    };
    document.getElementById("phiSlider").oninput = function(event) {
      if(this.valueAsNumber !== phi){
        phi = this.valueAsNumber* Math.PI/180.0;
        console.log("phi " + phi);
      }
    };
    document.getElementById("aspectSlider").oninput = function(event) {
      if(this.valueAsNumber !== aspect){
        aspect = this.valueAsNumber;
        console.log("aspect " + aspect);
      }
    };
    document.getElementById("fovSlider").oninput = function(event) {
      if(this.valueAsNumber !== fovy){
        fovy = this.valueAsNumber;
        console.log("fov " + fovy);
      }
    };


	// pass elements to the shaders
    gl.uniform4fv( gl.getUniformLocation(program,
       "comp1_dir"),flatten(comp1_dir));
    gl.uniform4fv( gl.getUniformLocation(program,
       "comp2_dir"),flatten(comp2_dir));
    gl.uniform4fv( gl.getUniformLocation(program,
       "comp3_dir"),flatten(comp3_dir));
    gl.uniform4fv( gl.getUniformLocation(program,
       "comp1_spot"),flatten(comp1_spot));
    gl.uniform4fv( gl.getUniformLocation(program,
       "comp2_spot"),flatten(comp2_spot));
    gl.uniform4fv( gl.getUniformLocation(program,
       "comp3_spot"),flatten(comp3_spot));
    gl.uniform4fv( gl.getUniformLocation(program,
       "uLightPosition"),flatten(dirLightPosition));



     gl.uniform4fv( gl.getUniformLocation(program,
        "spotLightPosition"),flatten(spotLightPosition) );
     spotLightDirectionLoc = gl.getUniformLocation(program, "spotLightDirection");
     textFlagLoc = gl.getUniformLocation(program, "textFlag");

      cutOffVal  = gl.getUniformLocation(program, "cutOff");
      spotAlphaVal = gl.getUniformLocation(program, "spotAlhpa");
    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// compute eye parameter of the modelViewMatrix
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    nMatrix = normalMatrix(modelViewMatrix, true);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix)  );

	// check for changes in the sliders' values
    document.getElementById("cutoffSlider").oninput = function(event) {
      if(this.valueAsNumber !== cutOff){
        cutOff = this.valueAsNumber;
        console.log("cutOff value " + cutOff);
      }
    };

    document.getElementById("alphaslider").oninput = function(event) {
      if(this.valueAsNumber !== spotAlhpa){
        spotAlhpa = this.valueAsNumber;
        console.log("Spotlight alpha value " + spotAlhpa);
      }
    };

    document.getElementById("xSpot").oninput = function(event) {
      if(this.valueAsNumber !== spotLightDirection[0]){
        spotLightDirection[0] = this.valueAsNumber;
        console.log("Spotlight x spotlight direction value " + spotLightDirection[0]);
      }
    };

    document.getElementById("ySpot").oninput = function(event) {
      if(this.valueAsNumber !== spotLightDirection[1]){
        spotLightDirection[1] = this.valueAsNumber;
        console.log("Spotlight y spotlight direction value " + spotLightDirection[1]);
      }
    };

    document.getElementById("zSpot").oninput = function(event) {
      if(this.valueAsNumber !== spotLightDirection[2]){
        spotLightDirection[2] = this.valueAsNumber;
        console.log("Spotlight z spotlight direction value " + spotLightDirection[2]);
      }
    };

    document.getElementById("toggleTexture").onclick = function(event) {
      if (textFlag === 1) textFlag = 0;
      else textFlag = 1;
    };

    gl.uniform1f(cutOffVal, cutOff);
    gl.uniform1f(spotAlphaVal, spotAlhpa);
    gl.uniform4fv(spotLightDirectionLoc, spotLightDirection);

    gl.uniform1f(textFlagLoc, textFlag);

    gl.drawArrays(gl.TRIANGLES, 0, numPositions);


    requestAnimationFrame(render);
}

}

homework1();
