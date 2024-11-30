const { fakerEN: faker } = require('@faker-js/faker');
const Course = require('../models/product');
const User = require('../models/user');
const CategoryCourse = require('../models/category_product');

const sampleNames = [
  'Sữa phẩm dinh dưỡng - 850G', 'Sữa Bột Dễ Uống', 'Sữa Non tăng cường đề kháng', 'Sữa Bubs Supreme số 2 800g', 'Sữa hữu cơ A2 Protein Milk, Số 1',
  'Khẩu trang 3D bụi mịn, giảm tia UV', 'Khẩu trang Skater cho bé', 'Khẩu Trang Trẻ Em Tái Sử Dụng', 'Khẩu trang 4D', 'Khẩu trang 3 lớp Kids',
  'Nước giặt hương ban mai', 'Sữa Tắm Trẻ Em BZU BZU', 'Nước Giặt Xả Da Bé 800ml', 'Sữa Tắm Gội 200ml', 'Combo 2 sữa tắm kháng khuẩn',
  'Siro tăng cường đề kháng', 'Viên ngậm cây sồi cho bé', 'bổ sung vitamin và khoáng chất cho trẻ', 'Vitamin D3K2 LineaBon Drops 10ml', 'Dung dịch kẽm giúp xương chắc khỏe',
  'Bình sữa Hegen PPSU 150ml', 'Máy hút sữa điện đôi', 'Máy hút sữa điện Resonance 3', 'Bình sữa Pigeon', 'Bình sữa Moyuum PPSU nội địa'
];

const sampleDescriptions = [
  'Sữa Enfagrow Enspire 3 là sản phẩm cung cấp dưỡng chất quan trọng cho sự phát triển toàn diện của trẻ;; Với công thức đặc biệt bổ sung DHA và MFGM;; Sản phẩm hỗ trợ trí não và hệ miễn dịch một cách tối ưu;; Phù hợp với bé 3 tuổi;; sữa giúp trẻ phát triển tối đa trong giai đoạn quan trọng của sự phát triển;; Hương vị thơm ngon, dễ uống, sản phẩm này rất thích hợp cho bé sử dụng hàng ngày.','Sữa Enfagrow A+ Neuropro 3 là sự lựa chọn lý tưởng với công thức bổ sung FL HMO;; Giúp hỗ trợ hệ miễn dịch khỏe mạnh cho trẻ;; DHA trong sữa giúp phát triển trí não và tăng cường khả năng học hỏi;; Sản phẩm này phù hợp với bé 4 tuổi;; Hỗ trợ cả về phát triển trí não lẫn thể chất;; Với hương vị nhạt, dễ uống, sữa không gây ngán và phù hợp với sở thích của bé;; Phù hợp với bé 5 tuổi','Sữa non COLOS IgGOLD là sản phẩm lý tưởng để bổ sung kháng thể tự nhiên, giúp tăng cường sức đề kháng cho cả mẹ và trẻ em;; Công thức đặc biệt này giúp bảo vệ cơ thể khỏi các tác động từ môi trường bên ngoài;; Phù hợp với bé 5 tuổi, sản phẩm này giúp bé tăng cường sức khỏe và phòng ngừa bệnh tật;; Với hàm lượng IgG tự nhiên, sữa đảm bảo an toàn và hiệu quả trong việc nâng cao hệ miễn dịch.','Sữa Bubs Supreme số 2 cung cấp nguồn dinh dưỡng cao cấp, giúp trẻ phát triển một cách khỏe mạnh và toàn diện. Bổ sung đầy đủ các vitamin và khoáng chất, sản phẩm hỗ trợ phát triển cả về thể chất lẫn trí não. Phù hợp với bé 6 tuổi, sữa giúp trẻ phát triển hệ xương và hệ miễn dịch trong giai đoạn quan trọng này. Sản phẩm đạt chuẩn quốc tế, là lựa chọn lý tưởng cho bé trong giai đoạn ăn dặm.','Sữa Aptamil Essensis Organic là sản phẩm hữu cơ chứa protein A2, giúp hỗ trợ hệ tiêu hóa non nớt của trẻ một cách tối ưu. Công thức hoàn toàn hữu cơ, không chứa chất bảo quản hay phụ gia hóa học, đảm bảo an toàn tuyệt đối cho bé. Phù hợp với bé sơ sinh, sữa giúp bé phát triển toàn diện trong những tháng đầu đời. Với hương vị tự nhiên, dễ uống, sản phẩm này rất nhẹ nhàng cho hệ tiêu hóa của trẻ.',
  'Khẩu trang 3D trẻ em Pharmacity được thiết kế đặc biệt để lọc bụi mịn, giảm tia UV và bảo vệ làn da nhạy cảm của trẻ. Với cấu trúc 3D ôm sát khuôn mặt, khẩu trang mang lại cảm giác thoải mái và thông thoáng cho bé suốt cả ngày. Phù hợp cho bé từ 5 tuổi, giúp bé an toàn trong môi trường có nhiều bụi bẩn và ánh nắng mạnh. Sản phẩm được đóng gói tiện lợi với 5 chiếc, thuận tiện cho việc sử dụng hàng ngày.','Set khẩu trang Skater với hình ảnh dễ thương của Micky mang lại niềm vui cho bé khi sử dụng. Được làm từ chất liệu cao cấp, khẩu trang mềm mại và an toàn cho da bé. Phù hợp với bé 4 tuổi, giúp bảo vệ bé khỏi các tác nhân gây hại từ môi trường. Với thiết kế nhiều màu sắc và hình ảnh sống động, bé sẽ thích thú khi đeo khẩu trang này mỗi ngày.','Khẩu trang tái sử dụng 3 lớp cho trẻ em được làm từ chất liệu an toàn, có thể giặt và sử dụng nhiều lần mà vẫn giữ được hiệu quả lọc bụi. Với 3 lớp bảo vệ, khẩu trang đảm bảo lọc được bụi mịn, vi khuẩn, và các chất ô nhiễm khác. Phù hợp với bé 6 tuổi, khẩu trang này không chỉ giúp bảo vệ sức khỏe mà còn thân thiện với môi trường. Thiết kế thông thoáng, tạo sự thoải mái khi bé sử dụng cả ngày.','Khẩu trang 4D với hoa văn dễ thương được thiết kế riêng cho bé gái, vừa vặn và ôm sát khuôn mặt để bảo vệ toàn diện. Chất liệu mềm mại và không gây kích ứng da, giúp bé cảm thấy thoải mái khi đeo. Phù hợp với bé 7 tuổi, khẩu trang không chỉ bảo vệ khỏi bụi bẩn và vi khuẩn mà còn là phụ kiện thời trang xinh xắn. Với thiết kế 4D hiện đại, bé có thể sử dụng cả khi đi học hoặc ra ngoài.','Khẩu trang 3 lớp Mask For Kids được thiết kế để lọc sạch bụi bẩn, vi khuẩn, và các chất ô nhiễm trong không khí. Với cấu tạo từ chất liệu cao cấp, khẩu trang mang đến sự an toàn và thoải mái cho bé khi đeo. Phù hợp với bé 5 tuổi, giúp bé bảo vệ sức khỏe trong các hoạt động hàng ngày. Khẩu trang có kiểu dáng dễ thương, vừa vặn với khuôn mặt trẻ, đảm bảo sự thoải mái khi sử dụng.',
  'Nước giặt Lalabebe K-mom với công thức thuần chay, an toàn cho làn da nhạy cảm của bé và không chứa các chất hóa học độc hại. Hương ban mai dịu nhẹ mang lại cảm giác dễ chịu cho quần áo sau khi giặt, giúp giữ mùi thơm tươi mới. Phù hợp cho trẻ sơ sinh và trẻ nhỏ, sản phẩm đảm bảo an toàn khi tiếp xúc trực tiếp với da bé. Chai lớn 1.7L tiện dụng, phù hợp cho việc sử dụng lâu dài.','Sữa tắm trẻ em BZU BZU với công thức nhẹ nhàng, giúp làm sạch da mà không gây khô rát, đặc biệt phù hợp cho làn da nhạy cảm của trẻ. Sản phẩm bổ sung dưỡng chất giúp da bé mềm mịn và khỏe mạnh. Phù hợp với trẻ từ 2 tuổi, sữa tắm giúp bảo vệ làn da mỏng manh khỏi tác động từ môi trường. Chai 600ml tiện lợi, phù hợp cho việc sử dụng hàng ngày.','Nước giặt xả vải BZU BZU 2 trong 1 giúp giặt sạch quần áo bé và giữ vải mềm mại mà không cần thêm nước xả. Công thức dịu nhẹ, an toàn cho da nhạy cảm và không gây kích ứng, phù hợp với cả làn da mỏng manh của bé. Phù hợp cho trẻ từ 6 tháng tuổi, sản phẩm giúp bảo vệ da bé khỏi các tác nhân gây kích ứng từ quần áo. Chai 800ml nhỏ gọn, tiện lợi cho việc sử dụng hàng ngày.','Sữa tắm gội toàn thân BZU BZU dành riêng cho bé với công thức nhẹ nhàng, không gây kích ứng cho da và tóc. Sản phẩm giúp làm sạch hiệu quả, đồng thời giữ cho da bé luôn mềm mịn và thơm mát. Phù hợp với bé 1 tuổi, sản phẩm an toàn và lý tưởng cho cả tắm và gội hàng ngày. Chai nhỏ 200ml dễ dàng mang theo khi đi du lịch hoặc sử dụng hàng ngày.','Sữa tắm Dettol Cool kháng khuẩn giúp làm sạch da và loại bỏ vi khuẩn, đồng thời mang lại cảm giác mát lạnh sảng khoái tức thì. Công thức kháng khuẩn mạnh mẽ nhưng an toàn, giúp bảo vệ làn da của cả gia đình khỏi vi khuẩn gây hại. Phù hợp cho trẻ từ 5 tuổi, sản phẩm không chỉ bảo vệ da mà còn mang lại cảm giác thư giãn, mát mẻ sau khi tắm. Combo 2 chai 950g tiết kiệm, lý tưởng cho cả gia đình sử dụng.',
  'Siro Immunix3 children là sản phẩm tăng cường đề kháng cho trẻ, nhập khẩu chính hãng từ Châu Âu, đảm bảo chất lượng và an toàn cho bé. Với thành phần giàu dưỡng chất và vitamin, sản phẩm giúp hỗ trợ hệ miễn dịch và bảo vệ bé khỏi các tác nhân gây hại từ môi trường. Phù hợp với trẻ từ 1 tuổi, siro giúp bé phát triển khỏe mạnh và tăng sức đề kháng tự nhiên. Chai 150ml tiện dụng, dễ dùng, giúp bé hấp thụ dễ dàng mỗi ngày.','Viên ngậm GS Imunostim junior chứa chiết xuất từ cây sồi, giúp tăng cường đề kháng cho hệ hô hấp của trẻ một cách tự nhiên. Sản phẩm an toàn và hiệu quả, giúp giảm nguy cơ mắc các bệnh về đường hô hấp trong thời gian thay đổi thời tiết. Phù hợp với trẻ từ 3 tuổi, viên ngậm giúp hỗ trợ bé khỏe mạnh, phòng tránh cảm cúm và các bệnh về phổi. Hương vị dễ chịu, bé sẽ thích thú khi sử dụng hàng ngày.','Siro Wellbaby Multi-Vitamin Liquid của Vitabiotics là giải pháp hoàn hảo để bổ sung vitamin và khoáng chất cần thiết cho sự phát triển của trẻ. Công thức giàu các vitamin A, C, D và khoáng chất giúp tăng cường sức khỏe và phát triển toàn diện. Phù hợp với bé từ 6 tháng tuổi, sản phẩm giúp bé hấp thụ đủ dưỡng chất trong giai đoạn quan trọng của sự phát triển. Chai 150ml dễ dàng sử dụng, hỗ trợ bé tăng cường đề kháng và phát triển khỏe mạnh.','Vitamin D3K2 LineaBon Drops là sự kết hợp hoàn hảo giữa vitamin D3 và K2, giúp hỗ trợ sự phát triển xương chắc khỏe và tăng cường hấp thụ canxi. Sản phẩm giúp trẻ phát triển tốt về chiều cao và hệ xương, đồng thời hỗ trợ hệ miễn dịch. Phù hợp với bé từ 1 tuổi, sản phẩm nhỏ gọn 10ml dễ sử dụng và tiện lợi cho việc bổ sung hàng ngày. Đặc biệt, sản phẩm đang có Hot Deal hấp dẫn, giúp các bậc phụ huynh tiết kiệm chi phí mà vẫn đảm bảo chất lượng cho bé.','Dung dịch Osteocare Liquid của Vitabiotics cung cấp đầy đủ canxi, magiê, vitamin D và kẽm, hỗ trợ sự phát triển và duy trì xương chắc khỏe cho trẻ. Công thức dễ hấp thụ, giúp bổ sung các dưỡng chất quan trọng cho sự phát triển xương và răng. Phù hợp với trẻ từ 2 tuổi, sản phẩm giúp bé phát triển chiều cao và giữ cho hệ xương luôn khỏe mạnh. Chai 200ml dễ sử dụng, là lựa chọn tối ưu để bảo vệ sức khỏe xương của trẻ trong giai đoạn phát triển.',
'Bình sữa Hegen PPSU 150ml được làm từ chất liệu nhựa PPSU cao cấp, an toàn và bền bỉ, chịu nhiệt tốt. Thiết kế núm ti mềm mại và chống sặc, giúp bé bú thoải mái mà không lo bị đầy hơi. Phù hợp cho trẻ sơ sinh từ 0 tháng tuổi, bình sữa này giúp mẹ dễ dàng chăm sóc bé. Bình có thể chuyển đổi dễ dàng thành hộp đựng thức ăn, tiện lợi cho mẹ và bé.','Máy hút sữa điện đôi Medela Freestyle Flex là sản phẩm cao cấp với công nghệ hút sữa 2 pha, mô phỏng quá trình bú tự nhiên của bé, giúp mẹ hút sữa nhanh chóng và hiệu quả. Với thiết kế nhỏ gọn, pin sạc tiện lợi, mẹ có thể dễ dàng mang theo khi di chuyển. Phù hợp cho mẹ nuôi con bú từ 6 tháng tuổi trở lên, máy giúp mẹ duy trì nguồn sữa một cách dễ dàng và thoải mái.','Máy hút sữa điện đôi Fatzbaby Resonance 3 mang đến khả năng hút sữa mạnh mẽ nhưng êm ái, giúp mẹ cảm thấy thoải mái trong suốt quá trình sử dụng. Với 9 cấp độ hút và chế độ massage, sản phẩm giúp mẹ điều chỉnh phù hợp với nhu cầu của mình. Phù hợp cho mẹ đang cho bé bú, sản phẩm giúp duy trì nguồn sữa hiệu quả. Máy kèm theo adapter tiện lợi, dễ sử dụng ngay cả khi mẹ ở nhà hoặc nơi làm việc.','Bình sữa Pigeon PPSU Plus thế hệ III phiên bản Nhật được thiết kế với chất liệu nhựa PPSU cao cấp, an toàn cho bé và có độ bền vượt trội. Với núm ti siêu mềm và khả năng chống sặc, bình giúp bé bú một cách thoải mái và dễ dàng. Phù hợp với bé 2 tuổi, bình sữa có hai dung tích 160ml và 240ml để lựa chọn theo nhu cầu sử dụng. Hình hoa đáng yêu trên bình tạo cảm giác vui tươi, hấp dẫn với bé.','Bình sữa Moyuum PPSU nội địa Hàn Quốc có dung tích 270ml, được làm từ chất liệu PPSU an toàn, chịu nhiệt và bền bỉ. Núm ti mềm mại, chống sặc, giúp bé bú thoải mái mà không lo bị khó chịu. Phù hợp với bé từ 3 tháng tuổi, bình sữa Moyuum hỗ trợ bé phát triển khỏe mạnh nhờ thiết kế thông minh và tiện lợi. Phiên bản lạc đà độc đáo và dễ thương khiến bé thích thú khi sử dụng mỗi ngày.'
];
const updatedDescriptions = sampleDescriptions.map(description => description.replaceAll('.', ';;'));
const sampleCategoryCourseIds = [
  1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5
];

const sampleImage = [
  'anh1.png', 'anh2.png', 'anh3.png', 'anh4.png', 'anh5.png', 'anh6.jpg', 'anh7.jpg', 'anh8.png', 'anh9.jpg', 'anh10.jpg',
  'anh11.jpg', 'anh12.png', 'anh13.png', 'anh14.png', 'anh15.png', 'anh16.png', 'anh17.png', 'anh18.png', 'anh19.jpg', 'anh20.png',
  'anh21.jpg', 'anh22.png', 'anh23.png', 'anh24.png', 'anh25.jpg'
];

const hardcodedUserId = 1; // Change this to your specific user ID

const generateCourses = async () => {
  const courses = [];

  for (let i = 0; i < sampleNames.length; i++) {
    const name = sampleNames[i];
    const description = updatedDescriptions[i];
    const categoryCourseId = sampleCategoryCourseIds[i]; // Assign category ID from sample array
    const image = sampleImage[i]; // Assign hardcoded image from array
    const price = faker.number.int({ min: 50, max: 1000 }); // Generate random price
    const discount = faker.number.int({ min: 30, max: 500 });
    courses.push({
      categoryCourseId, // Use category ID from array
      name,
      description,
      assignedBy: hardcodedUserId,
      Discount: discount,
      Inventory_quantity: 100, // Hardcoded inventory quantity
      createAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      locationPath: image, // Use hardcoded image
      price,
      publicStatus: 1,
      status: 1,
      // number_star: 0,
      publicDate: faker.date.past()
    });
  }
  return courses;
};

const seedCourses = async () => {
  try {
    const count = await Course.count();
    if (count === 0) {
      const courses = await generateCourses();
      await Course.bulkCreate(courses, { validate: true });
    } else {
      // console.log('Courses table is not empty.');
    }
  } catch (error) {
    // console.log(`Failed to seed Courses data: ${error}`);
  }
};

module.exports = seedCourses;
