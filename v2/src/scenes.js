/* 4개 장면: 정문 -> 도서관 -> 강의실 -> 노트북 화면 -> (다시 정문)
   색은 전부 채도를 낮춘 팔레트(C)에서만 가져온다. 색을 바꾸고 싶으면 여기만 고치면 된다. */
(function () {
  'use strict';

  var Draw = window.SNUDraw;
  var W = 1600, H = 900;

  var C = {
    navy: '#3f4c6e', navyDk: '#2f3a57',
    steel: '#a9b8b4', steelLt: '#c8d3cf', steelDk: '#7d8f8c', steelLine: '#6a7b79',
    sky1: '#a9c4d3', cloud: '#f7f6f0', sun: '#f1deb0',
    mtn1: '#b4c3c8', mtn2: '#9fb3b4', rock: '#c5ccc6',
    leaf1: '#8fae94', leaf2: '#a6c0a0', leaf3: '#7a9b84', trunk: '#8b7664',
    lawn: '#b9cfa7', lawn2: '#a5bf98', paving: '#e6e0d2', pavingLine: '#cfc8b6',
    wall: '#efe6d6', wallDk: '#e2d6c0', trim: '#c9b79d',
    wood: '#b99774', woodDk: '#977656', woodLt: '#d3b693',
    paper: '#f6f0e3', ink: '#8a8d94',
    clay: '#c99a86', mustard: '#d6bb82', sage: '#8fae94', dusty: '#8ea3bb', plum: '#a58fa8', cocoa: '#6f5646',
    board: '#4d6a62', chalk: '#eef0e6',
    skin: '#ecd0b4', white: '#fbf9f3'
  };
  var BOOKS = [C.clay, C.dusty, C.mustard, C.sage, C.plum, '#d2a98c', C.navy, '#c8b99b'];

  // 각 장면에서 "다음 장면이 들어가는 구멍" (모두 16:9)
  var portals = [
    { x: 750, y: 678, w: 96, h: 54 },  // 정문 아래 작은 안내판
    { x: 1232, y: 330, w: 96, h: 54 }, // 관정관 외벽의 작은 창
    { x: 752, y: 304, w: 96, h: 54 },  // 강의실 칠판 위 작은 스크린
    { x: 752, y: 546, w: 96, h: 54 }   // 작은 노트북 화면
  ];

  var names = ['정문', '관정도서관', '강의실', '노트북'];

  function P(style, seed) { return new Draw.Painter(style, seed); }

  function cloud(p, x, y, s) {
    p.ell(x, y, 90 * s, 30 * s, C.cloud, { op: 0.9 });
    p.ell(x - 50 * s, y + 8 * s, 56 * s, 24 * s, C.cloud, { op: 0.9 });
    p.ell(x + 56 * s, y + 10 * s, 60 * s, 24 * s, C.cloud, { op: 0.9 });
  }

  function tree(p, x, y, s) {
    p.rect(x - 14 * s, y - 190 * s, 28 * s, 190 * s, C.trunk);
    p.ell(x, y - 250 * s, 120 * s, 96 * s, C.leaf1);
    p.ell(x - 70 * s, y - 200 * s, 80 * s, 66 * s, C.leaf2);
    p.ell(x + 74 * s, y - 206 * s, 82 * s, 66 * s, C.leaf2);
    p.ell(x + 10 * s, y - 290 * s, 80 * s, 58 * s, C.leaf3, { op: 0.8 });
  }

  function books(p, x0, x1, yBase, seed) {
    var r = Draw.mulberry32(seed), x = x0;
    while (x < x1 - 18) {
      var w = 14 + (r() * 16 | 0), h = 62 + (r() * 34 | 0);
      p.rect(x, yBase - h, w, h, BOOKS[r() * BOOKS.length | 0], { simple: true });
      x += w + 2;
    }
  }

  // 관악산: 부드러운 능선 + 바위 봉우리
  function gwanaksan(p) {
    p.poly([[-40, 560], [-40, 400], [140, 340], [330, 380], [520, 300], [700, 380], [860, 430], [1000, 360], [1180, 250], [1260, 200], [1330, 270], [1420, 330], [1520, 300], [1660, 380], [1660, 560]], C.mtn1);
    p.poly([[600, 560], [760, 430], [900, 470], [1060, 330], [1180, 250], [1260, 200], [1320, 260], [1380, 360], [1500, 420], [1660, 440], [1660, 560]], C.mtn2, { op: 0.9 });
    p.poly([[1180, 250], [1260, 200], [1320, 262], [1290, 300], [1240, 282], [1210, 310]], C.rock, { op: 0.9 });
  }

  /* ============ 1. 정문 (사진으로 확인한 형태: 큰 Λ자 철골 + 마디진 기둥) ============ */
  function scene0(S) {
    var b = P(S, 11), f = P(S, 12), k, u, y;
    b.rect(-30, -30, 1660, 760, 'url(#sky)');
    b.ell(240, 130, 84, 84, C.sun, { op: 0.55 });
    cloud(b, 340, 150, 1); cloud(b, 1160, 90, 0.75); cloud(b, 800, 300, 0.7);
    gwanaksan(b);
    b.ell(300, 760, 720, 190, C.lawn2); b.ell(1300, 770, 760, 190, C.lawn);
    tree(b, 110, 780, 1.05); tree(b, 1500, 790, 1.1); tree(b, 1400, 760, 0.8);
    b.rect(-30, 748, 1660, 240, C.lawn);
    // 광장 포장
    b.poly([[360, 748], [1240, 748], [1500, 940], [100, 940]], C.paving);
    b.line([[640, 760], [520, 940]], C.pavingLine, 3, { op: 0.8 });
    b.line([[960, 760], [1080, 940]], C.pavingLine, 3, { op: 0.8 });
    b.line([[300, 810], [1300, 810]], C.pavingLine, 3, { op: 0.6 });

    // 포털 뒷배경
    b.rect(750, 678, 96, 54, C.sky1);
    b.rect(792, 732, 12, 85, C.woodDk); // 안내판 기둥
    b.ell(798, 818, 34, 7, C.cocoa, { op: 0.25 });

    // Λ자 철골 (앞): 바깥 윤곽 A,B,C / 안쪽 D,F
    // ㅅ 부분: 오른쪽 발이 기둥에 닿는다
    var leg = [[100, 840], [720, 120], [1250, 840], [1110, 840], [714, 301], [250, 840]];
    f.poly(leg, C.steel, { solid: true });
    f.poly([[100, 840], [720, 120], [755, 160], [190, 840]], C.steelLt, { op: 0.8 });
    f.poly([[1250, 840], [720, 120], [690, 160], [1170, 840]], C.steelDk, { op: 0.35 });
    // 홈 선 (빔이 여러 겹으로 이어진 느낌)
    f.line([[150, 840], [580, 340]], C.steelLine, 3, { op: 0.55 });
    f.line([[200, 840], [630, 340]], C.steelLine, 3, { op: 0.45 });
    f.line([[1200, 840], [847, 360]], C.steelLine, 3, { op: 0.5 });
    f.line([[1155, 840], [802, 360]], C.steelLine, 3, { op: 0.4 });
    // 볼트 점
    for (k = 0; k < 7; k++) {
      u = 90 + k * 70; y = 840 - u;
      f.ell(175 + 0.861 * u, y, 4, 4, C.steelLine, { simple: true, op: 0.7 });
      f.ell(1180 - 0.736 * u, y, 4, 4, C.steelLine, { simple: true, op: 0.7 });
    }

    // ㅑ 부분: 높은 기둥 + 오른쪽으로 뻗은 팔 두 개 + 위쪽 네모 틀
    var px = 1170, S1 = { solid: true };
    f.rect(px, 150, 70, 690, C.steel, S1);
    f.rect(px + 50, 150, 20, 690, C.steelDk, { op: 0.5 });
    f.rect(px + 70, 250, 96, 36, C.steelLt, S1);
    f.rect(px + 70, 380, 96, 36, C.steelLt, S1);
    f.rect(px + 70, 286, 96, 8, C.steelDk, { op: 0.35 });
    f.rect(px + 70, 416, 96, 8, C.steelDk, { op: 0.35 });
    f.rect(px - 22, 56, 114, 100, C.steel, S1);
    f.rect(px + 4, 82, 62, 48, '#cfe0e6', S1); // 윗부분 뚫린 틈 (하늘)
    f.rect(px - 30, 50, 130, 14, C.steelLt, S1);
    f.rect(px - 22, 148, 114, 8, C.steelDk, { op: 0.35 });

    // 앞 잔디와 꽃 (아주 연한 색)
    f.ell(60, 900, 200, 80, C.lawn2); f.ell(1540, 900, 220, 86, C.lawn2);
    f.ell(250, 920, 150, 60, C.leaf2); f.ell(1380, 925, 150, 60, C.leaf2);
    [[70, 850, 0], [150, 868, 1], [1470, 860, 1], [1550, 848, 0], [1400, 880, 0]].forEach(function (q) {
      f.ell(q[0], q[1], 10, 10, q[2] ? '#e3c4c4' : '#ecdcae');
    });
    // 낮은 석재 표지석
    f.rect(340, 786, 210, 50, '#d9d4c6'); f.rect(340, 786, 210, 9, '#e9e5d9');
    f.text(445, 824, '서울대학교', 28, C.navy, { anchor: 'middle', weight: 'bold' });
    return { back: b.svg(), front: f.svg() };
  }

  /* ============ 2. 관정도서관 외관 (포스코 뉴스룸 사진 참고: 샴페인색 금속 외벽 + 비스듬한 유리창,
     옛 중앙도서관 위로 길게 얹힌 윗부분과 그 아래 어두운 틈) ============ */
  function scene1(S) {
    var b = P(S, 21), f = P(S, 22), r, x, y;
    var CHAMP = '#dccbb3', BRONZE = '#bfa68a', GLASS = '#a3b9c8', GLASS2 = '#8fa6b8',
        CONC = '#bab3a8', CONCDK = '#9d968b', TEAL = '#86a8a0';

    b.rect(-30, -30, 1660, 780, 'url(#sky)');
    b.ell(1380, 90, 70, 70, C.sun, { op: 0.5 });
    cloud(b, 300, 90, 0.9); cloud(b, 1130, 60, 0.7);
    gwanaksan(b);
    b.rect(-30, 740, 1660, 200, C.lawn);
    b.poly([[200, 770], [1500, 770], [1600, 940], [60, 940]], C.paving);

    // 옛 중앙도서관 (콘크리트 + 초록빛 창 띠)
    b.rect(100, 500, 930, 272, CONC);
    b.rect(90, 490, 950, 14, CONCDK);
    [520, 578, 636, 694].forEach(function (yy) {
      b.rect(110, yy, 910, 30, TEAL);
      for (x = 110; x < 1020; x += 38) b.rect(x, yy, 7, 30, CONC, { simple: true });
      b.rect(100, yy + 30, 930, 6, CONCDK, { op: 0.6 });
    });
    b.rect(100, 740, 930, 32, CONCDK, { op: 0.8 });

    // 윗부분 아래의 어두운 틈
    b.rect(150, 470, 870, 34, '#777a83');

    // 길게 얹힌 윗부분 + 오른쪽 끝 몸체
    b.rect(150, 130, 870, 340, CHAMP);
    b.rect(150, 122, 870, 10, BRONZE);
    b.rect(1020, 130, 480, 650, CHAMP);
    b.rect(1020, 122, 480, 10, BRONZE);
    b.rect(1020, 130, 6, 650, BRONZE, { op: 0.6 });

    // 비스듬한 유리창 무늬 (금속 패널과 번갈아)
    function windows(x0, x1, y0, y1) {
      for (r = 0, y = y0; y < y1; y += 48, r++) {
        for (x = x0 + (r % 2) * 12; x < x1 - 14; x += 24) {
          b.poly([[x + 4, y], [x + 14, y], [x + 10, y + 36], [x, y + 36]], (x / 24 + r) % 3 ? GLASS : GLASS2, { simple: true });
        }
      }
    }
    windows(160, 1010, 146, 450);
    windows(1034, 1490, 146, 600);

    // 1층 로비 유리와 이름판
    b.rect(1060, 648, 400, 124, '#7e95a3');
    for (x = 1060; x < 1460; x += 50) b.rect(x, 648, 4, 124, '#5f7482', { simple: true });
    b.rect(1236, 700, 64, 72, '#566b79');
    b.rect(1180, 606, 176, 36, C.navy);
    b.text(1268, 633, '관정관', 26, C.paper, { anchor: 'middle', weight: 'bold' });

    // 다음 장면이 들어가는 작은 창
    b.rect(1232, 330, 96, 54, C.white);

    // 나무 (초록 + 가을빛)
    tree(b, 70, 800, 1.0); tree(b, 1550, 800, 1.0);
    [[600, 800, '#c4a091'], [930, 796, '#cbb09a'], [1070, 806, '#b8917f']].forEach(function (t) {
      b.rect(t[0] - 7, t[1] - 120, 14, 120, C.trunk);
      b.ell(t[0], t[1] - 150, 64, 54, t[2]);
      b.ell(t[0] - 40, t[1] - 122, 46, 40, t[2], { op: 0.85 });
      b.ell(t[0] + 42, t[1] - 128, 48, 40, t[2], { op: 0.85 });
    });

    f.frame(1232, 330, 96, 54, 10, '#8a7560');
    f.ell(300, 920, 260, 70, C.lawn2); f.ell(1100, 935, 300, 70, C.lawn2); f.ell(1500, 915, 200, 60, C.leaf2);
    return { back: b.svg(), front: f.svg() };
  }

  /* ============ 3. 강의실 ============ */
  function scene2(S) {
    var b = P(S, 31), f = P(S, 32);
    b.rect(-30, -30, 1660, 600, '#e6ebe4');
    [220, 700, 1180].forEach(function (x) { b.rect(x, -10, 200, 28, C.white); b.ell(x + 100, 30, 150, 40, '#f6efd2', { op: 0.3 }); });
    b.ell(75, 300, 42, 42, C.white); b.ell(75, 300, 34, 34, '#f4f1ea', { simple: true });
    b.line([[75, 300], [75, 278]], '#555', 4); b.line([[75, 300], [92, 308]], '#555', 4);

    b.rect(150, 90, 1300, 440, C.woodLt);
    b.rect(166, 106, 1268, 408, 'url(#board)');
    b.text(800, 146, 'VERITAS · LUX · MEA', 40, C.chalk, { anchor: 'middle', op: 0.92, weight: 'bold' });
    b.text(210, 270, 'F = ma', 54, C.chalk, { op: 0.88 });
    b.text(210, 360, '∫ x² dx = x³/3', 36, C.chalk, { op: 0.8 });
    b.text(210, 440, 'v = Δx / Δt', 36, C.chalk, { op: 0.8 });
    b.text(1090, 290, 'E = mc²', 52, C.chalk, { op: 0.88 });
    b.text(1068, 380, 'a² + b² = c²', 36, C.chalk, { op: 0.8 });
    b.line([[1100, 480], [1230, 410], [1230, 480], [1100, 480]], C.chalk, 3, { op: 0.75 });
    b.rect(150, 530, 1300, 18, C.woodDk);
    b.rect(1230, 514, 40, 14, '#f1efe8'); b.rect(1286, 510, 64, 20, C.clay); b.rect(1366, 516, 30, 12, C.mustard);

    b.text(800, 250, '진리는 나의 빛', 34, C.chalk, { anchor: 'middle', op: 0.85 });
    b.rect(752, 304, 96, 54, C.white);

    b.rect(-30, 556, 1660, 380, 'url(#floor)');
    b.rect(80, 652, 1440, 26, C.wood);
    var hair = ['#3a3440', '#6b5646', '#2e2e38', '#8b7664', '#3a3440'];
    var shirt = [C.mustard, C.dusty, C.clay, C.sage, C.plum];
    [230, 520, 800, 1080, 1370].forEach(function (x, k) {
      b.ell(x, 748, 82, 74, shirt[k]);
      b.ell(x, 644, 38, 40, hair[k]);
      b.ell(x - 38, 648, 7, 10, C.skin, { simple: true }); b.ell(x + 38, 648, 7, 10, C.skin, { simple: true });
    });
    var hair2 = ['#2e2e38', '#8b7664', '#3a3440', '#6b5646'];
    var shirt2 = [C.dusty, C.clay, C.mustard, C.sage];
    [170, 560, 960, 1380].forEach(function (x, k) {
      b.ell(x, 940, 128, 106, shirt2[k]);
      b.ell(x, 818, 58, 60, hair2[k]);
      b.ell(x - 58, 824, 10, 15, C.skin, { simple: true }); b.ell(x + 58, 824, 10, 15, C.skin, { simple: true });
    });

    f.frame(752, 304, 96, 54, 10, '#ebe8de');
    return { back: b.svg(), front: f.svg() };
  }

  /* ============ 4. 책상 위 노트북 ============ */
  function scene3(S) {
    var b = P(S, 41), f = P(S, 42), r, c;
    b.rect(-30, -30, 1660, 640, '#f2e9da');

    // 창문: 관악산이 보이는 풍경
    b.rect(80, 80, 380, 340, 'url(#sky)');
    b.ell(380, 160, 30, 30, C.sun);
    b.ell(180, 150, 60, 20, C.cloud, { op: 0.9 }); b.ell(220, 160, 40, 16, C.cloud, { op: 0.9 });
    b.poly([[80, 330], [170, 250], [250, 290], [340, 200], [380, 170], [420, 250], [460, 280], [460, 420], [80, 420]], C.mtn2);
    b.poly([[340, 200], [380, 170], [405, 215], [370, 235]], C.rock, { op: 0.9 });
    b.poly([[80, 370], [200, 340], [330, 366], [460, 336], [460, 420], [80, 420]], C.lawn2);
    b.ell(150, 372, 36, 28, C.leaf1);
    b.frame(80, 80, 380, 340, 16, '#fbf4e6');
    b.rect(266, 80, 8, 340, '#fbf4e6'); b.rect(80, 246, 380, 8, '#fbf4e6');
    b.rect(56, 420, 428, 20, C.trim);

    // 선반
    b.rect(1250, 60, 220, 110, C.woodDk);
    b.rect(1264, 74, 192, 82, '#cfdde0');
    b.poly([[1264, 156], [1330, 118], [1380, 140], [1456, 100], [1456, 156]], C.leaf3);
    b.rect(1170, 300, 400, 16, C.woodDk);
    b.rect(1200, 316, 14, 36, C.woodDk); b.rect(1530, 316, 14, 36, C.woodDk);
    b.poly([[1230, 300], [1310, 300], [1296, 244], [1244, 244]], C.clay);
    b.ell(1252, 208, 18, 40, C.leaf3); b.ell(1278, 192, 18, 48, C.leaf1); b.ell(1304, 208, 18, 40, C.leaf3);
    books(b, 1350, 1550, 300, 5);

    // 책상
    b.rect(-30, 598, 1660, 340, 'url(#wood)');
    b.rect(-30, 590, 1660, 14, C.woodDk);
    b.line([[-20, 700], [1620, 700]], C.woodDk, 3, { op: 0.2 }); b.line([[-20, 820], [1620, 820]], C.woodDk, 3, { op: 0.2 });
    // 작은 노트북 (화면이 다음 장면)
    b.ell(800, 700, 170, 12, C.cocoa, { op: 0.25 });
    b.rect(724, 518, 152, 104, '#41454f', { r: 10 });
    b.rect(752, 546, 96, 54, '#1d2438');
    b.rect(704, 622, 192, 8, '#aeb3bb');
    b.poly([[704, 630], [896, 630], [930, 692], [670, 692]], '#dcdfe4');
    for (r = 0; r < 3; r++) {
      var y = 640 + r * 16, xl = 704 - (y - 630) * 0.55, xr = 896 + (y - 630) * 0.55, kw = (xr - xl - 24) / 10;
      for (c = 0; c < 10; c++) b.rect(xl + 12 + c * kw + 1.5, y, kw - 3, 10, '#f3f4f7', { simple: true });
    }
    b.rect(770, 678, 64, 8, '#f3f4f7', { simple: true });
    b.poly([[670, 692], [930, 692], [932, 698], [668, 698]], '#b4b9c2');

    // 머그 (SNU)
    b.ell(1340, 722, 96, 24, C.white);
    b.poly([[1290, 636], [1390, 636], [1376, 716], [1304, 716]], C.navy);
    b.text(1333, 690, 'SNU', 20, C.paper, { anchor: 'middle', weight: 'bold' });
    b.ell(1340, 636, 50, 13, C.cocoa);
    b.ell(1402, 676, 24, 28, C.navy); b.ell(1402, 676, 12, 17, '#c6a083');
    b.line([[1322, 616], [1312, 586], [1328, 556]], C.white, 5, { op: 0.65 });
    b.line([[1352, 612], [1344, 584], [1358, 560]], C.white, 5, { op: 0.55 });
    // 노트
    b.poly([[84, 650], [330, 628], [352, 790], [108, 822]], C.navy);
    b.poly([[132, 690], [262, 680], [272, 742], [142, 752]], C.paper);
    b.text(200, 722, 'SNU', 22, C.navy, { anchor: 'middle', weight: 'bold', rot: -5 });
    b.poly([[210, 850], [430, 800], [434, 814], [214, 864]], C.mustard);
    b.poly([[430, 800], [458, 794], [434, 814]], '#ead7b8');
    b.poly([[1466, 770], [1546, 770], [1534, 842], [1478, 842]], C.clay);
    b.ell(1490, 748, 16, 30, C.leaf3); b.ell(1506, 736, 16, 38, C.leaf1); b.ell(1524, 750, 16, 28, C.leaf3);

    f.frame(752, 546, 96, 54, 9, '#41454f');
    return { back: b.svg(), front: f.svg() };
  }

  window.SNUScenes = {
    W: W, H: H,
    portals: portals,
    names: names,
    build: function (style) {
      return [scene0(style), scene1(style), scene2(style), scene3(style)];
    }
  };
})();
