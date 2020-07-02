"use strict";

var canvas;
var gl;
var program;

var i = 0;
var reset = 0;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;
var objectIndicator;
var objectIndicatorLoc;

var animationFlag = false;

// texture variables

var texCoordsArray = [];

var treeRootTexture;
var treeCrownTexture;

var bearBodyTexture;
var bearHeadTexture;

// grizzly variables for position and animation

var bodyMovement = [];
bodyMovement[0] = -35.0;
bodyMovement[1] = 0.0;
bodyMovement[2] = 0.0;

var bodyRotation = [];
bodyRotation[0] = 90;
bodyRotation[1] = 90;
bodyRotation[2] = 0;

var headRotation = [];
headRotation[0] = -30;

var tailRotation = -35;

var rightPaw = mat4();
rightPaw[0][0] = 90;
rightPaw[0][2] = 0;
rightPaw[1][0] = 0;

var leftPaw = mat4();
leftPaw[0][0] = 90;
leftPaw[0][2] = 0;
leftPaw[1][0] = 0;

var rightLeg = mat4();
rightLeg[0][0] = 90;
rightLeg[1][0] = 0;

var leftLeg = mat4();
leftLeg[0][0] = 90;
leftLeg[1][0] = 0;

var snoutRotation = 105;

var earRotation = [];
earRotation[0] = -45;
earRotation[1] = 45;

var movVal = 1;
var scratchStep = 0.05;
var step2Flag = false;
var step3Flag = false;
var step4Flag = false;
var step5Flag = false;
var step6Flag = false;


// view parameters
var near = 1;
var far = 2000;
var FOV = 55.0;
var  aspect = 1.0;
var radius = 70.0;
var thetaView = 0.15;
var phi = 6.5;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var eye = vec3(radius * Math.sin(phi), radius * Math.sin(thetaView), radius * Math.cos(phi));

// Data about grizzly model

var bodyId = 0;
var headId  = 1;
var leftUpperPawId = 2;
var leftLowerPawId = 3;
var rightUpperPawId = 4;
var rightLowerPawId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
var snoutId = 10;
var tailId = 11;

var earSxId = 14;
var earDxId = 15;

// grizzly phisical dimensions
var bodyHeight = 10.0;
var bodyWidth = 4.0;
var upperPawHeight = 3.5;
var lowerPawHeight = 2.5;
var upperPawWidth  = 2;
var lowerPawWidth  = 1.5;
var upperLegWidth  = 2;
var lowerLegWidth  = 1.5;
var lowerLegHeight = 2.5;
var upperLegHeight = 3.5;
var headHeight = 3.5;
var headWidth = 3.0;
var snoutHeight = 3.5;
var snoutWidth = 1.5;
var tailHeight = 2.9;
var tailWidth = 0.8;
var earWidth = 0.7;
var earHeight = 1.7;

// Data about tree model

var treeRootId = 12;
var treeCrownId = 13;

var rootHeight = 25.0;
var rootWidth = 2.0;
var crownHeight = 10.0;
var crownWidth = 10.0;
 


var numBearNodes = 15;
var numTreeNodes = 3;


var stack = [];

var bear = [];
var tree = [];

for( var i=0; i<numBearNodes; i++) bear[i] = createNode(null, null, null, null);
for( var i=0; i<numTreeNodes; i++) tree[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0] = a;
   result[5] = b;
   result[10] = c;
   return result;
}


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch(Id) {

        case bodyId:

        m = translate(bodyMovement[0] , -5.0, 0.0);
        m = mult(m, translate(0.0, bodyMovement[1], 0.0));
        m = mult(m, translate(0.0, 0.0, bodyMovement[2]));
        m = mult(m, rotate(bodyRotation[2], vec3(0, 0, 1)));
        m = mult(m, rotate(bodyRotation[1], vec3(0, 1, 0)));
        m = mult(m, rotate(bodyRotation[0], vec3(1, 0, 0)));
        bear[bodyId] = createNode( m, body, null, headId );
        break;
    
        case headId:
    
        m = translate(0.0, bodyHeight+ headHeight - 3.5, 0.0);
        m = mult(m, rotate(headRotation[0], vec3(1, 0, 0)));
        bear[headId] = createNode( m, head, leftUpperPawId, snoutId);
        break;
    
        case snoutId:
        m = translate(headWidth - 3, headHeight - 2, 0.0);
        m = mult(m, rotate(snoutRotation, vec3(1, 0, 0) ));
        bear[snoutId] = createNode( m, snout, earSxId, null);
        break;

        case earSxId:
        m = translate(-headWidth/2 + earWidth, 2.0, 0.0);
        m = mult(m, rotate(earRotation[0], vec3(0, 0, 1) ));
        bear[earSxId] = createNode( m, earSx, earDxId, null);
        break;

        case earDxId:
        m = translate(headWidth/2 - earWidth, 2.0, 0.0);
        m = mult(m, rotate(earRotation[1], vec3(0, 0, 1) ));
        bear[earDxId] = createNode( m, earDx, null, null);
        break;

        case leftUpperPawId:
    
        m = translate(-(bodyWidth+upperPawWidth - 4.5), 0.9*bodyHeight, 0.0);
        m = mult(m, rotate(leftPaw[0][2], vec3(0, 0, 1)));
        m = mult(m, rotate(leftPaw[0][0], vec3(1, 0, 0)));
        bear[leftUpperPawId] = createNode( m, leftUpperPaw, rightUpperPawId, leftLowerPawId );
        break;
    
        case rightUpperPawId:
    
        m = translate(bodyWidth+upperPawWidth - 4.5, 0.9*bodyHeight, 0.0);
        m = mult(m, rotate(rightPaw[0][2], vec3(0, 0, 1)));
        m = mult(m, rotate(rightPaw[0][0], vec3(1, 0, 0)));
        bear[rightUpperPawId] = createNode( m, rightUpperPaw, leftUpperLegId, rightLowerPawId );
        break;
    
        case leftUpperLegId:
    
        m = translate(-(bodyWidth+upperPawWidth - 4), 0.3*upperLegHeight, 0.0);
        m = mult(m, rotate(leftLeg[0][0], vec3(1, 0, 0)));
        bear[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
        break;
    
        case rightUpperLegId:
    
        m = translate(bodyWidth+upperPawWidth - 4, 0.3*upperLegHeight, 0.0);
        m = mult(m, rotate(rightLeg[0][0], vec3(1, 0, 0)));
        bear[rightUpperLegId] = createNode( m, rightUpperLeg, tailId, rightLowerLegId );
        break;
    
        case leftLowerPawId:
    
        m = translate(0.0, upperPawHeight, 0.0);
        m = mult(m, rotate(leftPaw[1][0], vec3(1, 0, 0)));
        bear[leftLowerPawId] = createNode( m, leftLowerPaw, null, null );
        break;
    
        case rightLowerPawId:
    
        m = translate(0.0, upperPawHeight, 0.0);
        m = mult(m, rotate(rightPaw[1][0], vec3(1, 0, 0)));
        bear[rightLowerPawId] = createNode( m, rightLowerPaw, null, null );
        break;
    
        case leftLowerLegId:
    
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(leftLeg[1][0],vec3(1, 0, 0)));
        bear[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
        break;
    
        case rightLowerLegId:
    
        m = translate(0.0, upperLegHeight, 0.0);
        m = mult(m, rotate(rightLeg[1][0], vec3(1, 0, 0)));
        bear[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
        break;

        case tailId:
    
        m = translate(0.0, -1.0, 0.0);
        m = mult(m, rotate(tailRotation, vec3(1, 0, 0) ));
        bear[tailId] = createNode( m, tail, null, null);
        break;

        case treeRootId:

        m = translate(15.0 , -10.0, -0.2);
        tree[treeRootId] = createNode( m, treeRoot, null, treeCrownId);
        break;

        case treeCrownId:

        m = translate(0.0 , rootHeight, 0.0);
        tree[treeCrownId] = createNode( m, treeCrown, null, null);
        break;
    
        }
    
}

// traverse functions for the models

function traverseBear(Id) {

   if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, bear[Id].transform);
   bear[Id].render();
   if(bear[Id].child != null) traverseBear(bear[Id].child);
    modelViewMatrix = stack.pop();
   if(bear[Id].sibling != null) traverseBear(bear[Id].sibling);
}

function traverseTree(Id) {

    if(Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, tree[Id].transform);
    tree[Id].render();
    if(tree[Id].child != null) traverseTree(tree[Id].child);
     modelViewMatrix = stack.pop();
    if(tree[Id].sibling != null) traverseTree(tree[Id].sibling);
 }

 //-------------------------------------------

function body() {
    objectIndicator = 3;
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*bodyHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( bodyWidth, bodyHeight, bodyWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i(objectIndicatorLoc, objectIndicator);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {
    objectIndicator = 4;
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i(objectIndicatorLoc, objectIndicator);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function snout() {   
    objectIndicator = 4;
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * snoutHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(snoutWidth, snoutHeight, snoutWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i(objectIndicatorLoc, objectIndicator);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function earSx() {
    objectIndicator = 4;
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * earHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(earWidth, earHeight, earWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i(objectIndicatorLoc, objectIndicator);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function earDx() {
    objectIndicator = 4;
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * earHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(earWidth, earHeight, earWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i(objectIndicatorLoc, objectIndicator);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperPaw() {
    objectIndicator = 3;
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperPawHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperPawWidth, upperPawHeight, upperPawWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i(objectIndicatorLoc, objectIndicator);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerPaw() {
    objectIndicator = 3;
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerPawHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerPawWidth, lowerPawHeight, lowerPawWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i(objectIndicatorLoc, objectIndicator);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperPaw() {
    objectIndicator = 3;
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperPawHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperPawWidth, upperPawHeight, upperPawWidth) );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
  gl.uniform1i(objectIndicatorLoc, objectIndicator);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerPaw() {
    objectIndicator = 3;
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerPawHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerPawWidth, lowerPawHeight, lowerPawWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i(objectIndicatorLoc, objectIndicator);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {
    objectIndicator = 3;
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i(objectIndicatorLoc, objectIndicator);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {
    objectIndicator = 3;  
    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i(objectIndicatorLoc, objectIndicator);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {
    objectIndicator = 3;
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i(objectIndicatorLoc, objectIndicator);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {
    objectIndicator = 3;
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i(objectIndicatorLoc, objectIndicator);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tail() {
    objectIndicator = 3;
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tailHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(tailWidth, tailHeight, tailWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i(objectIndicatorLoc, objectIndicator);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function treeRoot() {
    objectIndicator = 1;
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * rootHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(rootWidth, rootHeight, rootWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i(objectIndicatorLoc, objectIndicator);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function treeCrown() {
    objectIndicator = 2;
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * crownHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale(crownWidth, crownHeight, crownWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    gl.uniform1i(objectIndicatorLoc, objectIndicator);
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

// configuration of the textures

function configureTexture(image1, image2, image3, image4) {

    // tree root texture
    treeRootTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, treeRootTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image1);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // tree crown texture
    treeCrownTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, treeCrownTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // bear body texture
    bearBodyTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, bearBodyTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image3);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // bear head texture
    bearHeadTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, bearHeadTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image4);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}


function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    texCoordsArray.push(texCoord[0]);
    pointsArray.push(vertices[b]);
    texCoordsArray.push(texCoord[1]);
    pointsArray.push(vertices[c]);
    texCoordsArray.push(texCoord[2]);
    pointsArray.push(vertices[d]);
    texCoordsArray.push(texCoord[3]);
}

function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

// initialize initial values

function initAnimation() {

    bodyMovement[0] = -35.0;
    bodyMovement[1] = 0.0;
    bodyMovement[2] = 0.0;

    bodyRotation[0] = 90;
    bodyRotation[1] = 90;
    bodyRotation[2] = 0;

    headRotation[0] = -30;

    rightPaw[0][0] = 90;
    rightPaw[0][2] = 0;
    rightPaw[1][0] = 0;

    leftPaw[0][0] = 90;
    leftPaw[0][2] = 0;
    leftPaw[1][0] = 0;

    rightLeg[0][0] = 90;
    rightLeg[1][0] = 0;

    leftLeg[0][0] = 90;
    leftLeg[1][0] = 0;

    tailRotation = -35;
    snoutRotation = 105;

    step2Flag = false;
    step3Flag = false;
    step4Flag = false;
    step5Flag = false;
    step6Flag = false;

    movVal = 1;
    scratchStep = 0.05;

}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();

    projectionMatrix = perspective(FOV, aspect, near, far);
    modelViewMatrix = lookAt(eye, at, up);


    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix)  );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix)  );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")
    objectIndicatorLoc = gl.getUniformLocation(program, "objectIndicator");

    cube();

    vBuffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

	// take image element from the HTML
    var rootImage = document.getElementById("rootImage");
    var crownImage = document.getElementById("crownImage");
    var bodyImage = document.getElementById("bodyImage");
    var headImage = document.getElementById("headImage");

    configureTexture(rootImage, crownImage, bodyImage, headImage);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, treeRootTexture);
    gl.uniform1i(gl.getUniformLocation( program, "treeRootTex"), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, treeCrownTexture);
    gl.uniform1i(gl.getUniformLocation( program, "treeCrownTex"), 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, bearBodyTexture);
    gl.uniform1i(gl.getUniformLocation( program, "bearBodyTex"), 2);

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this.bearHeadTexture);
    gl.uniform1i(gl.getUniformLocation( program, "bearHeadTex"), 3);

    document.getElementById("Phi").oninput = function(event) {
        phi = this.valueAsNumber;
    };
    document.getElementById("Theta").oninput = function(event) {
        thetaView = this.valueAsNumber;
    };
    document.getElementById("R").oninput = function(event) {
        radius = this.valueAsNumber;
    };

    // check if animation button is pressed
    document.getElementById("startAnimation").onclick = function (event) {
        animationFlag = !animationFlag;
        
    }


    for(i=0; i<numBearNodes + numTreeNodes; i++) initNodes(i);

    render();
}

// implement animation steps

function animation () {

        if (bodyMovement[0] <= 15 && step2Flag == false && step6Flag == false) {

            // first step walking mode alternating paws (front leg) and back legs

            if (rightPaw[0][0] <= 60 || rightPaw[0][0] >= 120) {
                movVal = -movVal;
            }

            rightPaw[0][0] -= movVal;
            rightLeg[0][0] -= movVal;

            leftPaw[0][0] += movVal;
            leftLeg[0][0] += movVal;
            

            if(bodyMovement[0] <= -13)  bodyMovement[0] += 0.1;
            if( bodyMovement[0] > -13 && bodyMovement[0] <= -2) {
                bodyMovement[0] += 0.1;
                bodyRotation[1] += 0.14;
                bodyMovement[2] += 0.02;
            }
            if( bodyMovement[0] > -2 && bodyMovement[0] <= 13) {
                bodyRotation[1] -= 0.12;
                bodyMovement[2] += 0.02;
                bodyMovement[0] += 0.1;
            }
            if( bodyMovement[0] > 13 && bodyMovement[0] <= 15) {
                bodyRotation[1] -= 0.16;
                bodyMovement[2] -= 0.02;
                bodyMovement[0] += 0.1;
            }
        } else  if (step6Flag == false) {
            
            // second step standing up the grizzly

            if (!(bodyRotation[0] == 0 && bodyRotation[1] >= 89 && bodyRotation[1] <= 91 && bodyRotation[2] == 0) && step3Flag == false) {
                bodyRotation[1] = 90;       
                if (bodyRotation[0] > 0) bodyRotation[0] -= 1;
                else if (bodyRotation[0] != 0) bodyRotation[0] += 1;
        
                if (bodyRotation[1] > 90) bodyRotation[1] -= 1;
                else if (bodyRotation[1] != 90) bodyRotation[1] += 1;
        
                if (bodyRotation[2] > 0) bodyRotation[0] -= 1;
                else if (bodyRotation[2] != 0) bodyRotation[2] += 1;
                

                leftLeg[0][0] += 1;
                rightLeg[0][0] += 1;

                rightPaw[0][0] += 1;
                leftPaw[0][0] += 1;

                if (headRotation[0] < 0) headRotation[0] += 0.4;
                
                step2Flag = true;
                
            } else step3Flag = true;

            // third step rotating grizzly's back
                
            if (bodyRotation[1] < 180 && step3Flag == true) {
                step3Flag = true;
                bodyRotation[1] += 1;

                if (rightPaw[0][0] != 180) {
                    rightPaw[0][2] -= 1.5;                
                    rightPaw[0][0] += 1;   
                }

                if (leftPaw[0][0] != 180) {
                    leftPaw[0][2] += 1.5;                
                    leftPaw[0][0] -= 1;   
                }
                
                
                if(leftLeg[0][0] > 180 && rightLeg[0][0] < 180) {
                    leftLeg[0][0] -= 0.2;
                    rightLeg[0][0] += 0.2;
                }
                
               
            } else if((bodyRotation[1] >= 180 && step3Flag == true && bodyMovement[2] >= 2.8)) {
                
                // fourth step walking back to allow grizzly's back touch tree

                if (leftLeg[0][0] < 200 && step5Flag == false) {
                    leftLeg[0][0] += 1;
                } else step5Flag = true;

                if (leftLeg[0][0] < 210 && step5Flag == true) {
                    
                    bodyMovement[2] -= 0.1;
                    leftLeg[0][0] -= 1;

                } 
                
                if(bodyMovement[1] == 0 && bodyRotation[1] == 180 && bodyMovement[2] > 2.7 && bodyMovement[2] < 2.8) step6Flag = true;

            } 

        }

        // fifth step starting scratching grizzly's back against tree

        if (step6Flag) {
            if(bodyMovement[1] <= -1 || bodyMovement[1] >= 1) scratchStep = -scratchStep;
            
            bodyMovement[1] += scratchStep;
            
            if (scratchStep == 0.05) {
                
                if(leftLeg[0][0] < 180) leftLeg[0][0] -= -scratchStep*15;
                if(leftLeg[0][0] < 180) leftLeg[1][0] -= scratchStep*15;

                if(rightLeg[0][0] < 180) rightLeg[0][0] -= -scratchStep*15;
                if(rightLeg[0][0] < 180) rightLeg[1][0] -= scratchStep*15;
                         
            }
            else {
                
                if(leftLeg[0][0] < 195) leftLeg[0][0] += scratchStep*15;
                if(leftLeg[0][0] < 195) leftLeg[1][0] += -scratchStep*15;

                if(rightLeg[0][0] < 195) rightLeg[0][0] += scratchStep*15;
                if(rightLeg[0][0] < 195) rightLeg[1][0] += -scratchStep*15;
                
            }
            

        }

        reset += 1;
        
}


var render = function() {

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // change camera position values

        eye = vec3(radius * Math.sin(phi), radius * Math.sin(thetaView), radius * Math.cos(phi));
        modelViewMatrix = lookAt(eye, at, up);

        // initialize nodes of grizzly and tree
        for (i = 0; i < numBearNodes + numTreeNodes; i++) initNodes(i);

        // start animation or re-initialize initial values

        console.log(reset);
        
        if (animationFlag && reset <= 1100) {
            animation(); 
        } else {
            reset = 0;
            initAnimation();
        }
        traverseBear(bodyId);
        traverseTree(treeRootId);
        requestAnimationFrame(render);       
}
