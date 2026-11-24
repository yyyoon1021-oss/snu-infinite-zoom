(function () {
  'use strict';

  var S = window.SNUScenes;
  var D = window.SNUDraw;
  // 다음 장면은 화면 폭의 약 6%짜리 소품 속에 있어서, 장면 하나를 지나갈 때마다 약 17배 확대된다.
  var W = S.W, DEPTH = 3, LITE_FROM = 2, AUTO_SPEED = 0.06; // 초당 t 증가량 (약 17초에 한 장면)

  var svg = document.getElementById('stage');
  var defsHost = document.getElementById('scenes');
  var camera = document.getElementById('camera');
  var labelEl = document.getElementById('label');
  var playBtn = document.getElementById('play');

  var style = window.SNU_STYLE || 'flat';
  var level = 0, t = 0, targetT = 0, playing = true, lastLabel = -1, lastTime = performance.now();

  function mount() {
    var sc = S.build(style), lite = S.build('lite'), html = '', i;
    for (i = 0; i < sc.length; i++) {
      html += '<g id="b' + i + '">' + sc[i].back + '</g><g id="f' + i + '">' + sc[i].front + '</g>';
      html += '<g id="lb' + i + '">' + lite[i].back + '</g><g id="lf' + i + '">' + lite[i].front + '</g>';
    }
    defsHost.innerHTML = D.gradients + html;
    document.body.className = style;
    buildChain();
  }

  function rec(k) {
    var i = (level + k) % 4, p = S.portals[i], pre = k >= LITE_FROM ? 'l' : '';
    if (k === DEPTH) return '<use href="#' + pre + 'b' + i + '"/><use href="#' + pre + 'f' + i + '"/>';
    return '<use href="#' + pre + 'b' + i + '"/>' +
      '<g clip-path="url(#clipAll)" transform="translate(' + p.x + ' ' + p.y + ') scale(' + (p.w / W) + ')">' + rec(k + 1) + '</g>' +
      '<use href="#' + pre + 'f' + i + '"/>';
  }

  function buildChain() { camera.innerHTML = rec(0); }

  function applyCamera() {
    var p = S.portals[level], s = p.w / W;
    var fx = p.x / (1 - s), fy = p.y / (1 - s), z = Math.pow(s, -t);
    camera.setAttribute('transform', 'translate(' + fx + ' ' + fy + ') scale(' + z + ') translate(' + (-fx) + ' ' + (-fy) + ')');
    var shown = t < 0.5 ? level : (level + 1) % 4;
    if (shown !== lastLabel) { lastLabel = shown; labelEl.textContent = S.names[shown]; }
  }

  function wrap() {
    var changed = false;
    while (t >= 1) { level = (level + 1) % 4; t -= 1; targetT -= 1; changed = true; }
    while (t < 0) { level = (level + 3) % 4; t += 1; targetT += 1; changed = true; }
    if (changed) buildChain();
  }

  function frame(now) {
    var dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
    lastTime = now;
    if (playing) targetT += AUTO_SPEED * dt;
    t += (targetT - t) * (1 - Math.exp(-10 * dt));
    wrap();
    applyCamera();
    requestAnimationFrame(frame);
  }

  // 입력: 휠 / 드래그 / 키보드
  window.addEventListener('wheel', function (e) { e.preventDefault(); targetT -= e.deltaY * 0.0012; }, { passive: false });
  var dragY = null;
  svg.addEventListener('pointerdown', function (e) { dragY = e.clientY; svg.setPointerCapture(e.pointerId); });
  svg.addEventListener('pointermove', function (e) { if (dragY !== null) { targetT += (dragY - e.clientY) * 0.0025; dragY = e.clientY; } });
  svg.addEventListener('pointerup', function () { dragY = null; });
  window.addEventListener('keydown', function (e) {
    if (e.key === ' ') { e.preventDefault(); toggle(); }
    else if (e.key === 'ArrowUp' || e.key === '+') targetT += 0.08;
    else if (e.key === 'ArrowDown' || e.key === '-') targetT -= 0.08;
  });

  function toggle() { playing = !playing; playBtn.textContent = playing ? '일시정지' : '재생'; }
  playBtn.addEventListener('click', toggle);

  mount();
  // ?scene=2&t=0.4 처럼 열면 그 지점에서 멈춘 채로 보여준다 (확인용)
  var qs = new URLSearchParams(location.search);
  if (qs.has('scene')) { level = +qs.get('scene') % 4; t = targetT = +(qs.get('t') || 0); playing = false; buildChain(); }
  requestAnimationFrame(frame);

  // 디버그/검증용
  window.SNUZoom = { setT: function (l, v) { level = l; t = v; targetT = v; playing = false; buildChain(); } };
})();
