

function hidePicker() {
 

  picker.base.style.display = "none";
  isPickingColor = false;
 
}

function showPicker() {
  
  picker.base.style.background ="rgba(30, 30, 30, 0.8)"; 
  
  picker.base.style.borderRadius = "10px";
  picker.base.style.padding = "10px";
  
 
 
  picker.base.style.display = "block";
  isPickingColor = true;
  
 
}



function toggle_color_picker() {
  show_color_picker = !show_color_picker;

  if (show_color_picker) {
    showPicker();
  } else {
    hidePicker() ;
  }
}




function pickColor(x, y) {
  loadPixels(); // important in WEBGL

  let c = get(x, y);

  let r = c[0];
  let g = c[1];
  let b = c[2];

  currentColor = color(r, g, b);

  isEyedropper = false; // exit after picking
  
  eyedropper_button.style("background-color", "rgb(92,92,92)");
}


function toggleDrop(){
  isEyedropper = !isEyedropper;

  if (isEyedropper) {
    eyedropper_button.style("background-color", "#FF9800");
    hidePicker();
    push()
    stroke(255)
   rect(mouseX,mouseY,50)
    pop()
  } else {
    hidePicker();
    cursor(ARROW);
  }
}

