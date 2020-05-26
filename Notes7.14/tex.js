"use strict";

var canvas;
var canvasWidth, canvasHeight;
var gl;

var program;
var square;

var mvMatrix, pMatrix, nMatrix;

var texture;

var Square = function() {

  //  2           3
  //   *---------*
  //   |         |
  //   |         |
  //   |         |
  //   *---------*
  //  0           1

  this.vertices = [
    vec4(-0.5, -0.5,  0.0, 1.0),
    vec4( 0.5, -0.5,  0.0, 1.0),
    vec4(-0.5, 0.5,  0.0, 1.0),
    vec4( 0.5,  0.5,  0.0, 1.0),
  ];

  this.numVertices = this.vertices.length;

  this.vertexColors = [
    vec4(1.0, 1.0, 1.0, 1.0),  // white
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
  ];

  this.texCoords = [
    vec2(0, 0),
    vec2(1, 0),
    vec2(0, 1),
    vec2(1, 1),
  ];

}

function configureTexture(image) {
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
                gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                   gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  gl.uniform1i(gl.getUniformLocation(program.program, "texture"), 0);
}

var Program = function() {
  this.program = initShaders(gl, "vshader", "fshader");
  gl.useProgram(this.program);

  this.vertexLoc = gl.getAttribLocation(this.program, "vPosition");
  this.colorLoc = gl.getAttribLocation(this.program, "vColor");
  this.texCoordLoc = gl.getAttribLocation(this.program, "vTexCoord");

  this.mvMatrixLoc = gl.getUniformLocation(this.program, "mvMatrix");
  this.pMatrixLoc = gl.getUniformLocation(this.program, "pMatrix");
  this.nMatrixLoc = gl.getUniformLocation(this.program, "nMatrix");
}

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); }

  canvasWidth = canvas.width;
  canvasHeight = canvas.height;

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  //
  //  Load shaders and initialize attribute buffers
  //
  program = new Program();
  gl.useProgram(program.program);

  square = new Square();

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(square.vertices), gl.STATIC_DRAW);

  gl.vertexAttribPointer(program.vertexLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.vertexLoc);

  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(square.vertexColors), gl.STATIC_DRAW);

  gl.vertexAttribPointer(program.colorLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.colorLoc);

  var tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(square.texCoords), gl.STATIC_DRAW);

  gl.vertexAttribPointer(program.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.texCoordLoc);

  // Initialize texture
  // var image = document.getElementById("texImage");
  var image = new Image();
  image.onload = function() {
    configureTexture(image);
  }
  image.src = "lion.jpg"

  configureTexture(image);

  render();
}

var render = function(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  pMatrix = mat4(1.0);
  mvMatrix = mat4(1.0);

  gl.uniformMatrix4fv(program.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(program.pMatrixLoc, false, flatten(pMatrix));

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, square.numVertices);
}