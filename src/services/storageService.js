// Quản lý Hồ sơ Phù Thủy, Tiến độ 100 Bản Đồ Season 1, 5 Tim Phép Thuật, Chuỗi Thắng Cốc Lửa,
// Bộ Sưu Tập 12 Thẻ Ếch Sô-cô-la, Rương Sao Chương, Vòng Quay Hàng Ngày & Bảng Xếp Hạng Cúp 4 Nhà

import {
  BOOSTERS,
  CHAPTER_STAR_CHESTS,
  CHOCOLATE_FROG_CARDS,
  PREGAME_BOOSTERS,
  SEASON_1_CHAPTERS
} from '../data/lore.js';

const STORAGE_KEY = 'hpvn_season1_state_v1';
export const MAX_HEARTS = 5;
export const HEART_REGEN_MS = 15 * 60 * 1000; // 15 phút hồi 1 Tim

const SEEDED_RIVALS = [
  { id: 'npc_1', name: 'Minh Khôi Potter', house: 'gryffindor', totalScore: 98400, stars: 48, highestLevel: 19, isNpc: true },
  { id: 'npc_2', name: 'Bảo Ngọc Granger', house: 'ravenclaw', totalScore: 104200, stars: 53, highestLevel: 21, isNpc: true },
  { id: 'npc_3', name: 'Hoàng Long Malfoy', house: 'slytherin', totalScore: 96800, stars: 45, highestLevel: 18, isNpc: true },
  { id: 'npc_4', name: 'Thanh Thảo Diggory', house: 'hufflepuff', totalScore: 91500, stars: 44, highestLevel: 17, isNpc: true },
  { id: 'npc_5', name: 'Gia Huy Weasley', house: 'gryffindor', totalScore: 64300, stars: 31, highestLevel: 12, isNpc: true },
  { id: 'npc_6', name: 'Khánh Linh Lovegood', house: 'ravenclaw', totalScore: 71900, stars: 35, highestLevel: 14, isNpc: true },
  { id: 'npc_7', name: 'Đức Anh Zabini', house: 'slytherin', totalScore: 68500, stars: 33, highestLevel: 13, isNpc: true },
  { id: 'npc_8', name: 'Phương Nhi Abbott', house: 'hufflepuff', totalScore: 63200, stars: 30, highestLevel: 12, isNpc: true }
];

const VALID_HOUSES = new Set(['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff']);
const VALID_CARD_IDS = new Set(CHOCOLATE_FROG_CARDS.map((c) => c.id));
const VALID_STAR_CHEST_KEYS = new Set(
  SEASON_1_CHAPTERS.flatMap((ch) => CHAPTER_STAR_CHESTS.map((chest) => `ch${ch.id}_${chest.threshold}`))
);
const SAFE_ID_RE = /^[a-zA-Z0-9_-]{1,48}$/;

function clampInt(val, min, max, fallback) {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function sanitizePlayerName(raw) {
  if (typeof raw !== 'string') return 'Phù Thủy Bí Ẩn';
  const cleaned = raw.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 26);
  return cleaned || 'Phù Thủy Bí Ẩn';
}

function generatePlayerId() {
  return `wiz_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function getLocalDayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function createDefaultPlayer(name = '', house = 'gryffindor') {
  return {
    id: generatePlayerId(),
    name: name ? sanitizePlayerName(name) : 'Phù Thủy Bí Ẩn',
    house: VALID_HOUSES.has(house) ? house : 'gryffindor',
    galleons: 250,
    hearts: MAX_HEARTS,
    nextHeartAt: null,
    winStreak: 0,
    lastDailySpinDate: '',
    unlockAllPreview: false,
    boosters: {
      hammer: 3,
      swap: 2,
      shuffle: 2,
      extraMoves: 2
    },
    preBoosters: {
      pre_color_bomb: 2,
      pre_striped_wrapped: 2,
      pre_lucky_seeker: 2
    },
    frogCards: {},
    claimedStarChests: {},
    totalFrogsCleared: 0,
    // levelProgress[levelId] = { stars: 1..3, highScore: number }
    levelProgress: {},
    updatedAt: Date.now()
  };
}

function migratePlayer(p) {
  if (!p || typeof p !== 'object') return createDefaultPlayer('Phù Thủy Bí Ẩn', 'gryffindor');

  const safeId = typeof p.id === 'string' && SAFE_ID_RE.test(p.id) ? p.id : generatePlayerId();
  const safeName = sanitizePlayerName(p.name);
  const safeHouse = VALID_HOUSES.has(p.house) ? p.house : 'gryffindor';
  const safeGalleons = clampInt(p.galleons, 0, 9999999, 250);
  const safeHearts = clampInt(p.hearts, 0, MAX_HEARTS, MAX_HEARTS);
  const safeNextHeartAt =
    typeof p.nextHeartAt === 'number' && Number.isFinite(p.nextHeartAt) && p.nextHeartAt > 0
      ? Math.floor(p.nextHeartAt)
      : null;
  const safeStreak = clampInt(p.winStreak, 0, 3, 0);
  const safeSpinDate = typeof p.lastDailySpinDate === 'string' ? p.lastDailySpinDate.slice(0, 16) : '';

  const defaultBoosters = { hammer: 3, swap: 2, shuffle: 2, extraMoves: 2 };
  const srcBoosters = p.boosters && typeof p.boosters === 'object' ? p.boosters : defaultBoosters;
  const safeBoosters = {};
  for (const b of BOOSTERS) {
    safeBoosters[b.id] = clampInt(srcBoosters[b.id], 0, 999, defaultBoosters[b.id] ?? 0);
  }

  const defaultPre = { pre_color_bomb: 2, pre_striped_wrapped: 2, pre_lucky_seeker: 2 };
  const srcPre = p.preBoosters && typeof p.preBoosters === 'object' ? p.preBoosters : defaultPre;
  const safePreBoosters = {};
  for (const pb of PREGAME_BOOSTERS) {
    safePreBoosters[pb.id] = clampInt(srcPre[pb.id], 0, 999, defaultPre[pb.id] ?? 0);
  }

  const safeFrogCards = {};
  if (p.frogCards && typeof p.frogCards === 'object') {
    for (const [cardId, cnt] of Object.entries(p.frogCards)) {
      if (!VALID_CARD_IDS.has(cardId)) continue;
      const safeCnt = clampInt(cnt, 0, 999, 0);
      if (safeCnt > 0) safeFrogCards[cardId] = safeCnt;
    }
  }

  const safeClaimedChests = {};
  if (p.claimedStarChests && typeof p.claimedStarChests === 'object') {
    for (const [k, val] of Object.entries(p.claimedStarChests)) {
      if (VALID_STAR_CHEST_KEYS.has(k) && val === true) {
        safeClaimedChests[k] = true;
      }
    }
  }

  const safeProgress = {};
  if (p.levelProgress && typeof p.levelProgress === 'object') {
    for (const [lvlKey, info] of Object.entries(p.levelProgress)) {
      const lvlNum = Number(lvlKey);
      if (!Number.isInteger(lvlNum) || lvlNum < 1 || lvlNum > 100 || !info || typeof info !== 'object') continue;
      safeProgress[lvlNum] = {
        stars: clampInt(info.stars, 0, 3, 0),
        highScore: clampInt(info.highScore, 0, 99999999, 0)
      };
    }
  }

  return {
    id: safeId,
    name: safeName,
    house: safeHouse,
    galleons: safeGalleons,
    hearts: safeHearts,
    nextHeartAt: safeNextHeartAt,
    winStreak: safeStreak,
    lastDailySpinDate: safeSpinDate,
    unlockAllPreview: Boolean(p.unlockAllPreview),
    boosters: safeBoosters,
    preBoosters: safePreBoosters,
    frogCards: safeFrogCards,
    claimedStarChests: safeClaimedChests,
    totalFrogsCleared: clampInt(p.totalFrogsCleared, 0, 99999999, 0),
    levelProgress: safeProgress,
    updatedAt: clampInt(p.updatedAt, 0, Number.MAX_SAFE_INTEGER, Date.now())
  };
}

function deduplicatePlayers(players) {
  const seen = new Set();
  return players.map((pl) => {
    let id = pl.id;
    while (seen.has(id)) {
      id = generatePlayerId();
    }
    seen.add(id);
    return id === pl.id ? pl : { ...pl, id };
  });
}

export class StorageService {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.players)) {
          const players = deduplicatePlayers(parsed.players.slice(0, 50).map(migratePlayer));
          const activeId =
            players.some((pl) => pl.id === parsed.activePlayerId)
              ? parsed.activePlayerId
              : players[0]?.id ?? null;
          return {
            activePlayerId: activeId,
            includeSeededRivals: parsed.includeSeededRivals !== false,
            players
          };
        }
      }
    } catch {
      // ignore corrupted storage
    }
    return {
      activePlayerId: null,
      includeSeededRivals: true,
      players: []
    };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // ignore quota error
    }
  }

  getActivePlayer() {
    if (!this.data.activePlayerId) return null;
    const p = this.data.players.find((pl) => pl.id === this.data.activePlayerId) || null;
    if (p) this.syncHearts(p);
    return p;
  }

  getAllRealPlayers() {
    return [...this.data.players];
  }

  getCollectionBuffs(player = this.getActivePlayer()) {
    let scoreBonusPct = 0;
    let patronusBonusPct = 0;
    let shopDiscountPct = 0;
    let bonusClearGalleons = 0;
    let uniqueCount = 0;
    let totalCopies = 0;

    const ownedMap = player?.frogCards || {};
    for (const card of CHOCOLATE_FROG_CARDS) {
      const cnt = ownedMap[card.id] || 0;
      if (cnt > 0) {
        uniqueCount++;
        totalCopies += cnt;
        if (card.buffType === 'score_pct') scoreBonusPct += card.buffValue;
        else if (card.buffType === 'patronus_pct') patronusBonusPct += card.buffValue;
        else if (card.buffType === 'shop_discount') shopDiscountPct += card.buffValue;
        else if (card.buffType === 'clear_galleons') bonusClearGalleons += card.buffValue;
      }
    }

    return {
      scoreBonusPct,
      patronusBonusPct,
      shopDiscountPct,
      bonusClearGalleons,
      uniqueCount,
      totalCopies,
      totalCards: CHOCOLATE_FROG_CARDS.length
    };
  }

  getDiscountedPrice(basePrice, player = this.getActivePlayer()) {
    const { shopDiscountPct } = this.getCollectionBuffs(player);
    if (shopDiscountPct <= 0) return basePrice;
    return Math.max(10, Math.round(basePrice * (1 - shopDiscountPct / 100)));
  }

  awardFrogCardInternal(player, preferUnowned = true) {
    if (!player) return null;
    if (!player.frogCards) player.frogCards = {};
    const unowned = CHOCOLATE_FROG_CARDS.filter((c) => !(player.frogCards[c.id] > 0));
    let pool = CHOCOLATE_FROG_CARDS;
    if (unowned.length > 0 && (preferUnowned || Math.random() < 0.8)) {
      pool = unowned;
    }
    const card = pool[Math.floor(Math.random() * pool.length)];
    const isNew = !(player.frogCards[card.id] > 0);
    player.frogCards[card.id] = Math.min(999, (player.frogCards[card.id] || 0) + 1);

    let duplicateGalleons = 0;
    if (!isNew) {
      duplicateGalleons = 25;
      player.galleons += duplicateGalleons;
    }
    return { card, isNew, duplicateGalleons };
  }

  getChapterStars(chapterId, player = this.getActivePlayer()) {
    const ch = SEASON_1_CHAPTERS.find((c) => c.id === Number(chapterId));
    if (!ch || !player) return 0;
    let sum = 0;
    for (let lvl = ch.range[0]; lvl <= ch.range[1]; lvl++) {
      sum += player.levelProgress?.[lvl]?.stars || 0;
    }
    return sum;
  }

  claimChapterStarChest(chapterId, threshold) {
    const player = this.getActivePlayer();
    if (!player) return { ok: false, reason: 'Chưa có hồ sơ Phù Thủy.' };
    const ch = SEASON_1_CHAPTERS.find((c) => c.id === Number(chapterId));
    const chestMeta = CHAPTER_STAR_CHESTS.find((c) => c.threshold === Number(threshold));
    if (!ch || !chestMeta) return { ok: false, reason: 'Không tìm thấy Rương Sao Chương.' };

    if (!player.claimedStarChests) player.claimedStarChests = {};
    const key = `ch${ch.id}_${chestMeta.threshold}`;
    if (player.claimedStarChests[key]) {
      return { ok: false, reason: 'Bạn đã mở Rương Sao này rồi!' };
    }

    const chapterStars = this.getChapterStars(ch.id, player);
    if (chapterStars < chestMeta.threshold) {
      return {
        ok: false,
        reason: `Cần đạt ${chestMeta.threshold} ★ ở Chương ${ch.id} (hiện có ${chapterStars}/60 ★) — thưởng ${chestMeta.summary}!`
      };
    }

    player.claimedStarChests[key] = true;
    player.galleons += chestMeta.galleons;
    if (chestMeta.boosterId) {
      player.boosters[chestMeta.boosterId] = (player.boosters[chestMeta.boosterId] || 0) + 1;
    }
    if (chestMeta.preBoosterId) {
      player.preBoosters[chestMeta.preBoosterId] = (player.preBoosters[chestMeta.preBoosterId] || 0) + 1;
    }

    let droppedCard = null;
    if (chestMeta.grantFrogCard) {
      droppedCard = this.awardFrogCardInternal(player, true);
    }

    player.updatedAt = Date.now();
    this.save();
    return { ok: true, chestMeta, droppedCard };
  }

  syncHearts(player = null) {
    const p = player || (this.data.activePlayerId ? this.data.players.find((pl) => pl.id === this.data.activePlayerId) : null);
    if (!p) return { hearts: MAX_HEARTS, maxHearts: MAX_HEARTS, nextInSec: 0 };

    let dirty = false;
    if (p.hearts >= MAX_HEARTS) {
      p.hearts = MAX_HEARTS;
      if (p.nextHeartAt !== null) {
        p.nextHeartAt = null;
        dirty = true;
      }
    } else {
      const now = Date.now();
      if (!p.nextHeartAt) {
        p.nextHeartAt = now + HEART_REGEN_MS;
        dirty = true;
      } else if (now >= p.nextHeartAt) {
        const gained = 1 + Math.floor((now - p.nextHeartAt) / HEART_REGEN_MS);
        p.hearts = Math.min(MAX_HEARTS, p.hearts + gained);
        p.nextHeartAt = p.hearts >= MAX_HEARTS ? null : p.nextHeartAt + gained * HEART_REGEN_MS;
        dirty = true;
      }
    }

    if (dirty) this.save();
    const nextInSec = p.nextHeartAt ? Math.max(0, Math.ceil((p.nextHeartAt - Date.now()) / 1000)) : 0;
    return { hearts: p.hearts, maxHearts: MAX_HEARTS, nextInSec };
  }

  loseHeartAndStreak() {
    const p = this.getActivePlayer();
    if (!p) return;
    if (p.hearts > 0) {
      p.hearts--;
      if (p.hearts < MAX_HEARTS && !p.nextHeartAt) {
        p.nextHeartAt = Date.now() + HEART_REGEN_MS;
      }
    }
    p.winStreak = 0;
    p.updatedAt = Date.now();
    this.save();
  }

  refillHearts() {
    const p = this.getActivePlayer();
    if (!p) return { ok: false, reason: 'Chưa có hồ sơ Phù Thủy.' };
    this.syncHearts(p);
    if (p.hearts >= MAX_HEARTS) {
      return { ok: false, reason: 'Tim Phép Thuật đã đầy 5/5!' };
    }
    const cost = this.getDiscountedPrice(100, p);
    if (p.galleons >= cost) {
      p.galleons -= cost;
      p.hearts = MAX_HEARTS;
      p.nextHeartAt = null;
      this.save();
      return { ok: true, freeHeal: false, msg: `Đã nạp đầy 5/5 Tim Phép Thuật (-${cost} G)!` };
    }
    if (p.hearts === 0) {
      // Cứu trợ Bệnh Thất Madam Pomfrey miễn phí khi hết sạch cả Tim lẫn Galleon
      p.hearts = 3;
      p.nextHeartAt = Date.now() + HEART_REGEN_MS;
      this.save();
      return { ok: true, freeHeal: true, msg: 'Bệnh Thất Madam Pomfrey hồi miễn phí +3 Tim Phép Thuật!' };
    }
    return { ok: false, reason: `Cần ${cost} Vàng Galleon để hồi đầy 5 Tim ngay lập tức.` };
  }

  canFreeSpinToday(player = this.getActivePlayer()) {
    if (!player) return false;
    return player.lastDailySpinDate !== getLocalDayKey();
  }

  applyWheelSpin(segment, isPaidSpin = false) {
    const p = this.getActivePlayer();
    if (!p) return { ok: false, reason: 'Chưa có hồ sơ Phù Thủy.' };

    const freeAvailable = this.canFreeSpinToday(p);
    if (isPaidSpin || !freeAvailable) {
      if (p.galleons < 60) {
        return { ok: false, reason: 'Cần 60 G để quay thêm lượt Vòng Quay Công Tước Mật!' };
      }
      p.galleons -= 60;
    } else {
      p.lastDailySpinDate = getLocalDayKey();
    }

    if (segment.rewardType === 'galleons') {
      p.galleons += segment.amount;
    } else if (segment.rewardType === 'booster') {
      p.boosters[segment.itemId] = (p.boosters[segment.itemId] || 0) + segment.amount;
    } else if (segment.rewardType === 'preBooster') {
      p.preBoosters[segment.itemId] = (p.preBoosters[segment.itemId] || 0) + segment.amount;
    } else if (segment.rewardType === 'hearts_full') {
      p.hearts = MAX_HEARTS;
      p.nextHeartAt = null;
    }
    p.updatedAt = Date.now();
    this.save();
    return { ok: true };
  }

  registerOrUpdateActivePlayer(name, house, createNew = false) {
    const cleanName = sanitizePlayerName(String(name ?? ''));
    const safeHouse = VALID_HOUSES.has(house) ? house : 'gryffindor';
    let player = !createNew ? this.getActivePlayer() : null;
    if (!player) {
      player = createDefaultPlayer(cleanName, safeHouse);
      this.data.players.push(player);
      this.data.activePlayerId = player.id;
    } else {
      player.name = cleanName;
      player.house = safeHouse;
      player.updatedAt = Date.now();
    }
    this.save();
    return player;
  }

  switchPlayer(playerId) {
    const target = this.data.players.find((p) => p.id === playerId);
    if (target) {
      this.data.activePlayerId = target.id;
      this.syncHearts(target);
      this.save();
    }
    return target;
  }

  toggleUnlockAllPreview() {
    const p = this.getActivePlayer();
    if (!p) return false;
    p.unlockAllPreview = !p.unlockAllPreview;
    this.save();
    return p.unlockAllPreview;
  }

  toggleSeededRivals() {
    this.data.includeSeededRivals = !this.data.includeSeededRivals;
    this.save();
    return this.data.includeSeededRivals;
  }

  getHighestUnlockedLevel(player = this.getActivePlayer()) {
    if (!player) return 1;
    if (player.unlockAllPreview) return 100;
    let highestCleared = 0;
    for (const [lvlStr, info] of Object.entries(player.levelProgress)) {
      if (info && info.stars > 0) {
        highestCleared = Math.max(highestCleared, Number(lvlStr));
      }
    }
    return Math.min(100, highestCleared + 1);
  }

  getPlayerStats(player) {
    let totalScore = 0;
    let stars = 0;
    let highestLevel = 0;
    for (const [lvlStr, info] of Object.entries(player.levelProgress || {})) {
      if (info) {
        totalScore += info.highScore || 0;
        stars += info.stars || 0;
        if (info.stars > 0) highestLevel = Math.max(highestLevel, Number(lvlStr));
      }
    }
    return { totalScore, stars, highestLevel };
  }

  recordVictory(levelId, score, stars, rewardGalleons, frogsCleared = 0) {
    const player = this.getActivePlayer();
    if (!player) return { firstClear: false, galleonsEarned: 0, newStreak: 0, droppedCard: null };

    const prev = player.levelProgress[levelId];
    const firstClear = !prev || prev.stars === 0;
    const improvedStars = Math.max(0, stars - (prev?.stars || 0));
    const buffs = this.getCollectionBuffs(player);

    let galleonsEarned = 0;
    if (firstClear) {
      galleonsEarned = rewardGalleons + stars * 10;
    } else if (improvedStars > 0) {
      galleonsEarned = improvedStars * 12;
    } else {
      galleonsEarned = 5;
    }

    galleonsEarned += buffs.bonusClearGalleons;
    if (player.house === 'hufflepuff' && stars >= 3) {
      galleonsEarned += 5;
    }

    // Tăng Chuỗi Thắng Chiếc Cốc Lửa (tối đa bậc 3)
    player.winStreak = Math.min(3, (player.winStreak || 0) + 1);

    // Thưởng thêm vật phẩm khi qua Trùm Chương (màn chia hết cho 10)
    let bonusBooster = null;
    if (firstClear && levelId % 10 === 0) {
      const ids = BOOSTERS.map((b) => b.id);
      bonusBooster = ids[(levelId / 10) % ids.length];
      player.boosters[bonusBooster] = (player.boosters[bonusBooster] || 0) + 1;
    }

    // Tiến độ bắt Ếch Sô-cô-la & rớt Thẻ Danh Nhân Phù Thủy
    const prevFrogs = player.totalFrogsCleared || 0;
    const safeFrogs = Math.max(0, Math.floor(Number(frogsCleared) || 0));
    player.totalFrogsCleared = prevFrogs + safeFrogs;

    const isBossFirstClear = firstClear && levelId % 10 === 0;
    const crossedFrogMilestone = Math.floor(player.totalFrogsCleared / 40) > Math.floor(prevFrogs / 40);
    const luckyThreeStar = firstClear && stars >= 3 && Math.random() < 0.35;

    let droppedCard = null;
    if (isBossFirstClear || crossedFrogMilestone || luckyThreeStar) {
      droppedCard = this.awardFrogCardInternal(player, isBossFirstClear || crossedFrogMilestone);
    }

    player.levelProgress[levelId] = {
      stars: Math.max(prev?.stars || 0, stars),
      highScore: Math.max(prev?.highScore || 0, score)
    };
    player.galleons += galleonsEarned;
    player.updatedAt = Date.now();
    this.save();

    return {
      firstClear,
      galleonsEarned,
      bonusBooster,
      newStreak: player.winStreak,
      droppedCard
    };
  }

  consumeBooster(boosterId) {
    const player = this.getActivePlayer();
    if (!player) return false;
    if ((player.boosters[boosterId] || 0) <= 0) return false;
    player.boosters[boosterId]--;
    this.save();
    return true;
  }

  buyBooster(boosterId) {
    const player = this.getActivePlayer();
    const meta = BOOSTERS.find((b) => b.id === boosterId);
    if (!player || !meta) return { ok: false, reason: 'Không tìm thấy vật phẩm.' };
    const effectivePrice = this.getDiscountedPrice(meta.price, player);
    if (player.galleons < effectivePrice) {
      return { ok: false, reason: `Chưa đủ Vàng Galleon (cần ${effectivePrice} G).` };
    }
    player.galleons -= effectivePrice;
    player.boosters[boosterId] = (player.boosters[boosterId] || 0) + 1;
    this.save();
    return { ok: true, pricePaid: effectivePrice };
  }

  consumePreBooster(preId) {
    const player = this.getActivePlayer();
    if (!player) return false;
    if ((player.preBoosters?.[preId] || 0) <= 0) return false;
    player.preBoosters[preId]--;
    this.save();
    return true;
  }

  buyPreBooster(preId) {
    const player = this.getActivePlayer();
    const meta = PREGAME_BOOSTERS.find((b) => b.id === preId);
    if (!player || !meta) return { ok: false, reason: 'Không tìm thấy Bùa Đầu Trận.' };
    const effectivePrice = this.getDiscountedPrice(meta.price, player);
    if (player.galleons < effectivePrice) {
      return { ok: false, reason: `Chưa đủ Vàng Galleon (cần ${effectivePrice} G).` };
    }
    player.galleons -= effectivePrice;
    player.preBoosters[preId] = (player.preBoosters[preId] || 0) + 1;
    this.save();
    return { ok: true, pricePaid: effectivePrice };
  }

  // Tổng hợp Bảng Xếp Hạng Cá Nhân & Cúp 4 Nhà
  getLeaderboardSnapshot(houseFilter = 'all') {
    const activeId = this.data.activePlayerId;
    const realEntries = this.data.players.map((p) => {
      const st = this.getPlayerStats(p);
      return {
        id: p.id,
        name: p.name,
        house: p.house,
        totalScore: st.totalScore,
        stars: st.stars,
        highestLevel: st.highestLevel,
        winStreak: p.winStreak || 0,
        isNpc: false,
        isCurrent: p.id === activeId
      };
    });

    const allEntries = this.data.includeSeededRivals
      ? [...realEntries, ...SEEDED_RIVALS]
      : [...realEntries];

    const houseStandings = {
      gryffindor: { house: 'gryffindor', points: 0, stars: 0, members: 0 },
      slytherin: { house: 'slytherin', points: 0, stars: 0, members: 0 },
      ravenclaw: { house: 'ravenclaw', points: 0, stars: 0, members: 0 },
      hufflepuff: { house: 'hufflepuff', points: 0, stars: 0, members: 0 }
    };

    for (const e of allEntries) {
      const h = houseStandings[e.house];
      if (h) {
        h.points += Math.max(5, Math.round(e.totalScore / 100) + e.stars * 2);
        h.stars += e.stars;
        h.members += 1;
      }
    }

    const sortedHouses = Object.values(houseStandings).sort((a, b) => b.points - a.points);

    const filteredPlayers = allEntries
      .filter((e) => houseFilter === 'all' || e.house === houseFilter)
      .sort((a, b) => b.totalScore - a.totalScore || b.stars - a.stars);

    return {
      houses: sortedHouses,
      players: filteredPlayers,
      includeSeededRivals: this.data.includeSeededRivals
    };
  }

  exportLeaderboardCSV() {
    const { players } = this.getLeaderboardSnapshot('all');
    const header = ['Hang', 'Ten Phu Thuy', 'Nha Hogwarts', 'Tong Diem', 'Tong Sao', 'Man Cao Nhat', 'Loai'];
    const escapeCsvCell = (raw) => {
      const str = String(raw ?? '').replace(/"/g, '""');
      const formulaSafe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
      return `"${formulaSafe}"`;
    };
    const rows = players.map((p, idx) => [
      idx + 1,
      escapeCsvCell(p.name),
      p.house.toUpperCase(),
      p.totalScore,
      p.stars,
      p.highestLevel,
      p.isNpc ? 'Hoc vien mau' : 'Nguoi choi that'
    ]);
    return [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  exportSaveJSON() {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        version: 3,
        state: this.data
      },
      null,
      2
    );
  }

  importSaveJSON(rawJson) {
    if (typeof rawJson !== 'string' || rawJson.length === 0 || rawJson.length > 512 * 1024) {
      return { ok: false, reason: 'File sao lưu vượt quá giới hạn an toàn (512 KB) hoặc trống.' };
    }
    try {
      const parsed = JSON.parse(rawJson);
      const state = parsed?.state && Array.isArray(parsed.state.players) ? parsed.state : parsed;
      if (!state || !Array.isArray(state.players) || state.players.length === 0) {
        return { ok: false, reason: 'File sao lưu không hợp lệ hoặc không có dữ liệu Phù Thủy.' };
      }
      const players = deduplicatePlayers(state.players.slice(0, 50).map(migratePlayer));
      const activeId = players.some((pl) => pl.id === state.activePlayerId)
        ? state.activePlayerId
        : players[0].id;
      this.data = {
        activePlayerId: activeId,
        includeSeededRivals: state.includeSeededRivals !== false,
        players
      };
      this.save();
      return { ok: true, count: this.data.players.length };
    } catch {
      return { ok: false, reason: 'Không đọc được file JSON sao lưu.' };
    }
  }
}

export const storage = new StorageService();
