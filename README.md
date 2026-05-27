# 🌓 Bandding Market — 반띵마켓

**한국 기반의 1:N 초특가 재고/아웃렛 반값 할인 마트 쇼핑몰 플랫폼**

🌐 Site: [https://banddingmarket.github.io/bandding/](https://banddingmarket.github.io/bandding/)

---

## 📁 폴더 구조

```
bandding/
├── index.html                   ← 구매자 메인 홈 (상품 검색, 주문, 1:1 문의)
├── login.html                   ← 로그인 및 회원가입 (국가코드 +82 / +66 연동)
├── admin/
│   └── dashboard.html           ← 관리자 통합 대시보드 (상점 설정, 전체 상품 CRUD, 주문 처리)
├── css/
│   └── style.css                ← 분홍분홍 샤방샤방 체리 핑크 테마 스타일
├── js/
│   ├── config.js                ← Supabase 설정 및 실시간 환율 연동 유틸리티
│   └── i18n.js                  ← 다국어 리소스 (한국어 / 태국어)
└── supabase-complete-setup.sql  ← DB 통합 셋업 SQL (테이블, RLS, 스토리지, 재고 트리거)
```

---

## 🚀 시작 전 설정

### 1. Supabase DB 설정
1. [supabase.com](https://supabase.com) 대시보드 접속 및 새 프로젝트 생성
2. 좌측 **SQL Editor** 클릭 -> **New Query** 생성
3. `supabase-complete-setup.sql` 파일의 전체 내용을 복사해서 붙여넣고 **RUN** 클릭
4. 좌측 **Authentication -> Providers -> Email**의 **`Confirm email`** 설정을 **OFF**로 끄고 저장
5. **Authentication -> Providers -> Phone**을 **ON**으로 켜고 저장

### 2. 관리자 전화번호 설정
`js/config.js` 파일의 7번째 라인에서:
```javascript
const ADMIN_PHONE = '01012345678'; // ← 본인 전화번호 입력 (국가코드 및 대시 제외 숫자만)
```

### 3. GitHub에 업로드
```bash
git init
git add .
git commit -m "feat: 반띵마켓 개편 및 새 Supabase DB 구축 완료"
git branch -M main
git remote add origin https://github.com/banddingmarket/bandding.git
git push -u origin main --force
```

---

## 👥 회원 역할

| 역할 | 설명 | 접근 경로 |
|------|------|------|
| **관리자 (Admin)** | 직영점 상점 정보 관리, 상품 등록/수정/삭제, 고객 주문 및 1:1 문의 직접 처리 | `/admin/dashboard.html` |
| **구매자 (Buyer)** | 한국/태국 거주국가별 맞춤 배송 정보 조회, 실시간 환율 적용 가격 확인, 주문 신청 및 1:1 문의 | `/index.html` |

---

## 🔒 가입 및 로그인 방식

- **전화번호 + PIN 4자리** 가상 로그인
- 한국 국가코드(`+82`)와 태국 국가코드(`+66`) 모두 호환 지원
- 관리자 지정 번호(`ADMIN_PHONE`)로 최초 회원가입 시 자동 관리자(`admin`)로 계정이 활성화됩니다.

---

## 🛍️ 주요 기능 목록

### 구매자
- [x] 한국/태국 언어 지원 (KO / TH) 및 실시간 번역
- [x] 한국 거주 / 태국 거주 토글에 따른 국내 배송(1~2일) 및 국제 배송(7일) 정보 동적 전환
- [x] 실시간 환율 API(`open.er-api.com`)를 통한 원화/바트화 금액 병기 노출 (`₩10,000 (฿217)`)
- [x] 카테고리별(식품, 화장품, 의류, 전자제품, 기타) 상품 필터링 및 키워드/가격 검색
- [x] 1:1 라이브 실시간 문의 채팅 및 사진/동영상 첨부
- [x] 구매 요청 및 배송 추적, 주문 수락/반송 기능

### 관리자
- [x] 대시보드에서 신규 상품 직접 추가 및 기존 상품 상세 수정/삭제/노출 설정
- [x] 관리자 상점 프로필 설정 (소개글, 주소, 연락처 등)
- [x] 고객의 실시간 1:1 문의 대응 및 채팅 상담
- [x] 주문 수락, 송장 번호 등록 및 배송 완료 처리
- [x] DB 트리거를 통한 실시간 상품 재고 차감 및 취소 시 자동 재고 복구 시스템

---

Made with 🌸 by Bandding Market Team
