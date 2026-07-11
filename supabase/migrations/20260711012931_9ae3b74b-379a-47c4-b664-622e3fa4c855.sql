
DO $$
DECLARE
  demo_id uuid := '00000000-0000-0000-0000-000000000dae';
  demo_email text := 'demo@daiartes.local';
  demo_password text := 'daiartes-demo-2026';
  c1 uuid; c2 uuid; b1 uuid; b2 uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = demo_id) THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', demo_id, 'authenticated', 'authenticated',
      demo_email, extensions.crypt(demo_password, extensions.gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), demo_id, demo_id::text,
      jsonb_build_object('sub', demo_id::text, 'email', demo_email, 'email_verified', true),
      'email', now(), now(), now()
    );
  END IF;

  INSERT INTO public.settings (user_id, company_name, whatsapp, instagram, city)
  VALUES (demo_id, 'Dai Artes', '11999998888', '@daiartes', 'São Paulo')
  ON CONFLICT (user_id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.services WHERE user_id = demo_id) THEN
    INSERT INTO public.services (user_id, name, category, base_price, description) VALUES
      (demo_id, 'Convite Personalizado', 'Convites', 8.50, 'Convite impresso em papel especial'),
      (demo_id, 'Topo de Bolo', 'Festa', 25.00, 'Topo em papel cartão com arte exclusiva'),
      (demo_id, 'Caixa Personalizada', 'Embalagens', 12.00, 'Caixa montável com arte da festa'),
      (demo_id, 'Rótulo Adesivo', 'Rótulos', 1.50, 'Rótulo adesivo brilho para lembrancinhas'),
      (demo_id, 'Kit Festa Completo', 'Kits', 180.00, 'Convites, topo, caixas e rótulos');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.clients WHERE user_id = demo_id) THEN
    INSERT INTO public.clients (user_id, name, phone, notes) VALUES
      (demo_id, 'Ana Beatriz', '11987654321', 'Cliente indicada pela Camila'),
      (demo_id, 'Camila Souza', '11991234567', NULL),
      (demo_id, 'Juliana Prado', '11988887777', 'Prefere pastel rosa');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.budgets WHERE user_id = demo_id) THEN
    SELECT id INTO c1 FROM public.clients WHERE user_id = demo_id AND name = 'Ana Beatriz' LIMIT 1;
    SELECT id INTO c2 FROM public.clients WHERE user_id = demo_id AND name = 'Camila Souza' LIMIT 1;

    INSERT INTO public.budgets (user_id, client_id, subtotal, total, status, notes, number, delivery_date)
    VALUES (demo_id, c1, 170.00, 170.00, 'aprovado', 'Festa de 15 anos — tema jardim.', 1, (now() + interval '10 days')::date)
    RETURNING id INTO b1;
    INSERT INTO public.budget_items (budget_id, service_name, quantity, unit_price, subtotal, position) VALUES
      (b1, 'Convite Personalizado', 20, 8.50, 170.00, 0);

    INSERT INTO public.budgets (user_id, client_id, subtotal, total, status, notes, number, delivery_date)
    VALUES (demo_id, c2, 205.00, 205.00, 'pendente', 'Chá de bebê — tema nuvens.', 2, (now() + interval '15 days')::date)
    RETURNING id INTO b2;
    INSERT INTO public.budget_items (budget_id, service_name, quantity, unit_price, subtotal, position) VALUES
      (b2, 'Topo de Bolo', 1, 25.00, 25.00, 0),
      (b2, 'Rótulo Adesivo', 20, 1.50, 30.00, 1),
      (b2, 'Kit Festa Completo', 1, 150.00, 150.00, 2);
  END IF;
END $$;
