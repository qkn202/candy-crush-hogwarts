// Điều phối toàn bộ Game Candy Crush Hogwarts (Season 1: 100 Bản Đồ, Đầy Đủ Cơ Chế Candy Crush Saga Gốc)

import {
  BOOSTERS,
  CHAPTER_STAR_CHESTS,
  CHOCOLATE_FROG_CARDS,
  DAILY_WHEEL_SEGMENTS,
  FROG_CARD_LOCKED_SVG,
  HOUSES,
  OBSTACLE_ICONS,
  PREGAME_BOOSTERS,
  SEASON_1_CHAPTERS,
  TILE_TYPES
} from './data/lore.js';
import { getLevelById, SEASON_1_LEVELS } from './data/levels.js';
import { Match3Engine } from './engine/match3Engine.js';
import { sound } from './engine/sound.js';
import { MAX_HEARTS, storage } from './services/storageService.js';
import { closeTopLayer, initModernDialogs, openModal, setDialogLocked } from './ui/dialogs.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(msg) {
  const wrap = document.getElementById('toast-container');
  if (!wrap) return;

  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  wrap.appendChild(el);

  if ('popover' in HTMLElement.prototype) {
    try {
      wrap.hidePopover();
      wrap.showPopover();
    } catch {
      // Bỏ qua nếu trình duyệt không cho nâng lại trạng thái Popover
    }
  }

  // Khi hộp thoại <dialog> đang mở bằng showModal(), vùng nền bên ngoài mang trạng thái inert;
  // đồng bộ thông báo vào live-region bên trong dialog đang mở để trình đọc màn hình không bỏ sót!
  const openDialog = document.querySelector('dialog[open]');
  if (openDialog) {
    let modalLive = openDialog.querySelector('[data-modal-live]');
    if (!modalLive) {
      modalLive = document.createElement('div');
      modalLive.className = 'visually-hidden';
      modalLive.dataset.modalLive = 'true';
      modalLive.setAttribute('aria-live', 'polite');
      modalLive.setAttribute('aria-atomic', 'true');
      openDialog.appendChild(modalLive);
    }
    modalLive.textContent = '';
    requestAnimationFrame(() => {
      if (modalLive.isConnected) modalLive.textContent = msg;
    });
  }

  setTimeout(() => {
    el.remove();
    if (!wrap.children.length && 'popover' in HTMLElement.prototype) {
      try {
        wrap.hidePopover();
      } catch {
        // Bỏ qua nếu Popover đã đóng
      }
    }
  }, 2700);
}

function formatTimerSec(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

let selectedHouseInModal = 'gryffindor';
let creatingNewChallenger = false;
let pendingBriefingLevelId = 1;
let currentLeaderboardFilter = 'all';
let wheelSpinning = false;
let wheelRotationDeg = 0;
let hatSortingBusy = false;

const viewMap = document.getElementById('view-map');
const viewGame = document.getElementById('view-game');
const profileDialog = document.getElementById('profile-dialog');
const briefingDialog = document.getElementById('briefing-dialog');
const resultDialog = document.getElementById('result-dialog');
const leaderboardDialog = document.getElementById('leaderboard-dialog');
const guideDialog = document.getElementById('guide-dialog');
const wheelDialog = document.getElementById('wheel-dialog');
const albumDialog = document.getElementById('album-dialog');

initModernDialogs();

// Kích hoạt AudioContext & nhạc nền Celesta ngay cử chỉ chạm đầu tiên của người chơi
window.addEventListener(
  'pointerdown',
  () => {
    sound.ensureCtx();
  },
  { once: true, passive: true }
);

const canvas = document.getElementById('game-canvas');
const engine = new Match3Engine(canvas, {
  onStateChange: (hud) => renderGameHud(hud),
  onBoosterConsumed: (boosterId) => {
    const ok = storage.consumeBooster(boosterId);
    if (!ok) {
      openGuideAndShop();
      showToast('Hết trợ giúp này rồi! Ghé Tiệm Công Tước Mật để sắm thêm nhé.');
      return false;
    }
    refreshTopbar();
    return true;
  },
  onGameEnd: (outcome) => handleGameEnd(outcome),
  onToast: (msg) => showToast(msg)
});

// ==================== TOPBAR, TIM PHÉP THUẬT, CHUỖI THẮNG & ÂM THANH ====================
function refreshTopbar() {
  const player = storage.getActivePlayer();
  const house = HOUSES[player?.house] || HOUSES.gryffindor;
  const stats = player ? storage.getPlayerStats(player) : { stars: 0 };
  const heartState = storage.syncHearts(player);

  document.getElementById('hud-house-crest').innerHTML = house.emblemSvg;
  document.getElementById('hud-wizard-name').textContent = player ? player.name : 'Phù Thủy Mới';
  document.getElementById('hud-house-name').textContent = house.name;
  document.getElementById('hud-galleons').textContent = String(player ? player.galleons : 250);
  document.getElementById('hud-total-stars').textContent = `${stats.stars}/300`;
  document.getElementById('hud-hearts').textContent = `${heartState.hearts}/${MAX_HEARTS}`;

  const timerEl = document.getElementById('hud-heart-timer');
  if (heartState.hearts < MAX_HEARTS && heartState.nextInSec > 0) {
    timerEl.hidden = false;
    timerEl.textContent = formatTimerSec(heartState.nextInSec);
  } else {
    timerEl.hidden = true;
  }

  document.getElementById('hud-streak').textContent = `×${player?.winStreak || 0}`;
  document.getElementById('sound-icon').textContent = sound.muted ? '🔇' : '🔊';
  document.getElementById('bgm-icon').textContent = sound.bgmMuted ? '🔕' : '🎵';
  document.getElementById('btn-toggle-bgm').setAttribute('aria-pressed', String(!sound.bgmMuted));
  document.getElementById('btn-toggle-sound').setAttribute('aria-pressed', String(!sound.muted));
  document.getElementById('wheel-free-dot').hidden = !storage.canFreeSpinToday(player);

  const curLvl = storage.getHighestUnlockedLevel(player);
  const previewOn = Boolean(player?.unlockAllPreview);
  const buffs = storage.getCollectionBuffs(player);
  const albumRatioText = `${buffs.uniqueCount}/${buffs.totalCards}`;
  document.getElementById('lbl-current-level').textContent = String(curLvl);
  document.getElementById('lbl-preview-state').textContent = previewOn ? 'Bật' : 'Tắt';
  document.getElementById('btn-toggle-preview').setAttribute('aria-pressed', String(previewOn));
  const hudAlbumEl = document.getElementById('hud-album-count');
  if (hudAlbumEl) hudAlbumEl.textContent = albumRatioText;
  const mapAlbumEl = document.getElementById('lbl-map-album');
  if (mapAlbumEl) mapAlbumEl.textContent = albumRatioText;
}

setInterval(() => {
  const p = storage.getActivePlayer();
  if (p && p.hearts < MAX_HEARTS) {
    refreshTopbar();
  }
}, 1000);

document.getElementById('btn-hearts-chip').addEventListener('click', () => {
  const p = storage.getActivePlayer();
  if (!p) {
    openProfileModal(true, true);
    return;
  }
  const hs = storage.syncHearts(p);
  if (hs.hearts >= MAX_HEARTS) {
    showToast('❤️ Tim Phép Thuật đang đầy 5/5!');
    return;
  }
  const res = storage.refillHearts();
  if (res.ok) {
    sound.playColorBomb();
    refreshTopbar();
    showToast(res.msg);
  } else {
    sound.playInvalid();
    openGuideAndShop();
    showToast(res.reason);
  }
});

document.getElementById('btn-toggle-bgm').addEventListener('click', () => {
  const bgmMuted = sound.toggleBgm();
  document.getElementById('bgm-icon').textContent = bgmMuted ? '🔕' : '🎵';
  document.getElementById('btn-toggle-bgm').setAttribute('aria-pressed', String(!bgmMuted));
  showToast(bgmMuted ? 'Đã tắt nhạc nền Đêm Hogwarts' : 'Đã bật nhạc nền Celesta Đêm Hogwarts');
});

document.getElementById('btn-toggle-sound').addEventListener('click', () => {
  const muted = sound.toggleMute();
  document.getElementById('sound-icon').textContent = muted ? '🔇' : '🔊';
  document.getElementById('btn-toggle-sound').setAttribute('aria-pressed', String(!muted));
  showToast(muted ? 'Đã tắt hiệu ứng âm thanh & giọng khen' : 'Đã bật âm thanh kẹo nổ & giọng khen');
});

function penalizeAbandonedAttemptIfMoved() {
  if (!viewGame.hidden && engine.level && engine.movesUsed > 0 && !engine.ended) {
    storage.loseHeartAndStreak();
    showToast('Đã rời màn sau khi đi nước — trừ 1 Tim & đặt lại Chuỗi Cốc Lửa.');
  }
}

document.getElementById('btn-home-brand').addEventListener('click', () => {
  penalizeAbandonedAttemptIfMoved();
  switchToMapView();
});
document.getElementById('btn-back-map').addEventListener('click', () => {
  penalizeAbandonedAttemptIfMoved();
  switchToMapView();
});

// ==================== BẢN ĐỒ ĐƯỜNG MÒN UỐN LƯỢN S-CURVE SEASON 1 (100 MÀN) ====================
function setActiveChapterTab(chapterId) {
  const container = document.getElementById('chapter-tabs');
  container.querySelectorAll('.chapter-tab').forEach((b) => {
    const isMatch = String(b.dataset.chapterId) === String(chapterId);
    b.classList.toggle('active', isMatch);
    if (isMatch) {
      b.setAttribute('aria-current', 'true');
      b.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    } else {
      b.removeAttribute('aria-current');
    }
  });
}

function renderChapterTabs() {
  const container = document.getElementById('chapter-tabs');
  container.innerHTML = SEASON_1_CHAPTERS.map(
    (ch, idx) => `
      <button type="button" class="chapter-tab ${idx === 0 ? 'active' : ''}" data-chapter-id="${ch.id}" ${idx === 0 ? 'aria-current="true"' : ''}>
        Chương ${ch.id} (${ch.range[0]}–${ch.range[1]})
      </button>
    `
  ).join('');

  container.querySelectorAll('.chapter-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      setActiveChapterTab(btn.dataset.chapterId);
      const sec = document.getElementById(`chapter-sec-${btn.dataset.chapterId}`);
      sec?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

let mapScrollObserver = null;

function setupMapScrollObserver() {
  if (mapScrollObserver) {
    mapScrollObserver.disconnect();
    mapScrollObserver = null;
  }
  const scrollContainer = document.getElementById('map-scroll-container');
  if (!scrollContainer || !('IntersectionObserver' in window)) return;
  const sections = scrollContainer.querySelectorAll('.chapter-banner-card');
  if (!sections.length) return;

  mapScrollObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const match = entry.target.id?.match(/chapter-sec-(\d+)/);
          if (match) {
            setActiveChapterTab(match[1]);
          }
        }
      }
    },
    {
      root: scrollContainer,
      rootMargin: '-10% 0px -70% 0px',
      threshold: 0.05
    }
  );

  sections.forEach((s) => mapScrollObserver.observe(s));
}

function renderSeasonMap() {
  const player = storage.getActivePlayer();
  const house = HOUSES[player?.house] || HOUSES.gryffindor;
  const highestUnlocked = storage.getHighestUnlockedLevel(player);
  const progress = player?.levelProgress || {};
  const listEl = document.getElementById('chapters-list');

  const trailPathD =
    'M 50 50 L 450 50 C 492 50, 492 150, 450 150 L 50 150 C 8 150, 8 250, 50 250 L 450 250 C 492 250, 492 350, 450 350 L 50 350';

  listEl.innerHTML = SEASON_1_CHAPTERS.map((ch) => {
    const chapterLevels = SEASON_1_LEVELS.slice(ch.range[0] - 1, ch.range[1]);

    const nodesHtml = chapterLevels
      .map((lvl, idx) => {
        const p = progress[lvl.id];
        const stars = p?.stars || 0;
        const isUnlocked = lvl.id <= highestUnlocked;
        const isCurrent = !player?.unlockAllPreview && lvl.id === highestUnlocked;
        const isCleared = stars > 0;

        // Bố cục đường mòn chữ S uốn lượn chuẩn Candy Crush (hàng chẵn trái->phải, hàng lẻ phải->trái)
        // trong khi vẫn giữ nguyên thứ tự DOM 1..20 để điều hướng phím Tab chuẩn trợ năng!
        const row = Math.floor(idx / 5);
        const col = row % 2 === 0 ? idx % 5 : 4 - (idx % 5);

        const classes = ['map-node-btn'];
        if (isUnlocked) classes.push('unlocked');
        if (isCleared) classes.push('cleared');
        if (isCurrent) classes.push('current');
        if (lvl.isBoss) classes.push('boss');

        const starsMarkup = [1, 2, 3]
          .map((s) => `<span class="${stars >= s ? 'lit' : ''}">★</span>`)
          .join('');
        const srState = !isUnlocked
          ? 'Chưa mở khoá'
          : isCleared
            ? `Đã đạt ${stars} trên 3 sao`
            : 'Đang mở, chưa vượt';

        return `
          <button
            type="button"
            id="map-node-${lvl.id}"
            class="${classes.join(' ')}"
            style="grid-row: ${row + 1}; grid-column: ${col + 1};"
            data-level-id="${lvl.id}"
            ${isUnlocked ? '' : 'disabled'}
            title="Màn ${lvl.id}: ${escapeHtml(lvl.title)}"
          >
            ${isCurrent ? `<span class="node-avatar-pin" aria-hidden="true">${house.emblemSvg}</span>` : ''}
            ${lvl.isBoss && !isCurrent ? `<span class="node-boss-crown" aria-hidden="true">${lvl.isChapterBoss ? '👑' : '⭐'}</span>` : ''}
            <span class="node-num">${lvl.id}</span>
            <span class="visually-hidden">: ${escapeHtml(lvl.title)}${lvl.isBoss ? ' (Màn Trùm)' : ''} — ${srState}</span>
            <span class="node-stars" aria-hidden="true">${isUnlocked ? starsMarkup : '🔒'}</span>
          </button>
        `;
      })
      .join('');

    const chapterStars = storage.getChapterStars(ch.id, player);
    const claimedMap = player?.claimedStarChests || {};
    const chestsHtml = CHAPTER_STAR_CHESTS.map((chest) => {
      const key = `ch${ch.id}_${chest.threshold}`;
      const isClaimed = Boolean(claimedMap[key]);
      const isClaimable = !isClaimed && chapterStars >= chest.threshold;
      const cls = isClaimed ? 'claimed' : isClaimable ? 'claimable' : 'locked';
      const icon = isClaimed ? '✓' : isClaimable ? '🎁' : '🔒';
      return `
        <button
          type="button"
          class="star-chest-btn ${cls}"
          data-chest-chapter="${ch.id}"
          data-chest-threshold="${chest.threshold}"
          title="${escapeHtml(`${chest.tierName} (${chest.threshold} ★): ${chest.summary}`)}"
        >
          <span aria-hidden="true">${icon}</span>
          <span>${chest.threshold}★${chest.grantFrogCard ? ' 🃏' : ''}${isClaimed ? ' Đã mở' : ''}</span>
        </button>
      `;
    }).join('');

    return `
      <section class="chapter-banner-card" id="chapter-sec-${ch.id}" style="background: ${ch.themeBg}; border-color: ${ch.borderColor};">
        <div class="chapter-head">
          <span class="chapter-kicker">SEASON 1 • MÀN ${ch.range[0]} – ${ch.range[1]}</span>
          <h2>${escapeHtml(ch.title)}</h2>
          <p>${escapeHtml(ch.subtitle)}</p>
        </div>
        <div class="chapter-star-chests">
          <div class="chapter-chests-top">
            <span id="ch-stars-lbl-${ch.id}">★ Sao Chương ${ch.id}: <strong>${chapterStars} / 60 ★</strong></span>
            <span>Rương Sao Chương</span>
          </div>
          <progress
            class="candy-progress chapter-stars-progress"
            max="60"
            value="${Math.min(60, chapterStars)}"
            aria-labelledby="ch-stars-lbl-${ch.id}"
          ></progress>
          <div class="chapter-chests-row">
            ${chestsHtml}
          </div>
        </div>
        <div class="saga-trail-wrap">
          <svg class="saga-trail-svg" viewBox="0 0 500 400" preserveAspectRatio="none" aria-hidden="true">
            <path d="${trailPathD}" stroke="rgba(45, 22, 4, 0.85)" stroke-width="16" stroke-linecap="round" fill="none" />
            <path d="${trailPathD}" stroke="#f59e0b" stroke-width="5.5" stroke-dasharray="11 9" stroke-linecap="round" fill="none" opacity="0.78" />
          </svg>
          <div class="saga-nodes-grid">
            ${nodesHtml}
          </div>
        </div>
      </section>
    `;
  }).join('');

  listEl.querySelectorAll('.map-node-btn:not(:disabled)').forEach((btn) => {
    btn.addEventListener('click', () => {
      sound.playSelect();
      openLevelBriefing(Number(btn.dataset.levelId));
    });
  });

  listEl.querySelectorAll('.star-chest-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!storage.getActivePlayer()) {
        openProfileModal(true, true);
        return;
      }
      const chId = Number(btn.dataset.chestChapter);
      const threshold = Number(btn.dataset.chestThreshold);
      const res = storage.claimChapterStarChest(chId, threshold);
      if (!res.ok) {
        sound.playSelect();
        showToast(res.reason);
        return;
      }
      sound.playColorBomb();
      refreshTopbar();
      renderSeasonMap();
      const cardNote = res.droppedCard
        ? ` • 🃏 ${res.droppedCard.card.name} (${res.droppedCard.isNew ? 'Thẻ Mới!' : '+25 G trùng'})`
        : '';
      showToast(`🎁 Đã mở ${res.chestMeta.tierName} Chương ${chId}: ${res.chestMeta.summary}${cardNote}`);
    });
  });

  setupMapScrollObserver();
}

const appShell = document.querySelector('.app-shell');
const supportsHasSelector = typeof CSS !== 'undefined' && CSS.supports?.('selector(:has(*))');

document.getElementById('btn-jump-current').addEventListener('click', () => {
  const cur = storage.getHighestUnlockedLevel();
  const chId = Math.ceil(cur / 20);
  setActiveChapterTab(chId);
  const node = document.getElementById(`map-node-${cur}`);
  node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

document.getElementById('btn-toggle-preview').addEventListener('click', () => {
  if (!storage.getActivePlayer()) {
    openProfileModal(true);
    return;
  }
  const on = storage.toggleUnlockAllPreview();
  refreshTopbar();
  renderSeasonMap();
  showToast(on ? 'Đã mở khoá xem thử toàn bộ 100 bản đồ Season 1!' : 'Đã bật lại chế độ vượt ải tuần tự chuẩn Candy Crush.');
});

function switchToMapView() {
  engine.stopLoop();
  viewGame.hidden = true;
  viewMap.hidden = false;
  if (!supportsHasSelector && appShell) appShell.classList.remove('is-playing');
  refreshTopbar();
  renderSeasonMap();
}

// ==================== MỞ MÀN CHƠI + BÙA ĐẦU TRẬN & CỐC LỬA (BRIEFING) ====================
function getObjectiveVisual(obj) {
  if (obj.type === 'boss') {
    return { icon: OBSTACLE_ICONS.boss, name: obj.bossName || 'Hạ Đại Trùm' };
  }
  if (obj.type === 'cauldron') {
    return { icon: OBSTACLE_ICONS.cauldron, name: 'Vạc Độc Dược' };
  }
  if (obj.type === 'key_lock') {
    return { icon: OBSTACLE_ICONS.key_lock, name: 'Khoá Gringotts' };
  }
  if (obj.type === 'jelly') {
    return { icon: OBSTACLE_ICONS.jelly, name: 'Thạch Hắc Ám' };
  }
  if (obj.type === 'ice') {
    return { icon: OBSTACLE_ICONS.ice, name: 'Băng Azkaban' };
  }
  if (obj.type === 'frosting') {
    return { icon: OBSTACLE_ICONS.frosting, name: 'Đá Cổ Ngữ' };
  }
  if (obj.type === 'chocolate') {
    return { icon: OBSTACLE_ICONS.chocolate, name: 'Sô-cô-la Lan' };
  }
  if (obj.type === 'ingredient') {
    return { icon: OBSTACLE_ICONS.ingredient, name: 'Đá Phù Thủy' };
  }
  if (obj.type === 'score') {
    return { icon: OBSTACLE_ICONS.score, name: 'Điểm Mục Tiêu' };
  }
  if (obj.type === 'special_order') {
    if (obj.specialKind === 'wrapped') return { icon: OBSTACLE_ICONS.special_wrapped, name: 'Nổ Kẹo Bọc' };
    if (obj.specialKind === 'color_bomb') return { icon: OBSTACLE_ICONS.special_color_bomb, name: 'Nổ Cầu Ngũ Sắc' };
    if (obj.specialKind === 'seeker') return { icon: OBSTACLE_ICONS.special_seeker, name: 'Phóng Tầm Thủ' };
    return { icon: OBSTACLE_ICONS.special_striped, name: 'Nổ Kẹo Sọc' };
  }
  const tile = TILE_TYPES[obj.tileId] || TILE_TYPES[0];
  return { icon: tile.svg, name: tile.shortName || tile.name };
}

function formatBriefingTarget(obj) {
  if (obj.type === 'boss') return `${obj.target.toLocaleString('vi-VN')} HP`;
  if (obj.type === 'score') return `${obj.target.toLocaleString('vi-VN')} đ`;
  if (obj.type === 'chocolate') return 'Diệt sạch';
  return `×${obj.target}`;
}

function formatArenaRemaining(obj) {
  if (obj.completed) return '✓ Đủ!';
  if (obj.type === 'boss') return `${obj.remaining.toLocaleString('vi-VN')} HP`;
  if (obj.type === 'score') return `Còn ${obj.remaining.toLocaleString('vi-VN')}`;
  return `Còn ${obj.remaining}`;
}

function openLevelBriefing(levelId) {
  const lvl = getLevelById(levelId);
  pendingBriefingLevelId = lvl.id;
  const player = storage.getActivePlayer();
  const house = HOUSES[player?.house] || HOUSES.gryffindor;
  const saved = player?.levelProgress?.[lvl.id];
  const streak = player?.winStreak || 0;

  document.getElementById('briefing-kicker').textContent = `CHƯƠNG ${lvl.chapterId} • MÀN ${lvl.id}${lvl.isBoss ? ' • ĐẠI TRÙM' : ''}`;
  document.getElementById('briefing-title').textContent = `Màn ${lvl.id}: ${lvl.title}`;

  const badges = [
    `<span class="chip">🍬 Khay ${lvl.size}×${lvl.size}</span>`,
    `<span class="chip">🎯 ${lvl.moves} Lượt</span>`,
    `<span class="chip"><span class="coin-dot">G</span> +${lvl.rewardGalleons}</span>`
  ];
  if (lvl.bossConfig) badges.push(`<span class="chip">${lvl.bossConfig.emoji} ${escapeHtml(lvl.bossConfig.shortTitle)}</span>`);
  if (lvl.conveyorLoops?.length > 0) badges.push('<span class="chip">🔄 Băng Chuyền</span>');
  if (lvl.objectives.some((o) => o.type === 'cauldron')) badges.push('<span class="chip">🧪 Vạc Độc Dược</span>');
  if (lvl.objectives.some((o) => o.type === 'key_lock')) badges.push('<span class="chip">🗝️ Khoá Gringotts</span>');
  if (lvl.portals?.length > 0) badges.push('<span class="chip">🌀 Lò Sưởi Floo</span>');
  if (lvl.bombConfig) badges.push('<span class="chip">💣 Có Bom Hẹn Giờ</span>');
  if (saved?.highScore) {
    badges.push(`<span class="chip"><span class="star-glyph">★</span> Kỷ lục: ${saved.highScore.toLocaleString('vi-VN')}</span>`);
  }
  document.getElementById('briefing-meta').innerHTML = badges.join('');

  const streakTexts = [
    `🔥 Cốc Lửa ×0 • ${house.patronusEmoji} ${house.name}: ${house.passiveTitle}`,
    `🔥 Cốc Lửa ×1 (+1 Sọc) • ${house.patronusEmoji} ${house.name}: ${house.passiveTitle}`,
    `🔥 Cốc Lửa ×2 (+Sọc +Bọc) • ${house.patronusEmoji} ${house.name}: ${house.passiveTitle}`,
    `🔥 Cốc Lửa ×3 TỐI ĐA (+Cầu +Bọc +Sọc) • ${house.patronusEmoji} ${house.passiveTitle}`
  ];
  document.getElementById('briefing-streak-banner').textContent = streakTexts[Math.min(3, streak)];

  document.getElementById('briefing-objectives').innerHTML = lvl.objectives
    .map((obj) => {
      const vis = getObjectiveVisual(obj);
      return `
        <div class="obj-pill">
          <span class="obj-icon">${vis.icon}</span>
          <div class="obj-info">
            <strong>${formatBriefingTarget(obj)}</strong>
            <small>${escapeHtml(vis.name)}</small>
          </div>
        </div>
      `;
    })
    .join('');

  const preInv = player?.preBoosters || {};
  const preContainer = document.getElementById('briefing-preboosters');
  preContainer.innerHTML = PREGAME_BOOSTERS.map((pb) => {
    const qty = preInv[pb.id] || 0;
    const price = storage.getDiscountedPrice(pb.price, player);
    return `
      <label class="prebooster-card" data-pre-id="${pb.id}" title="${escapeHtml(pb.desc)}">
        <input type="checkbox" class="prebooster-check" value="${pb.id}" />
        <span class="prebooster-icon">${pb.iconSvg}</span>
        <span class="prebooster-name">${escapeHtml(pb.shortName)}</span>
        <span class="prebooster-qty" data-pre-qty="${pb.id}">${qty > 0 ? `Có: ${qty}` : `${price} G`}</span>
      </label>
    `;
  }).join('');

  const supportsHas = typeof CSS !== 'undefined' && CSS.supports?.('selector(:has(*))');
  preContainer.querySelectorAll('.prebooster-check').forEach((chk) => {
    chk.addEventListener('change', () => {
      const card = chk.closest('.prebooster-card');
      const preId = chk.value;
      if (chk.checked) {
        const curQty = storage.getActivePlayer()?.preBoosters?.[preId] || 0;
        if (curQty <= 0) {
          const buy = storage.buyPreBooster(preId);
          if (!buy.ok) {
            chk.checked = false;
            if (!supportsHas && card) card.classList.remove('is-active');
            sound.playInvalid();
            showToast(buy.reason);
            return;
          }
          refreshTopbar();
          const newQty = storage.getActivePlayer()?.preBoosters?.[preId] || 0;
          const badgeEl = card?.querySelector('[data-pre-qty]');
          if (badgeEl) badgeEl.textContent = `Có: ${newQty}`;
          showToast('Đã sắm Bùa Đầu Trận bằng Vàng Galleon!');
        }
      }
      sound.playSelect();
      if (!supportsHas && card) {
        card.classList.toggle('is-active', chk.checked);
      }
    });
  });

  openModal(briefingDialog);
}

function ensureHeartBeforeLaunch() {
  const hs = storage.syncHearts();
  if (hs.hearts > 0) return true;
  const rescue = storage.refillHearts();
  if (rescue.ok) {
    refreshTopbar();
    showToast(rescue.msg);
    return true;
  }
  showToast(rescue.reason);
  return false;
}

document.getElementById('btn-start-level').addEventListener('click', async () => {
  if (!ensureHeartBeforeLaunch()) return;

  const selectedPre = [];
  briefingDialog.querySelectorAll('.prebooster-check:checked').forEach((chk) => {
    if (storage.consumePreBooster(chk.value)) {
      selectedPre.push(chk.value);
    }
  });
  refreshTopbar();
  await closeTopLayer(briefingDialog, 'start');
  launchLevel(pendingBriefingLevelId, selectedPre);
});

function launchLevel(levelId, preBoosters = []) {
  if (!ensureHeartBeforeLaunch()) return;
  const lvl = getLevelById(levelId);
  const player = storage.getActivePlayer();
  viewMap.hidden = true;
  viewGame.hidden = false;
  if (!supportsHasSelector && appShell) appShell.classList.add('is-playing');
  engine.loadLevel(lvl, {
    preBoosters,
    winStreak: player?.winStreak || 0,
    house: player?.house || 'gryffindor',
    collectionBuffs: storage.getCollectionBuffs(player)
  });
}

document.getElementById('btn-restart-level').addEventListener('click', () => {
  if (!engine.level) return;
  if (engine.movesUsed > 0 && !engine.ended) {
    storage.loseHeartAndStreak();
    refreshTopbar();
  }
  if (!ensureHeartBeforeLaunch()) {
    switchToMapView();
    return;
  }
  sound.playSelect();
  const player = storage.getActivePlayer();
  engine.loadLevel(engine.level, {
    preBoosters: [],
    winStreak: player?.winStreak || 0,
    house: player?.house || 'gryffindor',
    collectionBuffs: storage.getCollectionBuffs(player)
  });
  showToast(`Đã làm mới Màn ${engine.level.id}!`);
});

// ==================== GAME ARENA HUD, BOSS BAR, PATRONUS & BOOSTERS ====================
function renderGameHud({
  level,
  score,
  movesLeft,
  starsEarned,
  objectives,
  activeBooster,
  patronusCharge = 0,
  house = 'gryffindor',
  bossState = null
}) {
  document.getElementById('game-level-num').textContent = `CHƯƠNG ${level.chapterId} • MÀN ${level.id}`;
  document.getElementById('game-level-title').textContent = level.title;
  document.getElementById('game-moves-left').textContent = String(movesLeft);
  document.getElementById('game-score').textContent = score.toLocaleString('vi-VN');

  const maxStar = level.stars[2];
  const pct = Math.min(100, Math.round((score / maxStar) * 96));
  document.getElementById('game-star-fill').style.width = `${pct}%`;
  document.getElementById('star-mark-1').classList.toggle('earned', starsEarned >= 1);
  document.getElementById('star-mark-2').classList.toggle('earned', starsEarned >= 2);
  document.getElementById('star-mark-3').classList.toggle('earned', starsEarned >= 3);

  const bossStrip = document.getElementById('boss-hud-strip');
  if (bossStrip) {
    if (bossState) {
      bossStrip.hidden = false;
      bossStrip.classList.toggle('defeated', Boolean(bossState.defeated));
      document.getElementById('boss-hud-label').textContent = `${bossState.emoji} ${bossState.shortTitle}`;
      const bossProg = document.getElementById('boss-hp-progress');
      bossProg.max = bossState.maxHp;
      bossProg.value = Math.max(0, bossState.hp);
      bossProg.classList.toggle('is-defeated', Boolean(bossState.defeated));
      document.getElementById('boss-hud-meta').textContent = bossState.defeated
        ? '✓ Hạ gục!'
        : `${bossState.hp} HP • Bùa ${bossState.turnsUntilHex}L`;
    } else {
      bossStrip.hidden = true;
      bossStrip.classList.remove('defeated');
    }
  }

  const houseMeta = HOUSES[house] || HOUSES.gryffindor;
  const chargePct = Math.min(100, Math.max(0, Math.floor(patronusCharge)));
  const isPatronusReady = chargePct >= 100 && !engine.ended;
  const patronusBtn = document.getElementById('btn-cast-patronus');
  const patronusProg = document.getElementById('patronus-progress');
  if (patronusBtn && patronusProg) {
    document.getElementById('patronus-emoji').textContent = houseMeta.patronusEmoji;
    document.getElementById('patronus-label').textContent = isPatronusReady
      ? `⚡ Gọi ${houseMeta.patronusName}!`
      : `${houseMeta.patronusName} ${chargePct}%`;
    patronusBtn.disabled = !isPatronusReady;
    patronusBtn.classList.toggle('ready', isPatronusReady);
    patronusBtn.title = `${houseMeta.patronusEmoji} Thần Hộ Mệnh ${houseMeta.patronusName} (${houseMeta.name}): ${houseMeta.activeDesc} (Phím P)`;
    patronusProg.value = chargePct;
    patronusProg.classList.toggle('is-ready', isPatronusReady);
  }

  document.getElementById('game-objectives').innerHTML = objectives
    .map((obj) => {
      const vis = getObjectiveVisual(obj);
      return `
        <div class="obj-pill ${obj.completed ? 'done' : ''}">
          <span class="obj-icon">${vis.icon}</span>
          <div class="obj-info">
            <strong>${formatArenaRemaining(obj)}</strong>
            <small>${escapeHtml(vis.name)}</small>
          </div>
        </div>
      `;
    })
    .join('');

  const banner = document.getElementById('booster-active-banner');
  const bannerTxt = document.getElementById('booster-banner-text');
  if (activeBooster === 'hammer') {
    banner.hidden = false;
    bannerTxt.textContent = '🍭 Chạm vào 1 ô bất kỳ để đập vỡ Kẹo, Bom hoặc Đá/Sô-cô-la/Băng bằng Búa Đũa Phép!';
  } else if (activeBooster === 'swap') {
    banner.hidden = false;
    bannerTxt.textContent = '🪄 Kéo hoặc chạm 2 viên kẹo liền kề để vẫy Đũa Phép đổi chỗ tự do!';
  } else {
    banner.hidden = true;
  }

  renderBoostersDock(activeBooster);
}

document.getElementById('btn-cancel-booster').addEventListener('click', () => {
  engine.setBoosterMode(engine.activeBooster);
});

document.getElementById('btn-cast-patronus')?.addEventListener('click', () => {
  engine.castPatronus();
});

function renderBoostersDock(activeBooster = null) {
  const player = storage.getActivePlayer();
  const inv = player?.boosters || {};
  const listEl = document.getElementById('game-boosters-list');

  listEl.innerHTML = BOOSTERS.map((b) => {
    const qty = inv[b.id] || 0;
    const isActive = activeBooster === b.id;
    const isToggle = b.id === 'hammer' || b.id === 'swap';
    return `
      <button
        type="button"
        class="booster-btn ${isActive ? 'active' : ''}"
        data-booster-id="${b.id}"
        ${isToggle ? `aria-pressed="${isActive ? 'true' : 'false'}"` : ''}
        title="${escapeHtml(b.desc)}"
      >
        <span class="booster-icon" aria-hidden="true">${b.iconSvg}</span>
        <span class="booster-meta">
          <strong>${escapeHtml(b.shortName)}</strong>
          <small>${escapeHtml(b.name)}</small>
        </span>
        <span class="booster-count ${qty === 0 ? 'empty' : ''}">${qty > 0 ? qty : '+'}</span>
      </button>
    `;
  }).join('');

  listEl.querySelectorAll('.booster-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.boosterId;
      const qty = storage.getActivePlayer()?.boosters?.[id] || 0;
      if (qty <= 0) {
        openGuideAndShop();
        return;
      }
      sound.playSelect();
      engine.setBoosterMode(id);
    });
  });
}

// ==================== XỬ LÝ THẮNG / THUA MÀN CHƠI ====================
function handleGameEnd({ won, failReason, levelId, score, stars, frogsCleared = 0 }) {
  const player = storage.getActivePlayer();
  const house = HOUSES[player?.house] || HOUSES.gryffindor;
  const lvl = getLevelById(levelId);

  const starEls = resultDialog.querySelectorAll('.big-star');
  starEls.forEach((el, idx) => el.classList.toggle('earned', won && stars >= idx + 1));
  document
    .getElementById('result-stars')
    ?.setAttribute('aria-label', won ? `Đạt ${stars} trên 3 sao` : 'Chưa đạt sao nào');

  const summaryEl = document.getElementById('result-summary');
  const actionsEl = document.getElementById('result-actions');

  if (won) {
    const reward = storage.recordVictory(levelId, score, stars, lvl.rewardGalleons, frogsCleared);
    refreshTopbar();

    const housePts = Math.max(5, Math.round(score / 100) + stars * 2);
    document.getElementById('result-badge').textContent =
      levelId === 100 ? '🏆 PHÁ ĐẢO SEASON 1!' : `BERTIE CRUSH! • MÀN ${levelId}`;
    document.getElementById('result-title').textContent =
      stars === 3 ? 'Hogwarts! Ngọt Ngào Thần Sầu!' : stars === 2 ? 'Honeydukes! Quá Xuất Sắc!' : 'Magical! Vượt Màn Thành Công!';

    const bonusBoosterMeta = reward.bonusBooster ? BOOSTERS.find((b) => b.id === reward.bonusBooster) : null;
    const droppedCardHtml = reward.droppedCard
      ? `
        <div class="dropped-card-showcase">
          ${reward.droppedCard.card.portraitSvg}
          <div>
            <strong>🃏 ${reward.droppedCard.isNew ? 'THẺ ẾCH MỚI:' : 'THẺ ẾCH TRÙNG (+25 G):'} ${escapeHtml(reward.droppedCard.card.name)} (${escapeHtml(reward.droppedCard.card.number)})</strong>
            <small>${escapeHtml(reward.droppedCard.card.buffLabel)}</small>
          </div>
        </div>
      `
      : '';

    summaryEl.innerHTML = `
      <div>Điểm đạt được: <strong style="color:#fbbf24">${score.toLocaleString('vi-VN')}</strong></div>
      <div>Thưởng Vàng Galleon: <strong style="color:#fcd34d">+${reward.galleonsEarned} G</strong></div>
      <div>Chuỗi Thắng Cốc Lửa: <strong style="color:#fb923c">🔥 Bậc ×${reward.newStreak}/3</strong></div>
      <div>Góp vào Cúp Nhà <strong>${escapeHtml(house.name)}</strong>: <strong style="color:#34d399">+${housePts} Điểm</strong></div>
      ${bonusBoosterMeta ? `<div style="margin-top:0.35rem;color:#c084fc">🎁 Quà Trùm: +1 ${escapeHtml(bonusBoosterMeta.name)}!</div>` : ''}
      ${droppedCardHtml}
    `;

    const hasNext = levelId < 100;
    actionsEl.innerHTML = `
      ${hasNext ? `<button type="button" class="candy-cta-btn cta-pink" id="res-btn-next">▶ Sang Màn ${levelId + 1}</button>` : ''}
      ${reward.droppedCard ? `<button type="button" class="candy-cta-btn cta-green" id="res-btn-album">🃏 Mở Album Thẻ Ếch</button>` : `<button type="button" class="candy-cta-btn cta-green" id="res-btn-leaderboard">🏆 Xem BXH & Cúp Nhà</button>`}
      <button type="button" class="candy-cta-btn cta-blue" id="res-btn-map">🗺️ Về Bản Đồ Season 1</button>
    `;

    openModal(resultDialog);

    document.getElementById('res-btn-next')?.addEventListener('click', async () => {
      await closeTopLayer(resultDialog);
      launchLevel(levelId + 1);
    });
    document.getElementById('res-btn-album')?.addEventListener('click', async () => {
      await closeTopLayer(resultDialog);
      switchToMapView();
      openAlbumModal();
    });
    document.getElementById('res-btn-leaderboard')?.addEventListener('click', async () => {
      await closeTopLayer(resultDialog);
      switchToMapView();
      openLeaderboardModal();
    });
    document.getElementById('res-btn-map')?.addEventListener('click', async () => {
      await closeTopLayer(resultDialog);
      switchToMapView();
    });
  } else {
    const extraCount = player?.boosters?.extraMoves || 0;
    const extraPrice = storage.getDiscountedPrice(140, player);
    const isBombFail = failReason === 'bomb';
    document.getElementById('result-badge').textContent = isBombFail
      ? `MÀN ${levelId} • BOM PHÁT NỔ!`
      : `MÀN ${levelId} • HẾT LƯỢT`;
    document.getElementById('result-title').textContent = isBombFail
      ? 'Nguy Cấp! Bom Kẹo Hắc Ám Đã Nổ!'
      : 'Tiếc Quá! Hết Lượt Đi Rồi!';
    summaryEl.innerHTML = `
      <div>Bạn ghi được <strong style="color:#fbbf24">${score.toLocaleString('vi-VN')}</strong> điểm.</div>
      <div style="margin-top:0.35rem;color:#cbd5e1">
        Dùng <strong>+5 Lượt</strong> để ${isBombFail ? 'lùi ngòi nổ Bom +5 nhịp & ' : ''}giữ nguyên Chuỗi Cốc Lửa tiếp tục giải cứu bàn cờ nhé?
      </div>
    `;

    actionsEl.innerHTML = `
      <button type="button" class="candy-cta-btn cta-green" id="res-btn-continue">
        🍬 Tiếp Tục +5 Lượt ${extraCount > 0 ? `(Còn ${extraCount})` : `(${extraPrice} G)`}
      </button>
      <button type="button" class="candy-cta-btn cta-pink" id="res-btn-retry">🔄 Chơi Lại (-1 ❤️)</button>
      <button type="button" class="candy-cta-btn cta-blue" id="res-btn-map-fail">🗺️ Về Bản Đồ (-1 ❤️)</button>
    `;

    openModal(resultDialog);

    document.getElementById('res-btn-continue')?.addEventListener('click', async () => {
      if ((storage.getActivePlayer()?.boosters?.extraMoves || 0) <= 0) {
        const buy = storage.buyBooster('extraMoves');
        if (!buy.ok) {
          showToast(buy.reason);
          return;
        }
      }
      storage.consumeBooster('extraMoves');
      refreshTopbar();
      await closeTopLayer(resultDialog);
      engine.continueWithExtraMoves(5);
    });

    document.getElementById('res-btn-retry')?.addEventListener('click', async () => {
      storage.loseHeartAndStreak();
      refreshTopbar();
      await closeTopLayer(resultDialog);
      if (ensureHeartBeforeLaunch()) {
        openLevelBriefing(levelId);
      } else {
        switchToMapView();
      }
    });

    document.getElementById('res-btn-map-fail')?.addEventListener('click', async () => {
      storage.loseHeartAndStreak();
      await closeTopLayer(resultDialog);
      switchToMapView();
    });
  }
}

// ==================== VÒNG QUAY PHÉP THUẬT HÀNG NGÀY ====================
function drawDailyWheelCanvas() {
  const wheelCanvas = document.getElementById('wheel-canvas');
  if (!wheelCanvas) return;
  const ctx = wheelCanvas.getContext('2d');
  const w = wheelCanvas.width;
  const h = wheelCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const radius = w * 0.48;
  const count = DAILY_WHEEL_SEGMENTS.length;
  const sliceRad = (Math.PI * 2) / count;

  ctx.clearRect(0, 0, w, h);

  DAILY_WHEEL_SEGMENTS.forEach((seg, idx) => {
    // Đặt tâm ô 0 ở -90° (12 giờ) để góc xoay khớp chính xác với kim chỉ đỉnh
    const startAngle = idx * sliceRad - Math.PI / 2 - sliceRad / 2;
    const endAngle = startAngle + sliceRad;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle + sliceRad / 2);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = '800 13px "Fredoka", "Nunito", sans-serif';
    ctx.fillStyle = '#fefce8';
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 4;
    ctx.fillText(seg.label, radius - 14, 0);
    ctx.restore();
  });

  // Tâm vòng quay Hogwarts vàng rực
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.19, 0, Math.PI * 2);
  ctx.fillStyle = '#1e1b4b';
  ctx.fill();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#fde047';
  ctx.stroke();

  ctx.font = '900 16px "Fredoka", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fde047';
  ctx.fillText('★', cx, cy + 1);
}

function updateWheelDialogUi() {
  const free = storage.canFreeSpinToday();
  const spinBtn = document.getElementById('btn-spin-wheel');
  const statusEl = document.getElementById('wheel-status-text');
  spinBtn.disabled = wheelSpinning;
  spinBtn.textContent = free ? '🎡 Quay Miễn Phí Hôm Nay!' : '🎡 Quay Thêm Lượt Nữa (60 G)';
  statusEl.textContent = free
    ? 'Bạn đang có 1 lượt quay Công Tước Mật MIỄN PHÍ hôm nay!'
    : 'Đã nhận quà miễn phí hôm nay — có thể quay thêm với 60 Vàng Galleon!';
}

function openWheelModal() {
  if (!storage.getActivePlayer()) {
    openProfileModal(true, true);
    return;
  }
  drawDailyWheelCanvas();
  document.getElementById('wheel-prize-banner').hidden = true;
  updateWheelDialogUi();
  openModal(wheelDialog);
}

document.getElementById('btn-open-wheel').addEventListener('click', () => {
  sound.playSelect();
  openWheelModal();
});

document.getElementById('btn-spin-wheel').addEventListener('click', async () => {
  if (wheelSpinning) return;
  const player = storage.getActivePlayer();
  if (!player) return;

  const isFree = storage.canFreeSpinToday(player);
  if (!isFree && player.galleons < 60) {
    sound.playInvalid();
    showToast('Cần 60 Vàng Galleon để quay thêm lượt!');
    return;
  }

  const winIdx = Math.floor(Math.random() * DAILY_WHEEL_SEGMENTS.length);
  const seg = DAILY_WHEEL_SEGMENTS[winIdx];
  const res = storage.applyWheelSpin(seg, !isFree);
  if (!res.ok) {
    sound.playInvalid();
    showToast(res.reason);
    return;
  }

  wheelSpinning = true;
  setDialogLocked(wheelDialog, true);
  document.getElementById('wheel-prize-banner').hidden = true;
  updateWheelDialogUi();

  const sliceDeg = 360 / DAILY_WHEEL_SEGMENTS.length;
  const targetMod = (360 - winIdx * sliceDeg) % 360;
  const currentMod = ((wheelRotationDeg % 360) + 360) % 360;
  const delta = ((targetMod - currentMod) + 360) % 360;
  wheelRotationDeg += 360 * 5 + delta;

  const rotor = document.getElementById('wheel-rotor');
  rotor.style.transform = `rotate(${wheelRotationDeg}deg)`;

  const tickTimers = [];
  try {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion) {
      for (let i = 0; i < 10; i++) {
        tickTimers.push(setTimeout(() => sound.playWheelTick(), i * 240));
      }
      await new Promise((r) => setTimeout(r, 3150));
    } else {
      sound.playWheelTick();
      await new Promise((r) => setTimeout(r, 150));
    }
  } finally {
    tickTimers.forEach((tid) => clearTimeout(tid));
    wheelSpinning = false;
    setDialogLocked(wheelDialog, false);
  }

  sound.playColorBomb();
  const prizeBanner = document.getElementById('wheel-prize-banner');
  prizeBanner.hidden = false;
  prizeBanner.textContent = `🎉 Chúc mừng! Bạn nhận được: ${seg.fullName}`;
  refreshTopbar();
  if (!viewGame.hidden) renderBoostersDock(engine.activeBooster);
  updateWheelDialogUi();
});

// ==================== HỒ SƠ & PHÂN LOẠI NHÀ ====================
function renderHouseChoices() {
  const grid = document.getElementById('houses-selector-grid');
  grid.innerHTML = Object.values(HOUSES)
    .map(
      (h) => `
      <label class="house-option ${selectedHouseInModal === h.id ? 'selected' : ''}" data-house-id="${h.id}" title="${escapeHtml(`${h.passiveDesc} • Hộ Mệnh: ${h.activeDesc}`)}">
        <input type="radio" name="house" value="${h.id}" ${selectedHouseInModal === h.id ? 'checked' : ''} />
        <span class="house-option-crest">${h.emblemSvg}</span>
        <span class="house-option-info">
          <strong>${h.name} (${h.vnTitle})</strong>
          <small>${h.patronusEmoji} ${escapeHtml(h.patronusName)} • ${escapeHtml(h.passiveTitle)}</small>
        </span>
      </label>
    `
    )
    .join('');

  grid.querySelectorAll('input[name="house"]').forEach((input) => {
    input.addEventListener('change', () => {
      selectedHouseInModal = HOUSES[input.value] ? input.value : 'gryffindor';
      const chosen = HOUSES[selectedHouseInModal];
      document.getElementById('sorting-hat-quote').textContent = `${chosen.patronusEmoji} ${chosen.name}: ${chosen.passiveDesc}`;
      sound.playSelect();
      grid.querySelectorAll('.house-option').forEach((opt) => {
        opt.classList.toggle('selected', opt.dataset.houseId === selectedHouseInModal);
      });
    });
  });
}

function renderSavedPlayersSwitcher() {
  const players = storage.getAllRealPlayers();
  const active = storage.getActivePlayer();
  const sec = document.getElementById('player-switcher-section');
  if (players.length === 0) {
    sec.hidden = true;
    return;
  }
  sec.hidden = false;
  const list = document.getElementById('saved-players-list');

  const buttons = players.map((p) => {
    const h = HOUSES[p.house] || HOUSES.gryffindor;
    const isCurrent = active?.id === p.id && !creatingNewChallenger;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `candy-pill-btn ${isCurrent ? 'btn-candy-pink' : 'btn-candy-blue'}`;
    btn.dataset.switchId = p.id;
    btn.textContent = `${p.name} • ${h.name}`;
    btn.addEventListener('click', () => {
      creatingNewChallenger = false;
      const switched = storage.switchPlayer(p.id);
      if (switched) {
        document.getElementById('wizard-name-input').value = switched.name;
        selectedHouseInModal = HOUSES[switched.house] ? switched.house : 'gryffindor';
        renderHouseChoices();
        renderSavedPlayersSwitcher();
        if (!viewGame.hidden) {
          switchToMapView();
        } else {
          refreshTopbar();
          renderSeasonMap();
        }
        showToast(`Đã chuyển sang Phù Thủy ${switched.name}!`);
      }
    });
    return btn;
  });

  list.replaceChildren(...buttons);
}

function openProfileModal(forceInitial = false, startAsNew = false) {
  const active = storage.getActivePlayer();
  creatingNewChallenger = startAsNew || !active;
  setDialogLocked(profileDialog, forceInitial && !active);

  const input = document.getElementById('wizard-name-input');
  input.value = creatingNewChallenger ? '' : active.name;
  selectedHouseInModal =
    creatingNewChallenger || !HOUSES[active.house] ? 'gryffindor' : active.house;
  document.getElementById('sorting-hat-quote').textContent = HOUSES[selectedHouseInModal].quote;
  document.getElementById('btn-save-profile').textContent = creatingNewChallenger
    ? '▶ Nhập Học & Chơi Ngay!'
    : '💾 Cập Nhật Hồ Sơ';

  renderHouseChoices();
  renderSavedPlayersSwitcher();
  openModal(profileDialog);
}

document.getElementById('btn-open-profile').addEventListener('click', () => openProfileModal(false, false));

document.getElementById('btn-new-challenger').addEventListener('click', () => {
  creatingNewChallenger = true;
  document.getElementById('wizard-name-input').value = '';
  document.getElementById('wizard-name-input').focus();
  document.getElementById('btn-save-profile').textContent = '▶ Tạo Phù Thủy Mới!';
  renderSavedPlayersSwitcher();
});

document.getElementById('btn-random-hat').addEventListener('click', async () => {
  if (hatSortingBusy) return;
  hatSortingBusy = true;
  const hatBtn = document.getElementById('btn-random-hat');
  hatBtn.disabled = true;
  try {
    sound.playSortingHat();
    const keys = Object.keys(HOUSES);
    for (let i = 0; i < 7; i++) {
      selectedHouseInModal = keys[Math.floor(Math.random() * keys.length)];
      renderHouseChoices();
      await new Promise((r) => setTimeout(r, 75));
    }
    const chosen = HOUSES[selectedHouseInModal] || HOUSES.gryffindor;
    document.getElementById('sorting-hat-quote').textContent = `🎩 NÓN PHÂN LOẠI CHỌN: “${chosen.name.toUpperCase()}!” — ${chosen.quote}`;
  } finally {
    hatSortingBusy = false;
    hatBtn.disabled = false;
  }
});

document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const wasCreatingNew = creatingNewChallenger;
  const name = document.getElementById('wizard-name-input').value;
  const saved = storage.registerOrUpdateActivePlayer(name, selectedHouseInModal, creatingNewChallenger);
  creatingNewChallenger = false;
  setDialogLocked(profileDialog, false);

  sound.playSortingHat();
  if (wasCreatingNew && !viewGame.hidden) {
    switchToMapView();
  } else {
    refreshTopbar();
    renderSeasonMap();
  }
  await closeTopLayer(profileDialog, 'saved');
  const houseInfo = HOUSES[saved.house] || HOUSES.gryffindor;
  showToast(`Chào mừng ${saved.name} gia nhập Nhà ${houseInfo.name}!`);
});

// ==================== BẢNG XẾP HẠNG, CÚP 4 NHÀ & ĐỒNG BỘ SAVE JSON ====================
function renderLeaderboardContent() {
  const snap = storage.getLeaderboardSnapshot(currentLeaderboardFilter);
  const maxHousePts = Math.max(100, ...snap.houses.map((h) => h.points));

  document.getElementById('house-cup-grid').innerHTML = snap.houses
    .map((item, idx) => {
      const h = HOUSES[item.house] || HOUSES.gryffindor;
      const pct = Math.max(10, Math.round((item.points / maxHousePts) * 100));
      return `
        <div class="house-cup-card" style="background: ${h.gradient}">
          <div class="house-cup-top">
            <span class="house-cup-crest">${h.emblemSvg}</span>
            <div>
              <strong style="font-size:0.86rem">#${idx + 1} ${h.name}</strong>
              <div style="font-size:0.68rem;opacity:0.92">${item.members} thành viên • ${item.stars} ★</div>
            </div>
          </div>
          <div class="house-cup-points">${item.points.toLocaleString('vi-VN')} đ</div>
          <div class="hourglass-bar">
            <div class="hourglass-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
      `;
    })
    .join('');

  const npcBtn = document.getElementById('btn-lb-toggle-npc');
  npcBtn.textContent = `👥 Học viên mẫu: ${snap.includeSeededRivals ? 'Bật' : 'Tắt'}`;
  npcBtn.setAttribute('aria-pressed', String(Boolean(snap.includeSeededRivals)));

  const tbody = document.getElementById('lb-tbody');
  if (snap.players.length === 0) {
    const emptyTr = document.createElement('tr');
    const emptyTd = document.createElement('td');
    emptyTd.colSpan = 6;
    emptyTd.style.cssText = 'text-align:center;padding:1.4rem;color:var(--text-muted)';
    emptyTd.textContent = 'Chưa có người chơi nào ở mục này. Hãy vượt ải ghi điểm ngay!';
    emptyTr.appendChild(emptyTd);
    tbody.replaceChildren(emptyTr);
    return;
  }

  const rows = snap.players.map((p, idx) => {
    const rankBadge = idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`;
    const h = HOUSES[p.house] || HOUSES.gryffindor;

    const tr = document.createElement('tr');
    if (p.isCurrent) tr.className = 'me-row';

    const tdRank = document.createElement('td');
    tdRank.className = 'lb-rank-cell';
    const strongRank = document.createElement('strong');
    strongRank.textContent = rankBadge;
    tdRank.appendChild(strongRank);

    const thName = document.createElement('th');
    thName.scope = 'row';
    thName.className = 'lb-name-cell';
    const mobileRank = document.createElement('span');
    mobileRank.className = 'lb-mobile-rank';
    mobileRank.setAttribute('aria-hidden', 'true');
    mobileRank.textContent = rankBadge;
    const nameSpan = document.createElement('span');
    nameSpan.textContent = p.name;
    thName.append(mobileRank, nameSpan);

    if (p.isCurrent) {
      const meTag = document.createElement('span');
      meTag.style.cssText = 'color:#fbbf24;font-size:0.72rem';
      meTag.textContent = ' (Bạn)';
      thName.appendChild(meTag);
    }
    if (p.isNpc) {
      const npcTag = document.createElement('span');
      npcTag.style.cssText = 'color:#94a3b8;font-size:0.68rem';
      npcTag.textContent = ' • Mẫu';
      thName.appendChild(npcTag);
    }

    const tdHouse = document.createElement('td');
    tdHouse.style.color =
      h.secondary === '#422006'
        ? '#fbbf24'
        : h.primary === '#dc2626'
          ? '#f87171'
          : h.primary === '#059669'
            ? '#34d399'
            : '#38bdf8';
    const strongHouse = document.createElement('strong');
    strongHouse.textContent = h.name;
    tdHouse.appendChild(strongHouse);

    const tdLevel = document.createElement('td');
    tdLevel.textContent = `Màn ${Math.max(1, p.highestLevel)}`;

    const tdStars = document.createElement('td');
    const starSpan = document.createElement('span');
    starSpan.className = 'star-glyph';
    starSpan.setAttribute('aria-hidden', 'true');
    starSpan.textContent = '★';
    tdStars.append(starSpan, ` ${p.stars}`);

    const tdScore = document.createElement('td');
    const strongScore = document.createElement('strong');
    strongScore.style.color = '#fde047';
    strongScore.textContent = p.totalScore.toLocaleString('vi-VN');
    tdScore.appendChild(strongScore);

    tr.append(tdRank, thName, tdHouse, tdLevel, tdStars, tdScore);
    return tr;
  });

  tbody.replaceChildren(...rows);
}

function openLeaderboardModal() {
  renderLeaderboardContent();
  openModal(leaderboardDialog);
}

document.getElementById('btn-open-leaderboard').addEventListener('click', () => {
  sound.playSelect();
  openLeaderboardModal();
});

document.getElementById('lb-house-filters').querySelectorAll('.filter-pill').forEach((btn) => {
  btn.addEventListener('click', () => {
    document
      .getElementById('lb-house-filters')
      .querySelectorAll('.filter-pill')
      .forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    currentLeaderboardFilter = btn.dataset.house;
    renderLeaderboardContent();
  });
});

document.getElementById('btn-lb-toggle-npc').addEventListener('click', () => {
  storage.toggleSeededRivals();
  renderLeaderboardContent();
});

document.getElementById('btn-lb-new-player').addEventListener('click', async () => {
  await closeTopLayer(leaderboardDialog);
  openProfileModal(false, true);
});

document.getElementById('btn-lb-export').addEventListener('click', () => {
  const csv = storage.exportLeaderboardCSV();
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bxh-candy-hpvn-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Đã xuất file CSV Bảng Xếp Hạng!');
});

document.getElementById('btn-save-export-json').addEventListener('click', () => {
  const json = storage.exportSaveJSON();
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `save-candy-hogwarts-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Đã sao lưu toàn bộ Hồ sơ & Tiến độ ra file JSON!');
});

const saveImportInput = document.getElementById('save-import-file');
document.getElementById('btn-save-import-json').addEventListener('click', () => {
  saveImportInput.value = '';
  saveImportInput.click();
});

saveImportInput.addEventListener('change', async () => {
  const file = saveImportInput.files?.[0];
  if (!file) return;
  try {
    const raw = await file.text();
    const res = storage.importSaveJSON(raw);
    if (!res.ok) {
      sound.playInvalid();
      showToast(res.reason);
      return;
    }
    sound.playColorBomb();
    refreshTopbar();
    renderSeasonMap();
    renderLeaderboardContent();
    showToast(`Đã nạp thành công dữ liệu của ${res.count} Phù Thủy!`);
  } catch {
    sound.playInvalid();
    showToast('Không thể đọc file JSON sao lưu.');
  }
});

// ==================== TIỆM KẸO CÔNG TƯỚC MẬT, HƯỚNG DẪN & ALBUM THẺ ẾCH ====================
function renderShopItems() {
  const player = storage.getActivePlayer();
  document.getElementById('shop-galleons').textContent = String(player ? player.galleons : 0);
  const inv = player?.boosters || {};
  const preInv = player?.preBoosters || {};
  const hs = storage.syncHearts(player);
  const heartPrice = storage.getDiscountedPrice(100, player);

  const heartRowHtml = `
    <div class="shop-row">
      <span class="booster-icon" style="font-size:1.75rem">❤️</span>
      <div class="shop-row-info">
        <strong>Nạp Đầy 5/5 Tim Phép Thuật (Đang có: ${hs.hearts}/${MAX_HEARTS})</strong>
        <small>Hồi đầy 5 Tim ngay lập tức (hoặc nhận +3 Tim cứu trợ miễn phí từ Bà Pomfrey khi cạn sạch).</small>
      </div>
      <button type="button" class="candy-pill-btn btn-candy-pink" id="btn-shop-refill-hearts" ${hs.hearts >= MAX_HEARTS ? 'disabled' : ''}>
        ${hs.hearts >= MAX_HEARTS ? 'Đầy' : `${heartPrice} G`}
      </button>
    </div>
  `;

  const preRowsHtml = PREGAME_BOOSTERS.map((pb) => {
    const price = storage.getDiscountedPrice(pb.price, player);
    return `
      <div class="shop-row">
        <span class="booster-icon">${pb.iconSvg}</span>
        <div class="shop-row-info">
          <strong>[Đầu Trận] ${escapeHtml(pb.name)} (Có: ${preInv[pb.id] || 0})</strong>
          <small>${escapeHtml(pb.desc)}</small>
        </div>
        <button type="button" class="candy-pill-btn btn-candy-purple" data-buy-prebooster="${pb.id}">
          ${price} G
        </button>
      </div>
    `;
  }).join('');

  const inGameRowsHtml = BOOSTERS.map((b) => {
    const price = storage.getDiscountedPrice(b.price, player);
    return `
      <div class="shop-row">
        <span class="booster-icon">${b.iconSvg}</span>
        <div class="shop-row-info">
          <strong>${escapeHtml(b.name)} (Có: ${inv[b.id] || 0})</strong>
          <small>${escapeHtml(b.desc)}</small>
        </div>
        <button type="button" class="candy-pill-btn btn-candy-yellow" data-buy-booster="${b.id}">
          ${price} G
        </button>
      </div>
    `;
  }).join('');

  const container = document.getElementById('shop-items-list');
  container.innerHTML = heartRowHtml + preRowsHtml + inGameRowsHtml;

  document.getElementById('btn-shop-refill-hearts')?.addEventListener('click', () => {
    const res = storage.refillHearts();
    if (!res.ok) {
      sound.playInvalid();
      showToast(res.reason);
      return;
    }
    sound.playColorBomb();
    refreshTopbar();
    renderShopItems();
    showToast(res.msg);
  });

  container.querySelectorAll('[data-buy-prebooster]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.buyPrebooster;
      const res = storage.buyPreBooster(id);
      if (!res.ok) {
        sound.playInvalid();
        showToast(res.reason);
        return;
      }
      sound.playSelect();
      refreshTopbar();
      renderShopItems();
      showToast('Đã sắm Bùa Trợ Giúp Đầu Trận!');
    });
  });

  container.querySelectorAll('[data-buy-booster]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.buyBooster;
      const res = storage.buyBooster(id);
      if (!res.ok) {
        sound.playInvalid();
        showToast(res.reason);
        return;
      }
      sound.playSelect();
      refreshTopbar();
      renderShopItems();
      if (!viewGame.hidden) renderBoostersDock(engine.activeBooster);
      showToast('Đã mua Bảo Bối Công Tước Mật thành công!');
    });
  });
}

function setGuideActiveTab(tab = 'shop') {
  const container = document.getElementById('guide-grid-container');
  const btnShop = document.getElementById('tab-guide-shop');
  const btnRules = document.getElementById('tab-guide-rules');
  if (!container) return;

  const isShop = tab === 'shop';
  container.dataset.activeTab = isShop ? 'shop' : 'rules';
  if (btnShop) {
    btnShop.classList.toggle('active', isShop);
    btnShop.setAttribute('aria-selected', isShop ? 'true' : 'false');
  }
  if (btnRules) {
    btnRules.classList.toggle('active', !isShop);
    btnRules.setAttribute('aria-selected', !isShop ? 'true' : 'false');
  }
}

function openGuideAndShop(defaultTab = 'shop') {
  renderShopItems();
  setGuideActiveTab(defaultTab);
  openModal(guideDialog);
}

document.getElementById('tab-guide-shop')?.addEventListener('click', () => {
  sound.playSelect();
  setGuideActiveTab('shop');
});

document.getElementById('tab-guide-rules')?.addEventListener('click', () => {
  sound.playSelect();
  setGuideActiveTab('rules');
});

document.getElementById('btn-open-guide')?.addEventListener('click', () => {
  sound.playSelect();
  openGuideAndShop('shop');
});

document.getElementById('btn-open-shop')?.addEventListener('click', () => {
  sound.playSelect();
  openGuideAndShop('shop');
});

function renderAlbumModal() {
  const player = storage.getActivePlayer();
  const buffs = storage.getCollectionBuffs(player);
  const ownedMap = player?.frogCards || {};
  const frogsProgress = (player?.totalFrogsCleared || 0) % 40;

  document.getElementById('album-count-heading').textContent =
    `Đã sưu tầm: ${buffs.uniqueCount} / ${buffs.totalCards} Thẻ Danh Nhân`;
  document.getElementById('album-frog-counter').textContent =
    `🐸 Tích luỹ bắt Ếch: ${frogsProgress}/40 tới thẻ kế`;

  const progEl = document.getElementById('album-progress-bar');
  progEl.max = buffs.totalCards;
  progEl.value = buffs.uniqueCount;

  const activeBuffParts = [];
  if (buffs.scoreBonusPct > 0) activeBuffParts.push(`+${buffs.scoreBonusPct}% Điểm Kẹo`);
  if (buffs.patronusBonusPct > 0) activeBuffParts.push(`+${buffs.patronusBonusPct}% Nạp Hộ Mệnh`);
  if (buffs.shopDiscountPct > 0) activeBuffParts.push(`-${buffs.shopDiscountPct}% Giá Tiệm`);
  if (buffs.bonusClearGalleons > 0) activeBuffParts.push(`+${buffs.bonusClearGalleons} G/màn thắng`);

  document.getElementById('album-buffs-summary').textContent =
    activeBuffParts.length > 0
      ? `✨ Cộng hưởng Thẻ đang kích hoạt: ${activeBuffParts.join(' • ')}`
      : 'Sưu tầm Thẻ Ếch từ Màn Trùm (10..100), Rương 60★ Chương, mỗi 40 Ếch Sô-cô-la bắt được hoặc thắng 3★ lần đầu để cộng chỉ số vĩnh viễn!';

  document.getElementById('frog-cards-grid').innerHTML = CHOCOLATE_FROG_CARDS.map((card) => {
    const copies = ownedMap[card.id] || 0;
    const owned = copies > 0;
    return `
      <article class="frog-card ${owned ? 'owned' : 'locked'}">
        ${owned ? card.portraitSvg : FROG_CARD_LOCKED_SVG}
        <header>
          <div class="frog-card-badges">
            <span class="frog-card-num">${escapeHtml(card.number)}</span>
            <span class="frog-card-rarity">${escapeHtml(card.rarity)}${copies > 1 ? ` • ×${copies}` : ''}</span>
          </div>
          <h3>${owned ? escapeHtml(card.name) : 'Thẻ Bí Ẩn Chưa Mở'}</h3>
        </header>
        <div class="frog-card-content">
          <p class="frog-card-bio">${owned ? escapeHtml(card.lore) : 'Vượt Màn Trùm, mở Rương 60★ Chương, bắt đủ 40 Ếch Sô-cô-la hoặc thắng 3★ lần đầu để mở khoá!'}</p>
          <p class="frog-card-buff">${owned ? '✨ ' : '🔒 '}${escapeHtml(card.buffLabel)}</p>
        </div>
      </article>
    `;
  }).join('');
}

function openAlbumModal() {
  renderAlbumModal();
  openModal(albumDialog);
}

document.getElementById('btn-open-album')?.addEventListener('click', () => {
  sound.playSelect();
  openAlbumModal();
});

document.getElementById('btn-map-album')?.addEventListener('click', () => {
  sound.playSelect();
  openAlbumModal();
});

// ==================== KHỞI ĐỘNG ====================
renderChapterTabs();
refreshTopbar();
renderSeasonMap();
drawDailyWheelCanvas();

const urlParams = new URLSearchParams(window.location.search);
const directLevel = Number(urlParams.get('level'));

if (directLevel >= 1 && directLevel <= 100) {
  if (!storage.getActivePlayer()) {
    storage.registerOrUpdateActivePlayer('Phù Thủy Kẹo Ngọt', 'gryffindor', true);
    refreshTopbar();
  }
  launchLevel(directLevel);
} else if (!storage.getActivePlayer()) {
  openProfileModal(true, true);
}
