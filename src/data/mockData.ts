import type { ProductPreview, TrendingTemplate, VideoRecord } from '../types'

export const MOCK_PRODUCT: ProductPreview = {
  title: 'Đầm midi hoa nhí cổ vuông dáng xòe',
  category: 'Thời trang nữ',
  price: '289.000đ',
  image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85',
  description: 'Chất vải mềm nhẹ, form tôn dáng và dễ phối cho những buổi dạo phố mùa hè.',
  rating: '4.9',
  sales: '2,4k đã bán',
}

export const TRENDING_TEMPLATES: TrendingTemplate[] = [
  {
    id: 'son-moi-hot-trend',
    title: 'Review Mỹ Phẩm Hot Trend',
    label: 'Làm đẹp',
    product: {
      title: 'Serum dưỡng sáng da Vitamin C',
      category: 'Chăm sóc da',
      price: '189.000đ',
      image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1000&q=85',
      description: 'Kết cấu mỏng nhẹ, bổ sung Vitamin C giúp làn da trông tươi sáng và rạng rỡ hơn mỗi ngày.',
      rating: '4.8',
      sales: '5,2k đã bán',
    },
    script: 'Hook: Da trông tươi sáng hơn với bước dưỡng gọn nhẹ này!\n\nThân bài: Serum Vitamin C có kết cấu mỏng nhẹ, dễ thêm vào routine buổi sáng hoặc tối. Công thức giúp làn da trông rạng rỡ hơn mỗi ngày, giá tham khảo 189.000đ và đã có hơn 5,2k lượt bán.\n\nCTA: Nhấn vào giỏ hàng để xem chi tiết thành phần và ưu đãi chăm sóc da nhé!',
    voice: 'Nữ miền Nam ngọt ngào',
  },
  {
    id: 'ao-polo-nam-mua-he',
    title: 'Áo Polo Nam Mùa Hè',
    label: 'Thời trang nam',
    product: {
      title: 'Áo thun nam Polo cotton thoáng mát',
      category: 'Thời trang nam',
      price: '259.000đ',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85',
      description: 'Cotton mềm thoáng, cổ Polo giữ form và dễ phối cho ngày hè năng động.',
      rating: '4.8',
      sales: '3,1k đã bán',
    },
    script: 'Hook: Mùa hè cần một chiếc Polo mặc mát mà vẫn lịch sự!\n\nThân bài: Áo Polo nam cotton mềm thoáng, cổ áo giữ form gọn gàng và dễ phối cùng quần jeans hoặc kaki. Mặc đi làm, đi chơi đều hợp, giá tham khảo chỉ 259.000đ.\n\nCTA: Chọn màu và size phù hợp, nhấn vào giỏ hàng để xem ưu đãi nhé!',
    voice: 'Nam miền Bắc trầm ấm',
  },
  {
    id: 'tui-xach-da-cao-cap',
    title: 'Túi Xách Da Cao Cấp',
    label: 'Phụ kiện',
    product: {
      title: 'Túi xách da thanh lịch dễ phối đồ',
      category: 'Phụ kiện thời trang',
      price: '459.000đ',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85',
      description: 'Phom túi gọn thanh lịch, ngăn chứa tiện dụng và gam màu dễ kết hợp nhiều trang phục.',
      rating: '4.8',
      sales: '1,9k đã bán',
    },
    script: 'Hook: Chiếc túi nâng tầm outfit mà không cần phối đồ cầu kỳ!\n\nThân bài: Túi xách da có phom gọn thanh lịch, ngăn chứa đủ dùng cho những món đồ cần thiết và màu sắc dễ kết hợp từ công sở đến dạo phố. Giá tham khảo 459.000đ.\n\nCTA: Xem ngay các màu túi đang có và chọn chiếc hợp phong cách của bạn nhé!',
    voice: 'Nữ miền Nam ngọt ngào',
  },
  {
    id: 'may-xay-mini-gia-dinh',
    title: 'Đồ Gia Dụng Thông Minh',
    label: 'Gia dụng',
    product: {
      title: 'Máy xay mini đa năng cho gia đình',
      category: 'Đồ gia dụng',
      price: '359.000đ',
      image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1000&q=85',
      description: 'Thiết kế gọn, thao tác đơn giản giúp xay nhanh sinh tố và chuẩn bị đồ uống tại nhà.',
      rating: '4.8',
      sales: '2,2k đã bán',
    },
    script: 'Hook: Chuẩn bị ly sinh tố nhanh gọn ngay tại nhà với chiếc máy xay mini này!\n\nThân bài: Thiết kế nhỏ gọn, thao tác đơn giản giúp bạn xay nhanh trái cây và chuẩn bị đồ uống mỗi ngày mà không chiếm nhiều diện tích bếp. Giá tham khảo 359.000đ, sản phẩm đã có hơn 2,2k lượt bán.\n\nCTA: Nhấn vào giỏ hàng để xem dung tích, cách sử dụng và ưu đãi hiện có nhé!',
    voice: 'Nữ miền Nam ngọt ngào',
  },
]

const MENS_PRODUCTS: ProductPreview[] = [
  {
    title: 'Áo thun nam Polo cao cấp cotton',
    category: 'Thời trang nam',
    price: '259.000đ',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85',
    description: 'Cotton co giãn thoáng mát, cổ Polo đứng form và đường may gọn gàng cho phong cách nam tính mỗi ngày.',
    rating: '4.8',
    sales: '3,1k đã bán',
  },
  {
    title: 'Quần jogger nam thể thao co giãn',
    category: 'Thời trang nam',
    price: '319.000đ',
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1000&q=85',
    description: 'Vải co giãn nhẹ, lưng chun dễ mặc và dáng gọn năng động cho buổi tập lẫn ngày thường.',
    rating: '4.9',
    sales: '1,8k đã bán',
  },
]

const WOMENS_PRODUCTS: ProductPreview[] = [
  MOCK_PRODUCT,
  {
    title: 'Đầm nữ dáng chữ A thanh lịch',
    category: 'Thời trang nữ',
    price: '329.000đ',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85',
    description: 'Dáng chữ A nhẹ nhàng, chất liệu đứng form và thiết kế tinh tế phù hợp đi làm hay dạo phố.',
    rating: '4.9',
    sales: '1,6k đã bán',
  },
]

const BEAUTY_PRODUCTS: ProductPreview[] = [
  {
    title: 'Serum dưỡng sáng da Vitamin C',
    category: 'Chăm sóc da',
    price: '189.000đ',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1000&q=85',
    description: 'Kết cấu mỏng nhẹ, bổ sung Vitamin C giúp làn da trông tươi sáng và rạng rỡ hơn mỗi ngày.',
    rating: '4.8',
    sales: '5,2k đã bán',
  },
  {
    title: 'Son tint lì màu đỏ đất thời thượng',
    category: 'Trang điểm',
    price: '149.000đ',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1000&q=85',
    description: 'Chất son mịn nhẹ, màu đỏ đất dễ dùng và thiết kế nhỏ gọn tiện mang theo.',
    rating: '4.9',
    sales: '4,7k đã bán',
  },
]

const SHOES_PRODUCTS: ProductPreview[] = [
  {
    title: 'Giày sneaker nam đế êm năng động',
    category: 'Giày dép nam',
    price: '429.000đ',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',
    description: 'Đế nhẹ êm chân, phối màu trẻ trung và dễ kết hợp cùng trang phục đi học, đi làm hoặc dạo phố.',
    rating: '4.8',
    sales: '2,8k đã bán',
  },
  {
    title: 'Giày sneaker nữ đế mềm thanh lịch',
    category: 'Giày dép nữ',
    price: '379.000đ',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=85',
    description: 'Phom dáng gọn nhẹ, đế mềm thoải mái và kiểu dáng tối giản dễ phối với nhiều outfit.',
    rating: '4.9',
    sales: '1,9k đã bán',
  },
]

const TRENDING_PRODUCTS: ProductPreview[] = [
  ...WOMENS_PRODUCTS,
  ...MENS_PRODUCTS,
  ...BEAUTY_PRODUCTS,
  ...SHOES_PRODUCTS,
  {
    title: 'Tai nghe Bluetooth âm thanh sống động',
    category: 'Phụ kiện công nghệ',
    price: '399.000đ',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85',
    description: 'Kết nối ổn định, thiết kế gọn nhẹ và chất âm rõ ràng cho công việc lẫn giải trí.',
    rating: '4.8',
    sales: '6,3k đã bán',
  },
]

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
}

function chooseProduct(products: ProductPreview[], random: () => number) {
  const index = Math.min(products.length - 1, Math.floor(random() * products.length))
  return products[index]
}

export function analyzeMockProduct(input: string, random: () => number = Math.random): ProductPreview {
  const normalized = normalizeSearchText(input)
  const isMensProduct = /(^|[^a-z0-9])(nam|ao|quan|polo|jogger|the thao)(?=$|[^a-z0-9])/.test(normalized)
  const isBeautyProduct = /(^|[^a-z0-9])(my pham|serum|duong da|son|makeup|skin care|skincare)(?=$|[^a-z0-9])/.test(normalized)
  const isWomensProduct = /(^|[^a-z0-9])(nu|vay|dam|chan vay|women|girl|female)(?=$|[^a-z0-9])/.test(normalized)
  const isShoeProduct = /(^|[^a-z0-9])(giay|sneaker|giay cao got|sandal|dep)(?=$|[^a-z0-9])/.test(normalized)

  if (isShoeProduct) {
    if (isMensProduct) return chooseProduct([SHOES_PRODUCTS[0]], random)
    if (isWomensProduct) return chooseProduct([SHOES_PRODUCTS[1]], random)
    return chooseProduct(SHOES_PRODUCTS, random)
  }
  if (isMensProduct) return chooseProduct(MENS_PRODUCTS, random)
  if (isBeautyProduct) return chooseProduct(BEAUTY_PRODUCTS, random)
  if (isWomensProduct) return chooseProduct(WOMENS_PRODUCTS, random)
  return chooseProduct(TRENDING_PRODUCTS, random)
}

export function createMockScript(product: ProductPreview) {
  const isMenShoes = product.category === 'Giày dép nam'
  const isWomenShoes = product.category === 'Giày dép nữ'
  const isShoes = isMenShoes || isWomenShoes
  const hook = product.category === 'Thời trang nam' || isMenShoes
    ? `Hook: Anh em đang tìm ${product.title.toLocaleLowerCase('vi')} vừa đẹp vừa dễ mặc?`
    : product.category === 'Thời trang nữ' || isWomenShoes
      ? `Hook: Tìm được ${product.title.toLocaleLowerCase('vi')} xinh thế này là muốn chốt ngay!`
      : product.category === 'Chăm sóc da' || product.category === 'Trang điểm'
        ? `Hook: Thêm ngay ${product.title.toLocaleLowerCase('vi')} vào routine làm đẹp của bạn!`
        : `Hook: Món đồ đang được săn nhiều mà bạn không nên bỏ qua: ${product.title}!`
    const callToAction = isShoes
      ? 'CTA: Chọn size giày phù hợp và nhấn vào giỏ hàng để xem màu cùng ưu đãi hôm nay nhé!'
      : product.category === 'Thời trang nam'
      ? 'CTA: Nhấn vào giỏ hàng, chọn màu và size áo/quần phù hợp để xem ưu đãi hôm nay nhé!'
      : product.category === 'Thời trang nữ'
        ? 'CTA: Nhấn vào giỏ hàng, chọn màu và kích cỡ yêu thích để xem ưu đãi mới nhất nhé!'
        : product.category === 'Chăm sóc da' || product.category === 'Trang điểm'
          ? 'CTA: Nhấn vào giỏ hàng để xem chi tiết thành phần, màu sắc và ưu đãi làm đẹp hôm nay nhé!'
          : 'CTA: Nhấn vào giỏ hàng để xem thông số chi tiết và ưu đãi mới nhất của sản phẩm nhé!'

    return `${hook}\n\nThân bài: ${product.title} ${product.description} Hiện có giá ${product.price} và ${product.sales}, rất đáng để bạn tham khảo.\n\n${callToAction}`
}

const SAMPLE_SCRIPT = `Hook: Tìm được chiếc váy vừa xinh vừa dễ mặc đúng là chân ái mùa này!\n\nThân bài: Em đầm midi hoa nhí có cổ vuông tôn dáng, chất vải mềm nhẹ và form xòe cực kỳ thoải mái. Đi chơi, đi cà phê hay dạo phố đều hợp. Giá chỉ 289.000đ mà đã có hơn 2.000 lượt mua rồi.\n\nCTA: Nhấn vào giỏ hàng để xem màu và ưu đãi hôm nay nhé!`

export const MOCK_VIDEOS: VideoRecord[] = [
  {
    id: 'sample-1',
    title: 'Đầm midi hoa nhí cổ vuông',
    date: '02/10/2026',
    credits: 5,
    price: '289.000đ',
    image: MOCK_PRODUCT.image,
    script: SAMPLE_SCRIPT,
    voice: 'Nữ miền Nam ngọt ngào',
  },
  {
    id: 'sample-2',
    title: 'Áo cardigan dệt kim Hàn Quốc',
    date: '30/09/2026',
    credits: 5,
    price: '345.000đ',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=85',
    script: 'Một chiếc cardigan mềm mại, dễ phối và hợp cho những ngày se lạnh. Xem ngay bảng màu đang có và chọn mẫu yêu thích của bạn nhé!',
    voice: 'Nam miền Bắc trầm ấm',
  },
  {
    id: 'sample-3',
    title: 'Túi đeo vai mini thanh lịch',
    date: '28/09/2026',
    credits: 5,
    price: '219.000đ',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85',
    script: 'Nhỏ gọn mà đựng đủ mọi món cần thiết, chiếc túi mini này phối đồ nào cũng xinh. Giá đang rất dễ thương, bấm xem ngay nhé!',
    voice: 'Nữ miền Nam ngọt ngào',
  },
]
