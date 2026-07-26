# Viper Status Operations

## Runtime

- Public URL: `https://status.viperisuseful.cc`
- Container port: `3000`
- Coolify application: `viper-status`
- Coolify UUID: `vw1czpltqkgboqav4ao7ixrh`
- Repository/branch: `Viperisuseful/viper-status`, `main`
- Host binding: `8308:3000`
- Health endpoint: `/api/health`
- Status endpoint: `/api/status`
- Source: Uptime Kuma public status page slug `viper`
- Required variables: `KUMA_BASE_URL`, `KUMA_STATUS_SLUG`
- Persistent data: none
- External state: Uptime Kuma monitors and incident history
- Protected pre-deployment backup:
  `/home/ubuntu/backups/viper-status-deployment/20260725T235621Z`

The browser receives only the normalized `/api/status` document. Kuma
credentials, monitor request headers, internal IDs, and the ViperCapture API
key are not application variables and must never be added to Coolify.
The public container mapping is blocked on `enp0s6` by the existing IPv4 and
IPv6 UFW `DENY FWD` rules for container port `3000`; Nginx is the only origin.

## Public monitor mapping

| Product | Kuma monitor |
| --- | --- |
| Portfolio | Viper Hub |
| ViperCapture | ViperCapture |
| ViperCapture API | ViperCapture API Route plus ViperCapture API Functional |
| Turtle Cave | Turtle Cave Database Health |
| QuickRunLab | QuickRunLab |
| QuickRunLab API | QuickRunLab API |

The functional ViperCapture API monitor runs every 21,600 seconds. It renders
a 320 by 240 PNG of `example.com`, costs one credit per successful run, and
uses its secret header only inside Uptime Kuma.

## Verification

```bash
curl -fsS http://127.0.0.1:8308/api/health
curl -fsS http://127.0.0.1:8308/api/status
curl -fsS https://status.viperisuseful.cc/api/health
curl -fsS https://status.viperisuseful.cc/api/status
```

Verify that the public document contains exactly six services, contains no
monitor IDs, and that desktop and mobile pages show no horizontal overflow.

## Rollback

1. In Coolify, redeploy the last known-good commit.
2. If the new application is unavailable, disable only the
   `status.viperisuseful.cc` Nginx site and reload Nginx after `nginx -t`.
3. Keep the Kuma status page and monitors intact. They remain useful and do not
   depend on this frontend.
4. Re-run the local and public health checks after each rollback layer.
