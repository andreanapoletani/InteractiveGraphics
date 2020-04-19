"use strict";

var homework1 = function() {
var canvas;
var gl;


var index = 0;

var positionsArray = [];
var normalsArray = [];


var near = 2.0;
var far = 5.0;
var radius = 3.4;
var theta = 0.52;
var phi = -0.785;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 70.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect = 1.0;       // Viewport aspect ratio

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var lightPosition = vec4(-40.0, 50.0, 0.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 20.0;

var spotLightPosition = vec4(-10.0, -10.0, 10.0, 1.0 );
var spotLightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var spotLightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var spotLightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var spotLightDirection = vec4(-0.5,1.0,2.0,1.0);
var spotTheta=0.43;
var spotAlhpa = 1;
var spotThetaVal, spotAlphaVal;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var nMatrix, nMatrixLoc;


function triangle(a, b, c) {

     var t1 = subtract(b, a);
     var t2 = subtract(c, a);
     var normal = normalize(cross(t2, t1));
     normal = vec4(normal[0], normal[1], normal[2], 0.0);

     normalsArray.push(normal);
     normalsArray.push(normal);
     normalsArray.push(normal);


     positionsArray.push(a);
     positionsArray.push(b);
     positionsArray.push(c);

     index += 3;
}

function divideTriangle(a, b, c, count) {
    if (count > 0) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }
    else {
        triangle(a, b, c);
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
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


    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    var spotAmbientProduct = mult(spotLightAmbient, materialAmbient);
    var spotDiffuseProduct = mult(spotLightDiffuse, materialDiffuse);
    var spotSpecularProduct = mult(spotLightSpecular, materialSpecular);


    tetrahedron(va, vb, vc, vd, 2);

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
       "uAmbientProduct"),flatten(ambientProduct));
    gl.uniform4fv( gl.getUniformLocation(program,
       "uDiffuseProduct"),flatten(diffuseProduct));
    gl.uniform4fv( gl.getUniformLocation(program,
       "uSpecularProduct"),flatten(specularProduct));
    gl.uniform4fv( gl.getUniformLocation(program,
       "uLightPosition"),flatten(lightPosition));
    gl.uniform1f( gl.getUniformLocation(program,
       "uShininess"),materialShininess);

     gl.uniform4fv( gl.getUniformLocation(program,
       "spotAmbientProduct"),flatten(spotAmbientProduct) );
     gl.uniform4fv( gl.getUniformLocation(program,
       "spotDiffuseProduct"),flatten(spotDiffuseProduct) );
     gl.uniform4fv( gl.getUniformLocation(program,
       "spotSpecularProduct"),flatten(spotSpecularProduct) );
     gl.uniform4fv( gl.getUniformLocation(program,
        "spotLightPosition"),flatten(spotLightPosition) );
     gl.uniform4fv( gl.getUniformLocation(program,
        "spotLightDirection"),spotLightDirection );
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

    gl.uniform1f(spotThetaVal, spotTheta);
    gl.uniform1f(spotAlphaVal, spotAlhpa);

    console.log("new spotlight theta value: " + spotTheta);

    for( var i=0; i<index; i+=3)
        gl.drawArrays(gl.TRIANGLES, i, 3);


    requestAnimationFrame(render);
}

}

homework1();
