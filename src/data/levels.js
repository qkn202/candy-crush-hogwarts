// Season 1: Năm Nhất — Hòn Đá Phù Thủy (100 Bản Đồ Độc Bản Đầy Đủ Cơ Chế Candy Crush Saga Gốc)

import { BOSS_ROSTER } from './lore.js';

const LEVEL_TITLES = [
  // Chương I: Số 4 Đường Privet & Đàn Cú Đưa Thư (1–20)
  'Đứa Bé Sống Sót',
  'Chiếc Môtô Bay Của Sirius',
  'Gầm Cầu Thang Chật Hẹp',
  'Nhà Bò Sát Trong Sở Thú',
  'Tấm Kính Biến Mất Kỳ Lạ',
  'Phong Thư Đề Mực Xanh Ngọc',
  'Con Dấu Sáp Đỏ Chữ H',
  'Phòng Ngủ Nhỏ Tầng Hai',
  'Trận Mưa Thư Qua Ống Khói',
  'TRÙM: Đàn Cú Bao Vây Đường Privet',
  'Chuyến Chạy Trốn Trong Mưa',
  'Khách Sạn Đường Tàu Cũ',
  'Một Trăm Lá Thư Chủ Nhật',
  'Con Thuyền Ra Mỏm Đá Biển',
  'Chòi Gỗ Giữa Cơn Bão Đêm',
  'Đồng Hồ Điểm Mười Hai Giờ',
  'Tiếng Đập Cửa Rung Chuyển',
  'Chiếc Bánh Sinh Nhật Hơi Bẹp',
  'Chiếc Dù Hồng Của Hagrid',
  'TRÙM: Người Giữ Khoá Trường Hogwarts',

  // Chương II: Hẻm Xéo & Hầm Ngục Gringotts (21–40)
  'Tờ Nhật Báo Tiên Tri Buổi Sáng',
  'Quán Cái Vạc Lủng',
  'Ba Viên Gạch Phía Trên Thùng Rác',
  'Cánh Cổng Mở Vào Hẻm Xéo',
  'Ngân Hàng Phù Thủy Gringotts',
  'Lời Cảnh Báo Của Yêu Tinh',
  'Chuyến Xe Kéo Lao Xuống Vực Sâu',
  'Ngọn Lửa Rồng Dưới Lòng Đất',
  'Hầm Chứa Vàng Nhà Potter',
  'TRÙM: Bí Mật Hầm Số 713',
  'Tiệm Áo Chùng Phu Nhân Malkin',
  'Cuộc Chạm Trán Cậu Ấm Tóc Bạch Kim',
  'Hiệu Sách Phú Quý Và Cơ Hàn',
  'Vạc Đồng Thiếc Cỡ Số 2',
  'Tiệm Dược Liệu Mùi Thảo Mộc',
  'Đôi Mắt Hổ Phách Của Cú Hedwig',
  'Tiệm Đũa Phép Ollivanders',
  'Gỗ Nhựa Ruồi Và Lông Phượng Hoàng',
  'Cây Đũa Phép Tự Chọn Chủ Nhân',
  'TRÙM: Hai Lõi Phượng Hoàng Song Sinh',

  // Chương III: Sân Ga 9¾ & Đại Sảnh Đường (41–60)
  'Nhà Ga Ngã Tư Vua Nhộn Nhịp',
  'Lao Xuyên Bức Tường Ga 9¾',
  'Tàu Tốc Hành Đỏ Thẫm Hogwarts',
  'Khoang Tàu Cuối Toa Và Cậu Bạn Ron',
  'Kẹo Đậu Đủ Vị Bertie Bott',
  'Thẻ Bài Ếch Sô-cô-la Dumbledore',
  'Con Cóc Trevor Đi Lạc',
  'Cô Bạn Tóc Xù Biết Tuốt',
  'Đoàn Thuyền Vượt Mặt Hồ Đen',
  'TRÙM: Bầu Trời Ngàn Nến Đại Sảnh Đường',
  'Bài Hát Của Chiếc Nón Phân Loại',
  'Bốn Chiếc Bàn Dài Của Bốn Nhà',
  'Đại Tiệc Khai Giảng Linh Đình',
  'Mật Khẩu Bà Béo Canh Cửa',
  'Một Trăm Bốn Mươi Hai Cầu Thang',
  'Lớp Biến Hình Của Cô McGonagall',
  'Hầm Độc Dược Lạnh Lẽo Của Thầy Snape',
  'Lớp Bùa Chú: Wingardium Leviosa!',
  'Đêm Lễ Hội Hóa Trang Halloween',
  'TRÙM: Quỷ Khổng Lồ Núi Trong Nhà Vệ Sinh',

  // Chương IV: Sân Quidditch & Rừng Cấm Đêm Khuya (61–80)
  'Cây Chổi Tia Chớp Nimbus 2000',
  'Ba Trái Bóng Trên Sân Quidditch',
  'Tầm Thủ Trẻ Nhất Một Thế Kỷ',
  'Cây Chổi Bị Ếm Bùa Giữa Không Trung',
  'Áo Chùng Bốc Cháy Trên Khán Đài',
  'Cú Đớp Trái Snitch Ngoạn Mục',
  'Chòi Gỗ Thơm Mùi Trà Của Hagrid',
  'Cái Tên Nicolas Flamel Bí Ẩn',
  'Buổi Sáng Giáng Sinh Ở Hogwarts',
  'TRÙM: Tấm Áo Khoác Tàng Hình Gia Truyền',
  'Hành Lang Đêm Khu Cấm Thư Viện',
  'Cuốn Sách Gào Thét Trong Bóng Tối',
  'Căn Phòng Bỏ Trống Và Tấm Gương Lớn',
  'Khát Vọng Sâu Thẳm: Erised',
  'Lời Khuyên Của Cụ Dumbledore',
  'Quả Trứng Rồng Đen Trên Bếp Lửa',
  'Chú Rồng Lưng Xoáy Na Uy Norbert',
  'Chuyến Đưa Rồng Lên Tháp Thiên Văn',
  'Hình Phạt Cấm Túc Lúc Nửa Đêm',
  'TRÙM: Bóng Đen Uống Máu Kỳ Lân Rừng Cấm',

  // Chương V: Cửa Sập Ba Đầu & Hòn Đá Phù Thủy (81–100)
  'Kỳ Thi Cuối Năm Nóng Bức',
  'Vết Thẹo Tia Chớp Đau Nhói',
  'Bí Mật Quả Trứng Rồng Bị Lộ',
  'Tiếng Đàn Hạc Ru Ngủ Fluffy',
  'Cánh Cửa Sập Mở Vào Đêm Đen',
  'Vòng Xiết Của Bẫy Thực Vật Quỷ',
  'Ánh Nắng Mặt Trời Lumos Solem!',
  'Đàn Chìa Khoá Cổ Có Cánh Bạc',
  'Chiếc Chìa Khoá Gãy Cánh Giữa Bầu Trời',
  'TRÙM: Bàn Cờ Phù Thủy Khổng Lồ Của McGonagall',
  'Nước Cờ Thí Mình Của Hiệp Sĩ Ron',
  'Căn Phòng Mùi Quỷ Khổng Lồ',
  'Bức Tường Lửa Đen Và Lửa Tím',
  'Câu Đố Bảy Bình Độc Dược Của Snape',
  'Giọt Thuốc Nhỏ Tiến Qua Ngọn Lửa Đen',
  'Người Đứng Trước Tấm Gương Ảo Ảnh',
  'Bí Mật Sau Chiếc Khăn Quấn Đầu',
  'Viên Đá Đỏ Trong Túi Áo Harry',
  'Sức Mạnh Tình Thương Cổ Xưa',
  'ĐẠI TRÙM SEASON 1: Bảo Vệ Hòn Đá Phù Thủy'
];

// 18 khuôn bàn cờ đối xứng — đảm bảo mọi ô hoạt động đều có dãy >=3 ngang hoặc dọc
function buildMask(size, patternId) {
  const m = Array.from({ length: size }, () => Array(size).fill(1));
  const last = size - 1;
  const mid = Math.floor(size / 2);

  switch (patternId) {
    case 0:
      break;
    case 1:
      m[0][0] = m[0][last] = m[last][0] = m[last][last] = 0;
      break;
    case 2:
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2 - r; c++) {
          m[r][c] = m[r][last - c] = m[last - r][c] = m[last - r][last - c] = 0;
        }
      }
      break;
    case 3:
      m[mid][0] = m[mid][last] = 0;
      if (size >= 8) m[mid - 1][0] = m[mid - 1][last] = 0;
      break;
    case 4:
      if (size % 2 === 0) {
        m[mid - 1][mid - 1] = m[mid - 1][mid] = m[mid][mid - 1] = m[mid][mid] = 0;
      } else {
        m[mid][mid] = 0;
      }
      break;
    case 5:
      m[0][mid] = m[last][mid] = 0;
      if (size % 2 === 0) m[0][mid - 1] = m[last][mid - 1] = 0;
      break;
    case 6:
      if (size >= 8) {
        for (const r of [0, 1, last - 1, last]) {
          for (const c of [0, 1, last - 1, last]) m[r][c] = 0;
        }
      } else {
        m[0][0] = m[0][last] = m[last][0] = m[last][last] = 0;
      }
      break;
    case 7:
      m[2][2] = m[2][last - 2] = m[last - 2][2] = m[last - 2][last - 2] = 0;
      break;
    case 8:
      m[0][mid] = m[1][mid] = m[last][mid] = m[last - 1][mid] = 0;
      break;
    case 9:
      m[last][0] = m[last][1] = m[last][last] = m[last][last - 1] = 0;
      m[last - 1][0] = m[last - 1][last] = 0;
      break;
    case 10:
      m[0][last] = m[0][last - 1] = m[1][last] = 0;
      m[last][0] = m[last][1] = m[last - 1][0] = 0;
      break;
    case 11:
      m[1][1] = m[1][mid] = m[1][last - 1] = 0;
      break;
    case 12:
      m[0][mid] = 0;
      if (size % 2 === 0) m[0][mid - 1] = 0;
      m[last][0] = m[last][last] = 0;
      m[mid][0] = m[mid][last] = 0;
      break;
    case 13:
      m[0][1] = m[0][last - 1] = 0;
      if (size >= 8) m[0][3] = m[0][last - 3] = 0;
      break;
    case 14:
      m[2][2] = m[2][last - 2] = 0;
      m[last - 2][2] = m[last - 2][last - 2] = 0;
      m[0][0] = m[0][last] = m[last][0] = m[last][last] = 0;
      break;
    case 15:
      m[0][0] = m[1][0] = m[0][last] = m[1][last] = 0;
      m[mid][mid] = 0;
      break;
    case 16:
      m[0][0] = m[0][1] = m[1][0] = 0;
      m[0][last] = m[0][last - 1] = m[1][last] = 0;
      if (size >= 8) m[3][3] = m[3][last - 3] = 0;
      break;
    case 17:
      m[0][0] = m[0][1] = m[1][0] = 0;
      m[0][last] = m[0][last - 1] = m[1][last] = 0;
      m[last][0] = m[last][1] = m[last - 1][0] = 0;
      m[last][last] = m[last][last - 1] = m[last - 1][last] = 0;
      m[mid][mid] = 0;
      break;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (m[r][c] === 0) continue;
      let hCount = 1;
      for (let cc = c - 1; cc >= 0 && m[r][cc] === 1; cc--) hCount++;
      for (let cc = c + 1; cc < size && m[r][cc] === 1; cc++) hCount++;
      let vCount = 1;
      for (let rr = r - 1; rr >= 0 && m[rr][c] === 1; rr--) vCount++;
      for (let rr = r + 1; rr < size && m[rr][c] === 1; rr++) vCount++;
      if (hCount < 3 && vCount < 3) {
        if (c + 1 < size) m[r][c + 1] = 1;
        if (c - 1 >= 0) m[r][c - 1] = 1;
      }
    }
  }
  return m;
}

function seededRand(seed) {
  let s = (seed * 9301 + 49297) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function placeSymmetricalGrid(size, mask, count, maxLayer, seed, preferCenter = true, forbiddenFn = null) {
  const grid = Array.from({ length: size }, () => Array(size).fill(0));
  if (count <= 0) return grid;
  const rand = seededRand(seed);

  const candidates = [];
  const center = (size - 1) / 2;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= Math.floor((size - 1) / 2); c++) {
      if (mask[r][c] === 0) continue;
      if (forbiddenFn?.(r, c)) continue;
      const dist = Math.hypot(r - center, c - center);
      candidates.push({ r, c, score: preferCenter ? -dist + rand() * 1.8 : dist + rand() * 1.8 });
    }
  }
  candidates.sort((a, b) => b.score - a.score);

  let placed = 0;
  for (const cell of candidates) {
    if (placed >= count) break;
    const mirrorC = size - 1 - cell.c;
    const layer = maxLayer >= 3 && rand() > 0.72 ? 3 : maxLayer >= 2 && rand() > 0.44 ? 2 : 1;
    if (mask[cell.r][cell.c] === 1 && grid[cell.r][cell.c] === 0 && !forbiddenFn?.(cell.r, cell.c)) {
      grid[cell.r][cell.c] = layer;
      placed++;
    }
    if (
      placed < count &&
      mirrorC !== cell.c &&
      mask[cell.r][mirrorC] === 1 &&
      grid[cell.r][mirrorC] === 0 &&
      !forbiddenFn?.(cell.r, mirrorC)
    ) {
      grid[cell.r][mirrorC] = layer;
      placed++;
    }
  }
  return grid;
}

const DROP_INGREDIENT_LEVELS = new Set([12, 18, 26, 34, 42, 52, 62, 72, 82, 92, 98, 100]);
const SCORE_ONLY_LEVELS = new Set([4, 9, 19]);
const SPECIAL_ORDER_MAP = {
  27: { specialKind: 'striped', target: 4 },
  33: { specialKind: 'seeker', target: 3 },
  45: { specialKind: 'wrapped', target: 3 },
  57: { specialKind: 'striped', target: 5 },
  69: { specialKind: 'seeker', target: 4 },
  77: { specialKind: 'wrapped', target: 3 },
  89: { specialKind: 'color_bomb', target: 2 },
  95: { specialKind: 'striped', target: 5 }
};
const PORTAL_LEVELS = new Set([54, 58, 66, 74, 84, 94, 100]);
const BOMB_LEVELS = new Set([64, 70, 76, 80, 86, 90, 96, 100]);
const CONVEYOR_LEVELS = new Set([46, 55, 68, 78, 88, 96, 99]);
const CAULDRON_LEVELS = new Set([57, 65, 75, 85, 94, 99]);
const KEY_LOCK_LEVELS = new Set([28, 38, 48, 63, 73, 83, 88, 91]);

function buildRectLoop(rTop, cLeft, rBot, cRight, reverse = false) {
  if (rBot - rTop < 1 || cRight - cLeft < 1) return [];
  const ring = [];
  for (let c = cLeft; c <= cRight; c++) ring.push({ r: rTop, c });
  for (let r = rTop + 1; r <= rBot; r++) ring.push({ r, c: cRight });
  for (let c = cRight - 1; c >= cLeft; c--) ring.push({ r: rBot, c });
  for (let r = rBot - 1; r >= rTop + 1; r--) ring.push({ r, c: cLeft });
  return reverse ? ring.reverse() : ring;
}

function buildConveyorLoops(size, mask, levelNum, isForbidden) {
  const candidates = [
    [2, 2, size - 3, size - 3],
    [2, 1, size - 3, size - 2],
    [1, 2, size - 2, size - 3],
    [1, 1, size - 2, size - 2],
    [2, 1, size - 2, size - 2]
  ];
  const reverse = levelNum % 2 === 1;
  for (const [rTop, cLeft, rBot, cRight] of candidates) {
    const loop = buildRectLoop(rTop, cLeft, rBot, cRight, reverse);
    if (loop.length < 6) continue;
    const valid = loop.every((pt) => mask[pt.r]?.[pt.c] === 1 && !isForbidden(pt.r, pt.c));
    if (valid) return [loop];
  }
  return [];
}

function generateLevel(levelNum) {
  const idx = levelNum - 1;
  const chapterId = Math.ceil(levelNum / 20);
  const isBoss = levelNum % 10 === 0;
  const isChapterBoss = levelNum % 20 === 0;
  const bossConfig = BOSS_ROSTER[levelNum] ? { ...BOSS_ROSTER[levelNum] } : null;

  let size = 8;
  if (levelNum <= 4 || (levelNum % 7 === 3 && levelNum < 45 && !isBoss)) {
    size = 7;
  } else if (isChapterBoss || levelNum === 100 || (levelNum >= 65 && levelNum % 5 === 0)) {
    size = 9;
  }

  let patternId = 0;
  if (levelNum === 1 || levelNum === 3 || levelNum === 4) patternId = 0;
  else if (levelNum === 2) patternId = 1;
  else if (levelNum === 100) patternId = 17;
  else if (levelNum === 90) patternId = 14;
  else if (isBoss) patternId = [2, 6, 8, 12, 16, 17][(levelNum / 10) % 6];
  else patternId = (levelNum * 5 + chapterId * 3) % 17;

  const mask = buildMask(size, patternId);

  let numColors = 5;
  if (levelNum >= 25 && (levelNum % 3 === 0 || isBoss)) numColors = 6;
  if (levelNum >= 75 && levelNum % 2 === 0) numColors = 6;
  // Màn Đơn Hàng Kẹo Phép giữ 5 màu kẹo để tỷ lệ rèn Kẹo Sọc / Kẹo Bọc / Cánh Vàng / Cầu Ngũ Sắc cân bằng & mang tính chiến thuật
  if (SPECIAL_ORDER_MAP[levelNum]) numColors = 5;

  // 1. Thiết lập cột Thả Bảo Vật (Drop Ingredients: Hòn Đá Phù Thủy)
  let ingredientTarget = 0;
  const ingredientSpawnCols = [];
  const ingredientExitCells = [];
  if (DROP_INGREDIENT_LEVELS.has(levelNum)) {
    ingredientTarget = levelNum === 100 ? 3 : levelNum >= 60 ? 4 : levelNum >= 26 ? 3 : 2;
    for (let c = 1; c < size - 1; c++) {
      // Ưu tiên các cột trung tâm liên thông để thả Bảo Vật từ đỉnh
      let fullCol = true;
      for (let r = 0; r < size; r++) {
        if (mask[r][c] === 0) {
          fullCol = false;
          break;
        }
      }
      if (fullCol) {
        ingredientSpawnCols.push(c);
      }
    }
    if (ingredientSpawnCols.length === 0) {
      for (let c = 1; c < size - 1; c++) {
        if (mask[0][c] === 1) ingredientSpawnCols.push(c);
      }
    }
    if (ingredientSpawnCols.length === 0) {
      for (let c = 0; c < size; c++) {
        if (mask[0][c] === 1) ingredientSpawnCols.push(c);
      }
    }
    // Mở mũi tên lối thoát tại MỌI ô đáy đang hoạt động (r = size - 1) để Bảo Vật trượt chéo sang cột biên không bao giờ bị kẹt góc!
    for (let c = 0; c < size; c++) {
      if (mask[size - 1][c] === 1) {
        ingredientExitCells.push({ r: size - 1, c });
      }
    }
  }

  const isExitCell = (r, c) => ingredientExitCells.some((ex) => ex.r === r && ex.c === c);

  // 2. Thiết lập Lò Sưởi Bột Floo Dịch Chuyển Xuôi Chiều (Portals: Màn 54+) trước khi đặt vật cản để không bít cửa lò
  const portals = [];
  if (PORTAL_LEVELS.has(levelNum)) {
    const leftC = 1;
    const rightC = size - 2;
    const midR = Math.floor(size / 2);
    const outR = Math.min(size - 2, midR + 1);
    if (mask[midR - 1]?.[leftC] === 1 && mask[outR]?.[rightC] === 1) {
      portals.push({ from: { r: midR - 1, c: leftC }, to: { r: outR, c: rightC }, color: '#10b981' });
    }
    if (mask[midR - 1]?.[rightC] === 1 && mask[outR]?.[leftC] === 1) {
      portals.push({ from: { r: midR - 1, c: rightC }, to: { r: outR, c: leftC }, color: '#a855f7' });
    }
  }
  const isPortalCell = (r, c) =>
    portals.some((p) => (p.from.r === r && p.from.c === c) || (p.to.r === r && p.to.c === c));

  // 2b. Băng Chuyền Cầu Thang Dịch Chuyển (Conveyor Belt: Màn 46+)
  const conveyorLoops = CONVEYOR_LEVELS.has(levelNum)
    ? buildConveyorLoops(size, mask, levelNum, (r, c) => isExitCell(r, c) || isPortalCell(r, c))
    : [];
  const isConveyorCell = (r, c) =>
    conveyorLoops.some((loop) => loop.some((pt) => pt.r === r && pt.c === c));

  // 3. Thiết kế Chướng ngại vật kinh điển Candy Crush theo tiến trình chương
  let jellyCount = 0;
  let maxJellyLayer = 1;
  if (levelNum >= 6 && !SCORE_ONLY_LEVELS.has(levelNum)) {
    const hasJelly = isBoss || (levelNum % 3 !== 1 && !DROP_INGREDIENT_LEVELS.has(levelNum)) || levelNum === 100;
    if (hasJelly) {
      jellyCount = Math.min(32, 8 + Math.floor(levelNum * 0.22) + (isBoss ? 5 : 0));
      maxJellyLayer = levelNum >= 41 ? 2 : 1;
    }
  }

  // Vạc Độc Dược Đẻ Vật Cản (Magic Cauldron 3 HP): mở từ Màn 57+
  const cauldronPotTarget = CAULDRON_LEVELS.has(levelNum) ? (levelNum >= 85 ? 4 : 2) : 0;
  const rawCauldronGrid = placeSymmetricalGrid(
    size,
    mask,
    cauldronPotTarget,
    1,
    levelNum * 67 + 13,
    false,
    (r, c) => r <= 1 || r === size - 1 || isExitCell(r, c) || isPortalCell(r, c) || isConveyorCell(r, c)
  );
  const cauldronGrid = rawCauldronGrid.map((row) => row.map((v) => (v > 0 ? 3 : 0)));

  // Đá Cổ Ngữ (Frosting 1–3 lớp): mở từ Màn 15+, phá bằng ghép cạnh bên!
  let frostingCount = 0;
  let maxFrostingLayer = 1;
  if (levelNum >= 15 && (levelNum % 3 === 0 || isBoss || DROP_INGREDIENT_LEVELS.has(levelNum))) {
    frostingCount = Math.min(10, 4 + Math.floor((levelNum - 15) * 0.07));
    maxFrostingLayer = levelNum >= 70 ? 3 : levelNum >= 36 ? 2 : 1;
  }

  const frostingGrid = placeSymmetricalGrid(
    size,
    mask,
    frostingCount,
    maxFrostingLayer,
    levelNum * 23 + 7,
    true,
    (r, c) =>
      r <= 1 ||
      r === size - 1 ||
      cauldronGrid[r][c] > 0 ||
      isExitCell(r, c) ||
      isPortalCell(r, c) ||
      isConveyorCell(r, c)
  );

  // Sô-cô-la Hắc Ám Tự Lan (Spreading Chocolate): mở từ Màn 44+
  let chocolateCount = 0;
  if (levelNum >= 44 && (levelNum % 4 === 0 || levelNum === 50 || levelNum === 75 || levelNum === 97)) {
    chocolateCount = levelNum >= 75 ? 4 : 2;
  }
  const chocolateGrid = placeSymmetricalGrid(
    size,
    mask,
    chocolateCount,
    1,
    levelNum * 41 + 9,
    false,
    (r, c) =>
      r <= 1 ||
      cauldronGrid[r][c] > 0 ||
      frostingGrid[r][c] > 0 ||
      isExitCell(r, c) ||
      isPortalCell(r, c) ||
      isConveyorCell(r, c)
  );

  // Xoáy Cam Thảo (Licorice Swirl): mở từ Màn 35+, rơi theo trọng lực & chặn tia Kẹo Sọc
  let swirlCount = 0;
  if (levelNum >= 35 && (levelNum % 4 === 3 || levelNum === 60 || levelNum === 85)) {
    swirlCount = Math.min(8, 4 + Math.floor((levelNum - 35) * 0.06));
  }
  const swirlGrid = placeSymmetricalGrid(
    size,
    mask,
    swirlCount,
    1,
    levelNum * 53 + 5,
    true,
    (r, c) =>
      r === 0 ||
      cauldronGrid[r][c] > 0 ||
      frostingGrid[r][c] > 0 ||
      chocolateGrid[r][c] > 0 ||
      isExitCell(r, c) ||
      isPortalCell(r, c) ||
      isConveyorCell(r, c)
  );

  // Băng Ngục Azkaban (Ice Lock 1–2 lớp): mở từ Màn 21+
  let iceCount = 0;
  let maxIceLayer = 1;
  if (levelNum >= 21 && (isBoss || levelNum % 3 === 1 || levelNum % 5 === 0)) {
    iceCount = Math.min(16, 4 + Math.floor((levelNum - 20) * 0.14) + (isBoss ? 2 : 0));
    maxIceLayer = levelNum >= 61 ? 2 : 1;
  }
  const iceGrid = placeSymmetricalGrid(
    size,
    mask,
    iceCount,
    maxIceLayer,
    levelNum * 31 + 11,
    false,
    (r, c) =>
      r <= 1 ||
      cauldronGrid[r][c] > 0 ||
      frostingGrid[r][c] > 0 ||
      chocolateGrid[r][c] > 0 ||
      swirlGrid[r][c] > 0 ||
      isExitCell(r, c) ||
      isPortalCell(r, c) ||
      isConveyorCell(r, c)
  );

  // Chìa Khoá Đường Vàng & Ô Khoá Hầm Gringotts (Sugar Keys & Locks): mở từ Màn 28+
  const lockCountTarget = KEY_LOCK_LEVELS.has(levelNum) ? (levelNum >= 63 ? 6 : 4) : 0;
  const lockGrid = placeSymmetricalGrid(
    size,
    mask,
    lockCountTarget,
    1,
    levelNum * 79 + 17,
    false,
    (r, c) =>
      r <= 1 ||
      r === size - 1 ||
      cauldronGrid[r][c] > 0 ||
      frostingGrid[r][c] > 0 ||
      chocolateGrid[r][c] > 0 ||
      swirlGrid[r][c] > 0 ||
      iceGrid[r][c] > 0 ||
      isExitCell(r, c) ||
      isPortalCell(r, c) ||
      isConveyorCell(r, c)
  );

  const jellyGrid = placeSymmetricalGrid(
    size,
    mask,
    jellyCount,
    maxJellyLayer,
    levelNum * 17 + 3,
    true,
    (r, c) => cauldronGrid[r][c] > 0
  );

  // 4. Bom Kẹo Hắc Ám Đếm Ngược (Candy Bombs): Màn 64+
  let bombConfig = null;
  if (BOMB_LEVELS.has(levelNum)) {
    bombConfig = {
      initialCount: levelNum >= 86 ? 2 : 1,
      intervalMoves: 6,
      startTimer: levelNum >= 90 ? 11 : 13
    };
  }

  let actualJelly = 0;
  let actualIce = 0;
  let actualFrosting = 0;
  let actualChocolate = 0;
  let actualCauldrons = 0;
  let actualLocks = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      actualJelly += jellyGrid[r][c];
      actualIce += iceGrid[r][c];
      actualFrosting += frostingGrid[r][c];
      actualChocolate += chocolateGrid[r][c];
      if (cauldronGrid[r][c] > 0) actualCauldrons++;
      actualLocks += lockGrid[r][c];
    }
  }

  // Số lượt đi cân bằng
  let moves = 25;
  if (levelNum <= 10) moves = 25 + (levelNum % 3) * 2;
  else if (levelNum <= 40) moves = 24 + (levelNum % 4) * 2;
  else if (levelNum <= 75) moves = 23 + (levelNum % 4) * 2;
  else moves = 22 + (levelNum % 5) * 2;
  if (isBoss) moves += 4;
  if (DROP_INGREDIENT_LEVELS.has(levelNum)) moves += 2;
  if (SPECIAL_ORDER_MAP[levelNum]) moves += 3;
  if (actualCauldrons > 0 || actualLocks > 0) moves += 2;
  if (levelNum === 100) moves = 32;

  const baseStar1 = 2200 + levelNum * 140 + (isBoss ? 1500 : 0);
  const stars = [
    Math.round(baseStar1 / 100) * 100,
    Math.round((baseStar1 * 1.65) / 100) * 100,
    Math.round((baseStar1 * 2.45) / 100) * 100
  ];

  // 5. Xây dựng danh sách Mục Tiêu (Objectives) phong phú chuẩn Candy Crush Saga (giữ <= 3 mục tiêu để vừa 1 hàng mobile)
  const objectives = [];

  if (SCORE_ONLY_LEVELS.has(levelNum)) {
    objectives.push({ type: 'score', target: stars[1], label: 'Điểm Phép Thuật' });
  } else {
    if (ingredientTarget > 0) {
      objectives.push({ type: 'ingredient', target: ingredientTarget, label: 'Thả Hòn Đá Phù Thủy' });
    }
    if (bossConfig && objectives.length < 3) {
      objectives.push({ type: 'boss', target: bossConfig.maxHp, label: bossConfig.shortTitle });
    }
    if (actualCauldrons > 0 && objectives.length < 3) {
      objectives.push({ type: 'cauldron', target: actualCauldrons, label: 'Phá Vạc Độc Dược' });
    }
    if (actualLocks > 0 && objectives.length < 3) {
      objectives.push({ type: 'key_lock', target: actualLocks, label: 'Mở Khoá Gringotts' });
    }
    if (SPECIAL_ORDER_MAP[levelNum] && objectives.length < 3) {
      const ord = SPECIAL_ORDER_MAP[levelNum];
      objectives.push({
        type: 'special_order',
        specialKind: ord.specialKind,
        target: ord.target
      });
    }
    if (actualJelly > 0 && objectives.length < 3) {
      objectives.push({ type: 'jelly', target: actualJelly, label: 'Phá Thạch Hắc Ám' });
    }
    if (actualFrosting > 0 && !ingredientTarget && objectives.length < 2 && levelNum % 2 === 1) {
      objectives.push({ type: 'frosting', target: actualFrosting, label: 'Đập Đá Cổ Ngữ' });
    }
    if (actualChocolate > 0 && objectives.length < 3) {
      objectives.push({ type: 'chocolate', label: 'Diệt Sô-cô-la Lan' });
    }
    if (actualIce > 0 && (objectives.length === 0 || (objectives.length < 2 && levelNum % 2 === 0))) {
      objectives.push({ type: 'ice', target: actualIce, label: 'Phá Băng Azkaban' });
    }

    if (objectives.length < 2 && !ingredientTarget && !bossConfig) {
      let preferredTile = (levelNum + chapterId) % numColors;
      if (chapterId === 1 && levelNum <= 12) preferredTile = levelNum % 2 === 0 ? 4 : 2;
      else if (levelNum === 45) preferredTile = 0;
      else if (levelNum === 46) preferredTile = 4;
      else if (chapterId === 4 && levelNum >= 61 && levelNum <= 66) preferredTile = 4;

      const collectTarget = Math.round(moves * (numColors === 5 ? 1.3 : 1.1) + (isBoss ? 8 : 0));
      objectives.push({
        type: 'collect',
        tileId: preferredTile,
        target: collectTarget
      });

      if (objectives.length === 1 && levelNum >= 3) {
        const secondTile = (preferredTile + 2) % numColors;
        objectives.push({
          type: 'collect',
          tileId: secondTile,
          target: Math.max(14, Math.round(collectTarget * 0.8))
        });
      }
    }
  }

  if (levelNum === 1) {
    objectives.length = 0;
    objectives.push({ type: 'collect', tileId: 4, target: 18 });
    objectives.push({ type: 'collect', tileId: 0, target: 18 });
  }

  const rewardGalleons = isChapterBoss ? 120 : isBoss ? 75 : 25 + Math.floor(levelNum / 10) * 5;

  return {
    id: levelNum,
    chapterId,
    title: LEVEL_TITLES[idx] || `Thử Thách Pháp Thuật #${levelNum}`,
    isBoss,
    isChapterBoss,
    bossConfig,
    size,
    numColors,
    moves,
    stars,
    rewardGalleons,
    mask,
    jellyGrid,
    iceGrid,
    frostingGrid,
    chocolateGrid,
    cauldronGrid,
    lockGrid,
    swirlGrid,
    conveyorLoops,
    ingredientTarget,
    ingredientSpawnCols,
    ingredientExitCells,
    portals,
    bombConfig,
    objectives
  };
}

export const SEASON_1_LEVELS = Array.from({ length: 100 }, (_, i) => generateLevel(i + 1));

export function getLevelById(id) {
  const clamped = Math.max(1, Math.min(100, Number(id) || 1));
  return SEASON_1_LEVELS[clamped - 1];
}
