"use strict";

var homework1 = function() {
var canvas;
var gl;


var index = 0;

var numPositions = 108;

var positionsArray = [];
var normalsArray = [];


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
  vec4(1.1, 0.8, 0.7, 1.0), //vec4(1.1, 1.0, 0.7, 1.0)
  vec4(0.6, 1.1, 0.7, 1.0),
];

var near = 0.3;
var far = 9.0;
var radius = -2.7;
var theta = 0.9;
var phi = -0.3;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 55.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect = 1.0;       // Viewport aspect ratio


var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var dirLightPosition = vec4(-10.0, 0.0, 0.0, 0.0);
var dirLightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var dirLightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);

var spotLightPosition = vec4(-10.0, -10.0, 10.0, 1.0 );
var spotLightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var spotLightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var spotLightDirection = vec4(-0.5,1.0,2.0,1.0);
var spotLightDirectionLoc;
var spotTheta=0.43;
var spotAlhpa = 1;
var spotThetaVal, spotAlphaVal;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var nMatrix, nMatrixLoc;


function quad(a, b, c, d) {

     var t1 = subtract(vertices[c], vertices[a]);
     var t2 = subtract(vertices[b], vertices[a]);
     var normal = cross(t1, t2);
     normal = vec4(normal[0], normal[1], normal[2], 1.0);


     positionsArray.push(vertices[a]);
     normalsArray.push(normal);
     positionsArray.push(vertices[b]);
     normalsArray.push(normal);
     positionsArray.push(vertices[c]);
     normalsArray.push(normal);
     positionsArray.push(vertices[a]);
     normalsArray.push(normal);
     positionsArray.push(vertices[c]);
     normalsArray.push(normal);
     positionsArray.push(vertices[d]);
     normalsArray.push(normal);
     console.log("normal " + normal);
}


function colorCube()
{
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
    /*quad(0, 1, 2, 3);
    quad(7, 6, 5, 4);
    quad(0, 4, 5, 1);
    quad(1, 5, 6, 2);
    quad(6, 7, 3, 2);
    quad(7, 4, 0, 2);*/
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


    var comp1_dir = mult(dirLightAmbient, materialAmbient);
    var comp2_dir = mult(dirLightAmbient, materialAmbient);
    var comp3_dir = mult(dirLightDiffuse, materialDiffuse);

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

    // sliders for viewing parameters

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
      //gl.uniform1f( gl.getUniformLocation(program,
      //  "lCutOff"),lCutOff);
      //gl.uniform1f( gl.getUniformLocation(program,
      //  "spotAlpha"),spotAlhpa);
      spotThetaVal  = gl.getUniformLocation(program, "spotTheta");
      spotAlphaVal = gl.getUniformLocation(program, "spotAlhpa");
    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    nMatrix = normalMatrix(modelViewMatrix, true);


    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix)  );

    document.getElementById("spotThetaSlider").oninput = function(event) {
      if(this.valueAsNumber !== spotTheta){
        spotTheta = this.valueAsNumber;
        console.log("Spotlight theta value " + spotTheta);
      }
    };

    document.getElementById("alphaslider").oninput = function(event) {
      if(this.valueAsNumber !== spotAlhpa){
        spotAlhpa = this.valueAsNumber;
        console.log("Spotlight alpha value " + spotAlhpa);
      }
    };

    console.log("x direction" + spotLightDirection[0]);
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


    console.log("new x direction" + spotLightDirection[0]);

    gl.uniform4fv(spotLightDirectionLoc, spotLightDirection);
    gl.uniform1f(spotThetaVal, spotTheta);
    gl.uniform1f(spotAlphaVal, spotAlhpa);


    gl.drawArrays(gl.TRIANGLES, 0, numPositions);


    requestAnimationFrame(render);
}

}

homework1();
