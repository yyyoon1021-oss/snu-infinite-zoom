(function () {
  'use strict';

  // Two physical pixels per design unit make the pixel grid markedly denser.
  var DETAIL_SCALE = 4;
  var W = 320 * DETAIL_SCALE;
  var H = 180 * DETAIL_SCALE;
  var portals = [
    { x: 832, y: 356, w: 256, h: 144 }, // green bus window
    { x: 800, y: 164, w: 256, h: 144 }, // framed picture
    { x: 924, y: 220, w: 256, h: 144 }, // pond-side building window
    { x: 512, y: 392, w: 256, h: 144 }  // laptop screen
  ];

  function rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function paintPortal(index) {
    var p = portals[index];
    return { x: p.x / DETAIL_SCALE, y: p.y / DETAIL_SCALE, w: p.w / DETAIL_SCALE, h: p.h / DETAIL_SCALE };
  }

  function texture(ctx, x, y, w, h, color, gap) {
    for (var row = 0; row < h; row += gap) {
      for (var col = 0; col < w; col += gap) {
        if (((col / gap * 5 + row / gap * 3) % 7) < 3) rect(ctx, x + col, y + row, 0.5, 0.5, color);
      }
    }
  }

  function gradientRect(ctx, x, y, w, h, from, to, vertical) {
    var g = vertical ? ctx.createLinearGradient(x, y, x, y + h) : ctx.createLinearGradient(x, y, x + w, y);
    g.addColorStop(0, from);
    g.addColorStop(1, to);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }

  function strokePath(ctx, points, color, width, closed) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (var n = 1; n < points.length; n++) ctx.lineTo(points[n][0], points[n][1]);
    if (closed) ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function outlinedEllipse(ctx, x, y, rx, ry, fill, line) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = line;
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }

  function cloud(ctx, x, y) {
    rect(ctx, x + 4, y, 16, 4, '#fffdf1');
    rect(ctx, x, y + 4, 28, 5, '#fffdf1');
    rect(ctx, x + 7, y - 4, 9, 4, '#fffdf1');
    rect(ctx, x + 20, y + 3, 12, 5, '#fffdf1');
    rect(ctx, x + 3, y + 9, 22, 2, '#dceeff');
  }

  function tree(ctx, x, y, scale, leaf) {
    var s = scale;
    rect(ctx, x + 7 * s, y + 25 * s, 4 * s, 24 * s, '#70442d');
    rect(ctx, x + 1 * s, y + 12 * s, 16 * s, 18 * s, leaf);
    rect(ctx, x + 5 * s, y + 5 * s, 11 * s, 13 * s, leaf);
    rect(ctx, x - 3 * s, y + 17 * s, 21 * s, 10 * s, leaf);
    rect(ctx, x + 2 * s, y + 10 * s, 7 * s, 5 * s, '#78bd52');
  }

  function drawGate(ctx) {
    // A large, high-contrast '샤' silhouette, read as the SNU gate mark.
    // Its bright V and double crossbar sit above the bus roof so the mark
    // remains immediately recognizable in the opening composition.
    rect(ctx, 112, 31, 13, 84, '#3e515b'); rect(ctx, 117, 31, 8, 80, '#d8e3e0');
    rect(ctx, 211, 31, 13, 84, '#3c4e58'); rect(ctx, 211, 31, 8, 80, '#9fafb1');
    rect(ctx, 127, 29, 9, 8, '#e1ebe6'); rect(ctx, 135, 36, 9, 8, '#d4e0dc'); rect(ctx, 143, 43, 9, 8, '#c7d5d3'); rect(ctx, 151, 50, 9, 8, '#b9cbca'); rect(ctx, 159, 57, 9, 8, '#e4eeea');
    rect(ctx, 200, 29, 9, 8, '#82969b'); rect(ctx, 192, 36, 9, 8, '#82969b'); rect(ctx, 184, 43, 9, 8, '#82969b'); rect(ctx, 176, 50, 9, 8, '#82969b'); rect(ctx, 168, 57, 9, 8, '#82969b');
    rect(ctx, 140, 67, 57, 8, '#edf5ef'); rect(ctx, 140, 76, 57, 4, '#aebfc0');
    rect(ctx, 140, 80, 9, 21, '#aebfc0'); rect(ctx, 188, 80, 9, 21, '#7d9095');
    rect(ctx, 105, 112, 126, 5, '#40525a'); rect(ctx, 110, 117, 116, 2, '#aab9b5');
  }

  function drawScene1(ctx) {
    var p = paintPortal(0);
    rect(ctx, 0, 0, W, 34, '#72b5e6');
    rect(ctx, 0, 34, W, 30, '#8cc9ed');
    rect(ctx, 0, 64, W, 29, '#a9d9ed');
    rect(ctx, 0, 93, W, 22, '#c4e7ef');
    gradientRect(ctx, 0, 0, 320, 115, '#59a7dc', '#d9f0ed', true);
    for (var skyLine = 0; skyLine < 16; skyLine++) rect(ctx, 0, 6 + skyLine * 3, W, 0.5, skyLine < 8 ? '#7ebce8' : '#9cd1ec');
    cloud(ctx, 25, 27); cloud(ctx, 234, 21); cloud(ctx, 275, 45);
    // two Gwanak Mountain ridges
    ctx.fillStyle = '#75a885';
    ctx.beginPath(); ctx.moveTo(0, 91); ctx.lineTo(28, 73); ctx.lineTo(58, 80); ctx.lineTo(90, 61); ctx.lineTo(123, 79); ctx.lineTo(157, 67); ctx.lineTo(187, 82); ctx.lineTo(220, 61); ctx.lineTo(254, 80); ctx.lineTo(286, 70); ctx.lineTo(320, 85); ctx.lineTo(320, 117); ctx.lineTo(0, 117); ctx.fill();
    ctx.fillStyle = '#397b57';
    ctx.beginPath(); ctx.moveTo(0, 102); ctx.lineTo(39, 84); ctx.lineTo(70, 96); ctx.lineTo(108, 78); ctx.lineTo(145, 95); ctx.lineTo(178, 78); ctx.lineTo(216, 96); ctx.lineTo(254, 82); ctx.lineTo(290, 97); ctx.lineTo(320, 87); ctx.lineTo(320, 120); ctx.lineTo(0, 120); ctx.fill();
    texture(ctx, 3, 87, 110, 23, '#4e8c62', 3); texture(ctx, 220, 83, 96, 27, '#4e8c62', 3);
    drawGate(ctx);
    rect(ctx, 0, 116, W, 17, '#d2d0c7');
    rect(ctx, 0, 133, W, 47, '#70777a');
    rect(ctx, 0, 137, W, 3, '#f7e6a1');
    rect(ctx, 0, 161, W, 4, '#eee7d8');
    for (var curb = 0; curb < 18; curb++) rect(ctx, curb * 19, 116, 16, 1, curb % 2 ? '#b7b7b1' : '#e6e3d9');
    texture(ctx, 0, 143, 320, 34, '#848c8c', 4);
    tree(ctx, 14, 86, 1, '#2d7d4f'); tree(ctx, 285, 83, 1, '#2f8050'); tree(ctx, 302, 91, 1, '#2b6e48');
    // foreground bus
    gradientRect(ctx, 27, 77, 252, 61, '#24936a', '#075947', true);
    rect(ctx, 35, 82, 231, 6, '#36a56e');
    rect(ctx, 31, 78, 246, 2, '#d3e8c8'); rect(ctx, 31, 80, 246, 1, '#087151');
    rect(ctx, 27, 116, 252, 16, '#0b5c48');
    // Four aligned bus windows; the fourth is the portal.
    gradientRect(ctx, 35, 89, 64, 36, '#376f89', '#112e44', true);
    gradientRect(ctx, 103, 89, 48, 36, '#376f89', '#112e44', true);
    gradientRect(ctx, 155, 89, 49, 36, '#376f89', '#112e44', true);
    rect(ctx, 39, 92, 56, 2, '#3f7892'); rect(ctx, 107, 92, 40, 2, '#3f7892'); rect(ctx, 160, 92, 40, 2, '#3f7892');
    rect(ctx, 38, 120, 58, 2, '#0e3e55'); rect(ctx, 106, 120, 42, 2, '#0e3e55'); rect(ctx, 159, 120, 42, 2, '#0e3e55');
    // Match the normal green window dividers; only the inside becomes the portal.
    rect(ctx, p.x - 4, p.y, p.w + 8, p.h, '#137a58');
    gradientRect(ctx, p.x, p.y, p.w, p.h, '#376f89', '#112e44', true);
    rect(ctx, 231, 132, 36, 4, '#d8e5c5');
    rect(ctx, 52, 138, 31, 8, '#26383d'); rect(ctx, 224, 138, 31, 8, '#26383d');
    rect(ctx, 62, 142, 15, 5, '#151c20'); rect(ctx, 231, 142, 15, 5, '#151c20');
    rect(ctx, 39, 84, 58, 1, '#72c98d'); rect(ctx, 108, 84, 40, 1, '#72c98d'); rect(ctx, 32, 124, 168, 0.5, '#49ac77');
    rect(ctx, 83, 122, 2, 8, '#bed8ab'); rect(ctx, 86, 122, 1, 8, '#094c3c'); rect(ctx, 267, 123, 7, 5, '#ffd770'); rect(ctx, 269, 124, 4, 2, '#fff1ad');
    // Inked, hand-drawn vehicle contours: less blocky, closer to illustrated travel art.
    strokePath(ctx, [[28, 136], [28, 82], [36, 76], [265, 76], [279, 85], [279, 136]], '#173e3f', 1.4, false);
    strokePath(ctx, [[35, 88], [266, 88]], '#dce9c5', 0.7, false);
    strokePath(ctx, [[34, 121], [266, 121]], '#064638', 1, false);
    outlinedEllipse(ctx, 68, 141, 15, 9, '#243139', '#15272c'); outlinedEllipse(ctx, 239, 141, 15, 9, '#243139', '#15272c');
    outlinedEllipse(ctx, 68, 141, 7, 4, '#71808a', '#19252b'); outlinedEllipse(ctx, 239, 141, 7, 4, '#71808a', '#19252b');
    strokePath(ctx, [[42, 97], [60, 92], [87, 92]], '#8dc2d0', 0.8, false); strokePath(ctx, [[112, 97], [126, 92], [145, 92]], '#8dc2d0', 0.8, false);
    strokePath(ctx, [[0, 165], [53, 164], [108, 165], [166, 164], [232, 165], [320, 164]], '#f4efdc', 0.8, false);
  }

  function desk(ctx, x, y) {
    rect(ctx, x, y, 58, 6, '#7b4a2e'); rect(ctx, x + 4, y + 6, 4, 17, '#543323'); rect(ctx, x + 49, y + 6, 4, 17, '#543323');
    rect(ctx, x + 10, y - 10, 3, 10, '#604332'); rect(ctx, x + 9, y - 12, 6, 3, '#f7d777'); rect(ctx, x + 7, y - 15, 10, 3, '#ffeaa1');
  }

  function drawScene2(ctx) {
    var p = paintPortal(1);
    gradientRect(ctx, 0, 0, 320, 112, '#f2d697', '#bd824f', true); gradientRect(ctx, 0, 112, 320, 68, '#a96d46', '#623b2d', true); rect(ctx, 0, 0, W, 12, '#f0d18d');
    for (var wallShade = 0; wallShade < 18; wallShade++) rect(ctx, 0, 15 + wallShade * 4, W, 0.5, '#d4a96d');
    rect(ctx, 0, 111, W, 4, '#613d2a');
    // bookcase
    rect(ctx, 20, 20, 132, 78, '#69442d'); rect(ctx, 25, 25, 122, 5, '#3d2b25'); rect(ctx, 25, 50, 122, 5, '#3d2b25'); rect(ctx, 25, 75, 122, 5, '#3d2b25');
    var books = ['#c8453a', '#e0ba47', '#377faf', '#6f9d57', '#8e4c87', '#db7650'];
    for (var shelf = 0; shelf < 3; shelf++) for (var i = 0; i < 17; i++) rect(ctx, 27 + i * 7, 31 + shelf * 25 - (i % 3), 4 + (i % 2), 18 + (i % 3), books[(i + shelf) % books.length]);
    for (var bookLine = 0; bookLine < 34; bookLine++) rect(ctx, 29 + bookLine * 3.45, 37 + (bookLine % 3) * 25, 0.5, 10, '#f2d287');
    // golden framed portal
    rect(ctx, p.x - 8, p.y - 8, p.w + 16, p.h + 16, '#6c431d'); rect(ctx, p.x - 6, p.y - 6, p.w + 12, p.h + 12, '#e8bb45'); rect(ctx, p.x - 3, p.y - 3, p.w + 6, p.h + 6, '#fff0a4'); rect(ctx, p.x, p.y, p.w, p.h, '#805d45');
    desk(ctx, 35, 127); desk(ctx, 126, 145); desk(ctx, 220, 125); desk(ctx, 245, 159);
    rect(ctx, 0, 165, W, 3, '#7a4a34'); rect(ctx, 0, 176, W, 2, '#c98a56');
    for (var grain = 0; grain < 13; grain++) rect(ctx, 8 + grain * 24, 154 + (grain % 4) * 5, 15, 0.5, '#bd7c4d');
    for (var plank = 0; plank < 8; plank++) rect(ctx, 0, 118 + plank * 8, 320, 0.5, '#71452f');
    strokePath(ctx, [[0, 112], [320, 112]], '#4d3026', 1.2, false);
    for (var floorLine = 0; floorLine < 9; floorLine++) strokePath(ctx, [[160, 112], [floorLine * 42 - 20, 180]], '#714432', 0.45, false);
    strokePath(ctx, [[18, 19], [153, 19], [153, 99], [18, 99]], '#3f2b24', 1.2, true);
    strokePath(ctx, [[p.x - 8, p.y - 8], [p.x + p.w + 8, p.y - 8], [p.x + p.w + 8, p.y + p.h + 8], [p.x - 8, p.y + p.h + 8]], '#5d381b', 1.3, true);
  }

  function maple(ctx, x, y, color) {
    rect(ctx, x + 13, y + 29, 5, 39, '#6d4230');
    rect(ctx, x + 3, y + 9, 26, 28, color); rect(ctx, x - 3, y + 18, 36, 14, color); rect(ctx, x + 8, y + 1, 17, 15, color);
    rect(ctx, x + 3, y + 12, 6, 5, '#f1a13e'); rect(ctx, x + 21, y + 21, 7, 5, '#d34b31');
    rect(ctx, x + 5, y + 7, 3, 3, '#f8b24a'); rect(ctx, x + 14, y + 15, 2, 2, '#a83f30'); rect(ctx, x + 24, y + 12, 2, 3, '#f6a33f');
  }

  function drawScene3(ctx) {
    var p = paintPortal(2);
    rect(ctx, 0, 0, W, H, '#f5ca91'); rect(ctx, 0, 57, W, 39, '#d6b071');
    // distant autumn trees
    maple(ctx, 18, 35, '#d95837'); maple(ctx, 52, 27, '#e87c35'); maple(ctx, 278, 24, '#c94334'); maple(ctx, 301, 38, '#e89739');
    // blue pond
    gradientRect(ctx, 31, 89, 215, 63, '#71b8ca', '#1b628f', true); rect(ctx, 38, 97, 201, 7, '#75b3c8'); rect(ctx, 54, 116, 170, 3, '#77abc1'); rect(ctx, 67, 137, 148, 4, '#6ca3bc');
    for (var water = 0; water < 11; water++) rect(ctx, 38 + (water % 5) * 38, 101 + water * 4, 19 + (water % 3) * 8, 0.5, water % 2 ? '#b4d8db' : '#296e99');
    rect(ctx, 45, 105, 25, 5, '#d8793b'); rect(ctx, 168, 127, 38, 5, '#d85636'); rect(ctx, 86, 143, 31, 3, '#e88a39');
    rect(ctx, 0, 152, W, 28, '#84734b'); rect(ctx, 0, 153, W, 5, '#b5a263');
    // pond-side building and framed window portal
    rect(ctx, 216, 29, 92, 76, '#a66e4d'); rect(ctx, 221, 36, 82, 7, '#e0b276'); rect(ctx, 221, 100, 82, 6, '#704a3d');
    for (var brickY = 0; brickY < 5; brickY++) for (var brickX = 0; brickX < 8; brickX++) rect(ctx, 223 + brickX * 10 + (brickY % 2) * 4, 45 + brickY * 10, 7, 0.5, '#c78a63');
    rect(ctx, p.x - 5, p.y - 5, p.w + 10, p.h + 10, '#5a4038'); rect(ctx, p.x - 3, p.y - 3, p.w + 6, p.h + 6, '#e6d3a5'); rect(ctx, p.x, p.y, p.w, p.h, '#32465a');
    rect(ctx, p.x + 30, p.y - 3, 4, p.h + 6, '#e6d3a5'); rect(ctx, p.x - 3, p.y + 16, p.w + 6, 4, '#e6d3a5');
    // bench
    rect(ctx, 18, 137, 63, 7, '#71482e'); rect(ctx, 23, 145, 5, 16, '#4c342a'); rect(ctx, 70, 145, 5, 16, '#4c342a'); rect(ctx, 15, 132, 67, 4, '#b27b42');
    maple(ctx, 129, 53, '#df6331'); maple(ctx, 168, 47, '#e37e33');
    for (var ripple = 0; ripple < 8; ripple++) rect(ctx, 48 + ripple * 20, 108 + (ripple % 3) * 11, 11, 0.5, '#b3d8dc');
    // Organic water lines and shoreline edges replace the rigid pond geometry.
    strokePath(ctx, [[31, 89], [79, 85], [133, 88], [190, 85], [246, 89]], '#254f69', 1.1, false);
    strokePath(ctx, [[32, 152], [75, 156], [132, 153], [180, 157], [245, 152]], '#365b56', 1.1, false);
    strokePath(ctx, [[48, 104], [73, 101], [100, 104], [126, 102]], '#d2ecdf', 0.9, false);
    strokePath(ctx, [[99, 122], [130, 119], [167, 122], [200, 120]], '#d2ecdf', 0.8, false);
    strokePath(ctx, [[54, 138], [86, 135], [111, 138], [145, 136]], '#bbdfd8', 0.7, false);
    strokePath(ctx, [[216, 29], [307, 29], [307, 106], [216, 106]], '#69453a', 1.2, true);
    strokePath(ctx, [[p.x - 5, p.y - 5], [p.x + p.w + 5, p.y - 5], [p.x + p.w + 5, p.y + p.h + 5], [p.x - 5, p.y + p.h + 5]], '#4c3833', 1.1, true);
  }

  function student(ctx, x, y, shirt) {
    rect(ctx, x + 3, y, 5, 5, '#744a35'); rect(ctx, x + 1, y + 5, 9, 8, shirt); rect(ctx, x, y + 12, 5, 5, '#2f4657'); rect(ctx, x + 7, y + 12, 5, 5, '#2f4657');
  }

  function drawScene4(ctx) {
    var p = paintPortal(3);
    gradientRect(ctx, 0, 0, 320, 107, '#765ba0', '#ffc275', true);
    for (var sunset = 0; sunset < 16; sunset++) rect(ctx, 0, 11 + sunset * 4, W, 0.5, sunset < 7 ? '#bb76aa' : '#e98e76');
    rect(ctx, 27, 24, 47, 3, '#e6a6c3'); rect(ctx, 238, 40, 55, 4, '#f6bb87');
    // sloping grass
    ctx.fillStyle = '#5c914c'; ctx.beginPath(); ctx.moveTo(0, 100); ctx.lineTo(320, 82); ctx.lineTo(320, 180); ctx.lineTo(0, 180); ctx.fill();
    ctx.fillStyle = '#39743f'; ctx.beginPath(); ctx.moveTo(0, 132); ctx.lineTo(320, 106); ctx.lineTo(320, 180); ctx.lineTo(0, 180); ctx.fill();
    texture(ctx, 0, 124, 320, 55, '#4d8747', 3);
    rect(ctx, 0, 156, W, 24, '#28613b'); rect(ctx, 18, 126, 54, 24, '#df9f7a'); rect(ctx, 23, 130, 44, 16, '#f0b783');
    student(ctx, 35, 117, '#d3564c'); student(ctx, 54, 120, '#5969ac'); student(ctx, 84, 130, '#e6ba4b'); student(ctx, 102, 127, '#b25791');
    rect(ctx, 37, 123, 2, 1, '#e6b08b'); rect(ctx, 56, 126, 2, 1, '#e6b08b'); rect(ctx, 86, 136, 2, 1, '#e6b08b'); rect(ctx, 104, 133, 2, 1, '#e6b08b');
    // foreground mat and laptop, bezel left visible around portal
    rect(ctx, 97, 137, 135, 35, '#bc6d55'); rect(ctx, 103, 143, 123, 23, '#e1a174');
    rect(ctx, p.x - 7, p.y - 7, p.w + 14, p.h + 14, '#1a2230'); rect(ctx, p.x - 4, p.y - 4, p.w + 8, p.h + 8, '#536277'); rect(ctx, p.x, p.y, p.w, p.h, '#142332');
    rect(ctx, 118, 136, 84, 5, '#202c3c'); rect(ctx, 111, 141, 100, 5, '#5e6774'); rect(ctx, 118, 146, 86, 3, '#3b4552');
    for (var blade = 0; blade < 20; blade++) rect(ctx, 8 + blade * 15, 162 + (blade % 4) * 3, 1, 0.5, '#78af58');
    for (var key = 0; key < 16; key++) rect(ctx, 124 + (key % 8) * 9, 142 + Math.floor(key / 8) * 2, 6, 0.5, '#9daaba');
    // Loose pen-and-watercolour treatment for the sunset field.
    ctx.beginPath(); ctx.arc(270, 58, 14, 0, Math.PI * 2); ctx.fillStyle = '#ffd69a'; ctx.globalAlpha = 0.75; ctx.fill(); ctx.globalAlpha = 1;
    for (var grass = 0; grass < 30; grass++) strokePath(ctx, [[6 + grass * 10, 159 + (grass % 3) * 5], [8 + grass * 10, 154 + (grass % 4) * 4]], '#8fc063', 0.45, false);
    strokePath(ctx, [[18, 149], [72, 149], [72, 174], [18, 174]], '#9f5145', 1, true);
    strokePath(ctx, [[97, 137], [232, 137], [232, 172], [97, 172]], '#874a45', 1.2, true);
    strokePath(ctx, [[p.x - 7, p.y - 7], [p.x + p.w + 7, p.y - 7], [p.x + p.w + 7, p.y + p.h + 7], [p.x - 7, p.y + p.h + 7]], '#172534', 1.3, true);
  }

  var painters = [drawScene1, drawScene2, drawScene3, drawScene4];
  var scenes = painters.map(function (paint) {
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var context = c.getContext('2d');
    context.imageSmoothingEnabled = false;
    context.scale(DETAIL_SCALE, DETAIL_SCALE);
    paint(context);
    return c;
  });

  window.SNUZoomScenes = { width: W, height: H, portals: portals, scenes: scenes };
}());
