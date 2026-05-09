# Security Policy

## Supported Versions

Security fixes are handled on the default branch. Public releases should be
created from a commit that has passed CI.

## Reporting a Vulnerability

Please do not open a public issue for a suspected vulnerability.

Use GitHub private vulnerability reporting if it is enabled for this repository.
If private reporting is not enabled, contact the maintainers privately before
sharing details publicly.

Include as much detail as you can safely provide:

- affected route, component, or integration
- reproduction steps
- expected and observed behavior
- impact assessment
- relevant logs or screenshots with secrets redacted

The maintainers will acknowledge valid reports, investigate the issue, and
coordinate disclosure once a fix is available.

## Sensitive Data

Never include real API keys, access tokens, webhook secrets, private keys,
session cookies, or customer data in issues, pull requests, logs, or screenshots.
Use `.env.local` for local secrets and keep `.env.example` limited to placeholders.
