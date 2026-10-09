# THE PARANORMAL INITIATIVE
# MASTER ARCHITECTURAL / SOURCE-OF-TRUTH PLAN
# COMMUNITY • EDUCATION CENTER • CONTENT EDITOR • NOTIFICATIONS
# VERSION 1.0

---

# 0. PURPOSE OF THIS DOCUMENT

This document establishes the authoritative architecture for the following
areas of The Paranormal Initiative (TPI):

- Education Center
- Education Center research topics
- Content Editor
- Contributor publishing
- Community Feed
- Community interaction
- Publication notifications
- New-content announcements
- Existing Community Forum retirement

This document is now the architectural/source-of-truth specification for
these systems.

Future implementation decisions affecting these areas MUST conform to this
architecture unless this document is explicitly superseded by a newer
architectural specification.

This is an organizational and architectural change.

It is NOT permission to rebuild unrelated portions of TPI.

---

# 1. PRIMARY ARCHITECTURAL PRINCIPLE

TPI must clearly separate:

1. Permanent knowledge
2. Social/community discussion
3. Content discovery
4. Controlled publishing

These functions have different purposes and must not be unnecessarily
combined.

The resulting architecture is:

    EDUCATION CENTER
        |
        | Permanent knowledge
        v
    ORGANIZED TPI CONTENT


    COMMUNITY FEED
        |
        | Social interaction
        v
    MEMBER DISCUSSION


    NOTIFICATIONS
        |
        | Discovery
        v
    NEW CONTENT / IMPORTANT EVENTS


    CONTENT EDITOR
        |
        | Controlled publishing
        v
    AUTHORIZED CONTRIBUTORS
        |
        v
    EDUCATION CENTER

The Community Feed is the primary social discussion system.

A separate Community Forum is no longer required.

---

# 2. CRITICAL PRESERVATION RULE

Before making changes:

DO NOT assume the current implementation is wrong simply because this
architecture changes its organization.

First inspect the existing TPI implementation.

Determine:

- How the Education Center currently works
- How Research Topics currently work
- How the Content Editor currently works
- How contributor permissions currently work
- How member permissions currently work
- How the Community Feed currently works
- How notifications currently work
- How the Community Forum currently works
- Where Forum content is stored
- Whether Forum content is duplicated elsewhere
- What existing links/navigation point to the Forum
- What existing functionality depends upon the Forum

Preserve all unrelated working functionality.

Do not rewrite systems simply because they are nearby in the codebase.

Do not replace working components unless required by this architecture.

---

# 3. SOURCE-OF-TRUTH RULE

For this architectural area, this document is authoritative.

If the existing implementation conflicts with this document:

1. Identify the conflict.
2. Determine the smallest safe change required.
3. Preserve existing content and functionality wherever possible.
4. Do not silently invent a different architecture.
5. Do not reintroduce a separate forum as a substitute.

The goal is architectural simplification, not unnecessary redevelopment.

---

# 4. EDUCATION CENTER

The Education Center is the permanent, organized knowledge base of TPI.

It is the authoritative home for educational and research-oriented content
that has been intentionally published by authorized TPI contributors.

The Education Center may contain:

- Articles
- Lessons
- Research
- Experiments
- Case Studies
- Educational Series
- Technical material
- Historical material
- Other approved educational content

Education Center content should remain discoverable independently of the
Community Feed.

A member should be able to find an educational article months or years
after publication without searching through Community Feed posts.

---

# 5. EDUCATION CENTER TOPIC STRUCTURE

Preserve the established TPI research-topic architecture wherever practical.

Existing/established topics include:

- Investigation Science
- Evidence Science & Analysis
- Instrumentation & Technology
- Environmental Research
- EVP & ITC
- Consciousness & Human Experience
- Ethics
- Reporting & Documentation
- Community Development
- Technology Development
- Artificial Intelligence
- Historical & Cultural Research

Do not unnecessarily rename, delete, merge, or recreate existing topics.

If the current implementation contains additional valid topics, preserve
them unless there is an explicit reason to change them.

---

# 6. TOPICS ARE COLLECTIONS

Each Education Center topic is a permanent collection.

Example:

    EVP & ITC
        |
        +-- Articles
        +-- Lessons
        +-- Research
        +-- Experiments
        +-- Case Studies
        +-- Educational Series

The exact UI does not have to use these exact subsection labels if the
existing implementation has a better presentation.

The architectural requirement is:

CONTENT MUST BELONG TO AN ORGANIZED EDUCATION CENTER TOPIC.

New educational content should be added to an existing appropriate topic
rather than requiring a new forum, thread, or discussion area.

---

# 7. CONTENT EDITOR

KEEP THE CONTENT EDITOR.

The Content Editor is the controlled publishing system for official TPI
educational content.

The Content Editor is NOT a general member-posting interface.

The Content Editor must remain restricted to authorized users.

Potential authorized roles include:

- Contributors
- Researchers
- TPI Staff
- Administrators
- Site Owner

Exact role names must follow the existing TPI permission system where
possible.

---

# 8. REGULAR MEMBER PERMISSIONS

Regular members must NOT receive Content Editor access merely because
they are members of TPI.

Regular members may:

- Create Community Feed posts
- Comment on Community Feed posts
- React to Community Feed posts
- Participate in discussions
- View Education Center content
- Receive notifications
- Interact with published TPI content

Regular members must NOT:

- Create official Education Center articles
- Publish official TPI research content
- Modify Education Center categories
- Modify official educational content
- Access contributor-only Content Editor functions

---

# 9. CONTRIBUTOR PERMISSIONS

Authorized contributors may:

- Participate in the Community Feed
- Comment and interact with members
- Access the Content Editor
- Create approved educational content
- Select an appropriate Education Center topic
- Submit or publish content according to existing TPI workflow
- Manage their own content where permitted

Contributor permissions must not automatically grant administrative
permissions.

Maintain appropriate separation of privileges.

---

# 10. ADMINISTRATOR / STAFF PERMISSIONS

Administrators and authorized TPI staff may:

- Manage Community Feed content
- Moderate Community activity
- Manage Education Center content
- Manage contributors
- Manage categories/topics
- Manage notifications
- Manage publishing
- Manage members according to existing permissions
- Manage site-wide content

Do not broaden administrative access unnecessarily.

---

# 11. CONTENT PUBLISHING WORKFLOW

The authoritative publishing workflow is:

    AUTHORIZED CONTRIBUTOR
            |
            v
       CONTENT EDITOR
            |
            v
    CREATE CONTENT
            |
            v
    SELECT CONTENT TYPE
            |
            v
    SELECT EDUCATION TOPIC
            |
            v
    SUBMIT / PUBLISH
            |
            v
     EDUCATION CENTER
            |
            v
     PUBLICATION EVENT
            |
            +--------------------------+
            |                          |
            v                          v
      NOTIFICATION CENTER       OPTIONAL DIRECT MESSAGE
      title + summary +         thumbnail/preview +
      clickable destination     clickable destination

The contributor should NOT need to manually duplicate the article in the
Community Feed. Publication discovery belongs in notifications and, when
enabled, a direct message or preview card — not in the social Feed.

---

# 12. NO DUPLICATION OF EDUCATIONAL CONTENT

This is a critical rule.

The complete Education Center article must NOT be duplicated inside the
Community Feed.

The notification center or optional direct message may contain an
announcement/preview/link, but the social Community Feed should contain only
member-created social posts and discussions.

Example:

    NEW FROM THE TPI EDUCATION CENTER

    Understanding Audio Contamination During EVP Research

    We've published a new educational article covering audio contamination
    and its importance when analyzing potential EVP evidence.

    [READ ARTICLE]

This preview belongs in Notifications and, if enabled by the product
workflow, a direct message with a thumbnail. It does not become an automatic
Community Feed post.

The actual article remains in:

    Education Center → EVP & ITC

This prevents:

- Duplicate content
- Conflicting versions
- Maintenance problems
- Feed clutter
- Search confusion
- Multiple authoritative copies

---

# 13. COMMUNITY FEED

The Community Feed is the primary social/community environment for TPI.

The desired experience should feel familiar to users of:

- Facebook-style feeds
- Parapost-style community feeds
- Modern social community platforms

The Community Feed should support the functionality already present or
intended for TPI, including as appropriate:

- Member posts
- Text
- Images
- Video
- Links
- Questions
- Experiences
- Investigation discussion
- Research discussion
- Comments
- Reactions
- Community announcements

Do not turn the feed into a traditional forum.

---

# 14. COMMUNITY FEED ORGANIZATION

The Community Feed does not require traditional forum categories and
subforums.

Use lightweight organization such as:

- Categories
- Tags
- Filters
- Search

Potential filters include:

- All
- Paranormal
- Investigations
- Research
- Evidence
- EVP / ITC
- UFO / UAP
- Equipment
- Education
- TPI News
- General Discussion

These are organizational filters.

They are NOT separate forums.

---

# 15. COMMUNITY FEED = SINGLE SOCIAL DISCUSSION HUB

Do not create parallel discussion systems for the same purpose.

The following should generally be discussed in the Community Feed:

- Questions
- Experiences
- Opinions
- Investigation experiences
- Evidence discussion
- Reactions to TPI content
- General paranormal discussion
- Discussion of newly published educational material

The Community Feed should be the place members naturally return to
for social interaction.

---

# 16. COMMUNITY FORUM RETIREMENT

The existing Community Forum is legacy infrastructure.

IMPORTANT:

The current Forum contains material that was posted for the Education
Center.

It is NOT a separate member discussion community that requires migration
into the Community Feed.

Therefore:

DO NOT:

- Convert Forum posts into Community Feed discussions
- Recreate Forum threads as member conversations
- Build a Forum-to-Feed discussion migration system
- Preserve unnecessary Forum categories
- Maintain two competing discussion systems

Instead:

    OLD FORUM EDUCATIONAL CONTENT
              |
              v
       EDUCATION CENTER
              |
              v
          FORUM RETIRED

---

# 17. FORUM CONTENT AUDIT

Before retiring the Forum:

1. Inventory all Forum posts.
2. Determine whether each item already exists in the Education Center.
3. Identify any content that exists only in the Forum.
4. Preserve unique educational material.
5. Move or recreate missing material in the appropriate Education Center
   topic.
6. Verify the Education Center copy.
7. Verify links and media.
8. Verify authorship where appropriate.
9. Verify visibility and permissions.
10. Confirm nothing valuable has been lost.

Do not delete Forum content until this process is complete.

---

# 18. FORUM RETIREMENT PROCESS

After the Forum content audit:

1. Disable creation of new Forum content.
2. Remove Forum links from normal navigation.
3. Provide appropriate redirects where practical.
4. Redirect users toward the Community Feed or appropriate Education
   Center destination.
5. Confirm existing important links are handled.
6. Remove obsolete Forum UI.
7. Remove obsolete Forum infrastructure only after verification.

Do not break unrelated site functionality.

---

# 19. NOTIFICATION SYSTEM

When new significant content is published elsewhere on TPI, members should
be notified.

Notifications are intended for discovery.

Potential notification events include:

- New Education Center article
- New lesson
- New research publication
- New experiment
- New investigation report
- New case study
- New video
- New audio content
- New resource
- New event
- Major TPI announcement

The system should be extensible so additional content types can be added
later.

---

# 20. COMMUNITY ANNOUNCEMENT SYSTEM

Where appropriate, publication of new content should also generate a
Community Feed announcement.

Example:

    NEW FROM THE TPI EDUCATION CENTER

    Understanding Audio Contamination During EVP Research

    A new educational article is now available in the EVP & ITC section
    of the TPI Education Center.

    [READ ARTICLE]

The announcement should link directly to the authoritative content.

Members can comment on the announcement.

This creates:

    CONTENT
       ↓
    DISCOVERY
       ↓
    DISCUSSION

without duplicating the content.

---

# 21. NOTIFICATION VS COMMUNITY ANNOUNCEMENT

These are related but distinct concepts.

NOTIFICATION:

    "Something new is available."

COMMUNITY ANNOUNCEMENT:

    "Here is the new thing, and this is where we can discuss it."

ORIGINAL CONTENT:

    "This is the authoritative information."

Therefore:

    Notification
        ↓
    Community / Content
        ↓
    Discussion

---

# 22. EXAMPLE: EDUCATION ARTICLE

Contributor publishes:

    "Understanding Audio Contamination During EVP Research"

Through:

    Content Editor
        ↓
    Topic = EVP & ITC
        ↓
    Education Center

System then creates:

    Member Notification

AND, where enabled:

    Community Feed Announcement

Members click:

    READ ARTICLE

They arrive at:

    Education Center → EVP & ITC → Article

Members can then return to or interact with the Community announcement
and discuss the article.

---

# 23. EXAMPLE: MEMBER POST

A regular member wants to ask:

    "Has anyone else experienced this type of audio contamination?"

They do NOT use the Content Editor.

They create:

    Community Feed Post

Other members comment and discuss it.

This remains a normal social/community interaction.

---

# 24. EXAMPLE: CONTRIBUTOR RESEARCH

A contributor writes:

    "A Practical Method for Reducing Environmental Audio Contamination"

They use:

    Content Editor

They select:

    Education Center → EVP & ITC

They publish.

The article becomes permanent Education Center content.

The system announces it through the Community layer.

The contributor does not have to manually copy the article into the feed.

---

# 25. EDUCATION CENTER DISCOVERY

The Education Center must remain useful even without the Community Feed.

Members should be able to browse:

- Research Topics
- Articles
- Lessons
- Research
- Experiments
- Case Studies

Search and filtering should make older content discoverable.

The Education Center is not merely an archive of recent posts.

It is TPI's long-term knowledge base.

---

# 26. SITE SEARCH

As the Forum is retired, search becomes increasingly important.

Search should eventually be capable of locating:

- Education Center articles
- Lessons
- Research
- Experiments
- Case Studies
- Investigations
- Community posts
- Contributors
- Topics
- Publications
- Resources

Do not require users to search through years of Community Feed posts
to locate permanent educational material.

---

# 27. NAVIGATION

The site should clearly distinguish the major functions.

Suggested architecture:

    HOME

    EDUCATION CENTER
        Research Topics
        Articles
        Lessons
        Research
        Experiments

    RESEARCH
        Research Library
        Case Studies
        Publications
        Resources

    COMMUNITY
        Community Feed

    INVESTIGATIONS
        Cases
        Locations
        Reports

    MEDIA
        Videos
        Audio
        Gallery

    EVENTS

    ABOUT TPI

Exact navigation labels may remain consistent with the existing TPI
design where appropriate.

The functional separation is the requirement.

---

# 28. DATA / CONTENT OWNERSHIP MODEL

Every piece of content should have one authoritative home.

Examples:

Education article:

    Education Center

Member discussion:

    Community Feed

Research publication:

    Research / appropriate research area

Investigation report:

    Investigations

Video:

    Media

Event:

    Events

The Community Feed may announce these things, but should not become the
authoritative storage location for them.

---

# 29. NO DUPLICATE AUTHORITATIVE SOURCES

Do not create:

    Education Center article
          +
    Forum copy
          +
    Community Feed copy

Instead:

    Education Center article
          +
    Community announcement/link

This is intentional.

The same principle should apply to other TPI content types wherever
practical.

---

# 30. FUTURE EXTENSIBILITY

The architecture must allow TPI to grow without requiring another
discussion system.

The Education Center may eventually contain hundreds or thousands of
items.

The Community Feed may contain thousands of member posts.

The architecture must continue to distinguish:

    Permanent Knowledge
            from
    Social Conversation

Do not solve growth by adding additional forums unless a future
architectural review explicitly determines that a genuinely separate
discussion system is required.

---

# 31. IMPLEMENTATION SAFETY

The implementing agent MUST:

1. Inspect before modifying.
2. Preserve existing working functionality.
3. Make changes incrementally.
4. Avoid unrelated refactoring.
5. Avoid unnecessary dependency changes.
6. Avoid unnecessary database/schema changes.
7. Preserve existing content.
8. Preserve existing contributor data.
9. Preserve existing member data.
10. Preserve existing Community Feed content.
11. Audit Forum content before retirement.
12. Test after significant changes.
13. Verify permissions.
14. Verify publication workflows.
15. Verify notification behavior.
16. Verify redirects/navigation.
17. Verify that no educational content is lost.

Do not interpret this architecture as permission to rewrite the entire
TPI application.

---

# 32. IMPLEMENTATION ORDER

The recommended implementation sequence is:

## PHASE 1 — INSPECTION

Inspect:

- Education Center
- Content Editor
- Community Feed
- Forum
- Notifications
- Permissions
- Navigation
- Relevant data models
- Relevant APIs/services
- Existing content

No destructive changes.

---

## PHASE 2 — EDUCATION CENTER VERIFICATION

Confirm:

- Topics work correctly.
- Content can be assigned to topics.
- Published content appears correctly.
- Existing material is intact.
- Contributors can continue publishing.
- Members can view content.

---

## PHASE 3 — PERMISSIONS

Confirm:

Regular Member:
    Community access
    NO Content Editor

Contributor:
    Community access
    Content Editor access

Administrator:
    Full authorized management

Test permissions explicitly.

---

## PHASE 4 — COMMUNITY FEED

Confirm:

- Member posting
- Comments
- Reactions
- Media
- Filtering
- Categories/tags where applicable
- Moderation

Ensure it is capable of functioning as the single social hub.

---

## PHASE 5 — PUBLICATION EVENTS

Implement or refine:

- New-content event detection
- Notification generation
- Community Feed announcement generation
- Direct content links
- Discussion/comment behavior

Do not duplicate the full content.

---

## PHASE 6 — FORUM AUDIT

Inventory all Forum content.

Identify:

- Already preserved Education Center content
- Unique educational content
- Broken/obsolete material
- Duplicates

Preserve everything that needs preservation.

---

## PHASE 7 — FORUM RETIREMENT

After verification:

- Disable new Forum posts
- Remove Forum navigation
- Redirect appropriate URLs
- Retire Forum UI
- Retire obsolete Forum infrastructure

---

## PHASE 8 — FULL REGRESSION TEST

Test:

- Member experience
- Contributor experience
- Administrator experience
- Education Center
- Content Editor
- Community Feed
- Notifications
- Search
- Navigation
- Existing content
- Forum redirects
- Mobile/responsive behavior where applicable

---

# 33. ACCEPTANCE TESTS

The architecture is not considered successfully implemented until:

[ ] Education Center is the authoritative home for educational content.

[ ] Existing Education Center topics remain intact.

[ ] Existing educational material is preserved.

[ ] Existing Forum material has been audited.

[ ] Any unique Forum educational content has been preserved in the
    Education Center.

[ ] No valuable Forum content has been lost.

[ ] Regular members cannot access the Content Editor.

[ ] Authorized contributors can access the Content Editor.

[ ] Contributors can select the appropriate Education Center topic.

[ ] New content appears in the correct Education Center area.

[ ] Community Feed remains available to regular members.

[ ] Members can create Community Feed posts.

[ ] Members can comment.

[ ] Members can react where supported.

[ ] New Education Center content can generate a notification.

[ ] New Education Center content can generate a Community Feed announcement.

[ ] Community announcements link to the authoritative content.

[ ] Full educational articles are NOT duplicated into the Community Feed.

[ ] Members can discuss newly published content through the Community Feed.

[ ] The Community Forum is no longer required.

[ ] New Forum posting is disabled.

[ ] Forum navigation is removed or replaced.

[ ] Appropriate Forum URLs are redirected where practical.

[ ] Site search can locate Education Center content.

[ ] Existing unrelated TPI functionality remains operational.

[ ] No unnecessary architectural duplication has been introduced.

---

# 34. FINAL USER EXPERIENCE

The final experience should work like this:

A MEMBER visits TPI.

They enter the Community Feed.

They see normal community activity:

- Member experiences
- Questions
- Photos
- Evidence
- Investigations
- Discussions
- TPI announcements

They also see:

    NEW FROM THE TPI EDUCATION CENTER

They click the announcement.

They are taken to the permanent Education Center article.

They read the complete article.

They can return to the Community announcement and discuss it with other
members.

A CONTRIBUTOR can create another educational article months later.

They use the Content Editor.

They choose the appropriate Education Center topic.

They publish.

The article becomes part of the permanent TPI knowledge base.

The community is notified.

No Forum is required.

---

# 35. FINAL ARCHITECTURE

                         THE PARANORMAL INITIATIVE
                                  |
              +-------------------+-------------------+
              |                   |                   |
              v                   v                   v
        EDUCATION CENTER     COMMUNITY FEED      NOTIFICATIONS
              |                   |                   |
              |                   |                   |
        Permanent Knowledge    Social Discussion    Discovery
              |                   |                   |
              |                   |                   |
              +-------------------+-------------------+
                                  |
                           TPI COMMUNITY


                         CONTENT EDITOR
                              |
                              v
                     AUTHORIZED USERS ONLY
                              |
                              v
                       EDUCATION CENTER
                              |
                              v
                     PUBLICATION EVENT
                              |
                 +------------+------------+
                 |                         |
                 v                         v
           NOTIFICATION             COMMUNITY FEED
                                      ANNOUNCEMENT
                                           |
                                           v
                                      DISCUSSION


                         LEGACY COMMUNITY FORUM
                                  |
                                  v
                         EDUCATIONAL CONTENT
                                  |
                                  v
                         AUDIT / PRESERVE
                                  |
                                  v
                            RETIRE FORUM


# 36. NON-NEGOTIABLE RULES

1. The Education Center is the authoritative home for educational content.

2. The Community Feed is the primary and single social discussion hub.

3. The Content Editor is restricted to authorized contributors and staff.

4. Regular members do not receive Content Editor access.

5. Contributors do not need to manually duplicate Education Center content
   into the Community Feed.

6. The Community Feed should announce new content rather than duplicate it.

7. Notifications are for discovery.

8. Community Feed announcements are for discussion.

9. The original content section is the authoritative source.

10. The existing Forum contains legacy Education Center material and should
    not be treated as a member discussion archive.

11. Audit and preserve Forum material before retiring the Forum.

12. Do not create a new forum to replace the old forum.

13. Do not create duplicate authoritative copies of educational content.

14. Preserve existing working TPI functionality unless this architecture
    explicitly requires a change.

15. Do not modify unrelated areas of the TPI application.

16. Do not delete content without first verifying that it has been
    preserved.

17. Do not make architectural changes based on assumptions when the
    existing implementation can be inspected.

18. Test all affected workflows before considering the implementation
    complete.

---

# 37. ARCHITECTURAL END STATE

The intended TPI model is:

    CONTENT
       |
       v
    ORGANIZED WEBSITE SECTION
       |
       +----> NOTIFICATION
       |
       +----> COMMUNITY ANNOUNCEMENT
                    |
                    v
               DISCUSSION


The Community Feed is the social front door.

The Education Center is the knowledge base.

The Content Editor is the controlled publishing mechanism.

Notifications connect the two.

The Forum is retired.

This architecture is the authoritative source of truth for the TPI
Community / Education Center / Content Editor / Notification ecosystem
until explicitly superseded by a future architectural specification.
