/* ============================================================================
   FAROOQ — PORTFOLIO CONTENT · v3.1 (staging)
   ----------------------------------------------------------------------------
   REAL CONTENT — sourced from Muhammad Farooq's CV (received 2026-10-01).
   Structure, keys, layouts and behaviour are identical to the approved v3.0;
   only the INFORMATION was replaced. The original site/repo is untouched.

   STILL PLACEHOLDER:
     · socials GitHub/LinkedIn/X hrefs ("#") — no URLs in CV
     · assets/img/about-portrait.webp — no photo supplied yet

   HONESTY RULES (kept):
     · No invented clients, employers, awards, degrees or metrics.
     · Work cards describe real service lines from the CV, not client projects.
   ============================================================================ */

window.CONTENT = {

  /* ---------------- Profile ---------------- */
  profile: {
    name: "Muhammad Farooq",
    role: "GoHighLevel Expert · CRM & Automation Specialist",
    tagline: "CRM. Automation. Systems that sell.",
    location: "Multan, Pakistan · Working worldwide",
    email: "farooqfaiq18@gmail.com",
    phone: "+92 311 6432859",
    monogram: "F"
  },

  /* ---------------- Intro ---------------- */
  intro: {
    line1: "Raw ideas,",
    line2: "engineered to life.",   // rendered in lavender→rose gradient
    hudCornerTL: "FAROOQ — PORTFOLIO",
    hudCornerTR: "SHOWREEL ’26",
    hudCornerBL: "SCROLL TO EXPLORE",
    hudCornerBR: "V3.1",
    skipLabel: "SKIP INTRODUCTION"
  },

  /* ---------------- Hero ---------------- */
  hero: {
    eyebrow: "Farooq · GoHighLevel Expert",
    line1: "I engineer",
    line2: "systems that sell.",   // rendered in lavender→rose gradient
    sub: "GoHighLevel CRM, workflow automation, funnels and AI agents — built for agencies and service businesses, from first call to fully automated.",
    primaryCta: { label: "Start a project", href: "#contact" },
    secondaryCta: { label: "See selected work", href: "#work" },
    statusPrefix: "STRATEGY → SYSTEMS",
    chapters: [
      { n: "01", label: "CRM",        img: "assets/img/hero-crm.webp",        alt: "Dark CRM command center glowing in violet" },
      { n: "02", label: "Automation", img: "assets/img/hero-automation.webp", alt: "Faint automation streams flowing through dark nodes" },
      { n: "03", label: "Funnels",    img: "assets/img/hero-funnels.webp",    alt: "Glowing funnel layers descending through darkness" },
      { n: "04", label: "AI Agents",  img: "assets/img/hero-ai.webp",         alt: "Luminous AI orb glowing in dark space" }
    ]
  },

  /* ---------------- Marquee — real tools & disciplines ---------------- */
  marquee: [
    "GoHighLevel", "CRM Architecture", "Workflow Automation",
    "Funnels & Landing Pages", "Pipeline Management", "Email & SMS Automation",
    "AI Chatbots & Voice AI", "APIs & Webhooks", "A2P / Phone Setup",
    "Make.com", "Zapier", "n8n"
  ],

  /* ---------------- 01 / Selected work — real service lines -------------
     concept: false — these are services actually delivered, per the CV.
     No client names invented; cards describe the work, not engagements. */
  projects: [
    {
      id: "crm", index: "01", concept: false, duration: "02:07",
      title: "CRM BUILDS",
      headline: "Every lead, tracked.",
      scope: "GoHighLevel · CRM Architecture · Pipelines",
      description: "End-to-end GoHighLevel implementations — CRM architecture, pipelines, calendars, forms and funnels, delivered as organized, scalable workspaces. Lead management, appointment booking, contact segmentation and internal notifications, designed around how the business actually operates.",
      tags: ["GoHighLevel", "Pipelines", "Calendars"],
      image: "assets/img/project-crm.webp",
      imageAlt: "Glowing CRM pipeline columns in violet light"
    },
    {
      id: "automation", index: "02", concept: false, duration: "01:48",
      title: "AUTOMATION",
      headline: "Follow-up, on autopilot.",
      scope: "Workflow Automation · Email & SMS · Nurture",
      description: "Automated customer journeys — lead management, appointment flows, nurture sequences, reactivation campaigns and missed-call follow-up. Email/SMS logic, triggers, conditions, tags and custom fields wired so no lead ever goes cold from a missed manual step.",
      tags: ["Workflows", "Email & SMS", "Make"],
      image: "assets/img/project-automation.webp",
      imageAlt: "Luminous workflow nodes with email and message motifs"
    },
    {
      id: "funnels", index: "03", concept: false, duration: "01:56",
      title: "FUNNELS",
      headline: "Pages that convert.",
      scope: "Funnels · Landing Pages · Lead Capture",
      description: "Responsive, conversion-focused funnels, landing pages, forms and calendars — designed for clarity and wired straight into CRM workflows and pipelines. Front-end pages connected to follow-up systems so every inquiry moves smoothly into the pipeline.",
      tags: ["Funnels", "Landing Pages", "GHL"],
      image: "assets/img/project-funnels.webp",
      imageAlt: "Descending funnel layers channeling light to a conversion point"
    },
    {
      id: "ai", index: "04", concept: false, duration: "02:21",
      title: "AI AGENTS",
      headline: "Conversations that close.",
      scope: "AI Chatbots · Voice AI · Integrations",
      description: "AI chatbots and voice AI agents plugged into the CRM — instant lead response, qualification and booking around the clock. Backed by API and webhook integrations, A2P/phone setup and cross-platform data flows via Make, Zapier and n8n.",
      tags: ["AI Chatbots", "Voice AI", "APIs"],
      image: "assets/img/project-ai.webp",
      imageAlt: "Luminous AI orb with radiating sound-wave rings"
    }
  ],

  /* ---------------- 02 / Principles ---------------- */
  philosophy: {
    kicker: "02 / Principles",
    heading: "What makes a system <em>worth building.</em>",
    principles: [
      {
        numeral: "I",
        title: "Business first, tools second",
        text: "Client requirements become practical technical solutions — never the other way round. The business model decides the pipeline, the automation and the follow-up logic; the platform just executes it faithfully."
      },
      {
        numeral: "II",
        title: "Automate the repetitive",
        text: "Every manual step is a lead waiting to be lost. Follow-up, reminders, segmentation and internal notifications should run themselves — consistent customer journeys, zero babysitting."
      },
      {
        numeral: "III",
        title: "Test like it's live",
        text: "Workflows are tested end to end before handoff — gaps found, broken logic fixed, reliability proven. A system isn't done when it's built; it's done when it behaves under real conditions."
      }
    ]
  },

  /* ---------------- 03 / Engine ---------------- */
  engine: {
    kicker: "03 / From idea to experience",
    heading: "From a lead <em>to a customer.</em>",
    lede: "Every build travels the same arc — from business requirements to a system that sells on its own. Scrub through the stages.",
    stages: [
      {
        n: "01", code: "MAP", title: "The blueprint",
        text: "Business requirements become system architecture — pipelines, lead flow, booking logic, follow-up sequences. What the business needs, mapped before anything is built.",
        image: "assets/img/engine-idea.webp",
        imageAlt: "Glowing workflow blueprint in violet light"
      },
      {
        n: "02", code: "BUILD", title: "The system",
        text: "Workflows, funnels, calendars, forms and integrations — configured, connected and tested in working slices. You see the machine taking shape, not a black box.",
        image: "assets/img/engine-architecture.webp",
        imageAlt: "Workflow system assembling in violet light"
      },
      {
        n: "03", code: "OPTIMIZE", title: "The machine",
        text: "QA, troubleshooting and end-to-end validation — gaps closed, performance tuned, reliability proven. Then handoff: documented, explained, ready to run.",
        image: "assets/img/engine-product.webp",
        imageAlt: "Radiant go-live dashboard in violet light"
      }
    ]
  },

  /* ---------------- 04 / Worlds — real disciplines, deep-dives ------------- */
  worlds: [
    {
      n: "01", code: "W01", concept: false,
      title: "CRM BUILDS",
      headline: "Pipeline, <em>perfected.</em>",
      meta: "GHL IMPLEMENTATION · FIELD NOTES",
      tags: ["GoHighLevel", "Pipelines", "Calendars"],
      contribution: "End-to-end GoHighLevel implementations — CRM architecture, pipelines, workflow automation, calendars, forms and funnels — delivered for agencies and service businesses, with client teams coordinated through to handoff.",
      image: "assets/img/project-crm.webp",
      imageAlt: "Glowing CRM pipeline columns in violet light"
    },
    {
      n: "02", code: "W02", concept: false,
      title: "ONBOARDING",
      headline: "From chaos <em>to CRM.</em>",
      meta: "CLIENT ONBOARDING · FIELD NOTES",
      tags: ["Onboarding", "Workflows", "Training"],
      contribution: "Businesses onboarded into GoHighLevel — accounts, pipelines, workflows, funnels, forms and calendars configured; users guided through automation logic, lead handling and platform best practices until they run it confidently.",
      image: "assets/img/project-automation.webp",
      imageAlt: "Luminous workflow nodes with email and message motifs"
    },
    {
      n: "03", code: "W03", concept: false,
      title: "AUTOMATION",
      headline: "Zero manual <em>follow-up.</em>",
      meta: "WORKFLOW AUTOMATION · FIELD NOTES",
      tags: ["Automation", "Make", "Zapier"],
      contribution: "Cross-platform automations — GoHighLevel integrated with external tools via APIs, webhooks, Zapier, Make and n8n. Failed automations diagnosed, data flows validated, manual steps eliminated.",
      image: "assets/img/project-ai.webp",
      imageAlt: "Luminous AI orb with radiating sound-wave rings"
    }
  ],

  /* ---------------- 05 / Capabilities ---------------- */
  capabilities: {
    kicker: "05 / Capabilities",
    heading: "What I <em>can build.</em>",
    lede: "Ten disciplines, one standard: systems that behave in production, not just in demos.",
    features: [
      {
        n: "01", code: "FEATURED",
        title: "GoHighLevel CRM",
        statement: "Every lead, <em>tracked.</em>",
        body: "Full GHL implementations — CRM architecture, pipelines, calendars, forms, funnels and client onboarding — delivered as organized, scalable workspaces.",
        chips: ["GoHighLevel", "Pipelines", "Calendars"],
        image: "assets/img/project-crm.webp",
        imageAlt: "Glowing CRM pipeline columns in violet light"
      },
      {
        n: "02", code: "FEATURED",
        title: "Workflow Automation",
        statement: "Follow-up, <em>on autopilot.</em>",
        body: "Email & SMS campaigns, nurture sequences, appointment reminders, missed-call follow-up and reactivation — logic that keeps every journey moving.",
        chips: ["Workflows", "Email & SMS", "Make"],
        image: "assets/img/project-automation.webp",
        imageAlt: "Luminous workflow nodes with email and message motifs"
      }
    ],
    linkRows: [
      { n: "03", title: "Funnels & Landing Pages", text: "Responsive, conversion-focused pages — forms and calendars wired straight into CRM workflows and pipelines." },
      { n: "04", title: "AI Chatbots & Voice AI", text: "AI agents for instant lead response and booking — plus A2P and phone configuration done right." },
      { n: "05", title: "Integrations & QA", text: "APIs, webhooks, Zapier, Make and n8n — with troubleshooting and end-to-end testing before anything ships." }
    ]
  },

  /* ---------------- 06 / Digital — live demos (unchanged behaviour) ---------------- */
  experiences: {
    kicker: "06 / Digital",
    heading: "The next build <em>is interactive.</em>",
    lede: "A concept demo rendered live in your browser — click to replay.",
    cards: [
      { n: "01", code: "TERMINAL", title: "Live terminal", kind: "terminal",
        text: "A CRM deployment, typed live.",
        hint: "Click to replay" },
    ]
  },

  /* ---------------- Archive (curated highlights) ---------------- */
  archive: {
    kicker: "Archive",
    heading: "Selected <em>fragments.</em>",
    lede: "Sketches, studies and stills from the work above — kept for the record.",
    items: [
      { code: "A01", title: "Pipeline anatomy",   image: "assets/img/project-crm.webp",         imageAlt: "Glowing workflow blueprint in violet light" },
      { code: "A02", title: "Workflow close-up",  image: "assets/img/project-automation.webp", imageAlt: "Workflow system assembling in violet light" },
      { code: "A03", title: "Funnel architecture", image: "assets/img/project-funnels.webp",    imageAlt: "Descending funnel layers channeling light to a conversion point" },
      { code: "A04", title: "AI in production",   image: "assets/img/project-ai.webp",          imageAlt: "Luminous AI orb with radiating sound-wave rings" },
      { code: "A05", title: "Field notes",        image: "assets/img/engine-idea.webp",         imageAlt: "Glowing workflow blueprint in violet light" }
    ]
  },

  /* ---------------- 08 / Process — his real workflow ---------------- */
  process: {
    kicker: "08 / Process",
    heading: "From brief <em>to system.</em>",
    lede: "A clear path, agreed before the first workflow is built.",
    steps: [
      { n: "01", title: "Discover",     text: "Business goals, lead flow and bottlenecks. We map what the system must do — and what success looks like — before anything is configured." },
      { n: "02", title: "Architect",    text: "CRM structure, pipelines, fields, tags and automation logic — the blueprint every workflow, funnel and campaign runs on." },
      { n: "03", title: "Build",        text: "Workflows, funnels, calendars, forms and integrations — built in working slices you can see and steer as they take shape." },
      { n: "04", title: "Test & QA",    text: "End-to-end testing, broken-logic hunts and troubleshooting. Nothing is handed over until the system behaves under real conditions." },
      { n: "05", title: "Handoff",      text: "Documented, explained and handed over — your team runs it confidently. Then refined as real data comes in." }
    ],
    foot: "CLEAR SCOPE · TESTED BEFORE HANDOFF · DIRECT COMMUNICATION"
  },

  /* ---------------- Studio / About — real bio ---------------- */
  about: {
    kicker: "Studio",
    heading: "The human <em>behind the machine.</em>",
    portrait: "assets/img/about-portrait.webp",
    portraitAlt: "Silhouette placeholder portrait — replace with Farooq's photo",
    portraitCaption: "Portrait placeholder",
    paragraphs: [
      "Muhammad Farooq is a GoHighLevel expert and CRM & automation specialist based in Multan, Pakistan. He builds CRM systems, automation workflows, funnels, pipelines and AI agents for agencies and service businesses — the machinery that turns leads into customers while nobody watches.",
      "He currently leads end-to-end GoHighLevel implementations as Technical Manager at GHL Techy, and has onboarded businesses into the platform as an Onboarding Specialist at The GHL University. Before that: automation systems as a self-employed specialist, and funnel design at Vezzur.",
      "He holds a BS in Electrical Technology & Engineering from the Institute of Southern Punjab, Multan — an engineer's training, applied to revenue systems."
    ],
    exploringLabel: "Currently exploring",
    exploring: ["AI chatbots & voice AI", "Advanced workflow logic", "A2P & telephony", "Conversion-focused funnels"]
  },

  /* ---------------- Stack marquee ---------------- */
  stackBand: {
    kicker: "Selected stack",
    line1: "Precision, built",
    line2: "line by line.",   // rendered in lavender→rose gradient
    desc: "The tools behind the work — GoHighLevel at the center, Make, Zapier and n8n connecting everything around it. The loop never hurries; neither does good engineering.",
    pauseLabel: "PAUSE MOTION"
  },

  /* ---------------- 06b / Technology stack constellation ----------------
     Real tools from the CV — nothing aspirational. */
  stack: {
    heading: "An ecosystem, <em>not a list.</em>",
    lede: "Hover or tap a node to inspect it. Technologies connect — so does the work.",
    hint: "Select a node",
    nodes: [
      { name: "GoHighLevel", note: "The core platform — CRM builds, pipelines, workflows, calendars, funnels." },
      { name: "Make.com", note: "Visual automation scenarios connecting GHL to everything else." },
      { name: "Zapier", note: "No-code integrations and cross-app data flows." },
      { name: "n8n", note: "Self-hosted workflow automation for deeper control." },
      { name: "APIs & Webhooks", note: "Custom integrations and real-time data exchange." },
      { name: "Email & SMS", note: "Campaign logic, reminders, nurture and reactivation sequences." },
      { name: "AI Chatbots", note: "Conversational agents for instant lead response." },
      { name: "Voice AI & A2P", note: "Voice agents plus compliant phone/messaging setup." },
      { name: "Funnels", note: "High-converting pages, forms and booking flows." },
      { name: "Pipelines", note: "Stage design, automation triggers and contact segmentation." },
      { name: "CRM Architecture", note: "Fields, tags, objects and permissions that scale." },
      { name: "Troubleshooting & QA", note: "End-to-end testing, broken-logic hunts, system hardening." }
    ]
  },

  /* ---------------- 09 / FAQ ---------------- */
  faq: {
    kicker: "09 / Questions",
    heading: "Asked, <em>answered.</em>",
    items: [
      {
        q: "How does a project usually start?",
        a: "With a short conversation about your business — where leads come from, where follow-up breaks down, and what the system should do. If we're a fit, you'll get a clear scope before anything is built."
      },
      {
        q: "What do you actually build?",
        a: "GoHighLevel CRM setups, workflow automations, funnels and landing pages, pipelines, email & SMS campaigns, AI chatbots and voice AI, plus API/webhook integrations via Make, Zapier and n8n."
      },
      {
        q: "Do you work with agencies or direct businesses?",
        a: "Both. Agencies get implementation and onboarding support — full GHL workspaces delivered and handed over. Service businesses get complete lead-to-customer systems."
      },
      {
        q: "Where are you based, and how do we communicate?",
        a: "Multan, Pakistan — working remotely with clients worldwide. Communication is direct: you always know what's being built and what's next. The form below opens an email draft, or reach me at +92 311 6432859."
      }
    ]
  },

  /* ---------------- 10 / Contact ---------------- */
  contact: {
    kicker: "10 / Contact",
    heading: "Have a business to automate? <em>Let's build it.</em>",
    lede: "Tell me about your leads, your follow-up and where the process breaks down. I review every brief personally and reply with scope, approach and next steps. Prefer to talk? +92 311 6432859.",
    checklist: [
      "Clear scope agreed before the build",
      "Tested end-to-end before handoff",
      "Direct communication, no middlemen"
    ],
    form: {
      title: "Send a project brief",
      note: "Opens your email client with the brief pre-filled.",
      submitLabel: "Send project brief",
      privacy: "Your details are only used to reply to this brief — nothing is stored or shared.",
      services: ["GHL CRM setup", "Workflow automation", "Funnels & landing pages", "AI chatbots / Voice AI", "Something else"]
    }
  },

  /* ---------------- Socials — GitHub/LinkedIn/X still unknown ---------------- */
  socials: [
    { label: "GitHub",    href: "#" },
    { label: "LinkedIn",  href: "#" },
    { label: "X",         href: "#" },
    { label: "Email",     href: "mailto:farooqfaiq18@gmail.com" }
  ],

  /* ---------------- Footer ---------------- */
  footer: {
    ctaLine1: "Let's build",
    ctaLine2: "something extraordinary.",
    directoryNote: "GoHighLevel · CRM · Automation.",
    colophon: "© 2026 Muhammad Farooq · Multan, Pakistan.",
    backToTop: "Back to top",
    reduceMotion: "Reduce motion"
  }
};
