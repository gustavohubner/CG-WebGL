var meshProgramInfo;
var gl;


var save
const loadGUI = (mesh, webgl) => {
  // var params = {
  //   loadFile: function () {
  //     document.getElementById('myInput').click();
  //     document.getElementById('myInput').addEventListener('change', function () {

  //       var fr = new FileReader();
  //       fr.onload = function () {
  //         console.log(JSON.parse(fr.result));
  //         save= JSON.parse(fr.result);
  //         loadSaveFile(save);
  //       }
  //       fr.readAsText(this.files[0]);
  //     })
  //   }
  // };

  gl = webgl;
  meshProgramInfo = mesh;
  gui = new dat.GUI();
  // gui.add(params, 'loadFile').name('Load file');
  gui.add(obj, 'AddObject');
  var objList = gui.addFolder("Objects")
  objList.open()
  objGUI = objList;
  gui2 = new dat.GUI();

  // ---- Camera
  loadCameraGUI(gui2);

  obj.AddObject(1, [0, 0, 0], [1, 1, 0, 1], 2);

  // obj.AddObject(0.4, [-50, 0, 0], [0, 0.5, 0.5, 1], 2);
  // obj.AddObject(0.2, [-15, 0, 0], [0.5, 0.5, 0.5, 1], 2);
  obj.AddObject(0.7, [100, 0, 0], [0.8, 0.4, 0, 1], 2);

  // CamList[0].lookTarget = objList[0];
};


//
// Welcome to the GUI Hell
//

var obj = {
  AddObject: function (scale1, position, color, type) {
    var name = ("Object " + objectCount)
    var mesh = new Object3D(meshProgramInfo, gl, scale1 ? scale1 : 1, position ? position : [0, 0, 0], name, color, type ? type : 1);
    var animIndex = 0;
    var obj = objGUI.addFolder(name);
    // obj.open()

    obj.add({
      Remove: function () {
        objGUI.removeFolder(obj);
        var index = objectList.indexOf(mesh)
        objectList.splice(index, 1);
        objectNameList.splice(index, 1);
        updateDropLists();
      }
    }, "Remove");



    // refPoint.open();

    obj.add(mesh, "refEnabled").name("Enabled").name("Rotate Around Object");
    var nameList = {
      Object: "none"
    };
    var x = obj.add(nameList, 'Object', objectNameList).name('Target').onFinishChange(function () {
      var index = objectNameList.indexOf(nameList.Object);
      if (index != -1) {
        if (objectNameList[index] != name) {
          mesh.refObj = objectList[index];
          // console.log(mesh.refObj);
        } else {
          console.log("Can't select itself!")
          nameList.Object = null
        }
      } else {
        nameList.Object = "Error"
      }
    });
    droplists.push(x);

    var transformations = obj.addFolder('Transformations')

    transformations.add(mesh.transformations, "translateX", -100, 100, 0.01).listen();
    transformations.add(mesh.transformations, "translateY", -100, 100, 0.01).listen();
    transformations.add(mesh.transformations, "translateZ", -100, 100, 0.01).listen();

    transformations.add(mesh.transformations, "rotateX", degToRad(0), degToRad(360), 0.01).listen();
    transformations.add(mesh.transformations, "rotateY", degToRad(0), degToRad(360), 0.01).listen();
    transformations.add(mesh.transformations, "rotateZ", degToRad(0), degToRad(360), 0.01).listen();

    transformations.add(mesh.transformations, "scaleX", 0.01, 10, 0.01).listen();
    transformations.add(mesh.transformations, "scaleY", 0.01, 10, 0.01).listen();
    transformations.add(mesh.transformations, "scaleZ", 0.01, 10, 0.01).listen();

    transformations.add(mesh.transformations, "orbitRotateX", degToRad(0), degToRad(360), 0.01).listen();
    transformations.add(mesh.transformations, "orbitRotateY", degToRad(0), degToRad(360), 0.01).listen();
    transformations.add(mesh.transformations, "orbitRotateZ", degToRad(0), degToRad(360), 0.01).listen();

    var curves = transformations.addFolder("Curves");

    objectCount++;
    objectList.push(mesh);

    var anim = obj.addFolder("Animations");
    anim.add({
      'Animate': function () {
        animate(mesh);
      }
    }, "Animate");


    anim.add(mesh, "loop")

    anim.add({
      'Add animation': function (folder) {
        var folder = anim.addFolder("Animation " + animIndex)
        var newAnim = new Animation();
        folder.add({
          'Remove': function () {
            anim.removeFolder(folder);
            var index = mesh.animation.indexOf(newAnim)
            mesh.animation.splice(index, 1);
          }
        }, 'Remove')
        animIndex++;

        newAnim.transformations.scaleX = mesh.transformations.scaleX
        newAnim.transformations.scaleY = mesh.transformations.scaleY
        newAnim.transformations.scaleZ = mesh.transformations.scaleZ

        folder.add(newAnim.transformations, "rotateX", degToRad(-360), degToRad(360), 0.01).listen();
        folder.add(newAnim.transformations, "rotateY", degToRad(-360), degToRad(360), 0.01).listen();
        folder.add(newAnim.transformations, "rotateZ", degToRad(-360), degToRad(360), 0.01).listen();
        folder.add(newAnim.transformations, "translateX", -100, 100, 0.01).listen();
        folder.add(newAnim.transformations, "translateY", -100, 100, 0.01).listen();
        folder.add(newAnim.transformations, "translateZ", -100, 100, 0.01).listen();
        folder.add(newAnim.transformations, "scaleX", 0.01, 10, 0.01).listen();
        folder.add(newAnim.transformations, "scaleY", 0.01, 10, 0.01).listen();
        folder.add(newAnim.transformations, "scaleZ", 0.01, 10, 0.01).listen();
        folder.add(newAnim.transformations, "orbitRotateX", degToRad(-360), degToRad(360), 0.01).listen();
        folder.add(newAnim.transformations, "orbitRotateY", degToRad(-360), degToRad(360), 0.01).listen();
        folder.add(newAnim.transformations, "orbitRotateZ", degToRad(-360), degToRad(360), 0.01).listen();
        folder.add(newAnim, "duration", 0.01, 1000, 0.01).listen();

        mesh.animation.push(newAnim);
      }
    }, "Add animation");

    updateDropLists();
  }
};

function updateDropLists() {
  droplists.forEach(object => {
    innerHTMLStr = "";
    var i;
    for (i = 0; i < objectNameList.length; i++) {
      var str = "<option value='" + objectNameList[i] + "'>" + objectNameList[i] + "</option>";
      innerHTMLStr += str;

    }
    if (innerHTMLStr != "") object.domElement.children[0].innerHTML = innerHTMLStr;
  });
}

function updateDropListCam() {
  droplistsCam.forEach(object => {
    innerHTMLStr = "";
    var i;
    for (i = 0; i < CamNameList.length; i++) {
      var str = "<option value='" + CamNameList[i] + "'>" + CamNameList[i] + "</option>";
      innerHTMLStr += str;

    }
    if (innerHTMLStr != "") object.domElement.children[0].innerHTML = innerHTMLStr;
  });
}