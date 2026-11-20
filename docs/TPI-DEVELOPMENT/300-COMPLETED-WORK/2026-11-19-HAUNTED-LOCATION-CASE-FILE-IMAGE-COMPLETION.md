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
