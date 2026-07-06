GRANT SELECT ON public.laptops TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.laptops TO authenticated;
GRANT ALL ON public.laptops TO service_role;