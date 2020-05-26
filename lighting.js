"use strict";

var canvas;
var gl;

var elt;
var framebuffer;


//var axis;
var floor;
//var segment;
var sphere;

var lineProgram;
var sphereProgram;

// A = angle
// X = x-axis
// Y = y-axis
// Z = z-axis
var view = "A";
var aspect = 1.0;

var mvMatrix, pMatrix, nMatrix;

// Stack stuff
var matrixStack = new Array();
function pushMatrix() {
    matrixStack.push(mat4(mvMatrix));
}
function popMatrix() {
    mvMatrix = matrixStack.pop();
}

var LineProgram = function () {
    this.program = initShaders(gl, "line-vshader", "line-fshader");
    gl.useProgram(this.program);

    this.vertexLoc = gl.getAttribLocation(this.program, "vPosition");
    this.colorLoc = gl.getAttribLocation(this.program, "vColor");

    this.mvMatrixLoc = gl.getUniformLocation(this.program, "mvMatrix");
    this.pMatrixLoc = gl.getUniformLocation(this.program, "pMatrix");
    this.nMatrixLoc = gl.getUniformLocation(this.program, "nMatrix");
}

var SphereProgram = function () {
    this.program = initShaders(gl, "sphere-vshader", "sphere-fshader");
    gl.useProgram(this.program);

    this.vertexLoc = gl.getAttribLocation(this.program, "vPosition");
    this.normalLoc = gl.getAttribLocation(this.program, "vNormal");
    this.colorLoc = gl.getAttribLocation(this.program, "vColor");

    this.mvMatrixLoc = gl.getUniformLocation(this.program, "mvMatrix");
    this.pMatrixLoc = gl.getUniformLocation(this.program, "pMatrix");
    this.nMatrixLoc = gl.getUniformLocation(this.program, "nMatrix");
}

function renderAxis() {
    gl.useProgram(lineProgram.program);

    gl.enableVertexAttribArray(lineProgram.vertexLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, axis.vertexBuffer);
    gl.vertexAttribPointer(lineProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(lineProgram.colorLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, axis.colorBuffer);
    gl.vertexAttribPointer(lineProgram.colorLoc, 4, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(lineProgram.mvMatrixLoc, false, flatten(mvMatrix));
    gl.uniformMatrix4fv(lineProgram.pMatrixLoc, false, flatten(pMatrix));

    gl.drawArrays(gl.LINES, 0, axis.numPoints);
};

function renderFloor() {
    gl.useProgram(lineProgram.program);

    gl.enableVertexAttribArray(lineProgram.vertexLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, floor.vertexBuffer);
    gl.vertexAttribPointer(lineProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(lineProgram.colorLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, floor.colorBuffer);
    gl.vertexAttribPointer(lineProgram.colorLoc, 4, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(lineProgram.mvMatrixLoc, false, flatten(mvMatrix));
    gl.uniformMatrix4fv(lineProgram.pMatrixLoc, false, flatten(pMatrix));

    gl.drawArrays(gl.LINES, 0, floor.numPoints);
};

//function renderSegment() {
//    gl.useProgram(lineProgram.program);

//    gl.enableVertexAttribArray(lineProgram.vertexLoc);
//    gl.bindBuffer(gl.ARRAY_BUFFER, segment.vertexBuffer);
//    gl.vertexAttribPointer(lineProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

//    gl.enableVertexAttribArray(lineProgram.colorLoc);
//    gl.bindBuffer(gl.ARRAY_BUFFER, segment.colorBuffer);
//    gl.vertexAttribPointer(lineProgram.colorLoc, 4, gl.FLOAT, false, 0, 0);

//    gl.uniformMatrix4fv(lineProgram.mvMatrixLoc, false, flatten(mvMatrix));
//    gl.uniformMatrix4fv(lineProgram.pMatrixLoc, false, flatten(pMatrix));

//    gl.drawArrays(gl.LINES, 0, segment.numPoints);
//};

function renderSphere() {
    gl.useProgram(sphereProgram.program);

    gl.enableVertexAttribArray(sphereProgram.vertexLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.vertexBuffer);
    gl.vertexAttribPointer(sphereProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(sphereProgram.normalLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.normalBuffer);
    gl.vertexAttribPointer(sphereProgram.normalLoc, 4, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(sphereProgram.colorLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.colorBuffer);
    gl.vertexAttribPointer(sphereProgram.colorLoc, 4, gl.FLOAT, false, 0, 0);

    nMatrix = normalMatrix(mvMatrix, false);

    gl.uniformMatrix4fv(sphereProgram.mvMatrixLoc, false, flatten(mvMatrix));
    gl.uniformMatrix4fv(sphereProgram.pMatrixLoc, false, flatten(pMatrix));
    gl.uniformMatrix4fv(sphereProgram.nMatrixLoc, false, flatten(nMatrix));

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.indexBuffer);
    gl.drawElements(gl.TRIANGLES, sphere.numIndices, gl.UNSIGNED_SHORT, 0);
};

function tick() {
    // requestAnimFrame(tick);
    render();
    theta += 0.01;
}

var theta = radians(45);
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fovy = 40.0;
    const near = 0.01;
    const far = 100;
    const radius = 5;
    const at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0.0, 1.0, 0.0);
    var eye = vec3(radius * Math.sin(theta),
                   radius * Math.sin(radians(10.0)),
                   radius * Math.cos(theta));
    if (view == "X") {
        eye = vec3(5, 0, 0);
    } else if (view == "Y") {
        eye = vec3(0, 5, 0);
        up = vec3(0.0, 0.0, -1.0);
    } else if (view == "Z") {
        eye = vec3(0, 0, 5);
    }

    pMatrix = perspective(fovy, aspect, near, far);
    mvMatrix = lookAt(eye, at, up);

    renderFloor();

    mvMatrix = mult(mvMatrix, translate(0.0, 0.5, 0.0));
    mvMatrix = mult(mvMatrix, scalem(0.5, 0.5, 0.5));

    renderSphere();
}

function keyDown(e) {
    switch (e.keyCode) {
        case 37:
            // left arrow
            break;
        case 38:
            // up arrow
            break;
        case 39:
            // right arrow
            break;
        case 40:
            // down arrow
            break;
        case "X".charCodeAt(0):
            view = "X";
            break;
        case "Y".charCodeAt(0):
            view = "Y";
            break;
        case "Z".charCodeAt(0):
            view = "Z";
            break;
        case "A".charCodeAt(0):
            view = "A";
            break;
        default:
            console.log("Unrecognized key press: " + e.keyCode);
            break;
    }

    requestAnimFrame(render);
}

window.onload = function init() {
    document.onkeydown = keyDown;

    //document.ondragstart = dragStart;
    //document.ondrag = dragMiddle;
    //document.ondragend = dragEnd;

    elt = document.getElementById("test");

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);

    aspect = canvas.width / canvas.height;

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //axis = new Axis();
    floor = new Floor();
    //segment = new Segment();
    sphere = new Sphere(1, 200, 200);

    //  Load shaders and initialize attribute buffers
    lineProgram = new LineProgram();
    sphereProgram = new SphereProgram();

    canvas.addEventListener("mousedown", function (event) {
        console.log("click");
        pick(event);
    });

    tick();
}

function pick(event) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform3fv(thetaLoc, theta);
    for (var i = 0; i < 6; i++) {
        gl.uniform1i(gl.getUniformLocation(program, "i"), i + 1);
        gl.drawArrays(gl.TRIANGLES, 6 * i, 6);
    }
    var x = event.clientX;
    var y = canvas.height - event.clientY;

    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);

    var scolor = "unknown";

    if (color[0] == 255) {
        if (color[1] == 255)
            scolor = "cyan";
        else if (color[2] == 255)
            scolor = "magenta";
        else
            scolor = "red";
    } else if (color[1] == 255) {
        if (color[2] == 255)
            scolor = "blue";
        else
            scolor = "yellow";
    } else if (color[2] == 255) {
        scolor = "green";
    } else {
        scolor = "background";
    }

    elt.innerHTML = "<div> " + scolor + " </div>";

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.uniform1i(gl.getUniformLocation(program, "i"), 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform3fv(thetaLoc, theta);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}
