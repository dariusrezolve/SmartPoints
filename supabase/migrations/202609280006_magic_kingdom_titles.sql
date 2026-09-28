update public.achievement_awards set badge_name = case milestone_stars when 5 then 'Rainbow Knight' when 10 then 'Unicorn Guardian' when 20 then 'Dragon Friend' when 35 then 'Star Champion' end;
