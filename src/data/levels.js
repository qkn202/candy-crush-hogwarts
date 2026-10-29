// 7 Năm Học Hogwarts × Candy Crush Saga: 7.777 Màn Chơi Độc Bản (7 Season × 1.111 Màn, 77 Chương)
// Nhịp độ khó răng cưa (Thường → 🔮 Khó → 💀 Ác Mộng → 👑 Đại Trùm 2 Pha), Khay 7×7 → 10×10,
// Vật cản 4–5 lớp & 6 Cơ Chế Hắc Ám Độc Quyền Năm 2–7

import {
  CHAPTERS_PER_SEASON,
  HOGWARTS_SEASONS,
  LEVELS_PER_SEASON,
  TOTAL_CHAPTERS,
  TOTAL_LEVELS,
  TOTAL_SEASONS,
  getBossForLevel,
  getSeasonByLevel
} from './lore.js';

export { TOTAL_LEVELS, LEVELS_PER_SEASON, TOTAL_SEASONS, TOTAL_CHAPTERS, CHAPTERS_PER_SEASON };

// 77 Chương Cốt Truyện Chính Thức xuyên suốt 7 Năm Học (11 Chương / Năm)
const SEASON_CHAPTER_CATALOG = {
  1: [
    ['Số 4 Đường Privet & Đàn Cú Đưa Thư', 'Mưa thư nhập học & Người Giữ Khoá giữa bão đêm'],
    ['Hẻm Xéo & Hầm Sâu Gringotts', 'Chuyến xe hầm mỏ, Khoá Gringotts & Đũa Phép chọn chủ'],
    ['Sân Ga 9¾ & Đại Sảnh Ngàn Nến', 'Tàu Tốc Hành Đỏ Thẫm, Kẹo Đậu Bertie & Ếch Sô-cô-la'],
    ['Chiếc Nón Phân Loại & Cầu Thang Xoay', 'Bốn Nhà Hogwarts & 142 nhịp cầu thang dịch chuyển'],
    ['Hầm Độc Dược & Đêm Halloween', 'Vạc Độc Dược sôi sục & Quỷ Khổng Lồ Núi hung hãn'],
    ['Chổi Nimbus 2000 & Trái Snitch Vàng', 'Tầm Thủ trẻ nhất thế kỷ trên bầu trời Quidditch'],
    ['Khu Cấm Thư Viện & Tấm Gương Erised', 'Áo Khoác Tàng Hình & khát vọng trong gương cổ'],
    ['Trứng Rồng Na Uy & Tháp Thiên Văn', 'Chú rồng lửa Norbert & chuyến đưa rồng lúc nửa đêm'],
    ['Hình Phạt Cấm Túc Trong Rừng Cấm', 'Dấu máu Bạch Kỳ Lân & bóng đen u tối dưới tán rừng'],
    ['Cửa Sập Fluffy & Bàn Cờ Khổng Lồ', 'Tiếng đàn ru ngủ, Chìa Khoá Cánh & ván cờ McGonagall'],
    ['Bảy Bình Độc Dược & Hòn Đá Phù Thủy', 'Vượt tường lửa đen đối đầu Quirrell & Bóng Ma Chúa Tể']
  ],
  2: [
    ['Lời Cảnh Báo Của Gia Tinh Dobby', 'Phong ấn thư từ & rắc rối phép thuật đầu mùa hạ'],
    ['Trang Trại Hang Sóc & Xe Ford Bay', 'Giải cứu lúc nửa đêm & mái nhà ấm áp họ Weasley'],
    ['Hẻm Xéo Knockturn & Cây Liễu Roi', 'Bột Floo lạc lối & cú quật dữ dội của Cây Liễu cổ thụ'],
    ['Yêu Tinh Xanh & Lời Thì Thầm Trong Tường', 'Tiếng Xà Ngữ lạnh sống lưng dọc hành lang ngập nước'],
    ['Dòng Chữ Trên Tường & Bludger Điên', 'Phòng Chứa Bí Mật đã mở & hiểm nguy trên sân bay'],
    ['Câu Lạc Bộ Đấu Tay Đôi & Xà Ngữ', 'Bùa Giải Giới Expelliarmus & con rắn hổ mang đen'],
    ['Thuốc Đa Dịch & Nhà Vệ Sinh Myrtle', 'Một tháng ninh độc dược & manh mối chiếc bồn rửa cổ'],
    ['Cuốn Nhật Ký Đen Của Tom Riddle', 'Ký ức năm mươi năm trước hút người đọc vào trang giấy'],
    ['Theo Đàn Nhện Vào Rừng Cấm', 'Đại Nhện Aragog & vòng vây tơ trắng giữa rừng khuya'],
    ['Đường Ống Ngầm Của Tử Xà Nghìn Năm', 'Ánh nhìn Hoá Đá Tử Xà & lớp xác rắn khổng lồ'],
    ['Thanh Kiếm Gryffindor & Phòng Bí Mật', 'Tiếng hát Phượng Hoàng Fawkes & nanh độc huỷ Nhật Ký']
  ],
  3: [
    ['Chuyến Xe Đò Hiệp Sĩ Giữa Đêm Đen', 'Ba tầng xe tím lao vun vút qua màn sương đêm'],
    ['Cơn Lạnh Giám Ngục Trên Tàu Tốc Hành', 'Sương băng phủ kín cửa kính & viên Sô-cô-la hồi sức'],
    ['Bằng Mã Buckbeak & Chiếc Tủ Ông Kẹ', 'Cái cúi chào kiêu hãnh & câu thần chú Riddikulus!'],
    ['Bản Đồ Đạo Tặc & Lối Ngầm Hogsmeade', 'Tôi xin trịnh trọng thề rằng tôi đang mưu đồ bất chính'],
    ['Tia Chớp Lửa & Thần Chú Hộ Mệnh Bạc', 'Luyện tập Expecto Patronum đẩy lùi bóng tối hút hồn'],
    ['Điềm Gở Grim & Lời Tiên Tri Cổ', 'Bã trà đen trong tách sứ & vận mệnh người hầu quay lại'],
    ['Căn Lều Hét Dưới Gốc Liễu Roi', 'Đường hầm bí mật dẫn tới sự thật mười hai năm trước'],
    ['Bí Mật Đuôi Trùn & Chân Nhồi Bông', 'Bốn người bạn Đạo Tặc lộ diện trong đêm định mệnh'],
    ['Trăng Tròn Biến Hình & Vòng Vây Azkaban', 'Tiếng hú Ma Sói & hơi lạnh trăm Giám Ngục áp sát'],
    ['Ba Vòng Xoay Thời Gian Của Hermione', 'Chạy đua từng khắc đồng hồ cát giải cứu hai sinh mạng'],
    ['Hươu Bạc Bờ Hồ Đen & Giải Cứu Sirius', 'Quang năng Thần Hộ Mệnh thanh tẩy trăm Giám Ngục!']
  ],
  4: [
    ['Dấu Hiệu Hắc Ám Tại Cúp Thế Giới', 'Lều phép thuật vạn người & bầu trời rực lửa xanh'],
    ['Đoàn Xe Beauxbatons & Thuyền Durmstrang', 'Ngựa có cánh vượt mây & chiến thuyền trồi lên Hồ Đen'],
    ['Ngọn Lửa Xanh Của Chiếc Cốc Lửa', 'Bốn mảnh giấy da bật khỏi ngọn lửa cổ xưa'],
    ['Cảnh Giác Thường Trực Cùng Mắt Điên', 'Con mắt phép xoay tròn & bài học phòng thủ khắc nghiệt'],
    ['Bài Thi Thứ Nhất: Rồng Đuôi Gai', 'Triệu hồi chổi bay lượn qua biển lửa đoạt Trứng Vàng'],
    ['Dạ Vũ Giáng Sinh & Bí Ẩn Trứng Vàng', ' Đại Sảnh phủ băng bạc & giai điệu Nhân Ngư dưới nước'],
    ['Bài Thi Thứ Hai: Đáy Sâu Hồ Đen', 'Cỏ Mang Cá & một giờ giải cứu con tin giữa dòng xoáy'],
    ['Chậu Tưởng Ký & Phiên Xét Xử Cũ', 'Lật mở ký ức bạc trắng về những Tử Thần Thực Tử'],
    ['Bước Vào Mê Cung Tam Pháp Thuật', 'Bờ giậu sống khép mở & Gió Lốc Mê Cung đảo chiều kẹo'],
    ['Chiếc Cúp Khóa Cảng & Nghĩa Địa Đêm', 'Cạm bẫy dịch chuyển tới ngôi mộ đá Little Hangleton'],
    ['Voldemort Tái Sinh & Song Đũa Kết Nối', 'Sợi tơ vàng Priori Incantatem mở đường máu trở về']
  ],
  5: [
    ['Giám Ngục Tấn Công Hẻm Magnolia', 'Ánh chớp Hộ Mệnh giữa khu phố Muggle oi bức'],
    ['Số 12 Quảng Trường Grimmauld', 'Tổng hành dinh Hội Phượng Hoàng ẩn giữa hai dãy phố'],
    ['Bút Lông Máu & Bia Sắc Lệnh Hồng', 'Vùng cấm phép 3×3 của Thanh Tra Tối Cao Umbridge'],
    ['Lời Thề Quán Đầu Heo & Đoàn Quân DA', 'Hai mươi tám chữ ký rèn luyện phép thuật thực chiến'],
    ['Phòng Cần Thiết & Hộ Mệnh Toàn Đội', 'Căn phòng biến hoá theo ý nguyện tiếp sức kháng cự'],
    ['Giấc Mơ Hành Lang Đen & Đòn Rắn Cắn', 'Thị kiến xuyên màn đêm sâu dưới tầng ngầm Bộ Pháp Thuật'],
    ['Bế Quan Bí Thuật Dưới Hầm Lạnh', 'Cuộc đấu trí căng thẳng khóa chặt tâm thức trước Chúa Tể'],
    ['Pháo Hoa Nổi Loạn Anh Em Weasley', 'Đầm lầy phép thuật & màn tung bay chấn động Hogwarts'],
    ['Kỳ Thi Pháp Thuật Thường Đẳng O.W.L.', 'Đại khảo hạch lý thuyết lẫn thực hành bùa chú toàn khóa'],
    ['Cưỡi Vong Mã Bay Tới Sở Bảo Mật', 'Vượt màn đêm tới căn phòng chín vạn quả cầu tiên tri'],
    ['Đại Chiến Sở Bảo Mật & Ánh Lửa Dumbledore', 'Sóng xung kích phép thuật nghiền nát trùng vây hắc ám']
  ],
  6: [
    ['Lời Thề Bất Khả Bội Đường Bàn Xoay', 'Sợi lửa vàng quấn chặt cổ tay giữa đêm mưa tầm tã'],
    ['Cuốn Sách Cũ Của Hoàng Tử Lai', 'Những dòng chú giải bí mật biến đổi mọi công thức dược'],
    ['Một Giọt Phúc Lạc Dược Felix Felicis', 'Ánh vàng may mắn dẫn lối qua mọi khe hẹp hiểm nghèo'],
    ['Ký Ức Đen Tối Về Gia Tộc Gaunt', 'Chiếc Nhẫn Đá Đen & nguồn cội của Chúa Tể Hắc Ám'],
    ['Dây Chuyền Nguyền Rủa & Rượu Độc', 'Âm mưu thâm độc rình rập phía sau các hành lang tuyết'],
    ['Bí Mật Bảy Mảnh Trường Sinh Linh Giá', 'Ký ức thật sự của Slughorn mở khóa tử huyệt Voldemort'],
    ['Chiếc Tủ Biến Mất Trong Phòng Cần Thiết', 'Cầu nối bóng tối lén mở cổng thành cho Tử Thần Thực Tử'],
    ['Sectumsempra & Nước Mắt Tưởng Ký', 'Lưỡi kiếm vô hình & hiểm hoạ từ những trang sách lạ'],
    ['Hang Đá Biển Đen & Chén Độc Tuyệt Vọng', 'Vượt sóng dữ tìm Mề Đay giữa mặt hồ đen tĩnh lặng'],
    ['Biển Lửa Địa Ngục Đẩy Lùi Âm Binh', 'Vòng bão lửa hắc ám thiêu rụi hàng trăm bàn tay lạnh'],
    ['Dấu Hiệu Hắc Ám Đỉnh Tháp Thiên Văn', 'Đêm bi tráng khắc sâu lời thề quyết chiến cuối cùng']
  ],
  7: [
    ['Trận Không Chiến Bảy Potter', 'Bầu trời rực chớp phép & cuộc hộ tống sinh tử trong đêm'],
    ['Đột Nhập Bộ Pháp Thuật Đoạt Mề Đay', 'Cải trang Đa Dịch phá huỷ sào huyệt Thanh Tra Hắc Ám'],
    ['Rừng Dean Tuyết Trắng & Kiếm Dưới Hồ', 'Hươu Bạc dẫn lối chém vỡ Mề Đay Trường Sinh Linh Giá'],
    ['Huyền Thoại Ba Bảo Bối Tử Thần', 'Đũa Cơm Nguội, Đá Phục Sinh & Áo Khoác Tàng Hình'],
    ['Phá Vòng Vây Phủ Thái Ấp Malfoy', 'Cú độn thổ anh dũng của Dobby giữa cơn mưa nguyền rủa'],
    ['Đột Phá Hầm Ngục Nhà Lestrange', 'Chiếc Cúp Hufflepuff nhân bản & Rồng Thép phun lửa trắng'],
    ['Đường Hầm Đầu Heo Về Thành Hogwarts', 'Hiệu triệu toàn trường dựng đại kết giới bảo vệ lâu đài'],
    ['Nanh Tử Xà & Bão Lửa Fiendfyre', 'Thiêu huỷ Vương Miện Ravenclaw giữa biển lửa Phòng Cần Thiết'],
    ['Ký Ức Hoàng Tử Lai & Sự Thật Cuối', 'Giọt nước mắt bạc & lòng trung thành bất diệt: Always'],
    ['Viên Đá Phục Sinh Trong Rừng Cấm', 'Bước chân tĩnh tại đối mặt lời nguyền giữa vòng vây'],
    ['ĐẠI CHIẾN HOGWARTS: Bình Minh Toàn Thắng', 'Neville chém đứt Nagini & đòn phản nguyền hạ gục Voldemort!']
  ]
};

// Giữ nguyên 100 tên màn kinh điển mở đầu Năm 1
const FIRST_100_TITLES = [
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
  'ĐẠI TRÙM CHƯƠNG I: Hộ Vệ Gương Ảo Ảnh Erised'
];

const STAGE_ACTION_PREFIXES = [
  'Mật Đạo',
  'Giải Mã',
  'Phá Ấn',
  'Vượt Ải',
  'Truy Vết',
  'Kết Giới',
  'Đột Kích',
  'Thắp Sáng',
  'Khảo Hạch',
  'Huyền Bí'
];

export function getSeasonChapters(seasonId) {
  const sIdx = Math.max(1, Math.min(TOTAL_SEASONS, Math.floor(Number(seasonId) || 1)));
  const seasonMeta = HOGWARTS_SEASONS[sIdx - 1];
  const entries = SEASON_CHAPTER_CATALOG[sIdx] || SEASON_CHAPTER_CATALOG[1];
  const seasonStart = seasonMeta.range[0];

  return entries.map(([title, subtitle], idx) => {
    const chInSeason = idx + 1;
    const globalId = (sIdx - 1) * CHAPTERS_PER_SEASON + chInSeason;
    const start = seasonStart + idx * 100;
    const end = chInSeason === CHAPTERS_PER_SEASON ? seasonMeta.range[1] : start + 99;
    return {
      id: globalId,
      globalChapterId: globalId,
      seasonId: sIdx,
      chapterIndexInSeason: chInSeason,
      roman: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'][idx],
      title: `Chương ${chInSeason}: ${title}`,
      shortTitle: title,
      subtitle,
      range: [start, end],
      levelCount: end - start + 1,
      maxStars: (end - start + 1) * 3,
      themeBg: seasonMeta.themeBg,
      accentColor: seasonMeta.accentColor
    };
  });
}

export function getChapterForLevel(levelId) {
  const safe = Math.max(1, Math.min(TOTAL_LEVELS, Math.floor(Number(levelId) || 1)));
  const season = getSeasonByLevel(safe);
  const offset = safe - season.range[0];
  const chIdx = Math.min(CHAPTERS_PER_SEASON - 1, Math.floor(offset / 100));
  return getSeasonChapters(season.id)[chIdx];
}

export function getDifficultyTier(levelNum) {
  const season = getSeasonByLevel(levelNum);
  if (levelNum === season.finaleLevelId) return 'finale';
  if (levelNum % 10 === 0) return 'boss';
  if (season.examLevelId && levelNum === season.examLevelId) return 'exam';
  const pos = ((levelNum - 1) % 10) + 1;
  if (levelNum >= 9 && (pos === 5 || pos === 9)) return 'nightmare';
  if (levelNum >= 7 && (pos === 3 || pos === 7)) return 'hard';
  return 'normal';
}

export function getDifficultyBadgeMeta(tier) {
  switch (tier) {
    case 'finale':
      return { tier, icon: '👑', label: 'ĐẠI KẾT CỤC NĂM', shortLabel: 'KẾT NĂM', cssClass: 'tier-finale' };
    case 'boss':
      return { tier, icon: '👑', label: 'ĐẠI TRÙM 2 PHA', shortLabel: 'TRÙM', cssClass: 'tier-boss' };
    case 'exam':
      return { tier, icon: '🎓', label: 'THI VƯỢT NĂM O.W.L.', shortLabel: 'KHẢO HẠCH', cssClass: 'tier-exam' };
    case 'nightmare':
      return { tier, icon: '💀', label: 'MÀN ÁC MỘNG', shortLabel: 'ÁC MỘNG', cssClass: 'tier-nightmare' };
    case 'hard':
      return { tier, icon: '🔮', label: 'MÀN KHÓ PHÙ THỦY', shortLabel: 'MÀN KHÓ', cssClass: 'tier-hard' };
    default:
      return { tier: 'normal', icon: '⚡', label: 'Màn Phép Thuật', shortLabel: 'Thường', cssClass: 'tier-normal' };
  }
}

// Truy vấn siêu tốc O(1) không cấp phát mảng 2D để vẽ Bản đồ 77 Chương tức thì (< 1ms)
export function getLevelMeta(levelId) {
  const levelNum = Math.max(1, Math.min(TOTAL_LEVELS, Math.floor(Number(levelId) || 1)));
  const season = getSeasonByLevel(levelNum);
  const chapter = getChapterForLevel(levelNum);
  const difficultyTier = getDifficultyTier(levelNum);
  const isSeasonFinale = levelNum === season.finaleLevelId;
  const isBoss = isSeasonFinale || levelNum % 10 === 0;
  const isChapterBoss = isSeasonFinale || levelNum === chapter.range[1] || levelNum % 100 === 0;
  const isExamTrial = season.examLevelId === levelNum;

  let title = '';
  if (levelNum <= 100 && FIRST_100_TITLES[levelNum - 1]) {
    title = FIRST_100_TITLES[levelNum - 1];
  } else if (isSeasonFinale) {
    const boss = getBossForLevel(levelNum);
    title = boss ? boss.name : `ĐẠI KẾT CỤC ${season.yearLabel.toUpperCase()}: ${season.title}`;
  } else if (isBoss) {
    const boss = getBossForLevel(levelNum);
    title = boss ? `TRÙM: ${boss.name}` : `TRÙM: ${chapter.shortTitle}`;
  } else if (isExamTrial) {
    title = `KHẢO HẠCH O.W.L. ${season.yearLabel.toUpperCase()}: ${season.title}`;
  } else {
    const stepInChapter = levelNum - chapter.range[0] + 1;
    const prefix = STAGE_ACTION_PREFIXES[(levelNum + chapter.chapterIndexInSeason) % STAGE_ACTION_PREFIXES.length];
    title = `${prefix}: ${chapter.shortTitle} (${stepInChapter}/${chapter.levelCount})`;
  }

  const rewardGalleons = isSeasonFinale
    ? 320 + season.id * 40
    : isChapterBoss
      ? 140 + season.id * 15
      : isBoss
        ? 85 + season.id * 8
        : difficultyTier === 'nightmare'
          ? 45 + season.id * 4
          : difficultyTier === 'hard'
            ? 36 + season.id * 3
            : 26 + season.id * 2;

  return {
    id: levelNum,
    seasonId: season.id,
    chapterId: chapter.globalChapterId,
    globalChapterId: chapter.globalChapterId,
    chapterIndexInSeason: chapter.chapterIndexInSeason,
    title,
    difficultyTier,
    isBoss,
    isChapterBoss,
    isSeasonFinale,
    isExamTrial,
    rewardGalleons
  };
}

// 18 khuôn bàn cờ đối xứng hỗ trợ 7×7, 8×8, 9×9 và Đại Bàn Cờ 10×10 — bảo toàn mọi dãy >= 3 ngang hoặc dọc
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
  let s = ((Math.abs(Math.floor(seed)) % 2147483647) * 16807 + 12345) % 2147483647;
  if (s <= 0) s = 13579;
  return () => {
    s = (s * 48271) % 2147483647;
    return s / 2147483647;
  };
}

function pickLayerCount(maxLayer, rand, hardBias = 0) {
  if (maxLayer <= 1) return 1;
  const roll = Math.min(0.999, rand() + hardBias);
  if (maxLayer >= 5 && roll > 0.78) return 5;
  if (maxLayer >= 4 && roll > 0.56) return 4;
  if (maxLayer >= 3 && roll > 0.34) return 3;
  if (maxLayer >= 2 && roll > 0.16) return 2;
  return 1;
}

function placeSymmetricalGrid(
  size,
  mask,
  count,
  maxLayer,
  seed,
  preferCenter = true,
  forbiddenFn = null,
  hardBias = 0,
  minLayer = 1
) {
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
    const rawLayer = pickLayerCount(maxLayer, rand, hardBias);
    const layer = Math.max(minLayer, Math.min(maxLayer, rawLayer));

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

function countNonZeroCells(grid) {
  let cells = 0;
  let sum = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] > 0) {
        cells++;
        sum += grid[r][c];
      }
    }
  }
  return { cells, sum };
}

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

function buildMazeConfig(size, mask, levelNum, isConveyorCell, difficultyTier) {
  const validRows = [];
  for (let r = 2; r <= size - 3; r++) {
    let activeInRow = 0;
    let touchesConveyor = false;
    for (let c = 0; c < size; c++) {
      if (mask[r][c] === 1) activeInRow++;
      if (isConveyorCell(r, c)) touchesConveyor = true;
    }
    if (activeInRow >= 5 && !touchesConveyor) {
      validRows.push(r);
    }
  }
  if (validRows.length === 0) return null;

  const picked = [];
  const startIdx = levelNum % validRows.length;
  const maxRows = size >= 9 && (difficultyTier === 'nightmare' || difficultyTier === 'boss' || difficultyTier === 'finale') ? 3 : 2;
  for (let i = 0; i < validRows.length && picked.length < maxRows; i++) {
    const rowCandidate = validRows[(startIdx + i * 2) % validRows.length];
    if (!picked.includes(rowCandidate)) picked.push(rowCandidate);
  }
  if (picked.length < 2 && validRows.length >= 2) {
    for (const r of validRows) {
      if (!picked.includes(r)) {
        picked.push(r);
        if (picked.length >= 2) break;
      }
    }
  }
  picked.sort((a, b) => a - b);

  const intervalMoves = difficultyTier === 'finale' || difficultyTier === 'nightmare' ? 2 : 3;
  return {
    intervalMoves,
    rows: picked
  };
}

// Tập hợp các màn cố định trong 100 màn mở đầu (giữ nhịp giới thiệu cơ chế hợp lý nhưng tăng mạnh độ thử thách!)
const FIRST_100_INGREDIENT = new Set([12, 18, 26, 34, 42, 52, 62, 72, 82, 92, 98, 100]);
const FIRST_100_SPECIAL_ORDERS = {
  27: { specialKind: 'striped', target: 5 },
  33: { specialKind: 'seeker', target: 4 },
  45: { specialKind: 'wrapped', target: 4 },
  57: { specialKind: 'striped', target: 6 },
  69: { specialKind: 'seeker', target: 5 },
  77: { specialKind: 'wrapped', target: 4 },
  89: { specialKind: 'color_bomb', target: 3 },
  95: { specialKind: 'striped', target: 6 }
};

function isIngredientDropLevel(levelNum, seasonId, isBoss, isSeasonFinale) {
  if (isSeasonFinale) return false;
  if (levelNum <= 100) return FIRST_100_INGREDIENT.has(levelNum);
  if (isBoss) return levelNum % 40 === 0;
  return levelNum % 9 === 2 || (seasonId >= 3 && levelNum % 13 === 4);
}

function getSpecialOrderSpec(levelNum, seasonId, isBoss, isSeasonFinale, hasDecree) {
  if (isBoss || isSeasonFinale || hasDecree) return null;
  if (levelNum <= 100) return FIRST_100_SPECIAL_ORDERS[levelNum] || null;
  if (levelNum % 14 !== 5) return null;

  const kinds = ['striped', 'seeker', 'wrapped', 'color_bomb'];
  const kind = kinds[(Math.floor(levelNum / 14) + seasonId) % kinds.length];
  const bonus = Math.min(3, Math.floor(seasonId / 2));
  if (kind === 'color_bomb') return { specialKind: 'color_bomb', target: 2 + Math.floor(seasonId / 3) };
  if (kind === 'wrapped') return { specialKind: 'wrapped', target: 4 + bonus };
  if (kind === 'seeker') return { specialKind: 'seeker', target: 4 + bonus };
  return { specialKind: 'striped', target: 5 + bonus };
}

export function generateLevel(rawLevelNum) {
  const meta = getLevelMeta(rawLevelNum);
  const levelNum = meta.id;
  const seasonId = meta.seasonId;
  const seasonMeta = HOGWARTS_SEASONS[seasonId - 1];
  const seasonProgress = (levelNum - seasonMeta.range[0]) / Math.max(1, LEVELS_PER_SEASON - 1);
  const { difficultyTier, isBoss, isChapterBoss, isSeasonFinale, isExamTrial } = meta;
  const isSpike =
    difficultyTier === 'hard' ||
    difficultyTier === 'nightmare' ||
    difficultyTier === 'exam' ||
    isBoss ||
    isSeasonFinale;
  const hardBias =
    difficultyTier === 'finale'
      ? 0.22
      : difficultyTier === 'nightmare' || difficultyTier === 'boss' || difficultyTier === 'exam'
        ? 0.14
        : difficultyTier === 'hard'
          ? 0.08
          : 0;

  const bossConfig = isBoss ? getBossForLevel(levelNum) : null;

  // 1. Kích thước bàn cờ: 7×7 → 8×8 → 9×9 → Đại Bàn Cờ 10×10 (mở từ Năm 4+)
  let size = 8;
  if (levelNum <= 3 || (seasonId === 1 && levelNum < 35 && levelNum % 8 === 3 && !isSpike)) {
    size = 7;
  } else if (
    seasonId >= 4 &&
    (isSeasonFinale || isChapterBoss || isExamTrial || difficultyTier === 'nightmare' || (isBoss && levelNum % 20 === 0) || (difficultyTier === 'hard' && levelNum % 2 === 1))
  ) {
    size = 10;
  } else if (
    isBoss ||
    isExamTrial ||
    difficultyTier === 'nightmare' ||
    (seasonId >= 2 && (difficultyTier === 'hard' || levelNum % 3 === 0)) ||
    (seasonId === 1 && levelNum >= 20 && (difficultyTier === 'hard' || levelNum % 4 === 0))
  ) {
    size = 9;
  }

  let patternId = 0;
  if (levelNum === 1 || levelNum === 3) patternId = 0;
  else if (levelNum === 2) patternId = 1;
  else if (isSeasonFinale) patternId = 17;
  else if (isBoss) patternId = [2, 6, 8, 12, 14, 16, 17][Math.floor(levelNum / 10) % 7];
  else patternId = (levelNum * 7 + seasonId * 5) % 18;

  const mask = buildMask(size, patternId);
  let activeCells = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (mask[r][c] === 1) activeCells++;
    }
  }

  // Giữ ngân sách ít nhất ~50% ô trên bàn cờ là kẹo tự do xoay chuyển, bảo đảm không bao giờ ngộp nước đi ban đầu!
  const maxTotalBlockers = Math.max(12, Math.floor(activeCells * 0.48));
  let usedBlockerCells = 0;

  // 2. Cột Thả Bảo Vật (Drop Ingredients)
  const hasIngredients = isIngredientDropLevel(levelNum, seasonId, isBoss, isSeasonFinale);
  let ingredientTarget = 0;
  const ingredientSpawnCols = [];
  const ingredientExitCells = [];
  if (hasIngredients) {
    ingredientTarget =
      levelNum <= 20
        ? 2
        : levelNum <= 60
          ? 3
          : Math.min(6, 3 + Math.floor(seasonId * 0.45) + (isSpike ? 1 : 0));

    for (let c = 1; c < size - 1; c++) {
      let fullCol = true;
      for (let r = 0; r < size; r++) {
        if (mask[r][c] === 0) {
          fullCol = false;
          break;
        }
      }
      if (fullCol) ingredientSpawnCols.push(c);
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
    for (let c = 0; c < size; c++) {
      if (mask[size - 1][c] === 1) ingredientExitCells.push({ r: size - 1, c });
    }
  }

  const isExitCell = (r, c) => ingredientExitCells.some((ex) => ex.r === r && ex.c === c);
  const isProtectedSpawnCol = (c) =>
    hasIngredients && ingredientSpawnCols.length <= 2 && ingredientSpawnCols.includes(c);

  // 3. Cổng Bột Floo Dịch Chuyển (Portals)
  const portals = [];
  const wantsPortals =
    levelNum <= 100
      ? [36, 48, 54, 58, 66, 74, 84, 94, 100].includes(levelNum)
      : (seasonId >= 2 && levelNum % 8 === 2) || (isSeasonFinale && seasonId >= 5);
  if (wantsPortals) {
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

  // 4. Băng Chuyền Cầu Thang Dịch Chuyển (Conveyor Belt)
  const wantsConveyor =
    levelNum <= 100
      ? [32, 46, 55, 68, 78, 88, 96, 99].includes(levelNum)
      : levelNum % 7 === 4 || (isBoss && seasonId >= 3 && levelNum % 30 === 0) || levelNum === 7777;
  const conveyorLoops = wantsConveyor
    ? buildConveyorLoops(size, mask, levelNum, (r, c) => isExitCell(r, c) || isPortalCell(r, c))
    : [];
  const isConveyorCell = (r, c) =>
    conveyorLoops.some((loop) => loop.some((pt) => pt.r === r && pt.c === c));

  // 5. Gió Lốc Mê Cung Tam Pháp Thuật (Năm 4+: tự dịch chuyển hàng kẹo mỗi 2–3 lượt!)
  const wantsMaze =
    seasonId === 4
      ? isExamTrial || isSeasonFinale || isBoss || levelNum % 3 !== 1
      : seasonId >= 5 && (levelNum % 5 === 1 || (isBoss && levelNum % 40 === 10) || isSeasonFinale);
  const mazeConfig = wantsMaze
    ? buildMazeConfig(size, mask, levelNum, isConveyorCell, difficultyTier)
    : null;

  // Hàm kiểm tra ô đã bị chiếm bởi vật cản đứng yên / khoá kẹo
  const occupied = Array.from({ length: size }, () => Array(size).fill(false));
  const markOccupied = (grid) => {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] > 0 && !occupied[r][c]) {
          occupied[r][c] = true;
          usedBlockerCells++;
        }
      }
    }
  };
  const baseStaticForbidden = (r, c) =>
    r <= 1 ||
    r === size - 1 ||
    occupied[r][c] ||
    isExitCell(r, c) ||
    isPortalCell(r, c) ||
    isConveyorCell(r, c) ||
    isProtectedSpawnCol(c);

  // 6A. [NĂM 7] Trường Sinh Linh Giá (Horcrux 4–5 HP: Khiên Hồn miễn nhiễm ghép thường khi HP >= 4!)
  let horcruxTarget = 0;
  if (seasonId === 7 && (isExamTrial || isSeasonFinale || isBoss || levelNum % 3 !== 2)) {
    horcruxTarget = isSeasonFinale ? 6 : isBoss || difficultyTier === 'nightmare' ? 4 : 2;
  }
  const horcruxBudget = Math.min(horcruxTarget, Math.max(0, maxTotalBlockers - usedBlockerCells));
  const horcruxMaxHp = isSeasonFinale || difficultyTier === 'nightmare' || isBoss ? 5 : 4;
  const horcruxGrid = placeSymmetricalGrid(
    size,
    mask,
    horcruxBudget,
    horcruxMaxHp,
    levelNum * 97 + 19,
    false,
    baseStaticForbidden,
    hardBias,
    4
  );
  markOccupied(horcruxGrid);

  // 6B. [NĂM 3+] Giám Ngục Hút Nộ (Dementor 2–4 HP: hút Nộ Hộ Mệnh & phả băng, bị thanh tẩy bởi Expecto Patronum!)
  let dementorTarget = 0;
  if (seasonId === 3 && (isExamTrial || isSeasonFinale || isBoss || levelNum % 3 !== 1)) {
    dementorTarget = isSeasonFinale ? 6 : isBoss || difficultyTier === 'nightmare' ? 4 : 2;
  } else if (seasonId >= 4 && (levelNum % 6 === 3 || (isBoss && levelNum % 30 === 20) || levelNum === 7777)) {
    dementorTarget = isSeasonFinale ? 4 : difficultyTier === 'nightmare' || isBoss ? 4 : 2;
  }
  const dementorBudget = Math.min(dementorTarget, Math.max(0, maxTotalBlockers - usedBlockerCells));
  const dementorMaxHp = seasonId >= 5 || isSeasonFinale || difficultyTier === 'nightmare' ? 4 : isSpike ? 3 : 2;
  const dementorGrid = placeSymmetricalGrid(
    size,
    mask,
    dementorBudget,
    dementorMaxHp,
    levelNum * 89 + 23,
    false,
    baseStaticForbidden,
    hardBias,
    2
  );
  markOccupied(dementorGrid);

  // 6C. [NĂM 5+] Bia Sắc Lệnh Umbridge (Decree Plaque 2–4 HP: vùng 3×3 cấm kết tinh Kẹo Phép!)
  let decreeTarget = 0;
  if (seasonId === 5 && (isExamTrial || isSeasonFinale || isBoss || levelNum % 3 !== 2)) {
    decreeTarget = isSeasonFinale ? 4 : isBoss || difficultyTier === 'nightmare' ? 4 : 2;
  } else if (seasonId >= 6 && (levelNum % 7 === 2 || (isBoss && levelNum % 40 === 20))) {
    decreeTarget = 2;
  }
  const decreeBudget = Math.min(decreeTarget, Math.max(0, maxTotalBlockers - usedBlockerCells));
  const decreeMaxHp = seasonId >= 6 || difficultyTier === 'nightmare' || isBoss ? 4 : 3;
  const decreeGrid = placeSymmetricalGrid(
    size,
    mask,
    decreeBudget,
    decreeMaxHp,
    levelNum * 83 + 29,
    false,
    baseStaticForbidden,
    hardBias,
    2
  );
  markOccupied(decreeGrid);

  // 6D. [NĂM 6+] Lửa Địa Ngục Fiendfyre (2 HP: tự bùng lan mỗi 2 lượt & nung ngắn ngòi Bom!)
  let fiendfyreTarget = 0;
  if (seasonId === 6 && (isExamTrial || isSeasonFinale || isBoss || levelNum % 3 !== 1)) {
    fiendfyreTarget = isSeasonFinale ? 4 : difficultyTier === 'nightmare' || isBoss ? 4 : 2;
  } else if (seasonId === 7 && (levelNum % 4 === 1 || isSeasonFinale || (isBoss && levelNum % 20 === 0))) {
    fiendfyreTarget = isSeasonFinale ? 4 : 2;
  }
  const fiendfyreBudget = Math.min(fiendfyreTarget, Math.max(0, maxTotalBlockers - usedBlockerCells));
  const rawFiendfyre = placeSymmetricalGrid(
    size,
    mask,
    fiendfyreBudget,
    2,
    levelNum * 73 + 31,
    false,
    baseStaticForbidden,
    0,
    2
  );
  const fiendfyreGrid = rawFiendfyre.map((row) => row.map((v) => (v > 0 ? 2 : 0)));
  markOccupied(fiendfyreGrid);

  // 6E. Vạc Độc Dược (Magic Cauldron 3 HP): mở sớm từ Màn 43+ ở Năm 1 và duy trì xuyên suốt 7 Năm
  let cauldronTarget = 0;
  if (levelNum <= 100) {
    if ([43, 57, 65, 75, 85, 94, 99].includes(levelNum)) cauldronTarget = levelNum >= 75 ? 4 : 2;
  } else if (levelNum % 8 === 5 || (isBoss && levelNum % 50 === 0 && seasonId <= 5)) {
    cauldronTarget = seasonId >= 3 ? 4 : 2;
  }
  const cauldronBudget = Math.min(cauldronTarget, Math.max(0, maxTotalBlockers - usedBlockerCells));
  const rawCauldron = placeSymmetricalGrid(
    size,
    mask,
    cauldronBudget,
    3,
    levelNum * 67 + 13,
    false,
    baseStaticForbidden,
    0,
    3
  );
  const cauldronGrid = rawCauldron.map((row) => row.map((v) => (v > 0 ? 3 : 0)));
  markOccupied(cauldronGrid);

  // 6F. Đá Cổ Ngữ (Frosting 1–5 lớp): mở từ Màn 11+, lên tới 4–5 lớp ở các Năm cao!
  let frostingTarget = 0;
  let maxFrostingLayer = 1;
  if (levelNum >= 11 && (levelNum % 2 === 1 || isBoss || hasIngredients || isSpike)) {
    const baseFrost = levelNum <= 100 ? 4 + Math.floor((levelNum - 10) * 0.09) : 6 + seasonId;
    frostingTarget = Math.min(size >= 9 ? 14 : 10, baseFrost + (isSpike ? 2 : 0));
    if (seasonId >= 5) maxFrostingLayer = isSpike ? 5 : 4;
    else if (seasonId >= 3) maxFrostingLayer = isSpike ? 4 : 3;
    else if (seasonId === 2) maxFrostingLayer = isSpike ? 4 : 3;
    else maxFrostingLayer = levelNum >= 65 ? 3 : levelNum >= 28 ? 2 : 1;
  }
  const frostingBudget = Math.min(frostingTarget, Math.max(0, maxTotalBlockers - usedBlockerCells));
  const frostingGrid = placeSymmetricalGrid(
    size,
    mask,
    frostingBudget,
    maxFrostingLayer,
    levelNum * 23 + 7,
    true,
    (r, c) =>
      r <= 1 ||
      r === size - 1 ||
      occupied[r][c] ||
      isExitCell(r, c) ||
      isPortalCell(r, c) ||
      isConveyorCell(r, c),
    hardBias
  );
  markOccupied(frostingGrid);

  // 6G. Sô-cô-la Hắc Ám Tự Lan: mở từ Màn 31+ (không đặt trùng màn đã có Lửa Fiendfyre để rõ nhịp chiến thuật)
  let chocolateTarget = 0;
  if (fiendfyreBudget === 0 && levelNum >= 31 && (levelNum % 5 === 0 || levelNum === 44 || levelNum === 75 || levelNum === 97)) {
    chocolateTarget = levelNum >= 70 || seasonId >= 2 ? 4 : 2;
  }
  const chocolateBudget = Math.min(chocolateTarget, Math.max(0, maxTotalBlockers - usedBlockerCells));
  const chocolateGrid = placeSymmetricalGrid(
    size,
    mask,
    chocolateBudget,
    1,
    levelNum * 41 + 9,
    false,
    baseStaticForbidden
  );
  markOccupied(chocolateGrid);

  // 6H. Xoáy Cam Thảo (Licorice Swirl): mở từ Màn 24+
  let swirlTarget = 0;
  if (levelNum >= 24 && (levelNum % 4 === 3 || (isBoss && levelNum % 30 === 0))) {
    swirlTarget = Math.min(8, 4 + Math.floor(seasonId * 0.7));
  }
  const swirlBudget = Math.min(swirlTarget, Math.max(0, maxTotalBlockers - usedBlockerCells));
  const swirlGrid = placeSymmetricalGrid(
    size,
    mask,
    swirlBudget,
    1,
    levelNum * 53 + 5,
    true,
    (r, c) =>
      r <= 1 ||
      occupied[r][c] ||
      isExitCell(r, c) ||
      isPortalCell(r, c) ||
      isConveyorCell(r, c)
  );
  markOccupied(swirlGrid);

  // 6I. Chìa Khoá Đường Vàng & Ô Khoá Hầm Gringotts: mở từ Màn 22+
  let lockTarget = 0;
  if (levelNum <= 100) {
    if ([22, 28, 38, 48, 63, 73, 83, 88, 91].includes(levelNum)) lockTarget = levelNum >= 63 ? 6 : 4;
  } else if (levelNum % 9 === 6) {
    lockTarget = seasonId >= 4 ? 8 : 6;
  }
  const lockBudget = Math.min(lockTarget, Math.max(0, maxTotalBlockers - usedBlockerCells));
  const lockGrid = placeSymmetricalGrid(
    size,
    mask,
    lockBudget,
    1,
    levelNum * 79 + 17,
    false,
    baseStaticForbidden
  );
  markOccupied(lockGrid);

  // 6J. [NĂM 2+] Hoá Đá Tử Xà (Petrify 1–3 lớp: hoá đá viên kẹo khiến nó không thể rơi, đổi chỗ hay ghép màu!)
  let petrifyTarget = 0;
  let maxPetrifyLayer = 1;
  if (seasonId === 2 && (isExamTrial || isSeasonFinale || isBoss || levelNum % 3 !== 0)) {
    petrifyTarget = isSeasonFinale ? 14 : isSpike ? 10 : 8;
    maxPetrifyLayer = isSeasonFinale || difficultyTier === 'nightmare' || isBoss ? 3 : isSpike || seasonProgress > 0.35 ? 2 : 1;
  } else if (seasonId >= 3 && (levelNum % 5 === 2 || levelNum === 4444 || levelNum === 7777)) {
    petrifyTarget = isSpike ? 8 : 6;
    maxPetrifyLayer = seasonId >= 5 ? 3 : 2;
  }
  const petrifyBudget = Math.min(petrifyTarget, Math.max(0, maxTotalBlockers - usedBlockerCells));
  const petrifyGrid = placeSymmetricalGrid(
    size,
    mask,
    petrifyBudget,
    maxPetrifyLayer,
    levelNum * 61 + 37,
    true,
    (r, c) =>
      r <= 1 ||
      occupied[r][c] ||
      isExitCell(r, c) ||
      isPortalCell(r, c) ||
      isConveyorCell(r, c),
    hardBias
  );
  markOccupied(petrifyGrid);

  // 6K. Băng Ngục Azkaban (Ice Lock 1–5 lớp): mở từ Màn 14+, lên tới 4–5 lớp ở Năm cao!
  let iceTarget = 0;
  let maxIceLayer = 1;
  if (levelNum >= 14 && (isSpike || levelNum % 3 === 1 || seasonId === 3)) {
    iceTarget = Math.min(size >= 9 ? 16 : 12, 4 + Math.floor(seasonId * 1.4) + (isSpike ? 3 : 0));
    if (seasonId >= 6) maxIceLayer = isSpike ? 5 : 4;
    else if (seasonId >= 4) maxIceLayer = isSpike ? 4 : 3;
    else if (seasonId >= 2) maxIceLayer = isSpike ? 3 : 2;
    else maxIceLayer = levelNum >= 65 ? 3 : levelNum >= 35 ? 2 : 1;
  }
  const iceBudget = Math.min(iceTarget, Math.max(0, maxTotalBlockers - usedBlockerCells));
  const iceGrid = placeSymmetricalGrid(
    size,
    mask,
    iceBudget,
    maxIceLayer,
    levelNum * 31 + 11,
    false,
    (r, c) =>
      r <= 1 ||
      occupied[r][c] ||
      isExitCell(r, c) ||
      isPortalCell(r, c) ||
      isConveyorCell(r, c),
    hardBias
  );
  markOccupied(iceGrid);

  // 6L. Thạch Hắc Ám (Jelly 1–5 lớp nằm dưới kẹo, không khoá nước đi!)
  const isScoreOnly = levelNum === 4 || levelNum === 9;
  let jellyCount = 0;
  let maxJellyLayer = 1;
  if (levelNum >= 5 && !isScoreOnly) {
    const wantsJelly = isBoss || isSeasonFinale || isExamTrial || (!hasIngredients && levelNum % 3 !== 1) || seasonId >= 2;
    if (wantsJelly) {
      jellyCount = Math.min(
        Math.floor(activeCells * 0.72),
        10 + Math.floor(Math.min(100, levelNum) * 0.22) + (seasonId - 1) * 5 + (isSpike ? 6 : 0)
      );
      if (seasonId >= 6) maxJellyLayer = isSpike ? 5 : 4;
      else if (seasonId >= 4) maxJellyLayer = isSpike ? 5 : 3;
      else if (seasonId >= 2) maxJellyLayer = isSpike ? 4 : 3;
      else maxJellyLayer = levelNum >= 70 ? 3 : levelNum >= 25 ? 2 : 1;
    }
  }
  const jellyGrid = placeSymmetricalGrid(
    size,
    mask,
    jellyCount,
    maxJellyLayer,
    levelNum * 17 + 3,
    true,
    (r, c) =>
      cauldronGrid[r][c] > 0 ||
      dementorGrid[r][c] > 0 ||
      decreeGrid[r][c] > 0 ||
      fiendfyreGrid[r][c] > 0 ||
      horcruxGrid[r][c] > 0,
    hardBias
  );

  // 7. Thống kê số lượng thực tế đặt lên bàn
  const { sum: actualJelly } = countNonZeroCells(jellyGrid);
  const { sum: actualIce } = countNonZeroCells(iceGrid);
  const { sum: actualFrosting } = countNonZeroCells(frostingGrid);
  const { cells: actualChocolate } = countNonZeroCells(chocolateGrid);
  const { cells: actualCauldrons } = countNonZeroCells(cauldronGrid);
  const { cells: actualLocks } = countNonZeroCells(lockGrid);
  const { sum: actualPetrify } = countNonZeroCells(petrifyGrid);
  const { cells: actualDementors } = countNonZeroCells(dementorGrid);
  const { cells: actualDecrees } = countNonZeroCells(decreeGrid);
  const { cells: actualFiendfyre } = countNonZeroCells(fiendfyreGrid);
  const { cells: actualHorcruxes } = countNonZeroCells(horcruxGrid);

  // 8. Bom Kẹo Hắc Ám Đếm Ngược (mở sớm từ Màn 39+, kết hợp gay cấn với Lửa Fiendfyre ở Năm 6–7!)
  let bombConfig = null;
  const wantsBombs =
    levelNum <= 100
      ? [39, 50, 64, 70, 76, 80, 86, 90, 96, 100].includes(levelNum)
      : difficultyTier === 'nightmare' ||
        isSeasonFinale ||
        (isBoss && levelNum % 20 === 0) ||
        (seasonId >= 3 && levelNum % 6 === 0);
  if (wantsBombs) {
    const startTimer =
      actualFiendfyre > 0
        ? 11
        : seasonId >= 5
          ? 9
          : seasonId >= 3
            ? 10
            : levelNum >= 80
              ? 10
              : 12;
    bombConfig = {
      initialCount: isSeasonFinale || (seasonId >= 4 && difficultyTier === 'nightmare') ? 2 : 1,
      intervalMoves: seasonId >= 5 ? 5 : 6,
      startTimer
    };
  }

  // 9. Số màu kẹo trên bàn cờ (6 màu xuất hiện ngay từ Màn 7 Khó!)
  const specialOrder = getSpecialOrderSpec(levelNum, seasonId, isBoss, isSeasonFinale, actualDecrees > 0);
  let numColors = 6;
  if (levelNum <= 6) {
    numColors = 5;
  } else if (specialOrder) {
    numColors = seasonId >= 5 && specialOrder.specialKind !== 'color_bomb' ? 6 : 5;
  } else if (seasonId === 1) {
    numColors = isSpike || levelNum >= 30 ? (levelNum % 5 === 1 && !isSpike ? 5 : 6) : levelNum % 2 === 0 ? 6 : 5;
  } else {
    // Năm 2–7: 90%+ bàn cờ 6 màu, chỉ xen kẽ 5 màu ở vài nhịp thở chiến thuật
    numColors = !isSpike && levelNum % 11 === 4 ? 5 : 6;
  }

  // 10. Ngân sách Lượt đi siết chặt chuẩn Candy Crush Saga (loại bỏ hoàn toàn tình trạng thừa 10+ lượt ở 100 màn đầu!)
  let moves = 18;
  if (levelNum <= 3) {
    moves = levelNum === 3 ? 17 : 18;
  } else if (levelNum <= 100) {
    if (isBoss) moves = levelNum === 100 ? 24 : 20 + Math.floor(levelNum / 45);
    else if (difficultyTier === 'nightmare') moves = 15 + (levelNum >= 60 ? 1 : 0);
    else if (difficultyTier === 'hard') moves = 16 + (levelNum % 2);
    else moves = 17 + (levelNum % 3); // 17–19 lượt cho màn thường!
  } else {
    // Năm 2–7: cân bằng chặt theo bậc vật cản 4–5 lớp & quy mô bàn 9×9 / 10×10
    const highYearPad = seasonId >= 5 ? 2 : seasonId >= 3 ? 1 : 0;
    if (isSeasonFinale) moves = 25 + Math.floor(seasonId / 3);
    else if (isBoss) moves = 21 + highYearPad;
    else if (difficultyTier === 'nightmare' || isExamTrial) moves = 16 + highYearPad;
    else if (difficultyTier === 'hard') moves = 17 + highYearPad;
    else moves = 18 + (levelNum % 2) + highYearPad;
  }

  if (hasIngredients && !isBoss) moves += 1;
  if (actualHorcruxes >= 4 && !isBoss) moves += 1;

  // 11. Ngưỡng 1–2–3 Sao tăng trưởng theo Năm Học & Độ Khó
  const baseStar1 =
    2600 +
    Math.min(100, levelNum) * 160 +
    (seasonId - 1) * 5200 +
    Math.round(seasonProgress * 3800) +
    (isSeasonFinale ? 6500 : isBoss ? 2400 : isSpike ? 1100 : 0);
  const stars = [
    Math.round(baseStar1 / 100) * 100,
    Math.round((baseStar1 * 1.72) / 100) * 100,
    Math.round((baseStar1 * 2.55) / 100) * 100
  ];

  // 12. Thiết lập tối đa 3 Mục Tiêu (Objectives) cho 1 hàng HUD dọc (kể cả khi bàn cờ có 4–5 cơ chế đồng thời!)
  const objectives = [];

  if (isScoreOnly) {
    objectives.push({ type: 'score', target: stars[1], label: 'Điểm Phép Thuật' });
  } else {
    if (bossConfig) {
      objectives.push({ type: 'boss', target: bossConfig.maxHp, label: bossConfig.shortTitle });
    }
    if (ingredientTarget > 0 && objectives.length < 3) {
      objectives.push({ type: 'ingredient', target: ingredientTarget, label: 'Thả Hòn Đá Phù Thủy' });
    }
    if (actualHorcruxes > 0 && objectives.length < 3) {
      objectives.push({ type: 'horcrux', target: actualHorcruxes, label: 'Huỷ Trường Sinh Linh Giá' });
    }
    if (actualDementors > 0 && (seasonId === 3 || objectives.length < 2) && objectives.length < 3) {
      objectives.push({ type: 'dementor', target: actualDementors, label: 'Thanh Tẩy Giám Ngục' });
    }
    if (actualDecrees > 0 && (seasonId === 5 || objectives.length < 2) && objectives.length < 3) {
      objectives.push({ type: 'decree', target: actualDecrees, label: 'Đập Bia Sắc Lệnh' });
    }
    if (actualFiendfyre > 0 && (seasonId === 6 || objectives.length < 2) && objectives.length < 3) {
      objectives.push({ type: 'fiendfyre', label: 'Dập Lửa Địa Ngục' });
    }
    if (actualPetrify > 0 && (seasonId === 2 || objectives.length === 0) && objectives.length < 3) {
      objectives.push({ type: 'petrify', target: actualPetrify, label: 'Giải Hoá Đá Tử Xà' });
    }
    if (actualCauldrons > 0 && objectives.length < 3) {
      objectives.push({ type: 'cauldron', target: actualCauldrons, label: 'Phá Vạc Độc Dược' });
    }
    if (actualLocks > 0 && objectives.length < 3) {
      objectives.push({ type: 'key_lock', target: actualLocks, label: 'Mở Khoá Gringotts' });
    }
    if (specialOrder && objectives.length < 3) {
      objectives.push({
        type: 'special_order',
        specialKind: specialOrder.specialKind,
        target: specialOrder.target
      });
    }
    if (actualJelly > 0 && objectives.length < 3) {
      objectives.push({ type: 'jelly', target: actualJelly, label: 'Phá Thạch Hắc Ám' });
    }
    if (actualFrosting > 0 && objectives.length < 3 && (objectives.length === 0 || levelNum % 2 === 1)) {
      objectives.push({ type: 'frosting', target: actualFrosting, label: 'Đập Đá Cổ Ngữ' });
    }
    if (actualChocolate > 0 && objectives.length < 3) {
      objectives.push({ type: 'chocolate', label: 'Diệt Sô-cô-la Lan' });
    }
    if (actualIce > 0 && objectives.length < 3 && (objectives.length === 0 || levelNum % 2 === 0)) {
      objectives.push({ type: 'ice', target: actualIce, label: 'Phá Băng Azkaban' });
    }

    if (objectives.length < 2 && !bossConfig && ingredientTarget === 0) {
      let preferredTile = (levelNum + seasonId * 2) % numColors;
      if (levelNum <= 12) preferredTile = levelNum % 2 === 0 ? 4 : 2;
      const multiplier = isSpike ? 1.95 : numColors === 6 ? 1.65 : 1.85;
      const collectTarget = Math.max(22, Math.round(moves * multiplier + seasonId * 3));
      objectives.push({
        type: 'collect',
        tileId: preferredTile,
        target: collectTarget
      });

      if (objectives.length === 1 && levelNum >= 2) {
        const secondTile = (preferredTile + 2) % numColors;
        objectives.push({
          type: 'collect',
          tileId: secondTile,
          target: Math.max(18, Math.round(collectTarget * 0.85))
        });
      }
    }
  }

  if (levelNum === 1) {
    objectives.length = 0;
    objectives.push({ type: 'collect', tileId: 4, target: 24 });
    objectives.push({ type: 'collect', tileId: 0, target: 24 });
  }

  return {
    id: levelNum,
    seasonId,
    chapterId: meta.globalChapterId,
    globalChapterId: meta.globalChapterId,
    chapterIndexInSeason: meta.chapterIndexInSeason,
    title: meta.title,
    difficultyTier,
    isBoss,
    isChapterBoss,
    isSeasonFinale,
    isExamTrial,
    bossConfig,
    size,
    numColors,
    moves,
    stars,
    rewardGalleons: meta.rewardGalleons,
    mask,
    jellyGrid,
    iceGrid,
    frostingGrid,
    chocolateGrid,
    cauldronGrid,
    lockGrid,
    swirlGrid,
    petrifyGrid,
    dementorGrid,
    decreeGrid,
    fiendfyreGrid,
    horcruxGrid,
    mazeConfig,
    conveyorLoops,
    ingredientTarget,
    ingredientSpawnCols,
    ingredientExitCells,
    portals,
    bombConfig,
    objectives
  };
}

// Bộ đệm LRU 64 màn chơi để vừa không tốn RAM khi khởi động vừa mở màn tức thời (< 0.2ms)
const LEVEL_CACHE = new Map();
const MAX_CACHE_ENTRIES = 64;

export function getLevelById(id) {
  const clamped = Math.max(1, Math.min(TOTAL_LEVELS, Math.floor(Number(id) || 1)));
  if (LEVEL_CACHE.has(clamped)) {
    return LEVEL_CACHE.get(clamped);
  }
  const generated = generateLevel(clamped);
  if (LEVEL_CACHE.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = LEVEL_CACHE.keys().next().value;
    LEVEL_CACHE.delete(oldestKey);
  }
  LEVEL_CACHE.set(clamped, generated);
  return generated;
}

// Giữ export 100 màn mở đầu cho các script kiểm thử cũ (nếu có)
export const SEASON_1_LEVELS = Array.from({ length: 100 }, (_, i) => getLevelById(i + 1));
