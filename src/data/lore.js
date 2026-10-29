// Dữ liệu Kẹo Phép Thuật Harry Potter × Candy Crush (Kẹo Đậu Đủ Vị Bertie Bott, Thẻ Ếch Sô-cô-la, Thần Hộ Mệnh & 10 Đại Trùm)

export const HOUSES = {
  gryffindor: {
    id: 'gryffindor',
    name: 'Gryffindor',
    vnTitle: 'Nhà Sư Tử Đỏ',
    traits: 'Can Đảm • Gan Dạ • Thượng Võ',
    primary: '#dc2626',
    secondary: '#fbbf24',
    gradient: 'linear-gradient(135deg, #991b1b 0%, #dc2626 58%, #f59e0b 100%)',
    quote: '“Có lẽ ngươi thuộc Gryffindor, nơi tụ hội những trái tim dũng cảm và gan góc bậc nhất!”',
    patronusName: 'Hươu Bạc',
    patronusEmoji: '🦌',
    passiveTitle: 'Trái Tim Sư Tử',
    passiveDesc: '+15% điểm nổ Kẹo Phép & +25% sát thương lên Trùm.',
    activeDesc: 'Chữ Thập Ánh Bạc quét ngang dọc tâm bàn cờ, gây sát thương lớn lên Trùm & tặng 1 Kẹo Bọc + 1 Kẹo Sọc!',
    emblemSvg: `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M12 10H52V32C52 46 32 56 32 56C32 56 12 46 12 32V10Z" fill="#B91C1C" stroke="#FDE047" stroke-width="3.5"/><path d="M32 17L36 25L45 26L38.5 32.5L40 41.5L32 37L24 41.5L25.5 32.5L19 26L28 25L32 17Z" fill="#FDE047"/></svg>`
  },
  slytherin: {
    id: 'slytherin',
    name: 'Slytherin',
    vnTitle: 'Nhà Rắn Xanh',
    traits: 'Tham Vọng • Khôn Ngoan • Quyết Đoán',
    primary: '#059669',
    secondary: '#e2e8f0',
    gradient: 'linear-gradient(135deg, #065f46 0%, #10b981 62%, #94a3b8 100%)',
    quote: '“Hay ở Slytherin, nơi ngươi kết giao những người bạn chân chính và dùng mưu trí vươn tới đỉnh cao!”',
    patronusName: 'Rắn Thần',
    patronusEmoji: '🐍',
    passiveTitle: 'Uy Quyền Hầm Ngục',
    passiveDesc: 'Kìm hãm Sô-cô-la tự lan chậm đi một nửa & +25% điểm phá mọi Vật Cản.',
    activeDesc: 'Thanh tẩy tối đa 5 ô Vật Cản Hắc Ám, lùi +3 nhịp Bom Đếm Ngược & kết tinh ngay 1 Cầu Đậu Ngũ Sắc!',
    emblemSvg: `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M12 10H52V32C52 46 32 56 32 56C32 56 12 46 12 32V10Z" fill="#047857" stroke="#E2E8F0" stroke-width="3.5"/><path d="M38 20C28 18 22 25 32 30C42 35 36 43 25 41" stroke="#A7F3D0" stroke-width="5" stroke-linecap="round"/></svg>`
  },
  ravenclaw: {
    id: 'ravenclaw',
    name: 'Ravenclaw',
    vnTitle: 'Nhà Đại Bàng',
    traits: 'Trí Tuệ • Uyên Bác • Sáng Tạo',
    primary: '#0284c7',
    secondary: '#fbbf24',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #0284c7 65%, #f59e0b 100%)',
    quote: '“Hoặc giả Ravenclaw thông thái, nơi những bộ óc minh mẫn và ham học hỏi luôn tìm thấy đồng môn!”',
    patronusName: 'Đại Bàng',
    patronusEmoji: '🦅',
    passiveTitle: 'Nhãn Quan Thông Thái',
    passiveDesc: 'Tích Nộ Hộ Mệnh nhanh +20%, gợi ý sớm (2.6s) & ưu tiên chỉ nước tạo Kẹo Phép.',
    activeDesc: 'Triệu hồi 4 Cánh Vàng Tầm Thủ Snitch đồng loạt bắn tỉa 4 mục tiêu quan trọng nhất trên bàn cờ!',
    emblemSvg: `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M12 10H52V32C52 46 32 56 32 56C32 56 12 46 12 32V10Z" fill="#1D4ED8" stroke="#FBBF24" stroke-width="3.5"/><path d="M20 35C25 24 32 20 32 20C32 20 39 24 44 35L32 30L20 35Z" fill="#BAE6FD"/></svg>`
  },
  hufflepuff: {
    id: 'hufflepuff',
    name: 'Hufflepuff',
    vnTitle: 'Nhà Lửng Vàng',
    traits: 'Trung Thành • Kiên Nhẫn • Chân Thật',
    primary: '#d97706',
    secondary: '#422006',
    gradient: 'linear-gradient(135deg, #92400e 0%, #d97706 60%, #fde047 100%)',
    quote: '“Có thể ngươi thuộc Hufflepuff, nơi của những tấm lòng trung hậu, kiên trì và chẳng ngại gian lao!”',
    patronusName: 'Lửng Vàng',
    patronusEmoji: '🦡',
    passiveTitle: 'Phúc Lành Bền Bỉ',
    passiveDesc: 'Vào trận có sẵn 25% Nộ Hộ Mệnh, +12% điểm ghép kẹo & +5 G khi đạt 3 Sao.',
    activeDesc: 'Tặng ngay +2 Lượt Đi Miễn Phí (lùi +2 nhịp Bom) & hóa phép 3 viên kẹo thành Kẹo Sọc / Bọc / Tầm Thủ!',
    emblemSvg: `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M12 10H52V32C52 46 32 56 32 56C32 56 12 46 12 32V10Z" fill="#D97706" stroke="#FEF08A" stroke-width="3.5"/><path d="M23 23L32 18L41 23V35L32 42L23 35V23Z" fill="#422006" stroke="#FEF08A" stroke-width="2.5"/></svg>`
  }
};

// Bộ 6 Viên Kẹo Phép Thuật: 5 Kẹo Đậu Đủ Vị Bertie Bott + Ếch Sô-cô-la!
export const TILE_TYPES = [
  {
    id: 0,
    key: 'bertie_red',
    name: 'Kẹo Đậu Đỏ Bertie',
    shortName: 'Đậu Đỏ',
    color: '#e6192e',
    light: '#ff6b7a',
    dark: '#9e0014',
    img: '/assets/candy-0.png',
    svg: `<img src="/assets/candy-0.png" alt="Kẹo Đậu Đỏ Bertie" draggable="false" />`
  },
  {
    id: 1,
    key: 'bertie_orange',
    name: 'Kẹo Đậu Cam Bí Ngô',
    shortName: 'Đậu Cam',
    color: '#ff7b00',
    light: '#ffb84d',
    dark: '#b85000',
    img: '/assets/candy-1.png',
    svg: `<img src="/assets/candy-1.png" alt="Kẹo Đậu Cam Bí Ngô" draggable="false" />`
  },
  {
    id: 2,
    key: 'bertie_green',
    name: 'Kẹo Đậu Đôi Xanh Lá',
    shortName: 'Đậu Xanh Lá',
    color: '#1ec92a',
    light: '#74ff7d',
    dark: '#0a7d12',
    img: '/assets/candy-2.png',
    svg: `<img src="/assets/candy-2.png" alt="Kẹo Đậu Đôi Xanh Lá" draggable="false" />`
  },
  {
    id: 3,
    key: 'bertie_blue',
    name: 'Kẹo Đậu Lam Việt Quất',
    shortName: 'Đậu Lam',
    color: '#0ea5e9',
    light: '#7dd3fc',
    dark: '#035fa3',
    img: '/assets/candy-3.png',
    svg: `<img src="/assets/candy-3.png" alt="Kẹo Đậu Lam Việt Quất" draggable="false" />`
  },
  {
    id: 4,
    key: 'chocolate_frog',
    name: 'Ếch Sô-cô-la',
    shortName: 'Ếch Sô-cô-la',
    color: '#9333ea',
    light: '#f5b041',
    dark: '#5b2c06',
    img: '/assets/candy-4.png',
    svg: `<img src="/assets/candy-4.png" alt="Ếch Sô-cô-la" draggable="false" />`
  },
  {
    id: 5,
    key: 'bertie_yellow',
    name: 'Kẹo Đậu Vàng Chanh Sủi',
    shortName: 'Đậu Vàng',
    color: '#ffc400',
    light: '#fff066',
    dark: '#b88600',
    img: '/assets/candy-5.png',
    svg: `<img src="/assets/candy-5.png" alt="Kẹo Đậu Vàng Chanh Sủi" draggable="false" />`
  }
];

export const OBSTACLE_ICONS = {
  jelly: `<svg viewBox="0 0 44 44" aria-hidden="true"><rect x="4" y="4" width="36" height="36" rx="10" fill="rgba(126, 34, 206, 0.72)" stroke="#e9d5ff" stroke-width="3"/><path d="M11 13C15 9 25 9 31 13" stroke="#f3e8ff" stroke-width="3" stroke-linecap="round"/></svg>`,
  ice: `<svg viewBox="0 0 44 44" aria-hidden="true"><rect x="4" y="4" width="36" height="36" rx="9" fill="rgba(14, 116, 144, 0.62)" stroke="#bae6fd" stroke-width="3.2"/><path d="M9 9L35 35M35 9L9 35" stroke="#e0f2fe" stroke-width="3.2" stroke-linecap="round"/></svg>`,
  frosting: `<svg viewBox="0 0 44 44" aria-hidden="true"><rect x="4" y="4" width="36" height="36" rx="10" fill="#475569" stroke="#f8fafc" stroke-width="3"/><path d="M13 22H31M22 13V31" stroke="#fde047" stroke-width="3" stroke-linecap="round"/><circle cx="22" cy="22" r="5" fill="#cbd5e1"/></svg>`,
  chocolate: `<svg viewBox="0 0 44 44" aria-hidden="true"><rect x="4" y="4" width="36" height="36" rx="10" fill="#3e1b0b" stroke="#f59e0b" stroke-width="2.8"/><rect x="10" y="10" width="10" height="10" rx="2" fill="#5c2810"/><rect x="24" y="10" width="10" height="10" rx="2" fill="#5c2810"/><rect x="10" y="24" width="10" height="10" rx="2" fill="#5c2810"/><rect x="24" y="24" width="10" height="10" rx="2" fill="#5c2810"/></svg>`,
  swirl: `<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="17" fill="#1e1b4b" stroke="#e2e8f0" stroke-width="3"/><path d="M22 22C22 17 28 17 28 22C28 29 15 29 15 21C15 12 32 12 32 23" fill="none" stroke="#fde047" stroke-width="3" stroke-linecap="round"/></svg>`,
  ingredient: `<svg viewBox="0 0 44 44" aria-hidden="true"><polygon points="22,3 38,16 32,39 12,39 6,16" fill="#dc2626" stroke="#fde047" stroke-width="3"/><polygon points="22,8 31,18 22,33 13,18" fill="#fca5a5" opacity="0.65"/></svg>`,
  cauldron: `<svg viewBox="0 0 44 44" aria-hidden="true"><ellipse cx="22" cy="13" rx="13" ry="5" fill="#10b981" stroke="#fde047" stroke-width="2.4"/><path d="M8 15H36L33 34C32 38 28 40 22 40C16 40 12 38 11 34L8 15Z" fill="#1e1b4b" stroke="#c084fc" stroke-width="2.6"/><circle cx="18" cy="11" r="2.5" fill="#bef264"/><circle cx="26" cy="9" r="2" fill="#bef264"/></svg>`,
  key_lock: `<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M14 19V13C14 8.5 17.5 5 22 5C26.5 5 30 8.5 30 13V19" fill="none" stroke="#fde047" stroke-width="3.6" stroke-linecap="round"/><rect x="9" y="18" width="26" height="21" rx="6" fill="#92400e" stroke="#fde047" stroke-width="2.8"/><circle cx="22" cy="27" r="3" fill="#fef08a"/><path d="M22 30V34" stroke="#fef08a" stroke-width="2.8" stroke-linecap="round"/></svg>`,
  conveyor: `<svg viewBox="0 0 44 44" aria-hidden="true"><rect x="4" y="12" width="36" height="20" rx="10" fill="#1e293b" stroke="#fbbf24" stroke-width="2.8"/><path d="M14 18L20 22L14 26M24 18L30 22L24 26" fill="none" stroke="#fde047" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  boss: `<svg viewBox="0 0 44 44" aria-hidden="true"><polygon points="22,3 39,13 35,35 22,41 9,35 5,13" fill="#581c87" stroke="#fde047" stroke-width="2.8"/><path d="M15 19L20 23M29 19L24 23" stroke="#f87171" stroke-width="3" stroke-linecap="round"/><path d="M16 31C19 28 25 28 28 31" stroke="#fde047" stroke-width="2.6" stroke-linecap="round"/></svg>`,
  score: `<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M22 4L27.5 15.5L40 17.3L31 26.1L33.1 38.5L22 32.6L10.9 38.5L13 26.1L4 17.3L16.5 15.5L22 4Z" fill="#f59e0b" stroke="#fef9c3" stroke-width="2.6"/></svg>`,
  special_striped: `<img src="/assets/candy-0-sh.png" alt="Kẹo Sọc Phép" draggable="false" />`,
  special_wrapped: `<img src="/assets/candy-2-wrapped.png" alt="Gói Kẹo Bọc" draggable="false" />`,
  special_color_bomb: `<img src="/assets/candy-colorbomb.png" alt="Cầu Đậu Ngũ Sắc" draggable="false" />`,
  special_seeker: `<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M3 16C10 10 15 14 17 20C11 22 6 21 3 16Z" fill="#fde047"/><path d="M41 16C34 10 29 14 27 20C33 22 38 21 41 16Z" fill="#fde047"/><circle cx="22" cy="23" r="10" fill="#f59e0b" stroke="#fef9c3" stroke-width="2.5"/></svg>`
};

// Danh sách 10 Đại Trùm canh giữ các Màn 10, 20, 30, ..., 100 của Season 1
export const BOSS_ROSTER = {
  10: {
    levelId: 10,
    name: 'Đàn Cú Phép Đường Privet',
    shortTitle: 'Đàn Cú Phép',
    emoji: '🦉',
    maxHp: 900,
    castInterval: 4,
    hexType: 'swirl',
    hexName: 'Thả Thư Xoáy Cam Thảo'
  },
  20: {
    levelId: 20,
    name: 'Người Giữ Khoá Rubeus',
    shortTitle: 'Người Giữ Khoá',
    emoji: '🔑',
    maxHp: 1120,
    castInterval: 4,
    hexType: 'ice',
    hexName: 'Gió Bão Đóng Băng'
  },
  30: {
    levelId: 30,
    name: 'Rồng Lửa Hầm Gringotts',
    shortTitle: 'Rồng Gringotts',
    emoji: '🐉',
    maxHp: 1280,
    castInterval: 4,
    hexType: 'swirl',
    hexName: 'Khói Đá Hầm Sâu'
  },
  40: {
    levelId: 40,
    name: 'Ảo Ảnh Đũa Phép Song Sinh',
    shortTitle: 'Đũa Song Sinh',
    emoji: '⚡',
    maxHp: 1440,
    castInterval: 4,
    hexType: 'ice',
    hexName: 'Tia Phép Phong Băng'
  },
  50: {
    levelId: 50,
    name: 'Nam Tước Đẫm Máu',
    shortTitle: 'Nam Tước Ma',
    emoji: '🕯️',
    maxHp: 1580,
    castInterval: 4,
    hexType: 'chocolate',
    hexName: 'Bóng Đêm Sô-cô-la'
  },
  60: {
    levelId: 60,
    name: 'Quỷ Khổng Lồ Núi',
    shortTitle: 'Quỷ Khổng Lồ',
    emoji: '🧌',
    maxHp: 1720,
    castInterval: 4,
    hexType: 'swirl',
    hexName: 'Chùy Gỗ Nện Bàn'
  },
  70: {
    levelId: 70,
    name: 'Hồn Ma Khu Cấm Thư Viện',
    shortTitle: 'Ma Cấm Thư',
    emoji: '📜',
    maxHp: 1850,
    castInterval: 4,
    hexType: 'ice',
    hexName: 'Hơi Lạnh Cấm Thư'
  },
  80: {
    levelId: 80,
    name: 'Bóng Đen Rừng Cấm',
    shortTitle: 'Bóng Đen Rừng Cấm',
    emoji: '🌑',
    maxHp: 1980,
    castInterval: 4,
    hexType: 'chocolate',
    hexName: 'Lời Nguyền Bóng Tối'
  },
  90: {
    levelId: 90,
    name: 'Hoàng Hậu Cờ Phù Thủy',
    shortTitle: 'Hậu Cờ Phép',
    emoji: '♟️',
    maxHp: 2100,
    castInterval: 4,
    hexType: 'ice',
    hexName: 'Chiếu Tướng Băng Giá'
  },
  100: {
    levelId: 100,
    name: 'Chúa Tể Voldemort & Quirrell',
    shortTitle: 'Chúa Tể Voldemort',
    emoji: '🐍',
    maxHp: 2280,
    castInterval: 4,
    hexType: 'dark_curse',
    hexName: 'Bùa Chú Hắc Ám'
  }
};

function makePentagonCardSvg(bgTop, bgBot, accent, innerMarkup) {
  return `<svg class="frog-card-art" viewBox="0 0 88 88" fill="none" aria-hidden="true"><defs><linearGradient id="fg_${bgTop.slice(1)}_${bgBot.slice(1)}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bgTop}"/><stop offset="100%" stop-color="${bgBot}"/></linearGradient></defs><polygon points="44,5 81,31 67,79 21,79 7,31" fill="url(#fg_${bgTop.slice(1)}_${bgBot.slice(1)})" stroke="#fde047" stroke-width="3.6"/><polygon points="44,11 75,33 63,73 25,73 13,33" fill="none" stroke="${accent}" stroke-width="1.6" opacity="0.72"/>${innerMarkup}</svg>`;
}

export const FROG_CARD_LOCKED_SVG = makePentagonCardSvg(
  '#1e293b',
  '#090d1a',
  '#64748b',
  `<text x="44" y="54" text-anchor="middle" fill="#64748b" font-family="Fredoka, sans-serif" font-size="28" font-weight="700">?</text>`
);

// Bộ Sưu Tập 12 Thẻ Ếch Sô-cô-la Danh Nhân Phù Thủy (cộng chỉ số vĩnh viễn cho Hồ sơ)
export const CHOCOLATE_FROG_CARDS = [
  {
    id: 'card_dumbledore',
    number: '#01',
    name: 'Albus Dumbledore',
    rarity: 'Huyền Thoại',
    buffType: 'score_pct',
    buffValue: 4,
    buffLabel: '+4% Điểm Kẹo Phép vĩnh viễn',
    lore: 'Hiệu trưởng Hogwarts lừng danh, người khám phá 12 công dụng của máu rồng.',
    portraitSvg: makePentagonCardSvg(
      '#7e22ce',
      '#1e1b4b',
      '#fde047',
      `<path d="M44 21L49 35L64 36L52 45L56 60L44 51L32 60L36 45L24 36L39 35Z" fill="#fde047"/>`
    )
  },
  {
    id: 'card_merlin',
    number: '#02',
    name: 'Đại Pháp Sư Merlin',
    rarity: 'Huyền Thoại',
    buffType: 'patronus_pct',
    buffValue: 8,
    buffLabel: '+8% Tốc độ nạp Nộ Thần Hộ Mệnh',
    lore: 'Phù thủy vĩ đại nhất lịch sử Trung Cổ, người sáng lập Huân chương Merlin.',
    portraitSvg: makePentagonCardSvg(
      '#047857',
      '#022c22',
      '#a7f3d0',
      `<circle cx="44" cy="44" r="15" stroke="#fde047" stroke-width="3"/><path d="M44 23V65M23 44H65" stroke="#6ee7b7" stroke-width="2.8" stroke-linecap="round"/>`
    )
  },
  {
    id: 'card_flamel',
    number: '#03',
    name: 'Nicolas Flamel',
    rarity: 'Huyền Thoại',
    buffType: 'shop_discount',
    buffValue: 4,
    buffLabel: '-4% Giá mua Bảo Bối & Bùa Đầu Trận',
    lore: 'Nhà giả kim duy nhất chế tạo thành công Hòn Đá Phù Thủy trường sinh.',
    portraitSvg: makePentagonCardSvg(
      '#991b1b',
      '#450a0a',
      '#fca5a5',
      `<polygon points="44,22 60,36 53,61 35,61 28,36" fill="#ef4444" stroke="#fde047" stroke-width="2.6"/>`
    )
  },
  {
    id: 'card_founders',
    number: '#04',
    name: 'Bốn Nhà Sáng Lập',
    rarity: 'Huyền Thoại',
    buffType: 'score_pct',
    buffValue: 5,
    buffLabel: '+5% Điểm Kẹo Phép vĩnh viễn',
    lore: 'Godric, Helga, Rowena và Salazar — bốn bậc thầy khai sinh mái trường Hogwarts.',
    portraitSvg: makePentagonCardSvg(
      '#b45309',
      '#3b0764',
      '#fef08a',
      `<rect x="28" y="28" width="14" height="14" rx="3" fill="#dc2626"/><rect x="46" y="28" width="14" height="14" rx="3" fill="#10b981"/><rect x="28" y="46" width="14" height="14" rx="3" fill="#0284c7"/><rect x="46" y="46" width="14" height="14" rx="3" fill="#f59e0b"/>`
    )
  },
  {
    id: 'card_harry',
    number: '#05',
    name: 'Harry Potter',
    rarity: 'Sử Thi',
    buffType: 'score_pct',
    buffValue: 3,
    buffLabel: '+3% Điểm Kẹo Phép vĩnh viễn',
    lore: 'Cậu Bé Sống Sót và Tầm Thủ trẻ tuổi nhất thế kỷ của Đội Quidditch Gryffindor.',
    portraitSvg: makePentagonCardSvg(
      '#b91c1c',
      '#450a0a',
      '#fde047',
      `<path d="M47 21L36 42H46L39 62L55 39H44L47 21Z" fill="#fde047"/>`
    )
  },
  {
    id: 'card_hermione',
    number: '#06',
    name: 'Hermione Granger',
    rarity: 'Sử Thi',
    buffType: 'patronus_pct',
    buffValue: 6,
    buffLabel: '+6% Tốc độ nạp Nộ Thần Hộ Mệnh',
    lore: 'Phù thủy xuất sắc nhất khóa học, giải mã câu đố Bảy Bình Độc Dược của Snape.',
    portraitSvg: makePentagonCardSvg(
      '#1d4ed8',
      '#1e1b4b',
      '#bae6fd',
      `<rect x="28" y="26" width="32" height="36" rx="4" fill="#fde047"/><path d="M44 26V62M33 35H40M33 43H40" stroke="#1e1b4b" stroke-width="2.5" stroke-linecap="round"/>`
    )
  },
  {
    id: 'card_ron',
    number: '#07',
    name: 'Ron Weasley',
    rarity: 'Sử Thi',
    buffType: 'shop_discount',
    buffValue: 3,
    buffLabel: '-3% Giá mua Bảo Bối & Bùa Đầu Trận',
    lore: 'Kỵ sĩ cờ phép quả cảm đã điều khiển ván Cờ Phù Thủy Khổng Lồ đi tới chiến thắng.',
    portraitSvg: makePentagonCardSvg(
      '#c2410c',
      '#431407',
      '#fed7aa',
      `<path d="M31 58H57L53 45L58 34L46 25L34 31L37 43L31 58Z" fill="#fde047"/>`
    )
  },
  {
    id: 'card_mcgonagall',
    number: '#08',
    name: 'Minerva McGonagall',
    rarity: 'Sử Thi',
    buffType: 'clear_galleons',
    buffValue: 3,
    buffLabel: '+3 Vàng Galleon mỗi khi thắng màn',
    lore: 'Bậc thầy Biến Hình Hóa Thú nghiêm khắc nhưng hết lòng vì học trò Hogwarts.',
    portraitSvg: makePentagonCardSvg(
      '#0f766e',
      '#042f2e',
      '#99f6e4',
      `<polygon points="44,21 63,53 25,53" fill="#fde047"/><rect x="22" y="53" width="44" height="6" rx="3" fill="#f59e0b"/>`
    )
  },
  {
    id: 'card_snape',
    number: '#09',
    name: 'Severus Snape',
    rarity: 'Sử Thi',
    buffType: 'shop_discount',
    buffValue: 3,
    buffLabel: '-3% Giá mua Bảo Bối & Bùa Đầu Trận',
    lore: 'Bậc thầy Độc Dược tài ba âm thầm bảo vệ Harry ngay từ trận Quidditch đầu tiên.',
    portraitSvg: makePentagonCardSvg(
      '#312e81',
      '#090d1a',
      '#c084fc',
      `<path d="M39 24H49V33L58 53C59 57 56 61 51 61H37C32 61 29 57 30 53L39 33V24Z" fill="#10b981" stroke="#fde047" stroke-width="2.4"/>`
    )
  },
  {
    id: 'card_newt',
    number: '#10',
    name: 'Newt Scamander',
    rarity: 'Sử Thi',
    buffType: 'clear_galleons',
    buffValue: 3,
    buffLabel: '+3 Vàng Galleon mỗi khi thắng màn',
    lore: 'Tác giả Sinh Vật Huyền Bí và Nơi Tìm Ra Chúng, niềm tự hào của Nhà Hufflepuff.',
    portraitSvg: makePentagonCardSvg(
      '#a16207',
      '#422006',
      '#fef08a',
      `<rect x="26" y="33" width="36" height="26" rx="5" fill="#f59e0b" stroke="#fef9c3" stroke-width="2.4"/><path d="M37 33V28H51V33" stroke="#fef9c3" stroke-width="2.6"/>`
    )
  },
  {
    id: 'card_luna',
    number: '#11',
    name: 'Luna Lovegood',
    rarity: 'Sử Thi',
    buffType: 'patronus_pct',
    buffValue: 6,
    buffLabel: '+6% Tốc độ nạp Nộ Thần Hộ Mệnh',
    lore: 'Tâm hồn tự do sáng suốt của Nhà Ravenclaw với cặp kính Thực Tức độc nhất vô nhị.',
    portraitSvg: makePentagonCardSvg(
      '#0369a1',
      '#172554',
      '#f0abfc',
      `<circle cx="34" cy="45" r="10" fill="#f472b6" stroke="#fde047" stroke-width="2.5"/><circle cx="54" cy="45" r="10" fill="#38bdf8" stroke="#fde047" stroke-width="2.5"/><path d="M44 45H44.1" stroke="#fde047" stroke-width="4" stroke-linecap="round"/>`
    )
  },
  {
    id: 'card_sirius',
    number: '#12',
    name: 'Sirius Black',
    rarity: 'Sử Thi',
    buffType: 'clear_galleons',
    buffValue: 4,
    buffLabel: '+4 Vàng Galleon mỗi khi thắng màn',
    lore: 'Người cha đỡ đầu trung nghĩa, chủ nhân chiếc môtô bay đưa Harry tới đường Privet.',
    portraitSvg: makePentagonCardSvg(
      '#334155',
      '#090d1a',
      '#e2e8f0',
      `<path d="M44 20L48 37L65 44L48 51L44 68L40 51L23 44L40 37Z" fill="#e2e8f0"/>`
    )
  }
];

// 3 Mốc Rương Sao Chương chuẩn Candy Crush Saga (tối đa 60 Sao mỗi Chương 20 màn)
export const CHAPTER_STAR_CHESTS = [
  {
    threshold: 20,
    tierName: 'Rương Đồng',
    galleons: 80,
    boosterId: 'hammer',
    preBoosterId: null,
    grantFrogCard: false,
    summary: '+80 G & +1 Búa Đũa Phép'
  },
  {
    threshold: 40,
    tierName: 'Rương Bạc',
    galleons: 150,
    boosterId: 'swap',
    preBoosterId: 'pre_color_bomb',
    grantFrogCard: false,
    summary: '+150 G, +1 Đũa Đổi Kẹo & +1 Cầu Đậu Đầu Trận'
  },
  {
    threshold: 60,
    tierName: 'Rương Vàng',
    galleons: 300,
    boosterId: 'extraMoves',
    preBoosterId: null,
    grantFrogCard: true,
    summary: '+300 G, +1 Kẹo +5 Lượt & +1 Thẻ Ếch Danh Nhân!'
  }
];

// 4 Bảo Bối dùng trực tiếp TRONG trận đấu (In-Game Boosters)
export const BOOSTERS = [
  {
    id: 'hammer',
    name: 'Búa Kẹo Đũa Phép',
    shortName: 'Búa Đũa Phép',
    desc: 'Vung Búa Kẹo Đũa Phép đập vỡ ngay 1 viên kẹo, gỡ Bom hoặc phá 1 lớp Đá/Vạc/Khoá/Băng không tốn lượt!',
    price: 90,
    iconSvg: `<img src="/assets/booster-lollipop.png" alt="Búa Kẹo Đũa Phép" draggable="false" />`
  },
  {
    id: 'swap',
    name: 'Đũa Phép Đổi Kẹo',
    shortName: 'Đổi Tự Do',
    desc: 'Vẫy đũa phép hoán đổi tự do 2 viên Kẹo Bertie hoặc Ếch Sô-cô-la liền kề không tốn lượt đi.',
    price: 110,
    iconSvg: `<img src="/assets/booster-swap.png" alt="Đũa Phép Đổi Kẹo" draggable="false" />`
  },
  {
    id: 'shuffle',
    name: 'Kẹo Xoáy Thời Gian',
    shortName: 'Xoáy Kẹo',
    desc: 'Xoay Đồng Hồ Cát Đường Vàng xáo trộn toàn bộ kẹo trên bàn cờ để mở chuỗi Combo mới!',
    price: 80,
    iconSvg: `<img src="/assets/booster-shuffle.png" alt="Kẹo Xoáy Thời Gian" draggable="false" />`
  },
  {
    id: 'extraMoves',
    name: 'Kẹo Phúc Lạc +5',
    shortName: '+5 Lượt',
    desc: 'Nhấp mật kẹo vàng Phúc Lạc Dược cộng ngay +5 lượt đi (và lùi +5 nhịp Bom Đếm Ngược)!',
    price: 140,
    iconSvg: `<img src="/assets/booster-extramoves.png" alt="Kẹo Phúc Lạc +5" draggable="false" />`
  }
];

// 3 Bùa Trợ Giúp chọn TRƯỚC khi vào màn (Pre-Game Boosters chuẩn Candy Crush Saga)
export const PREGAME_BOOSTERS = [
  {
    id: 'pre_color_bomb',
    name: 'Cầu Đậu Đầu Trận',
    shortName: 'Cầu Ngũ Sắc',
    desc: 'Đặt sẵn 1 Cầu Sô-cô-la Đính Đậu Đủ Vị ngay khi mở bàn cờ!',
    price: 95,
    iconSvg: `<img src="/assets/candy-colorbomb.png" alt="Cầu Đậu Đầu Trận" draggable="false" />`
  },
  {
    id: 'pre_striped_wrapped',
    name: 'Cặp Sọc & Bọc',
    shortName: 'Sọc + Bọc',
    desc: 'Đặt sẵn 1 Kẹo Sọc + 1 Gói Kẹo Bọc Giấy nổ 2 nhịp ngay lượt đầu!',
    price: 85,
    iconSvg: `<img src="/assets/candy-0-wrapped.png" alt="Cặp Sọc và Bọc" draggable="false" />`
  },
  {
    id: 'pre_lucky_seeker',
    name: 'Cánh Vàng Tầm Thủ',
    shortName: '2 Kẹo Tầm Thủ',
    desc: 'Triệu hồi sẵn 2 Kẹo Cánh Vàng Snitch (2×2) tự động lao thẳng vào ô mục tiêu!',
    price: 75,
    iconSvg: OBSTACLE_ICONS.special_seeker
  }
];

// 8 Ô Phần Thưởng trên Vòng Quay Phép Thuật Công Tước Mật Hàng Ngày
export const DAILY_WHEEL_SEGMENTS = [
  { id: 'w_g60', label: '+60 G', fullName: '+60 Vàng Galleon', rewardType: 'galleons', amount: 60, color: '#7f1d1d' },
  { id: 'w_hammer', label: 'Búa Kẹo', fullName: '+1 Búa Kẹo Đũa Phép', rewardType: 'booster', itemId: 'hammer', amount: 1, color: '#1e3a8a' },
  { id: 'w_g120', label: '+120 G', fullName: '+120 Vàng Galleon', rewardType: 'galleons', amount: 120, color: '#065f46' },
  { id: 'w_pre_cb', label: 'Cầu Đậu', fullName: '+1 Cầu Đậu Đầu Trận', rewardType: 'preBooster', itemId: 'pre_color_bomb', amount: 1, color: '#581c87' },
  { id: 'w_hearts', label: 'Đầy 5 Tim', fullName: 'Hồi Đầy 5 Tim Phép Thuật', rewardType: 'hearts_full', amount: 5, color: '#991b1b' },
  { id: 'w_shuffle', label: 'Xoáy Kẹo', fullName: '+1 Kẹo Xoáy Thời Gian', rewardType: 'booster', itemId: 'shuffle', amount: 1, color: '#78350f' },
  { id: 'w_swap', label: 'Đổi Kẹo', fullName: '+1 Đũa Phép Đổi Kẹo', rewardType: 'booster', itemId: 'swap', amount: 1, color: '#155e75' },
  { id: 'w_jackpot', label: '★ 250 G', fullName: 'ĐẠI THƯỞNG +250 VÀNG GALLEON!', rewardType: 'galleons', amount: 250, color: '#b45309' }
];

export const COMBO_PRAISES = [
  'Sweet! • Ngọt Ngào!',
  'Tasty! • Tuyệt Hảo!',
  'Delicious! • Xuất Thần!',
  'Divine! • Thần Sầu!',
  'Bertie Crush!'
];

export const VOICE_CALLOUTS = ['Sweet!', 'Tasty!', 'Delicious!', 'Divine!', 'Sugar Crush!'];

export const SEASON_1_CHAPTERS = [
  {
    id: 1,
    range: [1, 20],
    title: 'Chương 1: Đêm Cú Bay Đường Privet',
    subtitle: 'Màn 1 – 20 • Ghép 2×2 Cánh Vàng Tầm Thủ, Thả Đá Phù Thủy, Đá Cổ Ngữ & Đấu Trùm',
    themeBg: 'linear-gradient(180deg, rgba(69, 10, 18, 0.94) 0%, rgba(20, 12, 28, 0.96) 100%)',
    borderColor: '#d97706'
  },
  {
    id: 2,
    range: [21, 40],
    title: 'Chương 2: Hẻm Xéo Đêm Sương & Hầm Ngục Gringotts',
    subtitle: 'Màn 21 – 40 • Băng Azkaban, Chìa Khoá Mở Hầm Gringotts, Xoáy Cam Thảo & Đơn Hàng Kẹo',
    themeBg: 'linear-gradient(180deg, rgba(66, 32, 6, 0.94) 0%, rgba(18, 16, 28, 0.96) 100%)',
    borderColor: '#d97706'
  },
  {
    id: 3,
    range: [41, 60],
    title: 'Chương 3: Tàu Tốc Hành Đêm Trăng & Mặt Hồ Đen',
    subtitle: 'Màn 41 – 60 • Băng Chuyền Cầu Thang, Sô-cô-la Tự Lan, Lò Sưởi Floo & Vạc Độc Dược',
    themeBg: 'linear-gradient(180deg, rgba(23, 37, 84, 0.94) 0%, rgba(12, 18, 36, 0.96) 100%)',
    borderColor: '#d97706'
  },
  {
    id: 4,
    range: [61, 80],
    title: 'Chương 4: Rừng Cấm Đêm Khuya & Bóng Đen Bí Ẩn',
    subtitle: 'Màn 61 – 80 • Bom Đếm Ngược, Vạc Sôi Sục, Chìa Khoá Cổ & Thần Hộ Mệnh Giải Cứu',
    themeBg: 'linear-gradient(180deg, rgba(6, 62, 48, 0.94) 0%, rgba(10, 20, 26, 0.96) 100%)',
    borderColor: '#d97706'
  },
  {
    id: 5,
    range: [81, 100],
    title: 'Chương 5: Cửa Sập Ba Đầu & Hầm Đá Phù Thủy',
    subtitle: 'Màn 81 – 100 • Đại Chiến Chúa Tể Voldemort & Trọn Bộ Cơ Chế Đỉnh Cao Tranh Cúp 4 Nhà!',
    themeBg: 'linear-gradient(180deg, rgba(59, 7, 100, 0.94) 0%, rgba(15, 10, 30, 0.96) 100%)',
    borderColor: '#d97706'
  }
];
