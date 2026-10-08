ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.verification_requests ADD COLUMN IF NOT EXISTS message text;

CREATE TABLE public.organization_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.org_role NOT NULL DEFAULT 'viewer',
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked','expired')),
  invited_by uuid NOT NULL,
  accepted_by uuid,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.organization_invites TO authenticated;
GRANT ALL ON public.organization_invites TO service_role;
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read organization invites" ON public.organization_invites FOR SELECT TO authenticated USING (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin']::public.org_role[]));
CREATE POLICY "admins create organization invites" ON public.organization_invites FOR INSERT TO authenticated WITH CHECK (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin']::public.org_role[]) AND invited_by = auth.uid());
CREATE POLICY "admins update organization invites" ON public.organization_invites FOR UPDATE TO authenticated USING (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin']::public.org_role[])) WITH CHECK (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin']::public.org_role[]));
CREATE INDEX organization_invites_org_idx ON public.organization_invites(organization_id);
CREATE UNIQUE INDEX organization_invites_pending_email_idx ON public.organization_invites(organization_id, lower(email)) WHERE status = 'pending';

CREATE TABLE public.business_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  location_type text NOT NULL DEFAULT 'office' CHECK (location_type IN ('office','warehouse','retail','field_site','other')),
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  lga text,
  postcode text,
  latitude numeric,
  longitude numeric,
  is_primary boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_locations TO authenticated;
GRANT ALL ON public.business_locations TO service_role;
ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read business locations" ON public.business_locations FOR SELECT TO authenticated USING (public.is_org_member(organization_id, auth.uid()));
CREATE POLICY "editors create business locations" ON public.business_locations FOR INSERT TO authenticated WITH CHECK (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin','manager','member']::public.org_role[]) AND created_by = auth.uid());
CREATE POLICY "editors update business locations" ON public.business_locations FOR UPDATE TO authenticated USING (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin','manager','member']::public.org_role[])) WITH CHECK (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin','manager','member']::public.org_role[]));
CREATE POLICY "admins delete business locations" ON public.business_locations FOR DELETE TO authenticated USING (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin']::public.org_role[]));
CREATE INDEX business_locations_org_idx ON public.business_locations(organization_id);
CREATE UNIQUE INDEX business_locations_primary_idx ON public.business_locations(organization_id) WHERE is_primary AND is_active;

CREATE TABLE public.developer_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  environment text NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox','production')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled','archived')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.developer_projects TO authenticated;
GRANT ALL ON public.developer_projects TO service_role;
ALTER TABLE public.developer_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read developer projects" ON public.developer_projects FOR SELECT TO authenticated USING (public.is_org_member(organization_id, auth.uid()));
CREATE POLICY "developers create projects" ON public.developer_projects FOR INSERT TO authenticated WITH CHECK (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin','developer']::public.org_role[]) AND created_by = auth.uid());
CREATE POLICY "developers update projects" ON public.developer_projects FOR UPDATE TO authenticated USING (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin','developer']::public.org_role[])) WITH CHECK (public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin','developer']::public.org_role[]));
CREATE INDEX developer_projects_org_idx ON public.developer_projects(organization_id);

CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  developer_project_id uuid NOT NULL REFERENCES public.developer_projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  scopes text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked','expired')),
  last_used_at timestamptz,
  expires_at timestamptz,
  created_by uuid,
  revoked_by uuid,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.api_keys TO service_role;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE INDEX api_keys_org_idx ON public.api_keys(organization_id);
CREATE INDEX api_keys_project_idx ON public.api_keys(developer_project_id);
CREATE INDEX api_keys_active_hash_idx ON public.api_keys(key_hash) WHERE status = 'active';

CREATE TABLE public.api_request_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  api_key_id uuid REFERENCES public.api_keys(id) ON DELETE SET NULL,
  developer_project_id uuid REFERENCES public.developer_projects(id) ON DELETE SET NULL,
  method text NOT NULL,
  path text NOT NULL,
  status_code integer NOT NULL,
  latency_ms integer,
  request_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.api_request_logs TO authenticated;
GRANT ALL ON public.api_request_logs TO service_role;
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read api logs" ON public.api_request_logs FOR SELECT TO authenticated USING (public.is_org_member(organization_id, auth.uid()));
CREATE INDEX api_logs_org_time_idx ON public.api_request_logs(organization_id, created_at DESC);
CREATE INDEX api_logs_project_time_idx ON public.api_request_logs(developer_project_id, created_at DESC);

CREATE TABLE public.webhook_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  developer_project_id uuid REFERENCES public.developer_projects(id) ON DELETE SET NULL,
  name text NOT NULL,
  url text NOT NULL,
  secret_prefix text NOT NULL,
  secret_hash text NOT NULL,
  event_types text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.webhook_endpoints TO service_role;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
CREATE INDEX webhook_endpoints_org_idx ON public.webhook_endpoints(organization_id);

CREATE TABLE public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_endpoint_id uuid NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_id text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','delivered','failed','retrying')),
  attempt_count integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz,
  last_attempt_at timestamptz,
  response_status_code integer,
  response_excerpt text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.webhook_deliveries TO authenticated;
GRANT ALL ON public.webhook_deliveries TO service_role;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read webhook deliveries" ON public.webhook_deliveries FOR SELECT TO authenticated USING (public.is_org_member(organization_id, auth.uid()));
CREATE INDEX webhook_deliveries_org_time_idx ON public.webhook_deliveries(organization_id, created_at DESC);
CREATE INDEX webhook_deliveries_retry_idx ON public.webhook_deliveries(status, next_attempt_at) WHERE status IN ('pending','retrying');

CREATE TABLE public.usage_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  developer_project_id uuid REFERENCES public.developer_projects(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  metric text NOT NULL,
  count bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.usage_counters TO authenticated;
GRANT ALL ON public.usage_counters TO service_role;
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read usage counters" ON public.usage_counters FOR SELECT TO authenticated USING (public.is_org_member(organization_id, auth.uid()));
CREATE UNIQUE INDEX usage_counters_bucket_idx ON public.usage_counters(organization_id, COALESCE(developer_project_id, '00000000-0000-0000-0000-000000000000'::uuid), period_start, metric);

CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  subject_hash text NOT NULL,
  bucket_key text NOT NULL,
  window_started_at timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 0,
  limit_value integer NOT NULL DEFAULT 60,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(subject_hash, bucket_key)
);
GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
CREATE INDEX rate_limits_window_idx ON public.rate_limits(window_started_at);

CREATE OR REPLACE FUNCTION public.can_manage_org(_org uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.has_org_role(_org, _user, ARRAY['owner','admin']::public.org_role[]) $$;
REVOKE ALL ON FUNCTION public.can_manage_org(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_manage_org(uuid, uuid) TO authenticated, service_role;