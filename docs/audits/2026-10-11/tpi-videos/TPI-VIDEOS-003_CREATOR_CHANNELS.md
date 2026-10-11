# TPI-VIDEOS-003 Creator Channels

Public creator channels now return follower count and the authenticated viewer's follow state. The channel page retains owner identity and published public videos while adding Follow channel and Share channel controls. Self-follow is rejected server-side. Private channels and unpublished videos remain excluded.

Migration `0043_tpi_video_discovery_social.sql` adds the additive `tpi_video_follows` relationship with contributor and channel foreign keys and uniqueness per pair.
