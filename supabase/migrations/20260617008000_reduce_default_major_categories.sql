delete from public.offline_marketing_categories
where id in ('cat_menu_new', 'cat_menu')
   or parent_id = 'cat_menu';
