// Dữ liệu Kẹo Phép Thuật Harry Potter × Candy Crush (7 Năm Học Hogwarts = 7.777 Màn,
// Kẹo Đậu Đủ Vị Bertie Bott, 21 Thẻ Ếch Sô-cô-la, Tinh Thông Đũa Phép, Thần Hộ Mệnh & Đại Trùm 7 Năm)

export const TOTAL_SEASONS = 7;
export const LEVELS_PER_SEASON = 1111;
export const TOTAL_LEVELS = TOTAL_SEASONS * LEVELS_PER_SEASON; // 7.777 màn
export const CHAPTERS_PER_SEASON = 11;
export const TOTAL_CHAPTERS = TOTAL_SEASONS * CHAPTERS_PER_SEASON; // 77 chương
export const MAX_TOTAL_STARS = TOTAL_LEVELS * 3; // 23.331 sao

export const HOGWARTS_SEASONS = [
  {
    id: 1,
    yearLabel: 'Năm 1',
    title: 'Hòn Đá Phù Thủy',
    fullTitle: 'Năm 1: Hòn Đá Phù Thủy',
    range: [1, 1111],
    examLevelId: null,
    finaleLevelId: 1111,
    signatureKey: 'core',
    signatureIcon: '💎',
    signatureName: 'Cửa Sập Ba Đầu & Đá Cổ Ngữ',
    signatureDesc: 'Nền tảng phép thuật tăng tốc độ khó: 6 màu kẹo sớm, Băng Azkaban, Vạc Độc Dược, Khoá Gringotts & Trùm 2 Pha.',
    accentColor: '#d97706',
    themeBg: 'linear-gradient(180deg, rgba(69, 10, 18, 0.94) 0%, rgba(18, 12, 28, 0.96) 100%)'
  },
  {
    id: 2,
    yearLabel: 'Năm 2',
    title: 'Phòng Chứa Bí Mật',
    fullTitle: 'Năm 2: Phòng Chứa Bí Mật',
    range: [1112, 2222],
    examLevelId: 1112,
    finaleLevelId: 2222,
    signatureKey: 'petrify',
    signatureIcon: '🐍',
    signatureName: 'Hoá Đá Tử Xà (1–3 lớp)',
    signatureDesc: 'Ánh nhìn Tử Xà hoá đá viên kẹo khiến nó không thể đổi chỗ, rơi hay ghép màu cho tới khi nứt vỏ đá bởi ghép cạnh bên hoặc Kẹo Phép!',
    accentColor: '#10b981',
    themeBg: 'linear-gradient(180deg, rgba(6, 62, 43, 0.94) 0%, rgba(10, 20, 26, 0.96) 100%)'
  },
  {
    id: 3,
    yearLabel: 'Năm 3',
    title: 'Tên Tù Nhân Ngục Azkaban',
    fullTitle: 'Năm 3: Tên Tù Nhân Ngục Azkaban',
    range: [2223, 3333],
    examLevelId: 2223,
    finaleLevelId: 3333,
    signatureKey: 'dementor',
    signatureIcon: '👻',
    signatureName: 'Giám Ngục Hút Nộ (2–4 HP)',
    signatureDesc: 'Giám Ngục đứng chặn ô, hút Nộ Hộ Mệnh mỗi lượt và phả sương băng sau 3 lượt. Gọi Thần Hộ Mệnh (Phím P) sẽ thanh tẩy tức khắc mọi Giám Ngục!',
    accentColor: '#38bdf8',
    themeBg: 'linear-gradient(180deg, rgba(15, 35, 66, 0.94) 0%, rgba(9, 14, 28, 0.96) 100%)'
  },
  {
    id: 4,
    yearLabel: 'Năm 4',
    title: 'Chiếc Cốc Lửa',
    fullTitle: 'Năm 4: Chiếc Cốc Lửa',
    range: [3334, 4444],
    examLevelId: 3334,
    finaleLevelId: 4444,
    signatureKey: 'maze',
    signatureIcon: '🌪️',
    signatureName: 'Gió Lốc Mê Cung & Khay 10×10',
    signatureDesc: 'Mở khoá đại bàn cờ 10×10! Cứ mỗi 3 lượt, Gió Lốc Mê Cung Tam Pháp Thuật tự cuốn dịch chuyển hàng kẹo tạo biến số chiến thuật.',
    accentColor: '#f59e0b',
    themeBg: 'linear-gradient(180deg, rgba(66, 32, 6, 0.94) 0%, rgba(16, 14, 28, 0.96) 100%)'
  },
  {
    id: 5,
    yearLabel: 'Năm 5',
    title: 'Hội Phượng Hoàng',
    fullTitle: 'Năm 5: Hội Phượng Hoàng',
    range: [4445, 5555],
    examLevelId: 4445,
    finaleLevelId: 5555,
    signatureKey: 'decree',
    signatureIcon: '📜',
    signatureName: 'Bia Sắc Lệnh Umbridge (2–4 HP)',
    signatureDesc: 'Bia Sắc Lệnh Hồng toả vùng cấm phép 3×3: ghép 4, 5 hay chữ T/L sát bia sẽ chỉ nổ thường mà không kết tinh Kẹo Phép cho đến khi đập vỡ bia!',
    accentColor: '#ec4899',
    themeBg: 'linear-gradient(180deg, rgba(74, 14, 46, 0.94) 0%, rgba(16, 11, 28, 0.96) 100%)'
  },
  {
    id: 6,
    yearLabel: 'Năm 6',
    title: 'Hoàng Tử Lai',
    fullTitle: 'Năm 6: Hoàng Tử Lai',
    range: [5556, 6666],
    examLevelId: 5556,
    finaleLevelId: 6666,
    signatureKey: 'fiendfyre',
    signatureIcon: '🔥',
    signatureName: 'Lửa Địa Ngục Fiendfyre (2 HP)',
    signatureDesc: 'Ngọn lửa hắc ám bất kham tự bùng lan thêm ô mới sau mỗi 2 lượt không bị dập và nung ngắn ngòi nổ Bom Đếm Ngược đứng gần!',
    accentColor: '#f97316',
    themeBg: 'linear-gradient(180deg, rgba(67, 20, 7, 0.94) 0%, rgba(14, 16, 28, 0.96) 100%)'
  },
  {
    id: 7,
    yearLabel: 'Năm 7',
    title: 'Bảo Bối Tử Thần',
    fullTitle: 'Năm 7: Bảo Bối Tử Thần',
    range: [6667, 7777],
    examLevelId: 6667,
    finaleLevelId: 7777,
    signatureKey: 'horcrux',
    signatureIcon: '💀',
    signatureName: 'Trường Sinh Linh Giá (4–5 HP)',
    signatureDesc: 'Khiên Hồn Tối Thượng (HP ≥ 4) miễn nhiễm ghép kẹo thường cạnh bên — bắt buộc dùng Kẹo Phép, Thần Hộ Mệnh hoặc Búa Đũa Phép phá khiên trước! Nổ vỡ trừ thẳng 600 HP Trùm!',
    accentColor: '#c084fc',
    themeBg: 'linear-gradient(180deg, rgba(46, 16, 101, 0.94) 0%, rgba(9, 10, 24, 0.97) 100%)'
  }
];

export function getSeasonByLevel(levelId) {
  const safe = Math.max(1, Math.min(TOTAL_LEVELS, Math.floor(Number(levelId) || 1)));
  const idx = Math.min(TOTAL_SEASONS - 1, Math.floor((safe - 1) / LEVELS_PER_SEASON));
  return HOGWARTS_SEASONS[idx];
}

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
    activeDesc: 'Thanh tẩy mọi Giám Ngục, Chữ Thập Ánh Bạc quét tâm bàn, xuyên Khiên Linh Giá & tặng 1 Kẹo Bọc + 1 Kẹo Sọc!',
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
    activeDesc: 'Thanh tẩy mọi Giám Ngục, phá tới 5 ô Vật Cản Hắc Ám / Khiên Linh Giá, lùi +3 nhịp Bom & kết tinh 1 Cầu Ngũ Sắc!',
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
    activeDesc: 'Thanh tẩy mọi Giám Ngục & triệu hồi 4 Cánh Vàng Snitch bắn tỉa thẳng vào Bom / Linh Giá / Mục tiêu quan trọng nhất!',
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
    activeDesc: 'Thanh tẩy mọi Giám Ngục, tặng ngay +2 Lượt Đi Miễn Phí (lùi +2 nhịp Bom) & hoá phép 3 Kẹo Sọc / Bọc / Tầm Thủ!',
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
  petrify: `<svg viewBox="0 0 44 44" aria-hidden="true"><rect x="4" y="4" width="36" height="36" rx="10" fill="#334155" stroke="#6ee7b7" stroke-width="2.8"/><path d="M15 30C15 23 29 21 29 14" stroke="#34d399" stroke-width="3.4" stroke-linecap="round"/><circle cx="29" cy="14" r="3" fill="#fde047"/><path d="M10 13L18 20M34 26L26 33" stroke="#cbd5e1" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  dementor: `<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M22 5C13 5 8 13 8 23L11 39L18 34L22 40L26 34L33 39L36 23C36 13 31 5 22 5Z" fill="#0f172a" stroke="#7dd3fc" stroke-width="2.6"/><ellipse cx="22" cy="18" rx="6" ry="7" fill="#020617" stroke="#38bdf8" stroke-width="1.8"/><circle cx="19.5" cy="17" r="1.5" fill="#bae6fd"/><circle cx="24.5" cy="17" r="1.5" fill="#bae6fd"/></svg>`,
  maze: `<svg viewBox="0 0 44 44" aria-hidden="true"><rect x="4" y="4" width="36" height="36" rx="10" fill="#064e3b" stroke="#fde047" stroke-width="2.6"/><path d="M11 16H29L25 12M33 28H15L19 32" fill="none" stroke="#6ee7b7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  decree: `<svg viewBox="0 0 44 44" aria-hidden="true"><rect x="6" y="4" width="32" height="36" rx="6" fill="#831843" stroke="#f9a8d4" stroke-width="2.8"/><rect x="11" y="9" width="22" height="26" rx="3" fill="none" stroke="#fde047" stroke-width="1.8"/><path d="M15 16H29M15 22H29M15 28H23" stroke="#fbcfe8" stroke-width="2.5" stroke-linecap="round"/><circle cx="28" cy="29" r="3.5" fill="#ec4899" stroke="#fde047" stroke-width="1.5"/></svg>`,
  fiendfyre: `<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M22 4C27 12 36 16 35 27C34 35 28 40 22 40C16 40 10 35 9 27C8 19 14 14 16 10C17 15 20 15 22 4Z" fill="#ea580c" stroke="#fde047" stroke-width="2.5"/><path d="M22 16C25 21 28 24 27 30C26 34 24 36 22 36C20 36 18 34 17 30C16 25 19 21 22 16Z" fill="#fef08a"/></svg>`,
  horcrux: `<svg viewBox="0 0 44 44" aria-hidden="true"><polygon points="22,3 38,14 34,36 22,41 10,36 6,14" fill="#1e1b4b" stroke="#fde047" stroke-width="2.8"/><polygon points="22,10 31,18 28,32 22,35 16,32 13,18" fill="#064e3b" stroke="#34d399" stroke-width="2"/><circle cx="22" cy="22" r="4.5" fill="#a855f7" stroke="#fef08a" stroke-width="1.8"/></svg>`,
  boss: `<svg viewBox="0 0 44 44" aria-hidden="true"><polygon points="22,3 39,13 35,35 22,41 9,35 5,13" fill="#581c87" stroke="#fde047" stroke-width="2.8"/><path d="M15 19L20 23M29 19L24 23" stroke="#f87171" stroke-width="3" stroke-linecap="round"/><path d="M16 31C19 28 25 28 28 31" stroke="#fde047" stroke-width="2.6" stroke-linecap="round"/></svg>`,
  score: `<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M22 4L27.5 15.5L40 17.3L31 26.1L33.1 38.5L22 32.6L10.9 38.5L13 26.1L4 17.3L16.5 15.5L22 4Z" fill="#f59e0b" stroke="#fef9c3" stroke-width="2.6"/></svg>`,
  special_striped: `<img src="/assets/candy-0-sh.png" alt="Kẹo Sọc Phép" draggable="false" />`,
  special_wrapped: `<img src="/assets/candy-2-wrapped.png" alt="Gói Kẹo Bọc" draggable="false" />`,
  special_color_bomb: `<img src="/assets/candy-colorbomb.png" alt="Cầu Đậu Ngũ Sắc" draggable="false" />`,
  special_seeker: `<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M3 16C10 10 15 14 17 20C11 22 6 21 3 16Z" fill="#fde047"/><path d="M41 16C34 10 29 14 27 20C33 22 38 21 41 16Z" fill="#fde047"/><circle cx="22" cy="23" r="10" fill="#f59e0b" stroke="#fef9c3" stroke-width="2.5"/></svg>`
};

// Danh sách 10 Đại Trùm kinh điển ở 100 màn mở đầu (đã nâng máu & thêm Pha 2 Cuồng Nộ ở <= 50% HP!)
export const BOSS_ROSTER = {
  10: {
    levelId: 10,
    name: 'Đàn Cú Phép Đường Privet',
    shortTitle: 'Đàn Cú Phép',
    emoji: '🦉',
    maxHp: 1550,
    castInterval: 4,
    enrageBelowPct: 0.5,
    hexType: 'swirl',
    hexName: 'Thả Thư Xoáy Cam Thảo'
  },
  20: {
    levelId: 20,
    name: 'Người Giữ Khoá Rubeus',
    shortTitle: 'Người Giữ Khoá',
    emoji: '🔑',
    maxHp: 1850,
    castInterval: 4,
    enrageBelowPct: 0.5,
    hexType: 'ice',
    hexName: 'Gió Bão Đóng Băng'
  },
  30: {
    levelId: 30,
    name: 'Rồng Lửa Hầm Gringotts',
    shortTitle: 'Rồng Gringotts',
    emoji: '🐉',
    maxHp: 2100,
    castInterval: 4,
    enrageBelowPct: 0.5,
    hexType: 'swirl',
    hexName: 'Khói Đá Hầm Sâu'
  },
  40: {
    levelId: 40,
    name: 'Ảo Ảnh Đũa Phép Song Sinh',
    shortTitle: 'Đũa Song Sinh',
    emoji: '⚡',
    maxHp: 2350,
    castInterval: 4,
    enrageBelowPct: 0.5,
    hexType: 'ice',
    hexName: 'Tia Phép Phong Băng'
  },
  50: {
    levelId: 50,
    name: 'Nam Tước Đẫm Máu',
    shortTitle: 'Nam Tước Ma',
    emoji: '🕯️',
    maxHp: 2580,
    castInterval: 4,
    enrageBelowPct: 0.5,
    hexType: 'chocolate',
    hexName: 'Bóng Đêm Sô-cô-la'
  },
  60: {
    levelId: 60,
    name: 'Quỷ Khổng Lồ Núi',
    shortTitle: 'Quỷ Khổng Lồ',
    emoji: '🧌',
    maxHp: 2820,
    castInterval: 3,
    enrageBelowPct: 0.5,
    hexType: 'swirl',
    hexName: 'Chùy Gỗ Nện Bàn'
  },
  70: {
    levelId: 70,
    name: 'Hồn Ma Khu Cấm Thư Viện',
    shortTitle: 'Ma Cấm Thư',
    emoji: '📜',
    maxHp: 3050,
    castInterval: 3,
    enrageBelowPct: 0.5,
    hexType: 'ice',
    hexName: 'Hơi Lạnh Cấm Thư'
  },
  80: {
    levelId: 80,
    name: 'Bóng Đen Rừng Cấm',
    shortTitle: 'Bóng Đen Rừng Cấm',
    emoji: '🌑',
    maxHp: 3280,
    castInterval: 3,
    enrageBelowPct: 0.5,
    hexType: 'chocolate',
    hexName: 'Lời Nguyền Bóng Tối'
  },
  90: {
    levelId: 90,
    name: 'Hoàng Hậu Cờ Phù Thủy',
    shortTitle: 'Hậu Cờ Phép',
    emoji: '♟️',
    maxHp: 3480,
    castInterval: 3,
    enrageBelowPct: 0.5,
    hexType: 'ice',
    hexName: 'Chiếu Tướng Băng Giá'
  },
  100: {
    levelId: 100,
    name: 'Hộ Vệ Gương Ảo Ảnh Erised',
    shortTitle: 'Gương Ảo Ảnh',
    emoji: '🪞',
    maxHp: 3750,
    castInterval: 3,
    enrageBelowPct: 0.5,
    hexType: 'dark_curse',
    hexName: 'Bùa Chú Ảo Ảnh'
  }
};

const YEAR_BOSS_ARCHETYPES = {
  1: [
    { name: 'Chó Ba Đầu Fluffy Canh Cửa Sập', shortTitle: 'Fluffy Ba Đầu', emoji: '🐕', hexType: 'swirl', hexName: 'Tiếng Gầm Ba Đầu' },
    { name: 'Bẫy Thực Vật Quỷ Khổng Lồ', shortTitle: 'Thực Vật Quỷ', emoji: '🌿', hexType: 'chocolate', hexName: 'Dây Leo Siết Chặt' },
    { name: 'Đàn Chìa Khoá Cánh Bạc Cổ Xưa', shortTitle: 'Chúa Chìa Khoá', emoji: '🗝️', hexType: 'ice', hexName: 'Cơn Lốc Cánh Thép' },
    { name: 'Kỵ Sĩ Đá Cờ Phù Thủy McGonagall', shortTitle: 'Kỵ Sĩ Cờ Đá', emoji: '♟️', hexType: 'swirl', hexName: 'Nước Chiếu Huỷ Diệt' },
    { name: 'Ảo Ảnh Lửa Đen Độc Dược Snape', shortTitle: 'Tường Lửa Đen', emoji: '🧪', hexType: 'dark_curse', hexName: 'Bức Tường Lửa Tím' }
  ],
  2: [
    { name: 'Cây Liễu Roi Điên Cuồng', shortTitle: 'Cây Liễu Roi', emoji: '🌳', hexType: 'petrify', hexName: 'Cành Cây Hoá Thạch' },
    { name: 'Bầy Yêu Tinh Xanh Cornwall', shortTitle: 'Yêu Tinh Xanh', emoji: '🧚', hexType: 'swirl', hexName: 'Trò Quậy Phá Khung Bàn' },
    { name: 'Trái Bludger Bị Ếm Bùa Độc', shortTitle: 'Bludger Điên', emoji: '☄️', hexType: 'petrify', hexName: 'Cú Đập Hoá Đá' },
    { name: 'Đại Nhện Aragog Rừng Cấm', shortTitle: 'Nhện Chúa Aragog', emoji: '🕷️', hexType: 'chocolate', hexName: 'Mạng Tơ Hắc Ám' },
    { name: 'Bóng Ma Ký Ức Nhật Ký Riddle', shortTitle: 'Ký Ức Riddle', emoji: '📓', hexType: 'petrify', hexName: 'Ánh Nhìn Tử Xà' }
  ],
  3: [
    { name: 'Ông Kẹ Boggart Biến Ảo', shortTitle: 'Ông Kẹ Boggart', emoji: '🎭', hexType: 'ice', hexName: 'Nỗi Sợ Băng Giá' },
    { name: 'Đội Trưởng Giám Ngục Azkaban', shortTitle: 'Giám Ngục Trưởng', emoji: '👻', hexType: 'ice', hexName: 'Nụ Hôn Hút Hồn' },
    { name: 'Tướng Quân Lều Hét Đêm Trăng', shortTitle: 'Bóng Đêm Lều Hét', emoji: '🐺', hexType: 'swirl', hexName: 'Tiếng Hú Đêm Trăng' },
    { name: 'Đao Phủ Hắc Ám Bộ Pháp Thuật', shortTitle: 'Đao Phủ Hắc Ám', emoji: '🪓', hexType: 'chocolate', hexName: ' Xiềng Xích U Ám' },
    { name: 'Kẻ Phản Bội Đuôi Trùn', shortTitle: 'Đuôi Trùn Bạc', emoji: '🐀', hexType: 'dark_curse', hexName: 'Bùa Phản Trắc' }
  ],
  4: [
    { name: 'Rồng Đuôi Gai Hungary Hung Hãn', shortTitle: 'Rồng Đuôi Gai', emoji: '🐲', hexType: 'fiendfyre', hexName: 'Hơi Thở Lửa Rồng' },
    { name: 'Thuỷ Quái Nhân Ngư Đáy Hồ Đen', shortTitle: 'Thuỷ Quái Hồ Đen', emoji: '🧜', hexType: 'ice', hexName: 'Xoáy Nước Đáy Hồ' },
    { name: 'Nhân Sư Canh Mê Cung Tam Pháp Thuật', shortTitle: 'Nhân Sư Mê Cung', emoji: '🦁', hexType: 'petrify', hexName: 'Câu Đố Hoá Đá' },
    { name: 'Barty Crouch Con Cải Trang', shortTitle: 'Barty Crouch Jr', emoji: '👁️', hexType: 'dark_curse', hexName: 'Lời Nguyền Độc Đoán' },
    { name: 'Tử Thần Thực Tử Nghĩa Địa Little Hangleton', shortTitle: 'Tử Thần Thực Tử', emoji: '💀', hexType: 'dark_curse', hexName: 'Dấu Hiệu Hắc Ám' }
  ],
  5: [
    { name: 'Thanh Tra Tối Cao Dolores Umbridge', shortTitle: 'Bà Umbridge', emoji: '🎀', hexType: 'petrify', hexName: 'Bút Lông Khắc Chữ' },
    { name: 'Đội Thẩm Vấn Bộ Pháp Thuật', shortTitle: 'Đội Thẩm Vấn', emoji: '📜', hexType: 'ice', hexName: 'Sắc Lệnh Phong Toả' },
    { name: 'Lucius Malfoy Tại Sở Bảo Mật', shortTitle: 'Lucius Malfoy', emoji: '🐍', hexType: 'dark_curse', hexName: 'Trượng Rắn Hắc Ám' },
    { name: 'Antonin Dolohov Lời Nguyền Tím', shortTitle: 'Phù Thủy Dolohov', emoji: '⚡', hexType: 'chocolate', hexName: 'Lưỡi Lửa Tím Câm Lặng' },
    { name: 'Bellatrix Lestrange Cuồng Loạn', shortTitle: 'Bellatrix', emoji: '🗡️', hexType: 'dark_curse', hexName: 'Crucio Xoáy Đen' }
  ],
  6: [
    { name: 'Thủ Lĩnh Sói Xám Fenrir Greyback', shortTitle: 'Sói Xám Fenrir', emoji: '🐺', hexType: 'chocolate', hexName: 'Vết Cào Hắc Ám' },
    { name: 'Dây Chuyền Opal Bị Nguyền Rủa', shortTitle: 'Cổ Vật Nguyền Rủa', emoji: '📿', hexType: 'ice', hexName: 'Băng Độc Thấm Tim' },
    { name: 'Đàn Âm Binh Inferi Dưới Hồ Đen', shortTitle: 'Đàn Âm Binh', emoji: '🧟', hexType: 'ice', hexName: 'Bàn Tay Lạnh Kéo Chìm' },
    { name: 'Tử Thần Thực Tử Tháp Thiên Văn', shortTitle: 'Tử Thần Tháp Cao', emoji: '🌩️', hexType: 'fiendfyre', hexName: 'Lửa Xanh Hắc Ám' },
    { name: 'Hoàng Tử Lai & Bùa Cắt Sâu', shortTitle: 'Hoàng Tử Lai', emoji: '📘', hexType: 'dark_curse', hexName: 'Sectumsempra Phản Đòn' }
  ],
  7: [
    { name: 'Yaxley & Bộ Pháp Thuật Sụp Đổ', shortTitle: 'Thủ Lĩnh Yaxley', emoji: '🦅', hexType: 'dark_curse', hexName: 'Lưới Tầm Nã Cấm Kỵ' },
    { name: 'Đại Xà Nagini Tại Thung Lũng Godric', shortTitle: 'Đại Xà Nagini', emoji: '🐍', hexType: 'petrify', hexName: 'Nọc Độc Tử Thần' },
    { name: 'Rồng Thép Bảo Vệ Hầm Lestrange', shortTitle: 'Rồng Hầm Sâu', emoji: '🐉', hexType: 'fiendfyre', hexName: 'Lửa Trắng Hầm Ngục' },
    { name: 'Binh Đoàn Khổng Lồ Vây Thành Hogwarts', shortTitle: 'Khổng Lồ Hắc Ám', emoji: '🗿', hexType: 'petrify', hexName: 'Đá Tảng Vỡ Thành' },
    { name: 'Bellatrix & Hộ Vệ Chúa Tể Hắc Ám', shortTitle: ' Cận Vệ Hắc Ám', emoji: '💀', hexType: 'fiendfyre', hexName: 'Bão Lửa Địa Ngục' }
  ]
};

const SEASON_FINALE_BOSSES = {
  1111: {
    levelId: 1111,
    name: 'ĐẠI KẾT CỤC NĂM 1: Giáo Sư Quirrell & Bóng Ma Voldemort',
    shortTitle: 'Quirrell & Voldemort',
    emoji: '🐍',
    maxHp: 6800,
    castInterval: 3,
    enrageBelowPct: 0.5,
    hexType: 'dark_curse',
    hexName: 'Lời Nguyền Chiếm Đoạt Đá Đỏ'
  },
  2222: {
    levelId: 2222,
    name: 'ĐẠI KẾT CỤC NĂM 2: Tử Xà Basilisk & Ký Ức Tom Riddle',
    shortTitle: 'Tử Xà Basilisk',
    emoji: '🐍',
    maxHp: 10400,
    castInterval: 3,
    enrageBelowPct: 0.5,
    hexType: 'petrify',
    hexName: 'Ánh Nhìn Tử Thần Phòng Bí Mật'
  },
  3333: {
    levelId: 3333,
    name: 'ĐẠI KẾT CỤC NĂM 3: Trăm Giám Ngục Bờ Hồ Đen',
    shortTitle: 'Chúa Giám Ngục',
    emoji: '👻',
    maxHp: 14200,
    castInterval: 3,
    enrageBelowPct: 0.5,
    hexType: 'ice',
    hexName: 'Bão Tuyết Tuyệt Vọng Azkaban'
  },
  4444: {
    levelId: 4444,
    name: 'ĐẠI KẾT CỤC NĂM 4: Chúa Tể Voldemort Tái Sinh',
    shortTitle: 'Voldemort Tái Sinh',
    emoji: '💀',
    maxHp: 18200,
    castInterval: 3,
    enrageBelowPct: 0.5,
    hexType: 'dark_curse',
    hexName: 'Priori Incantatem Nghĩa Địa'
  },
  5555: {
    levelId: 5555,
    name: 'ĐẠI KẾT CỤC NĂM 5: Đại Chiến Sở Bảo Mật',
    shortTitle: 'Đại Trùm Sở Bảo Mật',
    emoji: '🔮',
    maxHp: 22000,
    castInterval: 3,
    enrageBelowPct: 0.5,
    hexType: 'dark_curse',
    hexName: 'Vỡ Cầu Tiên Tri Bóng Tối'
  },
  6666: {
    levelId: 6666,
    name: 'ĐẠI KẾT CỤC NĂM 6: Đỉnh Tháp Thiên Văn & Hang Âm Binh',
    shortTitle: 'Bão Hắc Ám Tháp Cao',
    emoji: '🔥',
    maxHp: 25800,
    castInterval: 3,
    enrageBelowPct: 0.5,
    hexType: 'fiendfyre',
    hexName: 'Biển Lửa Hang Đá Độc Dược'
  },
  7777: {
    levelId: 7777,
    name: 'ĐẠI CHIẾN HOGWARTS: Chúa Tể Voldemort Tối Thượng',
    shortTitle: 'Chúa Tể Voldemort',
    emoji: '👑',
    maxHp: 29500,
    castInterval: 3,
    enrageBelowPct: 0.5,
    hexType: 'fiendfyre',
    hexName: 'Avada Kedavra Tối Thượng'
  }
};

export function getBossForLevel(levelId) {
  if (SEASON_FINALE_BOSSES[levelId]) {
    return { ...SEASON_FINALE_BOSSES[levelId], isFinaleBoss: true };
  }
  if (BOSS_ROSTER[levelId]) {
    return { ...BOSS_ROSTER[levelId], isFinaleBoss: false };
  }
  if (levelId % 10 !== 0) return null;

  const season = getSeasonByLevel(levelId);
  const seasonIdx = season.id;
  const offsetInSeason = levelId - season.range[0];
  const archetypes = YEAR_BOSS_ARCHETYPES[seasonIdx] || YEAR_BOSS_ARCHETYPES[1];
  const pick = archetypes[Math.floor(levelId / 10) % archetypes.length];
  const isHundredMilestone = levelId % 100 === 0;

  // Máu Trùm tăng đều xuyên suốt 7.777 màn (tương thích với Tinh Thông Đũa Phép Năm 1–7)
  const baseHp =
    2600 +
    (seasonIdx - 1) * 3200 +
    Math.round((offsetInSeason / LEVELS_PER_SEASON) * 2800) +
    (isHundredMilestone ? 950 : 0);

  return {
    levelId,
    name: isHundredMilestone ? `ĐẠI TRÙM CHƯƠNG: ${pick.name}` : pick.name,
    shortTitle: pick.shortTitle,
    emoji: pick.emoji,
    maxHp: Math.round(baseHp / 50) * 50,
    castInterval: seasonIdx >= 4 || isHundredMilestone ? 3 : 4,
    enrageBelowPct: 0.5,
    hexType: pick.hexType,
    hexName: pick.hexName,
    isFinaleBoss: false
  };
}

function makePentagonCardSvg(bgTop, bgBot, accent, innerMarkup) {
  return `<svg class="frog-card-art" viewBox="0 0 88 88" fill="none" aria-hidden="true"><defs><linearGradient id="fg_${bgTop.slice(1)}_${bgBot.slice(1)}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bgTop}"/><stop offset="100%" stop-color="${bgBot}"/></linearGradient></defs><polygon points="44,5 81,31 67,79 21,79 7,31" fill="url(#fg_${bgTop.slice(1)}_${bgBot.slice(1)})" stroke="#fde047" stroke-width="3.6"/><polygon points="44,11 75,33 63,73 25,73 13,33" fill="none" stroke="${accent}" stroke-width="1.6" opacity="0.72"/>${innerMarkup}</svg>`;
}

export const FROG_CARD_LOCKED_SVG = makePentagonCardSvg(
  '#1e293b',
  '#090d1a',
  '#64748b',
  `<text x="44" y="54" text-anchor="middle" fill="#64748b" font-family="Fredoka, sans-serif" font-size="28" font-weight="700">?</text>`
);

// Bộ Sưu Tập 21 Thẻ Ếch Sô-cô-la Danh Nhân Phù Thủy (giữ nguyên #01–#12 tương thích 100% Save cũ, mở rộng #13–#21 cho Năm 2–7!)
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
  },
  {
    id: 'card_dobby',
    number: '#13',
    name: 'Gia Tinh Dobby Tự Do',
    rarity: 'Sử Thi • Năm 2',
    buffType: 'patronus_pct',
    buffValue: 5,
    buffLabel: '+5% Tốc độ nạp Nộ Thần Hộ Mệnh',
    lore: 'Chú gia tinh dũng cảm nhận chiếc tất tự do và luôn xả thân bảo vệ Harry Potter.',
    portraitSvg: makePentagonCardSvg(
      '#065f46',
      '#064e3b',
      '#fde047',
      `<path d="M34 25H50V48L58 56L50 63H34V25Z" fill="#fde047"/>`
    )
  },
  {
    id: 'card_fawkes',
    number: '#14',
    name: 'Phượng Hoàng Fawkes',
    rarity: 'Huyền Thoại • Năm 2',
    buffType: 'boss_dmg_pct',
    buffValue: 6,
    buffLabel: '+6% Sát thương lên mọi Đại Trùm',
    lore: 'Chim Phượng Hoàng bất tử mang Nón Phân Loại và Thanh Kiếm Gryffindor xuống Phòng Bí Mật.',
    portraitSvg: makePentagonCardSvg(
      '#dc2626',
      '#7c2d12',
      '#fef08a',
      `<path d="M44 19C52 29 60 34 56 49C53 58 48 63 44 63C40 63 35 58 32 49C28 34 36 29 44 19Z" fill="#fde047"/>`
    )
  },
  {
    id: 'card_lupin',
    number: '#15',
    name: 'Giáo Sư Remus Lupin',
    rarity: 'Sử Thi • Năm 3',
    buffType: 'patronus_pct',
    buffValue: 7,
    buffLabel: '+7% Tốc độ nạp Nộ Thần Hộ Mệnh',
    lore: 'Người thầy Phòng Chống Nghệ Thuật Hắc Ám tận tâm truyền dạy thần chú Expecto Patronum.',
    portraitSvg: makePentagonCardSvg(
      '#1e3a8a',
      '#0f172a',
      '#bae6fd',
      `<circle cx="44" cy="44" r="16" fill="#fef08a"/><circle cx="50" cy="40" r="13" fill="#1e3a8a"/>`
    )
  },
  {
    id: 'card_cedric',
    number: '#16',
    name: 'Cedric Diggory',
    rarity: 'Sử Thi • Năm 4',
    buffType: 'score_pct',
    buffValue: 4,
    buffLabel: '+4% Điểm Kẹo Phép vĩnh viễn',
    lore: 'Quán quân Tam Pháp Thuật hào hiệp và chính trực của mái nhà Hufflepuff.',
    portraitSvg: makePentagonCardSvg(
      '#d97706',
      '#451a03',
      '#fef08a',
      `<path d="M29 26H59L54 46C52 54 48 59 44 61C40 59 36 54 34 46L29 26Z" fill="#fef08a"/>`
    )
  },
  {
    id: 'card_moody',
    number: '#17',
    name: 'Alastor Mắt Điên Moody',
    rarity: 'Huyền Thoại • Năm 4',
    buffType: 'boss_dmg_pct',
    buffValue: 7,
    buffLabel: '+7% Sát thương lên mọi Đại Trùm',
    lore: 'Thần Sáng huyền thoại với châm ngôn bất hủ: “Cảnh giác thường trực!”',
    portraitSvg: makePentagonCardSvg(
      '#0f766e',
      '#090d1a',
      '#38bdf8',
      `<circle cx="44" cy="44" r="16" fill="#0ea5e9" stroke="#fde047" stroke-width="3"/><circle cx="44" cy="44" r="6" fill="#090d1a"/>`
    )
  },
  {
    id: 'card_tonks',
    number: '#18',
    name: 'Nymphadora Tonks',
    rarity: 'Sử Thi • Năm 5',
    buffType: 'shop_discount',
    buffValue: 4,
    buffLabel: '-4% Giá mua Bảo Bối & Bùa Đầu Trận',
    lore: 'Phù thủy Biến Hình Ngụy Trang sắc sảo của Hội Phượng Hoàng với mái tóc hồng rực.',
    portraitSvg: makePentagonCardSvg(
      '#be185d',
      '#3b0764',
      '#f9a8d4',
      `<polygon points="44,21 58,38 52,61 36,61 30,38" fill="#f472b6" stroke="#fde047" stroke-width="2.4"/>`
    )
  },
  {
    id: 'card_slughorn',
    number: '#19',
    name: 'Horace Slughorn',
    rarity: 'Sử Thi • Năm 6',
    buffType: 'clear_galleons',
    buffValue: 5,
    buffLabel: '+5 Vàng Galleon mỗi khi thắng màn',
    lore: 'Chủ nhân Câu Lạc Bộ Slughorn, người trao phần thưởng Phúc Lạc Dược Felix Felicis.',
    portraitSvg: makePentagonCardSvg(
      '#047857',
      '#1e1b4b',
      '#fde047',
      `<path d="M40 23H48V34L56 54C57 59 53 63 44 63C35 63 31 59 32 54L40 34V23Z" fill="#fde047"/>`
    )
  },
  {
    id: 'card_regulus',
    number: '#20',
    name: 'Regulus Arcturus Black',
    rarity: 'Huyền Thoại • Năm 7',
    buffType: 'boss_dmg_pct',
    buffValue: 8,
    buffLabel: '+8% Sát thương lên mọi Đại Trùm',
    lore: 'Bí danh R.A.B. — người đầu tiên khám phá và đánh tráo Mề Đay Trường Sinh Linh Giá.',
    portraitSvg: makePentagonCardSvg(
      '#115e59',
      '#020617',
      '#6ee7b7',
      `<polygon points="44,22 59,34 54,59 44,64 34,59 29,34" fill="#10b981" stroke="#fde047" stroke-width="2.8"/>`
    )
  },
  {
    id: 'card_neville_sword',
    number: '#21',
    name: 'Neville & Kiếm Gryffindor',
    rarity: 'Huyền Thoại • Năm 7',
    buffType: 'boss_dmg_pct',
    buffValue: 10,
    buffLabel: '+10% Sát thương lên mọi Đại Trùm',
    lore: 'Người hùng rút Thanh Kiếm Godric Gryffindor từ Nón Phân Loại chém đứt Trường Sinh Linh Giá cuối cùng.',
    portraitSvg: makePentagonCardSvg(
      '#991b1b',
      '#1e1b4b',
      '#fef08a',
      `<path d="M44 18L48 50H40L44 18Z" fill="#f8fafc"/><rect x="33" y="49" width="22" height="5" rx="2" fill="#fde047"/><rect x="41" y="54" width="6" height="10" rx="2" fill="#ef4444"/>`
    )
  }
];

// 7 Bậc Tinh Thông Đũa Phép (Wand Mastery) — tự động thăng cấp theo Tổng Sao tích luỹ suốt 200+ giờ chơi!
export const WAND_MASTERY_TIERS = [
  { rank: 1, minStars: 0, title: 'Đũa Tập Sự Năm 1', scorePct: 0, bossDmgPct: 0 },
  { rank: 2, minStars: 180, title: 'Đũa Phòng Vệ Năm 2', scorePct: 6, bossDmgPct: 8 },
  { rank: 3, minStars: 600, title: 'Đũa Hộ Mệnh Năm 3', scorePct: 12, bossDmgPct: 16 },
  { rank: 4, minStars: 1500, title: 'Đũa Tam Pháp Thuật Năm 4', scorePct: 20, bossDmgPct: 26 },
  { rank: 5, minStars: 3200, title: 'Đũa Đoàn Quân Năm 5', scorePct: 30, bossDmgPct: 38 },
  { rank: 6, minStars: 6000, title: 'Đũa Hoàng Tử Lai Năm 6', scorePct: 42, bossDmgPct: 52 },
  { rank: 7, minStars: 10500, title: 'Đũa Cơm Nguội Tối Thượng', scorePct: 58, bossDmgPct: 70 }
];

export function getWandMasteryByStars(totalStars = 0) {
  let active = WAND_MASTERY_TIERS[0];
  for (const tier of WAND_MASTERY_TIERS) {
    if (totalStars >= tier.minStars) active = tier;
  }
  const nextTier = WAND_MASTERY_TIERS.find((t) => t.rank === active.rank + 1) || null;
  return { ...active, nextTier };
}

// Tạo 3 Mốc Rương Sao Chương theo tổng sao tối đa của Chương (300★ cho Chương 100 màn, 333★ cho Chương Kết 111 màn)
export function getChapterStarChests(maxStars = 300) {
  if (maxStars === 333) {
    return [
      {
        threshold: 110,
        tierName: 'Rương Đồng',
        galleons: 150,
        boosterId: 'hammer',
        preBoosterId: null,
        infiniteHeartsMin: 15,
        grantFrogCard: false,
        summary: '+150 G, +1 Búa Đũa Phép & +15p Tim Bất Tử ❤️‍🔥'
      },
      {
        threshold: 220,
        tierName: 'Rương Bạc',
        galleons: 260,
        boosterId: 'swap',
        preBoosterId: 'pre_color_bomb',
        infiniteHeartsMin: 20,
        grantFrogCard: false,
        summary: '+260 G, +1 Đổi Kẹo, +1 Cầu Đậu & +20p Tim Bất Tử ❤️‍🔥'
      },
      {
        threshold: 333,
        tierName: 'Rương Vàng Kết Năm',
        galleons: 500,
        boosterId: 'extraMoves',
        preBoosterId: 'pre_striped_wrapped',
        infiniteHeartsMin: 45,
        grantFrogCard: true,
        summary: '+500 G, +1 Kẹo +5 Lượt, +45p Tim Bất Tử & +1 Thẻ Ếch!'
      }
    ];
  }

  return [
    {
      threshold: 100,
      tierName: 'Rương Đồng',
      galleons: 120,
      boosterId: 'hammer',
      preBoosterId: null,
      infiniteHeartsMin: 15,
      grantFrogCard: false,
      summary: '+120 G, +1 Búa Đũa Phép & +15p Tim Bất Tử ❤️‍🔥'
    },
    {
      threshold: 200,
      tierName: 'Rương Bạc',
      galleons: 220,
      boosterId: 'swap',
      preBoosterId: 'pre_color_bomb',
      infiniteHeartsMin: 20,
      grantFrogCard: false,
      summary: '+220 G, +1 Đổi Kẹo, +1 Cầu Đậu & +20p Tim Bất Tử ❤️‍🔥'
    },
    {
      threshold: 300,
      tierName: 'Rương Vàng',
      galleons: 420,
      boosterId: 'extraMoves',
      preBoosterId: null,
      infiniteHeartsMin: 30,
      grantFrogCard: true,
      summary: '+420 G, +1 Kẹo +5 Lượt, +30p Tim Bất Tử & +1 Thẻ Ếch!'
    }
  ];
}

export const CHAPTER_STAR_CHESTS = getChapterStarChests(300);

// 4 Bảo Bối dùng trực tiếp TRONG trận đấu (In-Game Boosters)
export const BOOSTERS = [
  {
    id: 'hammer',
    name: 'Búa Kẹo Đũa Phép',
    shortName: 'Búa Đũa Phép',
    desc: 'Vung Búa Kẹo Đũa Phép đập vỡ ngay 1 viên kẹo, gỡ Bom, phá Khiên Linh Giá hoặc 1 lớp Vật Cản không tốn lượt!',
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
    desc: 'Triệu hồi sẵn 2 Kẹo Cánh Vàng Snitch (2×2) tự động lao thẳng vào Bom / Linh Giá / Mục tiêu!',
    price: 75,
    iconSvg: OBSTACLE_ICONS.special_seeker
  }
];

// 8 Ô Phần Thưởng trên Vòng Quay Phép Thuật Công Tước Mật Hàng Ngày
export const DAILY_WHEEL_SEGMENTS = [
  { id: 'w_g60', label: '+80 G', fullName: '+80 Vàng Galleon', rewardType: 'galleons', amount: 80, color: '#7f1d1d' },
  { id: 'w_hammer', label: 'Búa Kẹo', fullName: '+1 Búa Kẹo Đũa Phép', rewardType: 'booster', itemId: 'hammer', amount: 1, color: '#1e3a8a' },
  { id: 'w_g120', label: '+150 G', fullName: '+150 Vàng Galleon', rewardType: 'galleons', amount: 150, color: '#065f46' },
  { id: 'w_pre_cb', label: 'Cầu Đậu', fullName: '+1 Cầu Đậu Đầu Trận', rewardType: 'preBooster', itemId: 'pre_color_bomb', amount: 1, color: '#581c87' },
  { id: 'w_hearts', label: 'Tim ∞ 20p', fullName: 'Đầy 5 Tim & 20 Phút Bất Tử Tim ❤️‍🔥', rewardType: 'infinite_hearts', amount: 20, color: '#991b1b' },
  { id: 'w_shuffle', label: 'Xoáy Kẹo', fullName: '+1 Kẹo Xoáy Thời Gian', rewardType: 'booster', itemId: 'shuffle', amount: 1, color: '#78350f' },
  { id: 'w_swap', label: 'Đổi Kẹo', fullName: '+1 Đũa Phép Đổi Kẹo', rewardType: 'booster', itemId: 'swap', amount: 1, color: '#155e75' },
  { id: 'w_jackpot', label: '★ 300 G', fullName: 'ĐẠI THƯỞNG +300 VÀNG GALLEON!', rewardType: 'galleons', amount: 300, color: '#b45309' }
];

export const COMBO_PRAISES = [
  'Sweet! • Ngọt Ngào!',
  'Tasty! • Tuyệt Hảo!',
  'Delicious! • Xuất Thần!',
  'Divine! • Thần Sầu!',
  'Bertie Crush!'
];

export const VOICE_CALLOUTS = ['Sweet!', 'Tasty!', 'Delicious!', 'Divine!', 'Sugar Crush!'];

// Giữ export tương thích ngược cho 11 Chương của Season 1
export const SEASON_1_CHAPTERS = Array.from({ length: CHAPTERS_PER_SEASON }, (_, idx) => {
  const chNum = idx + 1;
  const start = idx * 100 + 1;
  const end = chNum === 11 ? 1111 : chNum * 100;
  return {
    id: chNum,
    seasonId: 1,
    chapterIndexInSeason: chNum,
    range: [start, end],
    maxStars: (end - start + 1) * 3
  };
});
