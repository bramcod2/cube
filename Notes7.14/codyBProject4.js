'use strict';

var elt;

var canvas;
var gl;

var program;

var grm;

var NumVertices = 36;

var pointsArray = [];
var normalsArray = [];
var colorsArray = [];

var texture;

var framebuffer;

var flag = true;

var color = new Uint8Array(4);

var grm;

var d = 10;
var scale = 1;

var eye = vec3(0, 0, d);
var at = vec3(0, 0, 0);
var n = vec3(0, 1, 0);

var vertices = [
//Regular Cube
  //x vec4(-0.5, -0.5,  0.5, 1.0), // front lower left
  //x vec4(-0.5,  0.5,  0.5, 1.0), // front upper left
  //x vec4(0.5,  0.5,  0.5, 1.0),  // front upper right
  //x vec4(0.5, -0.5,  0.5, 1.0),  // front lower right
  // vec4(-0.5, -0.5, -0.5, 1.0), // back lower left
  // vec4(-0.5,  0.5, -0.5, 1.0), // back upper left
  // vec4(0.5,  0.5, -0.5, 1.0),  // back upper right
  // vec4(0.5, -0.5, -0.5, 1.0),  // back lower right
  vec4(-0.5, -0.5, 0.5, 1.0),
  vec4(0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, 0.5, 0.5, 1.0),
  vec4(0.5, 0.5, 0.5, 1.0),
  vec4(-0.5, -0.5, -0.5, 1.0),// back lower left
  vec4(-0.5, 0.5, -0.5, 1.0),// back upper left
   // back upper right
  vec4(0.5, -0.5, -0.5, 1.0),
  vec4(0.5, 0.5, -0.5, 1.0)
];

var vertexColors = [
  vec4(0.0, 0.0, 0.0, 1.0),// black
  vec4(1.0, 0.0, 0.0, 1.0),// red
  vec4(1.0, 1.0, 0.0, 1.0),// yellow
  vec4(0.0, 1.0, 0.0, 1.0),// green
  vec4(0.0, 0.0, 1.0, 1.0),// blue
  vec4(1.0, 0.0, 1.0, 1.0),// magenta
  vec4(0.0, 1.0, 1.0, 1.0),// cyan
  vec4(1.0, 1.0, 1.0, 1.0)// white
];

var texCoords = [
  vec2(0, 0),
  vec2(.2, 0),
  vec2(0, .2),
  vec2(.2, .2)
];

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

}



var lightPosition = vec4(10.0, 10.0, 10.0, 0.0);
//Doesn't do anything to change by itself
var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(0.5, 0.5, 0.5, 1.0);

var materialAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var materialDiffuse = vec4(0.5, 0.5, 0.5, 1.0);
var materialSpecular = vec4(1.0, 0.8, 1.0, 1.0);
var materialShininess = 2.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelView, projection;
var viewerPos;
var program;

var RotMat;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;

var theta = [45.0, 45.0, 45.0];

var thetaLoc;

var Index = 0;


function quad(a, b, c, d) {

  var t1 = subtract(vertices[b], vertices[a]);
  var t2 = subtract(vertices[c], vertices[b]);
  var normal = cross(t1, t2);
  var normal = vec3(normal);
  normal = normalize(normal);

  pointsArray.push(vertices[a]);
  normalsArray.push(normal);
  colorsArray.push(vertexColors[a]);
  pointsArray.push(vertices[b]);
  normalsArray.push(normal);
  colorsArray.push(vertexColors[a]);
  pointsArray.push(vertices[c]);
  normalsArray.push(normal);
  colorsArray.push(vertexColors[a]);
  pointsArray.push(vertices[a]);
  normalsArray.push(normal);
  colorsArray.push(vertexColors[a]);
  pointsArray.push(vertices[c]);
  normalsArray.push(normal);
  colorsArray.push(vertexColors[a]);
  pointsArray.push(vertices[d]);
  normalsArray.push(normal);
  colorsArray.push(vertexColors[a]);
}


function colorCube() {
  quad(1, 0, 3, 2);
  quad(2, 3, 7, 6);
  quad(3, 0, 4, 7);
  quad(6, 5, 1, 2);
  quad(4, 5, 6, 7);
  quad(5, 4, 0, 1);
}


function pick(event) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform3fv(thetaLoc, theta);
  for (var i = 0; i < 6; i++) {
    gl.uniform1i(gl.getUniformLocation(program, 'i'), i + 1);
    gl.drawArrays(gl.TRIANGLES, 6 * i, 6);
  }
  var x = event.clientX;
  var y = canvas.height - event.clientY;

  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);

  var scolor = 'unknown';

  if (color[0] == 255) {
    if (color[1] == 255)
      scolor = 'cyan';
    else if (color[2] == 255)
      scolor = 'magenta';
    else
      scolor = 'red';
  } else if (color[1] == 255) {
    if (color[2] == 255)
      scolor = 'blue';
    else
      scolor = 'yellow';
  } else if (color[2] == 255) {
    scolor = 'green';
  } else {
    scolor = 'background';
  }

  elt.innerHTML = '<div> ' + scolor + ' </div>';

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform3fv(thetaLoc, theta);
  gl.drawArrays(gl.TRIANGLES, 0, 36);
}


window.onload = function init() {
  canvas = document.getElementById('gl-canvas');

  grm = mat4();
  RotMat = mat4();

  var isDown = false;

  var pX;
  var pY;
  var pZ;
  var pPrime;
  var qX;
  var qY;
  var qZ;
  var qPrime;
  RotMat = mat4();
  canvas.onmousedown = function(e) {
	e.preventDefault();
	pX = 2 * (e.clientX / (canvas.width - 1)) - 1;
	pY = 1 - (2 * (e.clientY / (canvas.height - 1)));

	pZ = Math.sqrt(1 - pX * pX - pY * pY);

	pPrime = vec4(pX, pY, pZ, 0);

	RotMat = grm;

	isDown = true;
  };

  canvas.onmousemove = function(ev) {
		if (isDown) {
			ev.preventDefault();
		qX = 2 * (ev.clientX / (canvas.width - 1)) - 1;
		qY = 1 - (2 * (ev.clientY / (canvas.height - 1)));
		qZ = Math.sqrt(1 - qX * qX - qY * qY);

		qPrime = vec4(qX, qY, qZ, 0);
		var thetaRot = Math.acos(dot(pPrime, qPrime) /
			(length(pPrime) * length(qPrime)));

		RotMat = mult(RotMat, rotate(thetaRot, cross(pPrime, qPrime)));
		}

	};

  canvas.onmousewheel = function(e) {scrollFunction(e)};

  function scrollFunction(e) {
	e.preventDefault();
	if (e.wheelDelta >= 120) {
		scale = scale + 0.1;
	}
		else if (e.wheelDelta <= -120) {
		scale = scale - 0.1;
	}

  }

  canvas.onmouseup = function(e) {
	grm = mult(grm, RotMat);
	isDown = false;
  };



  var ctx = canvas.getContext('experimental-webgl',
	{preserveDrawingBuffer: true});

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); }


  //Init texture
  var image = new Image();
  image.onload = function() {
	configureTexture(image);
  };
  image.src = 'lion.jpg';

  configureTexture(image);

  elt = document.getElementById('test');

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.5, 0.5, 0.5, 1.0);

  gl.enable(gl.CULL_FACE);

  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0,
                gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.generateMipmap(gl.TEXTURE_2D);

  // Allocate a frame buffer object

  framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);


  // Attach color buffer
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                          gl.TEXTURE_2D, texture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  //  Load shaders and initialize attribute buffers
  program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  colorCube();

  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

  var vColor = gl.getAttribLocation(program, 'vColor');
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  var vTexCoord = gl.getAttribLocation(program, 'vTexCoord');
  gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vTexCoord);


  var nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  var vNormal = gl.getAttribLocation(program, 'vNormal');
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  var tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  thetaLoc = gl.getUniformLocation(program, 'theta');

  viewerPos = vec3(0.0, 0.0, -20.0);

  projection = ortho(-1, 1, -1, 1, -100, 100);

  var ambientProduct = mult(lightAmbient, materialAmbient);
  var diffuseProduct = mult(lightDiffuse, materialDiffuse);
  var specularProduct = mult(lightSpecular, materialSpecular);

  //document.getElementById('ButtonX').onclick = function(){axis = xAxis;};
  // document.getElementById('ButtonY').onclick = function(){axis = yAxis;};
  // document.getElementById('ButtonZ').onclick = function(){axis = zAxis;};
  // document.getElementById('ButtonT').onclick = function(){flag = !flag};

  gl.uniform4fv(gl.getUniformLocation(program, 'ambientProduct'),
                flatten(ambientProduct));
  gl.uniform4fv(gl.getUniformLocation(program, 'diffuseProduct'),
                flatten(diffuseProduct));
  gl.uniform4fv(gl.getUniformLocation(program, 'specularProduct'),
                flatten(specularProduct));
  gl.uniform4fv(gl.getUniformLocation(program, 'lightPosition'),
                flatten(lightPosition));

  gl.uniform1f(gl.getUniformLocation(program,
	'shininess'), materialShininess);

  gl.uniformMatrix4fv(gl.getUniformLocation(program, 'projectionMatrix'),
                       false, flatten(projection));

  canvas.addEventListener('mousedown', function(event) {
	pick(event);
  });

  render();
};

var render = function() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (flag) theta[axis] += 2.0;

   modelView = lookAt(eye, at, n);
   modelView = mult(modelView, RotMat);

   modelView = mult(modelView, scalem(scale, scale, scale));


  gl.uniformMatrix4fv(gl.getUniformLocation(
    program, 'modelViewMatrix'), false, flatten(modelView));

  gl.uniform1i(gl.getUniformLocation(program, 'i'), 0);
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  requestAnimFrame(render);
};