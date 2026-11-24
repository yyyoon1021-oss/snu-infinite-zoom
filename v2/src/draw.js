/* 같은 장면 코드를 "flat"(깔끔한 벡터) / "watercolor"(수채화풍) 두 스타일로 SVG 문자열로 내보내는 작은 그리기 엔진 */
(function () {
  'use strict';

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function n2(v) { return Math.round(v * 100) / 100; }

  // 6자리 hex 색을 밝게(+) / 어둡게(-)
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255;
    function f(c) { return Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt))); }
    return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')';
  }

  /* ---------- 도형 -> 점 목록 (수채화 번짐용) ---------- */
  function rectPoints(x, y, w, h, r) {
    if (!r) return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    var pts = [], k, a;
    var cs = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]];
    cs.forEach(function (c) {
      for (k = 0; k <= 5; k++) {
        a = (c[2] + k * 18) * Math.PI / 180;
        pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]);
      }
    });
    return pts;
  }

  function ellPoints(cx, cy, rx, ry) {
    var n = Math.max(14, Math.min(44, Math.round((rx + ry) / 7))), pts = [], i, a;
    for (i = 0; i < n; i++) {
      a = i / n * Math.PI * 2;
      pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    }
    return pts;
  }

  function archPoints(x, y, w, h) {
    var r = w / 2, pts = [[x, y + h], [x, y + r]], i, a;
    for (i = 1; i < 12; i++) {
      a = Math.PI + i / 12 * Math.PI;
      pts.push([x + r + Math.cos(a) * r, y + r + Math.sin(a) * r]);
    }
    pts.push([x + w, y + r], [x + w, y + h]);
    return pts;
  }

  function densify(pts, maxSeg, closed) {
    var out = [], n = pts.length, i, a, b, d, k, m;
    for (i = 0; i < (closed ? n : n - 1); i++) {
      a = pts[i]; b = pts[(i + 1) % n];
      d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      m = Math.max(1, Math.ceil(d / maxSeg));
      for (k = 0; k < m; k++) out.push([a[0] + (b[0] - a[0]) * k / m, a[1] + (b[1] - a[1]) * k / m]);
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  }

  function jitter(pts, amp, rng) {
    return pts.map(function (p) { return [p[0] + (rng() - 0.5) * 2 * amp, p[1] + (rng() - 0.5) * 2 * amp]; });
  }

  // Catmull-Rom -> cubic bezier (부드러운 손그림 곡선)
  function smooth(p, closed) {
    var n = p.length, d = 'M' + n2(p[0][0]) + ' ' + n2(p[0][1]), i, p0, p1, p2, p3, cnt = closed ? n : n - 1;
    function at(j) { return closed ? p[(j + n) % n] : p[Math.max(0, Math.min(n - 1, j))]; }
    for (i = 0; i < cnt; i++) {
      p0 = at(i - 1); p1 = at(i); p2 = at(i + 1); p3 = at(i + 2);
      d += 'C' + n2(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + n2(p1[1] + (p2[1] - p0[1]) / 6) + ' ' +
        n2(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + n2(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + n2(p2[0]) + ' ' + n2(p2[1]);
    }
    return d + (closed ? 'Z' : '');
  }

  /* ---------- Painter ---------- */
  function Painter(style, seed) {
    this.wc = style === 'watercolor';
    this.lite = style === 'lite'; // 깊이 중첩된 아주 작은 장면용: 플랫 + 작은 도형/글자/선 생략
    this.rng = mulberry32(seed || 1);
    this.out = [];
  }

  function bbox(pts) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach(function (p) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    return { w: x1 - x0, h: y1 - y0 };
  }

  Painter.prototype.shape = function (kind, a, fill, opt) {
    opt = opt || {};
    var op = opt.op == null ? 1 : opt.op;
    var isUrl = fill.indexOf('url') === 0;
    var o = this.out, rng = this.rng, pts;

    if (this.lite) {
      var bw, bh;
      if (kind === 'rect' || kind === 'arch') { bw = a.w; bh = a.h; }
      else if (kind === 'ell') { bw = a.rx * 2; bh = a.ry * 2; }
      else { var bb0 = bbox(a.pts); bw = bb0.w; bh = bb0.h; }
      if (Math.min(bw, bh) < 16) return this;
    }

    if (!this.wc) {
      var common = ' fill="' + fill + '"' + (op < 1 ? ' fill-opacity="' + op + '"' : '');
      if (kind === 'rect') o.push('<rect x="' + a.x + '" y="' + a.y + '" width="' + a.w + '" height="' + a.h + '"' + (a.r ? ' rx="' + a.r + '"' : '') + common + '/>');
      else if (kind === 'ell') o.push('<ellipse cx="' + a.cx + '" cy="' + a.cy + '" rx="' + a.rx + '" ry="' + a.ry + '"' + common + '/>');
      else if (kind === 'poly') o.push('<polygon points="' + a.pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '"' + common + '/>');
      else if (kind === 'arch') {
        var r = a.w / 2;
        o.push('<path d="M' + a.x + ' ' + (a.y + a.h) + 'L' + a.x + ' ' + (a.y + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (a.x + a.w) + ' ' + (a.y + r) + 'L' + (a.x + a.w) + ' ' + (a.y + a.h) + 'Z"' + common + '/>');
      }
      return this;
    }

    if (kind === 'rect') pts = rectPoints(a.x, a.y, a.w, a.h, a.r);
    else if (kind === 'ell') pts = ellPoints(a.cx, a.cy, a.rx, a.ry);
    else if (kind === 'arch') pts = archPoints(a.x, a.y, a.w, a.h);
    else pts = a.pts;
    pts = densify(pts, 34, true);
    var bb = bbox(pts);
    var amp = opt.amp != null ? opt.amp : Math.max(0.7, Math.min(4.5, Math.sqrt(bb.w * bb.h) * 0.016));

    o.push('<path d="' + smooth(jitter(pts, amp, rng), true) + '" fill="' + fill + '" fill-opacity="' + n2(op * (opt.solid ? 0.97 : opt.simple ? 0.88 : 0.66)) + '"/>');
    if (!opt.simple) {
      var dx = (rng() - 0.5) * 4, dy = (rng() - 0.5) * 4;
      var f2 = isUrl ? fill : shade(fill, 0.1);
      o.push('<path d="' + smooth(jitter(pts, amp * 1.7, rng), true) + '" transform="translate(' + n2(dx) + ' ' + n2(dy) + ')" fill="' + f2 + '" fill-opacity="' + n2(op * 0.36) + '"/>');
      if (!isUrl && op > 0.5) {
        o.push('<path d="' + smooth(jitter(pts, amp * 0.8, rng), true) + '" fill="none" stroke="' + shade(fill, -0.3) + '" stroke-width="1.5" stroke-opacity="0.32"/>');
      }
    }
    return this;
  };

  Painter.prototype.rect = function (x, y, w, h, fill, opt) { return this.shape('rect', { x: x, y: y, w: w, h: h, r: opt && opt.r }, fill, opt); };
  Painter.prototype.ell = function (cx, cy, rx, ry, fill, opt) { return this.shape('ell', { cx: cx, cy: cy, rx: rx, ry: ry }, fill, opt); };
  Painter.prototype.poly = function (pts, fill, opt) { return this.shape('poly', { pts: pts }, fill, opt); };
  Painter.prototype.arch = function (x, y, w, h, fill, opt) { return this.shape('arch', { x: x, y: y, w: w, h: h }, fill, opt); };

  // (x,y,w,h) 바깥으로 두께 t 의 테두리. 안쪽으로 6px 겹쳐 틈을 없앰.
  Painter.prototype.frame = function (x, y, w, h, t, fill, opt) {
    var v = this.wc ? 6 : 2; // 안쪽으로 겹치는 폭 (수채화는 번짐 때문에 더 넉넉히)
    this.rect(x - t, y - t, w + 2 * t, t + v, fill, opt);
    this.rect(x - t, y + h - v, w + 2 * t, t + v, fill, opt);
    this.rect(x - t, y - t, t + v, h + 2 * t, fill, opt);
    this.rect(x + w - v, y - t, t + v, h + 2 * t, fill, opt);
    return this;
  };

  Painter.prototype.line = function (pts, color, w, opt) {
    opt = opt || {};
    if (this.lite) return this;
    var op = opt.op == null ? 1 : opt.op;
    if (!this.wc) {
      this.out.push('<polyline points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" fill="none" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (op < 1 ? ' stroke-opacity="' + op + '"' : '') + '/>');
    } else {
      var d = densify(pts, 30, false);
      this.out.push('<path d="' + smooth(jitter(d, 1.3, this.rng), false) + '" fill="none" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="' + n2(op * 0.78) + '"/>');
    }
    return this;
  };

  Painter.prototype.text = function (x, y, str, size, fill, opt) {
    opt = opt || {};
    if (this.lite) return this;
    this.out.push('<text x="' + x + '" y="' + y + '" font-size="' + size + '" fill="' + fill + '" text-anchor="' + (opt.anchor || 'start') +
      '" font-family="' + (opt.font || "'Gaegu','Nanum Pen Script','Malgun Gothic',sans-serif") + '"' + (opt.weight ? ' font-weight="' + opt.weight + '"' : '') +
      (opt.op != null ? ' fill-opacity="' + opt.op + '"' : '') + (opt.rot ? ' transform="rotate(' + opt.rot + ' ' + x + ' ' + y + ')"' : '') + '>' + str + '</text>');
    return this;
  };

  Painter.prototype.svg = function () { return this.out.join(''); };

  /* ---------- 공통 그라디언트 ---------- */
  var gradients =
    '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9c4d3"/><stop offset="1" stop-color="#eef0e8"/></linearGradient>' +
    '<linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfae8c"/><stop offset="1" stop-color="#b99774"/></linearGradient>' +
    '<linearGradient id="board" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4d6a62"/><stop offset="1" stop-color="#3d5650"/></linearGradient>' +
    '<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8c4a4"/><stop offset="1" stop-color="#c6ae8c"/></linearGradient>' +
    '<clipPath id="clipAll"><rect x="0" y="0" width="1600" height="900"/></clipPath>';

  window.SNUDraw = {
    Painter: Painter,
    mulberry32: mulberry32,
    gradients: gradients
  };
})();
