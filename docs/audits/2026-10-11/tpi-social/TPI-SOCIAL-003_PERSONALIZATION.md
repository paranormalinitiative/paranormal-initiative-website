# TPI-SOCIAL-003 Personalization

Six site themes and account-backed Highlights/font preferences remain separate
systems. Local API/SQLite testing passed authentication gates, enum validation,
owner isolation, persistence, public-style lookup, and theme persistence.

Owner-reported Highlights behavior was not reproduced as a server defect. The
focused Settings panel repair corrected adjacent visible `NaN` output without
changing personalization storage. Browser save/reload/computed-style coverage
remains **NOT VERIFIED** because Playwright is unavailable.
