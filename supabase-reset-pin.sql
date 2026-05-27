-- ============================================================
-- BANDDING MARKET (반띵마켓) - User PIN Reset PostgreSQL Function
-- Supabase 대시보드 → SQL Editor에 이 내용을 붙여넣고 RUN을 누르세요.
-- ============================================================

-- pgcrypto 익스텐션 활성화 (crypt, gen_salt 사용용)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 기존 함수가 있을 경우 삭제 후 재생성
DROP FUNCTION IF EXISTS public.reset_user_pin(UUID, TEXT, TEXT);

-- 보안 정의(SECURITY DEFINER)로 실행되는 PIN 초기화 RPC 함수 생성
CREATE OR REPLACE FUNCTION public.reset_user_pin(
  user_id UUID,
  user_phone TEXT,
  new_pin TEXT
)
RETURNS VOID AS $$
DECLARE
  v_new_password TEXT;
  v_clean_phone TEXT;
BEGIN
  -- 1. 현재 이 함수를 호출한 유저가 'admin' 권한을 가지고 있는지 검증
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION '접근 권한이 없습니다. 관리자만 구매자 PIN을 초기화할 수 있습니다. (Access denied)';
  END IF;

  -- 2. 해당 user_id와 전화번호가 profiles 테이블에 존재하는지 및 서로 일치하는지 검증
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND phone = user_phone
  ) THEN
    RAISE EXCEPTION '해당 회원을 찾을 수 없거나 전화번호가 일치하지 않습니다. (User profile not found)';
  END IF;

  -- 3. 비밀번호 조합 규칙 생성 (makePassword와 매칭: iris_PIN_전화번호숫자만)
  v_clean_phone := regexp_replace(user_phone, '\D', '', 'g');
  v_new_password := 'iris_' || new_pin || '_' || v_clean_phone;

  -- 4. auth.users 테이블의 암호화된 비밀번호(encrypted_password) 컬럼 직접 업데이트
  UPDATE auth.users
  SET encrypted_password = crypt(v_new_password, gen_salt('bf', 10))
  WHERE id = user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 권한 부여 (인증된 유저들이 RPC를 통해 실행할 수 있도록 허용)
GRANT EXECUTE ON FUNCTION public.reset_user_pin(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_user_pin(UUID, TEXT, TEXT) TO anon;

-- ============================================================
-- 5. CHAT_MESSAGES 테이블 구조 보완 및 실시간(Realtime) 통신 활성화
-- ============================================================
-- 5-1. 읽음 여부(is_read) 컬럼이 없을 경우 추가
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- 5-2. Supabase에서 Realtime 이벤트를 브로드캐스팅할 수 있도록 테이블을 추가합니다.
-- (만약 이미 추가되어 있다면 이 단계에서 오류가 날 수 있으나, 무시하고 진행하거나 처음 실행하시는 경우 필수입니다)
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- ============================================================
-- 6. ORDERS 테이블 장바구니 일괄 주문용 그룹 ID(cart_id) 컬럼 추가
-- ============================================================
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cart_id UUID;
