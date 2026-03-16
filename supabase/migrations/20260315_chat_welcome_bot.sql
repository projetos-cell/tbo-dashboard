-- #47 — Bot de boas-vindas
-- Adds welcome_message to chat_channels; a DB trigger fires on member join

ALTER TABLE chat_channels
  ADD COLUMN IF NOT EXISTS welcome_message TEXT;

COMMENT ON COLUMN chat_channels.welcome_message IS
  'Optional welcome message sent to new members when they join the channel.';

-- Function called by trigger to post a welcome message
CREATE OR REPLACE FUNCTION post_welcome_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_welcome TEXT;
  v_channel_name TEXT;
  v_user_name TEXT;
BEGIN
  -- Get welcome message and channel name
  SELECT welcome_message, name
    INTO v_welcome, v_channel_name
    FROM chat_channels
   WHERE id = NEW.channel_id;

  IF v_welcome IS NULL OR trim(v_welcome) = '' THEN
    RETURN NEW;
  END IF;

  -- Get new member name
  SELECT full_name INTO v_user_name FROM profiles WHERE id = NEW.user_id;

  -- Replace placeholders
  v_welcome := replace(v_welcome, '{user}', coalesce(v_user_name, 'Novo membro'));
  v_welcome := replace(v_welcome, '{channel}', coalesce(v_channel_name, ''));

  -- Insert bot message
  INSERT INTO chat_messages (channel_id, content, message_type, metadata)
  VALUES (
    NEW.channel_id,
    v_welcome,
    'bot',
    jsonb_build_object('bot_name', 'TBO Bot', 'event', 'member_join', 'user_id', NEW.user_id)
  );

  RETURN NEW;
END;
$$;

-- Trigger fires after a new member joins
DROP TRIGGER IF EXISTS trg_welcome_message ON chat_channel_members;
CREATE TRIGGER trg_welcome_message
  AFTER INSERT ON chat_channel_members
  FOR EACH ROW EXECUTE FUNCTION post_welcome_message();
