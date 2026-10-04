
-- Roles
create type public.org_role as enum ('owner','admin','member','viewer');

create table public.profiles (
  id uuid primary key,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null,
  role public.org_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
grant select, update on public.organizations to authenticated;
grant all on public.organizations to service_role;
grant select on public.organization_members to authenticated;
grant all on public.organization_members to service_role;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

create or replace function public.is_org_member(_org uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.organization_members where organization_id=_org and user_id=_user)
$$;
create or replace function public.has_org_role(_org uuid, _user uuid, _roles public.org_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.organization_members where organization_id=_org and user_id=_user and role = any(_roles))
$$;

create policy "members read org" on public.organizations for select to authenticated using (public.is_org_member(id, auth.uid()));
create policy "admins update org" on public.organizations for update to authenticated using (public.has_org_role(id, auth.uid(), array['owner','admin']::public.org_role[]));
create policy "members read membership" on public.organization_members for select to authenticated using (public.is_org_member(organization_id, auth.uid()));

-- Locations
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  label text not null,
  provider text not null default 'mock',
  provider_reference text,
  postcode text,
  formatted_address text,
  input_text text,
  state text, lga text, district text, area text,
  latitude numeric, longitude numeric,
  resolution_status text not null default 'unresolved',
  confirmation_status text not null default 'unconfirmed',
  source_updated_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.locations(organization_id);
grant select, insert, update, delete on public.locations to authenticated;
grant all on public.locations to service_role;
alter table public.locations enable row level security;
create policy "members read locations" on public.locations for select to authenticated using (public.is_org_member(organization_id, auth.uid()));
create policy "editors insert locations" on public.locations for insert to authenticated with check (public.has_org_role(organization_id, auth.uid(), array['owner','admin','member']::public.org_role[]));
create policy "editors update locations" on public.locations for update to authenticated using (public.has_org_role(organization_id, auth.uid(), array['owner','admin','member']::public.org_role[]));
create policy "admins delete locations" on public.locations for delete to authenticated using (public.has_org_role(organization_id, auth.uid(), array['owner','admin']::public.org_role[]));

-- Verification requests
create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  reference text,
  recipient_name text,
  recipient_email text,
  recipient_phone text,
  purpose text,
  token_hash text not null,
  status text not null default 'created',
  expires_at timestamptz not null default now() + interval '7 days',
  opened_at timestamptz,
  completed_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.verification_requests(organization_id);
grant select, insert, update on public.verification_requests to authenticated;
grant all on public.verification_requests to service_role;
alter table public.verification_requests enable row level security;
create policy "members read vr" on public.verification_requests for select to authenticated using (public.is_org_member(organization_id, auth.uid()));
create policy "editors insert vr" on public.verification_requests for insert to authenticated with check (public.has_org_role(organization_id, auth.uid(), array['owner','admin','member']::public.org_role[]));
create policy "editors update vr" on public.verification_requests for update to authenticated using (public.has_org_role(organization_id, auth.uid(), array['owner','admin','member']::public.org_role[]));

create table public.verification_events (
  id uuid primary key default gen_random_uuid(),
  verification_request_id uuid not null references public.verification_requests(id) on delete cascade,
  organization_id uuid not null,
  event_type text not null,
  actor_type text not null,
  actor_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
grant select, insert on public.verification_events to authenticated;
grant all on public.verification_events to service_role;
alter table public.verification_events enable row level security;
create policy "members read ve" on public.verification_events for select to authenticated using (public.is_org_member(organization_id, auth.uid()));
create policy "editors insert ve" on public.verification_events for insert to authenticated with check (public.has_org_role(organization_id, auth.uid(), array['owner','admin','member']::public.org_role[]) and actor_id = auth.uid());

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  actor_user_id uuid,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index on public.audit_events(organization_id, created_at desc);
grant select, insert on public.audit_events to authenticated;
grant all on public.audit_events to service_role;
alter table public.audit_events enable row level security;
create policy "members read audit" on public.audit_events for select to authenticated using (public.is_org_member(organization_id, auth.uid()));
create policy "members insert audit" on public.audit_events for insert to authenticated with check (public.is_org_member(organization_id, auth.uid()) and actor_user_id = auth.uid());

-- New user bootstrap: profile, organization, demo data
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _org uuid := gen_random_uuid();
  _l1 uuid := gen_random_uuid(); _l2 uuid := gen_random_uuid(); _l3 uuid := gen_random_uuid(); _l4 uuid := gen_random_uuid();
  _v1 uuid := gen_random_uuid(); _v2 uuid := gen_random_uuid(); _v3 uuid := gen_random_uuid();
  _name text := coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1));
  _orgname text := coalesce(new.raw_user_meta_data->>'organization_name', _name || '''s organization');
begin
  insert into public.profiles(id, full_name, email) values (new.id, _name, new.email);
  insert into public.organizations(id, name, slug) values (_org, _orgname, 'org-' || substr(replace(_org::text,'-',''),1,10));
  insert into public.organization_members(organization_id, user_id, role) values (_org, new.id, 'owner');

  insert into public.locations(id, organization_id, label, provider, provider_reference, postcode, formatted_address, input_text, state, lga, district, area, latitude, longitude, resolution_status, confirmation_status, source_updated_at, created_by, created_at) values
  (_l1,_org,'Lekki Phase 1 warehouse','mock','mock_ref_1001','DEMO-LA-0001','Plot 14, Admiralty Way, Lekki Phase 1','opp. Mega Plaza, Admiralty way lekki','Lagos','Eti-Osa','Lekki','Lekki Phase 1',6.4474,3.4723,'resolved','confirmed',now()-interval '6 days',new.id,now()-interval '9 days'),
  (_l2,_org,'Wuse II pickup point','mock','mock_ref_1002','DEMO-FC-0002','12 Aminu Kano Crescent, Wuse II','aminu kano cres wuse 2 near Banex','Federal Capital Territory','Abuja Municipal','Wuse','Wuse II',9.0765,7.4704,'resolved','awaiting_confirmation',now()-interval '2 days',new.id,now()-interval '3 days'),
  (_l3,_org,'Customer — Ikeja GRA','mock','mock_ref_1003','DEMO-LA-0003','5 Isaac John Street, Ikeja GRA','isaac john st GRA ikeja','Lagos','Ikeja','Ikeja','Ikeja GRA',6.5795,3.3550,'resolved','rejected',now()-interval '1 day',new.id,now()-interval '2 days'),
  (_l4,_org,'Port Harcourt branch (pending)','mock',null,null,null,'off Aba road by Garrison junction, PH',null,null,null,null,null,null,'unresolved','unconfirmed',null,new.id,now()-interval '5 hours');

  insert into public.verification_requests(id, public_id, organization_id, location_id, reference, recipient_name, recipient_email, purpose, token_hash, status, expires_at, opened_at, completed_at, created_by, created_at) values
  (_v1,'vr_'||substr(md5(random()::text),1,12),_org,_l1,'ORD-48211','Chinedu Okafor','chinedu@example.com','Delivery address confirmation',md5(random()::text),'completed',now()+interval '3 days',now()-interval '6 days',now()-interval '6 days',new.id,now()-interval '7 days'),
  (_v2,'vr_'||substr(md5(random()::text),1,12),_org,_l2,'KYC-0932','Aisha Bello','aisha@example.com','Merchant onboarding',md5(random()::text),'awaiting_confirmation',now()+interval '5 days',now()-interval '2 days',null,new.id,now()-interval '3 days'),
  (_v3,'vr_'||substr(md5(random()::text),1,12),_org,null,'ORD-48390','Tunde Adeyemi','tunde@example.com','Delivery address confirmation',md5(random()::text),'sent',now()+interval '6 days',null,null,new.id,now()-interval '4 hours');

  insert into public.verification_events(verification_request_id, organization_id, event_type, actor_type, actor_id, created_at) values
  (_v1,_org,'created','user',new.id,now()-interval '7 days'),
  (_v1,_org,'opened','recipient',null,now()-interval '6 days 2 hours'),
  (_v1,_org,'location_resolved','system',null,now()-interval '6 days 1 hour'),
  (_v1,_org,'confirmed','recipient',null,now()-interval '6 days'),
  (_v1,_org,'completed','system',null,now()-interval '6 days'),
  (_v2,_org,'created','user',new.id,now()-interval '3 days'),
  (_v2,_org,'opened','recipient',null,now()-interval '2 days'),
  (_v2,_org,'location_resolved','system',null,now()-interval '2 days'),
  (_v3,_org,'created','user',new.id,now()-interval '4 hours');

  insert into public.audit_events(organization_id, actor_user_id, action, resource_type, resource_id, created_at) values
  (_org,new.id,'organization.created','organization',_org,now()-interval '10 days'),
  (_org,new.id,'location.created','location',_l1,now()-interval '9 days'),
  (_org,new.id,'verification_request.created','verification_request',_v1,now()-interval '7 days'),
  (_org,new.id,'location.created','location',_l4,now()-interval '5 hours'),
  (_org,new.id,'verification_request.created','verification_request',_v3,now()-interval '4 hours');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();
