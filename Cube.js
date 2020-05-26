
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
