# LocateNG Phase 2 production upgrade

## Goal
Evolve the deployed Phase 1 product without replacing its architecture or visual identity. Keep the working provider-neutral resolution and secure verification flow, while repositioning LocateNG as operational location infrastructure and adding the missing business, developer, analytics, team, and settings capabilities.

## Delivery plan

### 1. Positioning and public website
- Rewrite the homepage around “Know exactly where your customers are,” with Get Started and See How It Works actions, a realistic product preview, customer-problem framing, Resolve → Confirm → Reuse → Audit, and the six requested use cases.
- Remove public NIPOST/provider comparison copy from the homepage, authentication, footer, trust, how-it-works, verification flow, metadata, and empty/error states. Keep demo-source disclosure concise and contextual only where users interact with sample data.
- Rebuild Trust & Security around access controls, secure expiring links, organization isolation, audit trails, data minimization, API security, and webhook signing.
- Add distinct public Pricing and developer API documentation pages. Plans remain “Contact Sales” until prices are configured.
- Add accessible mobile navigation and unique search-focused metadata for every public route.

### 2. Application route migration and shell
- Establish `/app` as the canonical authenticated area, with `/app/dashboard`, locations, verifications, business, developers, analytics, team, audit, and settings routes.
- Preserve old `/dashboard`, `/locations`, `/verifications`, and `/audit` URLs with redirects so bookmarks and published links keep working.
- Replace the four-link shell with grouped, responsive navigation, an organization context, clear demo-workspace labeling, and mobile navigation that scales to the larger product.
- Centralize route labels and permission visibility rather than duplicating navigation rules.

### 3. Secure multi-tenant domain expansion
- Extend organization roles to OWNER, ADMIN, MANAGER, DEVELOPER, ANALYST, and VIEWER in a separate membership/role structure; never place privilege flags on profiles.
- Add organization-scoped tables for business locations, invitations, developer projects, hashed API keys, API request logs, webhook endpoints/deliveries, and usage counters. Every new table gets grants, RLS, indexes, and organization-aware policies in the same migration.
- Add server-side authorization helpers and enforce capability checks for every protected mutation, including last-owner safeguards.
- Harden the existing system: restrict event/audit insertion to trusted server paths, validate status transitions, use constant-time token checks, add public-flow rate-limit architecture, and prevent unrestricted destructive writes.
- Keep sample data deterministic and explicitly demo-only; update new-user provisioning to create a coherent Phase 2 sample workspace.

### 4. Operational modules
- Upgrade Dashboard with real database-backed KPIs, completion calculations, recent activity, quick actions, operational alerts, and loading/empty/error states.
- Upgrade Locations with searchable/filterable tables, complete structured details, confirmation context, and an audit timeline. Keep resolution behind `LocationProvider`.
- Extend verification creation with recipient contact, message, purpose, location, and expiration controls; model the requested lifecycle states precisely.
- Keep secure links compatible at `/v/<public_id>?t=<secret>` while adding `/verify/<public_id>?t=<secret>` as the customer-facing route. Make the recipient flow mobile-first, with clear confirmation/rejection outcomes and no unsupported identity or ownership claims.
- Add business profile and multi-location management using “Location Confirmed,” never “Business Verified.”

### 5. Developer platform
- Build Projects with Sandbox/Production environments and lifecycle status.
- Build API key creation, one-time reveal, rotation, and revocation. Persist only hashes and non-secret prefixes; never return a key after creation.
- Add LocateNG `/v1` server routes for location resolution, location lookup, verification creation/lookup/revocation, and usage. Authenticate by hashed project key, scope every lookup to its organization/project, validate inputs, support idempotency, and return stable errors.
- Add API request logs and usage views with safe request metadata only.
- Add webhook endpoint management, event subscriptions, signed delivery payloads, retry controls, delivery history, response codes, and retry counts. Never store endpoint signing secrets in plaintext after one-time reveal.
- Publish API documentation covering authentication, requests, responses, errors, idempotency, limits, and webhooks without inventing upstream-provider behavior.

### 6. Analytics, team, settings, and audit
- Add useful date-filtered analytics for resolution, verification outcomes/time, API traffic, and webhook reliability.
- Add team invitations, role changes, removals, and permission-aware UI backed by server enforcement.
- Add organization, security, and integrations settings with complete empty, loading, success, and actionable error states.
- Expand the audit log to record user, membership, location, verification, API-key, webhook, and settings events with actor, resource, timestamp, and structured metadata.

### 7. Documentation and verification
- Replace the placeholder README and add product overview, architecture, security, development, provider integration, and API documentation.
- Add focused tests for authentication guards, role/capability checks, organization isolation, location creation/resolution, verification transitions and public links, expiration/revocation, API-key auth, API organization scoping, webhook signing/retries, audit integrity, and business locations.
- Manually verify the public site, responsive shell, mobile recipient flow, complete business journey, developer journey, and admin permissions. Resolve build, runtime, console, and network errors before completion.

## Technical approach
- Continue using TanStack Start, React Query, Lovable Cloud, the existing semantic design tokens, and the current serious IBM Plex visual system.
- Use authenticated server functions for app operations and `/api/public/v1/*` server routes for external API traffic. Privileged clients load only inside authorized server handlers.
- Apply schema changes through one additive database migration; do not fork the schema into a second implementation.
- Refactor the existing `LocationProvider` to include `resolvePostcode`, `getLocation`, and `checkHealth`; retain the `DEMO-*` mock adapter until documented production access exists.
- Keep the existing SHA-256 public-link model and migrate routes compatibly rather than invalidating issued links.

## Release sequence
1. Public positioning, route aliases, app shell, and security hardening.
2. Database expansion and authorization foundation.
3. Dashboard, location, verification, and business modules.
4. Developer API, keys, logs, usage, and webhooks.
5. Analytics, team, settings, documentation, tests, and full journey validation.

## Acceptance criteria
- Public copy no longer frames LocateNG against NIPOST or exposes provider internals.
- Existing users, organizations, locations, verification links, and audit history continue to work.
- Every organization-owned record is isolated by database policy and every privileged action is authorized server-side.
- The requested operational and developer modules use persisted data, secure secret handling, meaningful states, and responsive loading/empty/error experiences.
- Demo records are clearly synthetic; no provider behavior, external credentials, pricing, compliance, identity, residence, or ownership claims are fabricated.
