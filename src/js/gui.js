var meshProgramInfo;
var gl;
var params = {
  selected: 1,
  color: [255, 255, 255]

}
const loadGUI = (mesh, webgl) => {
  gl = webgl;
  meshProgramInfo = mesh;

  var shapes = {
    Cube: 1,
    Sphere: 2,
    Cone: 3
  }

  gui = new dat.GUI();
  objectFolder = gui.addFolder("Objects")
  objectFolder.add(addObjBtn, 'AddObject').name("Add Object");
  objectFolder.add(params, "selected", shapes).name("Cube").name('Shape')
  objectFolder.addColor(params, 'color').name('Color');
  objectFolder.open()

  gui3 = new dat.GUI();
  gui2 = new dat.GUI();



  // ---- Camera
  loadCameraGUI(gui2);
  loadCurveGUI(gui3);

  // Carrega exemplo
  // loadSolarSystem();
};

function updateDropLists(lists,names) {
  lists.forEach(object => {
    innerHTMLStr = "";
    var i;
    for (i = 0; i < names.length; i++) {
      var str = "<option value='" + names[i] + "'>" + names[i] + "</option>";
      innerHTMLStr += str;

    }
    if (innerHTMLStr != "") object.domElement.children[0].innerHTML = innerHTMLStr;
  });
}
