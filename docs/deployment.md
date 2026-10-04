# Production deployment

Production is hosted on Cloudflare Pages at <https://einbuergerungstest.jarith.dev>.
GitHub Actions builds the application and uploads the complete `web/dist` artifact with
Wrangler. The existing Pages project and CNAME are reused. No Pages Functions, application
secrets, or database are required.

## One-time Cloudflare setup

1. Open **Workers & Pages → your Pages project**. Note its exact project name and assigned
   `pages.dev` hostname; the hostname can differ from the project name. The workflow
   defaults to project `einbuergerungstest`. If yours differs, set the GitHub repository
   variable `CLOUDFLARE_PAGES_PROJECT` as described below.
2. Under **Custom domains**, add `einbuergerungstest.jarith.dev` if it is not already
   attached, even if its CNAME already exists. Complete the domain setup and wait for
   **Active**, including certificate issuance. The CNAME must target this project's
   assigned Pages hostname. Keep the app available over HTTPS.
3. Set the project's **production branch to `master`**. For a Git-connected project, use
   **Settings → Builds & deployments → Configure Production deployments**. In the same
   branch controls, disable automatic production deployments and set preview deployments
   to **None**. This prevents Cloudflare's Git integration from publishing before GitHub
   checks finish. Direct Upload projects already rely on explicit uploads.
4. Create an account-level **Bulk Redirect** from the production Pages hostname to the
   custom domain. Source: `<assigned-hostname>.pages.dev/`; target:
   `https://einbuergerungstest.jarith.dev/`; status: **301**. Enable **Preserve query
   string**, **Subpath matching**, and **Preserve path suffix**. Leave **Include
   subdomains** disabled so deployment/preview aliases remain separate. Enable the
   redirect rule after the custom domain is active. This is an account-level rule, not a
   rule on the `jarith.dev` zone alone.
5. If the `jarith.dev` zone has existing rules, exclude this app's hostname from rules
   that override cache revalidation, rewrite HTML/JavaScript, inject scripts, or challenge
   ordinary app/resource requests. In particular, do not enable Rocket Loader or HTML
   rewriting for the app: the offline precache verifies the original build's resource
   integrity. The repository supplies routing and headers; no broad SPA rewrite or Cache
   Everything rule is needed in the dashboard.
6. The token stored in GitHub must have **Account → Cloudflare Pages → Edit** for the
   account owning the project. DNS and redirect permissions are not needed by the
   workflow; those settings are managed manually in the dashboard.

Cloudflare does **not** expose production-branch editing in the dashboard for Direct
Upload projects. If yours was created with another branch (often `main`), change it once
with the
[Update Project API](https://developers.cloudflare.com/pages/get-started/direct-upload/#production-branch-configuration).
With credentials in your local environment and the project name set, run:

```sh
export CLOUDFLARE_PAGES_PROJECT=einbuergerungstest # Use your existing project name.
curl --fail --silent --show-error --request PATCH \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$CLOUDFLARE_PAGES_PROJECT" \
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{"production_branch":"master"}'
```

GitHub repository secrets are not automatically available in a local terminal. Supply them
through your usual local secret handling; do not commit their values. The workflow checks
the configured branch before uploading and fails with instructions if it differs. It does
not change project settings or create a replacement project.

Cloudflare references:
[custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/),
[branch controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/),
[Pages hostname redirect](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/),
and
[CI token permissions](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/).

## One-time GitHub setup

Under **Settings → Secrets and variables → Actions**:

- Keep the existing `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets.
- Add `CLOUDFLARE_PAGES_PROJECT` as a repository **variable** only if the project name is
  different from `einbuergerungstest`. Use the project name, not its domain or URL.

Under **Settings → Environments**, create/configure `production` to allow deployments from
the selected branch `master` only. Leave required reviewers and wait timers disabled for
automatic deployment. The workflow uses repository secrets; duplicating them in the
environment is unnecessary.

Use the repository's branch rules for `master` to require pull requests and the existing
CI checks, including Build, Lint, TypeScript and Format check. Do not require the
production deployment job for PR merges: it intentionally runs only after a master push.

## Workflow behavior

`.github/workflows/ci.yml` runs on pull requests and pushes to `master`. The existing
checks and their dependencies remain in place. The deployment job requires successful
build, lint, type, formatting, tooling, business integration, browser UI, browser
integration, Storybook, E2E selection, and E2E jobs. On master, E2E selection always
enables the E2E job. A failed, cancelled, or skipped dependency blocks deployment.

The reusable build job sets `SITE_INDEXABLE=true` only for master pushes, producing the
indexable public pages and sitemap. It uploads all of `web/dist` as
`pages-<commit SHA>-<run ID>` with seven-day retention. PR and local builds remain
non-indexable and do not upload deployment artifacts. No Cloudflare secrets are supplied
to the build or PR jobs.

The production job downloads that same run's artifact, fails on an artifact digest
mismatch, and deploys it without rebuilding. Wrangler is pinned to `4.147.0` in the
workflow and invoked through `npm exec`; it does not install or rebuild the application's
Yarn dependencies. The command sets the project, `master` branch and exact commit SHA. The
production environment and workflow summary link to the custom domain; Wrangler's log
includes the deployment URL.

PR updates cancel superseded PR runs. Master workflows queue without cancelling an active
run, serializing the complete check/build/deploy pipeline. GitHub's `queue: max` holds up
to 100 pending runs; monitor failed/cancelled runs if that limit is ever reached. The
pinned Actionlint predates `queue` and `ubuntu-26.04`, so its configuration narrowly
ignores those unsupported fields in these workflows.

Queue order is not guaranteed to match commit order. Before upload, the workflow reads the
current production deployment from Cloudflare and compares its SHA with the candidate. It
skips an older or divergent candidate instead of replacing a newer release. A release with
no recorded commit permits initial setup. An unresolvable production SHA blocks deployment
so the deployment history can be reconciled explicitly. Avoid force-pushing master or
publishing manually outside this workflow.

## Hosting and PWA behavior

Vite copies `web/public/_redirects` and `web/public/_headers` into the deployment
artifact. The redirects serve only the learner route allowlist through `app.html`,
including trailing-slash variants. Keep them aligned with `getLearnerPathPattern` in
`web/src/app/seo/site.ts` when routes change. `/` and `/en/` remain prerendered public
pages. The generated top-level `404.html` preserves real errors for unknown public URLs
and missing assets.

Network responses revalidate and request no content transformation. The service worker
still supplies offline resources from its versioned cache. Headers also provide MIME
sniffing and framing protection, the referrer policy, and explicit script/manifest MIME
types. Both the production Pages hostname and deployment aliases receive a host-specific
`X-Robots-Tag: noindex, follow`, even when serving the production artifact. The custom
domain does not receive that header.

The existing manifest launches `/dashboard` in standalone mode. Offline preparation,
installation instructions, backup transfer, and update behavior are unchanged. Updates
wait until existing browser tabs and installed app windows close. Browser and installed
app storage can be separate; use the existing backup export/import flow to transfer
progress. Storage eviction can require online preparation again.

Pages deployments replace the files available on the production hostname. Retaining an old
deployment does not make its missing hashed assets available on the new production
hostname. Existing installed clients normally use their complete precache; if that cache
is evicted, an old client may need to close and reopen online to install the current
release. There is no cross-release asset retention mechanism in this deployment.

## Recovery

For a transient deployment failure, rerun the failed job while the artifact is available.
After its seven-day retention expires, rerun all jobs to regenerate it and pass the gates.
An old rerun cannot overwrite a newer deployed commit.

For an intentional rollback, use **Workers & Pages → project → Deployments → previous
successful production deployment → Rollback to this deployment**. Coordinate this with any
queued master runs, which would otherwise publish again. Do not use an old GitHub run as a
rollback mechanism. Follow up with a revert/fix on master so subsequent releases keep the
intended application version.

A [Cloudflare rollback](https://developers.cloudflare.com/pages/configuration/rollbacks/)
changes the served deployment; it does not immediately replace an already installed
service worker or undo device-local learner data changes.
