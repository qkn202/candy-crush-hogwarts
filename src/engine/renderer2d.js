// Bộ dựng hình Bàn Cờ & Kẹo Phép 3D Bóng Bẩy chuẩn Candy Crush Saga × Thế Giới Phù Thủy Đêm Tối

import { TILE_TYPES } from '../data/lore.js';

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export class BoardRenderer {
  constructor(canvas, onSpriteReady = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onSpriteReady = onSpriteReady;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.boardPx = 480;
    this.padding = 14;
    this.cellSize = 56;
    this.observedCssSize = 0;
    this.sprites = {};
    this.preloadSprites();

    if (typeof ResizeObserver !== 'undefined' && typeof Element !== 'undefined' && canvas instanceof Element) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height || w;
          const sz = Math.floor(Math.min(w, h));
          this.observedCssSize = sz > 0 ? sz : 0;
        }
        this.onSpriteReady?.();
      });
      this.resizeObserver.observe(canvas);
    }
  }

  preloadSprites() {
    const load = (key, url) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => this.onSpriteReady?.();
      img.src = url;
      this.sprites[key] = img;
    };

    for (let i = 0; i < 6; i++) {
      load(`c_${i}`, `/assets/candy-${i}.png`);
      load(`c_${i}_sh`, `/assets/candy-${i}-sh.png`);
      load(`c_${i}_sv`, `/assets/candy-${i}-sv.png`);
      load(`c_${i}_wr`, `/assets/candy-${i}-wrapped.png`);
    }
    load('color_bomb', '/assets/candy-colorbomb.png');
  }

  getSpriteForPiece(piece) {
    if (piece.special === 'color_bomb') return this.sprites.color_bomb;
    if (piece.special === 'striped_h') return this.sprites[`c_${piece.color}_sh`];
    if (piece.special === 'striped_v') return this.sprites[`c_${piece.color}_sv`];
    if (piece.special === 'wrapped') return this.sprites[`c_${piece.color}_wr`];
    return this.sprites[`c_${piece.color}`];
  }

  resize(gridSize) {
    let rawCssSize = this.observedCssSize;
    if (!rawCssSize || rawCssSize <= 0) {
      const rect = this.canvas.getBoundingClientRect();
      rawCssSize = Math.floor(Math.min(rect.width, rect.height || rect.width));
    }
    const cssSize = Math.max(240, rawCssSize);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const targetW = Math.round(cssSize * this.dpr);
    if (this.canvas.width !== targetW || this.canvas.height !== targetW) {
      this.canvas.width = targetW;
      this.canvas.height = targetW;
    }
    this.boardPx = cssSize;
    this.padding = Math.max(10, Math.round(cssSize * 0.028));
    this.cellSize = (cssSize - this.padding * 2) / gridSize;
  }

  screenToCell(clientX, clientY, gridSize) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left - this.padding;
    const y = clientY - rect.top - this.padding;
    const c = Math.floor(x / this.cellSize);
    const r = Math.floor(y / this.cellSize);
    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return null;
    return { r, c };
  }

  cellCenter(r, c) {
    return {
      x: this.padding + (c + 0.5) * this.cellSize,
      y: this.padding + (r + 0.5) * this.cellSize
    };
  }

  render(state, now) {
    const {
      size,
      mask,
      jelly,
      ice,
      frosting = [],
      chocolate = [],
      cauldron = [],
      lockGrid = [],
      conveyorLoops = [],
      portals = [],
      ingredientExitCells = [],
      grid,
      selected,
      kbCursor,
      hintPair,
      activeBooster,
      vfx
    } = state;
    this.resize(size);
    const ctx = this.ctx;
    const cs = this.cellSize;

    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, this.boardPx, this.boardPx);

    if (vfx.shake > 0.2) {
      ctx.translate((Math.random() - 0.5) * vfx.shake, (Math.random() - 0.5) * vfx.shake);
    }

    // 1. Vẽ nền khay Hắc Thạch viền Vàng Cổ liền khối ở các ô hoạt động
    this.drawBoardTray(ctx, size, mask, cs);

    // 2. Vẽ ô nền, Thạch Hắc Ám (Jelly), Cổng Bột Floo, Đá Cổ Ngữ (Frosting) & Sô-cô-la Lan
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (mask[r][c] === 0) continue;
        const x = this.padding + c * cs;
        const y = this.padding + r * cs;
        const isEven = (r + c) % 2 === 0;

        ctx.fillStyle = isEven ? 'rgba(13, 18, 34, 0.93)' : 'rgba(23, 31, 56, 0.90)';
        roundRectPath(ctx, x + 1, y + 1, cs - 2, cs - 2, cs * 0.14);
        ctx.fill();

        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(212, 160, 23, 0.28)';
        ctx.stroke();

        if (jelly[r]?.[c] > 0) {
          this.drawCandyJelly(ctx, x + 2, y + 2, cs - 4, cs - 4, cs * 0.16, jelly[r][c]);
        }

        const frostLayer = frosting[r]?.[c] || 0;
        if (frostLayer > 0) {
          this.drawRuneFrosting(ctx, x + 2.5, y + 2.5, cs - 5, cs - 5, cs * 0.16, frostLayer);
        }

        const chocoLayer = chocolate[r]?.[c] || 0;
        if (chocoLayer > 0) {
          this.drawSpreadingChocolate(ctx, x + 2, y + 2, cs - 4, cs - 4, cs * 0.16, now);
        }

        const cauldronHp = cauldron[r]?.[c] || 0;
        if (cauldronHp > 0) {
          this.drawMagicCauldron(ctx, x + 2, y + 2, cs - 4, cs - 4, cs * 0.16, cauldronHp, now);
        }

        if (selected && selected.r === r && selected.c === c) {
          roundRectPath(ctx, x + 2, y + 2, cs - 4, cs - 4, cs * 0.16);
          ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#fde047';
          ctx.stroke();
        } else if (
          hintPair &&
          ((hintPair[0].r === r && hintPair[0].c === c) || (hintPair[1].r === r && hintPair[1].c === c))
        ) {
          const pulse = 0.45 + 0.5 * Math.sin(now * 0.008);
          roundRectPath(ctx, x + 2.5, y + 2.5, cs - 5, cs - 5, cs * 0.16);
          ctx.fillStyle = `rgba(192, 132, 252, ${0.22 * pulse})`;
          ctx.fill();
          ctx.lineWidth = 2.8;
          ctx.strokeStyle = `rgba(253, 224, 71, ${pulse})`;
          ctx.stroke();
        }

        if (kbCursor && kbCursor.r === r && kbCursor.c === c) {
          ctx.save();
          roundRectPath(ctx, x + 3.5, y + 3.5, cs - 7, cs - 7, cs * 0.14);
          ctx.setLineDash([5, 4]);
          ctx.lineWidth = 2.4;
          ctx.strokeStyle = '#38bdf8';
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // 2b. Vẽ Băng Chuyền Cầu Thang, Cổng Lò Sưởi Bột Floo (Portals) & Mũi Tên Lối Thoát Bảo Vật (Drop Exits)
    if (conveyorLoops.length > 0) {
      this.drawConveyorPlates(ctx, conveyorLoops, cs, now);
    }

    for (const portal of portals) {
      this.drawFlooPortal(ctx, portal.from.r, portal.from.c, cs, portal.color || '#10b981', true, now);
      this.drawFlooPortal(ctx, portal.to.r, portal.to.c, cs, portal.color || '#10b981', false, now);
    }

    for (const ex of ingredientExitCells) {
      if (mask[ex.r]?.[ex.c] === 1) {
        this.drawIngredientExitArrow(ctx, ex.r, ex.c, cs, now);
      }
    }

    if (activeBooster === 'hammer' || activeBooster === 'swap') {
      roundRectPath(
        ctx,
        this.padding - 5,
        this.padding - 5,
        this.boardPx - (this.padding - 5) * 2,
        this.boardPx - (this.padding - 5) * 2,
        20
      );
      ctx.lineWidth = 3.5;
      ctx.setLineDash([10, 6]);
      ctx.strokeStyle = activeBooster === 'hammer' ? '#fbbf24' : '#38bdf8';
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Vẽ các Viên Kẹo 3D, Hòn Đá Phù Thủy, Xoáy Cam Thảo, Bom Đếm Ngược & Khung Băng
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (mask[r][c] === 0) continue;
        const piece = grid[r][c];
        if (!piece) continue;

        const cx = this.padding + (piece.x + 0.5) * cs;
        const cy = this.padding + (piece.y + 0.5) * cs;
        let scale = piece.scale ?? 1;

        if (selected && selected.r === r && selected.c === c) {
          scale *= 1.1 + 0.04 * Math.sin(now * 0.012);
        } else if (
          hintPair &&
          ((hintPair[0].r === r && hintPair[0].c === c) || (hintPair[1].r === r && hintPair[1].c === c))
        ) {
          scale *= 1.05 + 0.05 * Math.sin(now * 0.01);
        } else if (piece.primedWrapped) {
          scale *= 1.12 + 0.08 * Math.sin(now * 0.025);
        } else if (piece.special === 'wrapped') {
          scale *= 1.02 + 0.025 * Math.sin(now * 0.008 + r + c);
        }

        this.drawCandyPiece(ctx, piece, cx, cy, cs * 0.92 * scale, piece.alpha ?? 1, now);

        if (ice[r]?.[c] > 0) {
          const x = this.padding + piece.x * cs + 2;
          const y = this.padding + piece.y * cs + 2;
          this.drawSugarIceLock(ctx, x, y, cs - 4, cs - 4, cs * 0.16, ice[r][c]);
        }

        if (lockGrid[r]?.[c] > 0) {
          const x = this.padding + piece.x * cs + 2;
          const y = this.padding + piece.y * cs + 2;
          this.drawGringottsPadlock(ctx, x, y, cs - 4, cs - 4, cs * 0.16, now);
        }
      }
    }

    // 4. Vẽ hiệu ứng Tia Kẹo Nổ, Kẹo Cánh Vàng Tầm Thủ Bay, Cầu Vồng, Mảnh Kẹo & Chữ Khen
    this.drawVfx(ctx, vfx, cs, size, now);

    ctx.restore();
  }

  drawBoardTray(ctx, size, mask, cs) {
    const fillConnectedShape = (expand, radius) => {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (mask[r][c] === 0) continue;
          const x = this.padding + c * cs - expand;
          const y = this.padding + r * cs - expand;
          const s = cs + expand * 2;
          roundRectPath(ctx, x, y, s, s, radius);
          ctx.fill();

          if (c + 1 < size && mask[r][c + 1] === 1) {
            ctx.fillRect(x + s * 0.5, y, cs, s);
          }
          if (r + 1 < size && mask[r + 1][c] === 1) {
            ctx.fillRect(x, y + s * 0.5, s, cs);
          }
          if (
            r + 1 < size &&
            c + 1 < size &&
            mask[r][c + 1] === 1 &&
            mask[r + 1][c] === 1 &&
            mask[r + 1][c + 1] === 1
          ) {
            ctx.fillRect(x + s * 0.5, y + s * 0.5, cs, cs);
          }
        }
      }
    };

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.82)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 7;
    ctx.fillStyle = '#d4a017';
    fillConnectedShape(6.2, cs * 0.24);

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#3b2507';
    fillConnectedShape(3.6, cs * 0.21);

    ctx.fillStyle = '#080b16';
    fillConnectedShape(1.5, cs * 0.18);
    ctx.restore();
  }

  drawCandyJelly(ctx, x, y, w, h, rad, layer) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, rad);
    if (layer === 1) {
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, 'rgba(168, 85, 247, 0.44)');
      g.addColorStop(0.5, 'rgba(88, 28, 135, 0.34)');
      g.addColorStop(1, 'rgba(139, 92, 246, 0.48)');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = 'rgba(216, 180, 254, 0.78)';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + w * 0.18, y + h * 0.34);
      ctx.quadraticCurveTo(x + w * 0.2, y + h * 0.18, x + w * 0.42, y + h * 0.18);
      ctx.strokeStyle = 'rgba(243, 232, 255, 0.9)';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.stroke();
    } else {
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, 'rgba(107, 33, 168, 0.80)');
      g.addColorStop(1, 'rgba(46, 16, 101, 0.85)');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#e879f9';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x + w * 0.3, y + h * 0.28, w * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(250, 232, 255, 0.92)';
      ctx.fill();
    }
    ctx.restore();
  }

  // Đá Cổ Ngữ Hogwarts 1–3 lớp (Frosting / Multi-layer Blocker: phá bằng ghép kẹo cạnh bên)
  drawRuneFrosting(ctx, x, y, w, h, rad, layer) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, rad);
    const g = ctx.createLinearGradient(x, y, x, y + h);
    if (layer >= 3) {
      g.addColorStop(0, '#94a3b8');
      g.addColorStop(0.55, '#475569');
      g.addColorStop(1, '#1e293b');
    } else if (layer === 2) {
      g.addColorStop(0, '#64748b');
      g.addColorStop(0.6, '#334155');
      g.addColorStop(1, '#0f172a');
    } else {
      g.addColorStop(0, '#475569');
      g.addColorStop(1, '#1e293b');
    }
    ctx.fillStyle = g;
    ctx.fill();

    ctx.lineWidth = layer >= 3 ? 3.2 : 2.2;
    ctx.strokeStyle = layer >= 3 ? '#fde047' : layer === 2 ? '#cbd5e1' : '#94a3b8';
    ctx.stroke();

    // Khung nổi trong lòng viên đá
    roundRectPath(ctx, x + w * 0.14, y + h * 0.14, w * 0.72, h * 0.72, rad * 0.65);
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Cổ ngữ ma thuật phát sáng ở tâm (số vạch biểu thị độ dày 1..3 lớp)
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.strokeStyle = layer >= 2 ? '#fde047' : '#e2e8f0';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (layer >= 3) {
      ctx.moveTo(cx, y + h * 0.24);
      ctx.lineTo(cx + w * 0.24, cy);
      ctx.lineTo(cx, y + h * 0.76);
      ctx.lineTo(cx - w * 0.24, cy);
      ctx.closePath();
      ctx.moveTo(cx - w * 0.12, cy);
      ctx.lineTo(cx + w * 0.12, cy);
    } else if (layer === 2) {
      ctx.moveTo(cx - w * 0.22, cy);
      ctx.lineTo(cx + w * 0.22, cy);
      ctx.moveTo(cx, cy - h * 0.22);
      ctx.lineTo(cx, cy + h * 0.22);
    } else {
      // Vết nứt chuẩn bị vỡ của lớp cuối
      ctx.moveTo(x + w * 0.2, y + h * 0.25);
      ctx.lineTo(cx, cy);
      ctx.lineTo(x + w * 0.78, y + h * 0.35);
      ctx.moveTo(cx, cy);
      ctx.lineTo(x + w * 0.38, y + h * 0.8);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Sô-cô-la Hắc Ám Tự Lan (Spreading Chocolate)
  drawSpreadingChocolate(ctx, x, y, w, h, rad, now) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, rad);
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#5c2810');
    g.addColorStop(0.5, '#3b1708');
    g.addColorStop(1, '#1f0a03');
    ctx.fillStyle = g;
    ctx.fill();

    const pulse = 0.55 + 0.35 * Math.sin(now * 0.005);
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = `rgba(245, 158, 11, ${pulse})`;
    ctx.stroke();

    // 4 ô thanh sô-cô-la dập nổi bóng bẩy
    const pad = w * 0.15;
    const sq = (w - pad * 2.5) / 2;
    const positions = [
      [x + pad, y + pad],
      [x + pad * 1.5 + sq, y + pad],
      [x + pad, y + pad * 1.5 + sq],
      [x + pad * 1.5 + sq, y + pad * 1.5 + sq]
    ];
    for (const [ sx, sy ] of positions) {
      roundRectPath(ctx, sx, sy, sq, sq, 3.5);
      ctx.fillStyle = '#4e210c';
      ctx.fill();
      ctx.strokeStyle = 'rgba(253, 230, 138, 0.28)';
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }

    // Ánh tím hắc ám cảnh báo khả năng tự lan
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.5, w * 0.11, 0, Math.PI * 2);
    ctx.fillStyle = '#c084fc';
    ctx.fill();
    ctx.restore();
  }

  drawFlooPortal(ctx, r, c, cs, color, isEntrance, now) {
    const x = this.padding + c * cs;
    const y = this.padding + r * cs;
    const cx = x + cs * 0.5;
    const cy = isEntrance ? y + cs - 3 : y + 3;
    const shimmer = 0.65 + 0.3 * Math.sin(now * 0.007 + (isEntrance ? 0 : 1.5));

    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = shimmer;
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, cs * 0.38, cs * 0.09, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.globalAlpha = shimmer * 0.32;
    ctx.fill();
    ctx.restore();
  }

  drawIngredientExitArrow(ctx, r, c, cs, now) {
    const center = this.cellCenter(r, c);
    const yBase = this.padding + (r + 1) * cs - 2;
    const bob = Math.sin(now * 0.006) * 2;

    ctx.save();
    ctx.translate(center.x, yBase + bob);
    ctx.beginPath();
    ctx.moveTo(-cs * 0.2, -5);
    ctx.lineTo(cs * 0.2, -5);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();
    ctx.restore();
  }

  drawSugarIceLock(ctx, x, y, w, h, rad, layer) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, rad);
    ctx.fillStyle = layer >= 2 ? 'rgba(125, 211, 252, 0.30)' : 'rgba(186, 230, 253, 0.18)';
    ctx.fill();
    ctx.lineWidth = layer >= 2 ? 3.4 : 2.4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    if (layer >= 2) {
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 5);
      ctx.lineTo(x + w - 5, y + h - 5);
      ctx.moveTo(x + w - 5, y + 5);
      ctx.lineTo(x + 5, y + h - 5);
      ctx.strokeStyle = 'rgba(14, 116, 144, 0.65)';
      ctx.lineWidth = 5.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 15);
      ctx.lineTo(x + 15, y + 5);
      ctx.moveTo(x + w - 15, y + h - 5);
      ctx.lineTo(x + w - 5, y + h - 15);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.restore();
  }

  drawCandyPiece(ctx, piece, cx, cy, drawSize, alpha = 1, now = 0) {
    if (drawSize <= 2) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    // 1. Bảo vật thả đáy: Hòn Đá Phù Thủy (Philosopher's Stone Ingredient)
    if (piece.isIngredient) {
      this.drawPhilosopherStone(ctx, cx, cy, drawSize, now);
      ctx.restore();
      return;
    }

    // 2. Xoáy Cam Thảo (Licorice Swirl — rơi theo trọng lực & chặn tia Kẹo Sọc)
    if (piece.blocker === 'swirl') {
      this.drawLicoriceSwirl(ctx, cx, cy, drawSize);
      ctx.restore();
      return;
    }

    // 3. Hào quang cảnh báo Kẹo Bọc chuẩn bị Nổ Nhịp 2 (Wrapped Double Blast)
    if (piece.primedWrapped) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, drawSize * 0.56, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.36)';
      ctx.fill();
      ctx.lineWidth = 2.8;
      ctx.strokeStyle = '#fde047';
      ctx.stroke();
      ctx.restore();
    }

    // 4. Đôi cánh vàng Snitch cho Kẹo Cánh Vàng Tầm Thủ (2×2 Square Match)
    if (piece.special === 'seeker') {
      this.drawGoldenSeekerWings(ctx, cx, cy, drawSize, now);
    }

    const sprite = this.getSpriteForPiece(piece);
    const renderScale = piece.special === 'seeker' ? 0.78 : 1;
    const sSize = drawSize * renderScale;

    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
      ctx.shadowBlur = sSize * 0.12;
      ctx.shadowOffsetY = sSize * 0.06;
      ctx.drawImage(sprite, cx - sSize / 2, cy - sSize / 2, sSize, sSize);
    } else {
      const r = sSize * 0.4;
      ctx.fillStyle = TILE_TYPES[piece.color]?.color || '#ff1e27';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (piece.special === 'seeker') {
      ctx.shadowColor = 'transparent';
      ctx.beginPath();
      ctx.arc(cx, cy, sSize * 0.43, 0, Math.PI * 2);
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();
    }

    // 5. Huy hiệu Bom Kẹo Đếm Ngược (Candy Bomb Timer)
    if (piece.bombTimer !== null && piece.bombTimer !== undefined) {
      this.drawBombTimerOverlay(ctx, cx, cy, drawSize, piece.bombTimer, now);
    }

    // 6. Huy hiệu Chìa Khoá Đường Vàng Gringotts (Sugar Key)
    if (piece.hasKey) {
      this.drawSugarKeyBadge(ctx, cx, cy, drawSize, now);
    }

    ctx.restore();
  }

  drawPhilosopherStone(ctx, cx, cy, size, now) {
    const r = size * 0.44;
    const glow = 0.75 + 0.25 * Math.sin(now * 0.006);
    ctx.save();
    ctx.shadowColor = `rgba(239, 68, 68, ${0.75 * glow})`;
    ctx.shadowBlur = 14;

    ctx.beginPath();
    const pts = [
      [0, -r],
      [r * 0.86, -r * 0.3],
      [r * 0.58, r * 0.88],
      [-r * 0.58, r * 0.88],
      [-r * 0.86, -r * 0.3]
    ];
    pts.forEach(([px, py], i) => {
      if (i === 0) ctx.moveTo(cx + px, cy + py);
      else ctx.lineTo(cx + px, cy + py);
    });
    ctx.closePath();

    const g = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.25, r * 0.1, cx, cy, r);
    g.addColorStop(0, '#fecaca');
    g.addColorStop(0.35, '#ef4444');
    g.addColorStop(0.8, '#991b1b');
    g.addColorStop(1, '#450a0a');
    ctx.fillStyle = g;
    ctx.fill();

    ctx.lineWidth = 2.8;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();

    // Mặt cắt kim cương bên trong
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.65);
    ctx.lineTo(cx + r * 0.45, cy - r * 0.1);
    ctx.lineTo(cx, cy + r * 0.58);
    ctx.lineTo(cx - r * 0.45, cy - r * 0.1);
    ctx.closePath();
    ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
    ctx.fill();
    ctx.restore();
  }

  drawLicoriceSwirl(ctx, cx, cy, size) {
    const r = size * 0.43;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, r * 0.1, cx, cy, r);
    g.addColorStop(0, '#312e81');
    g.addColorStop(0.65, '#0f172a');
    g.addColorStop(1, '#020617');
    ctx.fillStyle = g;
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    // Đường xoáy ốc Cam Thảo đặc trưng Candy Crush
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    for (let t = 0; t <= Math.PI * 3.7; t += 0.22) {
      const rr = (t / (Math.PI * 3.9)) * r * 0.82;
      const px = cx + Math.cos(t) * rr;
      const py = cy + Math.sin(t) * rr;
      if (t === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = Math.max(2.4, size * 0.065);
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }

  drawGoldenSeekerWings(ctx, cx, cy, size, now) {
    const flap = Math.sin(now * 0.016) * 0.22;
    const wingSpan = size * 0.54;

    ctx.save();
    ctx.translate(cx, cy);
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.scale(side, 1);
      ctx.rotate(flap);
      ctx.beginPath();
      ctx.moveTo(size * 0.14, -size * 0.04);
      ctx.quadraticCurveTo(wingSpan * 0.72, -size * 0.42, wingSpan, -size * 0.18);
      ctx.quadraticCurveTo(wingSpan * 0.76, size * 0.1, size * 0.16, size * 0.1);
      ctx.closePath();
      ctx.fillStyle = '#fde047';
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = '#b45309';
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  drawBombTimerOverlay(ctx, cx, cy, size, timer, now) {
    const danger = timer <= 3;
    // Nhịp thở chậm tối đa ~1.6 Hz (an toàn dưới ngưỡng 3 lần chớp/giây)
    const pulse = danger ? 1 + 0.1 * Math.sin(now * 0.01) : 1;
    const bx = cx + size * 0.24;
    const by = cy + size * 0.24;
    const br = size * 0.22 * pulse;

    ctx.save();
    // Dây cháy chậm phát tia lửa trên đỉnh viên kẹo
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.1, cy - size * 0.3);
    ctx.quadraticCurveTo(cx + size * 0.28, cy - size * 0.46, cx + size * 0.34, cy - size * 0.34);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx + size * 0.34, cy - size * 0.34, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = danger ? '#ef4444' : '#fef08a';
    ctx.fill();

    // Huy hiệu đếm ngược tương phản cao
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fillStyle = danger ? '#991b1b' : '#090d1a';
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = danger ? '#fecaca' : '#fde047';
    ctx.stroke();

    ctx.font = `900 ${Math.max(11, Math.round(size * 0.25))}px "Fredoka", "Nunito", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(String(timer), bx, by + 0.5);
    ctx.restore();
  }

  // Băng Chuyền Cầu Thang Dịch Chuyển (Conveyor Belt)
  drawConveyorPlates(ctx, conveyorLoops, cs, now) {
    const phase = ((now * 0.0022) % 1 + 1) % 1;
    ctx.save();
    for (const loop of conveyorLoops) {
      if (!Array.isArray(loop) || loop.length < 2) continue;
      for (let i = 0; i < loop.length; i++) {
        const cur = loop[i];
        const nxt = loop[(i + 1) % loop.length];
        const x = this.padding + cur.c * cs + 2.5;
        const y = this.padding + cur.r * cs + 2.5;
        const w = cs - 5;
        const h = cs - 5;

        roundRectPath(ctx, x, y, w, h, cs * 0.14);
        ctx.fillStyle = 'rgba(30, 41, 59, 0.52)';
        ctx.fill();
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.62)';
        ctx.stroke();

        const dx = nxt.c - cur.c;
        const dy = nxt.r - cur.r;
        const angle = Math.atan2(dy, dx);
        const shift = (phase - 0.5) * cs * 0.22;
        const cx = x + w * 0.5 + Math.cos(angle) * shift;
        const cy = y + h * 0.5 + Math.sin(angle) * shift;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-cs * 0.12, -cs * 0.14);
        ctx.lineTo(cs * 0.08, 0);
        ctx.lineTo(-cs * 0.12, cs * 0.14);
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.72)';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // Vạc Độc Dược Đẻ Vật Cản (Magic Cauldron 1..3 HP)
  drawMagicCauldron(ctx, x, y, w, h, hp, now) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, w * 0.18);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#a855f7';
    ctx.stroke();

    const cx = x + w * 0.5;
    const cy = y + h * 0.55;
    const potW = w * 0.68;
    const potH = h * 0.54;

    // Thân vạc gang đen viền đồng phép thuật
    ctx.beginPath();
    ctx.ellipse(cx, cy + potH * 0.06, potW * 0.5, potH * 0.48, 0, 0, Math.PI * 2);
    const potGrad = ctx.createRadialGradient(cx - potW * 0.15, cy - potH * 0.1, 2, cx, cy, potW * 0.55);
    potGrad.addColorStop(0, '#4c1d95');
    potGrad.addColorStop(0.65, '#1e1b4b');
    potGrad.addColorStop(1, '#090d1a');
    ctx.fillStyle = potGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();

    // Miệng vạc & nước độc dược lục bảo sôi sục
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.34, potW * 0.44, h * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    // Bọt khí độc dược nổi lấp lánh
    const b1 = Math.sin(now * 0.006) * 2.5;
    const b2 = Math.cos(now * 0.007) * 2.5;
    ctx.fillStyle = '#bef264';
    ctx.beginPath();
    ctx.arc(cx - w * 0.11, y + h * 0.28 + b1, w * 0.055, 0, Math.PI * 2);
    ctx.arc(cx + w * 0.12, y + h * 0.25 + b2, w * 0.045, 0, Math.PI * 2);
    ctx.fill();

    // Ngọc chỉ báo máu Vạc (1..3 viên)
    for (let i = 0; i < 3; i++) {
      const gx = cx + (i - 1) * w * 0.19;
      const gy = y + h * 0.78;
      ctx.beginPath();
      ctx.arc(gx, gy, w * 0.065, 0, Math.PI * 2);
      ctx.fillStyle = i < hp ? '#fde047' : 'rgba(148, 163, 184, 0.25)';
      ctx.fill();
    }
    ctx.restore();
  }

  // Ô Khoá Vàng Hầm Ngục Gringotts (Sugar Lock)
  drawGringottsPadlock(ctx, x, y, w, h, rad, now) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, rad);
    ctx.fillStyle = 'rgba(120, 53, 15, 0.24)';
    ctx.fill();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();

    // Hai sợi dây xích vàng chéo phong ấn
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 4);
    ctx.lineTo(x + w - 4, y + h - 4);
    ctx.moveTo(x + w - 4, y + 4);
    ctx.lineTo(x + 4, y + h - 4);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Ổ khoá vàng Gringotts ở chính giữa
    const cx = x + w * 0.5;
    const cy = y + h * 0.54;
    const lw = w * 0.36;
    const lh = h * 0.3;
    const pulse = 0.85 + 0.15 * Math.sin(now * 0.006);

    ctx.beginPath();
    ctx.arc(cx, cy - lh * 0.45, lw * 0.32, Math.PI, 0, false);
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    roundRectPath(ctx, cx - lw * 0.5, cy - lh * 0.45, lw, lh, 4);
    ctx.fillStyle = '#b45309';
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = `rgba(254, 240, 138, ${pulse})`;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, lw * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = '#fef9c3';
    ctx.fill();
    ctx.restore();
  }

  // Huy Hiệu Chìa Khoá Đường Có Cánh (Sugar Key Badge ở góc trên trái viên kẹo)
  drawSugarKeyBadge(ctx, cx, cy, size, now) {
    const kx = cx - size * 0.24;
    const ky = cy - size * 0.24;
    const kr = size * 0.21;
    const bob = Math.sin(now * 0.009) * 1.6;

    ctx.save();
    ctx.translate(kx, ky + bob);
    ctx.beginPath();
    ctx.arc(0, 0, kr, 0, Math.PI * 2);
    ctx.fillStyle = '#78350f';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    // Biểu tượng chìa khoá vàng thu nhỏ
    ctx.beginPath();
    ctx.arc(-kr * 0.22, -kr * 0.12, kr * 0.28, 0, Math.PI * 2);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(kr * 0.48, kr * 0.36);
    ctx.moveTo(kr * 0.28, kr * 0.22);
    ctx.lineTo(kr * 0.14, kr * 0.42);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }

  drawVfx(ctx, vfx, cs, size, now) {
    // 1. Tia kẹo phóng ngang / dọc rực rỡ (có dừng lại đúng tại ô Xoáy Cam Thảo nếu bị chặn!)
    for (const b of vfx.beams) {
      const p = 1 - b.life / b.maxLife;
      const alpha = Math.max(0, 1 - p);
      ctx.save();
      ctx.globalAlpha = alpha;
      const center = this.cellCenter(b.r, b.c);
      const thickness = cs * b.widthFactor * (1.05 - p * 0.45);
      if (b.dir === 'h') {
        const cStart = b.cStart ?? 0;
        const cEnd = b.cEnd ?? size - 1;
        const x0 = this.padding + cStart * cs;
        const spanW = Math.max(cs, (cEnd - cStart + 1) * cs);
        const g = ctx.createLinearGradient(0, center.y - thickness / 2, 0, center.y + thickness / 2);
        g.addColorStop(0, 'rgba(255, 255, 255, 0)');
        g.addColorStop(0.25, b.color || '#ff66b3');
        g.addColorStop(0.5, '#ffffff');
        g.addColorStop(0.75, b.color || '#ff66b3');
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(x0, center.y - thickness / 2, spanW, thickness);
      } else {
        const rStart = b.rStart ?? 0;
        const rEnd = b.rEnd ?? size - 1;
        const y0 = this.padding + rStart * cs;
        const spanH = Math.max(cs, (rEnd - rStart + 1) * cs);
        const g = ctx.createLinearGradient(center.x - thickness / 2, 0, center.x + thickness / 2, 0);
        g.addColorStop(0, 'rgba(255, 255, 255, 0)');
        g.addColorStop(0.25, b.color || '#ff66b3');
        g.addColorStop(0.5, '#ffffff');
        g.addColorStop(0.75, b.color || '#ff66b3');
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(center.x - thickness / 2, y0, thickness, spanH);
      }
      ctx.restore();
    }

    // 2. Đường bay lượn vòng cung của Kẹo Cánh Vàng Tầm Thủ (Seeker Homing Projectiles)
    for (const sk of vfx.seekers || []) {
      const t = Math.min(1, Math.max(0, 1 - sk.life / sk.maxLife));
      const from = this.cellCenter(sk.r1, sk.c1);
      const to = this.cellCenter(sk.r2, sk.c2);
      const midX = (from.x + to.x) * 0.5;
      const midY = Math.min(from.y, to.y) - cs * 1.15;
      const inv = 1 - t;
      const x = inv * inv * from.x + 2 * inv * t * midX + t * t * to.x;
      const y = inv * inv * from.y + 2 * inv * t * midY + t * t * to.y;

      ctx.save();
      this.drawGoldenSeekerWings(ctx, x, y, cs * 0.72, now);
      ctx.beginPath();
      ctx.arc(x, y, cs * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = sk.color || '#fde047';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.restore();
    }

    // 3. Tia sét cầu vồng từ Cầu Đậu Ngũ Sắc
    for (const arc of vfx.arcs) {
      const alpha = Math.max(0, arc.life / arc.maxLife);
      const from = this.cellCenter(arc.r1, arc.c1);
      const to = this.cellCenter(arc.r2, arc.c2);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = arc.color || '#ffeb3b';
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      const steps = 5;
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        ctx.lineTo(
          from.x + (to.x - from.x) * t + (Math.random() - 0.5) * 14,
          from.y + (to.y - from.y) * t + (Math.random() - 0.5) * 14
        );
      }
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();
    }

    // 4. Vòng sóng nổ Kẹo Bọc 3x3 / 5x5
    for (const ring of vfx.rings) {
      const p = 1 - ring.life / ring.maxLife;
      const center = this.cellCenter(ring.r, ring.c);
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p);
      ctx.strokeStyle = ring.color || '#ffffff';
      ctx.lineWidth = Math.max(2, 7 * (1 - p));
      ctx.beginPath();
      ctx.arc(center.x, center.y, cs * (0.3 + p * ring.maxRadiusCells), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Mảnh kẹo & bụi sao văng tung toé
    for (const pt of vfx.particles) {
      const alpha = Math.max(0, pt.life / pt.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.arc(pt.x - pt.size * 0.25, pt.y - pt.size * 0.25, pt.size * 0.3 * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 6. Chữ điểm & Khẩu hiệu phép thuật
    for (const pop of vfx.popups) {
      const alpha = Math.min(1, (pop.life / pop.maxLife) * 1.45);
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.font = `800 ${pop.size}px "Fredoka", "Nunito", sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 5.5;
      ctx.strokeStyle = '#090514';
      ctx.strokeText(pop.text, pop.x, pop.y);
      ctx.fillStyle = pop.color || '#fde047';
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    }
  }
}
