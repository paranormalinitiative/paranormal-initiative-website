# TPI-VIDEOS-002 Provider Validation

Approved provider families are YouTube, Rumble, Odysee, Dailymotion, and
Internet Archive. The validator accepts only HTTPS URLs on exact approved
hosts and rejects credentials, custom ports, fragments, malformed provider
IDs, JavaScript URLs, and unrelated embed origins.

YouTube and Rumble use canonical no-surprise embed URLs. Odysee, Dailymotion,
and Internet Archive use safe external-watch links unless a separately
reviewed embed form is added. No YouTube API, OAuth connection, automatic
provider publishing, or capability claim was added.

Validation evidence: the migration-backed API suite rejected a JavaScript
source and an unapproved embed host and accepted a YouTube fixture with a
canonical `youtube-nocookie.com` embed. Live external-provider playback and
provider account workflows remain NOT YET VERIFIED.
