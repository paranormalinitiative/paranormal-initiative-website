# Haunted Location Case-File Image Completion Pass

Date: 2026-11-19
Status: **DEPLOYED AND LIVE VERIFIED.**

## Scope

This continuation completes the exact-location image pass for the 25 newer
state pages. The directory still contains all 50 state pages and 562 total
location entries. Of the 100 newer shared-rendered starter entries, 94 now
have an exact, locally stored source photograph and a separate TPI archival
case-file treatment.

The six remaining starter entries are intentionally visible as **Exact
case-file photograph pending** because no exact source with clear reuse terms
could be confirmed:

- Montana — Gold Hill Hotel: the readily available exact Nevada Gold Hill
  photograph is not the Montana entry, so it is not reused.
- New York — Hinsdale House: the location is private and no permission-cleared
  exact photograph was confirmed.
- North Dakota — Hotel Donaldson: available exact photographs were marked all
  rights reserved or lacked a clear reuse grant.
- Oklahoma — Gilcrease Museum: the freely reusable Commons result is a
  rendering, not a documentary photograph of the exact building.
- South Dakota — Sica Hollow State Park: no exact site photograph with clear
  reuse terms was confirmed.
- Tennessee — Old South Pittsburg Hospital: the exact building photographs
  located were credited to a current photographer without a reuse grant.

## Follow-up catalog audit

A second source pass on 2026-11-19 found that the Montana entry itself needs
verification before an image can be attached. Searches for a Montana Gold Hill
Hotel did not produce a matching operating hotel; the well-documented Gold Hill
Hotel references resolve to Nevada. Montana’s documented historic hotel
candidate is The Pollard Hotel in Red Lodge, but the readily located exterior
photographs are also restricted. The Montana record must therefore be corrected
or confirmed before a case-file image is created.

This prevents a location-name collision from showing the Nevada Gold Hill Hotel
photograph on a Montana page. The six pending entries remain intentionally
image-free until TPI has an exact, permission-cleared source or a corrected
catalog record.

No AI-generated landmark substitute is used for any of these six entries.

## Added in this pass

- Arkansas: 11 of 12 directory entries now have exact source photographs and
  matching TPI case-file treatments. The Haxan House remains intentionally
  pending because its official site was unreachable during the source pass and
  no exact property photograph could be verified. No generic or AI-invented
  substitute is used for that entry.
- Washington: Pike Place Market, Northern State Recreation Area, Arctic Club
  Building, and Thornewood Castle.
- Nebraska: Museum of Shadows, using the exact Christian Specht Building at
  1110 Douglas Street in Omaha.
- New Mexico: The James Hotel, using the exact St. James Hotel in Cimarron.
- Vermont: corrected the source-key punctuation for Emily’s Bridge so the
  verified image resolves from the canonical entry name.

Each new source is stored in
`haunted-location-directory/case-file-photos/`, with the untouched source
photograph, the TPI case-file treatment, source URL, credit, and reuse terms
recorded in `case-file-sources.js` and the photo README.

The Arkansas source set includes exact location references from Wikimedia
Commons, the National Park Service inventory, and the Basin Park Hotel official
media page. The Allen House photograph is retained with an explicit
all-rights-reserved permission-review note; it is not represented as a TPI-owned
documentary photograph. The official Haxan House property image remains
unverified and is still visibly pending in the directory.

## Protection and verification

The renderer remains state-aware for duplicate names and resolves
`State::Location` before falling back to a unique location name. This prevents
one state’s photograph from being shown for another state’s similarly named
location. The existing viewer keeps the complete image inside its frame and
opens the full treatment when clicked.

Verification passed:

```text
node --check haunted-location-directory/state-directory.js
node --check haunted-location-directory/case-file-sources.js
npm run verify:haunted-location-directory
git diff --check
TPI haunted-location-directory verification passed: 50 state pages, 100 new starter entries, no placeholders.
```

The focused local checks completed without touching StudioFlow, Nova Editorial
Workspace, member data, or the owner account. The guarded website release
completed with production smoke passing 10/10 and the new Worker holding 100%
traffic. StudioFlow live acceptance remained locked and skipped because no
StudioFlow source or shared runtime changed.

## Release record

- Source commit: `7c857452f396a22812d193a74840a4d0749e68b6`
- Release candidate: `rel-7c857452f396-ce5369976eb1`
- Production Worker version: `84081e8a-3615-4cd7-9b65-fcf765ecc9ec`
- Rollback target: `21f7f0a5-8c23-4195-8b87-a775b8e78e63`
- Release profile: website; protected application maintenance lock preserved
- Production smoke: **10/10 passed**
- Final release state: **DEPLOYED_AND_VERIFIED**

## Kansas legacy batch — completed and live

Kansas has 21 directory entries and now has 21 exact source photographs plus
21 matching case-file treatments. Each treatment uses the exact **KANSAS**
marker and **The Paranormal Initiative** branding. The source map is recorded
in `haunted-location-directory/legacy-case-file-sources.js`.

Completed Kansas entries:

- Sallie House
- 1889 McInteer Villa
- Evah C. Cray Historical Home
- Eldridge Hotel
- Stull Cemetery
- Fort Leavenworth
- Fort Hays State Historic Site
- Santa Fe Depot and Harvey House
- Midland Railroad Hotel
- Kansas State Capitol
- Pawnee Rock State Historic Site
- Historic Wolf Hotel
- Beaumont Hotel
- Fort Riley
- Sauer Castle
- Rocky Ford Bridge
- Brown Grand Theatre
- Le Hunt Cement Plant ruins
- Oak Hill Cemetery / Witch’s Grave
- Hutchinson Public Library
- Molly’s Hollow / Jackson Park landscape reference

The case-file images are presentation derivatives of the exact source
photographs, not documentary photographs owned by TPI. Sources whose
retrieved pages did not state reuse terms remain explicitly flagged for rights
review in the source map. Stull Cemetery and Sauer Castle retain their access
and private-property context; Le Hunt is represented as ruins, not an intact
factory; Molly’s Hollow is represented as an outdoor Jackson Park landscape,
not a fabricated building. The directory does not direct members to trespass
or bypass access rules. TPI is **The Paranormal Initiative**, never
“Paranormal Investigations.”

Release evidence:

- Source commits: `6e304dbf`, `eca1c53f`, `4861a26e`, `5f1e2760`, `b10e4f8a`, `dbe5a720`, `6e349512`, `c4711928`, `cb92c769`, `e7ea1484`, `ae5dcc34`; documentation commit: `ab4a8402`.
- Release candidate: `rel-ab4a8402648f-86335190f687`.
- Certified source commit: `ab4a8402648f8131bba47b0192f25ea132bf4bad`.
- Release profile: website; StudioFlow and Nova remained under the protected-application maintenance lock.
- Certified gates: 10 passed; live anonymous production smoke: 10/10 passed.
- Deployed Worker version: `b800508d-3ee8-4ad4-8d4f-6b5c7fb969b3`.
- Rollback target: `cc39a39a-6775-46d8-a9af-b3ee71e38287`.
- Live Kansas page: HTTP 200 with 21 Kansas location IDs rendered.
- Live Kansas case-file assets: 42/42 returned HTTP 200.
- Final release state: **DEPLOYED_AND_VERIFIED**.

## Iowa legacy batch — completed and live

Iowa has 16 directory entries and now has 16 exact source photographs plus 16
matching case-file treatments. Each treatment uses the exact **IOWA** marker
and **The Paranormal Initiative** branding. The source map is recorded in
`haunted-location-directory/legacy-case-file-sources.js`.

Completed Iowa entries:

- Villisca Axe Murder House
- Squirrel Cage Jail
- Mason House Inn
- Black Hawk Hotel
- Granger House Victorian Museum
- Old Fairfield Opera House
- Edinburgh Manor
- Farrar Schoolhouse
- Malvern Manor
- Hotel Ottumwa
- Cresco Theatre and Opera House
- Black Angel / Oakland Cemetery
- Historic Iowa State Penitentiary
- Stony Hollow Road
- Iowa State Capitol
- Argonne Armory

The case-file images are presentation derivatives of the exact source
photographs, not documentary photographs owned by TPI. Sources whose
retrieved pages did not state reuse terms remain explicitly flagged for rights
review in the source map. The Black Hawk Hotel source was corrected to an
exterior photograph before treatment generation. The directory does not direct
members to trespass or bypass public, guest, guided, or limited-hours access
rules. TPI is **The Paranormal Initiative**, never “Paranormal Investigations.”

Release evidence:

- Source commits: `4da1be69`, `40a3a41b`, `83b0e918`, `7c806b77`,
  `6b754fb1`, `e21dc509`, `3f082a31`
- Release candidate: `rel-3f082a319e66-d1810c243f08`
- Source commit certified: `3f082a319e66cf48692b72242b025cc66fc7ad1b`
- Release profile: website; protected StudioFlow and Nova application bytes
  remained under the maintenance lock
- Certified gates: **10 passed**; production smoke: **10/10 passed**
- Deployed Worker version: `cc39a39a-6775-46d8-a9af-b3ee71e38287`
- Rollback target: `cd6a89d8-20b9-4a0c-9a0a-c67bca22cccd`
- Live Iowa page: **200**, 16 entries rendered
- Live Iowa assets: **32/32 returned 200**
- Final release state: **DEPLOYED_AND_VERIFIED**

## Idaho legacy batch — completed

Idaho contains 20 directory entries. All 20 now have an exact local source
photograph, a matching TPI case-file treatment, a local asset copy, and a
source/credit record:

- Old Idaho Penitentiary
- Egyptian Theatre
- Idanha Hotel
- Idaho State Capitol
- Morris Hill Cemetery
- Boot Hill / Idaho City Pioneer Cemetery
- Boise Basin Museum
- Idaho Hotel
- Oasis Bordello Museum
- Northern Pacific Depot Railroad Museum
- Jameson Saloon
- Albion State Normal School
- Howells Opera House
- Lava Hot Springs Inn
- Enders Hotel
- State Hospital South Cemetery
- Stricker Ranch & Rock Creek Station
- Cataldo Mission (Mission of the Sacred Heart)
- Mountain View Cemetery
- Roseberry Historic Site

The treatments use **The Paranormal Initiative** branding and an **IDAHO**
state badge. TPI is not expanded or labeled as “Paranormal Investigations.”
Each treatment preserves the exact source subject and is presented as a
stylized case-file image, not an unedited documentary photograph. The State
Hospital South Cemetery treatment was corrected to show the exact cemetery
and marker without the unrelated presenter visible in the source frame.

The Idaho City Pioneer Cemetery, Boise Basin Museum, Jameson Saloon, Albion
State Normal School, Howells Opera House, Lava Hot Springs Inn, State Hospital
South Cemetery, Stricker Ranch & Rock Creek Station, Mountain View Cemetery,
and Roseberry Historic Site source records remain explicitly flagged for rights
review because the retrieved source pages did not state reuse terms. Those
files are not represented as TPI-owned documentary photographs. Public,
guest, guided, permission-required, and limited-hours access notes remain
authoritative; no case file directs members to trespass or bypass site rules.

## Idaho release record

- Source commit: `7048daf5691b71620af11e2c663c947cb1026027`
- Release candidate: `rel-7048daf5691b-e1e9c3b2f632`
- Production Worker version: `85dee51d-7255-448e-98de-8f7ee32d3ce9`
- Rollback target: `0aa6bce9-69f9-41d9-9b41-49f42302570a`
- Release profile: full; protected application integrity and StudioFlow/Nova
  maintenance checks preserved
- Certification: **40/40 gates passed**, manifest sealed as
  `ccd42bced8f335ff9166e491d0082c08fc88803df01884e2a70819f9503fcbfe`
- Production smoke: **10/10 passed**
- Live Firefox acceptance: **65/65 passed**
- Live Idaho page: **200**, 20 entries rendered, all 40 source/treatment
  assets returned **200**
- Final release state: **DEPLOYED_AND_VERIFIED**

## Idaho legacy batch — completed in this continuation

Idaho contains 20 directory entries. All 20 now have an exact local source
photograph, a matching TPI case-file treatment, and a source/credit record:

- Old Idaho Penitentiary
- Egyptian Theatre
- Idanha Hotel
- Idaho State Capitol
- Morris Hill Cemetery
- Boot Hill / Idaho City Pioneer Cemetery
- Boise Basin Museum
- Idaho Hotel in Silver City
- Oasis Bordello Museum
- Northern Pacific Depot Railroad Museum
- Jameson Saloon
- Albion State Normal School
- Howells Opera House
- Lava Hot Springs Inn
- Enders Hotel
- State Hospital South Cemetery
- Stricker Ranch & Rock Creek Station
- Cataldo Mission (Mission of the Sacred Heart)
- Mountain View Cemetery
- Roseberry Historic Site

The treatments use **The Paranormal Initiative** branding and a **IDAHO** state
badge. TPI is not expanded or labeled as “Paranormal Investigations.” Each
treatment preserves the exact source subject and is presented as a stylized
case-file image rather than an unedited documentary photograph. The State
Hospital South Cemetery treatment keeps the actual cemetery sign and grounds
while removing an unrelated presenter from the source frame.

Idaho sources with unstated reuse terms remain explicitly flagged for
permission/reuse review in `legacy-case-file-sources.js` and the photo README.
Those source photographs are not represented as TPI-owned. Public, guest,
guided, and limited-hours access notes remain authoritative; no case file
directs members to trespass or bypass site rules.

## Source rule

An exact location photograph is added only when the source identifies the
actual place and the reuse terms are recorded. A stylized TPI case-file image
is a presentation treatment of that exact source; it is not presented as an
unedited documentary photograph. If those conditions cannot be verified, the
pending state stays visible until TPI receives a compatible source or direct
permission.

## Legacy Alabama–Massachusetts image pass — in progress

The original static block from Alabama through Massachusetts contains 21 state
pages and 402 existing location records. Those pages previously had no shared
case-file image layer at all. They now load one maintained image layer with the
same full-image viewer behavior used by the newer state pages. Existing
location text and research claims were not rewritten.

Every legacy entry now shows either its verified case-file image or an explicit
**Exact case-file photograph pending** message. This prevents a generic or
wrong-location image from being silently substituted while the source audit
continues.

The Alabama batch is now complete for all 18 exact locations:

- Sloss Furnaces — DXR, CC BY-SA 4.0.
- Fort Morgan — Ermattox9, public domain.
- Sturdivant Hall — Jeffrey Reed / Altairisfar, CC BY-SA 3.0.
- USS Alabama Battleship — JSA0332, CC BY-SA 3.0.
- Maple Hill Cemetery — LonelyPilgrim, CC BY 2.5.
- Gaineswood — Carol M. Highsmith / Library of Congress, public domain.
- Redmont Hotel — Chris Pruitt, CC BY-SA 3.0.
- Old Cahawba (Arthur–Fambro House) — Brian.S.W, CC BY-SA 4.0.
- Gaines Ridge Dinner Club — owner-supplied exact source photograph.
- Kenworthy Hall — RuralSWAlabama, CC BY-SA 3.0.
- Sweetwater Mansion — E.W. Burkhardt and W. N. Manning, public domain.
- Tutwiler Hotel — Charlie Brenner, CC BY-SA 2.0.
- Dead Children’s Playground — Visit Huntsville source image; reuse terms not stated on retrieved page.
- Dr. John R. Drish House — Carol M. Highsmith, public domain.
- Pickens County Courthouse — Calvin Beale, public domain.
- Alabama State Capitol — DXR, CC BY-SA 4.0.
- Pratt Hall — Lee Peacock source image; reuse terms not stated on retrieved page.
- Cedarhurst Mansion — Visit Huntsville source image; reuse terms not stated on retrieved page.

The original source photographs and TPI case-file treatments are stored under
`haunted-location-directory/case-file-photos/`; the mappings and attribution
are maintained in `legacy-case-file-sources.js`. Alabama now has no pending
case-file image entries. After the completed Alaska batch below, the remaining
373 legacy locations stay visibly
pending until exact identity and reuse terms are verified. Three Alabama
source records retain an explicit rights-review note because the retrieved
pages did not state reuse terms; they are not represented as TPI-owned
documentary photographs.

The Arizona batch is now complete for all 15 exact locations:

- Bird Cage Theatre — Tombstone.
- Jerome Grand Hotel — Jerome.
- Hotel San Carlos — Phoenix.
- Vulture Gold Mine — Wickenburg.
- Hotel Monte Vista — Flagstaff.
- Yuma Territorial Prison — Yuma.
- Copper Queen Hotel — Bisbee.
- Jerome Cemetery — Jerome.
- Mission San Xavier del Bac — Tucson.
- Orpheum Theatre — Phoenix.
- Tombstone Courthouse — Tombstone.
- Arizona State Capitol — Phoenix.
- Superstition Mountains — Superstition Wilderness.
- La Posada Hotel — Winslow.
- Old Bisbee Historic District — Bisbee.

Each Arizona entry now has an exact source photograph and a matching TPI
case-file treatment stored locally. The treatment title uses **The Paranormal
Initiative**; TPI is not expanded or labeled as “Paranormal Investigations.”
Source records with unclear reuse terms remain explicitly marked for rights
review and are not represented as TPI-owned documentary photographs.

The Alaska batch is now complete for all 11 exact locations:

- Golden North Hotel — Skagway.
- Red Dog Saloon — Juneau.
- Buckner Building — Whittier.
- Kennecott Mines — McCarthy.
- Anchorage Pioneer Home — Anchorage.
- Fourth Avenue Theatre — Anchorage.
- Alaska State Capitol — Juneau.
- Talkeetna Roadhouse — Talkeetna.
- Sitka National Cemetery — Sitka.
- Castle Hill — Sitka.
- Tongass National Forest — Southeast Alaska region.

Each Alaska entry has an untouched source photograph and a matching TPI case-file
treatment. The treatment title uses **The Paranormal Initiative**; TPI is not
expanded or labeled as “Paranormal Investigations.” The remaining legacy count
after Alabama, Alaska, and Arizona is 358. Alaska source records with unclear reuse terms
remain explicitly marked for rights review and are not represented as TPI-owned
documentary photographs.

## California legacy batch — completed

California contains 15 directory entries. All 15 now have an exact source
photograph, a matching TPI case-file treatment, local asset copies, and a
source/credit record:

- Winchester Mystery House
- The Queen Mary
- Whaley House Museum
- Hotel del Coronado
- Alcatraz Island
- Preston Castle
- Bodie State Historic Park
- Mission Inn
- Brookdale Lodge
- Moss Beach Distillery
- Black Diamond Mines Regional Preserve
- Calico Ghost Town
- Columbia State Historic Park
- Fort Humboldt State Historic Park
- Point Sur Lighthouse

The treatments use **The Paranormal Initiative** branding and a **CALIFORNIA**
state badge. TPI is not expanded or labeled as “Paranormal Investigations.”
The untouched source photographs and transformed case-file images are stored
under `haunted-location-directory/case-file-photos/`, with mappings in
`legacy-case-file-sources.js`. All 15 California sources have recorded reuse
terms; the local derivative treatment does not erase the original attribution
or license obligations.

## Colorado legacy batch — completed

Colorado contains 22 directory entries. All 22 now have an exact source
photograph, a matching TPI case-file treatment, local asset copies, and a
source/credit record:

- The Stanley Hotel
- The Brown Palace Hotel
- The Oxford Hotel
- Hotel Colorado
- Museum of Colorado Prisons
- Central City Opera House
- Molly Brown House Museum
- Croke-Patterson Mansion
- Cheesman Park
- St. Elmo Ghost Town
- Ashcroft Ghost Town
- Independence Ghost Town
- Georgetown Loop Railroad
- Gold Camp Road Tunnels
- Riverside Cemetery
- Fort Logan National Cemetery
- Camp Hale
- Grand Imperial Hotel
- Cripple Creek District Museum
- Buckhorn Exchange
- Central City Cemetery
- Third Bridge

The treatments use **The Paranormal Initiative** branding and a **COLORADO**
state badge. TPI is not expanded or labeled as “Paranormal Investigations.”
Each treatment is derived from the exact location reference and is labeled as
a stylized case-file presentation rather than an unedited documentary photo.

The owner supplied exact source photographs for Central City Cemetery and Third
Bridge. All 22 Colorado entries now have exact source photographs and matching
TPI case-file treatments; no generic or AI-invented landmark substitute is used.

## Connecticut legacy batch — 13 completed

Connecticut contains 13 directory entries. All 13 have an exact source
photograph, a matching TPI case-file treatment, local asset copies, and a
source/credit record:

- Union Cemetery
- Captain Grant's 1754
- Fairfield Hills Campus
- Seaside Sanatorium
- Mark Twain House
- Nathan Hale Homestead
- Lockwood-Mathews Mansion Museum
- New Haven Green
- Sterling Opera House
- Norwich State Hospital
- Gillette Castle State Park
- Wadsworth Atheneum Museum of Art
- The Griswold Inn

The treatments use **The Paranormal Initiative** branding and a **CONNECTICUT**
state badge. TPI is not expanded or labeled as “Paranormal Investigations.”
Each treatment preserves the exact source subject and is presented as a
stylized case-file image, not an unedited documentary photograph.

The Cornwall Dudleytown entry was removed from the directory because its
restricted, disputed folklore record did not meet the current haunted-location
catalog standard. The separately named Dudleytown Historic District in Guilford
was not substituted into the directory.

## Delaware legacy batch — completed

Delaware contains 4 directory entries. All 4 now have an exact source
photograph, a matching TPI case-file treatment, local asset copies, and a
source/credit record:

- Fort Delaware
- Rockwood Park & Museum
- Woodburn
- Old Swedes Church

The treatments use **The Paranormal Initiative** branding and a **DELAWARE**
state badge. TPI is not expanded or labeled as “Paranormal Investigations.”
Each treatment preserves the exact source subject and is presented as a
stylized case-file image, not an unedited documentary photograph. Original
access notes remain in the directory: Fort Delaware requires ferry access,
Woodburn has limited access, and Old Swedes Church is accessed through public
tours or site rules. The case files do not direct members to trespass or bypass
those conditions.

## Illinois legacy batch — completed and live

Illinois contains 18 directory entries. All 18 now have an exact local source
photograph, a matching **ILLINOIS** case-file treatment, and a source/credit
record:

- Villa Kathrine
- McPike Mansion
- Alton Hauntings / Mineral Springs area
- Congress Plaza Hotel
- Bachelor’s Grove Cemetery
- Resurrection Cemetery
- Old Joliet Prison
- Will County Historical Museum
- Kaskaskia Hotel
- Starved Rock Lodge / Starved Rock area
- Greenwood Cemetery
- Miner's Theatre
- Cuba Road / White Cemetery
- Dole Mansion
- Blood’s Point Road & Cemetery
- Haunted Rock Island Roadhouse
- Peoria State Hospital
- University of Illinois English Building

The treatments use **The Paranormal Initiative** branding and an **ILLINOIS**
state badge. TPI is not expanded or labeled as “Paranormal Investigations.”
Each treatment preserves the exact source subject and is presented as a
stylized case-file image, not an unedited documentary photograph. The Miner's
Theatre source was corrected from an initial logo-only source to an exact
exterior photograph of the Miner's Institute building before treatment.

Mineral Springs, Greenwood Cemetery, Miner's Theatre, White Cemetery, Blood's
Point Cemetery, Rock Island YMCA, and other sources whose retrieved pages did
not state reuse terms remain explicitly flagged for rights review in
`legacy-case-file-sources.js`. They are not represented as TPI-owned
documentary photographs. Original attribution and license obligations remain
recorded. The case files do not direct members to trespass or bypass public,
guest, guided, or limited-hours access rules.

## Illinois release record

- Source commit: `8cb8be4dd38f8bf8e5950fe27df0fb129b01db7d`
- Release candidate: `rel-8cb8be4dd38f-3d8533583da1`
- Production Worker version: `138004e5-ae97-4da2-8768-e50c9dc9f170`
- Rollback target: `85dee51d-7255-448e-98de-8f7ee32d3ce9`
- Release profile: website; protected StudioFlow and Nova bytes remained locked
- Certification: **10/10 gates passed**, manifest sealed as
  `66d38be701de6c191f5b3e4f0f1825bcc9dc9d15d74b9b273c104c521fc65160`
- Production smoke: **10/10 passed**
- Live Illinois page: **200**, 18 locations rendered
- Live Illinois assets: **36/36 returned HTTP 200**
- Final release state: **DEPLOYED_AND_VERIFIED**

## Florida legacy batch — completed

Florida contains 20 directory entries. All 20 now have an exact local source
photograph, a matching TPI case-file treatment, and a source/credit record:

- Castillo de San Marcos
- St. Augustine Lighthouse & Maritime Museum
- Lightner Museum
- Old Jail
- Casa Monica Resort & Spa
- Huguenot Cemetery
- Tolomato Cemetery
- Fort Clinch State Park
- Fort Pickens
- Fort Zachary Taylor Historic State Park
- Biltmore Hotel
- The Vinoy Resort & Golf Club
- Riddle House
- May-Stringer House
- Ashley’s of Rockledge
- Tampa Theatre
- Ybor City Museum State Park
- Henry B. Plant Museum / Plant Hall
- Greenwood Cemetery
- Devil’s Tree at Oak Hammock Park

The treatments use **The Paranormal Initiative** branding and a **FLORIDA**
state badge. TPI is not expanded or labeled as “Paranormal Investigations.”
Each treatment preserves the exact source subject and is presented as a
stylized case-file image rather than an unedited documentary photograph.

The May-Stringer House, Ashley’s of Rockledge, Greenwood Cemetery, and Devil’s
Tree source records have explicit rights-review notes because the retrieved
source pages did not state reuse terms. The directory retains those credits and
does not represent those source photographs as TPI-owned. Public, guest,
guided, and limited-hours access notes remain authoritative; no case file
directs members to trespass or bypass site rules.

## Georgia legacy batch — completed

Georgia contains 15 directory entries. All 15 now have an exact source
photograph, a matching TPI case-file treatment, local asset copies, and a
source/credit record:

- The Marshall House
- Sorrel-Weed House
- 17Hundred90 Inn
- Colonial Park Cemetery
- Bonaventure Cemetery
- Kehoe House
- Mercer-Williams House Museum
- The Olde Pink House
- Hay House
- Jekyll Island Club Resort
- Andersonville National Historic Site
- Kennesaw Mountain National Battlefield Park
- Tybee Island Light Station & Museum
- Oakland Cemetery
- Bulloch Hall

The treatments use **The Paranormal Initiative** branding and a **GEORGIA**
state badge. TPI is not expanded or labeled as “Paranormal Investigations.”
Each treatment preserves the exact source subject and is presented as a
stylized case-file image, not an unedited documentary photograph.

The 17Hundred90 Inn source is from the official inn website and its reuse
terms were not stated on the retrieved page, so that source remains explicitly
flagged for rights review. The remaining Georgia source and license records
are retained in `legacy-case-file-sources.js` and the photo README. Public,
guest, guided, and limited-hours access notes remain authoritative; no case
file directs members to trespass or bypass site rules.

## Hawaii legacy batch — completed in this continuation

Hawaii contains 10 directory entries. All 10 now have an exact local source
photograph, a matching TPI case-file treatment, and a source/credit record:

- ʻIolani Palace
- Nuʻuanu Pali Lookout
- Moana Surfrider
- Pearl Harbor National Memorial
- USS Arizona Memorial
- Morgan’s Corner
- Hawaii’s Plantation Village
- King Kamehameha V Judiciary History Center
- Kawaiahaʻo Church
- Hilton Hawaiian Village

The treatments use **The Paranormal Initiative** branding and a **HAWAII**
state badge. TPI is not expanded or labeled as “Paranormal Investigations.”
Morgan’s Corner is treated as a road-context location, not a fabricated
building. The Judiciary History Center treatment uses the exact Aliʻiōlani Hale
building that houses the center. The untouched sources and transformed case
files are stored under `haunted-location-directory/case-file-photos/`, with
mapping and attribution in `legacy-case-file-sources.js`.

Two source records remain explicitly flagged for rights review: the SFGate /
hdnux photograph used for Morgan’s Corner does not state reuse terms, and
Hawaii’s Plantation Village marks its photographs as institution-copyrighted.
Those files are not represented as TPI-owned documentary photographs. The
case-file images are clearly presentation treatments derived from the exact
source subjects.

## Hawaii release record

- Source commits: `7da00bdc` (mappings and documentation), `ffb51844` and
  `76a98f19` (image assets)
- Release candidate: `rel-76a98f19d8de-390b61ab3269`
- Production Worker version: `0aa6bce9-69f9-41d9-9b41-49f42302570a`
- Rollback target: `f4459813-d4b7-406b-9ef3-8c686b5c6fca`
- Release profile: website; protected application maintenance lock preserved
- Production smoke: **10/10 passed**
- Live Hawaii page: **200**, 10 entries rendered, all 20 source/treatment
  assets returned **200**
- Final release state: **DEPLOYED_AND_VERIFIED**

## Indiana legacy batch — completed and live

Indiana contains 19 directory entries. The batch now has 19 exact source
photographs and 19 matching TPI case-file treatments, for 38 local assets.
The treatments use the exact **INDIANA** marker and **The Paranormal
Initiative** branding. TPI is never expanded or labeled as “Paranormal
Investigations.”

Completed entries:

- Hannah House
- Indiana Medical History Museum / former Central State Hospital pathology building
- Crown Hill Cemetery
- Willard Public Library
- Indiana State Sanatorium
- Story Inn / Blue Lady location
- Lindenwood Cemetery
- Stepp Cemetery
- Roads Hotel
- Rotary Jail Museum
- Randolph County Asylum / Infirmary
- Culbertson Mansion State Historic Site
- Avon Haunted Bridge
- Whispers Estate
- Tunnelton Tunnel
- Rivoli Theatre
- Slippery Noodle Inn
- Old Lake County Jail / Sheriff’s House
- French Lick Springs Hotel

The source photograph and treatment mapping is recorded in
`haunted-location-directory/legacy-case-file-sources.js`. During source
verification, the initially downloaded file labeled for the Indiana Medical
History Museum was found to be a Rivoli Theatre image and was removed from the
batch. It was replaced with the exact exterior photograph from Huw Williams’s
public-domain Wikimedia Commons file. This correction is part of the Indiana
completion record so the directory does not publish a mislabeled location.

Several Indiana source pages did not state reuse terms. Those entries remain
marked **rights review required** in the mapping and README; the generated
case-file images are presentation derivatives and are not represented as
TPI-owned documentary photographs. The directory does not direct members to
trespass or bypass public, guest, guided, or limited-hours access rules.

Release evidence:

- Source commits: `6a3c5861`, `518ff0ed`, `20d5a77c`, `9545f73e`
- Release candidate: `rel-9545f73e6dc4-939554bec7bb`
- Source commit certified: `9545f73e6dc42d66a8c4fdf4199d00ec0eacb6f7`
- Release profile: website; protected StudioFlow and Nova application bytes
  remained under the maintenance lock
- Certified gates: **10 passed**; production smoke: **10/10 passed**
- Deployed Worker version: `cd6a89d8-20b9-4a0c-9a0a-c67bca22cccd`
- Rollback target: `138004e5-ae97-4da2-8768-e50c9dc9f170`
- Live Indiana page: **200**, 19 entries rendered
- Live Indiana assets: **38/38 returned 200**
- Final release state: **DEPLOYED_AND_VERIFIED**

## Kentucky legacy batch — completed and live

Kentucky contains 20 directory entries. The batch now includes 19 exact local
reference photographs and 20 matching KENTUCKY case-file treatments branded
for **The Paranormal Initiative**. Ditto House is the one documented exception:
the National Register archival record was available, but no directly reusable
exterior photograph was found, so its asset is explicitly labeled as a
historical reconstruction rather than a documentary photograph.

Completed entries:

- Waverly Hills Sanatorium
- Cave Hill Cemetery
- The Seelbach Hilton Louisville
- Old Talbott Tavern
- My Old Kentucky Home State Park
- Liberty Hall Historic Site
- Ditto House Inn historical reconstruction
- Fort Duffield
- Perryville Battlefield State Historic Site
- Bobby Mackey’s Music World historical-location record
- Theatre Workshop of Owensboro / Trinity Centre
- Ben Hawes State Park
- Daviess County Middle School
- Hiestand House / Taylor County Museum
- W.B. Muncy School
- Octagon Hall Museum
- Rohs Opera House
- Lexington Opera House
- Anderson Hotel historical record
- Kentucky State Penitentiary

The source, credit, reuse status, reconstruction disclosure, and access context
for every entry are recorded in
`haunted-location-directory/legacy-case-file-sources.js`. Sources whose
retrieved pages did not state reuse terms remain marked for rights review. The
directory does not direct members to trespass or bypass public, guest, guided,
school, secure-facility, or limited-hours access rules. TPI is **The Paranormal
Initiative**, never “Paranormal Investigations.”

Release evidence:

- Source commit certified: `56bed21d27e3dfb782c8b69e4eae648ad5419602`
- Release candidate: `rel-56bed21d27e3-bbb5ccc8c800`
- Release profile: website-only Tier 2; protected StudioFlow and Nova bytes
  remained under the maintenance lock
- Certified gates: **10 passed**; production smoke: **10/10 passed**
- Deployed Worker version: `71aba09e-feb9-483c-94c4-a1be6c14252d`
- Rollback target: `b800508d-3ee8-4ad4-8d4f-6b5c7fb969b3`
- Live Kentucky page: **200**, 20 location IDs rendered
- Live Kentucky image references: **40/40 returned 200** across 39 unique
  assets; Ditto House intentionally reuses its single labeled reconstruction
  for both the primary and case-file reference
- Final release state: **DEPLOYED_AND_VERIFIED**
