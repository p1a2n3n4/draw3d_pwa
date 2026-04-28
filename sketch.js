let isPickingColor = false;
let isEyedropper = false;



let strokes = [];
let redo_actions = [];
let isRendering = false;
let currentStroke = null;
let touchesPrev = 0;

let picker;
let currentColor;
let show_color_picker = false;

// for undo
let touchStartTime = 0;
let undoDelay = 200; // milliseconds (0.5 sec)

//ortho cam variable
let zoom = 1;
let panX = 0;
let panY = 0;

let lastDist = 0;
let lastCenter = null;

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
let col_prev;
let eraser_button 

//------------button for exports/import
let fileInput;
let save_button;

let export_button;
let turn_around;

let render_button;

let depthLabel;

let slider_a;
let slider_s;
let slider_noise;
let slider_tweak;

let create_ui = true;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight, WEBGL);

  frameRate(fps);

  // Create  buttons------------------------------------
  view_button = 
    createButton('<span class="material-symbols-outlined">stylus</span>');

  minus_button = createButton("-");

  add_button = createButton("+");

  undo_button = 
    createButton('<span class="material-symbols-outlined">undo</span>');

  bg = color(20, 20, 20);
  bg_button = createButton('<span class="material-symbols-outlined">format_color_fill</span>');

  side_view = createButton(side[side_index]);

  fc_button = createButton("fullscreen");

  prev_button = createButton("preview");

  fill_button = createButton('<span class="material-symbols-outlined">gesture</span>');

  ui_button = createButton('<span class="material-symbols-outlined">visibility</span>');

  col_prev = createButton(" ");
  col_prev.class("preview");

  picker = new iro.ColorPicker("#picker", {
  width: width/3,
  color: "#ffffff"
});

// store as p5 color immediately
currentColor = color(255, 255, 255);

picker.on("color:change", (c) => {
  currentColor = color(c.rgb.r, c.rgb.g, c.rgb.b);

  // keep your r,g,b in sync (since you use them everywhere)
  r = c.rgb.r;
  g = c.rgb.g;
  b = c.rgb.b;
});
  
  hidePicker()
  
  
  eyedropper_button = createButton('<span class="material-symbols-outlined">colorize</span>');
  
  eraser_button = createButton('<span class="material-symbols-outlined">ink_eraser</span>');
   


  //-----export ui-----

  export_button = createButton('<span class="material-symbols-outlined">photo_camera</span>');

  turn_around = createButton(animations[anim_index]);

  render_button = createButton("render");

  //import------

  import_button = createButton("import");

  save_button = createButton("save");
  fileInput = createFileInput(loadDrawing);

  //--------------create sliders------------------


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
   print(isErasing)
  
 if (isEyedropper && mouseIsPressed) {
  pickColor(mouseX, mouseY);
}
  //print(height)
   
  tweak = slider_tweak.value();
  finalDepth = depth + tweak;
  depthLabel.html("Depth: " + finalDepth / snapping);
  
 

  r = red(currentColor)
  g = green(currentColor)
  b = blue(currentColor)
  a = slider_a.value();
  s = slider_s.value();
  sketchy = slider_noise.value();

   col_prev.elt.style.setProperty("--r", r);
  col_prev.elt.style.setProperty("--g", g);
   col_prev.elt.style.setProperty("--b", b);

  //print(strokes.length)
  background(bg);

  //switch between orthographic and perspective
  if (move == false) {
    let w = width / 2 / zoom;
    let h = height / 2 / zoom;
    ortho(-w, w, -h, h, 0.1, 20000);
    //scale(zoom);
    translate(panX, panY);

    if (ui == true) {
    }
    //------------cursor
    push();
    let cursor_pos = getMouseWorldAtDepth();
    noFill();
    stroke(r, g, b, a - 50);
    strokeWeight(5);
    ellipse(cursor_pos.x, cursor_pos.y, s);
    pop();
  } else if (move == true) {
    zoom = 1;
    panX = 0;
    panY = 0;

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


//----------------undo/redo

function touchStarted() {
  touchStartTime = millis(); // record the moment the touch begins
  // store previous touch count if you need it
  touchesPrev = touches.length;
  //store current touch input on start
}

function touchEnded() {
  let touchDuration = millis() - touchStartTime;
  //tap undo +timer
  if (touchDuration < undoDelay && touchesPrev === 2 && move === false ) {
    undo();
  }
  //tap redo plus timer
  if (touchDuration < undoDelay && touchesPrev === 3 && move === false) {
    redo();
  }

  // reset timer
  touchStartTime = 0;

  lastDist = 0;
  lastCenter = null;
  currentStroke = null;
  
  
}
//---------------------draw line----------------------------
function touchMoved() {
  // ---------- PINCH + PAN ----------
  if (touches.length === 2 && move === false ) {
    let t1 = touches[0];
    let t2 = touches[1];

    // distance between fingers (for zoom)
    let d = dist(t1.x, t1.y, t2.x, t2.y);

    // midpoint (for pan)
    let cx = (t1.x + t2.x) / 2;
    let cy = (t1.y + t2.y) / 2;
    
    
    


    if (lastDist !== 0) {
      // ----- ZOOM -----
      let zoomFactor = d / lastDist;
      zoom *= zoomFactor;

      // clamp zoom (important)
      zoom = constrain(zoom, 0.2, 5);

      // ----- PAN -----
      let dx = cx - lastCenter.x;
      let dy = cy - lastCenter.y;

      panX += dx / zoom; // divide by zoom = consistent movement
      panY += dy / zoom;
    }

    lastDist = d;
    lastCenter = createVector(cx, cy);

    return false;
  }

  if (
  move == false &&
  (!isPickingColor) &&
  (!erase)  &&
  (touches.length !== 2) &&
  (touches.length !== 3)
) {
  let p = getMouseWorldAtDepth(finalDepth);
    
    //-------eraser---------

  if (isErasing) {
    eraseAtPoint(p);
    return false;
  }

  // -------- DRAW --------
  if (!currentStroke) {
    currentStroke = new ArtLine(color(r, g, b, a), s, sketchy, stroke_fill);
    strokes.push(currentStroke);
    redo_actions = [];
  }

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
    view_button.html('<span class="material-symbols-outlined">3d_rotation</span>');
  } else if (move == true) {
    move = false;
    view_button.html('<span class="material-symbols-outlined">stylus</span>');
    resetMatrix();
    resetOrbit();
  }
  //view_button.html(view_button_text);
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
    redo_actions.push(strokes[strokes.length - 1]);
    strokes.pop(); print(redo_actions); 
  } if (redo_actions.length > 5) { 
    redo_actions.shift(); } 
}

//--------------redo----------------------
function redo() {
  if (redo_actions.length > 0) {
    strokes.push(redo_actions.pop()); } 
}

//----------change bg------------

function apply_bg() {
  bg = color(r, g, b);
}

//------------------remap mouse----------------

function getMouseWorldAtDepth(zPlane) {
  let mx = (mouseX - width / 2) / zoom - panX;
  let my = (mouseY - height / 2) / zoom - panY;

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
  
  
if (key === 'e' || key === 'E') {
  isErasing = !isErasing;
  console.log(isErasing);
}

  
    // eyedropper
  if (key === 'i') {
    pickColor(mouseX, mouseY);
  }
  
  
  
  // For Windows/Linux: Ctrl + Z
  if (key === "z" && keyIsDown(CONTROL)) {
    erase = true;
    undo();
    erase = false;
  }

  if (key === "y" && keyIsDown(CONTROL)) {
    erase = true;
    redo();
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
    fill_button.html('<span class="material-symbols-outlined">stroke_full</span>')
  } else if (stroke_fill == true) {
    stroke_fill = false;
    fill_button.style("background-color", "rgb(92,92,92)");
    fill_button.html('<span class="material-symbols-outlined">gesture</span>')
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

    if (!fullscreen()) {
      fc_button.hide();
    }
  } else if (state == true) {
    turn_around.show();

    render_button.show();

    save_button.show();
    import_button.show();

    if (!fullscreen()) {
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


//---------for the ui button--------------------
function ui_visible() {
  hide_ui();
  if (ui == true) {
    ui = false;
    ui_button.style("background-color", "#4949494F");
    ui_button.html('<span class="material-symbols-outlined">visibility_off</span>');
    
  } else if (ui == false) {
    ui = true;
    ui_button.style("background-color", "rgb(92,92,92)");
    ui_button.html('<span class="material-symbols-outlined">visibility</span>');
  }
  hide_ui(ui);
  updateUI();
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
