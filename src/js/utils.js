var meshes;

var objectList = [];
var objectNameList = [];
var objectCount = 0;

var CamList = [];
var CamNameList = [];
var CamCount = 0;

var selectedCam = 0;

var droplists = [];
var droplistsCam = [];

var objGUI;
var gui;
var gui2;
var camFolder;

var debug;

const degToRad = (d) => (d * Math.PI) / 180;

const radToDeg = (r) => (r * 180) / Math.PI;

// Classes
class Animation {
  transformations
  start = 0;
  finish = 0;
  duration = 1;
  constructor() {
    this.transformations = new Transformations();
  }
}
class Transformations {
  rotateX = degToRad(0);
  rotateY = degToRad(0);
  rotateZ = degToRad(0);
  translateX = 0;
  translateY = 0;
  translateZ = 0;
  scaleX = 1;
  scaleY = 1;
  scaleZ = 1;
  orbitRotateX = degToRad(0);
  orbitRotateY = degToRad(0);
  orbitRotateZ = degToRad(0);
  constructor() { }
}
class Object3D {
  Uniforms;
  BufferInfo;
  VAO;

  transformations;
  startState;
  animation = [];

  refObj = null;
  refEnabled = false;

  running = false;
  loop = false;
  constructor(meshProgramInfo, gl, scale, position, name, color, type) {
    var colors
    if (color)
      colors = color;
    else
      colors = [Math.random(), Math.random(), Math.random(), 1];

    objectNameList.push(name)
    this.Uniforms = {
      u_colorMult: colors,
      u_matrix: (m4.identity())
    };

    if (type) {
      switch (type) {
        case 1: this.BufferInfo = meshes.Cube; break;
        case 2: this.BufferInfo = meshes.Sphere; break;
        case 3: this.BufferInfo = meshes.Cone; break;
      }
    } else {
      this.BufferInfo = meshes.Cube;
    }

    this.VAO = twgl.createVAOFromBufferInfo(
      gl,
      meshProgramInfo,
      this.BufferInfo,
    );

    this.transformations = new Transformations();
    this.startState = new Transformations()

    this.transformations.scaleX = scale;
    this.transformations.scaleY = scale;
    this.transformations.scaleZ = scale;

    this.transformations.translateX = position[0];
    this.transformations.translateY = position[1];
    this.transformations.translateZ = position[2];


  }
}
class Meshes {
  Cube;
  Sphere;
  Cone;
  constructor(gl) {
    this.Cube = flattenedPrimitives.createCubeBufferInfo(gl, 20);
    this.Sphere = flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6);
    this.Cone = flattenedPrimitives.createTruncatedConeBufferInfo(gl, 10, 0, 20, 12, 1, true, false);
  }
}
class Camera {
  transformations;
  startState;
  animation = [];
  running = false;
  loop = false;

  lookAtEnabled = false;
  refEnabled = false;
  refObj = null;

  FOV = 40;

  constructor() {
    this.transformations = new Transformations();
    this.startState = new Transformations();
    this.transformations.translateZ = 200;
  }
};

class SaveFile {
  // meshes;
  objectList = [];
  objectNameList = [];
  CamList = [];
  CamNameList = [];
  // droplists = [];
  objectCount = 0;
  // objGUI;
  // gui;
  // gui2;

  constructor() {
    // this.meshes = meshes
    this.objectList = objectList
    this.objectNameList = objectNameList
    this.CamList = CamList
    this.CamNameList = CamNameList
    // this.droplists = droplists
    this.objectCount = objectCount
    // this.objGUI = objGUI
    // this.gui = gui
    // this.gui2 = gui2
  }
}

// Fumções de Apoio

function applyAnimations(object) {
  var ended = false;

  if (object.running) {
    var now = Date.now();
    var lastAnim = sumChanges(object, now)

    for (var i = 0; i < object.animation.length; i++) {
      var anim = object.animation[i]
      if (now >= anim.start && now < anim.finish) {

        object.running = true

        var delta = (now - anim.start) / (anim.finish - anim.start);

        object.transformations.rotateX = lastAnim.rotateX + anim.transformations.rotateX * delta
        object.transformations.rotateY = lastAnim.rotateY + anim.transformations.rotateY * delta
        object.transformations.rotateZ = lastAnim.rotateZ + anim.transformations.rotateZ * delta
        object.transformations.translateX = lastAnim.translateX + anim.transformations.translateX * delta;
        object.transformations.translateY = lastAnim.translateY + anim.transformations.translateY * delta
        object.transformations.translateZ = lastAnim.translateZ + anim.transformations.translateZ * delta
        object.transformations.scaleX = lastAnim.scaleX + (anim.transformations.scaleX - lastAnim.scaleX) * delta
        object.transformations.scaleY = lastAnim.scaleY + (anim.transformations.scaleY - lastAnim.scaleY) * delta
        object.transformations.scaleZ = lastAnim.scaleZ + (anim.transformations.scaleZ - lastAnim.scaleZ) * delta
        object.transformations.orbitRotateX = lastAnim.orbitRotateX + anim.transformations.orbitRotateX * delta
        object.transformations.orbitRotateY = lastAnim.orbitRotateY + anim.transformations.orbitRotateY * delta
        object.transformations.orbitRotateZ = lastAnim.orbitRotateZ + anim.transformations.orbitRotateZ * delta

      }
      ended = false;
      if (now > anim.finish) {
        object.running = false;
        ended = true;
      }
      // console.log(now, anim.finish, now > anim.finish, 'ended:', ended)

    }

    //terminou animação retorna ao estado inicial
    if (ended) {
      console.log(ended)
      object.transformations.rotateX = object.startState.rotateX
      object.transformations.rotateY = object.startState.rotateY
      object.transformations.rotateZ = object.startState.rotateZ
      object.transformations.translateX = object.startState.translateX
      object.transformations.translateY = object.startState.translateY
      object.transformations.translateZ = object.startState.translateZ
      object.transformations.scaleX = object.startState.scaleX
      object.transformations.scaleY = object.startState.scaleY
      object.transformations.scaleZ = object.startState.scaleZ
      object.transformations.orbitRotateX = object.startState.orbitRotateX
      object.transformations.orbitRotateY = object.startState.orbitRotateY
      object.transformations.orbitRotateZ = object.startState.orbitRotateZ
    }
  } else {
    if (object.loop) {
      animate(object)
    }
  }

}

function sumChanges(object, now) {
  var x = new Transformations()

  x.rotateX = object.startState.rotateX
  x.rotateY = object.startState.rotateY
  x.rotateZ = object.startState.rotateZ
  x.translateX = object.startState.translateX
  x.translateY = object.startState.translateY
  x.translateZ = object.startState.translateZ
  x.scaleX = object.startState.scaleX
  x.scaleY = object.startState.scaleY
  x.scaleZ = object.startState.scaleZ
  x.orbitRotateX = object.startState.orbitRotateX
  x.orbitRotateY = object.startState.orbitRotateY
  x.orbitRotateZ = object.startState.orbitRotateZ


  for (var i = 0; i < object.animation.length; i++) {
    if (object.animation[i].finish < now) {
      x.rotateX += object.animation[i].transformations.rotateX
      x.rotateY += object.animation[i].transformations.rotateY
      x.rotateZ += object.animation[i].transformations.rotateZ
      x.translateX += object.animation[i].transformations.translateX
      x.translateY += object.animation[i].transformations.translateY
      x.translateZ += object.animation[i].transformations.translateZ
      x.scaleX += object.animation[i].transformations.scaleX - x.scaleX
      x.scaleY += object.animation[i].transformations.scaleY - x.scaleY
      x.scaleZ += object.animation[i].transformations.scaleZ - x.scaleZ
      x.orbitRotateX += object.animation[i].transformations.orbitRotateX
      x.orbitRotateY += object.animation[i].transformations.orbitRotateY
      x.orbitRotateZ += object.animation[i].transformations.orbitRotateZ
    }
  }
  // console.log(x,object);
  return x;

}

function rotateRef(matrix, ref) {
  ref2 = ref.refObj;
  if (ref2 != null)
    matrix = rotateRef(matrix, ref2);

  if (ref.refEnabled) {
    matrix = m4.xRotate(matrix, ref.transformations.orbitRotateX);
    matrix = m4.yRotate(matrix, ref.transformations.orbitRotateY);
    matrix = m4.zRotate(matrix, ref.transformations.orbitRotateZ);
  }

  matrix = m4.translate(
    matrix,
    ref.transformations.translateX,
    ref.transformations.translateY,
    ref.transformations.translateZ
  );

  return matrix;
}

function animate(object) {
  var totalTime = 10;
  object.animation.forEach(anim => {
    anim.start = Date.now() + totalTime;
    anim.finish = anim.start + (anim.duration * 1000);
    totalTime += anim.duration * 1000;
  });

  object.running = true;

  object.startState.rotateX = object.transformations.rotateX;
  object.startState.rotateY = object.transformations.rotateY;
  object.startState.rotateZ = object.transformations.rotateZ;
  object.startState.translateX = object.transformations.translateX;
  object.startState.translateY = object.transformations.translateY;
  object.startState.translateZ = object.transformations.translateZ;
  object.startState.scaleX = object.transformations.scaleX;
  object.startState.scaleY = object.transformations.scaleY;
  object.startState.scaleZ = object.transformations.scaleZ;
  object.startState.orbitRotateX = object.transformations.orbitRotateX;
  object.startState.orbitRotateY = object.transformations.orbitRotateY;
  object.startState.orbitRotateZ = object.transformations.orbitRotateZ;

  return;
}

function loadCameraGUI(gui2) {

  var camera = gui2.addFolder("Cameras")

  var cameraList = {
    Target: "none"
  };
  var x2 = camera.add(cameraList, 'Target', CamNameList).name("Selected Camera").listen().onChange(function () {
    var index = CamNameList.indexOf(cameraList.Target);
    if (index != -1) {
      selectedCam = index;
      // console.log(camConfig.refObj);
    } else {
      nameList.Target = "Error";
    }
  });
  droplistsCam.push(x2);

  camera.add(addCamBtn, "AddCamera").name("Add Camera");
  camFolder = camera.addFolder("Cameras List");
  camFolder.open();
  addCamBtn.AddCamera();
}

var addCamBtn = {
  AddCamera: function () {
    var animIndex = 0;
    var name = "Camera " + CamCount;
    var camConfig = new Camera();
    CamCount++;

    var folder = camFolder.addFolder(name)
    folder.add(camConfig, "FOV", 5, 160, 0.01);
    var look = folder.add(camConfig, "lookAtEnabled").name("Look At").listen();
    var rotate = folder.add(camConfig, "refEnabled").name("Rotate Around").listen();

    look.onChange(function () {
      camConfig.refEnabled = false;
      camConfig.lookAtEnabled = true;
    });

    rotate.onChange(function () {
      camConfig.refEnabled = true;
      camConfig.lookAtEnabled = false;
    });

    var nameList = {
      Target: "none"
    }; folder
    var x = folder.add(nameList, 'Target', objectNameList).onFinishChange(function () {
      var index = objectNameList.indexOf(nameList.Target);
      if (index != -1) {
        camConfig.refObj = objectList[index];
        // console.log(camConfig.refObj);
      } else {
        nameList.Target = "Error"
      }
    }).listen();
    droplists.push(x);

    // camConfig.transformations.translateZ = 200
    var transforms = folder.addFolder("Transformations");
    // transforms.open();
    transforms.add(camConfig.transformations, "translateX", -1000, 1000, 0.01).listen();
    transforms.add(camConfig.transformations, "translateY", -1000, 1000, 0.01).listen();
    transforms.add(camConfig.transformations, "translateZ", -1000, 1000, 0.01).listen();
    transforms.add(camConfig.transformations, "rotateX", degToRad(-360), degToRad(360), 0.01).listen();
    transforms.add(camConfig.transformations, "rotateY", degToRad(-360), degToRad(360), 0.01).listen();
    transforms.add(camConfig.transformations, "rotateZ", degToRad(-360), degToRad(360), 0.01).listen();
    transforms.add(camConfig.transformations, "orbitRotateX", degToRad(0), degToRad(360), 0.01).listen();
    transforms.add(camConfig.transformations, "orbitRotateY", degToRad(0), degToRad(360), 0.01).listen();
    transforms.add(camConfig.transformations, "orbitRotateZ", degToRad(0), degToRad(360), 0.01).listen();
    // CamList.push(camConfig)

    var anim = folder.addFolder("Animations");
    anim.add({
      'Animate': function () {
        animate(camConfig);
      }
    }, "Animate");


    anim.add(camConfig, "loop")

    anim.add({
      'Add animation': function (folder) {
        var folder = anim.addFolder("Animation " + animIndex)
        var newAnim = new Animation();
        folder.add({
          'Remove': function () {
            anim.removeFolder(folder);
            var index = camConfig.animation.indexOf(newAnim)
            camConfig.animation.splice(index, 1);
          }
        }, 'Remove')
        animIndex++;

        newAnim.transformations.scaleX = camConfig.transformations.scaleX
        newAnim.transformations.scaleY = camConfig.transformations.scaleY
        newAnim.transformations.scaleZ = camConfig.transformations.scaleZ

        folder.add(newAnim.transformations, "rotateX", degToRad(-360), degToRad(360), 0.01);
        folder.add(newAnim.transformations, "rotateY", degToRad(-360), degToRad(360), 0.01);
        folder.add(newAnim.transformations, "rotateZ", degToRad(-360), degToRad(360), 0.01);
        folder.add(newAnim.transformations, "translateX", -100, 100, 0.01);
        folder.add(newAnim.transformations, "translateY", -100, 100, 0.01);
        folder.add(newAnim.transformations, "translateZ", -100, 100, 0.01);
        folder.add(newAnim.transformations, "orbitRotateX", degToRad(-360), degToRad(360), 0.01);
        folder.add(newAnim.transformations, "orbitRotateY", degToRad(-360), degToRad(360), 0.01);
        folder.add(newAnim.transformations, "orbitRotateZ", degToRad(-360), degToRad(360), 0.01);
        folder.add(newAnim, "duration", 0.01, 1000, 0.01);

        camConfig.animation.push(newAnim);
      }
    }, "Add animation");

    CamNameList.push(name);
    CamList.push(camConfig);
    updateDropListCam();
  }

}

function getSelectedCam() {
  return CamList[selectedCam];
}

function getStaticRef(target) {
  var ref2 = target.refObj;
  if (ref2 != null)
    return (getStaticRef(ref2));
  else
    return target;
}

