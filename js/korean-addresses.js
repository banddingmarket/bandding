// Korea Metropolitan Cities and Provinces Address Data
const KOREAN_PROVINCES = [
  {
    name: "서울특별시",
    districts: ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"]
  },
  {
    name: "부산광역시",
    districts: ["강서구", "금정구", "기장군", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구"]
  },
  {
    name: "대구광역시",
    districts: ["남구", "달서구", "달성군", "동구", "북구", "서구", "수성구", "중구", "군위군"]
  },
  {
    name: "인천광역시",
    districts: ["강화군", "계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "옹진군", "중구"]
  },
  {
    name: "광주광역시",
    districts: ["광산구", "남구", "동구", "북구", "서구"]
  },
  {
    name: "대전광역시",
    districts: ["대덕구", "동구", "서구", "유성구", "중구"]
  },
  {
    name: "울산광역시",
    districts: ["남구", "동구", "북구", "울주군", "중구"]
  },
  {
    name: "세종특별자치시",
    districts: ["세종시"]
  },
  {
    name: "경기도",
    districts: ["수원시 권선구", "수원시 영통구", "수원시 장안구", "수원시 팔달구", "고양시 덕양구", "고양시 일산동구", "고양시 일산서구", "용인시 기흥구", "용인시 수지구", "용인시 처인구", "성남시 분당구", "성남시 수정구", "성남시 중원구", "부천시", "화성시", "안산시 단원구", "안산시 상록구", "남양주시", "안양시 동안구", "안양시 만안구", "평택시", "시흥시", "파주시", "의정부시", "김포시", "광주시", "광명시", "군포시", "하남시", "오산시", "양주시", "이천시", "구리시", "안성시", "포천시", "의왕시", "여주시", "양평군", "동두천시", "가평군", "과천시", "연천군"]
  },
  {
    name: "강원특별자치도",
    districts: ["춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시", "홍천군", "횡성군", "영월군", "평창군", "정선군", "철원군", "화천군", "양구군", "인제군", "고성군", "양양군"]
  },
  {
    name: "충청북도",
    districts: ["청주시 상당구", "청주시 서원구", "청주시 흥덕구", "청주시 청원구", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군", "진천군", "괴산군", "음성군", "단양군"]
  },
  {
    name: "충청남도",
    districts: ["천안시 동남구", "천안시 서북구", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시", "당진시", "금산군", "부여군", "서천군", "청양군", "홍성군", "예산군", "태안군"]
  },
  {
    name: "전북특별자치도",
    districts: ["전주시 완산구", "전주시 덕진구", "군산시", "익산시", "정읍시", "남원시", "김제시", "완주군", "진안군", "무주군", "장수군", "임실군", "순창군", "고창군", "부안군"]
  },
  {
    name: "전남특별자치도",
    districts: ["목포시", "여수시", "순천시", "나주시", "광양시", "담양군", "곡성군", "구례군", "고흥군", "보성군", "화순군", "장흥군", "강진군", "해남군", "영암군", "무안군", "함평군", "영광군", "장성군", "완도군", "진도군", "신안군"]
  },
  {
    name: "경상북도",
    districts: ["포항시 남구", "포항시 북구", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시", "상주시", "문경시", "경산시", "의성군", "청송군", "영양군", "영덕군", "청도군", "고령군", "성주군", "칠곡군", "예천군", "봉화군", "울진군", "울릉군"]
  },
  {
    name: "경상남도",
    districts: ["창원시 의창구", "창원시 성산구", "창원시 마산합포구", "창원시 마산회원구", "창원시 진해구", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시", "의령군", "함안군", "창녕군", "고성군", "남해군", "하동군", "산청군", "함양군", "거창군", "합천군"]
  },
  {
    name: "제주특별자치도",
    districts: ["제주시", "서귀포시"]
  }
];

// Helper to translate Korean text into English romanized text for foreigners
function romanizeKorean(text) {
  const fixedProvinces = {
    "서울특별시": "Seoul",
    "부산광역시": "Busan",
    "대구광역시": "Daegu",
    "인천광역시": "Incheon",
    "광주광역시": "Gwangju",
    "대전광역시": "Daejeon",
    "울산광역시": "Ulsan",
    "세종특별자치시": "Sejong",
    "경기도": "Gyeonggi-do",
    "강원특별자치도": "Gangwon-do",
    "충청북도": "Chungcheongbuk-do",
    "충청남도": "Chungcheongnam-do",
    "전북특별자치도": "Jeonbuk-do",
    "전남특별자치도": "Jeonnam-do",
    "경상북도": "Gyeongsangbuk-do",
    "경상남도": "Gyeongsangnam-do",
    "제주특별자치도": "Jeju-do"
  };

  if (fixedProvinces[text]) {
    return fixedProvinces[text];
  }

  const choList = ["g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"];
  const jungList = ["a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"];
  const jongList = ["", "g", "g", "gs", "n", "nj", "nh", "d", "l", "lg", "lm", "lb", "ls", "lt", "lp", "lh", "m", "b", "bs", "s", "ss", "ng", "j", "ch", "k", "t", "p", "h"];

  let result = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0) - 44032;

    if (code >= 0 && code <= 11172) {
      const cho = Math.floor(code / 588);
      const jung = Math.floor((code % 588) / 28);
      const jong = code % 28;

      let charRom = choList[cho] + jungList[jung] + jongList[jong];
      
      if (char === "구" && i === text.length - 1) charRom = "-gu";
      else if (char === "시" && i === text.length - 1) charRom = "-si";
      else if (char === "군" && i === text.length - 1) charRom = "-gun";
      
      result += charRom;
    } else {
      result += char;
    }
  }

  // Prettify hyphens and capitalize first letter
  result = result.replace(/-gu$/, "-gu").replace(/-si$/, "-si").replace(/-gun$/, "-gun");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Helper to initialize Korean address cascading dropdowns
function initKoreanAddressSelects(provinceSelectId, districtSelectId, initialProvince = '', initialDistrict = '') {
  const provSelect = document.getElementById(provinceSelectId);
  const distSelect = document.getElementById(districtSelectId);
  if (!provSelect || !distSelect) return;

  const selectProvLabel = typeof t === 'function' ? t('addr_select_province') : '시/도 선택';
  const selectDistLabel = typeof t === 'function' ? t('addr_select_district') : '시/군/구 선택';

  // Clear province dropdown
  provSelect.innerHTML = `<option value="">${selectProvLabel}</option>`;
  
  // Populate provinces with English names
  KOREAN_PROVINCES.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.name;
    opt.textContent = `${p.name} (${romanizeKorean(p.name)})`;
    provSelect.appendChild(opt);
  });

  // Handle province change event
  provSelect.addEventListener('change', function() {
    const selectedProvName = this.value;
    updateDistrictOptions(selectedProvName, '');
  });

  function updateDistrictOptions(provName, distName) {
    distSelect.innerHTML = `<option value="">${selectDistLabel}</option>`;
    if (!provName) {
      distSelect.disabled = true;
      return;
    }
    distSelect.disabled = false;

    const provinceData = KOREAN_PROVINCES.find(p => p.name === provName);
    if (provinceData && provinceData.districts) {
      provinceData.districts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = `${d} (${romanizeKorean(d)})`;
        distSelect.appendChild(opt);
      });
    }

    if (distName) {
      distSelect.value = distName;
    }
  }

  // Initial values setup
  if (initialProvince) {
    provSelect.value = initialProvince;
    updateDistrictOptions(initialProvince, initialDistrict);
  } else {
    distSelect.disabled = true;
  }
}

// Parse a Korean address string into province, district, and remaining detail
function parseKoreanAddress(address) {
  if (!address) return null;
  const cleaned = address.trim();
  
  // Province mappings including abbreviations
  const provinceMappings = [
    { name: "서울특별시", keys: ["서울특별시", "서울시", "서울"] },
    { name: "부산광역시", keys: ["부산광역시", "부산시", "부산"] },
    { name: "대구광역시", keys: ["대구광역시", "대구시", "대구"] },
    { name: "인천광역시", keys: ["인천광역시", "인천시", "인천"] },
    { name: "광주광역시", keys: ["광주광역시", "광주시", "광주"] },
    { name: "대전광역시", keys: ["대전광역시", "대전시", "대전"] },
    { name: "울산광역시", keys: ["울산광역시", "울산시", "울산"] },
    { name: "세종특별자치시", keys: ["세종특별자치시", "세종시", "세종"] },
    { name: "경기도", keys: ["경기도", "경기"] },
    { name: "강원특별자치도", keys: ["강원특별자치도", "강원도", "강원"] },
    { name: "충청북도", keys: ["충청북도", "충북"] },
    { name: "충청남도", keys: ["충청남도", "충남"] },
    { name: "전북특별자치도", keys: ["전북특별자치도", "전라북도", "전북"] },
    { name: "전남특별자치도", keys: ["전남특별자치도", "전라남도", "전남"] },
    { name: "경상북도", keys: ["경상북도", "경북"] },
    { name: "경상남도", keys: ["경상남도", "경남"] },
    { name: "제주특별자치도", keys: ["제주특별자치도", "제주도", "제주"] }
  ];
  
  let matchedProv = null;
  let matchedKey = null;
  
  for (const item of provinceMappings) {
    for (const key of item.keys) {
      if (cleaned.startsWith(key)) {
        if (!matchedKey || key.length > matchedKey.length) {
          matchedProv = item.name;
          matchedKey = key;
        }
      }
    }
  }
  
  if (!matchedProv) return null;
  
  let remaining = cleaned.substring(matchedKey.length).trim();
  let matchedDist = "";
  
  const provinceData = KOREAN_PROVINCES.find(kp => kp.name === matchedProv);
  if (provinceData) {
    const sortedDistricts = [...provinceData.districts].sort((a, b) => b.length - a.length);
    for (const kd of sortedDistricts) {
      if (remaining.startsWith(kd)) {
        matchedDist = kd;
        break;
      }
    }
  }
  
  return {
    province: matchedProv,
    district: matchedDist || null,
    remaining: matchedDist ? remaining.substring(matchedDist.length).trim() : remaining
  };
}

