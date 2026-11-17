# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability, please report it privately rather
than opening a public issue. Email the maintainers (see the Contact page of the
application) with a description of the issue and steps to reproduce it. We will
acknowledge your report and work with you on a fix.

Please do not disclose the issue publicly until it has been addressed.

## Scope

Areas of particular interest:

- Payment integrity (the ledger, Razorpay signature verification, webhook idempotency)
- Server-side request forgery in the URL metadata fetcher
- Any path that could expose secrets or another user's contact details
