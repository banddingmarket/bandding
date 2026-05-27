-- ============================================================
-- BANDDING MARKET - Dynamic Categories Setup SQL
-- Supabase 대시보드 -> SQL Editor에 복사하여 실행(RUN)하세요.
-- ============================================================

-- 1. 카테고리 테이블 생성 (대분류 / 소분류 지원)
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  parent_id   UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, parent_id)
);

-- 2. 상품 테이블에 category_id 추가 (외래키 연결)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- 3. RLS(Row Level Security) 활성화
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 정의 (모든 사람 조회 가능, 관리자만 삽입/수정/삭제 가능)
DROP POLICY IF EXISTS "categories_select_all" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_admin" ON public.categories;
DROP POLICY IF EXISTS "categories_update_admin" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON public.categories;

CREATE POLICY "categories_select_all" ON public.categories 
  FOR SELECT USING (true);

CREATE POLICY "categories_insert_admin" ON public.categories 
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "categories_update_admin" ON public.categories 
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "categories_delete_admin" ON public.categories 
  FOR DELETE USING (public.is_admin());

-- 5. 기본 대분류 카테고리 마이그레이션용 데이터 초기 세팅
INSERT INTO public.categories (id, name, parent_id) VALUES 
  ('11111111-1111-1111-1111-111111111111', '식품', NULL),
  ('22222222-2222-2222-2222-222222222222', '화장품', NULL),
  ('33333333-3333-3333-3333-333333333333', '의류', NULL),
  ('44444444-4444-4444-4444-444444444444', '전자제품', NULL),
  ('55555555-5555-5555-5555-555555555555', '기타', NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 6. 기존 상품 데이터 마이그레이션 (기존의 텍스트 기반 카테고리를 새 category_id에 연결)
UPDATE public.products SET category_id = '11111111-1111-1111-1111-111111111111' 
  WHERE category IN ('Food', '식품') AND category_id IS NULL;

UPDATE public.products SET category_id = '22222222-2222-2222-2222-222222222222' 
  WHERE category IN ('Cosmetics', '화장품') AND category_id IS NULL;

UPDATE public.products SET category_id = '33333333-3333-3333-3333-333333333333' 
  WHERE category IN ('Clothing', '의류') AND category_id IS NULL;

UPDATE public.products SET category_id = '44444444-4444-4444-4444-444444444444' 
  WHERE category IN ('Electronics', '전자제품') AND category_id IS NULL;

UPDATE public.products SET category_id = '55555555-5555-5555-5555-555555555555' 
  WHERE category IN ('Other', '기타') AND category_id IS NULL;
