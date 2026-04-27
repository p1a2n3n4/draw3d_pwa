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

  bg_button.position(width - 170, 20);
  bg_button.mousePressed(apply_bg);
  bg_button.class("Buttons");
  bg_button.size(40, 40);

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

  if (!fullscreen() & (ui == true) & (show_export == true)) {
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

  //color preview
  col_prev.position(width - 60, 15);
  col_prev.size(50, 50);
  col_prev.mousePressed(toggle_color_picker);
  
  //eyedropper
  eyedropper_button.position(width-120, 20);
  eyedropper_button.size(40,40);
eyedropper_button.class("Buttons");

eyedropper_button.mousePressed(() => {
  toggleDrop();
});
  
   eraser_button.position(width-50, 220);
  eraser_button.size(40,40);
  eraser_button.class("Buttons");
  eraser_button.mousePressed(() => {
  toggle_eraser();
});
  
 

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


  slider_a.style("transform-origin", "left center");
  slider_a.style("transform", "rotate(-90deg)");
  slider_a.position(20, height / 4 + 170);
  slider_a.style("transform", "rotate(-90deg)");
  slider_a.size(height / 4);
  slider_a.input(() => {
    erase = true;
  });
  slider_a.changed(() => (erase = false));
  slider_a.class("slide");

  slider_s.style("transform-origin", "left center");
  slider_s.style("transform", "rotate(-90deg)");
  slider_s.position(20, height / 2 + 180);
  slider_s.size(height / 4);
  slider_s.input(() => {
    erase = true;
  });
  slider_s.changed(() => (erase = false));
  slider_s.class("slide");

  if (height < 390) {
    slider_a.position(20, height / 4 + 190);
    slider_s.position(50, height / 4 + 190);
    slider_s.size(height / 3);
    slider_a.size(height / 3);
  }

  slider_noise.position(width / 2 - width / 8, height - 50);
  slider_noise.size(width / 4);
  slider_noise.input(() => {
    erase = true;
  });
  slider_noise.changed(() => (erase = false));
  //slider_noise.class("slide");
  slider_noise.style("accent-color", "#FF9800");

  slider_tweak.position(100, 90);
  slider_tweak.size(100);
  slider_tweak.input(() => {
    erase = true;
  });
  slider_tweak.changed(() => (erase = false));
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
    col_prev.hide();
    eyedropper_button.hide();
    eraser_button.hide();

    export_button.hide();
    import_button.hide();

    depthLabel.hide();

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
    col_prev.show();
    eyedropper_button.show();
    eraser_button.show();

    export_button.show();
    import_button.show();

    depthLabel.show();

    // slider_r.show();
    // slider_g.show();
    // slider_b.show();
    slider_a.show();
    slider_s.show();
    slider_noise.show();
    slider_tweak.show();
  }
}