(function () {
  'use strict';

  var data = window.SNUZoomScenes;
  var W = data.width;
  var H = data.height;
  var canvas = document.getElementById('view');
  var ctx = canvas.getContext('2d');
  var composite = document.createElement('canvas');
  composite.width = W;
  composite.height = H;
  var compositeCtx = composite.getContext('2d');
  compositeCtx.imageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  var level = 0;
  var t = 0;
  var targetT = 0;
  var lastTime = performance.now();
  var AUTO_SPEED = 1 / 15;

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(window.innerWidth * dpr));
    canvas.height = Math.max(1, Math.round(window.innerHeight * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }

  function drawNested(sceneIndex, depth, x, y, width, height) {
    compositeCtx.drawImage(data.scenes[sceneIndex], x, y, width, height);
    var portal = data.portals[sceneIndex];
    var nextX = x + width * portal.x / W;
    var nextY = y + height * portal.y / H;
    var nextW = width * portal.w / W;
    var nextH = height * portal.h / H;
    if (depth < 12 && nextW >= 2 && nextH >= 2) {
      drawNested((sceneIndex + 1) % 4, depth + 1, nextX, nextY, nextW, nextH);
    }
  }

  function render() {
    compositeCtx.clearRect(0, 0, W, H);
    drawNested(level, 0, 0, 0, W, H);
    var portal = data.portals[level];
    var s = portal.w / W;
    var power = Math.pow(s, t);
    var fixedX = portal.x / (1 - s);
    var fixedY = portal.y / (1 - s);
    var viewW = W * power;
    var viewH = H * power;
    var sourceX = fixedX * (1 - power);
    var sourceY = fixedY * (1 - power);
    var screenW = window.innerWidth;
    var screenH = window.innerHeight;
    var scale = Math.max(screenW / viewW, screenH / viewH);
    var drawW = viewW * scale;
    var drawH = viewH * scale;
    ctx.clearRect(0, 0, screenW, screenH);
    ctx.drawImage(composite, sourceX, sourceY, viewW, viewH, (screenW - drawW) / 2, (screenH - drawH) / 2, drawW, drawH);
  }

  function wrapLevels() {
    while (t >= 1) {
      level = (level + 1) % 4;
      t -= 1;
      targetT -= 1;
    }
    while (t < 0) {
      level = (level + 3) % 4;
      t += 1;
      targetT += 1;
    }
  }

  function frame(now) {
    var elapsed = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
    lastTime = now;
    targetT += AUTO_SPEED * elapsed;
    var follow = 1 - Math.exp(-12 * elapsed);
    t += (targetT - t) * follow;
    wrapLevels();
    render();
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('wheel', function (event) {
    event.preventDefault();
    var direction = event.deltaY < 0 ? 1 : -1;
    targetT += direction * 0.08;
  }, { passive: false });

  resize();
  render();
  requestAnimationFrame(frame);
}());
