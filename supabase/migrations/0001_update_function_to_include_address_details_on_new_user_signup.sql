CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, company_name, vat_number, address_line_1, address_line_2, city, state_province_region, postal_code, country)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'company_name',
    new.raw_user_meta_data ->> 'vat_number',
    new.raw_user_meta_data ->> 'address_line_1',
    new.raw_user_meta_data ->> 'address_line_2',
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'state_province_region',
    new.raw_user_meta_data ->> 'postal_code',
    new.raw_user_meta_data ->> 'country'
  );
  RETURN new;
END;
$$;