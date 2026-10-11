-- TPI Videos 009: explicit catalog format for regular videos and Shorts/Reels.
ALTER TABLE tpi_videos ADD COLUMN format TEXT NOT NULL DEFAULT 'regular';
