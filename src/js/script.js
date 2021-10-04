function main() {
  const { gl, meshProgramInfo } = initializeWorld();

  meshes = new Meshes(gl);

  loadGUI(meshProgramInfo, gl);
  requestAnimationFrame(render);
}

function computeMatrix(viewProjectionMatrix, object) {
  // var matrix = viewProjectionMatrix;
  var matrix = m4.identity();

  // Se usar rotação en torno de um Objeto de referência
  if (object.refEnabled && object.refObj != null) {
    var ref = object.refObj;
    matrix = rotateRef(matrix, ref);
    // caso tenha rotação em torno de Referencia
    // é uma função recursiva para aplicar as rotações e translações necessárias
    // para mover junto com a refencia, permitindo uma organização em árvores de 
    // pai - filhos
    matrix = m4.xRotate(matrix, object.transformations.orbitRotateX);
    matrix = m4.yRotate(matrix, object.transformations.orbitRotateY);
    matrix = m4.zRotate(matrix, object.transformations.orbitRotateZ);
  }

  // Aplica tranlação e rotação
  matrix = m4.translate(
    matrix,
    object.transformations.translateX,
    object.transformations.translateY,
    object.transformations.translateZ
  );

  // Aplica curva
  if (object.curveEnabled && object.curveSelected != null) {
    var offset = object.curveSelected.getPositionOnT(object.curveT);
    // console.log (object.curveT, offset);
    matrix = m4.translate(
      matrix,
      offset.x,
      offset.y,
      offset.z
    );
  }

  matrix = m4.xRotate(matrix, object.transformations.rotateX);
  matrix = m4.yRotate(matrix, object.transformations.rotateY);
  matrix = m4.zRotate(matrix, object.transformations.rotateZ);

  matrix = m4.scale(matrix, object.transformations.scaleX, object.transformations.scaleY, object.transformations.scaleZ);

  object.worldPosition = [matrix[12], matrix[13], matrix[14]];

  //multiplico somente no final para obter a posição do objeto após a rotação
  return m4.multiply(viewProjectionMatrix, matrix);
}

function render() {
  twgl.resizeCanvasToDisplaySize(gl.canvas);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);


  // Camera ------------------------------------------------------
  var camConfig = getSelectedCam();
  // Aplica modificações aos atributos conforme animações
  applyAnimations(camConfig);
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  var projectionMatrix = m4.perspective(degToRad(camConfig.FOV), aspect, 1, 4000);

  var cameraMatrix = m4.identity()
  var cameraPosition = [
    camConfig.transformations.translateX,
    camConfig.transformations.translateY,
    camConfig.transformations.translateZ];
  var target

  // Rotacionar em torno de objeto
  if (camConfig.refEnabled && camConfig.refObj != null) {
    var ref = camConfig.refObj;
    cameraMatrix = rotateRef(cameraMatrix, ref);

    cameraMatrix = m4.xRotate(cameraMatrix, camConfig.transformations.orbitRotateX);
    cameraMatrix = m4.yRotate(cameraMatrix, camConfig.transformations.orbitRotateY);
    cameraMatrix = m4.zRotate(cameraMatrix, camConfig.transformations.orbitRotateZ);
  }

  cameraMatrix = m4.translate(
    cameraMatrix,
    camConfig.transformations.translateX,
    camConfig.transformations.translateY,
    camConfig.transformations.translateZ
  );

  if (camConfig.curveEnabled && camConfig.curveSelected != null) {
    var offset = camConfig.curveSelected.getPositionOnT(camConfig.curveT);
    // console.log (object.curveT, offset);
    cameraMatrix = m4.translate(
      cameraMatrix,
      offset.x,
      offset.y,
      offset.z
    );
  }

  // look at
  if (camConfig.lookAtEnabled) {
    var camTarget;
    if (camConfig.refObj != null) {
      camTarget = camConfig.refObj;
    } else {
      camTarget = objectList[0];
    }
    target = [
      camTarget.worldPosition[0],
      camTarget.worldPosition[1],
      camTarget.worldPosition[2]
    ];

    var up = [0, 1, 0];
    cameraMatrix = m4.lookAt(cameraPosition, target, up);
  }

  // rotationa camera com sliders, se lookAt desativado
  if (!camConfig.lookAtEnabled) {
    cameraMatrix = m4.xRotate(cameraMatrix, camConfig.transformations.rotateX);
    cameraMatrix = m4.yRotate(cameraMatrix, camConfig.transformations.rotateY);
    cameraMatrix = m4.zRotate(cameraMatrix, camConfig.transformations.rotateZ);
  }

  // Make a view matrix from the camera matrix.
  var viewMatrix = m4.inverse(cameraMatrix);
  var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
  // Camera ------------------------------------------------------


  // fundo preto
  gl.useProgram(meshProgramInfo.program);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Desenha os objetos
  objectList.forEach(object => {

    // Aplica modificações aos atributos conforme animações
    applyAnimations(object);

    // Configura os atributos do WEBGL
    gl.bindVertexArray(object.VAO);
    object.Uniforms.u_matrix = computeMatrix(
      viewProjectionMatrix,
      object
    );
    // Configura Uniforms
    twgl.setUniforms(meshProgramInfo, object.Uniforms);
    twgl.drawBufferInfo(gl, object.BufferInfo);
  });
  requestAnimationFrame(render);
}

main();
