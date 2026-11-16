# TPI-STUDIOFLOW — Destinations, Recording Library, and Nova Save Audit

Date: **2026-11-16**  
Status: **AUDIT COMPLETE / LOCAL REPAIRS VERIFIED / PRODUCTION RELAY CONFIGURATION REQUIRED**

## Owner request

The owner requested a thorough check of StudioFlow's livestream destinations,
the recording-library save location, and Nova Editorial Workspace persistence
before members begin relying on those workflows.

The protected applications were treated as separate surfaces. No Creator
Studio or Nova application source was changed for this audit. The StudioFlow
source was taken from the approved release lineage, not the stripped developer
lineage.

## Source and release boundary

| Item | Verified value |
| --- | --- |
| StudioFlow source | `/Users/toddknipple/Documents/StudioFlow/web` |
| Audit branch | `codex/studioflow-destinations-library-audit` |
| Approved source commit | `882237ae1944f09a4f529ef94905917910c52eff` |
| Website staging | `scripts/stage-studioflow-authoritative.mjs --apply` |
| Generated JavaScript | `studio/assets/index-hm0AhGrG.js` |
| Generated CSS | `studio/assets/index-V2mQ_DP8.css` |
| Source build | Reproducible; two clean builds matched the baseline and each other |
| Protected bridge files | Preserved by the maintained staging workflow |

The audit branch descends from the website repository's recorded approved
StudioFlow release baseline. The other local StudioFlow `main` line was not
used because it does not contain the complete approved Notes/project-folder
lineage.

## Livestream destination findings

### What is verified

- YouTube, Facebook, Rumble, Odysee, and Custom RTMP use manual RTMP/RTMPS
  destination details supplied by the provider.
- The remaining catalog entries clearly say when provider setup or an adapter
  is not implemented; they are not presented as connected accounts.
- Multiple selected destinations are sent through one bridge session.
- The local RTMP bridge validates the server URL and stream key, starts one
  output per selected destination, and converts the browser WebM stream to
  decodable H.264/AAC FLV output.
- The synthetic receiver test captured a 6.037-second H.264/AAC stream
  successfully.

### Defect repaired

The local StudioFlow Worker is authoritative on port **8787**. The RTMP
companion process had also defaulted to 8787, so the two services could collide
or make the application send streaming requests to the wrong process.

The bridge now defaults to **127.0.0.1:8789**. An explicit
`VITE_STUDIOFLOW_RTMP_URL` can point an approved environment at a separately
provisioned bridge. Hosted StudioFlow refuses to claim that external
destinations are ready when that configuration is absent.

### Important production boundary

The Node/FFmpeg bridge is a local companion process. It cannot run inside a
Cloudflare Worker, and the current production site does not yet have a
configured production relay or provider adapter for standalone StudioFlow
RTMP delivery. Therefore:

- local destination delivery is verified;
- hosted external livestream delivery is **not yet claimed as live**;
- no stream key was requested, stored, printed, or exposed;
- a real provider test still requires an approved relay/adapter and a
  short-lived provider stream key supplied through the secure deployment
  configuration path.

This is a deliberate safety boundary. A provider card, saved RTMP URL, or local
synthetic receiver is not proof that a live production destination can receive
the show.

## Recording-library save location

### Defect repaired

Choosing a folder previously changed the library-location label but did not
select that folder as the active automatic recording destination. This made the
interface look configured while recordings could continue going to browser
storage.

The repaired behavior is explicit:

1. **Choose Folder** requests read/write permission and persists the directory
   handle in IndexedDB.
2. The selected folder becomes both the library location and the automatic
   recording destination.
3. Recording start rechecks permission and the completed file is written and
   byte-verified before StudioFlow reports success.
4. The Browser Library backup remains available according to the existing
   backup setting.
5. **Restore Default Location** clears the persisted directory handle and
   returns both library and automatic recording destination to Local Browser
   Storage.
6. Browsers without the File System Access API retain the honest browser-library
   fallback and export workflow; there is no silent destination switch.

Cloud Drive and Dropbox are still correctly labeled as requiring provider
setup. iCloud remains available only through a user-selected local folder where
the browser exposes it.

## Nova Editorial Workspace findings

Nova document and presentation persistence was tested independently of the
StudioFlow destination repair. It is already working:

- Nova Core: **105/105**
- Nova Editor and browser persistence: **134/134** across Firefox Developer
  Edition and Chromium
- Nova Slides: **23/23**
- Autosave, reload recovery, structured document storage, revision history,
  conflict protection, folders, trash/restore, attachments, and presentations
  all passed their maintained checks.

No Nova source change was necessary for this audit. Its existing server-backed,
owner-scoped structured storage remains the authoritative document save path.

## Protection added

- RTMP destination checks now guard against reusing the official Worker port.
- The default companion port is covered by the destination regression script.
- Folder selection and restore semantics are explicit and persisted through the
  existing recording-storage path.
- The approved StudioFlow commit and generated asset hashes are recorded in
  `scripts/studioflow-release-baseline.json`.
- The maintained staging workflow rebuilt the approved source twice, compared
  the artifact trees, preserved the TPI bridge files, and staged only the
  verified candidate.
- StudioFlow, Nova Workspace, and Creator Studio remained separate protected
  application boundaries during the audit.

## Verification record

| Check | Result |
| --- | --- |
| StudioFlow TypeScript/Vite build | PASS |
| Destination catalog regression | **13/13 PASS** |
| RTMP bridge syntax | PASS |
| Synthetic RTMP audio/video delivery | PASS — H.264/AAC, 6.037 seconds |
| Recording/storage acceptance | **33/33 PASS** |
| Nova Core storage/API | **105/105 PASS** |
| Nova Editor Firefox/Chromium persistence | **134/134 PASS** |
| Nova Slides | **23/23 PASS** |
| Authoritative staging | PASS — reproducible build and protected bridge preservation |

## Remaining work before claiming hosted destinations

1. Choose the production relay architecture or an approved provider adapter.
2. Configure it through protected deployment secrets/environment, never in
   source or browser storage.
3. Run a short, non-public provider stream with a disposable key.
4. Verify start, sustained delivery, stop, reconnect/error reporting, and
   multi-destination behavior.
5. Record the provider-specific live evidence before labeling that destination
   **Production verified**.

Until those steps are complete, StudioFlow's local recording library and local
RTMP companion are verified, Nova saves are verified, and hosted RTMP remains
honestly marked as configuration-required.
