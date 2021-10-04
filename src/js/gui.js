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
  var extra = new dat.GUI()
  var obj = {
    load1: function () {
      loadSolarSystem();
      extra.destroy()
    },
    load2: function () {
      loadCurveExample();
      extra.destroy()
    }
  };
  extra.add(obj, 'load1').name("Solar System");
  extra.add(obj, 'load2').name("Curves Example");



  // ---- Camera
  loadCameraGUI(gui2);
  loadCurveGUI(gui3);

  // Carrega exemplo
  // loadSolarSystem();
};
