-- ============================================================
-- BANDDING MARKET (반띵마켓) - Supabase Complete Database Setup SQL
-- Supabase 대시보드 → SQL Editor에 이 전체 내용을 붙여넣고 RUN을 누르세요.
-- ============================================================

-- 1. PROFILES 테이블 (회원 및 상점 정보)
CREATE TABLE IF NOT EXISTS public.profiles (
  id                UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  phone             TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  role              TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('admin', 'seller', 'buyer')),
  store_name        TEXT,
  profile_image     TEXT,
  description       TEXT,
  is_approved       BOOLEAN NOT NULL DEFAULT false,
  partner_type      TEXT DEFAULT 'partner' CHECK (partner_type IN ('subsidiary', 'partner')),
  location_province TEXT DEFAULT 'Bangkok',
  location_address  TEXT,
  location_coords   TEXT,
  commission_rate   DECIMAL(5,2) DEFAULT 10.00,
  payout_method     TEXT DEFAULT 'parent_payment' CHECK (payout_method IN ('parent_payment', 'cod_commission')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS 테이블 (상품 정보)
CREATE TABLE IF NOT EXISTS public.products (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  price       DECIMAL(12,2) NOT NULL,
  images      TEXT[] DEFAULT '{}',
  category    TEXT DEFAULT 'Other',
  stock       INTEGER DEFAULT 1,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'hidden')),
  condition   TEXT DEFAULT 'Used' CHECK (condition IN ('New', 'Used S', 'Used A', 'Used B')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS 테이블 (주문 내역)
CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id          UUID REFERENCES public.profiles(id) NOT NULL,
  seller_id         UUID REFERENCES public.profiles(id) NOT NULL,
  product_id        UUID REFERENCES public.products(id) NOT NULL,
  quantity          INTEGER NOT NULL DEFAULT 1,
  total_price       DECIMAL(12,2) NOT NULL,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes             TEXT,
  payment_method    TEXT DEFAULT 'online' CHECK (payment_method IN ('online', 'cod')),
  commission_amount DECIMAL(12,2) DEFAULT 0.00,
  payout_status     TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'completed')),
  delivery_address  TEXT,
  tracking_company  TEXT,
  tracking_number   TEXT,
  deposit_confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CHAT_ROOMS 테이블 (채팅방)
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id  UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(buyer_id, seller_id, product_id)
);

-- 5. CHAT_MESSAGES 테이블 (채팅 메시지)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id      UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message      TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) 활성화
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 관리자 검사용 보안정의(SECURITY DEFINER) 함수 생성
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RLS 정책 설정
-- ============================================================

-- PROFILES 정책
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE USING (public.is_admin());
CREATE POLICY "profiles_delete_admin" ON public.profiles FOR DELETE USING (public.is_admin());

-- PRODUCTS 정책
CREATE POLICY "products_select_all"   ON public.products FOR SELECT USING (true);
CREATE POLICY "products_insert_seller" ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "products_update_seller" ON public.products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "products_delete_seller" ON public.products FOR DELETE USING (auth.uid() = seller_id);
CREATE POLICY "products_update_admin"  ON public.products FOR UPDATE USING (public.is_admin());
CREATE POLICY "products_delete_admin"  ON public.products FOR DELETE USING (public.is_admin());

-- ORDERS 정책
CREATE POLICY "orders_select_own"   ON public.orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "orders_insert_buyer"  ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "orders_update_seller" ON public.orders FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "orders_update_buyer"  ON public.orders FOR UPDATE USING (auth.uid() = buyer_id);
CREATE POLICY "orders_select_admin"  ON public.orders FOR SELECT USING (public.is_admin());
CREATE POLICY "orders_update_admin"  ON public.orders FOR UPDATE USING (public.is_admin());
CREATE POLICY "orders_delete_admin"  ON public.orders FOR DELETE USING (public.is_admin());

-- CHAT_ROOMS 정책
CREATE POLICY "rooms_select_own"  ON public.chat_rooms FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "rooms_insert_own"  ON public.chat_rooms FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "rooms_select_admin" ON public.chat_rooms FOR SELECT USING (public.is_admin());
CREATE POLICY "rooms_delete_admin" ON public.chat_rooms FOR DELETE USING (public.is_admin());

-- CHAT_MESSAGES 정책
CREATE POLICY "messages_select_own"   ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_rooms WHERE id = room_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
);
CREATE POLICY "messages_insert_own"   ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_select_admin" ON public.chat_messages FOR SELECT USING (public.is_admin());
CREATE POLICY "messages_delete_admin" ON public.chat_messages FOR DELETE USING (public.is_admin());

-- ============================================================
-- STORAGE BUCKETS (이미지/미디어 저장 버킷 생성)
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('chat_media', 'chat_media', true) ON CONFLICT DO NOTHING;

-- 스토리지 RLS 정책
CREATE POLICY "products_storage_select" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "products_storage_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
CREATE POLICY "products_storage_update" ON storage.objects FOR UPDATE USING (bucket_id = 'products' AND auth.role() = 'authenticated');
CREATE POLICY "products_storage_delete" ON storage.objects FOR DELETE USING (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "avatars_storage_select" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_storage_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "avatars_storage_update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "chat_media_storage_select" ON storage.objects FOR SELECT USING (bucket_id = 'chat_media');
CREATE POLICY "chat_media_storage_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat_media' AND auth.role() = 'authenticated');
CREATE POLICY "chat_media_storage_delete" ON storage.objects FOR DELETE USING (bucket_id = 'chat_media' AND ((auth.uid()::text = owner::text) OR (public.is_admin())));

-- ============================================================
-- 주문 발생 시 재고 자동 변경 및 취소 시 롤백용 트리거 작성
-- ============================================================
CREATE OR REPLACE FUNCTION public.manage_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
  v_current_stock INT;
  v_current_status TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 구체적인 트리거 논리 갱신
CREATE OR REPLACE FUNCTION public.manage_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
  v_current_stock INT;
  v_current_status TEXT;
BEGIN
  -- 1) 신규 주문 신청 시 (INSERT): 재고 차감 및 품절 처리
  IF (TG_OP = 'INSERT') THEN
    SELECT stock, status INTO v_current_stock, v_current_status 
    FROM public.products 
    WHERE id = NEW.product_id;
    
    IF v_current_status != 'active' OR v_current_stock < NEW.quantity THEN
      RAISE EXCEPTION 'This product is out of stock or already sold.';
    END IF;
    
    UPDATE public.products 
    SET 
      stock = GREATEST(0, v_current_stock - NEW.quantity),
      status = CASE WHEN (v_current_stock - NEW.quantity) <= 0 THEN 'sold' ELSE 'active' END
    WHERE id = NEW.product_id;
  
  -- 2) 주문 상태 변경 시 (UPDATE)
  ELSIF (TG_OP = 'UPDATE') THEN
    -- 주문이 'cancelled'로 변경되었을 때 재고 복구
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
      SELECT stock, status INTO v_current_stock, v_current_status 
      FROM public.products 
      WHERE id = NEW.product_id;
      
      UPDATE public.products 
      SET 
        stock = v_current_stock + NEW.quantity,
        status = CASE WHEN v_current_status = 'sold' THEN 'active' ELSE v_current_status END
      WHERE id = NEW.product_id;
      
    -- 취소되었던 주문이 다시 일반 상태로 원복될 때 재고 재차감
    ELSIF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
      SELECT stock, status INTO v_current_stock, v_current_status 
      FROM public.products 
      WHERE id = NEW.product_id;
      
      IF v_current_status != 'active' OR v_current_stock < NEW.quantity THEN
        RAISE EXCEPTION 'This product is out of stock or already sold.';
      END IF;
      
      UPDATE public.products 
      SET 
        stock = GREATEST(0, v_current_stock - NEW.quantity),
        status = CASE WHEN (v_current_stock - NEW.quantity) <= 0 THEN 'sold' ELSE 'active' END
      WHERE id = NEW.product_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS trg_manage_stock_on_order ON public.orders;
CREATE TRIGGER trg_manage_stock_on_order
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.manage_stock_on_order();

-- ============================================================
-- DB 세팅 완료!
-- ============================================================
