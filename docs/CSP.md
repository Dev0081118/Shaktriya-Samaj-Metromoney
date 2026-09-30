# Content Security Policy notes

Helmet supplies baseline API headers. The browser application’s hosting layer should add a tested CSP. Razorpay checkout requires its script/frame/connect/image origins; the configured media provider requires its image origin; the API and application origins must be explicit. Avoid `*`, `unsafe-eval`, and inline scripts. Introduce CSP in report-only mode on staging, review violations, then enforce it. Re-test checkout whenever Razorpay changes hosted assets.
