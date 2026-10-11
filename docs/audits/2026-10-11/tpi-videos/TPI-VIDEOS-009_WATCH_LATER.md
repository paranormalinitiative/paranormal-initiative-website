# TPI-VIDEOS-009 Watch Later

Added additive member-owned saved-item storage. Existing `video_saves` rows remain readable. New saves use `tpi_video_saved_items` and retain the internal TPI destination for creator videos or the original HTTPS provider URL for discovered videos, together with display metadata. The member Saved navigation now opens `watch-later.html`, where items can be opened or removed.

Status: IMPLEMENTED locally. Authenticated member mutation and production D1 verification are pending release checks.
