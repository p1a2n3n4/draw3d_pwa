

let eraserSize = 20;
let isErasing = false;



function eraseAtPoint(pos) {
  let radius = eraserSize;

  for (let i = strokes.length - 1; i >= 0; i--) {
    let stroke = strokes[i];

    stroke.points = stroke.points.filter(pt => {

      let px, py, pz;

      // match the same transform used when ADDING points
      if (side[side_index] == "front") {
        px = pos.x;
        py = pos.y;
        pz = pos.z;

      } else if (side[side_index] == "side") {
        px = -pos.z;
        py = pos.y;
        pz = pos.x;

      } else if (side[side_index] == "top") {
        px = pos.x;
        py = pos.z;
        pz = -pos.y;
      }

      let d = dist(px, py, pz, pt.x, pt.y, pt.z);
      return d > radius;
    });

    if (stroke.points.length === 0) {
      strokes.splice(i, 1);
    }
  }
}

function toggle_eraser() {
  isErasing = !isErasing;
  
  
  if (isErasing) {
    eraser_button.style("background-color", "#FF9800");
  } else if (!isErasing) {
    eraser_button.style("background-color", "rgb(92,92,92)");
  }




}