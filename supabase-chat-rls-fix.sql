-- 0. 텔레그램 연동용 컬럼 추가
ALTER TABLE public.chat_rooms ADD COLUMN IF NOT EXISTS telegram_thread_id INT;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS telegram_msg_id TEXT;

-- 1. 테이블의 RLS(Row Level Security) 활성화 재확인
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 2. 기존 충돌 가능성 있는 정책들 일괄 삭제 (Drop Policies)
DROP POLICY IF EXISTS "rooms_select_own" ON public.chat_rooms;
DROP POLICY IF EXISTS "rooms_insert_own" ON public.chat_rooms;
DROP POLICY IF EXISTS "rooms_select_admin" ON public.chat_rooms;
DROP POLICY IF EXISTS "rooms_delete_admin" ON public.chat_rooms;

DROP POLICY IF EXISTS "messages_select_own" ON public.chat_messages;
DROP POLICY IF EXISTS "messages_insert_own" ON public.chat_messages;
DROP POLICY IF EXISTS "messages_update_own" ON public.chat_messages;
DROP POLICY IF EXISTS "messages_select_admin" ON public.chat_messages;
DROP POLICY IF EXISTS "messages_update_admin" ON public.chat_messages;
DROP POLICY IF EXISTS "messages_delete_admin" ON public.chat_messages;

-- 3. chat_rooms (채팅방) 관련 RLS 정책 설정
-- 3-1. 참여자(구매자 혹은 판매자) 본인의 채팅방만 조회(SELECT) 가능
CREATE POLICY "rooms_select_own" ON public.chat_rooms
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 3-2. 참여자(구매자 혹은 판매자) 본인의 채팅방만 생성(INSERT) 가능
CREATE POLICY "rooms_insert_own" ON public.chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 3-3. 서비스 관리자(Admin)는 모든 채팅방 조회(SELECT) 가능
CREATE POLICY "rooms_select_admin" ON public.chat_rooms
  FOR SELECT USING (public.is_admin());

-- 3-4. 서비스 관리자(Admin)는 모든 채팅방 삭제(DELETE) 가능
CREATE POLICY "rooms_delete_admin" ON public.chat_rooms
  FOR DELETE USING (public.is_admin());


-- 4. chat_messages (채팅 메시지) 관련 RLS 정책 설정
-- 4-1. 해당 대화방의 참여자(구매자 혹은 판매자)만 메시지 조회(SELECT) 가능
CREATE POLICY "messages_select_own" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = room_id 
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

-- 4-2. 본인이 발송인(sender_id)이고 대화방 참여자일 때만 메시지 전송(INSERT) 가능
CREATE POLICY "messages_insert_own" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id 
    AND EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = room_id 
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

-- 4-3. 대화방의 참여자는 상대방 메시지를 읽음 처리(UPDATE: is_read=true) 할 수 있도록 권한 부여
CREATE POLICY "messages_update_own" ON public.chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = room_id 
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

-- 4-4. 서비스 관리자(Admin)는 모든 메시지 조회(SELECT) 가능
CREATE POLICY "messages_select_admin" ON public.chat_messages
  FOR SELECT USING (public.is_admin());

-- 4-5. 서비스 관리자(Admin)는 모든 메시지 상태 업데이트(UPDATE) 가능
CREATE POLICY "messages_update_admin" ON public.chat_messages
  FOR UPDATE USING (public.is_admin());

-- 4-6. 서비스 관리자(Admin)는 모든 메시지 삭제(DELETE) 가능
CREATE POLICY "messages_delete_admin" ON public.chat_messages
  FOR DELETE USING (public.is_admin());
