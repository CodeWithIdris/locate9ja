<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# LocateNG — engineering rules

- Location resolution goes through the `LocationProvider` interface in `src/lib/provider/`; never call a provider directly from UI. Why: NIPOST is an external provider that will be swapped in later.
- The demo provider uses only `DEMO-*` references and must never imitate NIPOST postcode formats or data. Why: product boundary — no invented NIPOST behavior.
- Every org-owned table carries `organization_id`, with RLS via `is_org_member` / `has_org_role`. Why: tenant isolation at the DB layer.
- Public verification links are `/v/<public_id>?t=<secret>`; only a SHA-256 hash of the secret is stored, and public server fns verify it before using the admin client. Why: unguessable, revocable links.
- New users get an organization plus sample data via the `handle_new_user` DB trigger. Why: demo workspace without seeding from the client.
