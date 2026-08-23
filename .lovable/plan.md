# Stabilization and Security Plan — Dai Artes

The system will be stabilized by restoring the correct navigation flow, implementing a robust RBAC (Role-Based Access Control) system with Supabase, and fixing authentication persistence and password recovery.

## User-Facing Changes
- **Root Navigation**: The home page will now correctly redirect users to the dashboard (if logged in) or the login page.
- **Admin Area**: A new "Administration" section will be visible to administrators to manage users (activate, deactivate, promote).
- **Security Settings**: Users will be able to change their passwords within their profile.
- **Password Recovery**: A fully functional "Forgot Password" flow will be implemented.
- **Login Persistence**: Authentication will be fixed to ensure users stay logged in between sessions.

## Technical Details
- **RBAC System**:
    - Create `app_role` enum (`admin`, `user`).
    - Create `user_roles` table with `user_id` and `role`.
    - Implement `has_role` security definer function.
    - Apply RLS policies to all tables to check for `admin` role where necessary.
- **Authentication**:
    - Update `src/routes/index.tsx` to redirect to `/dashboard`.
    - Ensure `supabase.auth.onAuthStateChange` correctly invalidates the router in `src/routes/__root.tsx`.
    - Implement password recovery using `supabase.auth.resetPasswordForEmail`.
- **User Management**:
    - Create a new route `src/routes/_authenticated/admin/users.tsx` (or similar) for user CRUD.
    - Implement server-side validation for admin actions.
- **Audit Logs**:
    - Utilize the existing `audit_logs` table to track administrative actions.

## Execution Steps
1. **Database Schema**:
    - Create `user_roles` table, `has_role` function, and initial RLS for admin access.
    - Grant `admin` role to the first user (based on an environment variable or a safe bootstrap process).
2. **Navigation Fix**:
    - Update `src/routes/index.tsx` to redirect to `/dashboard`.
3. **Admin UI**:
    - Implement the User Management dashboard under `/admin/users`.
4. **Auth Enhancements**:
    - Implement Forgot Password flow in `src/routes/auth.tsx`.
    - Implement Change Password in `src/routes/_authenticated/settings.tsx`.
5. **Validation**:
    - Verify all test cases provided in the instructions.
