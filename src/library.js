/* ============================================================
   Use case library, evidence, anti patterns, and the worked
   examples. In the production build this is generated from the
   research database; here it is hand authored.

   Each use case carries:
     screen  — what the phone mock renders
     match   — how the local matcher recognises it from free text
               (industries it fits, phrases a visitor might write,
                and single keywords worth a smaller score)
   ============================================================ */

var INDUSTRIES = [
  { key: "qsr", label: "Food, drink, cafés", short: "Food", persona: "roastery", icon: "coffee", appLabel: "Your café", noun: "café or food business" },
  { key: "retail", label: "Retail and grocery", short: "Retail", persona: "roastery", icon: "shopping-bag", appLabel: "Your shop", noun: "retail business" },
  { key: "trades", label: "Trades and home services", short: "Trades", persona: "hvac", icon: "wrench", appLabel: "Field ops", noun: "trades or home services business" },
  { key: "fitness", label: "Fitness and studios", short: "Fitness", persona: "roastery", icon: "dumbbell", appLabel: "Your studio", noun: "fitness studio" },
  { key: "nonprofit", label: "Nonprofit", short: "Nonprofit", persona: "roastery", icon: "heart-handshake", appLabel: "Your charity", noun: "nonprofit" },
  { key: "faith", label: "Faith community", short: "Faith", persona: "roastery", icon: "church", appLabel: "Your church", noun: "faith community" },
  { key: "b2b", label: "B2B and field service", short: "B2B", persona: "hvac", icon: "hard-hat", appLabel: "Client portal", noun: "B2B or field service business" },
  { key: "health", label: "Healthcare and clinics", short: "Health", persona: "hvac", icon: "stethoscope", appLabel: "Your practice", noun: "healthcare practice" },
  { key: "creator", label: "Solo creator or coach", short: "Creator", persona: "photographer", icon: "mic", appLabel: "Your studio", noun: "solo creator or coach" },
  { key: "events", label: "Events and ticketing", short: "Events", persona: "roastery", icon: "ticket", appLabel: "Your events", noun: "events business" },
  { key: "other", label: "Something else", short: "Other", persona: "roastery", icon: "shapes", appLabel: "Your app", noun: "business" }
];

var LIBRARY = {
  "uc.digital-loyalty": {
    name: "Digital loyalty that replaces the punch card", shortName: "Loyalty",
    oneLiner: "Regulars earn and redeem in the app instead of carrying a card they lose. You finally learn who your best customers actually are.",
    whatYouBuild: ["Sign in with a phone number or Apple and Google", "A stamp balance screen that is the app's home", "A scannable member code for the counter", "Reward unlock and redemption", "One push notification: you are one visit from a reward"],
    apps: [{ name: "Starbucks Rewards", note: "Stars per visit wired straight into order ahead." }, { name: "Sephora Beauty Insider", note: "Tiered points with real perks, not just discounts." }],
    effort: "About a week",
    effortNote: "The app is a weekend. Deciding the earn and burn economics so rewards do not eat your margin is the real work.",
    evidence: ["ev.loyalty.sephora-share", "ev.qsr.starbucks-float"],
    services: ["EAS Build", "Push credentials", "EAS Hosting", "EAS Update"],
    match: {
      industries: ["qsr", "retail", "fitness", "faith"],
      phrases: ["punch card", "stamp card", "loyalty", "regulars", "repeat customers", "same customers", "rewards", "come back every", "know our customers", "best customers", "frequent"],
      keywords: ["loyalty", "regulars", "rewards", "punch", "repeat"]
    },
    screen: { app: "Rose City", nav: "Rewards", hero: { label: "Your card", value: "8 of 10", sub: "Two more visits and the next bag is on us" }, dots: { on: 8, total: 10 }, rowsTitle: "Recent", rows: [{ title: "Oat flat white", meta: "Today · +1" }, { title: "Ethiopia Guji 340g", meta: "Sat · +1" }, { title: "Reward redeemed", meta: "12 Jun · −10", tone: "good" }], cta: "Show my member code", tabs: ["Card", "Order", "Beans", "Me"], tab: 0 }
  },

  "uc.order-ahead": {
    name: "Order ahead and pay before arriving", shortName: "Order ahead",
    oneLiner: "Customers build their usual order, pay in the app, and skip the queue. You keep the margin instead of handing it to an aggregator.",
    whatYouBuild: ["Menu with modifiers and a saved usual order", "Cart and stored card checkout", "Pickup time picker that respects kitchen capacity", "Order status screen and a ready for pickup push", "Staff side order queue on the web"],
    apps: [{ name: "Domino's", note: "Saved orders and one tap reorder with live tracking." }, { name: "Taco Bell", note: "Deep customisation is the reason to open the app over a kiosk." }],
    effort: "A few weeks",
    effortNote: "Payments and menu modifiers are where the time goes. Start with a fixed menu and no modifiers.",
    evidence: ["ev.qsr.mobile-share", "ev.qsr.owned-app-preference"],
    services: ["EAS Build", "EAS Hosting", "EAS Update", "EAS Submit"],
    caveat: "Do not launch ordering without loyalty attached. Ordering alone gives people no reason to pick your app over DoorDash.",
    match: {
      industries: ["qsr", "retail"],
      phrases: ["order ahead", "queue", "line out the door", "doordash", "uber eats", "deliveroo", "just eat", "third party fees", "delivery fees", "takeaway", "take out", "phone orders", "lunch rush", "morning rush", "pickup"],
      keywords: ["doordash", "queue", "takeaway", "orders", "menu", "delivery", "rush"]
    },
    screen: { app: "Rose City", nav: "Order ahead", hero: { label: "Your usual", value: "$6.40", sub: "Ready at 8:15 · Mississippi Ave" }, rowsTitle: "In your order", rows: [{ title: "Oat flat white", meta: "Large · extra hot" }, { title: "Almond croissant", meta: "1" }, { title: "Pickup 8:15", meta: "3 ahead of you", tone: "info" }], cta: "Pay $6.40 and reorder", tabs: ["Card", "Order", "Beans", "Me"], tab: 1 }
  },

  "uc.subscription-manage": {
    name: "Self serve subscription management", shortName: "Subscriptions",
    oneLiner: "Subscribers pause, skip, change plan, and update their card without emailing you. Churn drops because cancelling stops being the easiest option.",
    whatYouBuild: ["Next shipment screen with skip and pause", "Plan and frequency editing", "Card update flow", "Delivery notifications"],
    apps: [{ name: "Blue Apron", note: "Skip a week is one tap, so people skip instead of cancelling." }],
    effort: "About a week",
    effortNote: "Mostly a thin client over the billing provider you already use.",
    evidence: ["ev.loyalty.prime-renewal"],
    services: ["EAS Build", "EAS Hosting", "EAS Update"],
    match: {
      industries: ["qsr", "retail", "fitness", "creator", "b2b"],
      phrases: ["subscription", "subscribers", "recurring", "monthly plan", "membership fee", "auto ship", "renew", "churn", "cancel"],
      keywords: ["subscription", "subscribers", "recurring", "churn", "renewals"]
    },
    screen: { app: "Rose City", nav: "Your plan", hero: { label: "Next shipment", value: "Tue 14", sub: "Ethiopia Guji · 340g · filter grind" }, rowsTitle: "Plan", rows: [{ title: "Every 2 weeks", meta: "Change" }, { title: "Card ending 4412", meta: "Update" }, { title: "Skip next delivery", meta: "One tap", tone: "warn" }], cta: "Skip this week", tabs: ["Card", "Order", "Plan", "Me"], tab: 2 }
  },

  "uc.offline-field-capture": {
    name: "Job capture that works with no signal", shortName: "Offline job capture",
    oneLiner: "Your crew records the job, photos, parts, and a signature on site, in a basement or on a roof, and it syncs when they get bars back.",
    whatYouBuild: ["Today's assigned jobs, cached on the device", "Job form that writes to local storage first", "Photo capture attached to the job record", "Customer signature and a PDF receipt", "A sync queue with visible pending state"],
    apps: [{ name: "ServiceTitan Mobile", note: "The in field invoice is the feature that pays for the app." }, { name: "John Deere Operations Center", note: "Treats no connectivity as the default, not the exception." }],
    effort: "A few weeks",
    effortNote: "Offline sync is genuinely the hard part. Scope version one to a single form and one direction of sync.",
    evidence: ["ev.field.productivity-share", "ev.field.cost-reduction"],
    services: ["EAS Build", "EAS Hosting", "EAS Update", "EAS Workflows"],
    caveat: "If you already pay for a field service platform, the honest answer is to turn on their mobile app first.",
    match: {
      industries: ["trades", "b2b"],
      phrases: ["paper job sheets", "still use paper", "no signal", "no service", "double entry", "typed up again", "in the field", "site visits", "job sheets", "clipboard", "inspections", "technicians", "engineers", "crew", "vans", "install", "callout", "work orders"],
      keywords: ["technicians", "crew", "field", "paper", "offline", "jobs", "vans", "inspections"]
    },
    screen: { app: "Field Ops", nav: "Today", hero: { label: "Tuesday", value: "4 jobs", sub: "2 waiting to sync · working offline" }, rowsTitle: "Assigned to you", rows: [{ title: "14 Alder St · no heat", meta: "09:00 · done", tone: "good" }, { title: "22 Prescott · install", meta: "11:30 · pending sync", tone: "warn" }, { title: "Fremont Lofts · service", meta: "14:00" }], cta: "Start next job", tabs: ["Today", "Jobs", "Parts", "Me"], tab: 0, offline: true }
  },

  "uc.quote-to-invoice": {
    name: "Quote and invoice from the driveway", shortName: "Invoice on site",
    oneLiner: "Price the job, get it approved, and take payment before leaving the site. Cash arrives days earlier and nothing gets written up from memory.",
    whatYouBuild: ["Line item builder with saved common jobs", "Customer approval and signature on the device", "Card or tap to pay collection", "Emailed receipt and an accounting handoff"],
    apps: [{ name: "Jobber", note: "Quote, approve, and collect in one visit rather than three touches." }],
    effort: "A few weeks",
    effortNote: "Payment provider onboarding takes longer than the screens do. Start that paperwork first.",
    evidence: ["ev.field.cost-reduction", "ev.field.payment-speed"],
    services: ["EAS Build", "EAS Hosting", "EAS Update"],
    match: {
      industries: ["trades", "b2b", "creator"],
      phrases: ["invoices go out", "invoice later", "get paid", "chase payment", "quotes", "estimates", "cash flow", "take payment", "card reader", "billing"],
      keywords: ["invoices", "quotes", "estimates", "payment", "billing"]
    },
    screen: { app: "Field Ops", nav: "22 Prescott", hero: { label: "Job total", value: "$1,240", sub: "Approved on site by M. Reyes" }, rowsTitle: "Line items", rows: [{ title: "Condenser fan motor", meta: "$410" }, { title: "Labour · 3.5 hrs", meta: "$630" }, { title: "Refrigerant top up", meta: "$200" }], cta: "Take payment · tap to pay", tabs: ["Today", "Jobs", "Parts", "Me"], tab: 1 }
  },

  "uc.class-booking": {
    name: "Class and appointment booking", shortName: "Booking",
    oneLiner: "Members see what is on, book in two taps, and get themselves off the waitlist. Your front desk stops being a booking system.",
    whatYouBuild: ["Week view of classes or slots with spaces left", "Book, cancel, and join a waitlist", "A my bookings screen with calendar add", "Waitlist promotion push", "Late cancel and no show rules"],
    apps: [{ name: "ClassPass", note: "Booking friction is the entire product; everything else is secondary." }, { name: "Mindbody", note: "Waitlist promotion by push is what fills the last two spaces." }],
    effort: "A few weeks",
    effortNote: "Cancellation and waitlist rules are where the edge cases live. Write them down before you build.",
    evidence: ["ev.booking.no-show-drop", "ev.booking.self-serve"],
    services: ["EAS Build", "Push credentials", "EAS Hosting", "EAS Update"],
    match: {
      industries: ["fitness", "health", "creator", "events"],
      phrases: ["book a class", "classes", "appointments", "bookings", "waitlist", "front desk", "schedule", "timetable", "no shows", "phone to book", "reschedule", "slots"],
      keywords: ["classes", "appointments", "booking", "waitlist", "schedule", "sessions"]
    },
    screen: { app: "Your studio", nav: "This week", hero: { label: "Next up", value: "Thu 6:30", sub: "Vinyasa 60 with Ana · 3 spaces left" }, rowsTitle: "Your bookings", rows: [{ title: "Vinyasa 60", meta: "Thu 6:30", tone: "good" }, { title: "Strength", meta: "Sat 9:00" }, { title: "Reformer", meta: "Waitlist 2nd", tone: "warn" }], cta: "Book Thursday 6:30", tabs: ["Book", "Mine", "Plan", "Me"], tab: 0 }
  },

  "uc.membership-wallet": {
    name: "Digital membership and check in", shortName: "Membership",
    oneLiner: "One tap proves membership at the door, tracks visits, and shows what the membership is actually getting them.",
    whatYouBuild: ["Member card with a scannable code", "Visit history and streak", "Tier or benefit screen", "Renewal reminder push", "Staff side scanner on the web"],
    apps: [{ name: "Costco", note: "The card is the app; everything else is built around proving membership." }, { name: "National Trust", note: "Visit history quietly justifies the renewal." }],
    effort: "About a week",
    effortNote: "Getting the door scan reliable at peak time matters more than any other screen.",
    evidence: ["ev.loyalty.prime-renewal", "ev.member.renewal-visibility"],
    services: ["EAS Build", "Push credentials", "EAS Hosting", "EAS Update"],
    match: {
      industries: ["fitness", "faith", "nonprofit", "events", "retail"],
      phrases: ["members", "membership", "check in", "door", "renewal", "annual membership", "member card", "attendance", "sign in at the desk"],
      keywords: ["members", "membership", "renewal", "attendance", "checkin"]
    },
    screen: { app: "Your studio", nav: "Membership", hero: { label: "Member since", value: "2021", sub: "Unlimited · renews 14 March" }, dots: { on: 6, total: 8 }, rowsTitle: "This month", rows: [{ title: "6 visits", meta: "Best yet", tone: "good" }, { title: "Guest passes", meta: "2 left" }, { title: "Renewal", meta: "14 Mar" }], cta: "Show my member code", tabs: ["Card", "Book", "Perks", "Me"], tab: 0 }
  },

  "uc.recurring-give": {
    name: "Recurring giving and tap to donate", shortName: "Giving",
    oneLiner: "Supporters give in two taps and manage their recurring gift themselves, without emailing the office to change a card.",
    whatYouBuild: ["Give screen with preset and custom amounts", "Recurring gift setup and editing", "Fund or appeal picker", "Giving history and annual statement", "Gift received confirmation"],
    apps: [{ name: "Givelify", note: "Giving is the home screen; there is no navigation to get lost in." }, { name: "Givebutter", note: "Campaign progress turns a donation into participation." }],
    effort: "About a week",
    effortNote: "Payment provider approval and gift aid or tax receipting take longer than the screens.",
    evidence: ["ev.giving.mobile-share", "ev.giving.recurring-value"],
    services: ["EAS Build", "EAS Hosting", "EAS Update", "EAS Submit"],
    match: {
      industries: ["nonprofit", "faith"],
      phrases: ["donations", "donors", "giving", "tithe", "offering", "fundraising", "appeal", "supporters", "gift aid", "recurring gift", "pledge"],
      keywords: ["donations", "donors", "giving", "fundraising", "tithe", "supporters", "pledges"]
    },
    screen: { app: "Your church", nav: "Give", hero: { label: "Your giving", value: "$45 / mo", sub: "General fund · next 1 April" }, rowsTitle: "Recent", rows: [{ title: "Monthly gift", meta: "1 Mar · $45", tone: "good" }, { title: "Building appeal", meta: "18 Feb · $100" }, { title: "Annual statement", meta: "Download" }], cta: "Give again", tabs: ["Home", "Give", "Events", "Me"], tab: 1 }
  },

  "uc.community-feed": {
    name: "Announcements people actually see", shortName: "Announcements",
    oneLiner: "One place for what is happening, with a push for the things that matter. Stops you relying on whether the email got opened.",
    whatYouBuild: ["Announcement feed with pinned items", "Push for time sensitive notices", "Event list with add to calendar", "Groups or ministries directory", "Simple admin posting on the web"],
    apps: [{ name: "Discord", note: "Channels plus notification control is why people keep it installed." }, { name: "Band", note: "Built for a group that meets in person and needs the in between." }],
    effort: "About a week",
    effortNote: "Notification restraint is the design problem. One noisy week and everyone mutes it.",
    evidence: ["ev.push.open-rate", "ev.community.attendance"],
    services: ["EAS Build", "Push credentials", "EAS Hosting", "EAS Update"],
    match: {
      industries: ["faith", "nonprofit", "events", "fitness"],
      phrases: ["newsletter", "email blast", "announcements", "nobody reads", "notice board", "keep everyone informed", "volunteers", "congregation", "community", "members updated", "whatsapp group", "facebook group"],
      keywords: ["announcements", "newsletter", "volunteers", "congregation", "community", "updates"]
    },
    screen: { app: "Your church", nav: "This week", hero: { label: "Sunday", value: "10:30", sub: "Family service · hall open from 10:00" }, rowsTitle: "Latest", rows: [{ title: "Volunteer rota posted", meta: "2h ago", tone: "info" }, { title: "Youth group moved", meta: "Yesterday", tone: "warn" }, { title: "Lent course sign up", meta: "Mon" }], cta: "See all events", tabs: ["Home", "Give", "Events", "Me"], tab: 0 }
  },

  "uc.appointment-reminders": {
    name: "Reminders that cut no shows", shortName: "Reminders",
    oneLiner: "A push the day before and an easy way to move the slot, so the gap gets filled instead of sitting empty.",
    whatYouBuild: ["Upcoming appointment screen", "Reminder push at a sensible interval", "One tap reschedule into open slots", "Pre visit forms or prep notes", "Cancellation that releases the slot"],
    apps: [{ name: "MyChart", note: "Reminders plus records access is why patients keep it." }, { name: "Zocdoc", note: "Rescheduling is easier than cancelling, which is the whole trick." }],
    effort: "About a week",
    effortNote: "Wiring into whatever holds your diary is the work. The reminder itself is trivial.",
    evidence: ["ev.booking.no-show-drop", "ev.health.reminder-effect"],
    services: ["EAS Build", "Push credentials", "EAS Hosting", "EAS Update"],
    match: {
      industries: ["health", "trades", "creator", "fitness"],
      phrases: ["no shows", "missed appointments", "forget their appointment", "reminders", "text reminders", "empty slots", "last minute cancellations", "patients", "clients forget"],
      keywords: ["noshows", "reminders", "appointments", "patients", "cancellations"]
    },
    screen: { app: "Your practice", nav: "Your visits", hero: { label: "Next appointment", value: "Tue 09:20", sub: "Hygienist · 30 min · Dr Okafor" }, rowsTitle: "Before you come", rows: [{ title: "Medical form", meta: "2 min", tone: "warn" }, { title: "Reschedule", meta: "3 slots free", tone: "info" }, { title: "Last visit", meta: "14 Oct" }], cta: "Confirm Tuesday", tabs: ["Visits", "Forms", "Pay", "Me"], tab: 0 }
  },

  "uc.client-portal": {
    name: "A client portal that replaces the email thread", shortName: "Client portal",
    oneLiner: "Clients see status, approve things, and find the document without asking you where it is. Your inbox stops being the project tracker.",
    whatYouBuild: ["Project or matter status screen", "Secure document list with upload", "Approval and e signature step", "Invoice list and pay", "Message thread per project"],
    apps: [{ name: "Moxo", note: "Approvals and documents in one place, so nothing lives in email." }, { name: "Canopy", note: "Built around the annual document scramble." }],
    effort: "A few weeks",
    effortNote: "Permissions and document security take the time. Scope to one document type first.",
    evidence: ["ev.pro.email-overhead", "ev.pro.portal-consolidation"],
    services: ["EAS Build", "EAS Hosting", "EAS Update", "EAS Workflows"],
    caveat: "Clients only install this if it removes a step they already resent. If your email thread is short, a good web portal is enough.",
    match: {
      industries: ["b2b", "creator", "trades"],
      phrases: ["email thread", "chasing documents", "approvals", "sign off", "client updates", "where are we", "status updates", "onboarding clients", "portal", "shared folder", "retainer"],
      keywords: ["clients", "approvals", "documents", "portal", "retainer", "onboarding"]
    },
    screen: { app: "Client portal", nav: "Northfield Ltd", hero: { label: "Current stage", value: "In review", sub: "Draft accounts sent 3 days ago" }, rowsTitle: "Needs you", rows: [{ title: "Approve draft accounts", meta: "Sign", tone: "warn" }, { title: "Upload bank statements", meta: "2 missing", tone: "info" }, { title: "Invoice 0294", meta: "$1,800" }], cta: "Review and approve", tabs: ["Work", "Files", "Pay", "Me"], tab: 0 }
  },

  "uc.mobile-ticketing": {
    name: "Mobile tickets and entry", shortName: "Ticketing",
    oneLiner: "The ticket lives on the phone, scans at the door, and gives you a channel to the person holding it long after the event.",
    whatYouBuild: ["Wallet style ticket with a scannable code", "Transfer a ticket to a friend", "Door scanner for staff", "Event day updates by push", "Next event suggestions"],
    apps: [{ name: "Ticketmaster", note: "Favouriting an event is what makes the follow up spend possible." }, { name: "SeatGeek", note: "Transfer and resale keep the ticket in the app rather than a screenshot." }],
    effort: "A few weeks",
    effortNote: "Offline scanning at the door is the requirement everyone forgets until doors open.",
    evidence: ["ev.events.favourite-spend", "ev.events.owned-channel"],
    services: ["EAS Build", "Push credentials", "EAS Hosting", "EAS Update", "EAS Submit"],
    match: {
      industries: ["events", "faith", "nonprofit", "fitness"],
      phrases: ["tickets", "ticketing", "door", "entry", "attendees", "eventbrite", "box office", "gigs", "matchdays", "festival", "guest list", "scan at the door"],
      keywords: ["tickets", "attendees", "events", "entry", "eventbrite", "festival"]
    },
    screen: { app: "Your events", nav: "Saturday", hero: { label: "Your ticket", value: "GA · 2", sub: "Doors 19:00 · Corn Exchange" }, rowsTitle: "Your night", rows: [{ title: "Ticket ready", meta: "Scan at door", tone: "good" }, { title: "Transfer one", meta: "To a friend", tone: "info" }, { title: "Set times posted", meta: "1h ago" }], cta: "Show my ticket", tabs: ["Tickets", "What's on", "Map", "Me"], tab: 0 }
  },

  "uc.click-and-collect": {
    name: "Reserve online, collect in store", shortName: "Click and collect",
    oneLiner: "Customers check stock, reserve, and collect without queuing, and you get a reason to know who walked in.",
    whatYouBuild: ["Stock lookup by store", "Reserve or buy and collect", "Collection ready push and code", "In store mode with a scannable card", "Staff picking list on the web"],
    apps: [{ name: "Target", note: "Store mode changes the whole app when you walk in the door." }, { name: "Argos", note: "Reserve and collect is the entire proposition, and the app owns it." }],
    effort: "A few weeks",
    effortNote: "Live stock accuracy is the hard part. If your stock data lies, this makes it visible.",
    evidence: ["ev.retail.omnichannel-spend", "ev.retail.app-return-rate"],
    services: ["EAS Build", "Push credentials", "EAS Hosting", "EAS Update"],
    match: {
      industries: ["retail", "qsr"],
      phrases: ["click and collect", "in store", "stock", "inventory", "reserve", "collect", "shop floor", "footfall", "browse online", "buy online"],
      keywords: ["stock", "instore", "collect", "inventory", "shop", "store"]
    },
    screen: { app: "Your shop", nav: "Reserved", hero: { label: "Ready to collect", value: "2 items", sub: "Camden store · until Saturday" }, rowsTitle: "Your reservation", rows: [{ title: "Merino crew · M", meta: "In stock", tone: "good" }, { title: "Wool socks", meta: "In stock", tone: "good" }, { title: "Collection code", meta: "4417" }], cta: "Show collection code", tabs: ["Shop", "Reserved", "Stores", "Me"], tab: 1 }
  },

  "uc.content-library": {
    name: "Members only content people finish", shortName: "Content library",
    oneLiner: "Your programme, course, or archive in a form people actually work through, with offline download and progress they can see.",
    whatYouBuild: ["Library organised by programme or series", "Player with resume where you left off", "Offline download", "Progress and streak", "New release push"],
    apps: [{ name: "Nike Training Club", note: "Progress and streaks are why the content gets finished." }, { name: "Duolingo", note: "The habit loop is the product; the lessons are the material." }],
    effort: "A few weeks",
    effortNote: "Offline download and resume are more work than the catalogue. Plan for video hosting costs.",
    evidence: ["ev.content.habit-retention", "ev.content.offline-completion"],
    services: ["EAS Build", "Push credentials", "EAS Hosting", "EAS Update", "EAS Submit"],
    match: {
      industries: ["creator", "fitness", "faith", "nonprofit"],
      phrases: ["course", "courses", "programme", "program", "videos", "content", "podcast", "sermons", "workouts", "lessons", "training plan", "members area", "paywall", "patreon", "substack"],
      keywords: ["course", "videos", "content", "programme", "workouts", "lessons", "podcast", "sermons"]
    },
    screen: { app: "Your studio", nav: "Continue", hero: { label: "Week 3 of 8", value: "Day 2", sub: "Strength base · 28 min · downloaded" }, dots: { on: 3, total: 8 }, rowsTitle: "Up next", rows: [{ title: "Day 2 · Lower body", meta: "28 min", tone: "good" }, { title: "Day 3 · Mobility", meta: "18 min" }, { title: "Downloaded", meta: "3 sessions", tone: "info" }], cta: "Start day 2", tabs: ["Today", "Library", "Plan", "Me"], tab: 0 }
  },

  "uc.staff-scheduling": {
    name: "Rotas and shift swaps on the phone", shortName: "Rotas",
    oneLiner: "Staff see the rota, claim open shifts, and swap between themselves, so the group chat stops being your scheduling system.",
    whatYouBuild: ["My shifts and the team rota", "Open shift claiming", "Swap request and approval", "Rota published push", "Availability and time off requests"],
    apps: [{ name: "Deputy", note: "Open shift claiming is what removes the manager from the loop." }, { name: "When I Work", note: "Swaps between staff, with approval, rather than a phone call." }],
    effort: "A few weeks",
    effortNote: "Approval rules and overtime constraints are the real work. Start with view only, then add swaps.",
    evidence: ["ev.staff.admin-time", "ev.staff.turnover"],
    services: ["EAS Build", "Push credentials", "EAS Hosting", "EAS Update"],
    match: {
      industries: ["qsr", "retail", "trades", "health", "fitness"],
      phrases: ["rota", "roster", "shifts", "shift swap", "scheduling staff", "group chat", "whatsapp group", "staff availability", "part time staff", "cover a shift", "time off"],
      keywords: ["rota", "roster", "shifts", "staff", "scheduling", "cover"]
    },
    screen: { app: "Your team", nav: "My shifts", hero: { label: "This week", value: "32 hrs", sub: "4 shifts · one swap pending" }, rowsTitle: "Coming up", rows: [{ title: "Thu · Open to close", meta: "10:00 · 18:00" }, { title: "Fri · Swap requested", meta: "Pending", tone: "warn" }, { title: "Sat · Open shift", meta: "Claim", tone: "info" }], cta: "Claim Saturday", tabs: ["Shifts", "Team", "Time off", "Me"], tab: 0 }
  }
};

var EVIDENCE = {
  "ev.qsr.starbucks-float": { stat: "$1.77B", claim: "Sat in unused pre loaded Starbucks app balances in 2024, across 30 million mobile users.", source: "Company filings", confidence: "strong" },
  "ev.qsr.mobile-share": { stat: "60%", claim: "Of digital restaurant orders are placed on mobile.", source: "NPD Group", confidence: "strong" },
  "ev.qsr.owned-app-preference": { stat: "70%", claim: "Of consumers say they would rather order in a restaurant's own app than a third party.", source: "Industry survey", confidence: "directional" },
  "ev.loyalty.sephora-share": { stat: "80%", claim: "Of Sephora's North America sales come through Beauty Insider, at 40 to 46 million members.", source: "Company statements", confidence: "strong" },
  "ev.loyalty.prime-renewal": { stat: "93%", claim: "Of Amazon Prime members renew after year one, and they spend about twice as much as non members.", source: "Analyst estimates", confidence: "directional" },
  "ev.field.productivity-share": { stat: "75%", claim: "Of field service companies using mobile tools report higher staff productivity.", source: "Vendor aggregation", confidence: "vendor" },
  "ev.field.cost-reduction": { stat: "20%", claim: "Operational cost reduction is achievable with mobile field service management.", source: "Aberdeen Group", confidence: "directional" },
  "ev.field.payment-speed": { stat: "Days", claim: "Collecting on site rather than invoicing later is the single biggest lever on cash flow for small field businesses.", source: "Trade body guidance", confidence: "directional" },
  "ev.booking.no-show-drop": { stat: "38%", claim: "Reduction in no shows is commonly reported after adding push reminders with one tap rescheduling.", source: "Vendor aggregation", confidence: "vendor" },
  "ev.booking.self-serve": { stat: "2 in 3", claim: "Of bookings move to self serve within a year once an app makes it the easiest option.", source: "Vendor aggregation", confidence: "vendor" },
  "ev.member.renewal-visibility": { stat: "Renewals", claim: "Showing members what they used in the last year is the most consistent driver of renewal rates.", source: "Membership research", confidence: "directional" },
  "ev.giving.mobile-share": { stat: "84%", claim: "Of millennial donors say they prefer to give on a mobile device.", source: "Vendor aggregation", confidence: "vendor" },
  "ev.giving.recurring-value": { stat: "5x", claim: "Recurring donors are worth several times a one off gift over their lifetime.", source: "Fundraising research", confidence: "directional" },
  "ev.push.open-rate": { stat: "7x", claim: "Push notifications are opened far more often than email for the same audience and message.", source: "Vendor aggregation", confidence: "vendor" },
  "ev.community.attendance": { stat: "Attendance", claim: "Groups that move announcements into an owned channel report better turnout than those relying on email.", source: "Community research", confidence: "directional" },
  "ev.health.reminder-effect": { stat: "Fewer gaps", claim: "Reminders plus easy rescheduling fill cancelled slots that would otherwise be lost revenue.", source: "Practice management guidance", confidence: "directional" },
  "ev.pro.email-overhead": { stat: "28%", claim: "Of a professional's week goes on managing email, and around 20% on searching for information.", source: "McKinsey", confidence: "strong" },
  "ev.pro.portal-consolidation": { stat: "40%", claim: "Fewer client emails during peak season was reported by a regional firm after moving to a portal.", source: "Vendor case study", confidence: "vendor" },
  "ev.events.favourite-spend": { stat: "2.2x", claim: "Higher spend from fans who favourite events in the app than those who do not.", source: "Ticketmaster", confidence: "strong" },
  "ev.events.owned-channel": { stat: "+30%", claim: "App driven revenue growth year on year was reported by a club whose app became its largest owned channel.", source: "Club statements", confidence: "directional" },
  "ev.retail.omnichannel-spend": { stat: "16%", claim: "More spend per order from omnichannel customers, with materially higher lifetime value.", source: "Retail research", confidence: "strong" },
  "ev.retail.app-return-rate": { stat: "35-45%", claim: "Monthly return rate for retail apps, against 15 to 25% for mobile web.", source: "Vendor aggregation", confidence: "vendor" },
  "ev.content.habit-retention": { stat: "50%", claim: "Higher retention for personalised programmes than static content libraries.", source: "Vendor aggregation", confidence: "vendor" },
  "ev.content.offline-completion": { stat: "Completion", claim: "Offline download is the strongest predictor of whether a programme gets finished.", source: "Product research", confidence: "directional" },
  "ev.staff.admin-time": { stat: "Hours", claim: "Managers commonly recover several hours a week once staff can claim and swap shifts themselves.", source: "Vendor aggregation", confidence: "vendor" },
  "ev.staff.turnover": { stat: "Turnover", claim: "Schedule predictability and control are consistently among the top drivers of hourly staff retention.", source: "Labour research", confidence: "directional" }
};

var ANTIPATTERNS = {
  "ap.one-time-transaction": {
    name: "A relationship that ends after one transaction",
    body: "Every credible mobile business case rests on the same person coming back. When someone buys from you once and has no reason to return within a year, an app has nowhere to accrue value. There is no balance to build, no saved preference worth storing, and nothing worth a push notification.",
    better: "Put the effort into a fast mobile first web experience plus email or SMS follow up. If you want an icon on the home screen, a progressive web app gets you that without app store review.",
    revisit: "You add a subscription, a service plan, a membership, or a referral programme. Anything that gives the same person a reason to open it a second time."
  },
  "ap.seasonal-only": {
    name: "Demand that only exists a few weeks a year",
    body: "When the work concentrates into a short season and the relationship is intense for a few months and then over, an installed app has to survive the quiet months. It will be deleted long before the next booking.",
    better: "A shared link and a scheduled email sequence carry the same information without asking anyone to install anything.",
    revisit: "You move into something with year round repeat demand, or add an off season reason to open it."
  },
  "ap.tiny-audience": {
    name: "Not enough people to justify two app stores",
    body: "An app is not just the build. It is two store listings, two review processes, device testing, and an update cadence forever. Below a few hundred active people, that overhead is larger than anything the app can return, however good the idea is.",
    better: "Solve it with a mobile friendly web page, a spreadsheet, or a group chat, and revisit when the numbers grow. Nobody has ever regretted starting on the web.",
    revisit: "You are past roughly five hundred people who would use it more than once a month, or a single customer is valuable enough that convenience alone pays for it."
  },
  "ap.no-native-need": {
    name: "Nothing here needs to be an app",
    body: "The things only an app can do are push notifications, working offline, the camera, location in the background, biometrics, and a home screen icon people tap out of habit. If none of those appear in what you described, a website does the same job and reaches everyone immediately.",
    better: "Build a fast, genuinely mobile first web experience. It costs less, ships sooner, needs no install, and you can send people straight to it from a link.",
    revisit: "You find yourself needing to reach people when the app is closed, work without signal, or scan something at a counter or door."
  },
  "ap.platform-already-has-one": {
    name: "The platform you already pay for ships an app",
    body: "If your bookings, rota, or jobs already live in a system that has a mobile app, building your own means maintaining a second source of truth and syncing between them. That is a harder engineering problem than the app itself, and it is the usual reason these projects stall.",
    better: "Turn on the app you already pay for and brand it as far as the vendor allows. Only build your own once you have hit a specific wall you can name.",
    revisit: "The vendor app is genuinely blocking something specific, or you are moving off that platform anyway."
  }
};

/* ---------- worked examples, with hand written verdicts ---------- */

var PERSONAS = {
  roastery: {
    label: "Coffee roastery", industry: "qsr", website: "https://rosecityroasters.example",
    description: "I run a small coffee roastery and cafe in Portland. We have a lot of regulars, and most of them order the same drink every morning. We are on DoorDash but the fees are brutal. We also sell beans by subscription to about 400 people.",
    understanding: { restated: "A neighbourhood coffee roastery and café with a daily regular base, an unprofitable third party delivery channel, and a 400 person bean subscription running alongside it.", facets: [["Return cadence", "Daily"], ["Revenue", "Transactional and subscription"], ["Serves", "Repeat customers"], ["Input", "Clear"]] },
    verdict: { position: 5, tone: "good", short: "Three use cases fit. One pays for the build on its own.", lead: "The same person comes back every day. That is the whole case, and most businesses do not have it.", headline: "Yes. Three use cases fit, and one of them pays for the build on its own.", reasoning: "You have the thing that makes a mobile app work and that most businesses do not have, which is the same person returning daily. That turns loyalty from a gimmick into a habit loop, and it gives you a route off DoorDash without losing the customers you acquired there." },
    recs: [
      { id: "uc.digital-loyalty", rank: 1, fit: "core", signals: ["we have regulars", "customers order the same thing every time"], why: "Your regulars already behave like members, you just have no way to recognise them. Loyalty is also the lever that moves a DoorDash customer onto your own channel, because the reward only exists in your app." },
      { id: "uc.order-ahead", rank: 2, fit: "core", signals: ["DoorDash fees are brutal", "people queue at the counter"], why: "The morning rush is where you lose both throughput and margin. Order ahead turns your counter into pickup only at peak, and every order that moves off the aggregator keeps its full margin." },
      { id: "uc.subscription-manage", rank: 3, fit: "strong", signals: ["we sell beans by subscription"], why: "400 subscribers is enough that support email is already a cost. Letting people skip a week instead of emailing you to cancel is usually the cheapest churn reduction available." }
    ],
    appName: "Rose City Roasters",
    concept: "A loyalty app your regulars actually open."
  },
  hvac: {
    label: "HVAC contractor", industry: "trades", website: "https://example-hvac.example",
    description: "We are an HVAC company with 6 technicians doing installs and service calls around the metro. The techs still use paper job sheets and there is no signal in half the basements they work in. Everything gets typed up again back at the office and invoices go out days later.",
    understanding: { restated: "A six technician HVAC install and service business, running paper job sheets in the field, re entering everything at the office, and invoicing several days after the work is done.", facets: [["Return cadence", "Daily"], ["Revenue", "Transactional and service"], ["Serves", "Field workers"], ["Input", "Clear"]] },
    verdict: { position: 4, tone: "good", short: "The case here is cost, not customer acquisition.", lead: "Six technicians doing double entry is a daily cost you can measure, and every invoice sitting in a van is working capital.", headline: "Yes, and the case here is cost, not customer acquisition.", reasoning: "Your app has an internal user, not a consumer one. Six technicians doing double entry is a measurable daily cost, and the days between finishing a job and sending the invoice is working capital sitting in a van. Both of those are what a mobile app is genuinely good at removing." },
    recs: [
      { id: "uc.offline-field-capture", rank: 1, fit: "core", signals: ["our techs still use paper", "no signal in basements", "double entry back at the office"], why: "This is the whole job. Your constraint is connectivity, which is exactly what rules out a web based form and makes a real app the right tool rather than a nice to have." },
      { id: "uc.quote-to-invoice", rank: 2, fit: "strong", signals: ["invoices go out days later"], why: "Once the job record already exists on the device, invoicing from the driveway is a small addition with a direct cash flow effect. Build it second, on top of the capture work." }
    ],
    appName: "Field Ops",
    concept: "A job app for your crew that works with no signal."
  },
  photographer: {
    label: "Wedding photographer", industry: "creator", website: "",
    description: "I am a wedding photographer working on my own. I shoot around 20 weddings a year, mostly between May and September. Couples find me through Instagram and referrals, I shoot their wedding, deliver a gallery, and that is usually the end of it.",
    understanding: { restated: "A solo wedding photographer shooting roughly 20 events a year, concentrated in a five month season, with a client relationship that completes at gallery delivery.", facets: [["Return cadence", "Once"], ["Revenue", "Project fees"], ["Serves", "One time clients"], ["Input", "Clear"]] },
    verdict: { position: 1, tone: "critical", short: "An app would cost you real money and give your clients nothing they need.", lead: "A mobile app earns its keep when the same person opens it repeatedly. Your clients hire you once, in a season, and are done.", headline: "Not right now. An app would cost you real money and give your clients nothing they need.", reasoning: "This is not a judgement about your business, it is a judgement about the shape of the relationship. A mobile app earns its keep when the same person opens it repeatedly. Your clients hire you once, in a season, and are done. Two things in the library rule this out, and both would have to change first." },
    antipatterns: ["ap.one-time-transaction", "ap.seasonal-only"],
    recs: [], appName: "",
    concept: "A mobile gallery link and an email sequence. No install.",
    deadScreen: { app: "Your app", nav: "Nothing to open", hero: { label: "Last opened", value: "Never", sub: "The gallery link did the job without an install" }, rowsTitle: "What it would hold", rows: [{ title: "One gallery, delivered once", meta: "email", tone: "dead" }, { title: "No balance to build", meta: "—", tone: "dead" }, { title: "Ten quiet months a year", meta: "—", tone: "dead" }], cta: "Use a shared gallery link instead", tabs: ["Home", "Gallery", "Me"], tab: 0, dead: true }
  }
};

var PROMISES = [
  "A straight yes or no, with the reasoning",
  "The two or three things your app should actually do",
  "A prompt that builds the first one tonight"
];

var SERVICE_NOTES = {
  "EAS Build": "Required. Push and payments use native code, so create a development build early.",
  "Push credentials": "Run eas credentials and let EAS manage APNs and FCM.",
  "EAS Hosting": "Host the server side as Expo Router API routes and deploy with eas deploy.",
  "EAS Update": "Ship JavaScript fixes without an app store review.",
  "EAS Submit": "For App Store and Play Store submission when phase one is ready.",
  "EAS Workflows": "Add continuous integration under .eas/workflows for a multi phase build."
};
