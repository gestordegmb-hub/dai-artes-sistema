-- Update log_action to accept an optional user_id from service_role calls
CREATE OR REPLACE FUNCTION public.log_action(
    _action text,
    _resource_type text,
    _resource_id uuid default null,
    _details jsonb default '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Determine the user ID: 
  -- 1. Try auth.uid() (for RLS/authenticated users if granted)
  -- 2. Try user_id_override from details (for service_role calls)
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL AND (_details->>'user_id_override') IS NOT NULL THEN
    current_user_id := (_details->>'user_id_override')::uuid;
  END IF;

  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details)
  VALUES (current_user_id, _action, _resource_type, _resource_id, _details - 'user_id_override');
END;
$$;

-- Keep execution revoked for non-admin roles
REVOKE EXECUTE ON FUNCTION public.log_action(text, text, uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_action(text, text, uuid, jsonb) TO service_role;
