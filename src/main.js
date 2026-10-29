// Điều phối toàn bộ Game Candy Crush Hogwarts (7 Năm Học Phép Thuật: 77 Chương, 7.777 Màn Chơi)

import {
  BOOSTERS,
  CHOCOLATE_FROG_CARDS,
  DAILY_WHEEL_SEGMENTS,
  FROG_CARD_LOCKED_SVG,
  HOGWARTS_SEASONS,
  HOUSES,
  MAX_TOTAL_STARS,
  OBSTACLE_ICONS,
  PREGAME_BOOSTERS,
  TILE_TYPES,
  TOTAL_CHAPTERS,
  TOTAL_LEVELS,
  TOTAL_SEASONS,
  getChapterStarChests,
  getSeasonByLevel
} from './data/lore.js';
import {
  getChapterForLevel,
  getDifficultyBadgeMeta,
  getLevelById,
  getLevelMeta,
  getSeasonChapters
} from './data/levels.js';
import { Match3Engine } from './engine/match3Engine.js';
import { sound } from './engine/sound.js';
import { MAX_HEARTS, getGlobalChapterBounds, storage } from './services/storageService.js';
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
let activeSeasonId = 1;
let activeChapterInSeason = 1;

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

// ==================== TOPBAR, TIM PHÉP THUẬT, BẤT TỬ TIM, ĐŨA PHÉP & ÂM THANH ====================
function syncSeasonSelectOptions(player = storage.getActivePlayer()) {
  const selectEl = document.getElementById('season-select');
  if (!selectEl) return;
  Array.from(selectEl.options).forEach((opt) => {
    const sId = Number(opt.value);
    const sMeta = HOGWARTS_SEASONS[sId - 1];
    if (!sMeta) return;
    const unlocked = storage.isSeasonUnlocked(sId, player);
    const rangeStr = `${sMeta.range[0].toLocaleString('vi-VN')}–${sMeta.range[1].toLocaleString('vi-VN')}`;
    opt.textContent = `${unlocked ? '' : '🔒 '}${sMeta.yearLabel}: ${sMeta.title} (${rangeStr})`;
  });
  selectEl.value = String(activeSeasonId);
}

function refreshTopbar() {
  const player = storage.getActivePlayer();
  const house = HOUSES[player?.house] || HOUSES.gryffindor;
  const stats = player ? storage.getPlayerStats(player) : { stars: 0 };
  const heartState = storage.syncHearts(player);
  const buffs = storage.getCollectionBuffs(player);

  document.getElementById('hud-house-crest').innerHTML = house.emblemSvg;
  document.getElementById('hud-wizard-name').textContent = player ? player.name : 'Phù Thủy Mới';
  document.getElementById('hud-house-name').textContent = `${house.name} • 🪄 Bậc ${buffs.wandRank}`;
  document.getElementById('hud-galleons').textContent = String(player ? player.galleons : 250);
  document.getElementById('hud-total-stars').textContent = `${stats.stars.toLocaleString('vi-VN')}/${MAX_TOTAL_STARS.toLocaleString('vi-VN')}`;

  const heartChip = document.getElementById('btn-hearts-chip');
  const heartGlyph = document.getElementById('hud-heart-glyph');
  const timerEl = document.getElementById('hud-heart-timer');

  if (heartState.isInfinite) {
    heartChip?.classList.add('is-infinite');
    if (heartGlyph) heartGlyph.textContent = '❤️‍🔥';
    document.getElementById('hud-hearts').textContent = '∞';
    timerEl.hidden = false;
    timerEl.textContent = formatTimerSec(heartState.infiniteRemainingSec);
  } else {
    heartChip?.classList.remove('is-infinite');
    if (heartGlyph) heartGlyph.textContent = '❤️';
    document.getElementById('hud-hearts').textContent = `${heartState.hearts}/${MAX_HEARTS}`;
    if (heartState.hearts < MAX_HEARTS && heartState.nextInSec > 0) {
      timerEl.hidden = false;
      timerEl.textContent = formatTimerSec(heartState.nextInSec);
    } else {
      timerEl.hidden = true;
    }
  }

  document.getElementById('hud-streak').textContent = `×${player?.winStreak || 0}`;
  document.getElementById('sound-icon').textContent = sound.muted ? '🔇' : '🔊';
  document.getElementById('bgm-icon').textContent = sound.bgmMuted ? '🔕' : '🎵';
  document.getElementById('btn-toggle-bgm').setAttribute('aria-pressed', String(!sound.bgmMuted));
  document.getElementById('btn-toggle-sound').setAttribute('aria-pressed', String(!sound.muted));
  document.getElementById('wheel-free-dot').hidden = !storage.canFreeSpinToday(player);

  const curLvl = storage.getHighestUnlockedLevel(player);
  const previewOn = Boolean(player?.unlockAllPreview);
  const albumRatioText = `${buffs.uniqueCount}/${buffs.totalCards}`;
  document.getElementById('lbl-current-level').textContent = String(curLvl);
  document.getElementById('lbl-preview-state').textContent = previewOn ? 'Bật' : 'Tắt';
  document.getElementById('btn-toggle-preview').setAttribute('aria-pressed', String(previewOn));
  const hudAlbumEl = document.getElementById('hud-album-count');
  if (hudAlbumEl) hudAlbumEl.textContent = albumRatioText;
  const mapAlbumEl = document.getElementById('lbl-map-album');
  if (mapAlbumEl) mapAlbumEl.textContent = albumRatioText;

  syncSeasonSelectOptions(player);
}

setInterval(() => {
  const p = storage.getActivePlayer();
  if (p && (p.hearts < MAX_HEARTS || (p.infiniteHeartsUntil || 0) > 0)) {
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
  if (hs.isInfinite) {
    showToast(`❤️‍🔥 Bất Tử Tim đang kích hoạt (còn ${formatTimerSec(hs.infiniteRemainingSec)})!`);
    return;
  }
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
    const inf = storage.isInfiniteHeartsActive();
    storage.loseHeartAndStreak();
    showToast(
      inf
        ? 'Đã rời màn sau khi đi nước — đặt lại Chuỗi Cốc Lửa (không tốn Tim nhờ Bất Tử Tim ❤️‍🔥).'
        : 'Đã rời màn sau khi đi nước — trừ 1 Tim & đặt lại Chuỗi Cốc Lửa.'
    );
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

// ==================== BẢN ĐỒ 7 NĂM HỌC HOGWARTS (77 CHƯƠNG / 7.777 MÀN) ====================
function canPlayLevel(levelId, player = storage.getActivePlayer()) {
  if (storage.isLevelUnlocked(levelId, player)) return true;
  // Màn Khảo Hạch O.W.L./N.E.W.T. đầu mỗi Năm 2..7 luôn mở để người chơi giỏi thi vượt năm!
  return HOGWARTS_SEASONS.some((s) => s.examLevelId === Number(levelId));
}

function syncMapFocusToLevel(levelId) {
  const ch = getChapterForLevel(levelId);
  activeSeasonId = ch.seasonId;
  activeChapterInSeason = ch.chapterIndexInSeason;
  syncSeasonSelectOptions();
}

function setActiveChapterTab(chapterInSeason) {
  activeChapterInSeason = Math.max(1, Math.min(11, Number(chapterInSeason) || 1));
  const container = document.getElementById('chapter-tabs');
  container.querySelectorAll('.chapter-tab').forEach((b) => {
    const isMatch = Number(b.dataset.chapterIdx) === activeChapterInSeason;
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
  const chapters = getSeasonChapters(activeSeasonId);
  const container = document.getElementById('chapter-tabs');
  container.setAttribute('aria-label', `Chọn Chương Năm ${activeSeasonId}`);
  container.innerHTML = chapters
    .map((ch) => {
      const isMatch = ch.chapterIndexInSeason === activeChapterInSeason;
      return `
        <button
          type="button"
          class="chapter-tab ${isMatch ? 'active' : ''}"
          data-chapter-idx="${ch.chapterIndexInSeason}"
          data-global-chapter="${ch.globalChapterId}"
          ${isMatch ? 'aria-current="true"' : ''}
        >
          Ch.${ch.chapterIndexInSeason} (${ch.range[0]}–${ch.range[1]})
        </button>
      `;
    })
    .join('');

  container.querySelectorAll('.chapter-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      sound.playSelect();
      setActiveChapterTab(Number(btn.dataset.chapterIdx));
      renderSeasonMap();
      const scroller = document.getElementById('map-scroll-container');
      if (scroller) scroller.scrollTop = 0;
    });
  });
}

function renderSeasonMap() {
  const player = storage.getActivePlayer();
  const house = HOUSES[player?.house] || HOUSES.gryffindor;
  const seasonMeta = HOGWARTS_SEASONS[activeSeasonId - 1] || HOGWARTS_SEASONS[0];
  const seasonUnlocked = storage.isSeasonUnlocked(seasonMeta.id, player);
  const seasonFrontier = storage.getSeasonFrontierLevel(seasonMeta.id, player);
  const chapters = getSeasonChapters(seasonMeta.id);
  const ch = chapters[activeChapterInSeason - 1] || chapters[0];
  const progress = player?.levelProgress || {};
  const listEl = document.getElementById('chapters-list');

  const trailPath4Rows =
    'M 50 50 L 450 50 C 492 50, 492 150, 450 150 L 50 150 C 8 150, 8 250, 50 250 L 450 250 C 492 250, 492 350, 450 350 L 50 350';
  const trailPath3Rows11 =
    'M 50 50 L 450 50 C 492 50, 492 150, 450 150 L 50 150 C 8 150, 8 250, 50 250';

  const levelIds = [];
  for (let id = ch.range[0]; id <= ch.range[1]; id++) {
    levelIds.push(id);
  }

  const stageBlocks = [];
  for (let startIdx = 0; startIdx < levelIds.length; startIdx += 20) {
    stageBlocks.push(levelIds.slice(startIdx, startIdx + 20));
  }

  const stagesHtml = stageBlocks
    .map((stageIds, stageIdx) => {
      const isShortStage = stageIds.length <= 15;
      const svgViewBox = isShortStage ? '0 0 500 300' : '0 0 500 400';
      const svgPathD = isShortStage ? trailPath3Rows11 : trailPath4Rows;
      // Chỉ gắn .saga-stage-deferred cho các chặng nằm khuất dưới đường cắt màn hình đầu (stageIdx >= 1)!
      const stageCls = [
        'saga-stage-block',
        stageIdx >= 1 ? 'saga-stage-deferred' : '',
        isShortStage ? 'saga-stage-short' : ''
      ]
        .filter(Boolean)
        .join(' ');

      const nodesHtml = stageIds
        .map((lvlId, idx) => {
          const meta = getLevelMeta(lvlId);
          const diffBadge = getDifficultyBadgeMeta(meta.difficultyTier);
          const p = progress[lvlId];
          const stars = p?.stars || 0;
          const isUnlocked = canPlayLevel(lvlId, player);
          const isCurrent =
            !player?.unlockAllPreview &&
            ((seasonUnlocked && lvlId === seasonFrontier) ||
              (!seasonUnlocked && seasonMeta.examLevelId === lvlId));
          const isCleared = stars > 0;

          // Đường mòn chữ S uốn lượn (hàng chẵn trái->phải, hàng lẻ phải->trái) giữ nguyên thứ tự DOM tăng dần cho phím Tab!
          const row = Math.floor(idx / 5);
          const col = row % 2 === 0 ? idx % 5 : 4 - (idx % 5);

          const classes = ['map-node-btn', diffBadge.cssClass];
          if (lvlId >= 1000) classes.push('digits-4');
          if (isUnlocked) classes.push('unlocked');
          if (isCleared) classes.push('cleared');
          if (isCurrent) classes.push('current');
          if (meta.isBoss) classes.push('boss');

          let topPin = '';
          if (isCurrent) {
            topPin = `<span class="node-avatar-pin" aria-hidden="true">${house.emblemSvg}</span>`;
          } else if (meta.isSeasonFinale) {
            topPin = '<span class="node-boss-crown" aria-hidden="true">👑</span>';
          } else if (meta.isBoss) {
            topPin = `<span class="node-boss-crown" aria-hidden="true">${meta.isChapterBoss ? '👑' : '⭐'}</span>`;
          } else if (meta.isExamTrial) {
            topPin = '<span class="node-boss-crown" aria-hidden="true">🎓</span>';
          } else if (meta.difficultyTier === 'nightmare') {
            topPin = '<span class="node-boss-crown" aria-hidden="true">💀</span>';
          } else if (meta.difficultyTier === 'hard') {
            topPin = '<span class="node-boss-crown" aria-hidden="true">🔮</span>';
          }

          const starsMarkup = [1, 2, 3]
            .map((s) => (stars >= s ? '<span class="lit">★</span>' : '<span>☆</span>'))
            .join('');
          const srState = !isUnlocked
            ? 'Chưa mở khoá'
            : isCleared
              ? `Đã đạt ${stars} trên 3 sao`
              : meta.isExamTrial && !seasonUnlocked
                ? 'Đang mở Khảo Hạch O.W.L. Vượt Năm'
                : 'Đang mở, chưa vượt';

          return `
            <button
              type="button"
              id="map-node-${lvlId}"
              class="${classes.join(' ')}"
              style="grid-row: ${row + 1}; grid-column: ${col + 1};"
              data-level-id="${lvlId}"
              ${isUnlocked ? '' : 'disabled'}
              title="Màn ${lvlId}: ${escapeHtml(meta.title)} (${escapeHtml(diffBadge.label)})"
            >
              ${topPin}
              <span class="node-num">${lvlId}</span>
              <span class="visually-hidden">: ${escapeHtml(meta.title)} (${escapeHtml(diffBadge.label)}) — ${srState}</span>
              <span class="node-stars" aria-hidden="true">${isUnlocked ? starsMarkup : '🔒'}</span>
            </button>
          `;
        })
        .join('');

      return `
        <div class="${stageCls}" data-stage-index="${stageIdx}">
          <div class="saga-stage-label">
            <span>CHẶNG ${stageIdx + 1}/${stageBlocks.length}</span>
            <span>MÀN ${stageIds[0]} – ${stageIds[stageIds.length - 1]}</span>
          </div>
          <div class="saga-trail-wrap">
            <svg class="saga-trail-svg" viewBox="${svgViewBox}" preserveAspectRatio="none" aria-hidden="true">
              <path d="${svgPathD}" stroke="rgba(45, 22, 4, 0.85)" stroke-width="16" stroke-linecap="round" fill="none" />
              <path d="${svgPathD}" stroke="${seasonMeta.accentColor}" stroke-width="5.5" stroke-dasharray="11 9" stroke-linecap="round" fill="none" opacity="0.82" />
            </svg>
            <div class="saga-nodes-grid ${isShortStage ? 'rows-3' : ''}">
              ${nodesHtml}
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  const chapterStars = storage.getChapterStars(ch.globalChapterId, player);
  const claimedMap = player?.claimedStarChests || {};
  const chapterChests = getChapterStarChests(ch.maxStars);
  const chestsHtml = chapterChests
    .map((chest) => {
      const key = `ch${ch.globalChapterId}_${chest.threshold}`;
      const isClaimed = Boolean(claimedMap[key]);
      const isClaimable = !isClaimed && chapterStars >= chest.threshold;
      const cls = isClaimed ? 'claimed' : isClaimable ? 'claimable' : 'locked';
      const icon = isClaimed ? '✓' : isClaimable ? '🎁' : '🔒';
      return `
        <button
          type="button"
          class="star-chest-btn ${cls}"
          data-chest-chapter="${ch.globalChapterId}"
          data-chest-threshold="${chest.threshold}"
          title="${escapeHtml(`${chest.tierName} (${chest.threshold} ★): ${chest.summary}`)}"
        >
          <span aria-hidden="true">${icon}</span>
          <span>${chest.threshold}★${chest.grantFrogCard ? ' 🃏' : ''}${isClaimed ? ' Đã mở' : ''}</span>
        </button>
      `;
    })
    .join('');

  const owlExamHtml =
    !seasonUnlocked && seasonMeta.examLevelId
      ? `
        <div class="owl-exam-banner">
          <div class="owl-exam-info">
            🎓 <strong>Thi Vượt Năm O.W.L./N.E.W.T.:</strong> Chinh phục ngay <strong>Màn ${seasonMeta.examLevelId}</strong> để đặc cách mở khoá toàn bộ <strong>${escapeHtml(seasonMeta.fullTitle)}</strong> mà không cần cày xong các năm trước!
          </div>
          <button
            type="button"
            class="candy-pill-btn btn-candy-green"
            id="btn-challenge-exam"
            data-exam-level="${seasonMeta.examLevelId}"
          >
            🎓 Thi Vượt Năm (Màn ${seasonMeta.examLevelId})
          </button>
        </div>
      `
      : '';

  const prevGlobalCh = ch.globalChapterId > 1 ? ch.globalChapterId - 1 : null;
  const nextGlobalCh = ch.globalChapterId < TOTAL_CHAPTERS ? ch.globalChapterId + 1 : null;

  listEl.innerHTML = `
    <section
      class="chapter-banner-card"
      id="chapter-sec-${ch.globalChapterId}"
      style="background: ${ch.themeBg}; border-color: ${ch.accentColor};"
    >
      <div class="chapter-head">
        <span class="chapter-kicker">${escapeHtml(seasonMeta.fullTitle.toUpperCase())} • CHƯƠNG ${ch.chapterIndexInSeason}/11 • MÀN ${ch.range[0]}–${ch.range[1]}</span>
        <h2>${escapeHtml(ch.title)}</h2>
        <p>${escapeHtml(ch.subtitle)}</p>
      </div>

      <div class="season-hero-strip">
        <div class="season-mechanic-line">
          <span class="season-mechanic-icon" aria-hidden="true">${seasonMeta.signatureIcon}</span>
          <div>
            <strong>Đặc trưng ${escapeHtml(seasonMeta.yearLabel)} — ${escapeHtml(seasonMeta.signatureName)}:</strong>
            ${escapeHtml(seasonMeta.signatureDesc)}
          </div>
        </div>
        ${owlExamHtml}
      </div>

      <div class="chapter-star-chests">
        <div class="chapter-chests-top">
          <span id="ch-stars-lbl-${ch.globalChapterId}">★ Sao Chương ${ch.chapterIndexInSeason} (${escapeHtml(seasonMeta.yearLabel)}): <strong>${chapterStars} / ${ch.maxStars} ★</strong></span>
          <span>Rương Sao Chương</span>
        </div>
        <progress
          class="candy-progress chapter-stars-progress"
          max="${ch.maxStars}"
          value="${Math.min(ch.maxStars, chapterStars)}"
          aria-labelledby="ch-stars-lbl-${ch.globalChapterId}"
        ></progress>
        <div class="chapter-chests-row">
          ${chestsHtml}
        </div>
      </div>

      ${stagesHtml}

      <div class="chapter-footer-nav">
        ${
          prevGlobalCh
            ? `<button type="button" class="candy-pill-btn btn-candy-blue" data-nav-global-ch="${prevGlobalCh}">← Chương trước</button>`
            : '<span></span>'
        }
        ${
          nextGlobalCh
            ? `<button type="button" class="candy-pill-btn btn-candy-pink" data-nav-global-ch="${nextGlobalCh}">Chương kế →</button>`
            : '<span></span>'
        }
      </div>
    </section>
  `;

  listEl.querySelectorAll('.map-node-btn:not(:disabled)').forEach((btn) => {
    btn.addEventListener('click', () => {
      sound.playSelect();
      openLevelBriefing(Number(btn.dataset.levelId));
    });
  });

  document.getElementById('btn-challenge-exam')?.addEventListener('click', (e) => {
    sound.playSelect();
    openLevelBriefing(Number(e.currentTarget.dataset.examLevel));
  });

  listEl.querySelectorAll('[data-nav-global-ch]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bounds = getGlobalChapterBounds(Number(btn.dataset.navGlobalCh));
      if (!bounds) return;
      sound.playSelect();
      activeSeasonId = bounds.seasonId;
      activeChapterInSeason = bounds.chapterIndexInSeason;
      syncSeasonSelectOptions();
      renderChapterTabs();
      renderSeasonMap();
      const scroller = document.getElementById('map-scroll-container');
      if (scroller) scroller.scrollTop = 0;
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
        ? ` • 🃏 ${res.droppedCard.card.name} (${res.droppedCard.isNew ? 'Thẻ Mới!' : `+${res.droppedCard.duplicateGalleons} G trùng`})`
        : '';
      showToast(`🎁 Đã mở ${res.chestMeta.tierName}: ${res.chestMeta.summary}${cardNote}`);
    });
  });
}

const appShell = document.querySelector('.app-shell');
const supportsHasSelector = typeof CSS !== 'undefined' && CSS.supports?.('selector(:has(*))');

function navigateToLevelOnMap(targetLevelId, openModalIfPlayable = false) {
  const clamped = Math.max(1, Math.min(TOTAL_LEVELS, Math.floor(Number(targetLevelId) || 1)));
  syncMapFocusToLevel(clamped);
  renderChapterTabs();
  renderSeasonMap();
  requestAnimationFrame(() => {
    const node = document.getElementById(`map-node-${clamped}`);
    node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  if (openModalIfPlayable) {
    if (canPlayLevel(clamped)) {
      openLevelBriefing(clamped);
    } else {
      const s = getSeasonByLevel(clamped);
      const examHint = s.examLevelId ? ` hoặc vượt Khảo Hạch O.W.L. Màn ${s.examLevelId}` : '';
      showToast(`🔒 Màn ${clamped} chưa mở khoá! Hãy vượt tuần tự${examHint} hoặc bật Mở Thử 7.777 Màn.`);
    }
  }
}

document.getElementById('season-select')?.addEventListener('change', (e) => {
  const nextSeason = Math.max(1, Math.min(TOTAL_SEASONS, Number(e.target.value) || 1));
  sound.playSelect();
  activeSeasonId = nextSeason;
  const p = storage.getActivePlayer();
  if (storage.isSeasonUnlocked(nextSeason, p) && !p?.unlockAllPreview) {
    const frontier = storage.getSeasonFrontierLevel(nextSeason, p);
    activeChapterInSeason = getChapterForLevel(frontier).chapterIndexInSeason;
  } else {
    activeChapterInSeason = 1;
  }
  renderChapterTabs();
  renderSeasonMap();
  const scroller = document.getElementById('map-scroll-container');
  if (scroller) scroller.scrollTop = 0;
});

document.getElementById('form-jump-level')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('jump-level-input');
  const raw = Number(input?.value);
  if (!Number.isFinite(raw) || raw < 1 || raw > TOTAL_LEVELS) {
    sound.playInvalid();
    showToast(`Hãy nhập số màn từ 1 đến ${TOTAL_LEVELS.toLocaleString('vi-VN')}!`);
    return;
  }
  sound.playSelect();
  navigateToLevelOnMap(Math.floor(raw), true);
});

document.getElementById('btn-jump-current').addEventListener('click', () => {
  sound.playSelect();
  const cur = storage.getHighestUnlockedLevel();
  navigateToLevelOnMap(cur, false);
});

document.getElementById('btn-toggle-preview').addEventListener('click', () => {
  if (!storage.getActivePlayer()) {
    openProfileModal(true);
    return;
  }
  const on = storage.toggleUnlockAllPreview();
  refreshTopbar();
  renderSeasonMap();
  showToast(
    on
      ? '🔓 Đã mở khoá xem thử toàn bộ 7 Năm Học (7.777 Màn)!'
      : 'Đã bật lại chế độ vượt ải tuần tự + Thi Vượt Năm O.W.L. chuẩn Hogwarts.'
  );
});

function switchToMapView(focusLevelId = null) {
  const focusId = focusLevelId || engine.level?.id || null;
  engine.stopLoop();
  viewGame.hidden = true;
  viewMap.hidden = false;
  if (!supportsHasSelector && appShell) appShell.classList.remove('is-playing');
  if (focusId) {
    syncMapFocusToLevel(focusId);
  }
  refreshTopbar();
  renderChapterTabs();
  renderSeasonMap();
}

// ==================== MỞ MÀN CHƠI + BÙA ĐẦU TRẬN & CỐC LỬA (BRIEFING) ====================
function getObjectiveVisual(obj) {
  if (obj.type === 'boss') {
    return { icon: OBSTACLE_ICONS.boss, name: obj.label || obj.bossName || 'Hạ Đại Trùm' };
  }
  if (obj.type === 'horcrux') {
    return { icon: OBSTACLE_ICONS.horcrux, name: 'Linh Giá' };
  }
  if (obj.type === 'dementor') {
    return { icon: OBSTACLE_ICONS.dementor, name: 'Giám Ngục' };
  }
  if (obj.type === 'decree') {
    return { icon: OBSTACLE_ICONS.decree, name: 'Bia Sắc Lệnh' };
  }
  if (obj.type === 'fiendfyre') {
    return { icon: OBSTACLE_ICONS.fiendfyre, name: 'Lửa Địa Ngục' };
  }
  if (obj.type === 'petrify') {
    return { icon: OBSTACLE_ICONS.petrify, name: 'Hoá Đá Tử Xà' };
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
  if (obj.type === 'fiendfyre') return 'Dập sạch';
  return `×${obj.target}`;
}

function formatArenaRemaining(obj) {
  if (obj.completed) return '✓ Đủ!';
  if (obj.type === 'boss') return `${obj.remaining.toLocaleString('vi-VN')} HP`;
  if (obj.type === 'score') return `Còn ${obj.remaining.toLocaleString('vi-VN')}`;
  return `Còn ${obj.remaining}`;
}

function gridHasPositive(grid) {
  return Array.isArray(grid) && grid.some((row) => Array.isArray(row) && row.some((v) => v > 0));
}

function openLevelBriefing(levelId) {
  const lvl = getLevelById(levelId);
  pendingBriefingLevelId = lvl.id;
  const player = storage.getActivePlayer();
  const house = HOUSES[player?.house] || HOUSES.gryffindor;
  const saved = player?.levelProgress?.[lvl.id];
  const streak = player?.winStreak || 0;
  const diffBadge = getDifficultyBadgeMeta(lvl.difficultyTier);

  document.getElementById('briefing-kicker').textContent =
    `NĂM ${lvl.seasonId} • CHƯƠNG ${lvl.chapterIndexInSeason}/11 • ${diffBadge.icon} ${diffBadge.label}`;
  document.getElementById('briefing-title').textContent = `Màn ${lvl.id}: ${lvl.title}`;

  const badges = [
    `<span class="chip diff-tier-chip ${diffBadge.cssClass}">${diffBadge.icon} ${escapeHtml(diffBadge.shortLabel)}</span>`,
    `<span class="chip">🍬 Khay ${lvl.size}×${lvl.size} (${lvl.numColors} màu)</span>`,
    `<span class="chip">🎯 ${lvl.moves} Lượt</span>`,
    `<span class="chip"><span class="coin-dot">G</span> +${lvl.rewardGalleons}</span>`
  ];
  if (lvl.bossConfig) badges.push(`<span class="chip">${lvl.bossConfig.emoji} ${escapeHtml(lvl.bossConfig.shortTitle)} (2 Pha)</span>`);
  if (gridHasPositive(lvl.horcruxGrid)) badges.push('<span class="chip">💀 Linh Giá (Khiên Hồn)</span>');
  if (gridHasPositive(lvl.fiendfyreGrid)) badges.push('<span class="chip">🔥 Lửa Fiendfyre</span>');
  if (gridHasPositive(lvl.decreeGrid)) badges.push('<span class="chip">📜 Bia Cấm Phép 3×3</span>');
  if (lvl.mazeConfig?.rows?.length > 0) badges.push('<span class="chip">🌪️ Gió Lốc Mê Cung</span>');
  if (gridHasPositive(lvl.dementorGrid)) badges.push('<span class="chip">👻 Giám Ngục Hút Nộ</span>');
  if (gridHasPositive(lvl.petrifyGrid)) badges.push('<span class="chip">🐍 Hoá Đá Tử Xà</span>');
  if (lvl.conveyorLoops?.length > 0) badges.push('<span class="chip">🔄 Băng Chuyền</span>');
  if (gridHasPositive(lvl.cauldronGrid)) badges.push('<span class="chip">🧪 Vạc Độc Dược</span>');
  if (gridHasPositive(lvl.lockGrid)) badges.push('<span class="chip">🗝️ Khoá Gringotts</span>');
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
          <span class="obj-icon" aria-hidden="true">${vis.icon}</span>
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
        <span class="prebooster-icon" aria-hidden="true">${pb.iconSvg}</span>
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
  const diffBadge = getDifficultyBadgeMeta(level.difficultyTier);
  const spikePrefix = level.difficultyTier && level.difficultyTier !== 'normal' ? `${diffBadge.icon} ` : '';
  document.getElementById('game-level-num').textContent =
    `${spikePrefix}NĂM ${level.seasonId} • CH.${level.chapterIndexInSeason} • MÀN ${level.id}`;
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
      const isEnragedLive = Boolean(bossState.enraged && !bossState.defeated);
      bossStrip.hidden = false;
      bossStrip.classList.toggle('defeated', Boolean(bossState.defeated));
      bossStrip.classList.toggle('enraged', isEnragedLive);
      document.getElementById('boss-hud-label').textContent =
        `${isEnragedLive ? '🔥' : bossState.emoji} ${bossState.shortTitle}`;
      const bossProg = document.getElementById('boss-hp-progress');
      bossProg.max = bossState.maxHp;
      bossProg.value = Math.max(0, bossState.hp);
      bossProg.classList.toggle('is-defeated', Boolean(bossState.defeated));
      bossProg.classList.toggle('is-enraged', isEnragedLive);
      document.getElementById('boss-hud-meta').textContent = bossState.defeated
        ? '✓ Hạ gục!'
        : `${bossState.hp.toLocaleString('vi-VN')} HP • Bùa ${bossState.turnsUntilHex}L`;
    } else {
      bossStrip.hidden = true;
      bossStrip.classList.remove('defeated', 'enraged');
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
          <span class="obj-icon" aria-hidden="true">${vis.icon}</span>
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
      levelId === TOTAL_LEVELS
        ? '🏆 PHÁ ĐẢO ĐẠI CHIẾN HOGWARTS 7.777!'
        : lvl.isSeasonFinale
          ? `🏆 TỐT NGHIỆP NĂM ${lvl.seasonId} HOGWARTS!`
          : reward.unlockedNewSeason
            ? `🎓 ĐỖ KHẢO HẠCH MỞ NĂM ${reward.unlockedNewSeason}!`
            : `BERTIE CRUSH! • MÀN ${levelId}`;
    document.getElementById('result-title').textContent =
      stars === 3 ? 'Hogwarts! Ngọt Ngào Thần Sầu!' : stars === 2 ? 'Honeydukes! Quá Xuất Sắc!' : 'Magical! Vượt Màn Thành Công!';

    const bonusBoosterMeta = reward.bonusBooster ? BOOSTERS.find((b) => b.id === reward.bonusBooster) : null;
    const droppedCardHtml = reward.droppedCard
      ? `
        <div class="dropped-card-showcase">
          ${reward.droppedCard.card.portraitSvg}
          <div>
            <strong>🃏 ${reward.droppedCard.isNew ? 'THẺ ẾCH MỚI:' : `THẺ ẾCH TRÙNG (+${reward.droppedCard.duplicateGalleons} G):`} ${escapeHtml(reward.droppedCard.card.name)} (${escapeHtml(reward.droppedCard.card.number)})</strong>
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
      ${reward.unlockedNewSeason ? `<div style="margin-top:0.35rem;color:#34d399;font-weight:900">🎓 Mở khoá chính thức ${escapeHtml(HOGWARTS_SEASONS[reward.unlockedNewSeason - 1].fullTitle)}!</div>` : ''}
      ${reward.bonusInfiniteMinutes > 0 ? `<div style="margin-top:0.3rem;color:#fde047">❤️‍🔥 Bất Tử Tim: +${reward.bonusInfiniteMinutes} phút!</div>` : ''}
      ${reward.wandRankUp ? `<div style="margin-top:0.3rem;color:#f9a8d4">🪄 Thăng Cấp Đũa Phép Bậc ${reward.wandRankUp.rank}: ${escapeHtml(reward.wandRankUp.title)}!</div>` : ''}
      ${bonusBoosterMeta ? `<div style="margin-top:0.3rem;color:#c084fc">🎁 Quà Trùm: +1 ${escapeHtml(bonusBoosterMeta.name)}!</div>` : ''}
      ${droppedCardHtml}
    `;

    const hasNext = levelId < TOTAL_LEVELS && canPlayLevel(levelId + 1);
    actionsEl.innerHTML = `
      ${hasNext ? `<button type="button" class="candy-cta-btn cta-pink" id="res-btn-next">▶ Sang Màn ${levelId + 1}</button>` : ''}
      ${reward.droppedCard || reward.wandRankUp ? `<button type="button" class="candy-cta-btn cta-green" id="res-btn-album">🃏 Mở Album &amp; Đũa Phép</button>` : `<button type="button" class="candy-cta-btn cta-green" id="res-btn-leaderboard">🏆 Xem BXH &amp; Cúp Nhà</button>`}
      <button type="button" class="candy-cta-btn cta-blue" id="res-btn-map">🗺️ Về Bản Đồ Năm ${lvl.seasonId}</button>
    `;

    openModal(resultDialog);

    document.getElementById('res-btn-next')?.addEventListener('click', async () => {
      await closeTopLayer(resultDialog);
      syncMapFocusToLevel(levelId + 1);
      launchLevel(levelId + 1);
    });
    document.getElementById('res-btn-album')?.addEventListener('click', async () => {
      await closeTopLayer(resultDialog);
      switchToMapView(levelId);
      openAlbumModal();
    });
    document.getElementById('res-btn-leaderboard')?.addEventListener('click', async () => {
      await closeTopLayer(resultDialog);
      switchToMapView(levelId);
      openLeaderboardModal();
    });
    document.getElementById('res-btn-map')?.addEventListener('click', async () => {
      await closeTopLayer(resultDialog);
      switchToMapView(hasNext ? levelId + 1 : levelId);
    });
  } else {
    const extraCount = player?.boosters?.extraMoves || 0;
    const extraPrice = storage.getDiscountedPrice(140, player);
    const isBombFail = failReason === 'bomb';
    const infHearts = storage.isInfiniteHeartsActive(player);
    const heartCostLabel = infHearts ? '(❤️‍🔥 Tim ∞)' : '(-1 ❤️)';
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
      <button type="button" class="candy-cta-btn cta-pink" id="res-btn-retry">🔄 Chơi Lại ${heartCostLabel}</button>
      <button type="button" class="candy-cta-btn cta-blue" id="res-btn-map-fail">🗺️ Về Bản Đồ ${heartCostLabel}</button>
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
        switchToMapView(levelId);
      }
    });

    document.getElementById('res-btn-map-fail')?.addEventListener('click', async () => {
      storage.loseHeartAndStreak();
      await closeTopLayer(resultDialog);
      switchToMapView(levelId);
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
        const frontier = storage.getHighestUnlockedLevel(switched);
        if (!viewGame.hidden) {
          switchToMapView(frontier);
        } else {
          syncMapFocusToLevel(frontier);
          renderChapterTabs();
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
  if (wasCreatingNew) {
    const frontier = storage.getHighestUnlockedLevel(saved);
    if (!viewGame.hidden) {
      switchToMapView(frontier);
    } else {
      syncMapFocusToLevel(frontier);
      renderChapterTabs();
      refreshTopbar();
      renderSeasonMap();
    }
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
    const frontier = storage.getHighestUnlockedLevel();
    if (!viewGame.hidden) {
      switchToMapView(frontier);
    } else {
      syncMapFocusToLevel(frontier);
      renderChapterTabs();
      refreshTopbar();
      renderSeasonMap();
    }
    renderLeaderboardContent();
    showToast(`Đã nạp thành công dữ liệu của ${res.count} Phù Thủy!`);
  } catch {
    sound.playInvalid();
    showToast('Không thể đọc file JSON sao lưu.');
  }
});

// ==================== TIỆM KẸO CÔNG TƯỚC MẬT, HƯỚNG DẪN & ALBUM 21 THẺ ẾCH ====================
function renderShopItems() {
  const player = storage.getActivePlayer();
  document.getElementById('shop-galleons').textContent = String(player ? player.galleons : 0);
  const inv = player?.boosters || {};
  const preInv = player?.preBoosters || {};
  const hs = storage.syncHearts(player);
  const heartPrice = storage.getDiscountedPrice(100, player);
  const infPrice = storage.getDiscountedPrice(160, player);

  const infiniteHeartRowHtml = `
    <div class="shop-row">
      <span class="booster-icon" style="font-size:1.75rem" aria-hidden="true">❤️‍🔥</span>
      <div class="shop-row-info">
        <strong>Bình Phúc Lạc Tim Bất Tử 30 Phút ${hs.isInfinite ? `(Đang còn ${formatTimerSec(hs.infiniteRemainingSec)})` : ''}</strong>
        <small>Không tốn Tim khi thử sức các Màn Khó, Ác Mộng, Thi Vượt Năm O.W.L. &amp; Đại Trùm 2 Pha (cộng dồn tối đa 24h)!</small>
      </div>
      <button type="button" class="candy-pill-btn btn-candy-green" id="btn-shop-infinite-hearts">
        ${infPrice} G
      </button>
    </div>
  `;

  const heartRowHtml = `
    <div class="shop-row">
      <span class="booster-icon" style="font-size:1.75rem" aria-hidden="true">❤️</span>
      <div class="shop-row-info">
        <strong>Nạp Đầy 5/5 Tim Phép Thuật (Đang có: ${hs.isInfinite ? '∞' : `${hs.hearts}/${MAX_HEARTS}`})</strong>
        <small>Hồi đầy 5 Tim ngay lập tức (hoặc nhận +3 Tim cứu trợ miễn phí từ Bà Pomfrey khi cạn sạch).</small>
      </div>
      <button type="button" class="candy-pill-btn btn-candy-pink" id="btn-shop-refill-hearts" ${hs.isInfinite || hs.hearts >= MAX_HEARTS ? 'disabled' : ''}>
        ${hs.isInfinite ? 'Tim ∞' : hs.hearts >= MAX_HEARTS ? 'Đầy' : `${heartPrice} G`}
      </button>
    </div>
  `;

  const preRowsHtml = PREGAME_BOOSTERS.map((pb) => {
    const price = storage.getDiscountedPrice(pb.price, player);
    return `
      <div class="shop-row">
        <span class="booster-icon" aria-hidden="true">${pb.iconSvg}</span>
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
        <span class="booster-icon" aria-hidden="true">${b.iconSvg}</span>
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
  container.innerHTML = infiniteHeartRowHtml + heartRowHtml + preRowsHtml + inGameRowsHtml;

  document.getElementById('btn-shop-infinite-hearts')?.addEventListener('click', () => {
    const res = storage.buyInfiniteHearts(30, 160);
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

function setGuideActiveTab(tab = 'shop', focusActiveTab = false) {
  const container = document.getElementById('guide-grid-container');
  const btnShop = document.getElementById('tab-guide-shop');
  const btnRules = document.getElementById('tab-guide-rules');
  if (!container) return;

  const isShop = tab === 'shop';
  container.dataset.activeTab = isShop ? 'shop' : 'rules';
  if (btnShop) {
    btnShop.classList.toggle('active', isShop);
    btnShop.setAttribute('aria-selected', isShop ? 'true' : 'false');
    btnShop.setAttribute('tabindex', isShop ? '0' : '-1');
    if (focusActiveTab && isShop) btnShop.focus();
  }
  if (btnRules) {
    btnRules.classList.toggle('active', !isShop);
    btnRules.setAttribute('aria-selected', !isShop ? 'true' : 'false');
    btnRules.setAttribute('tabindex', !isShop ? '0' : '-1');
    if (focusActiveTab && !isShop) btnRules.focus();
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

document.getElementById('guide-tabs')?.addEventListener('keydown', (e) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault();
  const container = document.getElementById('guide-grid-container');
  const cur = container?.dataset.activeTab === 'rules' ? 'rules' : 'shop';
  let next = cur === 'shop' ? 'rules' : 'shop';
  if (e.key === 'Home') next = 'shop';
  else if (e.key === 'End') next = 'rules';
  sound.playSelect();
  setGuideActiveTab(next, true);
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
  const stats = player ? storage.getPlayerStats(player) : { stars: 0 };
  const buffs = storage.getCollectionBuffs(player);
  const ownedMap = player?.frogCards || {};
  const frogsProgress = (player?.totalFrogsCleared || 0) % 40;

  const wandBanner = document.getElementById('wand-mastery-banner');
  if (wandBanner) {
    const nextHint = buffs.wandNextTier
      ? `Cần ${buffs.wandNextTier.minStars.toLocaleString('vi-VN')} ★ tới Bậc ${buffs.wandNextTier.rank} (${escapeHtml(buffs.wandNextTier.title)})`
      : 'Đã đạt cảnh giới Đũa Phép Cơm Nguội Tối Thượng!';
    wandBanner.innerHTML = `
      <div class="wand-mastery-top">
        <strong>🪄 Tinh Thông Đũa Phép Bậc ${buffs.wandRank}/7: ${escapeHtml(buffs.wandTitle)}</strong>
        <span>★ Đang có: ${stats.stars.toLocaleString('vi-VN')} ★</span>
      </div>
      <div class="wand-mastery-sub">
        Nội tại Đũa Phép: <strong>+${buffs.wandScoreBonusPct}% Điểm Kẹo</strong> • <strong>+${buffs.wandBossDamagePct}% Sát Thương Trùm</strong> — ${nextHint}
      </div>
    `;
  }

  document.getElementById('album-count-heading').textContent =
    `Đã sưu tầm: ${buffs.uniqueCount} / ${buffs.totalCards} Thẻ Danh Nhân`;
  document.getElementById('album-frog-counter').textContent =
    `🐸 Tích luỹ bắt Ếch: ${frogsProgress}/40 tới thẻ kế`;

  const progEl = document.getElementById('album-progress-bar');
  progEl.max = buffs.totalCards;
  progEl.value = buffs.uniqueCount;

  const activeBuffParts = [];
  if (buffs.scoreBonusPct > 0) activeBuffParts.push(`+${buffs.scoreBonusPct}% Điểm Kẹo`);
  if (buffs.bossDamageBonusPct > 0) activeBuffParts.push(`+${buffs.bossDamageBonusPct}% Sát Thương Trùm`);
  if (buffs.patronusBonusPct > 0) activeBuffParts.push(`+${buffs.patronusBonusPct}% Nạp Hộ Mệnh`);
  if (buffs.shopDiscountPct > 0) activeBuffParts.push(`-${buffs.shopDiscountPct}% Giá Tiệm`);
  if (buffs.bonusClearGalleons > 0) activeBuffParts.push(`+${buffs.bonusClearGalleons} G/màn thắng`);

  document.getElementById('album-buffs-summary').textContent =
    activeBuffParts.length > 0
      ? `✨ Tổng Cộng Hưởng (Thẻ Ếch + Đũa Phép): ${activeBuffParts.join(' • ')}`
      : 'Sưu tầm 21 Thẻ Ếch từ Màn Trùm, Rương Sao Chương cuối, mỗi 40 Ếch Sô-cô-la bắt được hoặc thắng 3★ lần đầu để cộng chỉ số vĩnh viễn!';

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
          <p class="frog-card-bio">${owned ? escapeHtml(card.lore) : 'Vượt Màn Trùm, mở Rương Sao Chương cuối, bắt đủ 40 Ếch Sô-cô-la hoặc thắng 3★ lần đầu để mở khoá!'}</p>
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
syncMapFocusToLevel(storage.getHighestUnlockedLevel());
renderChapterTabs();
refreshTopbar();
renderSeasonMap();
drawDailyWheelCanvas();

const urlParams = new URLSearchParams(window.location.search);
const rawDirectLevel = Number(urlParams.get('level'));
const directLevel = Number.isFinite(rawDirectLevel) ? Math.floor(rawDirectLevel) : NaN;

if (directLevel >= 1 && directLevel <= TOTAL_LEVELS) {
  if (!storage.getActivePlayer()) {
    storage.registerOrUpdateActivePlayer('Phù Thủy Kẹo Ngọt', 'gryffindor', true);
    refreshTopbar();
  }
  syncMapFocusToLevel(directLevel);
  renderChapterTabs();
  renderSeasonMap();
  if (canPlayLevel(directLevel)) {
    launchLevel(directLevel);
  } else {
    requestAnimationFrame(() => {
      document.getElementById(`map-node-${directLevel}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    const s = getSeasonByLevel(directLevel);
    const examHint = s.examLevelId ? ` hoặc vượt Khảo Hạch O.W.L. Màn ${s.examLevelId}` : '';
    showToast(`🔒 Màn ${directLevel} chưa mở khoá! Hãy vượt tuần tự${examHint} hoặc bật Mở Thử 7.777 Màn.`);
  }
} else if (!storage.getActivePlayer()) {
  openProfileModal(true, true);
}
