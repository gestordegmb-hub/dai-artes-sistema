DELETE FROM public.budget_items;
DELETE FROM public.budgets;
DELETE FROM public.services;
DELETE FROM public.clients;
DELETE FROM public.settings;
DELETE FROM auth.users WHERE email = 'demo@daiartes.local';