(function () {
  var publicData = window.TPI_HELP_CENTER || {};
  window.TPI_INTERNAL_HELP_CENTER = {
    title: "Internal Help Center",
    subtitle: "The Paranormal Initiative · Staff operations",
    email: publicData.email || "paranormalinitiative@yahoo.com",
    themes: publicData.themes || [
      { id: "cryptid", label: "Cryptid & Folklore" },
      { id: "seance", label: "Gothic Séance" },
      { id: "cosmic", label: "Cosmic Horror" },
      { id: "asylum", label: "Asylum & Investigation" },
      { id: "fieldops", label: "Field Operations" },
      { id: "gothicnight", label: "Gothic Night" }
    ],
    categories: [
      {
        id: "staff-start",
        icon: "✦",
        label: "Staff orientation & boundaries",
        shortLabel: "Start here",
        description: "Understand the internal Help Center, staff roles, escalation, and the difference between member and operational tools.",
        tone: "green"
      },
      {
        id: "administration-center",
        icon: "⌑",
        label: "Administration Center",
        shortLabel: "Admin Center",
        description: "Navigate the protected dashboard, member directory, analytics, audit logs, health, and settings surfaces.",
        tone: "blue"
      },
      {
        id: "moderation-reports",
        icon: "⚖",
        label: "Moderation, abuse & reports",
        shortLabel: "Moderation",
        description: "Review reports, hide or remove community content, document decisions, and escalate safety concerns.",
        tone: "red"
      },
      {
        id: "members-permissions",
        icon: "◌",
        label: "Members, roles & restrictions",
        shortLabel: "Members & roles",
        description: "Find a member, block or restore account access, understand staff appointments, and protect role boundaries.",
        tone: "gold"
      },
      {
        id: "content-publishing",
        icon: "⌘",
        label: "Content, teams & publishing",
        shortLabel: "Content & publishing",
        description: "Work with contributors, editorial review, Education Center content, teams, events, and published media.",
        tone: "violet"
      },
      {
        id: "apps-operations",
        icon: "▣",
        label: "Creator Studio, Nova & events",
        shortLabel: "Apps & operations",
        description: "Understand access, support boundaries, and operational handoffs for Creator Studio, Nova, channels, and events.",
        tone: "cyan"
      },
      {
        id: "security-audit",
        icon: "◇",
        label: "Security, privacy & audit",
        shortLabel: "Security & audit",
        description: "Keep internal work safe, minimize private data exposure, and leave an accurate administrative record.",
        tone: "slate"
      }
    ],
    articles: [
      {
        id: "internal-start-here",
        category: "staff-start",
        title: "Start here: how internal TPI work is organized",
        excerpt: "The operating map for admins, moderators, contributors, reviewers, and other credentialed staff.",
        updated: "November 14, 2026",
        popular: true,
        body: [
          { type: "p", text: "The Internal Help Center is for people with an active server-side staff appointment or another explicitly approved internal access path. It explains how the existing TPI tools work; it does not grant a role or bypass a server gate." },
          { type: "h2", text: "Choose the right surface" },
          { type: "ul", items: ["Administration Center: protected operations, member records, reports, content, governance, health, and audit views.", "Moderation: the focused queue for community posts and comments that need a Hide or Remove decision.", "Member Help Center: public-facing instructions, policies, privacy guidance, and abuse-reporting directions.", "Creator Studio and Nova: separate applications with their own entitlement and editorial boundaries."] },
          { type: "h2", text: "Work from the smallest authority needed" },
          { type: "p", text: "A staff title, badge, or visible menu item is not permission by itself. Use only the actions your appointment or capability allows. If a control is missing, ask for the correct escalation instead of trying a direct URL or a different account." },
          { type: "callout", tone: "warning", title: "Never share credentials", text: "Do not paste passwords, recovery codes, session cookies, stream keys, or private member data into a Help Center article, report, chat, or screenshot." }
        ]
      },
      {
        id: "admin-center-navigation",
        category: "administration-center",
        title: "Navigate the Administration Center",
        excerpt: "A map of the protected groups and the work each area is intended to support.",
        updated: "November 14, 2026",
        popular: true,
        body: [
          { type: "p", text: "Open Administration Center from the member shell or the protected /admin-panel route. The React Administration Center is the canonical current interface; old bookmarks should not be treated as a separate implementation." },
          { type: "h2", text: "Navigation groups" },
          { type: "ul", items: ["Dashboard: Overview, Analytics, and Activity.", "Members: Member Directory, Roles & Permissions, and Account Restrictions.", "Community: Community Overview, Posts & Comments, Reactions, Reports & Moderation, and Moderation History.", "Creators and Governance: creator records, Founding surfaces, leadership, board members, and Studio access.", "Content & Publishing: contributors, editorial review, teams, Education Center, comments, videos, and events.", "System: notifications, platform health, security, audit logs, and settings."] },
          { type: "h2", text: "If a page is unavailable" },
          { type: "p", text: "Confirm the account and its active staff appointment or capability. Do not infer that an unavailable view is broken: some controls are intentionally limited by role, ownership, or editorial authority." }
        ]
      },
      {
        id: "dashboard-health-audit",
        category: "administration-center",
        title: "Use the dashboard, health, and audit views",
        excerpt: "How to read operational signals without inventing history or treating a summary as the source of truth.",
        updated: "November 14, 2026",
        body: [
          { type: "p", text: "The dashboard is an operational snapshot from the existing data sources. It is useful for orientation and triage, not a replacement for the underlying record or an authorization decision." },
          { type: "h2", text: "A safe review sequence" },
          { type: "ol", items: ["Start with Overview and choose the smallest useful time range.", "Open the relevant detail view rather than acting from a metric card alone.", "Use Platform Health or Security when the question concerns availability or a protected boundary.", "Open Audit Logs after an administrative action and confirm the actor, target, action, and time are recorded."] },
          { type: "h2", text: "Keep unavailable data unavailable" },
          { type: "p", text: "If the interface says a source is unavailable, do not fill the gap from memory, a screenshot, or a private database export. Escalate the missing source and preserve the boundary." }
        ]
      },
      {
        id: "review-abuse-report",
        category: "moderation-reports",
        title: "Review an abuse or community report",
        excerpt: "A consistent process for reports involving posts, comments, videos, Messenger metadata, or a possible safety concern.",
        updated: "November 14, 2026",
        popular: true,
        body: [
          { type: "p", text: "Reports are a protected operational queue. Treat the report as an allegation or signal to review, not as proof that the reported person or content violated a rule." },
          { type: "h2", text: "Review sequence" },
          { type: "ol", items: ["Open Reports & Moderation and identify the report type, target, reason, status, and time.", "Open the protected detail only when your role permits it and only review the information needed for the decision.", "Compare the content with the applicable TPI policy or community standard; do not moderate disagreement merely because it is unpopular.", "Choose the supported status action, record a concise reason, and confirm the audit entry.", "Escalate threats, doxxing, credible immediate danger, or matters outside TPI’s role to the appropriate safety or emergency channel."] },
          { type: "h2", text: "Privacy boundary" },
          { type: "p", text: "Do not copy private message bodies, residential addresses, recovery information, or sensitive media into a report note. Link to the protected record or describe the minimum necessary fact." }
        ]
      },
      {
        id: "moderate-post-or-comment",
        category: "moderation-reports",
        title: "Hide or remove a community post or comment",
        excerpt: "Use the focused Moderation queue when content needs a documented Hide or Remove decision.",
        updated: "November 14, 2026",
        body: [
          { type: "p", text: "The focused Moderation surface is for community posts and comments. It is separate from member account blocking and from a report’s administrative status." },
          { type: "h2", text: "Steps" },
          { type: "ol", items: ["Open Moderation from the staff navigation.", "Read the item, its author context, and its current status.", "Enter a specific reason tied to the applicable conduct standard.", "Choose Hide for content that should be removed from normal visibility while the record remains available, or Remove when the supported workflow calls for permanent content removal.", "Refresh the queue and verify the action is reflected in the protected record."] },
          { type: "callout", tone: "info", title: "Use account action separately", text: "Hiding or removing content does not automatically block the member. If account access must change, follow the Member Directory procedure and use the smallest necessary action." }
        ]
      },
      {
        id: "block-or-restore-member",
        category: "members-permissions",
        title: "Block or restore a member account",
        excerpt: "How TPI’s current member action works when staff must stop login and posting access, and how to restore it.",
        updated: "November 14, 2026",
        popular: true,
        body: [
          { type: "p", text: "TPI’s current interface calls this action Block Member. It deactivates the account so the member cannot log in or post until an authorized staff member restores access. It is stronger than hiding one post and should be used only with a documented reason." },
          { type: "h2", text: "Block a member" },
          { type: "ol", items: ["Open Administration Center → Members → Member Directory.", "Search for the registered username and open the member record.", "Review the account, relevant report or moderation record, and your authority to act.", "Choose Block Member and confirm the action. Do not block your own account.", "Record or verify the reason in the appropriate protected audit or report record, then confirm the member status shows Blocked."] },
          { type: "h2", text: "Restore access" },
          { type: "ol", items: ["Open the member record for the blocked account.", "Review why the block was applied and whether the restoration condition has been met.", "Choose Unblock / Restore Member, then refresh the record and confirm Active status.", "If the reason or authority is unclear, escalate instead of restoring access speculatively."] },
          { type: "callout", tone: "warning", title: "Do not confuse controls", text: "Account blocking, capability restrictions, member-to-member blocking, and content moderation are different workflows. Use the procedure that matches the actual risk." }
        ]
      },
      {
        id: "staff-roles-and-appointments",
        category: "members-permissions",
        title: "Understand staff roles and appointments",
        excerpt: "Why staff authority is separate from membership, badges, titles, and ordinary contributor access.",
        updated: "November 14, 2026",
        body: [
          { type: "p", text: "Staff authority is recorded as a server-side appointment. The current catalog includes Executive, Full Administrator, Administrator, and Moderator. Owner and legacy administrator access remain supported by the existing authorization model." },
          { type: "h2", text: "Appointment rules" },
          { type: "ul", items: ["A profile title, honor, Founding Membership, or badge does not grant staff authority.", "Every staff change should have an accountable appointing actor and a reason.", "Owner and executive authority is broader than moderator authority; never use another role’s account to finish a task.", "Revoked or suspended appointments remain historical records and should not be recreated casually."] },
          { type: "h2", text: "Need a role change?" },
          { type: "p", text: "Escalate to the person authorized to appoint or change that role. Do not edit a display title as a substitute for a server-side appointment." }
        ]
      },
      {
        id: "member-data-and-private-contact",
        category: "members-permissions",
        title: "Handle member records and private contact data",
        excerpt: "Use the Member Directory without turning operational access into unnecessary disclosure.",
        updated: "November 14, 2026",
        body: [
          { type: "p", text: "Member records can include private contact information and activity summaries. Access it only for a defined operational purpose and do not copy it into chat, screenshots, spreadsheets, or personal notes." },
          { type: "h2", text: "Minimum necessary handling" },
          { type: "ul", items: ["Search by the exact username when possible.", "Confirm the target before changing status or profile information.", "Use public profile fields for public identity questions; use private contact data only when the operational task requires it.", "Close or clear the record when the task is complete and report accidental disclosure immediately."] }
        ]
      },
      {
        id: "editorial-review-and-publish",
        category: "content-publishing",
        title: "Review and publish contributor content",
        excerpt: "Keep Editorial Review and Publication separate and work from the approved Nova version.",
        updated: "November 14, 2026",
        popular: true,
        body: [
          { type: "p", text: "Editorial Review and Editorial Publish are separate capabilities. A reviewer can evaluate a submitted item without publishing it, and a publisher must publish the exact approved version pinned by the server." },
          { type: "h2", text: "Review" },
          { type: "ol", items: ["Open Content & Publishing → Editorial Review.", "Choose the queue state and open the submitted item.", "Check destination, metadata, evidence-aware language, privacy, and policy fit.", "Request changes or approve according to the review workflow; approval is not publication."] },
          { type: "h2", text: "Publish" },
          { type: "ol", items: ["Open the Publication view only when your account has Editorial Publish.", "Read the server-provided publication details and confirm the approved version is still current.", "Do not paste replacement HTML or publish a stale submission.", "After publishing, verify the public destination and the audit event."] }
        ]
      },
      {
        id: "teams-events-and-media",
        category: "content-publishing",
        title: "Operate content, teams, events, and media queues",
        excerpt: "A quick map for bounded operational surfaces that are not member moderation.",
        updated: "November 14, 2026",
        body: [
          { type: "p", text: "Teams, events, videos, channels, Education Center records, and contributor management each have their own status and ownership rules. Open the matching section instead of using a general member action to solve a content problem." },
          { type: "h2", text: "Before changing a record" },
          { type: "ul", items: ["Confirm the record identity and current state.", "Check whether the action is owner-only, administrator-scoped, contributor-scoped, or editorial.", "Use a concise administrative note when the workflow supports one.", "Verify the resulting public or member-facing state and the audit record."] }
        ]
      },
      {
        id: "creator-studio-and-nova-access",
        category: "apps-operations",
        title: "Troubleshoot Creator Studio and Nova access",
        excerpt: "Use the correct entitlement and staff boundary when an internal or contributor app is unavailable.",
        updated: "November 14, 2026",
        body: [
          { type: "p", text: "Creator Studio, Nova, and the Administration Center are separate surfaces. A person may be authorized for one and not another. Do not solve an entitlement issue by changing an unrelated role." },
          { type: "h2", text: "Check in this order" },
          { type: "ol", items: ["Confirm the member is signed in to the intended account.", "Confirm the server-side staff appointment or Creator/Contributor capability that the feature requires.", "Check the app’s own access gate and the page URL.", "If access still looks wrong, record the username, route, time, and visible message in an escalation without including credentials or private media."] },
          { type: "h2", text: "Studio data safety" },
          { type: "p", text: "Do not delete a Studio, recording, scene, or media asset while troubleshooting. Use the approved backup and recovery guidance first." }
        ]
      },
      {
        id: "security-and-audit-practices",
        category: "security-audit",
        title: "Security and audit practices for internal work",
        excerpt: "The habits that protect members, staff, production systems, and the integrity of the operational record.",
        updated: "November 14, 2026",
        body: [
          { type: "p", text: "Internal access is a responsibility, not a general-purpose view of member life. Keep every action attributable, necessary, and proportionate." },
          { type: "h2", text: "Always" },
          { type: "ul", items: ["Use your own approved account and sign out of shared or temporary sessions.", "Verify the target before a destructive or access-changing action.", "Keep reasons factual, concise, and free of unnecessary private details.", "Check the audit record after a status, moderation, role, or publication change.", "Report suspected credential exposure or a security boundary failure immediately."] },
          { type: "h2", text: "Never" },
          { type: "ul", items: ["Share credentials or use someone else’s session.", "Bypass a server-side gate with a direct URL, browser storage edit, or copied token.", "Export member data to an unapproved location.", "Treat a screenshot, badge, or client-side label as proof of authority."] }
        ]
      },
      {
        id: "internal-escalation",
        category: "security-audit",
        title: "Escalate an internal issue",
        excerpt: "What to include when a staff workflow, authorization boundary, or production behavior needs review.",
        updated: "November 14, 2026",
        body: [
          { type: "p", text: "Use the internal escalation path when a procedure does not match the current interface, a role appears wrong, or an action may have affected member or production data." },
          { type: "h2", text: "Include" },
          { type: "ul", items: ["The route or Administration Center section.", "The action attempted and the visible result.", "The account role or appointment, described without sharing credentials.", "Approximate time, browser/device, and a safe reference to the affected record.", "Whether the issue is a privacy concern, security concern, availability issue, or ordinary product bug."] },
          { type: "h2", text: "Do not include" },
          { type: "p", text: "Passwords, recovery codes, session cookies, stream keys, private message bodies, exact residential addresses, or downloaded member exports." }
        ]
      }
    ]
  };
})();
