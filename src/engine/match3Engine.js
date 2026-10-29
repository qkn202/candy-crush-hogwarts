// Engine Match-3 Chiến Thuật chuẩn Candy Crush Saga Gốc — Đầy đủ Vật Lý Trượt Chéo, Kẹo Bọc Nổ 2 Nhịp,
// Ghép Ô Vuông 2×2 Cánh Vàng Tầm Thủ, Thả Hòn Đá Phù Thủy, Đá Cổ Ngữ, Sô-cô-la Tự Lan, Xoáy Cam Thảo,
// Lò Sưởi Floo, Bom Đếm Ngược, Băng Chuyền, Vạc Độc Dược, Chìa Khoá Gringotts, Đấu Trùm & Thần Hộ Mệnh 4 Nhà

import { COMBO_PRAISES, TILE_TYPES } from '../data/lore.js';
import { BoardRenderer } from './renderer2d.js';
import { sound } from './sound.js';

let NEXT_PIECE_ID = 1;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nextAnimFrame(cb) {
  let done = false;
  const finish = (ts) => {
    if (done) return;
    done = true;
    cb(ts);
  };
  const raf = requestAnimationFrame((now) => {
    clearTimeout(timer);
    finish(now);
  });
  const timer = setTimeout(() => {
    cancelAnimationFrame(raf);
    finish(performance.now());
  }, 24);
}

export class Match3Engine {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.renderer = new BoardRenderer(canvas, () => {
      if (this.level && this.rafId !== null) {
        this.renderer.render(this.getRenderState(), performance.now());
      }
    });
    this.cb = callbacks; // onStateChange, onBoosterConsumed, onGameEnd, onToast
    this.sessionId = 0;

    this.level = null;
    this.size = 8;
    this.numColors = 5;
    this.house = 'gryffindor';
    this.collectionBuffs = { scoreBonusPct: 0, patronusBonusPct: 0 };

    this.mask = [];
    this.jelly = [];
    this.ice = [];
    this.frosting = [];
    this.chocolate = [];
    this.cauldron = [];
    this.cauldronCharge = [];
    this.cauldronStunnedThisTurn = new Set();
    this.lockGrid = [];
    this.conveyorLoops = [];
    this.portals = [];
    this.ingredientSpawnCols = [];
    this.ingredientExitCells = [];
    this.ingredientTarget = 0;
    this.ingredientsCollected = 0;
    this.ingredientsSpawned = 0;
    this.bombConfig = null;
    this.pendingBombSpawns = 0;

    this.bossConfig = null;
    this.bossMaxHp = 0;
    this.bossHp = 0;
    this.bossDefeated = false;
    this.patronusCharge = 0;

    this.grid = [];

    this.score = 0;
    this.movesLeft = 0;
    this.movesUsed = 0;
    this.collected = {};
    this.specialStats = { striped: 0, wrapped: 0, seeker: 0, color_bomb: 0 };
    this.initialJelly = 0;
    this.initialIce = 0;
    this.initialFrosting = 0;
    this.initialChocolate = 0;
    this.initialCauldronPots = 0;
    this.initialLocks = 0;
    this.chocolateBrokenThisTurn = false;
    this.lastSwapDir = 'h';

    this.selected = null;
    this.kbCursor = null;
    this.activeBooster = null; // 'hammer' | 'swap' | null
    this.busy = false;
    this.ended = false;

    this.lastActionAt = performance.now();
    this.hintPair = null;

    this.vfx = {
      beams: [],
      seekers: [],
      arcs: [],
      rings: [],
      particles: [],
      popups: [],
      shake: 0
    };

    this.pointerState = null;
    this.rafId = null;
    this.lastFrameTime = performance.now();

    this.bindInput();
  }

  hasStaticBlocker(r, c) {
    return (
      (this.frosting[r]?.[c] || 0) > 0 ||
      (this.chocolate[r]?.[c] || 0) > 0 ||
      (this.cauldron[r]?.[c] || 0) > 0
    );
  }

  isCellLocked(r, c) {
    return (this.ice[r]?.[c] || 0) > 0 || (this.lockGrid[r]?.[c] || 0) > 0;
  }

  isCellMatchable(r, c) {
    return (
      this.mask[r]?.[c] === 1 &&
      (this.lockGrid[r]?.[c] || 0) === 0 &&
      this.isMatchablePiece(this.grid[r]?.[c])
    );
  }

  activateCellInteraction(cell) {
    if (this.busy || this.ended || !this.level || !cell || this.mask[cell.r]?.[cell.c] === 0) return;
    this.resetIdleHint();

    if (this.activeBooster === 'hammer') {
      this.pointerState = null;
      this.executeHammer(cell.r, cell.c);
      return;
    }

    if (this.hasStaticBlocker(cell.r, cell.c)) {
      sound.playInvalid();
      this.spawnPopup(cell.r, cell.c, 'Ghép kẹo cạnh bên để phá!', '#fde047', 13);
      this.pointerState = null;
      return;
    }

    if (this.lockGrid[cell.r]?.[cell.c] > 0) {
      sound.playInvalid();
      this.spawnPopup(cell.r, cell.c, 'Cần ghép Chìa Khoá Vàng!', '#fde047', 13);
      this.pointerState = null;
      return;
    }

    if (this.ice[cell.r][cell.c] > 0) {
      sound.playInvalid();
      this.spawnPopup(cell.r, cell.c, 'Đang đóng băng!', '#7dd3fc', 14);
      this.pointerState = null;
      return;
    }

    if (!this.grid[cell.r][cell.c]) {
      this.pointerState = null;
      return;
    }

    if (!this.selected) {
      this.selected = { r: cell.r, c: cell.c };
      sound.playSelect();
    } else if (this.selected.r === cell.r && this.selected.c === cell.c) {
      this.selected = null;
    } else if (Math.abs(this.selected.r - cell.r) + Math.abs(this.selected.c - cell.c) === 1) {
      const first = this.selected;
      this.selected = null;
      this.pointerState = null;
      this.trySwap(first, { r: cell.r, c: cell.c });
    } else {
      this.selected = { r: cell.r, c: cell.c };
      sound.playSelect();
    }
  }

  findInitialKeyboardCell() {
    const mid = Math.floor(this.size / 2);
    if (this.mask[mid]?.[mid] === 1) return { r: mid, c: mid };
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.mask[r][c] === 1) return { r, c };
      }
    }
    return { r: 0, c: 0 };
  }

  bindInput() {
    this.onPointerDown = (e) => {
      if (e.button !== 0 || this.busy || this.ended || !this.level) return;
      if (e.pointerType === 'touch') {
        e.preventDefault?.();
      }
      const cell = this.renderer.screenToCell(e.clientX, e.clientY, this.size);
      if (!cell || this.mask[cell.r][cell.c] === 0) return;

      this.kbCursor = null;
      try {
        this.canvas.setPointerCapture?.(e.pointerId);
      } catch {
        // synthetic pointer events may not have an active hardware pointerId
      }
      this.pointerState = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        cell,
        swiped: false
      };
      this.activateCellInteraction(cell);
    };

    this.onPointerMove = (e) => {
      if (!this.pointerState || e.pointerId !== this.pointerState.pointerId || this.pointerState.swiped) return;
      if (this.busy || this.ended) return;

      const dx = e.clientX - this.pointerState.startX;
      const dy = e.clientY - this.pointerState.startY;
      const threshold =
        e.pointerType === 'touch'
          ? Math.max(9, this.renderer.cellSize * 0.18)
          : Math.max(14, this.renderer.cellSize * 0.28);

      if (Math.hypot(dx, dy) >= threshold) {
        this.pointerState.swiped = true;
        const from = this.pointerState.cell;
        let dr = 0;
        let dc = 0;
        if (Math.abs(dx) > Math.abs(dy)) dc = dx > 0 ? 1 : -1;
        else dr = dy > 0 ? 1 : -1;

        const to = { r: from.r + dr, c: from.c + dc };
        this.selected = null;
        if (this.isValidCell(to.r, to.c) && this.mask[to.r][to.c] === 1) {
          this.trySwap(from, to);
        }
      }
    };

    this.onPointerUp = (e) => {
      if (this.pointerState && e.pointerId === this.pointerState.pointerId) {
        this.pointerState = null;
      }
    };

    this.onKeyDown = (e) => {
      if (this.busy || this.ended || !this.level) return;
      const key = e.key;
      const arrowMap = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1]
      };

      if (key === 'p' || key === 'P') {
        if (this.patronusCharge >= 100) {
          e.preventDefault();
          this.castPatronus();
        }
        return;
      }

      if (arrowMap[key]) {
        e.preventDefault();
        this.resetIdleHint();
        if (!this.kbCursor) {
          this.kbCursor = this.selected ? { ...this.selected } : this.findInitialKeyboardCell();
        }
        const [dr, dc] = arrowMap[key];
        if (e.shiftKey && this.selected) {
          const to = { r: this.selected.r + dr, c: this.selected.c + dc };
          if (this.isValidCell(to.r, to.c) && this.mask[to.r][to.c] === 1) {
            const from = this.selected;
            this.selected = null;
            this.kbCursor = to;
            this.trySwap(from, to);
          }
          return;
        }
        for (let step = 1; step < this.size; step++) {
          const nr = this.kbCursor.r + dr * step;
          const nc = this.kbCursor.c + dc * step;
          if (!this.isValidCell(nr, nc)) break;
          if (this.mask[nr][nc] === 1) {
            this.kbCursor = { r: nr, c: nc };
            break;
          }
        }
        return;
      }

      if (key === 'Enter' || key === ' ') {
        e.preventDefault();
        if (!this.kbCursor) {
          this.kbCursor = this.findInitialKeyboardCell();
        }
        this.activateCellInteraction(this.kbCursor);
        return;
      }

      if (key === 'Escape') {
        if (this.selected || this.activeBooster) {
          e.preventDefault();
          this.selected = null;
          if (this.activeBooster) {
            this.activeBooster = null;
            this.emitHudState();
          }
        }
      }
    };

    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointercancel', this.onPointerUp);
    this.canvas.addEventListener('lostpointercapture', this.onPointerUp);
    this.canvas.addEventListener('keydown', this.onKeyDown);

    if (typeof document !== 'undefined') {
      this.onVisibilityChange = () => {
        if (document.hidden) {
          if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
          }
        } else {
          if (this.level && !this.ended && !this.rafId) {
            this.startLoop();
          }
        }
      };
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    }
  }

  startLoop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.lastFrameTime = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
      this.lastFrameTime = now;
      this.update(dt, now);
      if (this.level) {
        this.renderer.render(this.getRenderState(), now);
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stopLoop() {
    this.sessionId++;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getRenderState() {
    return {
      size: this.size,
      mask: this.mask,
      jelly: this.jelly,
      ice: this.ice,
      frosting: this.frosting,
      chocolate: this.chocolate,
      cauldron: this.cauldron,
      lockGrid: this.lockGrid,
      conveyorLoops: this.conveyorLoops,
      portals: this.portals,
      ingredientExitCells: this.ingredientExitCells,
      grid: this.grid,
      selected: this.selected,
      kbCursor: this.kbCursor,
      hintPair: this.hintPair,
      activeBooster: this.activeBooster,
      vfx: this.vfx
    };
  }

  cloneGridOrZero(src, size) {
    if (!src) return Array.from({ length: size }, () => Array(size).fill(0));
    return src.map((row) => [...row]);
  }

  loadLevel(levelData, options = {}) {
    this.sessionId++;
    this.level = levelData;
    this.size = levelData.size;
    this.renderer?.invalidateBg?.();
    this.numColors = levelData.numColors;
    this.house = options.house || 'gryffindor';
    this.collectionBuffs = {
      scoreBonusPct: Number(options.collectionBuffs?.scoreBonusPct) || 0,
      patronusBonusPct: Number(options.collectionBuffs?.patronusBonusPct) || 0
    };

    this.mask = levelData.mask.map((row) => [...row]);
    this.jelly = this.cloneGridOrZero(levelData.jellyGrid, this.size);
    this.ice = this.cloneGridOrZero(levelData.iceGrid, this.size);
    this.frosting = this.cloneGridOrZero(levelData.frostingGrid, this.size);
    this.chocolate = this.cloneGridOrZero(levelData.chocolateGrid, this.size);
    this.cauldron = this.cloneGridOrZero(levelData.cauldronGrid, this.size);
    this.cauldronCharge = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.cauldronStunnedThisTurn = new Set();
    this.lockGrid = this.cloneGridOrZero(levelData.lockGrid, this.size);
    const swirlGrid = this.cloneGridOrZero(levelData.swirlGrid, this.size);

    this.conveyorLoops = (levelData.conveyorLoops || []).map((loop) => loop.map((pt) => ({ ...pt })));
    this.portals = (levelData.portals || []).map((p) => ({
      from: { ...p.from },
      to: { ...p.to },
      color: p.color || '#10b981'
    }));
    this.ingredientTarget = levelData.ingredientTarget || 0;
    this.ingredientSpawnCols = [...(levelData.ingredientSpawnCols || [])];
    this.ingredientExitCells = (levelData.ingredientExitCells || []).map((e) => ({ ...e }));
    this.ingredientsCollected = 0;
    this.ingredientsSpawned = 0;
    this.bombConfig = levelData.bombConfig ? { ...levelData.bombConfig } : null;
    this.pendingBombSpawns = 0;

    this.bossConfig = levelData.bossConfig ? { ...levelData.bossConfig } : null;
    this.bossMaxHp = this.bossConfig ? this.bossConfig.maxHp : 0;
    this.bossHp = this.bossMaxHp;
    this.bossDefeated = false;
    this.patronusCharge = this.house === 'hufflepuff' ? 25 : 0;

    this.initialJelly = this.countGridSum(this.jelly);
    this.initialIce = this.countGridSum(this.ice);
    this.initialFrosting = this.countGridSum(this.frosting);
    this.initialChocolate = this.countGridSum(this.chocolate);
    this.initialCauldronPots = this.countPositiveCells(this.cauldron);
    this.initialLocks = this.countGridSum(this.lockGrid);

    this.score = 0;
    this.movesLeft = levelData.moves;
    this.movesUsed = 0;
    this.chocolateBrokenThisTurn = false;
    this.lastSwapDir = 'h';
    this.collected = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    this.specialStats = { striped: 0, wrapped: 0, seeker: 0, color_bomb: 0 };
    this.selected = null;
    this.kbCursor = null;
    this.activeBooster = null;
    this.busy = false;
    this.ended = false;
    this.vfx = { beams: [], seekers: [], arcs: [], rings: [], particles: [], popups: [], shake: 0 };

    this.populateInitialBoard(swirlGrid, options);
    this.resetIdleHint();
    this.emitHudState();
    this.startLoop();
    this.renderer.render(this.getRenderState(), performance.now());
  }

  isExitCell(r, c) {
    return this.ingredientExitCells.some((ex) => ex.r === r && ex.c === c);
  }

  isPortalCell(r, c) {
    return this.portals.some((p) => (p.from.r === r && p.from.c === c) || (p.to.r === r && p.to.c === c));
  }

  isConveyorCell(r, c) {
    return this.conveyorLoops.some((loop) => loop.some((pt) => pt.r === r && pt.c === c));
  }

  isMatchablePiece(p) {
    return Boolean(p && !p.isIngredient && !p.blocker && p.special !== 'color_bomb' && p.color >= 0);
  }

  countPositiveCells(g) {
    let n = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if ((g[r]?.[c] || 0) > 0) n++;
      }
    }
    return n;
  }

  countKeysOnBoard() {
    let n = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c]?.hasKey) n++;
      }
    }
    return n;
  }

  ensureSugarKeysOnBoard(desiredMin = 1) {
    const remLocks = this.countGridSum(this.lockGrid);
    if (remLocks <= 0) return;
    const currentKeys = this.countKeysOnBoard();
    const needed = Math.max(0, Math.min(desiredMin, Math.ceil(remLocks / 2)) - currentKeys);
    if (needed <= 0) return;

    const candidates = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const p = this.grid[r][c];
        if (
          this.mask[r][c] === 1 &&
          !this.hasStaticBlocker(r, c) &&
          !this.isCellLocked(r, c) &&
          p &&
          this.isMatchablePiece(p) &&
          !p.hasKey &&
          p.bombTimer === null
        ) {
          candidates.push(p);
        }
      }
    }
    candidates.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(needed, candidates.length); i++) {
      candidates[i].hasKey = true;
    }
  }

  populateInitialBoard(swirlGrid, options = {}) {
    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(null));

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.mask[r][c] === 0) continue;
        if (this.hasStaticBlocker(r, c)) {
          this.ice[r][c] = 0;
          this.lockGrid[r][c] = 0;
          this.grid[r][c] = null;
          continue;
        }
        if (swirlGrid[r]?.[c] > 0) {
          this.ice[r][c] = 0;
          this.lockGrid[r][c] = 0;
          this.grid[r][c] = this.createSwirlPiece(c, r);
          continue;
        }

        const forbidden = new Set();
        const left1 = this.grid[r][c - 1];
        const left2 = this.grid[r][c - 2];
        if (c >= 2 && this.isMatchablePiece(left1) && this.isMatchablePiece(left2) && left1.color === left2.color) {
          forbidden.add(left1.color);
        }
        const up1 = this.grid[r - 1]?.[c];
        const up2 = this.grid[r - 2]?.[c];
        if (r >= 2 && this.isMatchablePiece(up1) && this.isMatchablePiece(up2) && up1.color === up2.color) {
          forbidden.add(up1.color);
        }
        const diag = this.grid[r - 1]?.[c - 1];
        if (
          r >= 1 &&
          c >= 1 &&
          this.isMatchablePiece(left1) &&
          this.isMatchablePiece(up1) &&
          this.isMatchablePiece(diag) &&
          left1.color === up1.color &&
          left1.color === diag.color
        ) {
          forbidden.add(left1.color);
        }

        const choices = [];
        for (let col = 0; col < this.numColors; col++) {
          if (!forbidden.has(col)) choices.push(col);
        }
        const color = choices[Math.floor(Math.random() * choices.length)] ?? 0;
        this.grid[r][c] = this.createPiece(color, c, r);
      }
    }

    // Đặt viên Hòn Đá Phù Thủy đầu tiên trên đỉnh cột thả nếu màn có mục tiêu Thả Bảo Vật
    if (this.ingredientTarget > 0) {
      const cols = this.ingredientSpawnCols.length > 0 ? this.ingredientSpawnCols : [Math.floor(this.size / 2)];
      for (const col of cols) {
        let placed = false;
        for (let r = 0; r < Math.min(2, this.size - 1); r++) {
          if (
            this.mask[r][col] === 1 &&
            !this.hasStaticBlocker(r, col) &&
            !this.isCellLocked(r, col) &&
            !this.isExitCell(r, col) &&
            this.grid[r][col] &&
            !this.grid[r][col].blocker
          ) {
            this.grid[r][col] = this.createIngredientPiece(col, r);
            this.ingredientsSpawned = 1;
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
    }

    // Gắn Bom Kẹo Đếm Ngược ban đầu nếu màn có cấu hình Bom
    if (this.bombConfig?.initialCount > 0) {
      const candidates = [];
      for (let r = 1; r < this.size - 1; r++) {
        for (let c = 0; c < this.size; c++) {
          const p = this.grid[r][c];
          if (p && this.isMatchablePiece(p) && !this.isCellLocked(r, c) && !p.special) {
            candidates.push(p);
          }
        }
      }
      candidates.sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(this.bombConfig.initialCount, candidates.length); i++) {
        candidates[i].bombTimer = this.bombConfig.startTimer;
      }
    }

    // Đặt Chìa Khoá Đường Vàng ban đầu nếu màn có Ô Khoá Gringotts
    if (this.initialLocks > 0) {
      this.ensureSugarKeysOnBoard(2);
    }

    // Đảm bảo có ít nhất 1 nước đi hợp lệ ngay từ đầu
    let guard = 0;
    while (!this.findAnyValidMove(false) && guard < 28) {
      this.shuffleInternal(true);
      guard++;
    }
    if (!this.findAnyValidMove(false)) {
      this.grantEmergencyMovePiece();
    }

    // Áp dụng Bùa Đầu Trận (Pre-Game Boosters) & Phần Thưởng Chuỗi Thắng Chiếc Cốc Lửa (Win Streak)
    this.applyStartBonuses(options.preBoosters || [], options.winStreak || 0);
  }

  applyStartBonuses(preBoosters, winStreak) {
    if ((!preBoosters || preBoosters.length === 0) && (!winStreak || winStreak <= 0)) return;

    const plainCells = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const p = this.grid[r][c];
        if (
          this.mask[r][c] === 1 &&
          !this.hasStaticBlocker(r, c) &&
          !this.isCellLocked(r, c) &&
          p &&
          this.isMatchablePiece(p) &&
          !p.special &&
          p.bombTimer === null
        ) {
          plainCells.push({ r, c });
        }
      }
    }
    plainCells.sort(() => Math.random() - 0.5);

    const grant = (specialType) => {
      const cell = plainCells.pop();
      if (!cell) return;
      const p = this.grid[cell.r][cell.c];
      if (!p) return;
      p.special = specialType;
      p.scale = 1.25;
      this.spawnRing(cell.r, cell.c, 1.25, '#fde047');
    };

    for (const preId of preBoosters) {
      if (preId === 'pre_color_bomb') {
        grant('color_bomb');
      } else if (preId === 'pre_striped_wrapped') {
        grant(Math.random() < 0.5 ? 'striped_h' : 'striped_v');
        grant('wrapped');
      } else if (preId === 'pre_lucky_seeker') {
        grant('seeker');
        grant('seeker');
      }
    }

    if (winStreak >= 1) grant(Math.random() < 0.5 ? 'striped_h' : 'striped_v');
    if (winStreak >= 2) grant('wrapped');
    if (winStreak >= 3) grant('color_bomb');

    if (winStreak > 0) {
      this.spawnCenterBanner(`CỐC LỬA ×${winStreak}!`);
    }
  }

  createPiece(color, x, y, special = null) {
    return {
      id: NEXT_PIECE_ID++,
      color,
      special,
      primedWrapped: false,
      primedMega: false,
      isIngredient: false,
      blocker: null,
      bombTimer: null,
      hasKey: false,
      x,
      y,
      scale: 1,
      alpha: 1
    };
  }

  createIngredientPiece(x, y) {
    return {
      id: NEXT_PIECE_ID++,
      color: -1,
      special: null,
      primedWrapped: false,
      primedMega: false,
      isIngredient: true,
      blocker: null,
      bombTimer: null,
      hasKey: false,
      x,
      y,
      scale: 1,
      alpha: 1
    };
  }

  createSwirlPiece(x, y) {
    return {
      id: NEXT_PIECE_ID++,
      color: -1,
      special: null,
      primedWrapped: false,
      primedMega: false,
      isIngredient: false,
      blocker: 'swirl',
      bombTimer: null,
      hasKey: false,
      x,
      y,
      scale: 1,
      alpha: 1
    };
  }

  addPatronusCharge(rawAmount) {
    if (rawAmount <= 0 || this.ended) return;
    const houseBonus = this.house === 'ravenclaw' ? 0.2 : 0;
    const cardBonus = (this.collectionBuffs.patronusBonusPct || 0) / 100;
    const gained = rawAmount * (1 + houseBonus + cardBonus);
    this.patronusCharge = Math.min(100, Math.round((this.patronusCharge + gained) * 10) / 10);
  }

  damageBoss(rawDamage) {
    if (!this.bossConfig || this.bossDefeated || this.bossHp <= 0 || rawDamage <= 0) return;
    const mult = this.house === 'gryffindor' ? 1.25 : 1;
    const dmg = Math.max(1, Math.round(rawDamage * mult));
    this.bossHp = Math.max(0, this.bossHp - dmg);
    if (this.bossHp === 0 && !this.bossDefeated) {
      this.bossDefeated = true;
      sound.playColorBomb();
      this.vfx.shake = Math.max(this.vfx.shake, 12);
      this.spawnCenterBanner(`${this.bossConfig.emoji} ĐẠI TRÙM BẠI TRẬN!`);
      this.grantRandomSpecialsOnBoard(['wrapped', Math.random() < 0.5 ? 'striped_h' : 'striped_v']);
    }
  }

  grantRandomSpecialsOnBoard(specialTypes = []) {
    const plainCells = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const p = this.grid[r][c];
        if (
          this.mask[r][c] === 1 &&
          !this.hasStaticBlocker(r, c) &&
          !this.isCellLocked(r, c) &&
          p &&
          this.isMatchablePiece(p) &&
          !p.special &&
          p.bombTimer === null
        ) {
          plainCells.push({ r, c });
        }
      }
    }
    plainCells.sort(() => Math.random() - 0.5);
    for (const sp of specialTypes) {
      const cell = plainCells.pop();
      if (!cell) break;
      const p = this.grid[cell.r][cell.c];
      if (!p) continue;
      p.special = sp;
      p.scale = 1.28;
      this.spawnRing(cell.r, cell.c, 1.35, '#fde047');
    }
  }

  unlockWithSugarKey(originR, originC) {
    const lockedCells = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.lockGrid[r]?.[c] > 0) {
          lockedCells.push({ r, c });
        }
      }
    }
    if (lockedCells.length === 0) return;

    lockedCells.sort(() => Math.random() - 0.5);
    const unlockedNow = lockedCells.slice(0, 3);
    sound.playKeyUnlock();
    this.addPatronusCharge(8);
    for (const target of unlockedNow) {
      this.lockGrid[target.r][target.c] = 0;
      this.spawnArc(originR, originC, target.r, target.c, '#fde047');
      this.spawnRing(target.r, target.c, 1.35, '#fde047');
      this.spawnPopup(target.r, target.c, 'MỞ KHOÁ!', '#fef08a', 14);
      this.addScore(150, target.r, target.c, '#fef08a', false, 'blocker');
      this.damageBoss(65);
    }
  }

  recordSpecialTriggered(special) {
    if (!special) return;
    this.addPatronusCharge(9);
    if (special === 'striped_h' || special === 'striped_v') {
      this.specialStats.striped = (this.specialStats.striped || 0) + 1;
    } else if (special === 'wrapped') {
      this.specialStats.wrapped = (this.specialStats.wrapped || 0) + 1;
    } else if (special === 'seeker') {
      this.specialStats.seeker = (this.specialStats.seeker || 0) + 1;
    } else if (special === 'color_bomb') {
      this.specialStats.color_bomb = (this.specialStats.color_bomb || 0) + 1;
    }
  }

  isValidCell(r, c) {
    return r >= 0 && r < this.size && c >= 0 && c < this.size;
  }

  countGridSum(g) {
    let total = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        total += g[r]?.[c] || 0;
      }
    }
    return total;
  }

  resetIdleHint() {
    this.lastActionAt = performance.now();
    this.hintPair = null;
  }

  setBoosterMode(boosterId) {
    if (this.busy || this.ended) return;
    if (this.activeBooster === boosterId) {
      this.activeBooster = null;
      this.emitHudState();
      return;
    }
    if (boosterId === 'shuffle') {
      this.executeShuffleBooster();
      return;
    }
    if (boosterId === 'extraMoves') {
      this.executeExtraMovesBooster();
      return;
    }
    this.activeBooster = boosterId;
    this.selected = null;
    this.emitHudState();
  }

  addExtraTurnsToBombs(extra = 5) {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const p = this.grid[r][c];
        if (p && p.bombTimer !== null && p.bombTimer !== undefined) {
          p.bombTimer = Math.max(extra, p.bombTimer + extra);
        }
      }
    }
  }

  continueWithExtraMoves(amount = 5) {
    this.ended = false;
    this.busy = false;
    this.movesLeft += amount;
    this.addExtraTurnsToBombs(amount);
    sound.playColorBomb();
    this.spawnCenterBanner(`+${amount} LƯỢT PHÉP THUẬT!`);
    this.resetIdleHint();
    this.emitHudState();
  }

  async executeExtraMovesBooster() {
    if (!this.cb.onBoosterConsumed?.('extraMoves')) return;
    this.movesLeft += 5;
    this.addExtraTurnsToBombs(5);
    sound.playColorBomb();
    this.spawnCenterBanner('+5 LƯỢT PHÚC LẠC DƯỢC!');
    this.emitHudState();
  }

  async executeShuffleBooster() {
    if (this.busy || this.ended) return;
    if (!this.cb.onBoosterConsumed?.('shuffle')) return;
    const session = this.sessionId;
    this.busy = true;
    this.activeBooster = null;
    sound.playSortingHat();
    this.spawnCenterBanner('XOÁY THỜI GIAN!');
    await this.performShuffleAnimation(session);
    if (session !== this.sessionId) return;
    if (this.findMatchClusters().length > 0) {
      await this.resolveAllCascades(1, session);
      if (session !== this.sessionId) return;
    }
    this.busy = false;
    this.resetIdleHint();
    this.renderer.render(this.getRenderState(), performance.now());
    await this.checkPostTurnState(session, false);
  }

  async executeHammer(r, c) {
    if (this.busy || this.ended) return;
    const piece = this.grid[r][c];
    if (piece?.isIngredient && this.jelly[r][c] === 0) {
      sound.playInvalid();
      this.spawnPopup(r, c, 'Bảo vật bất hoại!', '#fde047', 14);
      return;
    }
    if (
      !piece &&
      this.jelly[r][c] === 0 &&
      this.ice[r][c] === 0 &&
      !this.hasStaticBlocker(r, c) &&
      (this.lockGrid[r]?.[c] || 0) === 0
    ) {
      return;
    }
    if (!this.cb.onBoosterConsumed?.('hammer')) {
      this.activeBooster = null;
      this.emitHudState();
      return;
    }

    const session = this.sessionId;
    this.busy = true;
    this.activeBooster = null;
    this.emitHudState();

    sound.playBomb();
    this.vfx.shake = 7;
    this.spawnRing(r, c, 1.5, '#fbbf24');
    this.spawnBurst(r, c, '#fde047', 22);
    this.spawnPopup(r, c, 'BÚA ĐŨA PHÉP!', '#fff59d', 17);

    const triggered = new Set();
    this.damageCell(r, c, triggered, true, true);
    await sleep(220);
    if (session !== this.sessionId) return;

    await this.applyGravityAndRefill(session);
    if (session !== this.sessionId) return;
    await this.resolveAllCascades(1, session);
    if (session !== this.sessionId) return;

    this.busy = false;
    this.resetIdleHint();
    this.renderer.render(this.getRenderState(), performance.now());
    await this.checkPostTurnState(session, false);
  }

  // Tuyệt kỹ Thần Hộ Mệnh 4 Nhà (Expecto Patronum — miễn phí lượt đi khi đầy 100% Nộ)
  async castPatronus() {
    if (this.busy || this.ended || !this.level || this.patronusCharge < 100) return false;
    const session = this.sessionId;
    this.patronusCharge = 0;
    this.busy = true;
    this.activeBooster = null;
    this.selected = null;
    this.resetIdleHint();
    this.emitHudState();

    sound.playPatronus();
    this.vfx.shake = 12;
    const triggered = new Set();
    const mid = Math.floor(this.size / 2);

    if (this.house === 'gryffindor') {
      this.spawnCenterBanner('🦌 EXPECTO PATRONUM: HƯƠU BẠC!');
      let targetR = mid;
      let targetC = mid;
      if (this.mask[targetR]?.[targetC] === 0) {
        const fallback = this.findInitialKeyboardCell();
        targetR = fallback.r;
        targetC = fallback.c;
      }
      this.fireRowBeam(targetR, targetC, 0.86, '#f8fafc', triggered, false);
      this.fireColBeam(targetC, targetR, 0.86, '#fde047', triggered, false);
      this.damageBoss(450);
      this.addScore(650, targetR, targetC, '#fde047', true, 'special');
      this.grantRandomSpecialsOnBoard(['wrapped', Math.random() < 0.5 ? 'striped_h' : 'striped_v']);
    } else if (this.house === 'slytherin') {
      this.spawnCenterBanner('🐍 EXPECTO PATRONUM: RẮN THẦN!');
      const darkTargets = [];
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.mask[r][c] === 0) continue;
          let prio = 0;
          if (this.cauldron[r][c] > 0) prio = 95;
          else if (this.chocolate[r][c] > 0) prio = 90;
          else if (this.lockGrid[r]?.[c] > 0) prio = 85;
          else if (this.frosting[r][c] > 0) prio = 80;
          else if (this.ice[r][c] > 0) prio = 75;
          else if (this.grid[r][c]?.blocker === 'swirl') prio = 70;
          if (prio > 0) darkTargets.push({ r, c, prio: prio + Math.random() * 5 });
        }
      }
      darkTargets.sort((a, b) => b.prio - a.prio);
      for (const t of darkTargets.slice(0, 5)) {
        this.spawnArc(mid, mid, t.r, t.c, '#34d399');
        this.damageCell(t.r, t.c, triggered, true, true);
      }
      this.addExtraTurnsToBombs(3);
      this.damageBoss(360);
      this.addScore(560, mid, mid, '#6ee7b7', true, 'special');
      this.grantRandomSpecialsOnBoard(['color_bomb']);
    } else if (this.house === 'ravenclaw') {
      this.spawnCenterBanner('🦅 EXPECTO PATRONUM: ĐẠI BÀNG!');
      const targets = this.pickBestSeekerTargets(4, triggered);
      for (const t of targets) {
        this.spawnSeekerVfx(mid, mid, t.r, t.c, '#7dd3fc');
      }
      await sleep(220);
      if (session !== this.sessionId) return true;
      for (const t of targets) {
        this.damageCell(t.r, t.c, triggered, true, true);
      }
      this.damageBoss(360);
      this.addScore(600, mid, mid, '#7dd3fc', true, 'special');
    } else {
      // Hufflepuff: Lửng Vàng Kiên Định
      this.spawnCenterBanner('🦡 EXPECTO PATRONUM: LỬNG VÀNG!');
      this.movesLeft += 2;
      this.addExtraTurnsToBombs(2);
      this.grantRandomSpecialsOnBoard([
        'wrapped',
        Math.random() < 0.5 ? 'striped_h' : 'striped_v',
        'seeker'
      ]);
      this.damageBoss(360);
      this.addScore(520, mid, mid, '#fde047', true, 'special');
    }

    await sleep(230);
    if (session !== this.sessionId) return true;
    await this.applyGravityAndRefill(session);
    if (session !== this.sessionId) return true;
    await this.resolveAllCascades(1, session);
    if (session !== this.sessionId) return true;

    this.busy = false;
    this.resetIdleHint();
    this.emitHudState();
    this.renderer.render(this.getRenderState(), performance.now());
    await this.checkPostTurnState(session, false);
    return true;
  }

  async trySwap(a, b) {
    if (this.busy || this.ended) return;
    if (this.hasStaticBlocker(a.r, a.c) || this.hasStaticBlocker(b.r, b.c)) {
      sound.playInvalid();
      this.spawnPopup(b.r, b.c, 'Ô đang bị chặn!', '#fde047', 14);
      return;
    }
    if (this.lockGrid[a.r]?.[a.c] > 0 || this.lockGrid[b.r]?.[b.c] > 0) {
      sound.playInvalid();
      this.spawnPopup(b.r, b.c, 'Cần Chìa Khoá Vàng!', '#fde047', 14);
      return;
    }
    if (this.ice[a.r][a.c] > 0 || this.ice[b.r][b.c] > 0) {
      sound.playInvalid();
      this.spawnPopup(b.r, b.c, 'Ô bị đóng băng!', '#7dd3fc', 14);
      return;
    }

    const pA = this.grid[a.r][a.c];
    const pB = this.grid[b.r][b.c];
    if (!pA || !pB) return;

    const session = this.sessionId;
    this.busy = true;
    this.resetIdleHint();
    this.lastSwapDir = a.r === b.r ? 'h' : 'v';
    const isFreeSwapBooster = this.activeBooster === 'swap';

    sound.playSwap();
    await this.animateSwap(a, b, 155, session);
    if (session !== this.sessionId) return;

    // Kiểm tra Đại Tiệc Combo giữa 2 Kẹo Phép, Cầu Đậu Ngũ Sắc hoặc Kẹo Cánh Vàng Tầm Thủ
    const specialCombo = this.detectSwapSpecialCombo(a, b);
    const clusters = specialCombo ? [] : this.findMatchClusters([b, a]);

    if (!specialCombo && clusters.length === 0 && !isFreeSwapBooster) {
      sound.playInvalid();
      await this.animateSwap(a, b, 155, session);
      if (session !== this.sessionId) return;
      this.busy = false;
      this.renderer.render(this.getRenderState(), performance.now());
      return;
    }

    this.chocolateBrokenThisTurn = false;
    this.cauldronStunnedThisTurn.clear();
    if (isFreeSwapBooster) {
      this.cb.onBoosterConsumed?.('swap');
      this.activeBooster = null;
      this.spawnPopup(b.r, b.c, 'ĐŨA PHÉP ĐỔI KẸO!', '#fff59d', 16);
    } else {
      this.movesLeft = Math.max(0, this.movesLeft - 1);
      this.movesUsed++;
    }
    this.emitHudState();

    // Kiểm tra Bảo vật nếu vừa được đổi chỗ trực tiếp vào ô lối thoát
    if (this.extractIngredientsAtExits()) {
      await this.applyGravityAndRefill(session);
      if (session !== this.sessionId) return;
    }

    if (specialCombo) {
      await this.executeSpecialCombo(specialCombo, a, b, session);
      if (session !== this.sessionId) return;
      await this.applyGravityAndRefill(session);
      if (session !== this.sessionId) return;
      await this.resolveAllCascades(2, session);
      if (session !== this.sessionId) return;
    } else if (clusters.length > 0) {
      await this.clearClusters(clusters, 1, [b, a], session);
      if (session !== this.sessionId) return;
      await this.applyGravityAndRefill(session);
      if (session !== this.sessionId) return;
      await this.resolveAllCascades(2, session);
      if (session !== this.sessionId) return;
    } else {
      // Đổi tự do bằng Đũa Phép không tạo bộ 3 nhưng vẫn kiểm tra Kẹo Bọc 2 nhịp nếu có
      await this.resolveAllCascades(1, session);
      if (session !== this.sessionId) return;
    }

    this.busy = false;
    this.resetIdleHint();
    this.renderer.render(this.getRenderState(), performance.now());
    await this.checkPostTurnState(session, !isFreeSwapBooster);
  }

  async animateSwap(a, b, durationMs = 155, session = this.sessionId) {
    const pA = this.grid[a.r][a.c];
    const pB = this.grid[b.r][b.c];
    if (!pA || !pB) return;

    const start = performance.now();
    await new Promise((resolve) => {
      const step = (now) => {
        if (session !== this.sessionId) {
          resolve();
          return;
        }
        const t = Math.min(1, (now - start) / durationMs);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        pA.x = a.c + (b.c - a.c) * ease;
        pA.y = a.r + (b.r - a.r) * ease;
        pB.x = b.c + (a.c - b.c) * ease;
        pB.y = b.r + (a.r - b.r) * ease;
        if (t < 1) nextAnimFrame(step);
        else resolve();
      };
      nextAnimFrame(step);
    });

    if (session !== this.sessionId) return;
    this.grid[a.r][a.c] = pB;
    this.grid[b.r][b.c] = pA;
    pA.x = b.c;
    pA.y = b.r;
    pB.x = a.c;
    pB.y = a.r;
  }

  detectSwapSpecialCombo(a, b) {
    const pA = this.grid[a.r][a.c];
    const pB = this.grid[b.r][b.c];
    if (!pA || !pB) return null;
    if (pA.isIngredient || pB.isIngredient || pA.blocker || pB.blocker) {
      // Nếu đổi chỗ trực tiếp Kẹo Cánh Vàng Tầm Thủ hoặc Cầu Ngũ Sắc với Xoáy/Bảo Vật:
      if (pA.special === 'seeker') return { type: 'single_seeker', seekerPos: a };
      if (pB.special === 'seeker') return { type: 'single_seeker', seekerPos: b };
      return null;
    }

    if (pA.special === 'color_bomb' && pB.special === 'color_bomb') {
      return { type: 'double_color_bomb' };
    }
    if (pA.special === 'color_bomb' || pB.special === 'color_bomb') {
      const bombPos = pA.special === 'color_bomb' ? a : b;
      const otherPos = pA.special === 'color_bomb' ? b : a;
      const otherPiece = this.grid[otherPos.r][otherPos.c];
      return {
        type: 'color_bomb_combo',
        bombPos,
        otherPos,
        targetColor: otherPiece.color,
        otherSpecial: otherPiece.special
      };
    }

    const isStripedA = pA.special === 'striped_h' || pA.special === 'striped_v';
    const isStripedB = pB.special === 'striped_h' || pB.special === 'striped_v';

    // Phối hợp Kẹo Cánh Vàng Tầm Thủ (2×2 Seeker Combos)
    if (pA.special === 'seeker' && pB.special === 'seeker') {
      return { type: 'double_seeker', posA: a, posB: b };
    }
    if ((pA.special === 'seeker' && isStripedB) || (isStripedA && pB.special === 'seeker')) {
      return { type: 'seeker_striped', posA: a, posB: b };
    }
    if ((pA.special === 'seeker' && pB.special === 'wrapped') || (pA.special === 'wrapped' && pB.special === 'seeker')) {
      return { type: 'seeker_wrapped', posA: a, posB: b };
    }

    if (isStripedA && isStripedB) return { type: 'cross_striped', center: b };
    if ((isStripedA && pB.special === 'wrapped') || (pA.special === 'wrapped' && isStripedB)) {
      return { type: 'giant_striped_wrapped', center: b };
    }
    if (pA.special === 'wrapped' && pB.special === 'wrapped') {
      return { type: 'mega_wrapped', center: b };
    }

    // Vẫy Kẹo Cánh Vàng Tầm Thủ đổi chỗ với bất kỳ viên kẹo thường nào -> phóng thẳng đi săn mục tiêu!
    if (pA.special === 'seeker') return { type: 'single_seeker', seekerPos: a };
    if (pB.special === 'seeker') return { type: 'single_seeker', seekerPos: b };

    return null;
  }

  consumeSwappedPiece(pos, triggeredSet) {
    const p = this.grid[pos.r]?.[pos.c];
    if (!p || p.isIngredient) return;
    const hadKey = p.hasKey;
    if (p.special) this.recordSpecialTriggered(p.special);
    if (p.special !== 'color_bomb' && p.color >= 0) {
      this.collected[p.color] = (this.collected[p.color] || 0) + 1;
    }
    this.grid[pos.r][pos.c] = null;
    if (hadKey) {
      this.unlockWithSugarKey(pos.r, pos.c);
    }
    const jellyKey = `j:${pos.r},${pos.c}`;
    if (!triggeredSet.has(jellyKey)) {
      triggeredSet.add(jellyKey);
      this.breakJelly(pos.r, pos.c);
    }
  }

  async executeSpecialCombo(combo, a, b, session = this.sessionId) {
    const triggered = new Set([`${a.r},${a.c}`, `${b.r},${b.c}`]);

    if (combo.type === 'double_color_bomb') {
      sound.playColorBomb();
      sound.playBomb();
      sound.playVoiceCallout('Divine!');
      this.vfx.shake = 14;
      this.spawnCenterBanner('HOGWARTS CRUSH! TOÀN BÀN!');
      this.consumeSwappedPiece(a, triggered);
      this.consumeSwappedPiece(b, triggered);

      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.mask[r][c] === 0) continue;
          this.spawnArc(b.r, b.c, r, c, '#fde047');
        }
      }
      await sleep(240);
      if (session !== this.sessionId) return;
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.mask[r][c] === 0) continue;
          this.damageCell(r, c, triggered, true, true);
        }
      }
      this.damageBoss(520);
      this.addScore(2500, b.r, b.c, '#fde047', true, 'special');
      await sleep(260);
      return;
    }

    if (combo.type === 'color_bomb_combo') {
      const { bombPos, otherPos, targetColor, otherSpecial } = combo;
      sound.playColorBomb();
      this.consumeSwappedPiece(bombPos, triggered);
      const colorHex = TILE_TYPES[targetColor]?.light || '#fde047';

      const targets = [];
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.mask[r][c] === 0 || (this.lockGrid[r]?.[c] || 0) > 0) continue;
          const p = this.grid[r][c];
          if (p && this.isMatchablePiece(p) && p.color === targetColor) {
            targets.push({ r, c });
            this.spawnArc(bombPos.r, bombPos.c, r, c, colorHex);
          }
        }
      }

      if (otherSpecial === 'seeker') {
        sound.playSeeker();
        sound.playVoiceCallout('Delicious!');
        this.spawnCenterBanner('ĐÀN CÁNH VÀNG SNITCH!');
        this.consumeSwappedPiece(otherPos, triggered);
        for (const t of targets) {
          const piece = this.grid[t.r][t.c];
          if (piece) {
            piece.special = 'seeker';
            piece.scale = 1.25;
          }
        }
        await sleep(240);
        if (session !== this.sessionId) return;
        const chainSet = new Set(triggered);
        for (const t of targets) {
          this.damageCell(t.r, t.c, chainSet, true);
        }
        this.damageBoss(380);
        this.addScore(1400 + targets.length * 130, bombPos.r, bombPos.c, '#fde047', true, 'special');
        await sleep(280);
        return;
      }

      if (otherSpecial) {
        sound.playVoiceCallout('Divine!');
        this.spawnCenterBanner('ĐẠI TIỆC KẸO PHÉP!');
        this.consumeSwappedPiece(otherPos, triggered);

        for (const t of targets) {
          const piece = this.grid[t.r][t.c];
          if (!piece) continue;
          if (otherSpecial === 'wrapped') {
            piece.special = 'wrapped';
          } else {
            piece.special = Math.random() < 0.5 ? 'striped_h' : 'striped_v';
          }
          piece.scale = 1.25;
        }
        await sleep(300);
        if (session !== this.sessionId) return;
        const chainSet = new Set(triggered);
        for (const t of targets) {
          this.damageCell(t.r, t.c, chainSet, true);
        }
        this.damageBoss(400);
        this.addScore(1400 + targets.length * 120, bombPos.r, bombPos.c, '#fde047', true, 'special');
        await sleep(260);
      } else {
        this.spawnPopup(bombPos.r, bombPos.c, 'LUMOS MAXIMA!', colorHex, 20);
        await sleep(220);
        if (session !== this.sessionId) return;
        const chainSet = new Set(triggered);
        for (const t of targets) {
          this.damageCell(t.r, t.c, chainSet, true);
        }
        this.damageBoss(260);
        this.addScore(650 + targets.length * 90, bombPos.r, bombPos.c, colorHex, true, 'special');
        await sleep(200);
      }
      return;
    }

    if (combo.type === 'double_seeker') {
      const { posA, posB } = combo;
      const color = this.grid[posB.r]?.[posB.c]?.color ?? 5;
      this.consumeSwappedPiece(posA, triggered);
      this.consumeSwappedPiece(posB, triggered);
      sound.playSeeker();
      this.spawnPopup(posB.r, posB.c, '3× TẦM THỦ SNITCH!', '#fde047', 19);
      const best = this.pickBestSeekerTargets(3, triggered);
      for (const t of best) {
        this.spawnSeekerVfx(posB.r, posB.c, t.r, t.c, TILE_TYPES[color]?.light || '#fde047');
      }
      await sleep(250);
      if (session !== this.sessionId) return;
      for (const t of best) {
        this.damageCell(t.r, t.c, triggered, true);
      }
      this.damageBoss(240);
      this.addScore(780, posB.r, posB.c, '#fde047', true, 'special');
      await sleep(160);
      return;
    }

    if (combo.type === 'seeker_striped' || combo.type === 'seeker_wrapped') {
      const { posA, posB } = combo;
      this.consumeSwappedPiece(posA, triggered);
      this.consumeSwappedPiece(posB, triggered);
      sound.playSeeker();
      const [target] = this.pickBestSeekerTargets(1, triggered);
      if (target) {
        this.spawnSeekerVfx(posB.r, posB.c, target.r, target.c, '#fde047');
        await sleep(250);
        if (session !== this.sessionId) return;
        if (combo.type === 'seeker_striped') {
          sound.playBeam();
          if (Math.random() < 0.5) this.fireRowBeam(target.r, target.c, 0.72, '#38bdf8', triggered, true);
          else this.fireColBeam(target.c, target.r, 0.72, '#38bdf8', triggered, true);
        } else {
          sound.playBomb();
          this.spawnRing(target.r, target.c, 2.1, '#fb923c');
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              this.damageCell(target.r + dr, target.c + dc, triggered, true);
            }
          }
        }
        this.damageBoss(270);
        this.addScore(920, target.r, target.c, '#fde047', true, 'special');
      }
      await sleep(200);
      return;
    }

    if (combo.type === 'single_seeker') {
      const { seekerPos } = combo;
      const color = this.grid[seekerPos.r]?.[seekerPos.c]?.color ?? 5;
      // Chỉ xoá ô Seeker, giữ nguyên ô kẹo đối ứng để nếu nó tự ghép bộ 3 thì nổ tiếp ở resolveAllCascades!
      const onlySeekerSet = new Set([`${seekerPos.r},${seekerPos.c}`]);
      this.consumeSwappedPiece(seekerPos, onlySeekerSet);
      sound.playSeeker();
      const [target] = this.pickBestSeekerTargets(1, onlySeekerSet);
      if (target) {
        this.spawnSeekerVfx(seekerPos.r, seekerPos.c, target.r, target.c, TILE_TYPES[color]?.light || '#fde047');
        await sleep(240);
        if (session !== this.sessionId) return;
        this.damageCell(target.r, target.c, onlySeekerSet, true);
        this.damageBoss(140);
        this.addScore(360, target.r, target.c, '#fde047', true, 'special');
      }
      await sleep(120);
      return;
    }

    if (combo.type === 'cross_striped') {
      const { r, c } = combo.center;
      this.consumeSwappedPiece(a, triggered);
      this.consumeSwappedPiece(b, triggered);
      sound.playBeam();
      this.vfx.shake = 8;
      this.spawnPopup(r, c, 'SECTUMSEMPRA!', '#fff59d', 20);
      this.fireRowBeam(r, c, 0.75, '#38bdf8', triggered, true);
      this.fireColBeam(c, r, 0.75, '#38bdf8', triggered, true);
      this.damageBoss(260);
      this.addScore(850, r, c, '#fde047', true, 'special');
      await sleep(260);
      return;
    }

    if (combo.type === 'giant_striped_wrapped') {
      const { r, c } = combo.center;
      this.consumeSwappedPiece(a, triggered);
      this.consumeSwappedPiece(b, triggered);
      sound.playBeam();
      sound.playBomb();
      sound.playVoiceCallout('Delicious!');
      this.vfx.shake = 12;
      this.spawnCenterBanner('BOMBARDIA MAXIMA 3×3!');
      for (let d = -1; d <= 1; d++) {
        if (r + d >= 0 && r + d < this.size) this.fireRowBeam(r + d, c, 0.9, '#c084fc', triggered, false);
        if (c + d >= 0 && c + d < this.size) this.fireColBeam(c + d, r, 0.9, '#c084fc', triggered, false);
      }
      this.damageBoss(420);
      this.addScore(1500, r, c, '#fde047', true, 'special');
      await sleep(300);
      return;
    }

    if (combo.type === 'mega_wrapped') {
      const { r, c } = combo.center;
      const savedColor = this.grid[b.r]?.[b.c]?.color ?? 0;
      this.consumeSwappedPiece(a, triggered);
      this.consumeSwappedPiece(b, triggered);
      sound.playBomb();
      sound.playVoiceCallout('Divine!');
      this.vfx.shake = 13;
      this.spawnCenterBanner('CONFRINGO! ĐẠI NỔ KÉP 5×5!');
      this.spawnRing(r, c, 3.2, '#f97316');
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (this.isValidCell(nr, nc) && this.mask[nr][nc] === 1) {
            this.damageCell(nr, nc, triggered, true);
          }
        }
      }
      // Đặt viên Kẹo Bọc Đại Nổ Nhịp 2 chuẩn Candy Crush (rơi theo trọng lực rồi nổ 5×5 lần 2!)
      if (this.mask[r][c] === 1 && !this.hasStaticBlocker(r, c) && (this.lockGrid[r]?.[c] || 0) === 0 && !this.grid[r][c]) {
        const primed = this.createPiece(savedColor, c, r, 'wrapped');
        primed.primedWrapped = true;
        primed.primedMega = true;
        this.grid[r][c] = primed;
      }
      this.damageBoss(380);
      this.addScore(1350, r, c, '#fb923c', true, 'special');
      await sleep(280);
    }
  }

  // Tìm cụm ghép >=3 ngang/dọc VÀ Ô Vuông 2×2 (Kẹo Cánh Vàng Tầm Thủ) + hướng vuốt Kẹo Sọc!
  findMatchClusters(preferredAnchors = []) {
    const hRuns = [];
    const vRuns = [];
    const sqRuns = [];

    // 1. Dãy ngang >= 3
    for (let r = 0; r < this.size; r++) {
      let c = 0;
      while (c < this.size) {
        const p = this.grid[r][c];
        if (!this.isCellMatchable(r, c) || p.primedWrapped) {
          c++;
          continue;
        }
        let end = c + 1;
        while (
          end < this.size &&
          this.isCellMatchable(r, end) &&
          !this.grid[r][end].primedWrapped &&
          this.grid[r][end].color === p.color
        ) {
          end++;
        }
        if (end - c >= 3) {
          const cells = [];
          for (let k = c; k < end; k++) cells.push({ r, c: k });
          hRuns.push({ dir: 'h', color: p.color, len: end - c, cells });
        }
        c = end;
      }
    }

    // 2. Dãy dọc >= 3
    for (let c = 0; c < this.size; c++) {
      let r = 0;
      while (r < this.size) {
        const p = this.grid[r][c];
        if (!this.isCellMatchable(r, c) || p.primedWrapped) {
          r++;
          continue;
        }
        let end = r + 1;
        while (
          end < this.size &&
          this.isCellMatchable(end, c) &&
          !this.grid[end][c].primedWrapped &&
          this.grid[end][c].color === p.color
        ) {
          end++;
        }
        if (end - r >= 3) {
          const cells = [];
          for (let k = r; k < end; k++) cells.push({ r: k, c });
          vRuns.push({ dir: 'v', color: p.color, len: end - r, cells });
        }
        r = end;
      }
    }

    // 3. Ô Vuông 2×2 cùng màu -> Kẹo Cánh Vàng Tầm Thủ ('seeker')
    for (let r = 0; r < this.size - 1; r++) {
      for (let c = 0; c < this.size - 1; c++) {
        if (
          !this.isCellMatchable(r, c) ||
          !this.isCellMatchable(r, c + 1) ||
          !this.isCellMatchable(r + 1, c) ||
          !this.isCellMatchable(r + 1, c + 1)
        ) {
          continue;
        }
        const p00 = this.grid[r][c];
        const p01 = this.grid[r][c + 1];
        const p10 = this.grid[r + 1][c];
        const p11 = this.grid[r + 1][c + 1];
        if (
          !p00.primedWrapped &&
          !p01.primedWrapped &&
          !p10.primedWrapped &&
          !p11.primedWrapped &&
          p00.color === p01.color &&
          p00.color === p10.color &&
          p00.color === p11.color
        ) {
          sqRuns.push({
            dir: 'sq',
            color: p00.color,
            len: 4,
            cells: [
              { r, c },
              { r, c: c + 1 },
              { r: r + 1, c },
              { r: r + 1, c: c + 1 }
            ]
          });
        }
      }
    }

    const allRuns = [...hRuns, ...vRuns, ...sqRuns];
    if (allRuns.length === 0) return [];

    const visited = new Array(allRuns.length).fill(false);
    const clusters = [];

    const shareCell = (runA, runB) => {
      if (runA.color !== runB.color) return false;
      for (const a of runA.cells) {
        for (const b of runB.cells) {
          if (a.r === b.r && a.c === b.c) return true;
        }
      }
      return false;
    };

    for (let i = 0; i < allRuns.length; i++) {
      if (visited[i]) continue;
      visited[i] = true;
      const queue = [allRuns[i]];
      const groupRuns = [allRuns[i]];

      while (queue.length > 0) {
        const cur = queue.shift();
        for (let j = 0; j < allRuns.length; j++) {
          if (!visited[j] && shareCell(cur, allRuns[j])) {
            visited[j] = true;
            queue.push(allRuns[j]);
            groupRuns.push(allRuns[j]);
          }
        }
      }

      const cellMap = new Map();
      let maxLineLen = 0;
      let hasH = false;
      let hasV = false;
      let hasSq = false;
      for (const run of groupRuns) {
        if (run.dir === 'h' || run.dir === 'v') {
          if (run.len > maxLineLen) maxLineLen = run.len;
          if (run.dir === 'h') hasH = true;
          if (run.dir === 'v') hasV = true;
        } else if (run.dir === 'sq') {
          hasSq = true;
        }
        for (const cell of run.cells) {
          const key = `${cell.r},${cell.c}`;
          cellMap.set(key, { r: cell.r, c: cell.c, count: (cellMap.get(key)?.count || 0) + 1 });
        }
      }

      const clusterCells = Array.from(cellMap.values());
      const hasPlayerAnchor = preferredAnchors.some((anc) =>
        clusterCells.some((ce) => ce.r === anc.r && ce.c === anc.c)
      );

      let spawnSpecial = null;
      if (maxLineLen >= 5) {
        spawnSpecial = 'color_bomb';
      } else if (hasH && hasV) {
        spawnSpecial = 'wrapped';
      } else if (maxLineLen === 4) {
        if (hasPlayerAnchor) {
          spawnSpecial = this.lastSwapDir === 'h' ? 'striped_h' : 'striped_v';
        } else {
          spawnSpecial = hasH ? 'striped_v' : 'striped_h';
        }
      } else if (hasSq) {
        spawnSpecial = 'seeker';
      }

      clusters.push({
        color: groupRuns[0].color,
        cells: clusterCells,
        spawnSpecial
      });
    }

    return clusters;
  }

  hasPrimedWrappedCandies() {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c]?.primedWrapped) return true;
      }
    }
    return false;
  }

  // Nổ Nhịp 2 đặc trưng của Kẹo Bọc Giấy sau khi trọng lực dồn kẹo xuống!
  async detonatePrimedWrappedCandies(session = this.sessionId) {
    const primedList = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const p = this.grid[r][c];
        if (p?.primedWrapped) {
          primedList.push({ r, c, piece: p });
        }
      }
    }
    if (primedList.length === 0) return false;

    await sleep(130);
    if (session !== this.sessionId) return true;

    const triggered = new Set();
    sound.playBomb();
    this.vfx.shake = Math.max(this.vfx.shake, 10);

    for (const item of primedList) {
      const { r, c, piece } = item;
      if (this.grid[r][c] === piece) {
        this.grid[r][c] = null;
      }
      const radius = piece.primedMega ? 2 : 1;
      this.spawnRing(r, c, radius === 2 ? 3.0 : 2.1, '#fbbf24');
      this.spawnPopup(r, c, 'NỔ KÉP!', '#fde047', 16);
      for (let dr = -radius; dr <= radius; dr++) {
        for (let dc = -radius; dc <= radius; dc++) {
          this.damageCell(r + dr, c + dc, triggered, true);
        }
      }
      this.damageBoss(piece.primedMega ? 220 : 120);
      this.addScore(piece.primedMega ? 650 : 340, r, c, '#fbbf24', false, 'special');
    }

    this.emitHudState();
    await sleep(200);
    return true;
  }

  async resolveAllCascades(startCombo = 1, session = this.sessionId) {
    let combo = startCombo;
    let safety = 0;
    while (session === this.sessionId && safety < 40) {
      safety++;
      const clusters = this.findMatchClusters();
      if (clusters.length > 0) {
        await this.clearClusters(clusters, combo, [], session);
        if (session !== this.sessionId) return;
        await this.applyGravityAndRefill(session);
        if (session !== this.sessionId) return;
        combo++;
        continue;
      }

      if (this.hasPrimedWrappedCandies()) {
        await this.detonatePrimedWrappedCandies(session);
        if (session !== this.sessionId) return;
        await this.applyGravityAndRefill(session);
        if (session !== this.sessionId) return;
        combo++;
        continue;
      }

      break;
    }
  }

  hitCauldronAt(r, c) {
    if ((this.cauldron[r]?.[c] || 0) <= 0) return;
    this.cauldron[r][c]--;
    this.cauldronStunnedThisTurn.add(`${r},${c}`);
    this.cauldronCharge[r][c] = 0;
    this.addPatronusCharge(6);
    if (this.cauldron[r][c] <= 0) {
      this.cauldron[r][c] = 0;
      sound.playBomb();
      this.spawnRing(r, c, 1.45, '#10b981');
      this.spawnBurst(r, c, '#34d399', 16);
      this.spawnPopup(r, c, 'VỠ VẠC ĐỘC!', '#6ee7b7', 15);
      this.addScore(220, r, c, '#6ee7b7', false, 'blocker');
      this.damageBoss(140);
    } else {
      sound.playIceBreak();
      this.spawnBurst(r, c, '#a855f7', 10);
      this.addScore(95, r, c, '#d8b4fe', false, 'blocker');
      this.damageBoss(45);
    }
  }

  // Phá Đá Cổ Ngữ, Sô-cô-la Lan, Vạc Độc Dược & Xoáy Cam Thảo nằm sát cạnh cụm kẹo vừa ghép
  damageAdjacentBlockers(clusterCells, blockerHitSet) {
    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1]
    ];
    for (const cell of clusterCells) {
      for (const [dr, dc] of dirs) {
        const nr = cell.r + dr;
        const nc = cell.c + dc;
        if (!this.isValidCell(nr, nc) || this.mask[nr][nc] === 0) continue;
        const key = `${nr},${nc}`;
        if (blockerHitSet.has(key)) continue;

        if (this.cauldron[nr]?.[nc] > 0) {
          blockerHitSet.add(key);
          this.hitCauldronAt(nr, nc);
        } else if (this.frosting[nr][nc] > 0) {
          blockerHitSet.add(key);
          this.frosting[nr][nc]--;
          this.addPatronusCharge(5);
          this.damageBoss(35);
          sound.playIceBreak();
          this.spawnBurst(nr, nc, '#cbd5e1', 9);
          this.addScore(90, nr, nc, '#e2e8f0', false, 'blocker');
        } else if (this.chocolate[nr][nc] > 0) {
          blockerHitSet.add(key);
          this.chocolate[nr][nc] = 0;
          this.chocolateBrokenThisTurn = true;
          this.addPatronusCharge(6);
          this.damageBoss(45);
          sound.playIceBreak();
          this.spawnBurst(nr, nc, '#a16207', 11);
          this.addScore(120, nr, nc, '#fbbf24', false, 'blocker');
        } else if (this.grid[nr][nc]?.blocker === 'swirl' && (this.lockGrid[nr]?.[nc] || 0) === 0) {
          blockerHitSet.add(key);
          this.grid[nr][nc] = null;
          this.addPatronusCharge(5);
          this.damageBoss(35);
          sound.playIceBreak();
          this.spawnBurst(nr, nc, '#fde047', 10);
          this.addScore(100, nr, nc, '#fde047', false, 'blocker');
        }
      }
    }
  }

  async clearClusters(clusters, comboStep = 1, preferredAnchors = [], session = this.sessionId) {
    if (session !== this.sessionId) return;
    sound.playMatch(comboStep);
    if (comboStep >= 3) {
      const praise = COMBO_PRAISES[Math.min(COMBO_PRAISES.length - 1, comboStep - 2)];
      this.spawnCenterBanner(`${praise} ×${comboStep}`);
      const voiceWords = ['Sweet!', 'Tasty!', 'Delicious!', 'Divine!'];
      sound.playVoiceCallout(voiceWords[Math.min(voiceWords.length - 1, comboStep - 3)]);
    }

    const triggered = new Set();
    const adjacentBlockerHits = new Set();
    const pendingSpawns = [];

    for (const cluster of clusters) {
      let spawnCell = null;
      if (cluster.spawnSpecial) {
        this.addPatronusCharge(7);
        for (const anchor of preferredAnchors) {
          const found = cluster.cells.find(
            (ce) => ce.r === anchor.r && ce.c === anchor.c && !this.isCellLocked(ce.r, ce.c)
          );
          if (found) {
            spawnCell = found;
            break;
          }
        }
        if (!spawnCell) {
          const intersection = cluster.cells.find((ce) => ce.count > 1 && !this.isCellLocked(ce.r, ce.c));
          spawnCell = intersection || cluster.cells.find((ce) => !this.isCellLocked(ce.r, ce.c)) || cluster.cells[0];
        }
        pendingSpawns.push({
          r: spawnCell.r,
          c: spawnCell.c,
          color: cluster.color,
          special: cluster.spawnSpecial
        });
      }

      // Phá các ô Chướng Ngại Vật nằm kề bên cụm ghép (Vạc Độc Dược, Đá Cổ Ngữ, Sô-cô-la, Xoáy Cam Thảo)
      this.damageAdjacentBlockers(cluster.cells, adjacentBlockerHits);

      for (const cell of cluster.cells) {
        this.damageCell(cell.r, cell.c, triggered, false);
      }

      this.addPatronusCharge(cluster.cells.length * 2.8);
      this.damageBoss((cluster.cells.length * 28 + (cluster.spawnSpecial ? 95 : 0)) * comboStep);

      const pts = cluster.cells.length * 60 * comboStep + (cluster.spawnSpecial ? 220 : 0);
      const midCell = cluster.cells[Math.floor(cluster.cells.length / 2)];
      this.addScore(pts, midCell.r, midCell.c, TILE_TYPES[cluster.color]?.light || '#fde047', true, 'match');
    }

    for (const sp of pendingSpawns) {
      if (!this.isCellLocked(sp.r, sp.c) && !this.hasStaticBlocker(sp.r, sp.c)) {
        if (!this.grid[sp.r][sp.c] || !this.grid[sp.r][sp.c].primedWrapped) {
          this.grid[sp.r][sp.c] = this.createPiece(sp.color, sp.c, sp.r, sp.special);
          this.grid[sp.r][sp.c].scale = 1.28;
          this.spawnRing(sp.r, sp.c, 1.15, '#fde047');
        }
      }
    }

    this.emitHudState();
    await sleep(210);
  }

  damageCell(r, c, triggeredSet, fromSpecialBlast = false, bypassLock = false) {
    if (!this.isValidCell(r, c) || this.mask[r][c] === 0) return;

    // 0. Vạc Độc Dược (Magic Cauldron 1–3 HP)
    if (this.cauldron[r]?.[c] > 0) {
      const caKey = `ca:${r},${c}`;
      if (!triggeredSet.has(caKey)) {
        triggeredSet.add(caKey);
        this.hitCauldronAt(r, c);
      }
      return;
    }

    // 1. Đá Cổ Ngữ (Frosting 1–3 lớp)
    if (this.frosting[r][c] > 0) {
      const fKey = `fr:${r},${c}`;
      if (!triggeredSet.has(fKey)) {
        triggeredSet.add(fKey);
        this.frosting[r][c]--;
        this.addPatronusCharge(5);
        this.damageBoss(35);
        sound.playIceBreak();
        this.spawnBurst(r, c, '#cbd5e1', 10);
        this.addScore(90, r, c, '#e2e8f0', false, 'blocker');
      }
      return;
    }

    // 2. Sô-cô-la Hắc Ám Tự Lan
    if (this.chocolate[r][c] > 0) {
      const cKey = `ch:${r},${c}`;
      if (!triggeredSet.has(cKey)) {
        triggeredSet.add(cKey);
        this.chocolate[r][c] = 0;
        this.chocolateBrokenThisTurn = true;
        this.addPatronusCharge(6);
        this.damageBoss(45);
        sound.playIceBreak();
        this.spawnBurst(r, c, '#a16207', 11);
        this.addScore(120, r, c, '#fbbf24', false, 'blocker');
      }
      return;
    }

    // 2b. Ô Khoá Vàng Gringotts (Sugar Lock — chỉ mở bằng Chìa Khoá Đường Vàng hoặc Búa/Thần Hộ Mệnh)
    if ((this.lockGrid[r]?.[c] || 0) > 0) {
      const lkKey = `lk:${r},${c}`;
      if (!triggeredSet.has(lkKey)) {
        triggeredSet.add(lkKey);
        if (bypassLock) {
          this.lockGrid[r][c] = 0;
          sound.playKeyUnlock();
          this.spawnBurst(r, c, '#fde047', 12);
          this.spawnPopup(r, c, 'MỞ KHOÁ!', '#fef08a', 14);
          this.addScore(150, r, c, '#fef08a', false, 'blocker');
          this.damageBoss(65);
        } else {
          this.spawnBurst(r, c, '#fbbf24', 4);
        }
      }
      return;
    }

    // 3. Khung Băng Đường Azkaban (Ice 1–2 lớp)
    if (this.ice[r][c] > 0) {
      const iKey = `ic:${r},${c}`;
      if (!triggeredSet.has(iKey)) {
        triggeredSet.add(iKey);
        this.ice[r][c]--;
        this.addPatronusCharge(5);
        this.damageBoss(30);
        sound.playIceBreak();
        this.spawnBurst(r, c, '#bae6fd', 10);
      }
      if (fromSpecialBlast || this.ice[r][c] > 0) return;
    }

    const piece = this.grid[r][c];
    const jellyKey = `j:${r},${c}`;
    if (!piece) {
      if (fromSpecialBlast && !triggeredSet.has(jellyKey)) {
        triggeredSet.add(jellyKey);
        this.breakJelly(r, c);
      }
      return;
    }

    // 4. Hòn Đá Phù Thủy (Ingredient) bất hoại — chỉ phá lớp Thạch nằm bên dưới nếu có
    if (piece.isIngredient) {
      if (fromSpecialBlast && !triggeredSet.has(jellyKey)) {
        triggeredSet.add(jellyKey);
        this.breakJelly(r, c);
      }
      return;
    }

    // 5. Kẹo Bọc đang nạp năng lượng chờ Nổ Nhịp 2
    if (piece.primedWrapped) return;

    // 6. Xoáy Cam Thảo (Licorice Swirl)
    if (piece.blocker === 'swirl') {
      const sKey = `sw:${r},${c}`;
      if (!triggeredSet.has(sKey)) {
        triggeredSet.add(sKey);
        this.grid[r][c] = null;
        this.addPatronusCharge(5);
        this.damageBoss(35);
        sound.playIceBreak();
        this.spawnBurst(r, c, '#fde047', 10);
        this.addScore(100, r, c, '#fde047', false, 'blocker');
      }
      return;
    }

    const key = `${r},${c}`;
    const wasSpecial = piece.special;
    const pieceColor = piece.color;
    const hadKey = piece.hasKey;

    if (wasSpecial !== 'color_bomb' && pieceColor >= 0) {
      this.collected[pieceColor] = (this.collected[pieceColor] || 0) + 1;
    }
    this.grid[r][c] = null;
    this.ice[r][c] = 0;

    if (hadKey) {
      this.unlockWithSugarKey(r, c);
    }

    if (!triggeredSet.has(jellyKey)) {
      triggeredSet.add(jellyKey);
      this.breakJelly(r, c);
    }
    this.spawnBurst(r, c, TILE_TYPES[pieceColor]?.light || '#fde047', 11);

    if (wasSpecial && !triggeredSet.has(key)) {
      triggeredSet.add(key);
      this.recordSpecialTriggered(wasSpecial);
      this.triggerSpecialPiece(r, c, pieceColor, wasSpecial, triggeredSet);
    }
  }

  breakJelly(r, c) {
    if (this.jelly[r][c] > 0) {
      this.jelly[r][c]--;
      this.addPatronusCharge(4);
      this.damageBoss(25);
      this.spawnBurst(r, c, '#d8b4fe', 9);
      this.addScore(80, r, c, '#e9d5ff', false, 'blocker');
    }
  }

  triggerSpecialPiece(r, c, color, special, triggeredSet) {
    const beamColor = TILE_TYPES[color]?.light || '#fde047';
    if (special === 'striped_h') {
      sound.playBeam();
      this.vfx.shake = Math.max(this.vfx.shake, 6);
      this.fireRowBeam(r, c, 0.68, beamColor, triggeredSet, true);
      this.damageBoss(130);
      this.addScore(320, r, c, beamColor, false, 'special');
    } else if (special === 'striped_v') {
      sound.playBeam();
      this.vfx.shake = Math.max(this.vfx.shake, 6);
      this.fireColBeam(c, r, 0.68, beamColor, triggeredSet, true);
      this.damageBoss(130);
      this.addScore(320, r, c, beamColor, false, 'special');
    } else if (special === 'wrapped') {
      sound.playBomb();
      this.vfx.shake = Math.max(this.vfx.shake, 9);
      this.spawnRing(r, c, 2.0, '#fb923c');
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          this.damageCell(r + dr, c + dc, triggeredSet, true);
        }
      }
      // Đặt Kẹo Bọc Nổ Nhịp 2 chuẩn Candy Crush!
      if (!this.ended && this.mask[r][c] === 1 && !this.hasStaticBlocker(r, c) && (this.lockGrid[r]?.[c] || 0) === 0 && !this.grid[r][c]) {
        const primed = this.createPiece(color >= 0 ? color : 0, c, r, 'wrapped');
        primed.primedWrapped = true;
        this.grid[r][c] = primed;
      }
      this.damageBoss(170);
      this.addScore(480, r, c, '#fbbf24', false, 'special');
    } else if (special === 'seeker') {
      sound.playSeeker();
      const [target] = this.pickBestSeekerTargets(1, triggeredSet);
      if (target) {
        this.spawnSeekerVfx(r, c, target.r, target.c, beamColor);
        this.damageCell(target.r, target.c, triggeredSet, true);
      }
      this.damageBoss(140);
      this.addScore(360, r, c, '#fde047', false, 'special');
    } else if (special === 'color_bomb') {
      sound.playColorBomb();
      const targetColor = Math.floor(Math.random() * this.numColors);
      for (let rr = 0; rr < this.size; rr++) {
        for (let cc = 0; cc < this.size; cc++) {
          if (this.mask[rr][cc] === 1 && this.isCellMatchable(rr, cc) && this.grid[rr][cc].color === targetColor) {
            this.spawnArc(r, c, rr, cc, '#fde047');
            this.damageCell(rr, cc, triggeredSet, true);
          }
        }
      }
      this.damageBoss(240);
      this.addScore(700, r, c, '#fde047', false, 'special');
    }
  }

  // Tia Kẹo Sọc ngang — bị Xoáy Cam Thảo hấp thụ và chặn đứng đúng chuẩn Candy Crush!
  fireRowBeam(r, originC = Math.floor(this.size / 2), widthFactor = 0.68, color = '#fde047', triggeredSet = new Set(), stopOnSwirl = true) {
    let cStart = 0;
    let cEnd = this.size - 1;

    if (this.isValidCell(r, originC) && this.mask[r][originC] === 1) {
      this.damageCell(r, originC, triggeredSet, true);
    }

    for (let cc = originC - 1; cc >= 0; cc--) {
      if (this.mask[r][cc] === 0) continue;
      const hitSwirl = stopOnSwirl && this.grid[r][cc]?.blocker === 'swirl';
      this.damageCell(r, cc, triggeredSet, true);
      if (hitSwirl) {
        cStart = cc;
        break;
      }
    }

    for (let cc = originC + 1; cc < this.size; cc++) {
      if (this.mask[r][cc] === 0) continue;
      const hitSwirl = stopOnSwirl && this.grid[r][cc]?.blocker === 'swirl';
      this.damageCell(r, cc, triggeredSet, true);
      if (hitSwirl) {
        cEnd = cc;
        break;
      }
    }

    this.vfx.beams.push({ dir: 'h', r, c: originC, cStart, cEnd, widthFactor, color, life: 0.28, maxLife: 0.28 });
  }

  // Tia Kẹo Sọc dọc — bị Xoáy Cam Thảo hấp thụ và chặn đứng!
  fireColBeam(c, originR = Math.floor(this.size / 2), widthFactor = 0.68, color = '#fde047', triggeredSet = new Set(), stopOnSwirl = true) {
    let rStart = 0;
    let rEnd = this.size - 1;

    if (this.isValidCell(originR, c) && this.mask[originR][c] === 1) {
      this.damageCell(originR, c, triggeredSet, true);
    }

    for (let rr = originR - 1; rr >= 0; rr--) {
      if (this.mask[rr][c] === 0) continue;
      const hitSwirl = stopOnSwirl && this.grid[rr][c]?.blocker === 'swirl';
      this.damageCell(rr, c, triggeredSet, true);
      if (hitSwirl) {
        rStart = rr;
        break;
      }
    }

    for (let rr = originR + 1; rr < this.size; rr++) {
      if (this.mask[rr][c] === 0) continue;
      const hitSwirl = stopOnSwirl && this.grid[rr][c]?.blocker === 'swirl';
      this.damageCell(rr, c, triggeredSet, true);
      if (hitSwirl) {
        rEnd = rr;
        break;
      }
    }

    this.vfx.beams.push({ dir: 'v', r: originR, c, rStart, rEnd, widthFactor, color, life: 0.28, maxLife: 0.28 });
  }

  // Trí tuệ chọn mục tiêu thông minh của Kẹo Cánh Vàng Tầm Thủ (ưu tiên Bom -> Chìa Khoá -> Vạc -> Chướng ngại vật -> Kẹo Mục Tiêu)
  pickBestSeekerTargets(count = 1, excludeSet = new Set()) {
    const neededColors = new Set();
    let needJelly = false;
    let needFrosting = false;
    let needIce = false;
    let needChoco = false;
    let needCauldron = false;
    const remLocks = this.countGridSum(this.lockGrid);

    for (const obj of this.getObjectivesProgress()) {
      if (obj.completed) continue;
      if (obj.type === 'collect') neededColors.add(obj.tileId);
      if (obj.type === 'jelly') needJelly = true;
      if (obj.type === 'frosting') needFrosting = true;
      if (obj.type === 'ice') needIce = true;
      if (obj.type === 'chocolate') needChoco = true;
      if (obj.type === 'cauldron') needCauldron = true;
    }

    const candidates = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.mask[r][c] === 0) continue;
        if (excludeSet.has(`${r},${c}`)) continue;
        if ((this.lockGrid[r]?.[c] || 0) > 0) continue;
        const p = this.grid[r][c];
        if (p?.isIngredient && this.jelly[r][c] === 0) continue;
        if (p?.primedWrapped) continue;

        let priority = Math.random() * 25;
        if (p?.bombTimer !== null && p?.bombTimer !== undefined) {
          priority += 1200 + Math.max(0, 20 - p.bombTimer) * 25;
        } else if (remLocks > 0 && p?.hasKey) {
          priority += 980;
        } else if (this.cauldron[r]?.[c] > 0) {
          priority += needCauldron ? 950 : 810;
        } else if (this.chocolate[r][c] > 0) {
          priority += needChoco ? 920 : 760;
        } else if (this.frosting[r][c] > 0) {
          priority += needFrosting ? 880 : 620;
        } else if (this.ice[r][c] > 0) {
          priority += needIce ? 860 : 580;
        } else if (this.jelly[r][c] > 0) {
          priority += needJelly ? 840 : 480;
        } else if (p?.blocker === 'swirl') {
          priority += 520;
        } else if (p && neededColors.has(p.color)) {
          priority += 450;
        } else if (p) {
          priority += 100;
        } else {
          continue;
        }

        candidates.push({ r, c, priority });
      }
    }

    candidates.sort((a, b) => b.priority - a.priority);
    return candidates.slice(0, count);
  }

  spawnSeekerVfx(r1, c1, r2, c2, color = '#fde047') {
    this.vfx.seekers.push({ r1, c1, r2, c2, color, life: 0.28, maxLife: 0.28 });
  }

  extractIngredientsAtExits() {
    if (this.ingredientExitCells.length === 0) return false;
    let extracted = false;
    for (const ex of this.ingredientExitCells) {
      const p = this.grid[ex.r]?.[ex.c];
      if (p?.isIngredient) {
        this.grid[ex.r][ex.c] = null;
        this.ingredientsCollected++;
        extracted = true;
        sound.playColorBomb();
        this.addPatronusCharge(15);
        this.damageBoss(180);
        this.spawnRing(ex.r, ex.c, 1.6, '#10b981');
        this.spawnBurst(ex.r, ex.c, '#34d399', 18);
        this.spawnPopup(ex.r, ex.c, 'THU HỒI ĐÁ PHÙ THỦY!', '#6ee7b7', 16);
        this.addScore(1000, ex.r, ex.c, '#34d399', false);
      }
    }
    if (extracted) this.emitHudState();
    return extracted;
  }

  countIngredientsOnBoard() {
    let n = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c]?.isIngredient) n++;
      }
    }
    return n;
  }

  countBombsOnBoard() {
    let n = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const p = this.grid[r][c];
        if (p && p.bombTimer !== null && p.bombTimer !== undefined) n++;
      }
    }
    return n;
  }

  createSpawnedPiece(col, targetR) {
    // 1. Sinh Hòn Đá Phù Thủy (Drop Ingredient) ở cột chỉ định nếu còn thiếu
    if (
      this.ingredientTarget > 0 &&
      this.ingredientsSpawned < this.ingredientTarget &&
      !this.isExitCell(targetR, col) &&
      (this.ingredientSpawnCols.length === 0 || this.ingredientSpawnCols.includes(col))
    ) {
      const remainingToSpawn = this.ingredientTarget - this.ingredientsSpawned;
      const urgent = this.movesLeft <= remainingToSpawn * 3 + 3;
      const activeIng = this.countIngredientsOnBoard();
      const maxSimultaneous = urgent
        ? this.ingredientTarget - this.ingredientsCollected
        : Math.min(2, this.ingredientTarget - this.ingredientsCollected);
      const dropChance = urgent ? 0.9 : 0.32;
      if (activeIng === 0 || (activeIng < maxSimultaneous && Math.random() < dropChance)) {
        this.ingredientsSpawned++;
        return this.createIngredientPiece(col, targetR);
      }
    }

    // 2. Sinh kẹo mới (gắn Bom Đếm Ngược hoặc Chìa Khoá Đường Vàng nếu cần)
    const color = Math.floor(Math.random() * this.numColors);
    const piece = this.createPiece(color, col, targetR);
    if (this.pendingBombSpawns > 0 && this.bombConfig && !this.ended) {
      this.pendingBombSpawns--;
      piece.bombTimer = this.bombConfig.startTimer;
    } else if (this.countGridSum(this.lockGrid) > 0 && !this.ended) {
      const keysActive = this.countKeysOnBoard();
      if (keysActive === 0 || (keysActive < 2 && Math.random() < 0.24)) {
        piece.hasKey = true;
      }
    }
    return piece;
  }

  isOpenEmpty(r, c) {
    return (
      this.isValidCell(r, c) &&
      this.mask[r][c] === 1 &&
      !this.hasStaticBlocker(r, c) &&
      !this.isCellLocked(r, c) &&
      this.grid[r][c] === null
    );
  }

  canPieceFall(r, c) {
    return (
      this.isValidCell(r, c) &&
      this.mask[r][c] === 1 &&
      !this.hasStaticBlocker(r, c) &&
      !this.isCellLocked(r, c) &&
      this.grid[r][c] !== null
    );
  }

  // Trọng lực Rơi Thẳng + Trượt Chéo qua Vạc/Đá/Sô-cô-la/Băng/Khoá + Dịch Chuyển Bột Floo + Thu Hồi Bảo Vật
  async applyGravityAndRefill(session = this.sessionId) {
    if (session !== this.sessionId) return;

    // Đảm bảo không có ô rỗng nào bị kẹt trạng thái ice > 0 hoặc lockGrid > 0
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (!this.grid[r][c]) {
          if (this.ice[r][c] > 0) this.ice[r][c] = 0;
          if ((this.lockGrid[r]?.[c] || 0) > 0) this.lockGrid[r][c] = 0;
        }
      }
    }

    const startCoords = new Map();
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const p = this.grid[r][c];
        if (p) {
          p.x = c;
          p.y = r;
          startCoords.set(p.id, { x: c, y: r });
        }
      }
    }

    const colSpawnCounts = new Array(this.size).fill(0);
    this.extractIngredientsAtExits();

    let portalPlayed = false;
    const maxTicks = this.size * 4 + 14;

    for (let tick = 0; tick < maxTicks; tick++) {
      let moved = false;

      // Bước A: Lò Sưởi Bột Floo dịch chuyển tức thời từ cửa vào sang cửa ra
      for (const portal of this.portals) {
        const { from, to, color } = portal;
        if (this.canPieceFall(from.r, from.c) && this.isOpenEmpty(to.r, to.c)) {
          const p = this.grid[from.r][from.c];
          this.grid[to.r][to.c] = p;
          this.grid[from.r][from.c] = null;
          startCoords.set(p.id, { x: to.c, y: to.r - 0.65 });
          this.spawnBurst(from.r, from.c, color || '#10b981', 5);
          this.spawnBurst(to.r, to.c, color || '#10b981', 5);
          if (!portalPlayed) {
            sound.playPortal();
            portalPlayed = true;
          }
          moved = true;
        }
      }

      // Bước B: Rơi thẳng xuống dưới (xuyên qua các ô cắt nghệ thuật mask=0 nếu không vướng vật cản)
      for (let r = this.size - 2; r >= 0; r--) {
        for (let c = 0; c < this.size; c++) {
          if (!this.canPieceFall(r, c)) continue;

          let targetR = -1;
          if (this.isOpenEmpty(r + 1, c)) {
            targetR = r + 1;
          } else if (this.mask[r + 1][c] === 0) {
            for (let rr = r + 2; rr < this.size; rr++) {
              if (this.mask[rr][c] === 0) continue;
              if (this.isOpenEmpty(rr, c)) targetR = rr;
              break;
            }
          }

          if (targetR !== -1) {
            this.grid[targetR][c] = this.grid[r][c];
            this.grid[r][c] = null;
            moved = true;
          }
        }
      }

      // Bước C: Trượt chéo (Diagonal Slide) quanh Vạc / Đá Cổ Ngữ / Sô-cô-la / Băng / Ô Khoá chuẩn Candy Crush!
      for (let r = this.size - 2; r >= 0; r--) {
        for (let c = 0; c < this.size; c++) {
          if (!this.canPieceFall(r, c)) continue;
          const dirs = (r + c + tick) % 2 === 0 ? [-1, 1] : [1, -1];
          for (const dc of dirs) {
            const nc = c + dc;
            if (!this.isOpenEmpty(r + 1, nc)) continue;
            if (this.canPieceFall(r, nc)) continue;
            this.grid[r + 1][nc] = this.grid[r][c];
            this.grid[r][c] = null;
            moved = true;
            break;
          }
        }
      }

      // Bước D: Nạp kẹo mới (hoặc Hòn Đá Phù Thủy / Bom / Chìa Khoá) vào đỉnh mỗi cột đang trống
      for (let c = 0; c < this.size; c++) {
        let topR = -1;
        for (let r = 0; r < this.size; r++) {
          if (this.mask[r][c] === 1) {
            topR = r;
            break;
          }
        }
        if (topR !== -1 && this.isOpenEmpty(topR, c)) {
          colSpawnCounts[c]++;
          const startY = topR - colSpawnCounts[c] - 0.35;
          const newPiece = this.createSpawnedPiece(c, topR);
          this.grid[topR][c] = newPiece;
          startCoords.set(newPiece.id, { x: c, y: startY });
          moved = true;
        }
      }

      // Bước E: Nếu Hòn Đá Phù Thủy vừa chạm ô Lối Thoát đáy -> Thu hồi ngay và tiếp tục dồn kẹo!
      if (this.extractIngredientsAtExits()) {
        moved = true;
      }

      if (!moved) break;
    }

    // Bảo hiểm tuyệt đối: Kết tinh kẹo phép cho mọi túi kín bị che khuất để không bao giờ tồn tại ô rỗng
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.isOpenEmpty(r, c)) {
          const p = this.createPiece(Math.floor(Math.random() * this.numColors), c, r);
          this.grid[r][c] = p;
          startCoords.set(p.id, { x: c, y: r - 0.7 });
        }
      }
    }
    this.extractIngredientsAtExits();

    // Đảm bảo luôn có ít nhất 1 Chìa Khoá Đường Vàng trên bàn khi vẫn còn Ô Khoá Gringotts
    if (this.countGridSum(this.lockGrid) > 0 && this.countKeysOnBoard() === 0) {
      this.ensureSugarKeysOnBoard(1);
    }

    // Dựng danh sách chuyển động 2 chiều (cả trục X cho Trượt Chéo lẫn trục Y cho Trọng Lực)
    const animItems = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const p = this.grid[r][c];
        if (!p) continue;
        const st = startCoords.get(p.id) || { x: c, y: r };
        if (Math.abs(st.x - c) > 0.01 || Math.abs(st.y - r) > 0.01) {
          p.x = st.x;
          p.y = st.y;
          animItems.push({ piece: p, fromX: st.x, fromY: st.y, toX: c, toY: r });
        } else {
          p.x = c;
          p.y = r;
        }
      }
    }

    if (animItems.length === 0) return;

    const maxDist = Math.max(...animItems.map((m) => Math.hypot(m.toX - m.fromX, m.toY - m.fromY)));
    const duration = Math.min(310, Math.max(145, maxDist * 44));
    const start = performance.now();

    await new Promise((resolve) => {
      const step = (now) => {
        if (session !== this.sessionId) {
          resolve();
          return;
        }
        const t = Math.min(1, (now - start) / duration);
        const ease = 1 - Math.pow(1 - t, 2.35);
        for (const m of animItems) {
          m.piece.x = m.fromX + (m.toX - m.fromX) * ease;
          m.piece.y = m.fromY + (m.toY - m.fromY) * ease;
          if (m.piece.scale > 1 && !m.piece.primedWrapped) {
            m.piece.scale = 1 + (m.piece.scale - 1) * (1 - t);
          }
        }
        if (t < 1) nextAnimFrame(step);
        else resolve();
      };
      nextAnimFrame(step);
    });

    if (session !== this.sessionId) return;
    for (const m of animItems) {
      m.piece.x = m.toX;
      m.piece.y = m.toY;
      if (!m.piece.primedWrapped) m.piece.scale = 1;
    }
  }

  // Dịch chuyển Băng Chuyền Cầu Thang 1 nấc vào cuối lượt người chơi
  async shiftConveyorBelts(session = this.sessionId) {
    if (!this.conveyorLoops || this.conveyorLoops.length === 0) return false;
    const animMoves = [];

    for (const loop of this.conveyorLoops) {
      const movable = loop.filter(
        (pt) =>
          this.mask[pt.r]?.[pt.c] === 1 &&
          !this.hasStaticBlocker(pt.r, pt.c) &&
          !this.isCellLocked(pt.r, pt.c) &&
          this.grid[pt.r]?.[pt.c]
      );
      if (movable.length < 2) continue;

      const snapshot = movable.map((pt) => this.grid[pt.r][pt.c]);
      for (let i = 0; i < movable.length; i++) {
        const from = movable[i];
        const to = movable[(i + 1) % movable.length];
        const piece = snapshot[i];
        this.grid[to.r][to.c] = piece;
        if (piece) {
          piece.x = from.c;
          piece.y = from.r;
          animMoves.push({ piece, fromX: from.c, fromY: from.r, toX: to.c, toY: to.r });
        }
      }
    }

    if (animMoves.length === 0) return false;
    sound.playConveyor();

    const duration = 155;
    const start = performance.now();
    await new Promise((resolve) => {
      const step = (now) => {
        if (session !== this.sessionId) {
          resolve();
          return;
        }
        const t = Math.min(1, (now - start) / duration);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        for (const m of animMoves) {
          m.piece.x = m.fromX + (m.toX - m.fromX) * ease;
          m.piece.y = m.fromY + (m.toY - m.fromY) * ease;
        }
        if (t < 1) nextAnimFrame(step);
        else resolve();
      };
      nextAnimFrame(step);
    });

    if (session !== this.sessionId) return true;
    for (const m of animMoves) {
      m.piece.x = m.toX;
      m.piece.y = m.toY;
    }

    if (this.extractIngredientsAtExits()) {
      await this.applyGravityAndRefill(session);
      if (session !== this.sessionId) return true;
    }
    if (this.findMatchClusters().length > 0) {
      await this.resolveAllCascades(1, session);
    }
    return true;
  }

  // Quét nước đi hợp lệ (Ravenclaw ưu tiên chỉ ra nước tạo Kẹo Phép hoặc kích nổ Combo!)
  findAnyValidMove(preferSpecial = this.house === 'ravenclaw') {
    const dirs = [
      [0, 1],
      [1, 0]
    ];
    let fallbackPair = null;

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (
          this.mask[r][c] === 0 ||
          this.isCellLocked(r, c) ||
          this.hasStaticBlocker(r, c) ||
          !this.grid[r][c]
        ) {
          continue;
        }
        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (
            !this.isValidCell(nr, nc) ||
            this.mask[nr][nc] === 0 ||
            this.isCellLocked(nr, nc) ||
            this.hasStaticBlocker(nr, nc) ||
            !this.grid[nr][nc]
          ) {
            continue;
          }
          const pA = this.grid[r][c];
          const pB = this.grid[nr][nc];

          if (pA.special === 'seeker' || pB.special === 'seeker') {
            return [{ r, c }, { r: nr, c: nc }];
          }
          if (
            (pA.special === 'color_bomb' && !pB.isIngredient && !pB.blocker) ||
            (pB.special === 'color_bomb' && !pA.isIngredient && !pA.blocker)
          ) {
            return [{ r, c }, { r: nr, c: nc }];
          }
          if (pA.special && pB.special) {
            return [{ r, c }, { r: nr, c: nc }];
          }

          this.grid[r][c] = pB;
          this.grid[nr][nc] = pA;
          const m1 = this.quickCheckMatchQualityAt(r, c);
          const m2 = this.quickCheckMatchQualityAt(nr, nc);
          this.grid[r][c] = pA;
          this.grid[nr][nc] = pB;

          const bestQ = Math.max(m1, m2);
          if (bestQ > 0) {
            const pair = [{ r, c }, { r: nr, c: nc }];
            if (!preferSpecial || bestQ >= 2) return pair;
            if (!fallbackPair) fallbackPair = pair;
          }
        }
      }
    }
    return fallbackPair;
  }

  // Trả về 0 = không khớp, 1 = bộ 3 thường, 2 = tạo Kẹo Phép (4/5/T/L/2×2)
  quickCheckMatchQualityAt(r, c) {
    if (!this.isCellMatchable(r, c)) return 0;
    const col = this.grid[r][c].color;

    let h = 1;
    for (let cc = c - 1; cc >= 0 && this.isCellMatchable(r, cc) && this.grid[r][cc].color === col; cc--) h++;
    for (let cc = c + 1; cc < this.size && this.isCellMatchable(r, cc) && this.grid[r][cc].color === col; cc++) h++;

    let v = 1;
    for (let rr = r - 1; rr >= 0 && this.isCellMatchable(rr, c) && this.grid[rr][c].color === col; rr--) v++;
    for (let rr = r + 1; rr < this.size && this.isCellMatchable(rr, c) && this.grid[rr][c].color === col; rr++) v++;

    if (h >= 4 || v >= 4 || (h >= 3 && v >= 3)) return 2;

    // Kiểm tra Ô Vuông 2×2 chứa (r, c)
    for (const dr of [-1, 0]) {
      for (const dc of [-1, 0]) {
        const r0 = r + dr;
        const c0 = c + dc;
        if (r0 < 0 || c0 < 0 || r0 + 1 >= this.size || c0 + 1 >= this.size) continue;
        if (
          this.isCellMatchable(r0, c0) &&
          this.isCellMatchable(r0, c0 + 1) &&
          this.isCellMatchable(r0 + 1, c0) &&
          this.isCellMatchable(r0 + 1, c0 + 1) &&
          this.grid[r0][c0].color === col &&
          this.grid[r0][c0 + 1].color === col &&
          this.grid[r0 + 1][c0].color === col &&
          this.grid[r0 + 1][c0 + 1].color === col
        ) {
          return 2;
        }
      }
    }

    if (h >= 3 || v >= 3) return 1;
    return 0;
  }

  quickCheckMatchAt(r, c) {
    return this.quickCheckMatchQualityAt(r, c) > 0;
  }

  shuffleInternal(avoidImmediateMatches = true) {
    const coords = [];
    const pieces = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const p = this.grid[r][c];
        if (
          this.mask[r][c] === 1 &&
          !this.isCellLocked(r, c) &&
          !this.hasStaticBlocker(r, c) &&
          p &&
          !p.isIngredient &&
          !p.blocker
        ) {
          coords.push({ r, c });
          pieces.push(p);
        }
      }
    }
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
    coords.forEach((pos, idx) => {
      const p = pieces[idx];
      this.grid[pos.r][pos.c] = p;
      p.x = pos.c;
      p.y = pos.r;
    });

    if (avoidImmediateMatches) {
      for (let pass = 0; pass < 18; pass++) {
        const clusters = this.findMatchClusters();
        if (clusters.length === 0) break;
        let changed = false;
        for (const cl of clusters) {
          for (const cell of cl.cells) {
            const p = this.grid[cell.r][cell.c];
            if (!p || this.isCellLocked(cell.r, cell.c) || p.special || !this.isMatchablePiece(p)) continue;
            if (!this.quickCheckMatchAt(cell.r, cell.c)) continue;
            const startCol = Math.floor(Math.random() * this.numColors);
            for (let k = 0; k < this.numColors; k++) {
              const candidate = (startCol + k) % this.numColors;
              if (candidate === p.color) continue;
              p.color = candidate;
              if (!this.quickCheckMatchAt(cell.r, cell.c)) {
                changed = true;
                break;
              }
            }
          }
        }
        if (!changed) break;
      }
    }
  }

  grantEmergencyMovePiece() {
    const dirs = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0]
    ];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const p = this.grid[r][c];
        if (
          !p ||
          p.isIngredient ||
          p.blocker ||
          this.mask[r][c] === 0 ||
          this.isCellLocked(r, c) ||
          this.hasStaticBlocker(r, c)
        ) {
          continue;
        }
        const hasNeighbor = dirs.some(([dr, dc]) => {
          const nr = r + dr;
          const nc = c + dc;
          return (
            this.isValidCell(nr, nc) &&
            this.mask[nr][nc] === 1 &&
            !this.isCellLocked(nr, nc) &&
            !this.hasStaticBlocker(nr, nc) &&
            this.grid[nr][nc] !== null
          );
        });
        if (hasNeighbor) {
          if (p.color < 0) p.color = 0;
          p.special = 'seeker';
          return;
        }
      }
    }

    // Bảo hiểm chống kẹt bàn cờ tuyệt đối
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const p = this.grid[r][c];
        if (!p || p.isIngredient || p.blocker || this.mask[r][c] === 0 || this.isCellLocked(r, c)) continue;
        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (!this.isValidCell(nr, nc) || this.mask[nr][nc] === 0) continue;
          this.chocolate[nr][nc] = 0;
          this.frosting[nr][nc] = 0;
          this.cauldron[nr][nc] = 0;
          this.ice[nr][nc] = 0;
          this.lockGrid[nr][nc] = 0;
          if (!this.grid[nr][nc]) {
            this.grid[nr][nc] = this.createPiece(Math.floor(Math.random() * this.numColors), nc, nr);
          }
          if (p.color < 0) p.color = 0;
          p.special = 'seeker';
          return;
        }
      }
    }
  }

  async performShuffleAnimation(session = this.sessionId) {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const p = this.grid[r][c];
        if (p && !this.isCellLocked(r, c) && !p.isIngredient && !p.blocker) p.scale = 0.25;
      }
    }
    await sleep(160);
    if (session !== this.sessionId) return;
    let tries = 0;
    do {
      this.shuffleInternal(true);
      tries++;
    } while (!this.findAnyValidMove(false) && tries < 25);

    if (!this.findAnyValidMove(false)) {
      this.grantEmergencyMovePiece();
    }

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.grid[r][c]) this.grid[r][c].scale = 1;
      }
    }
    await sleep(140);
  }

  spreadOneChocolate() {
    if (this.chocolateBrokenThisTurn) return false;
    // Nội tại Nhà Slytherin: kìm hãm Sô-cô-la Hắc Ám chỉ lan vào các lượt chẵn
    if (this.house === 'slytherin' && this.movesUsed % 2 === 1) return false;

    const totalChoco = this.countGridSum(this.chocolate);
    if (totalChoco <= 0) return false;

    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1]
    ];
    const candidates = [];
    const seen = new Set();

    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.chocolate[r][c] <= 0) continue;
        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (!this.isValidCell(nr, nc) || this.mask[nr][nc] === 0) continue;
          if (nr === 0 || this.isExitCell(nr, nc) || this.isPortalCell(nr, nc) || this.isConveyorCell(nr, nc)) continue;
          if (this.hasStaticBlocker(nr, nc) || this.isCellLocked(nr, nc)) continue;
          const p = this.grid[nr][nc];
          if (!p || !this.isMatchablePiece(p) || p.special || p.bombTimer !== null || p.hasKey) continue;
          const key = `${nr},${nc}`;
          if (!seen.has(key)) {
            seen.add(key);
            candidates.push({ r: nr, c: nc });
          }
        }
      }
    }

    if (candidates.length === 0) return false;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    this.grid[pick.r][pick.c] = null;
    this.chocolate[pick.r][pick.c] = 1;
    sound.playChocolateSpread();
    this.spawnBurst(pick.r, pick.c, '#5c2810', 10);
    this.spawnPopup(pick.r, pick.c, 'Sô-cô-la lan!', '#e9d5ff', 14);
    return true;
  }

  // Vạc Độc Dược sôi ủ đủ 3 lượt không bị đánh choáng sẽ trào 1 vật cản sang ô bên cạnh
  tickCauldrons() {
    let brewed = false;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if ((this.cauldron[r]?.[c] || 0) <= 0) continue;
        if (this.cauldronStunnedThisTurn.has(`${r},${c}`)) continue;

        this.cauldronCharge[r][c] = (this.cauldronCharge[r][c] || 0) + 1;
        if (this.cauldronCharge[r][c] < 3) continue;
        this.cauldronCharge[r][c] = 0;

        const candidates = [];
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const dist = Math.abs(dr) + Math.abs(dc);
            if (dist === 0 || dist > 2) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (!this.isValidCell(nr, nc) || this.mask[nr][nc] === 0) continue;
            if (nr === 0 || this.isExitCell(nr, nc) || this.isPortalCell(nr, nc) || this.isConveyorCell(nr, nc)) continue;
            if (this.hasStaticBlocker(nr, nc) || this.isCellLocked(nr, nc)) continue;
            const p = this.grid[nr][nc];
            if (!p || !this.isMatchablePiece(p) || p.special || p.bombTimer !== null || p.hasKey) continue;
            candidates.push({ r: nr, c: nc, dist });
          }
        }
        if (candidates.length === 0) continue;
        candidates.sort((a, b) => a.dist - b.dist || Math.random() - 0.5);
        const pick = candidates[0];
        if (Math.random() < 0.5) {
          this.ice[pick.r][pick.c] = 1;
        } else {
          this.grid[pick.r][pick.c] = this.createSwirlPiece(pick.c, pick.r);
        }
        brewed = true;
        this.spawnArc(r, c, pick.r, pick.c, '#10b981');
        this.spawnBurst(pick.r, pick.c, '#bef264', 10);
        this.spawnPopup(pick.r, pick.c, 'Độc dược trào!', '#bef264', 13);
      }
    }
    if (brewed) sound.playChocolateSpread();
    return brewed;
  }

  // Đại Trùm phản đòn ếm Bùa Chú Hắc Ám mỗi castInterval lượt khi còn máu
  castBossHex() {
    if (!this.bossConfig || this.bossDefeated || this.bossHp <= 0) return false;
    if (this.movesUsed <= 0 || this.movesUsed % this.bossConfig.castInterval !== 0) return false;

    const candidates = [];
    for (let r = 2; r <= this.size - 2; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.mask[r][c] === 0) continue;
        if (this.isExitCell(r, c) || this.isPortalCell(r, c) || this.isConveyorCell(r, c)) continue;
        if (this.hasStaticBlocker(r, c) || this.isCellLocked(r, c)) continue;
        const p = this.grid[r][c];
        if (!p || !this.isMatchablePiece(p) || p.special || p.bombTimer !== null || p.hasKey) continue;
        candidates.push({ r, c });
      }
    }
    if (candidates.length === 0) return false;
    candidates.sort(() => Math.random() - 0.5);

    const count = this.level.id >= 60 ? 2 : 1;
    const chosen = candidates.slice(0, count);
    const midC = Math.floor(this.size / 2);

    for (let i = 0; i < chosen.length; i++) {
      const { r, c } = chosen[i];
      const hex = this.bossConfig.hexType;
      this.spawnArc(0, midC, r, c, '#c084fc');
      if (hex === 'chocolate') {
        this.grid[r][c] = null;
        this.chocolate[r][c] = 1;
      } else if (hex === 'ice' || (hex === 'dark_curse' && i % 2 === 0)) {
        this.ice[r][c] = 1;
      } else {
        this.grid[r][c] = this.createSwirlPiece(c, r);
      }
      this.spawnBurst(r, c, '#c084fc', 10);
    }

    sound.playBossHex();
    this.vfx.shake = Math.max(this.vfx.shake, 6);
    this.spawnCenterBanner(`${this.bossConfig.emoji} ${this.bossConfig.hexName.toUpperCase()}!`);
    return true;
  }

  tickBombsAndCheckExplosion() {
    let explodedCell = null;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const p = this.grid[r][c];
        if (p && p.bombTimer !== null && p.bombTimer !== undefined) {
          p.bombTimer = Math.max(0, p.bombTimer - 1);
          if (p.bombTimer <= 0 && !explodedCell) {
            explodedCell = { r, c };
          }
        }
      }
    }

    if (
      this.bombConfig &&
      this.movesUsed > 0 &&
      this.movesUsed % this.bombConfig.intervalMoves === 0 &&
      this.countBombsOnBoard() < 2
    ) {
      this.pendingBombSpawns = 1;
    }

    return explodedCell;
  }

  getObjectivesProgress() {
    if (!this.level) return [];
    const remJelly = this.countGridSum(this.jelly);
    const remIce = this.countGridSum(this.ice);
    const remFrosting = this.countGridSum(this.frosting);
    const remChocolate = this.countGridSum(this.chocolate);
    const remCauldrons = this.countPositiveCells(this.cauldron);
    const remLocks = this.countGridSum(this.lockGrid);

    return this.level.objectives.map((obj) => {
      if (obj.type === 'boss') {
        const dealt = Math.max(0, this.bossMaxHp - this.bossHp);
        return { ...obj, current: dealt, remaining: this.bossHp, completed: this.bossHp <= 0 };
      }
      if (obj.type === 'cauldron') {
        const done = Math.max(0, this.initialCauldronPots - remCauldrons);
        return { ...obj, current: done, remaining: remCauldrons, completed: remCauldrons === 0 };
      }
      if (obj.type === 'key_lock') {
        const done = Math.max(0, this.initialLocks - remLocks);
        return { ...obj, current: done, remaining: remLocks, completed: remLocks === 0 };
      }
      if (obj.type === 'jelly') {
        const done = Math.max(0, this.initialJelly - remJelly);
        return { ...obj, current: done, remaining: remJelly, completed: remJelly === 0 };
      }
      if (obj.type === 'ice') {
        const done = Math.max(0, this.initialIce - remIce);
        return { ...obj, current: done, remaining: remIce, completed: remIce === 0 };
      }
      if (obj.type === 'frosting') {
        const done = Math.max(0, this.initialFrosting - remFrosting);
        return { ...obj, current: done, remaining: remFrosting, completed: remFrosting === 0 };
      }
      if (obj.type === 'chocolate') {
        return { ...obj, target: remChocolate, current: remChocolate === 0 ? 1 : 0, remaining: remChocolate, completed: remChocolate === 0 };
      }
      if (obj.type === 'ingredient') {
        const cur = this.ingredientsCollected;
        const rem = Math.max(0, obj.target - cur);
        return { ...obj, current: cur, remaining: rem, completed: rem === 0 };
      }
      if (obj.type === 'special_order') {
        const cur = this.specialStats[obj.specialKind] || 0;
        const rem = Math.max(0, obj.target - cur);
        return { ...obj, current: cur, remaining: rem, completed: rem === 0 };
      }
      if (obj.type === 'score') {
        const rem = Math.max(0, obj.target - this.score);
        return { ...obj, current: this.score, remaining: rem, completed: rem === 0 };
      }
      if (obj.type === 'collect') {
        const cur = this.collected[obj.tileId] || 0;
        const rem = Math.max(0, obj.target - cur);
        return { ...obj, current: cur, remaining: rem, completed: rem === 0 };
      }
      return { ...obj, current: 0, remaining: 0, completed: true };
    });
  }

  areAllObjectivesComplete() {
    const list = this.getObjectivesProgress();
    return list.length > 0 && list.every((o) => o.completed);
  }

  getEarnedStars() {
    if (!this.level) return 0;
    const [s1, s2, s3] = this.level.stars;
    if (this.score >= s3) return 3;
    if (this.score >= s2) return 2;
    if (this.score >= s1) return 1;
    return 0;
  }

  async checkPostTurnState(session = this.sessionId, consumedPlayerTurn = false) {
    if (session !== this.sessionId) return;
    this.emitHudState();

    // 1. Kiểm tra Chiến Thắng ngay khi đủ mục tiêu!
    if (this.areAllObjectivesComplete()) {
      await this.finishVictorySequence(session);
      return;
    }

    // 2. Xử lý hiệu ứng cuối lượt: Băng Chuyền -> Sô-cô-la Lan -> Vạc Độc Dược -> Bùa Trùm -> Bom Đếm Ngược
    if (consumedPlayerTurn) {
      if (this.conveyorLoops.length > 0) {
        this.busy = true;
        await this.shiftConveyorBelts(session);
        if (session !== this.sessionId) return;
        this.busy = false;
        if (this.areAllObjectivesComplete()) {
          await this.finishVictorySequence(session);
          return;
        }
      }

      this.spreadOneChocolate();
      this.tickCauldrons();
      this.castBossHex();
      const explodedBomb = this.tickBombsAndCheckExplosion();
      if (this.countGridSum(this.lockGrid) > 0 && this.countKeysOnBoard() === 0) {
        this.ensureSugarKeysOnBoard(1);
      }
      this.emitHudState();
      this.renderer.render(this.getRenderState(), performance.now());

      if (explodedBomb) {
        this.ended = true;
        this.selected = null;
        this.hintPair = null;
        this.activeBooster = null;
        sound.playBomb();
        sound.playDefeat();
        this.vfx.shake = 15;
        this.spawnRing(explodedBomb.r, explodedBomb.c, 3.2, '#ef4444');
        this.spawnBurst(explodedBomb.r, explodedBomb.c, '#ef4444', 28);
        this.spawnCenterBanner('BOM HẮC ÁM PHÁT NỔ!');
        await sleep(380);
        if (session !== this.sessionId) return;
        this.cb.onGameEnd?.({
          won: false,
          failReason: 'bomb',
          levelId: this.level.id,
          score: this.score,
          stars: 0,
          frogsCleared: this.collected[4] || 0
        });
        return;
      }
    }

    // 3. Kiểm tra Hết Lượt Đi
    if (this.movesLeft <= 0) {
      this.ended = true;
      this.selected = null;
      this.hintPair = null;
      this.activeBooster = null;
      sound.playDefeat();
      await sleep(320);
      if (session !== this.sessionId) return;
      this.cb.onGameEnd?.({
        won: false,
        failReason: 'moves',
        levelId: this.level.id,
        score: this.score,
        stars: 0,
        frogsCleared: this.collected[4] || 0
      });
      return;
    }

    // 4. Tự động thi triển Xoáy Thời Gian nếu bí nước đi (kể cả sau chuỗi nổ phát sinh)
    let shuffleGuard = 0;
    while (!this.findAnyValidMove(false) && shuffleGuard < 4) {
      shuffleGuard++;
      this.busy = true;
      if (shuffleGuard === 1) {
        this.cb.onToast?.('Hết nước đi — Bùa Xoáy Thời Gian tự động xáo bàn cờ!');
      }
      this.spawnCenterBanner('TỰ ĐỘNG XÁO BÀN!');
      sound.playSortingHat();
      await this.performShuffleAnimation(session);
      if (session !== this.sessionId) return;
      if (this.findMatchClusters().length > 0) {
        await this.resolveAllCascades(1, session);
        if (session !== this.sessionId) return;
      }
      this.busy = false;
      this.renderer.render(this.getRenderState(), performance.now());
      if (this.areAllObjectivesComplete()) {
        await this.finishVictorySequence(session);
        return;
      }
    }
    if (!this.findAnyValidMove(false)) {
      this.grantEmergencyMovePiece();
      this.renderer.render(this.getRenderState(), performance.now());
    }
  }

  async finishVictorySequence(session = this.sessionId) {
    this.ended = true;
    this.busy = true;
    this.selected = null;
    this.hintPair = null;
    this.activeBooster = null;

    if (this.movesLeft > 0) {
      this.spawnCenterBanner('BERTIE CRUSH!');
      const bonusMoves = this.movesLeft;
      const unlockedCells = [];
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          const p = this.grid[r][c];
          if (
            this.mask[r][c] === 1 &&
            !this.isCellLocked(r, c) &&
            !this.hasStaticBlocker(r, c) &&
            p &&
            this.isMatchablePiece(p) &&
            !p.special
          ) {
            unlockedCells.push({ r, c });
          }
        }
      }
      unlockedCells.sort(() => Math.random() - 0.5);
      const partyCount = Math.min(bonusMoves, unlockedCells.length, 8);
      for (let i = 0; i < partyCount; i++) {
        const cell = unlockedCells[i];
        const p = this.grid[cell.r][cell.c];
        if (p) {
          p.special = i % 4 === 0 ? 'seeker' : i % 3 === 0 ? 'wrapped' : i % 2 === 0 ? 'striped_h' : 'striped_v';
          p.scale = 1.25;
        }
      }
      this.addScore(bonusMoves * 450, Math.floor(this.size / 2), Math.floor(this.size / 2), '#fde047', true, 'special');
      this.movesLeft = 0;
      this.emitHudState();
      await sleep(300);
      if (session !== this.sessionId) return;

      const triggered = new Set();
      for (let i = 0; i < partyCount; i++) {
        const cell = unlockedCells[i];
        this.damageCell(cell.r, cell.c, triggered, true);
      }
      await sleep(280);
      if (session !== this.sessionId) return;
      await this.applyGravityAndRefill(session);
      if (session !== this.sessionId) return;
      await this.resolveAllCascades(1, session);
      if (session !== this.sessionId) return;
    }

    if (this.score < this.level.stars[0]) {
      this.score = this.level.stars[0];
    }
    this.emitHudState();
    this.renderer.render(this.getRenderState(), performance.now());
    sound.playVictory();
    await sleep(340);
    if (session !== this.sessionId) return;

    this.cb.onGameEnd?.({
      won: true,
      levelId: this.level.id,
      score: this.score,
      stars: Math.max(1, this.getEarnedStars()),
      frogsCleared: this.collected[4] || 0
    });
  }

  addScore(points, r, c, color = '#fde047', showPopup = true, category = 'normal') {
    let houseMult = 1;
    if (category === 'special' && this.house === 'gryffindor') houseMult = 1.15;
    else if (category === 'blocker' && this.house === 'slytherin') houseMult = 1.25;
    else if (category === 'match' && this.house === 'hufflepuff') houseMult = 1.12;

    const cardMult = 1 + (this.collectionBuffs.scoreBonusPct || 0) / 100;
    const finalPoints = Math.max(1, Math.round(points * houseMult * cardMult));

    this.score += finalPoints;
    if (showPopup && finalPoints >= 80) {
      this.spawnPopup(r, c, `+${finalPoints}`, color, finalPoints >= 500 ? 18 : 14);
    }
  }

  spawnBurst(r, c, color, count = 12) {
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const actualCount = isTouch ? Math.min(8, count) : count;
    const maxParticles = isTouch ? 45 : 80;
    if (this.vfx.particles.length > maxParticles) {
      this.vfx.particles.splice(0, this.vfx.particles.length - maxParticles + actualCount);
    }
    const center = this.renderer.cellCenter(r, c);
    for (let i = 0; i < actualCount; i++) {
      const angle = (Math.PI * 2 * i) / actualCount + Math.random() * 0.5;
      const speed = 40 + Math.random() * 115;
      this.vfx.particles.push({
        x: center.x,
        y: center.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 15,
        size: 2.2 + Math.random() * 3.2,
        color,
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.55
      });
    }
  }

  spawnRing(r, c, maxRadiusCells = 1.8, color = '#fde047') {
    this.vfx.rings.push({ r, c, maxRadiusCells, color, life: 0.34, maxLife: 0.34 });
  }

  spawnArc(r1, c1, r2, c2, color = '#fde047') {
    this.vfx.arcs.push({ r1, c1, r2, c2, color, life: 0.28, maxLife: 0.28 });
  }

  spawnPopup(r, c, text, color = '#fde047', size = 15) {
    const center = this.renderer.cellCenter(r, c);
    this.vfx.popups.push({
      x: center.x,
      y: center.y,
      vy: -38,
      text,
      color,
      size,
      life: 0.85,
      maxLife: 0.85
    });
  }

  spawnCenterBanner(text) {
    const mid = (this.size - 1) / 2;
    this.spawnPopup(mid, mid, text, '#fef08a', 21);
  }

  emitHudState() {
    if (!this.level) return;
    const turnsUntilHex =
      this.bossConfig && !this.bossDefeated && this.bossHp > 0
        ? this.bossConfig.castInterval - (this.movesUsed % this.bossConfig.castInterval)
        : 0;
    this.cb.onStateChange?.({
      level: this.level,
      score: this.score,
      movesLeft: this.movesLeft,
      starsEarned: this.getEarnedStars(),
      objectives: this.getObjectivesProgress(),
      activeBooster: this.activeBooster,
      patronusCharge: Math.min(100, Math.floor(this.patronusCharge)),
      house: this.house,
      bossState: this.bossConfig
        ? {
            ...this.bossConfig,
            hp: this.bossHp,
            maxHp: this.bossMaxHp,
            defeated: this.bossDefeated,
            turnsUntilHex
          }
        : null
    });
  }

  update(dt, now) {
    if (this.vfx.shake > 0) {
      this.vfx.shake = Math.max(0, this.vfx.shake - dt * 28);
    }

    for (let i = this.vfx.particles.length - 1; i >= 0; i--) {
      const pt = this.vfx.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 180 * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.vfx.particles.splice(i, 1);
    }

    for (const list of [this.vfx.beams, this.vfx.seekers, this.vfx.arcs, this.vfx.rings]) {
      for (let i = list.length - 1; i >= 0; i--) {
        list[i].life -= dt;
        if (list[i].life <= 0) list.splice(i, 1);
      }
    }
    for (let i = this.vfx.popups.length - 1; i >= 0; i--) {
      const pop = this.vfx.popups[i];
      pop.y += pop.vy * dt;
      pop.life -= dt;
      if (pop.life <= 0) this.vfx.popups.splice(i, 1);
    }

    const hintDelayMs = this.house === 'ravenclaw' ? 2600 : 4800;
    if (!this.busy && !this.ended && !this.hintPair && now - this.lastActionAt > hintDelayMs) {
      this.hintPair = this.findAnyValidMove();
    }
  }
}
