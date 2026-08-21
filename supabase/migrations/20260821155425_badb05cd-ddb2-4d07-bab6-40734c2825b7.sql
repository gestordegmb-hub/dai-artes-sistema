-- Migrate existing services from 'Outros' to 'Papelaria'
UPDATE public.services 
SET category = 'Papelaria' 
WHERE category = 'Outros';

-- Ensure new demo data (if any) uses 'Papelaria' instead of 'Outros'
-- This handles future demo seeds that might still use the old name
CREATE OR REPLACE FUNCTION public.migrate_service_category()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category = 'Outros' THEN
    NEW.category := 'Papelaria';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_migrate_service_category ON public.services;
CREATE TRIGGER tr_migrate_service_category
BEFORE INSERT OR UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.migrate_service_category();
