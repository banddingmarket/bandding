const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'i18n.js');
let code = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to LF for easier replacement
code = code.replace(/\r\n/g, '\n');

// 1. Replace Korean header translations
const koTarget = `  ko: {
    app_title: "폰스위치허브",
    parent_company: "폰스위치허브 플랫폼",
    hero_badge: "✨ 태국 1위 중고 스마트폰 온·오프라인 직거래 허브",
    hero_title: "태국 최저가<br><span class='grad'>스마트폰 직거래</span>",
    hero_sub: "본사 직영점(아이리스 모바일) 및 전국 인증 대리점의 실재고 상품을 안전하게 구매하세요. 태국 전지역 배송 및 캐쉬온딜리버리(COD) 지원!",
    btn_shop_now: "🛍️ 지금 쇼핑하기",
    btn_register_seller: "💼 대리점 입점 신청",
    stat_products: "등록 상품",
    stat_sellers: "활성 매장/대리점",
    stat_orders: "성사된 거래",`;

const koRepl = `  ko: {
    app_title: "반띵마켓",
    parent_company: "반띵마켓 쇼핑몰",
    hero_badge: "✨ 재고/아웃렛 물건 싸게 파는 마트",
    hero_title: "초특가로 만나는<br><span class='grad'>재고 및 아웃렛 상품</span>",
    hero_sub: "식품, 화장품, 의류, 전자제품 등 다양한 고품질 재고 상품을 반값 이하의 최저가로 안전하게 득템하세요! 한국 본사에서 직배송합니다.",
    btn_shop_now: "🛍️ 지금 쇼핑하기",
    btn_register_seller: "💼 입점 신청",
    stat_products: "등록 상품",
    stat_sellers: "운영 부서",
    stat_orders: "완료된 주문",
    cat_all: "전체",
    cat_food: "식품 🍏",
    cat_cosmetics: "화장품 💄",
    cat_clothing: "의류 👕",
    cat_electronics: "전자제품 ⚡",
    cat_other: "기타 📦",
    residence_korea: "한국 거주 (Korea)",
    residence_thailand: "태국 거주 (Thailand)",
    shipping_desc_korea: "🚚 <b>[국내 배송]</b> 한국 내 거주자용 국내 배송으로, 배송 기간은 약 1~2일 소요됩니다.",
    shipping_desc_thailand: "✈️ <b>[태국 직배송]</b> 태국 내 거주자용 항공 배송으로, 배송 기간은 약 7일 소요됩니다.",`;

function normalize(str) {
  return str.replace(/\r\n/g, '\n').trim();
}

const indexKo = code.indexOf(normalize(koTarget));
if (indexKo !== -1) {
  code = code.replace(normalize(koTarget), normalize(koRepl));
  console.log('Ko translations updated.');
} else {
  console.log('Ko target translations not found.');
}

// 2. Replace Thai header translations
const thTarget = `  th: {
    app_title: "PHONE SWITCH HUB",
    parent_company: "แพลตฟอร์ม Phone Switch Hub",
    hero_badge: "✨ แหล่งซื้อขายมือถือมือสองอันดับ 1 ในไทย",
    hero_title: "ซื้อและขาย<br><span class='grad'>iPhone & Galaxy</span><br>ในประเทศไทย",
    hero_sub: "ซื้อสมาร์ทโฟนจากสาขา직영점 (Iris Mobile) และร้านค้าตัวแทนจำหน่ายที่ผ่านการตรวจสอบ จัดส่งทั่วไทยและรองรับ COD!",
    btn_shop_now: "🛍️ ช้อปเลย",
    btn_register_seller: "💼 สมัครเป็นร้านค้าตัวแทน",
    stat_products: "สินค้าทั้งหมด",
    stat_sellers: "สาขา/ตัวแทน",
    stat_orders: "รายการที่สำเร็จ",`;

const thRepl = `  th: {
    app_title: "BANDDING MARKET",
    parent_company: "ร้านค้า Bandding Market",
    hero_badge: "✨ มาร์ตสินค้าลดล้างสต็อกและเอาท์เล็ต",
    hero_title: "ช้อปสินค้าลดล้างสต็อก<br><span class='grad'>ราคาถูกพิเศษสุด</span>",
    hero_sub: "ซื้ออาหาร, เครื่องสำอาง, เสื้อผ้า, เครื่องใช้ไฟฟ้า และอื่น ๆ สภาพดีในราคาต่ำกว่าครึ่ง จัดส่งตรงจากสำนักงานใหญ่ในเกาหลีใต้!",
    btn_shop_now: "🛍️ ช้อปเลย",
    btn_register_seller: "💼 สมัครพันธมิตร",
    stat_products: "สินค้าทั้งหมด",
    stat_sellers: "แผนกบริการ",
    stat_orders: "รายการที่สำเร็จ",
    cat_all: "ทั้งหมด",
    cat_food: "อาหาร 🍏",
    cat_cosmetics: "เครื่องสำอาง 💄",
    cat_clothing: "เสื้อผ้า 👕",
    cat_electronics: "เครื่องใช้ไฟฟ้า ⚡",
    cat_other: "อื่นๆ 📦",
    residence_korea: "อาศัยอยู่ในเกาหลี (Korea)",
    residence_thailand: "อาศัยอยู่ในไทย (Thailand)",
    shipping_desc_korea: "🚚 <b>[จัดส่งในเกาหลี]</b> สำหรับผู้พักอาศัยในเกาหลี ระยะเวลาจัดส่งประมาณ 1-2 วัน",
    shipping_desc_thailand: "✈️ <b>[จัดส่งไปไทย]</b> จัดส่งทางอากาศไปยังประเทศไทย ระยะเวลาจัดส่งประมาณ 7 วัน",`;

const indexTh = code.indexOf(normalize(thTarget));
if (indexTh !== -1) {
  code = code.replace(normalize(thTarget), normalize(thRepl));
  console.log('Th translations updated.');
} else {
  console.log('Th target translations not found.');
}

// 3. Remove Myanmar section
const mmStartToken = ',\n  mm: {';
const mmStartIndex = code.indexOf(mmStartToken);
if (mmStartIndex !== -1) {
  const mmEndToken = '\n  }\n};';
  const mmEndIndex = code.indexOf(mmEndToken, mmStartIndex);
  if (mmEndIndex !== -1) {
    code = code.substring(0, mmStartIndex) + '\n  }\n};' + code.substring(mmEndIndex + mmEndToken.length);
    console.log('Myanmar translations removed.');
  } else {
    console.log('Myanmar end token not found.');
  }
} else {
  console.log('Myanmar start token not found.');
}

// 4. Update default language to 'ko'
code = code.replace('let currentLang = localStorage.getItem("iris_lang") || "th";', 'let currentLang = localStorage.getItem("iris_lang") || "ko";');
code = code.replace('let currentLang = localStorage.getItem("iris_lang") || "th"', 'let currentLang = localStorage.getItem("iris_lang") || "ko"');

// 5. Update getLangFlag function
const flagTarget = `function getLangFlag(lang) {
  const flags = { th: "🇹🇭 TH", mm: "🇲🇲 MM", ko: "🇰🇷 KO", en: "🇺🇸 EN" };
  return flags[lang] || lang.toUpperCase();
}`;

const flagRepl = `function getLangFlag(lang) {
  const flags = { ko: "🇰🇷 KO", th: "🇹🇭 TH" };
  return flags[lang] || lang.toUpperCase();
}`;

code = code.replace(normalize(flagTarget), normalize(flagRepl));

// Restore Windows CRLF line endings
code = code.replace(/\n/g, '\r\n');

fs.writeFileSync(filePath, code, 'utf8');
console.log('i18n.js processing completed successfully.');
