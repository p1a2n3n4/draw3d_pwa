let strokes = [];
let isRendering = false;
let currentStroke = null;

let show_export = false;
let show_import = false;

let move = false; //--move mode
let view_button_text = "draw";
let depth = 0;
let finalDepth;
let tweak;
let bg = 0;
let erase = false;

let side = ["front", "side", "top"];
let side_index = 0;

let snapping = 30;

let sketchy = 0;
let stroke_fill = false;
let ui = true;

let r = 0;
let g = 0;
let b = 0;
let a = 0;
let s = 0;
let fps = 24;

let color_preview = false;
let animations = ["static", "turn", "side to side"];
let anim_index = 0;
let on = false; // FOR PLANE PREVIEW
let view_button;
let add_button;
let minus_button;
let side_view;
let bg_button;
let fc_button;
let prev_button;
let fill_button;
let ui_button;
let undo_button;
let import_button;

//------------button for exports/import
let fileInput;
let save_button;

let export_button;
let turn_around;

let render_button;

let depthLabel;

let slider_r;
let slider_g;
let slider_b;
let slider_a;
let slider_s;
let slider_noise;
let slider_tweak;

let create_ui = true;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight, WEBGL);

  frameRate(fps);

  // Create  buttons------------------------------------
  view_button = createButton(view_button_text);

  minus_button = createButton("-");

  add_button = createButton("+");

  undo_button = createButton("undo");

  bg = color(20, 20, 20);
  bg_button = createButton("apply background");

  side_view = createButton(side[side_index]);

  fc_button = createButton("fullscreen");

  prev_button = createButton("preview");

  fill_button = createButton("fill");

  ui_button = createButton("ui");

  //-----export ui-----

  export_button = createButton("📷");

  turn_around = createButton(animations[anim_index]);

  render_button = createButton("render");

  //import------

  import_button = createButton("import");

  save_button = createButton("save");
  fileInput = createFileInput(loadDrawing);

  //--------------create sliders------------------
  slider_r = createSlider(0, 255, 255);

  slider_g = createSlider(0, 255, 255);

  slider_b = createSlider(0, 255, 255);

  slider_a = createSlider(0, 255, 255);

  slider_s = createSlider(0, 255, 3);

  slider_noise = createSlider(0, 20, 0);

  slider_tweak = createSlider(0, snapping, 0, snapping / 4);

  updateUI();

  //----------text label for depth--------------------
  depthLabel = createDiv("Depth: 0");
  depthLabel.position(20, 90);

  depthLabel.style("color", "white");
  depthLabel.style("font-size", "16px");
  depthLabel.style("background", "rgb(0,0,0,80)");
  depthLabel.style("border-radius", "5px");

  depthLabel.style("font-family", "Quicksand");
}

function draw() {
  //print(height)
  
  tweak = slider_tweak.value();
  finalDepth = depth + tweak;
  depthLabel.html("Depth: " + finalDepth / snapping);

  r = slider_r.value();
  g = slider_g.value();
  b = slider_b.value();
  a = slider_a.value();
  s = slider_s.value();
  sketchy = slider_noise.value();

  //print(strokes.length)
  background(bg);
  //------------------draw color preview--------------
  if (color_preview == true) {
    push();
    fill(r, g, b, a);
    noStroke();
    ellipse(width / 4, -height / 2 + 40, 50);

    pop();
  }

  //switch between orthographic and perspective
  if (move == false) {
    ortho();
    if (ui == true) {
      color_preview = true;
    }
    //------------cursor
    push();
    noFill();
    stroke(255, 255, 255, a - 50);
    strokeWeight(5);
    ellipse(mouseX - width / 2, mouseY - height / 2, s);
    pop();
  } else if (move == true) {
    color_preview = false;
    perspective();

    if (!isRendering) {
      orbitControl();
    }
    //-----------handle animations--------------

    let totalFrames = fps * 10; // 24 fps * 10 sec (matches your render duration)
    let currentFrame = frameCount % totalFrames;

    if (animations[anim_index] === "turn") {
      rotateY((currentFrame / totalFrames) * TWO_PI);
    } else if (animations[anim_index] === "side to side") {
      let swingAngle = PI / 8;
      rotateY(sin((currentFrame / totalFrames) * TWO_PI) * swingAngle);
    }
  }

  //-----------------------rotate preview------------------------

  push();
  let flip;

  // draw all strokes
  //translate(-width/2,-height/2)
  let flip_check = false;

  if (side[side_index] == "side") {
    flip = HALF_PI;
  } else if (side[side_index] == "front") {
    flip = 0;
  } else if (side[side_index] == "top") {
    flip = 0;

    rotateX(HALF_PI);
  }

  rotateY(flip);

  for (let s of strokes) {
    s.draw();
  }

  pop();

  if (on == true) {
    push();
    noStroke();
    rectMode(CENTER);
    fill(255, 240, 200, 30);
    translate(0, 0, finalDepth);
    rect(0, 0, width, height);
    pop();
  }
}

//---------toggle preview visibility
function preview_plane() {
  if (on == false) {
    on = true;
  
  } else if (on == true) {
    on = false;
  }
  print(on);
}

function touchStarted() {
  //-----tap undo------------
  if ((touches.length === 2) & (move == false)) {
    undo();
    return false;
  }
}

function touchEnded() {
  currentStroke = null;
}
//---------------------draw line----------------------------
function touchMoved() {
  if (move == false && (erase == false) & (touches.length !== 2)) {
    // create stroke ONLY if none exists yet
    if (!currentStroke) {
      currentStroke = new ArtLine(color(r, g, b, a), s, sketchy, stroke_fill);
      strokes.push(currentStroke);
    }

    let p = getMouseWorldAtDepth(finalDepth);

    if (side[side_index] == "front") {
      currentStroke.addPoint(p.x, p.y, p.z);
    } else if (side[side_index] == "side") {
      currentStroke.addPoint(-p.z, p.y, p.x);
    } else if (side[side_index] == "top") {
      currentStroke.addPoint(p.x, p.z, -p.y);
    }
  }
}

// ----------------------change view mode--------------------------
function toggle_view() {
  if (move == false) {
    move = true;
    view_button_text = "move";
  } else if (move == true) {
    move = false;
    view_button_text = "draw";
    resetMatrix();
    resetOrbit();
  }
  view_button.html(view_button_text);
}

//--------------------toggle side/front view--------------------

function change_plane() {
  if (side_index < 2) {
    side_index += 1;
  } else if (side_index == 2) {
    side_index = 0;
  }
  side_view.html(side[side_index]);
}

//----------------------------decrease/ increase depth-------------------
function decrease() {
  depth += -snapping;
  print(depth);
}

function plus() {
  depth += snapping;
  print(depth);
}

//---------------------undo------------------------------------------

function undo() {
  if (strokes.length > 0) {
    strokes.pop();
  }
}

//----------change bg------------

function apply_bg() {
  bg = color(r, g, b);
}

//------------------remap mouse----------------

function getMouseWorldAtDepth(zPlane) {
  // offset mouse from center
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;

  return createVector(mx, my, zPlane);
}

function resetOrbit() {
  // Default camera setup in p5 WEBGL
  let fov = PI / 3;
  let camZ = height / 2 / tan(fov / 2);

  // Camera at (0,0,camZ) looking at (0,0,0), Y-up
  camera(0, 0, camZ, 0, 0, 0, 0, 1, 0);

  // Reset any panning
  resetMatrix(); // optional, if you have transformations
}

//------keyboard input----------

function keyPressed() {
  // For Windows/Linux: Ctrl + Z
  if (key === "z" && keyIsDown(CONTROL)) {
    erase = true;
    undo();
    erase = false;
  }
}

/* full screening will change the size of the canvas */
function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);

  updateUI();
}

/* prevents the mobile browser from processing some default
 * touch events, like swiping left for "back" or scrolling the page.
 */
document.ontouchmove = function (event) {
  event.preventDefault();
};

//------------fill stroke function-------
function toggle_fill() {
  if (stroke_fill == false) {
    stroke_fill = true;
    fill_button.style("background-color", "#FF9800");
  } else if (stroke_fill == true) {
    stroke_fill = false;
    fill_button.style("background-color", "rgb(92,92,92)");
  }
}

//---------export ui stuff-----------------------------------------

function switch_anim() {
  if (anim_index < 2) {
    anim_index += 1;
  } else if (anim_index == 2) {
    anim_index = 0;
  }

  turn_around.html(animations[anim_index]);
}

//----------------hide export menu----------
function hide_export_menu(state) {
  if (state == false) {
    turn_around.hide();

    render_button.hide();

    save_button.hide();
    import_button.hide();
    
    if(!fullscreen()){
    fc_button.hide();
    }
  } else if (state == true) {
    turn_around.show();

    render_button.show();

    save_button.show();
    import_button.show();
      
    if(!fullscreen()){
    fc_button.show();
    }
  }
}
//-------export menu state
function export_vis() {
  if (show_export == false) {
    show_export = true;
  } else if (show_export == true) {
    show_export = false;
    show_import = false;
  }
  hide_export_menu(show_export);
  hide_import_menu(show_import);
}

//----------------hide import menu----------
function hide_import_menu(state) {
  if (state == false) {
    fileInput.hide();
  } else if (state == true) {
    fileInput.show();
  }
}
//-------import menu state
function import_vis() {
  if (show_import == false) {
    show_import = true;
  } else if (show_import == true) {
    show_import = false;
  }
  hide_import_menu(show_import);
}

function render() {
  if (isRendering) return; // Prevent multiple GIFs at once
  isRendering = true;

  hide_ui(false); // hide all UI for render
  ui_button.hide(); // hide ui toggle button

  let duration = 10; // seconds
  saveGif("mySketch", duration * fps, { units: "frames" });

  // Unlock after render finishes
  setTimeout(() => {
    isRendering = false;
    ui_button.show();
    updateUI(); // restore UI
  }, duration * 1000);
}

//---------------hide ui  (ui button)--------------------------

function hide_ui(state) {
  if (state == false) {
    show_export = false;
    show_import = false;
    color_preview = false;
    view_button.hide();
    add_button.hide();
    minus_button.hide();
    side_view.hide();
    bg_button.hide();
    fc_button.hide();
    prev_button.hide();
    fill_button.hide();
    undo_button.hide();

    export_button.hide();
    import_button.hide();

    depthLabel.hide();

    slider_r.hide();
    slider_g.hide();
    slider_b.hide();
    slider_a.hide();
    slider_s.hide();
    slider_noise.hide();
    slider_tweak.hide();
  } else if (state == true) {
    

    color_preview = true;
    view_button.show();
    add_button.show();
    minus_button.show();
    side_view.show();
    bg_button.show();
    fc_button.show();
    prev_button.show();
    fill_button.show();
    undo_button.show();

    export_button.show();
    import_button.show();

    depthLabel.show();

    slider_r.show();
    slider_g.show();
    slider_b.show();
    slider_a.show();
    slider_s.show();
    slider_noise.show();
    slider_tweak.show();
  }
}
//---------for the ui button--------------------
function ui_visible() {
  hide_ui();
  if (ui == true) {
    ui = false;
    ui_button.style("background-color", "#4949494F");
  } else if (ui == false) {
    ui = true;
    ui_button.style("background-color", "rgb(92,92,92)");
  }
  hide_ui(ui);
  updateUI();
}

//---------------------------------------draw ui----------------------------------

function updateUI() {
  hide_export_menu(show_export);
  hide_import_menu(show_import);
  // Create  buttons------------------------------------

  view_button.position(0, 10);
  view_button.mousePressed(toggle_view);
  view_button.class("Buttons");
  view_button.size(60, 60);

  minus_button.position(10, 120);
  minus_button.mousePressed(decrease);
  minus_button.class("Buttons");
  minus_button.size(35, 35);

  add_button.position(50, 120);
  add_button.mousePressed(plus);
  add_button.class("Buttons");
  add_button.size(35, 35);

  prev_button.position(100, 120);
  prev_button.mousePressed(preview_plane);
  prev_button.class("Buttons");
  prev_button.size(100, 35);

  undo_button.position(140, 10);
  //undo_button.mouseOver(() => erase = true);
  //undo_button.mouseOut(() => erase = false);
  undo_button.mousePressed(undo);
  undo_button.class("Buttons");
  undo_button.size(60, 60);

  bg_button.position(width - width / 5 - 10, 80);
  bg_button.mousePressed(apply_bg);
  bg_button.class("Buttons");
  bg_button.size(width / 5, 40);

  side_view.position(70, 10);
  side_view.mousePressed(change_plane);
  side_view.class("Buttons");
  side_view.size(60, 60);

  fc_button.position(width / 2 - 40, 10);
  // fc_button.mouseOver(() => (erase = true));
  // fc_button.mouseOut(() => (erase = false));
  fc_button.mousePressed(update_fc);
  fc_button.class("Buttons");
  fc_button.size(80, 20);

  if (width < height) {
    fc_button.position(width - 90, 130);
  }

  if (!fullscreen() & (ui == true) & show_export==true) {
    fc_button.show();
  } else if (fullscreen()) {
    fc_button.hide();
  }

  fill_button.position(width - 50, 170);
  // fill_button.mouseOver(() => (erase = true));
  // fill_button.mouseOut(() => (erase = false));
  fill_button.mousePressed(toggle_fill);
  fill_button.class("Buttons");
  fill_button.size(40, 40);

  ui_button.position(width - 50, height - 60);
  //ui_button.mouseOver(() => erase = true);
  //ui_button.mouseOut(() => erase = false);
  ui_button.mousePressed(ui_visible);
  ui_button.class("Buttons");
  ui_button.size(40, 40);

  //--------export buttons--------------------------------

  export_button.position(width - 50, height - 120);
  export_button.mousePressed(export_vis);
  export_button.class("Buttons");
  export_button.size(40, 40);

  turn_around.position(width - 90, 270);
  turn_around.mousePressed(switch_anim);
  turn_around.class("Buttons");
  turn_around.size(80, 40);

  render_button.position(width - 90, 330);
  render_button.mousePressed(render);
  render_button.class("Buttons");
  render_button.size(80, 40);

  //--------import

  import_button.position(width - 60, height - 180);
  import_button.mousePressed(import_vis);
  import_button.class("Buttons");
  import_button.size(50, 40);

  save_button.position(width - 90, 390);
  save_button.mousePressed(saveDrawing);
  save_button.class("Buttons");
  save_button.size(80, 40);
  fileInput.position(width - 250, height - 170);
  fileInput.style("color", "white");
  fileInput.style("background", "#333");
  fileInput.style("border", "20px");
  fileInput.style("font-family", "Quicksand");
  fileInput.size(190, 20);

  if (height < 630) {
    save_button.position(width / 2 - 40, height / 2 + 50);
    fileInput.position(width / 2 - 95, height / 2 - 80);
    import_button.size(80, 40);
    import_button.position(width / 2 - 40, height / 2 - 50);
    turn_around.position(width / 2 - 85, height / 2);
    render_button.position(width / 2 + 5, height / 2);
    export_button.position(width - 100, height - 60);
  }

  //--------------create sliders------------------

  slider_r.position(-20 + width - width / 5, 10);
  slider_r.size(width / 5);
  // slider_r.input(() => {
  //   erase = true;
  // });
  //slider_r.mouseOut(() => (erase = false));
  slider_r.style("accent-color", "rgb(255,100,100)");

  slider_g.position(-20 + width - width / 5, 30);
  slider_g.size(width / 5);
  // slider_g.input(() => {
  //   erase = true;
  // });
  //slider_g.mouseOut(() => (erase = false));
  slider_g.style("accent-color", "rgb(100,255,100)");

  slider_b.position(-20 + width - width / 5, 50);
  slider_b.size(width / 5);
  // slider_b.input(() => {
  //   erase = true;
  // });
  //slider_b.mouseOut(() => (erase = false));
  slider_b.style("accent-color", "rgb(100,100,255)");

  slider_a.style("transform-origin", "left center");
  slider_a.style("transform", "rotate(-90deg)");
  slider_a.position(20, height / 4 + 170);
  slider_a.style("transform", "rotate(-90deg)");
  slider_a.size(height / 4);
  // slider_a.input(() => {
  //   erase = true;
  // });
  //slider_a.mouseOut(() => (erase = false));
  slider_a.class("slide");

  slider_s.style("transform-origin", "left center");
  slider_s.style("transform", "rotate(-90deg)");
  slider_s.position(20, height / 2 + 180);
  slider_s.size(height / 4);
  // slider_s.input(() => {
  //   erase = true;
  // });
  // slider_s.mouseOut(() => (erase = false));
  slider_s.class("slide");

  if (height < 390) {
    slider_a.position(20, height / 4 + 190);
    slider_s.position(50, height / 4 + 190);
    slider_s.size(height / 3);
    slider_a.size(height / 3);
  }

  slider_noise.position(width / 2 - width / 8, height - 50);
  slider_noise.size(width / 4);
  // slider_noise.input(() => {
  //   erase = true;
  // });
  // slider_noise.mouseOut(() => (erase = false));
  //slider_noise.class("slide");
  slider_noise.style("accent-color", "#FF9800");

  slider_tweak.position(100, 90);
  slider_tweak.size(100);
  // slider_tweak.input(() => {
  //   erase = true;
  // });
  // slider_tweak.mouseOut(() => (erase = false));
  slider_tweak.class("slide");
}

//func update fullscreen ui

function update_fc() {
  //------------fullscreen
  if (!fullscreen()) {
    fullscreen(true);

    // slider_r.position(width-100, 10);
    // slider_g.position(width-100, 30);
    // slider_b.position(width-100, 50);
    resizeCanvas(windowWidth, windowHeight);

    updateUI();
    
    fc_button.hide();
  }
}

//save drawing-----------------------------------------------

function saveDrawing() {
  let data = strokes.map((s) => ({
    col: [red(s.col), green(s.col), blue(s.col), alpha(s.col)],
    size: s.size,
    jitter: s.jitter,
    fill: s.fill,
    points: s.points,
  }));

  saveJSON(data, "drawing.json");
}

function loadDrawing(file) {
  let data = file.data;

  strokes = [];

  for (let s of data) {
    let col = color(s.col[0], s.col[1], s.col[2], s.col[3]);
    let newStroke = new ArtLine(col, s.size, s.jitter, s.fill);

    for (let p of s.points) {
      newStroke.addPoint(p.x, p.y, p.z);
    }

    strokes.push(newStroke);
  }
}

//-----------------line object-------------------------------

class ArtLine {
  constructor(col, size, jitter, solid) {
    this.col = col;
    this.size = size;
    this.points = [];
    this.jitter = jitter;
    this.fill = solid;
  }

  addPoint(x, y, z) {
    this.points.push({ x: x, y: y, z: z });
  }
  draw() {
    stroke(this.col);
    strokeWeight(this.size);

    if (this.fill == false) {
      noFill();
    } else if (this.fill == true) {
      fill(this.col);
    }
    // random(-jitter,jitter)
    beginShape();
    for (let p of this.points) {
      if (this.jitter == 0) {
        vertex(p.x, p.y, p.z);
      } else {
        let rand = random(-this.jitter, this.jitter);
        vertex(p.x + rand, p.y + rand, p.z);
      }
    }
    endShape();
  }
}
