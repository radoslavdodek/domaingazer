# Security Policy

## Supported Branch

Security fixes are expected to land on `main`.

## Reporting

- Do not open a public GitHub issue for a vulnerability that can be exploited.
- Use GitHub's private vulnerability reporting / security advisory flow if it is enabled for the repository.
- If that is not available, contact the repository maintainer privately.

## What To Include

- A clear description of the issue
- Impact and attack preconditions
- Reproduction steps or a proof of concept
- Any suggested mitigation if you have one

## Scope Notes

- Vulnerabilities in your own self-hosted deployment should also be evaluated against your own infrastructure, secrets handling, and reverse-proxy configuration.
- Misconfiguration of third-party services such as Supabase, Stripe, AWS, or nginx may be deployment-specific rather than repository-level.
