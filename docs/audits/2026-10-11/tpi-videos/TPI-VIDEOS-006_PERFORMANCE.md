# TPI-VIDEOS-006 Performance

The production build completed successfully. The generated StudioFlow bundle
reports an 822.42 kB JavaScript asset before gzip and a 238.80 kB gzip size;
Vite emitted the existing large-chunk warning. The PDF worker is also large
and remains an existing asset concern.

API discovery routes retain bounded page sizes. The local suite exercised
pagination and bounded server queries. No long-duration browser, sustained
RTMP, multi-hour memory, or production load test was performed.

Recommendation: treat bundle splitting and long-duration resource monitoring
as a separate optimization phase; do not change the current runtime in this
acceptance audit without a measured defect.
