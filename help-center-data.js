(function () {
  window.TPI_HELP_CENTER = {
    brand: "The Paranormal Initiative",
    email: "paranormalinitiative@yahoo.com",
    themes: [
      { id: "cryptid", label: "Cryptid & Folklore" },
      { id: "seance", label: "Gothic Séance" },
      { id: "cosmic", label: "Cosmic Horror" },
      { id: "asylum", label: "Asylum & Investigation" },
      { id: "fieldops", label: "Field Operations" },
      { id: "gothicnight", label: "Gothic Night" }
    ],
    categories: [
      {
        id: "getting-started",
        icon: "✦",
        label: "Getting started with TPI",
        shortLabel: "Getting started",
        description: "Find your way around the Initiative, from the public site to the member community.",
        tone: "green"
      },
      {
        id: "account-access",
        icon: "⌁",
        label: "Member account, login & recovery",
        shortLabel: "Account & access",
        description: "Sign in, create your member identity, recover access, and manage your preferences.",
        tone: "blue"
      },
      {
        id: "community",
        icon: "◌",
        label: "Community & messaging",
        shortLabel: "Community",
        description: "Use the Community Feed, Messenger, Friends, notifications, and member profiles.",
        tone: "gold"
      },
      {
        id: "research-education",
        icon: "⌘",
        label: "Education, research & fieldwork",
        shortLabel: "Research & education",
        description: "Learn TPI methods, explore the Repository, and work responsibly in the field.",
        tone: "violet"
      },
      {
        id: "apps-studio",
        icon: "▣",
        label: "Apps, Creator Studio & Nova",
        shortLabel: "Apps & Studio",
        description: "Get oriented with TPI apps, StudioFlow, recordings, and the Nova editorial workspace.",
        tone: "cyan"
      },
      {
        id: "privacy-safety",
        icon: "◇",
        label: "Policies, privacy, safety & reporting",
        shortLabel: "Policies & safety",
        description: "Understand TPI policies, privacy boundaries, community standards, abuse reporting, and safety-first escalation.",
        tone: "slate"
      }
    ],
    articles: [
      {
        id: "what-is-tpi",
        category: "getting-started",
        title: "What is The Paranormal Initiative?",
        excerpt: "A plain-language guide to TPI’s research, investigation, education, community, and technology work.",
        updated: "November 14, 2026",
        popular: true,
        body: [
          { type: "p", text: "The Paranormal Initiative is a research, investigation, education, community, and technology project for people who want to take unusual experiences seriously without rushing to easy answers." },
          { type: "h2", text: "Start with the path that fits you" },
          { type: "p", text: "Visitors can explore the Education Center, Repository, videos, haunted-location material, and standards without creating an account. Members add community discussion, profiles, Messenger, events, saved content, and other member tools." },
          { type: "ul", items: ["New to TPI? Begin with About and the Education Center.", "Investigators can use the Repository, Standards & Ethics, and field-safety guidance.", "Members can use the Community Feed, Messenger, Friends, and member profile tools.", "Creators and contributors can learn about Nova and Creator Studio from the Apps & Studio section."] },
          { type: "h2", text: "Evidence before certainty" },
          { type: "p", text: "TPI materials are built around documentation, context, source review, and honest uncertainty. An unexplained observation is worth documenting; it is not automatically proof of a paranormal cause." }
        ]
      },
      {
        id: "find-your-way-around",
        category: "getting-started",
        title: "Find your way around the TPI site",
        excerpt: "A map of the public site, member area, education resources, media, and research tools.",
        updated: "November 14, 2026",
        body: [
          { type: "p", text: "The public site is organized around learning, research, media, community discovery, and responsible participation." },
          { type: "h2", text: "The main destinations" },
          { type: "ul", items: ["Education Center: lessons, field guides, Ghostology 101, and EVP/ITC study material.", "Repository: reference books, terminology, evidence, and investigation resources.", "Community: the member Feed, Messenger, Friends, profiles, and events.", "Our Apps: TPI tools, StudioFlow, and the Nova editorial workspace.", "Standards & Ethics: the conduct and evidence principles that guide TPI work."] },
          { type: "h2", text: "When you need a person" },
          { type: "p", text: "Use the Help Desk path when you cannot resolve an issue from an article. Include the page, feature, device, and what you expected to happen. Do not send a password or private recovery code." }
        ]
      },
      {
        id: "create-member-account",
        category: "account-access",
        title: "Create a member account or sign in",
        excerpt: "Use the member login page to join the TPI community or return to your existing member area.",
        updated: "November 14, 2026",
        popular: true,
        body: [
          { type: "p", text: "Community features are protected behind the TPI member login. You can explore the public site without signing in, then choose Join the Community or Sign In when you are ready." },
          { type: "h2", text: "To get started" },
          { type: "ol", items: ["Open Member Login from the site navigation or the Help Center header.", "Choose the registration option and complete the requested account fields.", "After registration, return to Member Login and sign in with your username and password.", "Open Member Home to reach your feed, profile, Messenger, saved content, and settings."] },
          { type: "h2", text: "Keep your account secure" },
          { type: "p", text: "Use a password that is unique to TPI. TPI staff will never need your password. If you suspect an account problem, use the recovery flow and contact the Help Desk without sharing credentials." }
        ]
      },
      {
        id: "recover-account",
        category: "account-access",
        title: "Recover access to your member account",
        excerpt: "What to do when you forget your password or cannot complete a normal sign-in.",
        updated: "November 14, 2026",
        body: [
          { type: "p", text: "Start at Member Login and use the password recovery option. The recovery flow is designed to avoid revealing whether an account exists to an unauthenticated visitor." },
          { type: "h2", text: "If recovery does not work" },
          { type: "p", text: "Open a Help Desk request and include the username or email you used, the approximate time of the last successful sign-in, and the exact message you see. Never include your password, a recovery token, or a screenshot containing private credentials." },
          { type: "callout", tone: "warning", title: "Account safety", text: "TPI support will not ask you to send a password. If a message asks for one, treat it as suspicious and report it." }
        ]
      },
      {
        id: "manage-profile-theme",
        category: "account-access",
        title: "Manage your profile and site theme",
        excerpt: "Update your member identity, profile details, and the visual theme used across TPI.",
        updated: "November 14, 2026",
        body: [
          { type: "p", text: "Your Profile is where your member identity and public profile details live. Settings holds login preferences and the saved color theme used across the site." },
          { type: "h2", text: "Profile versus Settings" },
          { type: "ul", items: ["Profile: your display identity, bio, photo, honors, and member-facing details.", "Settings: username, password, account preferences, Messenger blocks, and Color Theme.", "Home: your member feed and the quickest route back to community activity."] },
          { type: "h2", text: "Theme support" },
          { type: "p", text: "TPI supports Cryptid & Folklore, Gothic Séance, Cosmic Horror, Asylum & Investigation, Field Operations, and Gothic Night. The Help Center follows the same saved theme preference." }
        ]
      },
      {
        id: "community-feed-messenger",
        category: "community",
        title: "Use the Community Feed and Messenger",
        excerpt: "Post, comment, react, and move into private conversations while keeping community boundaries in view.",
        updated: "November 14, 2026",
        popular: true,
        body: [
          { type: "p", text: "The Community Feed is TPI’s member discussion space. Messenger is available from the member shell and lets you move a conversation into a private thread when appropriate." },
          { type: "h2", text: "A good first post" },
          { type: "p", text: "Lead with context: what happened, where and when it happened, what was observed directly, and what remains uncertain. Avoid posting private client details, exact addresses, or claims that could put someone at risk." },
          { type: "h2", text: "When to use Messenger" },
          { type: "p", text: "Use Messenger for member-to-member coordination that does not belong in a public post. Keep the same consent, privacy, and conduct expectations in private conversations." },
          { type: "callout", tone: "info", title: "Need to report something?", text: "Use the Privacy, safety & reporting section for the right escalation path. Moderation and support are not the same as emergency services." }
        ]
      },
      {
        id: "friends-notifications",
        category: "community",
        title: "Find Friends, notifications, and saved activity",
        excerpt: "Understand the member tools that help you keep up with conversations and people you follow.",
        updated: "November 14, 2026",
        body: [
          { type: "p", text: "The member shell groups social tools under Community and You. Friends helps you find and manage connections; Notifications keeps track of activity that needs your attention." },
          { type: "h2", text: "If a notification looks wrong" },
          { type: "p", text: "Open the linked activity first. If a link is missing, stale, or points to content you should not be able to view, report it through the Help Desk with the notification text and time." }
        ]
      },
      {
        id: "start-education-center",
        category: "research-education",
        title: "Start with the Education Center",
        excerpt: "Choose a learning path through Ghostology 101, research methods, equipment, documentation, and field safety.",
        updated: "November 14, 2026",
        popular: true,
        body: [
          { type: "p", text: "The Education Center is the best starting point for learning how TPI approaches paranormal investigation and research. It includes foundational lessons, equipment context, documentation, and responsible fieldwork." },
          { type: "h2", text: "Suggested first steps" },
          { type: "ol", items: ["Read What Is Paranormal Investigation?", "Review observation, note-taking, and professional documentation.", "Learn what common equipment actually measures.", "Read field safety, permission, and ethics guidance before planning an investigation."] },
          { type: "h2", text: "Research is a process" },
          { type: "p", text: "TPI resources are meant to improve questions, documentation, and review. They do not promise a paranormal explanation for every unusual experience." }
        ]
      },
      {
        id: "field-safety-permission",
        category: "research-education",
        title: "Follow field safety and permission standards",
        excerpt: "The non-negotiable basics for entering locations, working with witnesses, and protecting people during an investigation.",
        updated: "November 14, 2026",
        body: [
          { type: "p", text: "Never investigate a location without appropriate permission. Treat witnesses, residents, clients, and other investigators with dignity, and stop when a situation becomes unsafe or falls outside your role." },
          { type: "h2", text: "Pause the investigation when" },
          { type: "ul", items: ["There is a medical, mental-health, electrical, structural, environmental, or immediate personal-safety concern.", "A client is becoming more distressed because of the investigation.", "You do not have permission to enter, record, publish, or share the material.", "The team is being asked to diagnose, guarantee, or make a claim beyond its competence."] },
          { type: "callout", tone: "warning", title: "Safety comes first", text: "TPI is not an emergency service. Contact emergency services or an appropriate qualified professional when someone is in immediate danger." }
        ]
      },
      {
        id: "creator-studio-overview",
        category: "apps-studio",
        title: "Get oriented with Creator Studio",
        excerpt: "A first look at StudioFlow, programs, scenes, media, and the member access boundary.",
        updated: "November 14, 2026",
        popular: true,
        body: [
          { type: "p", text: "Creator Studio is TPI’s owner-facing broadcast and recording workspace. It brings together a studio, scenes, media, recording controls, and live-production tools for eligible members." },
          { type: "h2", text: "Before you open Studio" },
          { type: "ul", items: ["Use the same member account that has access to Creator Studio.", "Allow microphone or camera access only when the workflow calls for it.", "Keep important recordings backed up and do not use another member’s studio without permission.", "If a control is missing, confirm your role or entitlement before treating it as a bug."] },
          { type: "h2", text: "Report a Studio issue" },
          { type: "p", text: "Include the studio or project name, the control you used, what happened, browser/device details, and whether a recording or other data could be affected. Do not delete a studio or recording while troubleshooting." }
        ]
      },
      {
        id: "nova-editorial-workspace",
        category: "apps-studio",
        title: "Use the Nova Editorial Workspace",
        excerpt: "Understand where contributor writing, review, and publishing workflows fit into TPI.",
        updated: "November 14, 2026",
        body: [
          { type: "p", text: "Nova is TPI’s contributor-oriented editorial workspace. Access is role-gated because it can involve draft content, review, and publishing workflows." },
          { type: "h2", text: "If you cannot open Nova" },
          { type: "p", text: "Confirm that you are signed in to the intended member account and that your contributor access is active. If the access gate appears for the wrong role, use the Help Desk and include the page URL and account username." }
        ]
      },
      {
        id: "privacy-community-boundaries",
        category: "privacy-safety",
        title: "Protect privacy in TPI community spaces",
        excerpt: "What not to share in posts, profiles, Messenger, reports, and public research material.",
        updated: "November 14, 2026",
        body: [
          { type: "p", text: "A paranormal story can involve a real home, family, client, witness, or vulnerable person. Protecting their privacy is part of responsible investigation and community participation." },
          { type: "h2", text: "Do not publish" },
          { type: "ul", items: ["Exact residential addresses, private contact information, or identifying client details without clear permission.", "Private messages, photos, recordings, or documents that another person shared with a reasonable expectation of privacy.", "Medical, mental-health, legal, or safety claims about another person.", "Passwords, recovery codes, session details, or screenshots that expose account access."] },
          { type: "h2", text: "When in doubt" },
          { type: "p", text: "Pause publication and ask for consent or contact the Help Desk. Removing identifying details is not always enough if the surrounding story still makes a person easy to recognize." }
        ]
      },
      {
        id: "report-bug-community-issue",
        category: "privacy-safety",
        title: "Report a bug or community issue",
        excerpt: "Choose the right route for a broken feature, harmful content, privacy concern, or account problem.",
        updated: "November 14, 2026",
        popular: true,
        body: [
          { type: "p", text: "Use Report a Bug for a broken button, page, layout, media control, or other product behavior. Use the Help Desk for account access, privacy, safety, or questions that need a human response." },
          { type: "h2", text: "Include useful evidence" },
          { type: "ul", items: ["The page or feature name and a link if possible.", "The steps that led to the problem.", "What you expected and what actually happened.", "Browser, device, and approximate time.", "A screenshot only after checking that it does not expose passwords, private messages, or unrelated personal information."] },
          { type: "callout", tone: "warning", title: "Urgent safety concerns", text: "TPI support is not emergency response. If someone is in immediate danger, contact emergency services or an appropriate qualified professional first." }
        ]
      },
    ]
  };
})();
