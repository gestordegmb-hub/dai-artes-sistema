-- Fixing security vulnerabilities identified by the linter
-- REVOKE EXECUTE on SECURITY DEFINER functions from PUBLIC, anon, and authenticated
-- These functions should only be called by the system (triggers) or via explicit server functions with service_role if needed.

REVOKE EXECUTE ON FUNCTION public.log_action(text, text, uuid, jsonb) FROM PUBLIC, anon, authenticated;

-- Ensure audit_logs is correctly scoped
-- The insert privilege is granted to authenticated, but we prefer using the log_action function.
-- However, for now, we follow the principle of revoking public execution of SECURITY DEFINER functions.
