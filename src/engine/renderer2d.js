// Bộ dựng hình Bàn Cờ & Kẹo Phép 3D Bóng Bẩy chuẩn Candy Crush Saga × Thế Giới Phù Thủy Đêm Tối
// Hỗ trợ Khay 7×7 → 10×10, Vật Cản Đa Lớp (1–5 lớp) & 6 Cơ Chế Hắc Ám Độc Quyền Năm 2–7

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
    const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    this.dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.85 : 2.25);
    this.boardPx = 480;
    this.padding = 14;
    this.cellSize = 56;
    this.observedCssSize = 0;
    this.currentGridSize = 0;
    this.currentCssSize = 0;
    this.bgCanvas = null;
    this.bgCtx = null;
    this.bgDirty = true;
    this.lastBgKey = '';
    this.sprites = {};
    this.preloadSprites();

    if (typeof ResizeObserver !== 'undefined' && typeof Element !== 'undefined' && canvas instanceof Element) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height || w;
          const sz = Math.floor(Math.min(w, h));
          if (sz > 0 && sz !== this.observedCssSize) {
            this.observedCssSize = sz;
            this.bgDirty = true;
          }
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
      img.onload = () => {
        this.bgDirty = true;
        this.onSpriteReady?.();
      };
      img.onerror = () => {
        if (url.endsWith('.webp')) {
          img.src = url.replace(/\.webp$/, '.png');
        }
      };
      img.src = url;
      this.sprites[key] = img;
    };

    for (let i = 0; i < 6; i++) {
      load(`c_${i}`, `/assets/candy-${i}.webp`);
      load(`c_${i}_sh`, `/assets/candy-${i}-sh.webp`);
      load(`c_${i}_sv`, `/assets/candy-${i}-sv.webp`);
      load(`c_${i}_wr`, `/assets/candy-${i}-wrapped.webp`);
    }
    load('color_bomb', '/assets/candy-colorbomb.webp');
  }

  getSpriteForPiece(piece) {
    if (piece.special === 'color_bomb') return this.sprites.color_bomb;
    if (piece.special === 'striped_h') return this.sprites[`c_${piece.color}_sh`];
    if (piece.special === 'striped_v') return this.sprites[`c_${piece.color}_sv`];
    if (piece.special === 'wrapped') return this.sprites[`c_${piece.color}_wr`];
    return this.sprites[`c_${piece.color}`];
  }

  invalidateBg() {
    this.bgDirty = true;
  }

  resize(gridSize) {
    let rawCssSize = this.observedCssSize;
    if (!rawCssSize || rawCssSize <= 0) {
      const rect = this.canvas.getBoundingClientRect();
      rawCssSize = Math.floor(Math.min(rect.width, rect.height || rect.width));
    }
    const cssSize = Math.max(240, rawCssSize);
    if (this.currentGridSize === gridSize && this.currentCssSize === cssSize) {
      return;
    }
    this.currentGridSize = gridSize;
    this.currentCssSize = cssSize;

    const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    this.dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.85 : 2.25);
    const targetW = Math.round(cssSize * this.dpr);
    if (this.canvas.width !== targetW || this.canvas.height !== targetW) {
      this.canvas.width = targetW;
      this.canvas.height = targetW;
      this.bgDirty = true;
    }
    this.boardPx = cssSize;
    this.padding = Math.max(8, Math.round(cssSize * (gridSize >= 10 ? 0.022 : 0.028)));
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

  renderStaticBg(size, mask, cs) {
    if (!this.bgCanvas) {
      this.bgCanvas = document.createElement('canvas');
      this.bgCtx = this.bgCanvas.getContext('2d');
    }
    const targetW = this.canvas.width;
    const targetH = this.canvas.height;
    if (this.bgCanvas.width !== targetW || this.bgCanvas.height !== targetH) {
      this.bgCanvas.width = targetW;
      this.bgCanvas.height = targetH;
    }

    const bCtx = this.bgCtx;
    bCtx.clearRect(0, 0, targetW, targetH);
    bCtx.save();
    bCtx.scale(this.dpr, this.dpr);

    this.drawBoardTray(bCtx, size, mask, cs);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (mask[r][c] === 0) continue;
        const x = this.padding + c * cs;
        const y = this.padding + r * cs;
        const isEven = (r + c) % 2 === 0;

        bCtx.fillStyle = isEven ? 'rgba(13, 18, 34, 0.93)' : 'rgba(23, 31, 56, 0.90)';
        roundRectPath(bCtx, x + 1, y + 1, cs - 2, cs - 2, cs * 0.14);
        bCtx.fill();

        bCtx.lineWidth = 1.1;
        bCtx.strokeStyle = 'rgba(212, 160, 23, 0.28)';
        bCtx.stroke();
      }
    }
    bCtx.restore();

    this.bgDirty = false;
    this.lastBgKey = `${size}_${this.boardPx}_${this.dpr}`;
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
      petrify = [],
      dementor = [],
      decree = [],
      fiendfyre = [],
      horcrux = [],
      mazeConfig = null,
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
    ctx.imageSmoothingQuality = 'medium';
    ctx.clearRect(0, 0, this.boardPx, this.boardPx);

    if (vfx.shake > 0.2) {
      ctx.translate((Math.random() - 0.5) * vfx.shake, (Math.random() - 0.5) * vfx.shake);
    }

    // 1. Nền khay Hắc Thạch tĩnh từ offscreen cache canvas
    const bgKey = `${size}_${this.boardPx}_${this.dpr}`;
    if (this.bgDirty || this.lastBgKey !== bgKey) {
      this.renderStaticBg(size, mask, cs);
    }
    ctx.drawImage(this.bgCanvas, 0, 0, this.boardPx, this.boardPx);

    // 1b. Tiền tính vùng cấm phép 3×3 của Bia Sắc Lệnh Umbridge (nếu có)
    let decreeCenters = null;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if ((decree[r]?.[c] || 0) > 0) {
          if (!decreeCenters) decreeCenters = [];
          decreeCenters.push({ r, c });
        }
      }
    }

    // 1c. Vẽ rãnh Gió Lốc Mê Cung Tam Pháp Thuật (Năm 4+) dưới mặt kẹo
    if (mazeConfig && Array.isArray(mazeConfig.rows) && mazeConfig.rows.length > 0) {
      this.drawMazeWindPlates(ctx, mazeConfig, mask, size, cs, now);
    }

    // 2. Vẽ các phần tử mặt sàn & thực thể đứng yên: Thạch (1–5), Đá Cổ Ngữ (1–5), Sô-cô-la, Vạc, Giám Ngục, Bia Sắc Lệnh, Lửa Fiendfyre, Linh Giá
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (mask[r][c] === 0) continue;
        const x = this.padding + c * cs;
        const y = this.padding + r * cs;

        if (jelly[r]?.[c] > 0) {
          this.drawCandyJelly(ctx, x + 2, y + 2, cs - 4, cs - 4, cs * 0.16, jelly[r][c]);
        }

        if (decreeCenters && !(decree[r]?.[c] > 0)) {
          const inAura = decreeCenters.some((dc) => Math.abs(dc.r - r) <= 1 && Math.abs(dc.c - c) <= 1);
          if (inAura) {
            this.drawDecreeAuraCell(ctx, x + 2, y + 2, cs - 4, cs - 4, cs * 0.14);
          }
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

        const dementorHp = dementor[r]?.[c] || 0;
        if (dementorHp > 0) {
          this.drawDementorWraith(ctx, x + 2, y + 2, cs - 4, cs - 4, cs * 0.16, dementorHp, now);
        }

        const decreeHp = decree[r]?.[c] || 0;
        if (decreeHp > 0) {
          this.drawUmbridgeDecreePlaque(ctx, x + 2, y + 2, cs - 4, cs - 4, cs * 0.15, decreeHp, now);
        }

        const fiendfyreHp = fiendfyre[r]?.[c] || 0;
        if (fiendfyreHp > 0) {
          this.drawFiendfyreFlame(ctx, x + 2, y + 2, cs - 4, cs - 4, cs * 0.16, fiendfyreHp, now);
        }

        const horcruxHp = horcrux[r]?.[c] || 0;
        if (horcruxHp > 0) {
          this.drawHorcruxRelic(ctx, x + 2, y + 2, cs - 4, cs - 4, cs * 0.16, horcruxHp, now);
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

    // 2b. Vẽ Băng Chuyền Cầu Thang, Cổng Bột Floo & Lối Thoát Bảo Vật
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

    // 3. Vẽ Viên Kẹo 3D + Lớp Hoá Đá Tử Xà, Băng Azkaban (1–5) & Ổ Khoá Gringotts
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

        const isPetrified = (petrify[r]?.[c] || 0) > 0;
        this.drawCandyPiece(ctx, piece, cx, cy, cs * 0.92 * scale, isPetrified ? 0.55 : piece.alpha ?? 1, now);

        if (isPetrified) {
          const x = this.padding + piece.x * cs + 2;
          const y = this.padding + piece.y * cs + 2;
          this.drawPetrifiedStoneOverlay(ctx, x, y, cs - 4, cs - 4, cs * 0.16, petrify[r][c]);
        }

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

    // 4. Vẽ hiệu ứng Tia Kẹo Nổ, Kẹo Tầm Thủ Bay, Cầu Vồng, Mảnh Kẹo & Chữ Khen
    this.drawVfx(ctx, vfx, cs, size, now);

    ctx.restore();
  }

  drawLayerBadge(ctx, x, y, w, h, count, bg = '#090d1a', border = '#fde047', textColor = '#fef08a') {
    if (count < 2) return;
    const r = Math.max(6.2, Math.min(9.5, w * 0.2));
    const bx = x + w - r - 1.5;
    const by = y + r + 1.5;
    ctx.save();
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = border;
    ctx.stroke();

    ctx.font = `900 ${Math.max(8, Math.round(r * 1.18))}px "Fredoka", "Nunito", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;
    ctx.fillText(String(count), bx, by + 0.5);
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
    fillConnectedShape(5.8, cs * 0.24);

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#3b2507';
    fillConnectedShape(3.4, cs * 0.21);

    ctx.fillStyle = '#080b16';
    fillConnectedShape(1.4, cs * 0.18);
    ctx.restore();
  }

  // Thạch Hắc Ám 1–5 lớp
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
      ctx.lineWidth = 2.1;
      ctx.strokeStyle = 'rgba(216, 180, 254, 0.78)';
      ctx.stroke();
    } else if (layer === 2) {
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, 'rgba(126, 34, 206, 0.80)');
      g.addColorStop(1, 'rgba(46, 16, 101, 0.86)');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 2.8;
      ctx.strokeStyle = '#e879f9';
      ctx.stroke();
    } else {
      // Thạch Hắc Ám Đặc 3–5 lớp (ánh tím hồng/vàng kim đậm dần)
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, layer >= 4 ? 'rgba(190, 24, 93, 0.88)' : 'rgba(109, 40, 217, 0.88)');
      g.addColorStop(1, 'rgba(24, 9, 58, 0.94)');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = layer >= 5 ? '#fde047' : layer === 4 ? '#f472b6' : '#c084fc';
      ctx.stroke();
      this.drawLayerBadge(ctx, x, y, w, h, layer, '#3b0764', '#fde047', '#fef08a');
    }
    ctx.restore();
  }

  // Đá Cổ Ngữ Hogwarts 1–5 lớp
  drawRuneFrosting(ctx, x, y, w, h, rad, layer) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, rad);
    const g = ctx.createLinearGradient(x, y, x, y + h);
    if (layer >= 4) {
      g.addColorStop(0, layer >= 5 ? '#fef08a' : '#cbd5e1');
      g.addColorStop(0.5, layer >= 5 ? '#78350f' : '#475569');
      g.addColorStop(1, '#0f172a');
    } else if (layer === 3) {
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

    ctx.lineWidth = layer >= 3 ? 3 : 2.2;
    ctx.strokeStyle = layer >= 4 ? '#fde047' : layer === 3 ? '#facc15' : layer === 2 ? '#cbd5e1' : '#94a3b8';
    ctx.stroke();

    roundRectPath(ctx, x + w * 0.14, y + h * 0.14, w * 0.72, h * 0.72, rad * 0.65);
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.strokeStyle = layer >= 2 ? '#fde047' : '#e2e8f0';
    ctx.lineWidth = 2.4;
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
      ctx.moveTo(x + w * 0.2, y + h * 0.25);
      ctx.lineTo(cx, cy);
      ctx.lineTo(x + w * 0.78, y + h * 0.35);
      ctx.moveTo(cx, cy);
      ctx.lineTo(x + w * 0.38, y + h * 0.8);
    }
    ctx.stroke();

    if (layer >= 3) {
      this.drawLayerBadge(ctx, x, y, w, h, layer, '#0f172a', '#fde047', '#fef08a');
    }
    ctx.restore();
  }

  // Sô-cô-la Hắc Ám Tự Lan
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

    const pad = w * 0.15;
    const sq = (w - pad * 2.5) / 2;
    const positions = [
      [x + pad, y + pad],
      [x + pad * 1.5 + sq, y + pad],
      [x + pad, y + pad * 1.5 + sq],
      [x + pad * 1.5 + sq, y + pad * 1.5 + sq]
    ];
    for (const [sx, sy] of positions) {
      roundRectPath(ctx, sx, sy, sq, sq, 3.5);
      ctx.fillStyle = '#4e210c';
      ctx.fill();
      ctx.strokeStyle = 'rgba(253, 230, 138, 0.28)';
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.5, w * 0.11, 0, Math.PI * 2);
    ctx.fillStyle = '#c084fc';
    ctx.fill();
    ctx.restore();
  }

  // [NĂM 2] Lớp Hoá Đá Tử Xà Basilisk (1–3 lớp bọc cứng viên kẹo, ngăn đổi chỗ/rơi/ghép màu!)
  drawPetrifiedStoneOverlay(ctx, x, y, w, h, rad, layer) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, rad);
    ctx.fillStyle = layer >= 2 ? 'rgba(51, 65, 85, 0.72)' : 'rgba(71, 85, 105, 0.52)';
    ctx.fill();
    ctx.lineWidth = layer >= 2 ? 3 : 2.2;
    ctx.strokeStyle = layer >= 3 ? '#fde047' : '#6ee7b7';
    ctx.stroke();

    // Đường nứt đá & con mắt rắn xanh lục bảo
    ctx.beginPath();
    ctx.moveTo(x + w * 0.16, y + h * 0.22);
    ctx.lineTo(x + w * 0.44, y + h * 0.48);
    ctx.lineTo(x + w * 0.28, y + h * 0.82);
    ctx.moveTo(x + w * 0.84, y + h * 0.26);
    ctx.lineTo(x + w * 0.56, y + h * 0.52);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    const cx = x + w * 0.5;
    const cy = y + h * 0.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.17, h * 0.11, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.08);
    ctx.lineTo(cx, cy + h * 0.08);
    ctx.strokeStyle = '#022c22';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (layer >= 2) {
      this.drawLayerBadge(ctx, x, y, w, h, layer, '#064e3b', '#6ee7b7', '#fef08a');
    }
    ctx.restore();
  }

  // [NĂM 3] Giám Ngục Hút Nộ Azkaban (2–4 HP)
  drawDementorWraith(ctx, x, y, w, h, rad, hp, now) {
    const hover = Math.sin(now * 0.005 + x * 0.04) * 2;
    ctx.save();
    roundRectPath(ctx, x, y, w, h, rad);
    ctx.fillStyle = 'rgba(8, 20, 42, 0.92)';
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    const cx = x + w * 0.5;
    const cy = y + h * 0.48 + hover;
    // Áo choàng đen Giám Ngục
    ctx.beginPath();
    ctx.moveTo(cx, cy - h * 0.34);
    ctx.quadraticCurveTo(cx + w * 0.34, cy - h * 0.24, cx + w * 0.3, cy + h * 0.24);
    ctx.lineTo(cx + w * 0.14, cy + h * 0.15);
    ctx.lineTo(cx, cy + h * 0.27);
    ctx.lineTo(cx - w * 0.14, cy + h * 0.15);
    ctx.lineTo(cx - w * 0.3, cy + h * 0.24);
    ctx.quadraticCurveTo(cx - w * 0.34, cy - h * 0.24, cx, cy - h * 0.34);
    ctx.closePath();
    ctx.fillStyle = '#020617';
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#7dd3fc';
    ctx.stroke();

    // Hốc mũ băng giá
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.arc(cx - w * 0.08, cy - h * 0.08, Math.max(1.6, w * 0.042), 0, Math.PI * 2);
    ctx.arc(cx + w * 0.08, cy - h * 0.08, Math.max(1.6, w * 0.042), 0, Math.PI * 2);
    ctx.fill();

    // Ngọc chỉ báo máu Giám Ngục (tối đa 4 viên)
    const maxPips = Math.max(3, hp);
    const span = w * 0.56;
    for (let i = 0; i < maxPips; i++) {
      const gx = cx - span * 0.5 + (maxPips === 1 ? 0 : (i / (maxPips - 1)) * span);
      const gy = y + h * 0.84;
      ctx.beginPath();
      ctx.arc(gx, gy, Math.max(2, w * 0.052), 0, Math.PI * 2);
      ctx.fillStyle = i < hp ? '#38bdf8' : 'rgba(148, 163, 184, 0.25)';
      ctx.fill();
    }
    ctx.restore();
  }

  // [NĂM 4] Rãnh Gió Lốc Mê Cung Tam Pháp Thuật
  drawMazeWindPlates(ctx, mazeConfig, mask, size, cs, now) {
    const shift = (((now * 0.002) % 1) + 1) % 1;
    ctx.save();
    mazeConfig.rows.forEach((r, idx) => {
      if (r < 0 || r >= size) return;
      const dir = idx % 2 === 0 ? 1 : -1;
      for (let c = 0; c < size; c++) {
        if (mask[r]?.[c] !== 1) continue;
        const x = this.padding + c * cs + 2;
        const y = this.padding + r * cs + 2;
        const w = cs - 4;
        const h = cs - 4;

        roundRectPath(ctx, x, y, w, h, cs * 0.14);
        ctx.fillStyle = 'rgba(6, 78, 59, 0.34)';
        ctx.fill();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
        ctx.stroke();

        const cx = x + w * 0.5 + dir * (shift - 0.5) * cs * 0.22;
        const cy = y + h * 0.5;
        ctx.beginPath();
        ctx.moveTo(cx - dir * cs * 0.1, cy - cs * 0.11);
        ctx.lineTo(cx + dir * cs * 0.08, cy);
        ctx.lineTo(cx - dir * cs * 0.1, cy + cs * 0.11);
        ctx.strokeStyle = 'rgba(110, 231, 183, 0.65)';
        ctx.lineWidth = 1.9;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  // [NĂM 5] Vùng cấm phép 3×3 & Bia Sắc Lệnh Hồng Umbridge
  drawDecreeAuraCell(ctx, x, y, w, h, rad) {
    ctx.save();
    roundRectPath(ctx, x + 1, y + 1, w - 2, h - 2, rad);
    ctx.fillStyle = 'rgba(236, 72, 153, 0.11)';
    ctx.fill();
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.52)';
    ctx.stroke();
    ctx.restore();
  }

  drawUmbridgeDecreePlaque(ctx, x, y, w, h, rad, hp, now) {
    const pulse = 0.82 + 0.18 * Math.sin(now * 0.006);
    ctx.save();
    roundRectPath(ctx, x + w * 0.06, y, w * 0.88, h, rad);
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, '#be185d');
    g.addColorStop(0.6, '#831843');
    g.addColorStop(1, '#500724');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = `rgba(253, 224, 71, ${pulse})`;
    ctx.stroke();

    // Dòng chữ sắc lệnh & con dấu Bộ Pháp Thuật
    ctx.strokeStyle = '#fbcfe8';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.24, y + h * 0.28);
    ctx.lineTo(x + w * 0.76, y + h * 0.28);
    ctx.moveTo(x + w * 0.24, y + h * 0.44);
    ctx.lineTo(x + w * 0.72, y + h * 0.44);
    ctx.moveTo(x + w * 0.24, y + h * 0.6);
    ctx.lineTo(x + w * 0.56, y + h * 0.6);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + w * 0.7, y + h * 0.62, w * 0.09, 0, Math.PI * 2);
    ctx.fillStyle = '#fde047';
    ctx.fill();

    this.drawLayerBadge(ctx, x, y, w, h, hp, '#500724', '#f9a8d4', '#fef08a');
    ctx.restore();
  }

  // [NĂM 6] Lửa Địa Ngục Fiendfyre (2 HP: tự bùng lan & nung ngắn ngòi Bom!)
  drawFiendfyreFlame(ctx, x, y, w, h, rad, hp, now) {
    const flicker = Math.sin(now * 0.011 + x * 0.1) * (w * 0.045);
    ctx.save();
    roundRectPath(ctx, x, y, w, h, rad);
    ctx.fillStyle = 'rgba(67, 20, 7, 0.9)';
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = hp >= 2 ? '#fb923c' : '#fde047';
    ctx.stroke();

    const cx = x + w * 0.5;
    const botY = y + h * 0.84;

    // Ngọn lửa ngoài cam đỏ rực
    ctx.beginPath();
    ctx.moveTo(cx, y + h * 0.12);
    ctx.quadraticCurveTo(cx + w * 0.36 + flicker, y + h * 0.38, cx + w * 0.28, botY);
    ctx.quadraticCurveTo(cx, y + h * 0.92, cx - w * 0.28, botY);
    ctx.quadraticCurveTo(cx - w * 0.36 - flicker, y + h * 0.38, cx, y + h * 0.12);
    ctx.closePath();
    ctx.fillStyle = '#ea580c';
    ctx.fill();

    // Lõi lửa vàng trắng ma quái
    ctx.beginPath();
    ctx.moveTo(cx + flicker * 0.4, y + h * 0.3);
    ctx.quadraticCurveTo(cx + w * 0.18, y + h * 0.52, cx + w * 0.14, botY - h * 0.06);
    ctx.quadraticCurveTo(cx, botY, cx - w * 0.14, botY - h * 0.06);
    ctx.quadraticCurveTo(cx - w * 0.18, y + h * 0.52, cx + flicker * 0.4, y + h * 0.3);
    ctx.closePath();
    ctx.fillStyle = hp >= 2 ? '#fef08a' : '#fda4af';
    ctx.fill();

    if (hp >= 2) {
      this.drawLayerBadge(ctx, x, y, w, h, hp, '#431407', '#fb923c', '#fef08a');
    }
    ctx.restore();
  }

  // [NĂM 7] Trường Sinh Linh Giá (Horcrux 4–5 HP: Khiên Hồn Tối Thượng khi HP >= 4!)
  drawHorcruxRelic(ctx, x, y, w, h, rad, hp, now) {
    const shielded = hp >= 4;
    const pulse = 0.72 + 0.28 * Math.sin(now * 0.008);
    const cx = x + w * 0.5;
    const cy = y + h * 0.5;
    const r = Math.min(w, h) * 0.38;

    ctx.save();
    roundRectPath(ctx, x, y, w, h, rad);
    ctx.fillStyle = shielded ? 'rgba(30, 11, 56, 0.94)' : 'rgba(6, 46, 36, 0.92)';
    ctx.fill();
    ctx.lineWidth = shielded ? 2.8 : 2.2;
    ctx.strokeStyle = shielded ? `rgba(192, 132, 252, ${pulse})` : '#34d399';
    ctx.stroke();

    // Vòng Khiên Hồn Tối Thượng (báo hiệu rõ ràng: miễn nhiễm ghép thường khi HP >= 4!)
    if (shielded) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.12, 0, Math.PI * 2);
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = '#fde047';
      ctx.stroke();
    }

    // Mề đay lục giác Hắc Ám
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const ang = -Math.PI / 2 + (i * Math.PI) / 3;
      const px = cx + Math.cos(ang) * r * 0.88;
      const py = cy + Math.sin(ang) * r * 0.88;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = shielded ? '#3b0764' : '#065f46';
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    // Lõi mảnh hồn trung tâm
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.34, 0, Math.PI * 2);
    ctx.fillStyle = shielded ? '#e879f9' : '#6ee7b7';
    ctx.fill();

    this.drawLayerBadge(
      ctx,
      x,
      y,
      w,
      h,
      hp,
      shielded ? '#581c87' : '#064e3b',
      shielded ? '#fde047' : '#6ee7b7',
      '#ffffff'
    );
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

  // Băng Ngục Azkaban 1–5 lớp
  drawSugarIceLock(ctx, x, y, w, h, rad, layer) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, rad);
    ctx.fillStyle =
      layer >= 4
        ? 'rgba(14, 116, 144, 0.48)'
        : layer >= 2
          ? 'rgba(125, 211, 252, 0.30)'
          : 'rgba(186, 230, 253, 0.18)';
    ctx.fill();
    ctx.lineWidth = layer >= 3 ? 3.4 : layer === 2 ? 3 : 2.2;
    ctx.strokeStyle = layer >= 4 ? '#38bdf8' : '#ffffff';
    ctx.stroke();

    if (layer >= 2) {
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 5);
      ctx.lineTo(x + w - 5, y + h - 5);
      ctx.moveTo(x + w - 5, y + 5);
      ctx.lineTo(x + 5, y + h - 5);
      ctx.strokeStyle = 'rgba(14, 116, 144, 0.68)';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2.6;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 15);
      ctx.lineTo(x + 15, y + 5);
      ctx.moveTo(x + w - 15, y + h - 5);
      ctx.lineTo(x + w - 5, y + h - 15);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    if (layer >= 3) {
      this.drawLayerBadge(ctx, x, y, w, h, layer, '#083344', '#7dd3fc', '#ffffff');
    }
    ctx.restore();
  }

  drawCandyPiece(ctx, piece, cx, cy, drawSize, alpha = 1, now = 0) {
    if (drawSize <= 2) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    if (piece.isIngredient) {
      this.drawPhilosopherStone(ctx, cx, cy, drawSize, now);
      ctx.restore();
      return;
    }

    if (piece.blocker === 'swirl') {
      this.drawLicoriceSwirl(ctx, cx, cy, drawSize);
      ctx.restore();
      return;
    }

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

    if (piece.special === 'seeker') {
      this.drawGoldenSeekerWings(ctx, cx, cy, drawSize, now);
    }

    const sprite = this.getSpriteForPiece(piece);
    const renderScale = piece.special === 'seeker' ? 0.78 : 1;
    const sSize = drawSize * renderScale;

    ctx.beginPath();
    ctx.ellipse(cx, cy + sSize * 0.38, sSize * 0.34, sSize * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.fill();

    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      ctx.drawImage(sprite, cx - sSize / 2, cy - sSize / 2, sSize, sSize);
    } else {
      const r = sSize * 0.4;
      ctx.fillStyle = TILE_TYPES[piece.color]?.color || '#ff1e27';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (piece.special === 'seeker') {
      ctx.beginPath();
      ctx.arc(cx, cy, sSize * 0.43, 0, Math.PI * 2);
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();
    }

    if (piece.bombTimer !== null && piece.bombTimer !== undefined) {
      this.drawBombTimerOverlay(ctx, cx, cy, drawSize, piece.bombTimer, now);
    }

    if (piece.hasKey) {
      this.drawSugarKeyBadge(ctx, cx, cy, drawSize, now);
    }

    ctx.restore();
  }

  drawPhilosopherStone(ctx, cx, cy, size, now) {
    const r = size * 0.44;
    const glow = 0.75 + 0.25 * Math.sin(now * 0.006);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(239, 68, 68, ${0.25 * glow})`;
    ctx.fill();

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
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.82, r * 0.85, r * 0.26, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.fill();

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
    const pulse = danger ? 1 + 0.1 * Math.sin(now * 0.01) : 1;
    const bx = cx + size * 0.24;
    const by = cy + size * 0.24;
    const br = size * 0.22 * pulse;

    ctx.save();
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

    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fillStyle = danger ? '#991b1b' : '#090d1a';
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = danger ? '#fecaca' : '#fde047';
    ctx.stroke();

    ctx.font = `900 ${Math.max(10, Math.round(size * 0.25))}px "Fredoka", "Nunito", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(String(timer), bx, by + 0.5);
    ctx.restore();
  }

  drawConveyorPlates(ctx, conveyorLoops, cs, now) {
    const phase = (((now * 0.0022) % 1) + 1) % 1;
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

  // Vạc Độc Dược Đẻ Vật Cản (1..3 HP)
  drawMagicCauldron(ctx, x, y, w, h, rad, hp, now) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, rad);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#a855f7';
    ctx.stroke();

    const cx = x + w * 0.5;
    const cy = y + h * 0.55;
    const potW = w * 0.68;
    const potH = h * 0.54;

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

    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.34, potW * 0.44, h * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    const b1 = Math.sin(now * 0.006) * 2.2;
    const b2 = Math.cos(now * 0.007) * 2.2;
    ctx.fillStyle = '#bef264';
    ctx.beginPath();
    ctx.arc(cx - w * 0.11, y + h * 0.28 + b1, w * 0.055, 0, Math.PI * 2);
    ctx.arc(cx + w * 0.12, y + h * 0.25 + b2, w * 0.045, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 3; i++) {
      const gx = cx + (i - 1) * w * 0.19;
      const gy = y + h * 0.8;
      ctx.beginPath();
      ctx.arc(gx, gy, w * 0.062, 0, Math.PI * 2);
      ctx.fillStyle = i < hp ? '#fde047' : 'rgba(148, 163, 184, 0.25)';
      ctx.fill();
    }
    ctx.restore();
  }

  drawGringottsPadlock(ctx, x, y, w, h, rad, now) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, rad);
    ctx.fillStyle = 'rgba(120, 53, 15, 0.24)';
    ctx.fill();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 4, y + 4);
    ctx.lineTo(x + w - 4, y + h - 4);
    ctx.moveTo(x + w - 4, y + 4);
    ctx.lineTo(x + 4, y + h - 4);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

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

    if (vfx.particles && vfx.particles.length > 0) {
      for (let i = 0; i < vfx.particles.length; i++) {
        const pt = vfx.particles[i];
        const alpha = Math.max(0, pt.life / pt.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

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
