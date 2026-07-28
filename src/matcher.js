/* ============================================================
   Local matcher.

   The production version sends the description to claude-opus-5 with
   an enum-constrained schema. This is a deterministic stand in that
   runs in the browser: it scores every use case against the industry
   and the words in the description, works out how often the same
   person comes back, and applies the anti patterns.

   It is genuinely input driven, so the page can be tested with real
   answers. It is not as good as the model at reading intent, and it
   cannot fetch the website (a static page has no way around CORS).
   ============================================================ */

var APP_NAME = {
  qsr: "Cafe", retail: "Shop", trades: "FieldOps", fitness: "Studio",
  nonprofit: "Give", faith: "Parish", b2b: "ClientPortal", health: "Practice",
  creator: "Studio", events: "Events", other: "MyApp"
};

// How often the same person comes back. This is the single strongest
// predictor of whether an app is justified at all.
// Checked in order, most specific first: "once a year" has to reach the
// rare tier before the bare "once" in the last one catches it.
var CADENCE = [
  { key: "daily", score: 5, label: "Daily", phrases: ["every day", "every morning", "each day", "daily", "every shift", "each shift", "every weekday", "twice a day"] },
  { key: "weekly", score: 4, label: "Weekly", phrases: ["every week", "each week", "weekly", "twice a week", "few times a week", "most weeks", "every weekend", "most weekends", "each weekend", "every sunday", "each sunday", "every saturday", "every monday"] },
  { key: "rare", score: 1.8, label: "Once or twice a year", phrases: ["every six months", "every 6 months", "twice a year", "once a year", "annually", "annual", "every year", "once every", "every couple of years", "every few years"] },
  { key: "monthly", score: 3, label: "Monthly", phrases: ["every month", "monthly", "each month", "once a month", "every few weeks", "quarterly", "fortnightly"] },
  { key: "seasonal", score: 2, label: "Seasonal", phrases: ["season", "seasonal", "summer only", "few months a year", "busy period", "peak season", "christmas", "wedding season", "four times a year", "a few times a year"] },
  { key: "once", score: 1, label: "Once", phrases: ["once", "one off", "one-off", "one time", "single purchase", "never come back", "end of it", "never see them again", "do not return", "then they are done"] }
];

var PLATFORMS = ["mindbody", "servicetitan", "shopify", "square", "jobber", "eventbrite", "wordpress", "squarespace", "quickbooks", "xero", "salesforce", "hubspot", "calendly", "acuity", "toast", "clover", "housecall", "simpro", "tithely", "planning center", "churchsuite", "donorbox", "classpass", "deputy"];

// The things only an app can do. If none of these appear anywhere in
// what someone wrote, a website is the honest answer.
var NATIVE_HINTS = ["push", "notification", "notify", "remind", "offline", "no signal", "no service", "camera", "photo", "scan", "barcode", "qr", "location", "gps", "geofence", "door", "check in", "checkin", "tap to pay", "card reader", "face id", "fingerprint", "home screen", "on their phone", "on the phone", "wearable", "apple watch"];

function normalise(s) {
  return " " + String(s || "").toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim() + " ";
}

function detectCadence(text, industry) {
  for (var i = 0; i < CADENCE.length; i++) {
    for (var j = 0; j < CADENCE[i].phrases.length; j++) {
      if (text.indexOf(" " + CADENCE[i].phrases[j]) !== -1 || text.indexOf(CADENCE[i].phrases[j] + " ") !== -1) {
        return CADENCE[i];
      }
    }
  }
  // Nothing stated. Fall back to what the industry usually looks like,
  // and mark it inferred so the verdict can hedge honestly.
  var byIndustry = {
    qsr: "weekly", retail: "monthly", trades: "daily", fitness: "weekly",
    nonprofit: "monthly", faith: "weekly", b2b: "daily", health: "monthly",
    creator: "monthly", events: "seasonal", other: "monthly"
  };
  var guess = byIndustry[industry] || "monthly";
  for (var k = 0; k < CADENCE.length; k++) {
    if (CADENCE[k].key === guess) {
      return { key: CADENCE[k].key, score: CADENCE[k].score, label: CADENCE[k].label + " (assumed)", inferred: true };
    }
  }
  return { key: "monthly", score: 3, label: "Unclear", inferred: true };
}

// Look for an audience size small enough that two app stores cannot pay off.
function detectAudience(text) {
  var m = text.match(/(\d[\d,]*)\s*(?:\+\s*)?(customers|clients|members|patients|people|subscribers|donors|regulars|users|families|households|staff|employees|technicians|volunteers|attendees)/);
  if (!m) return null;
  var n = parseInt(m[1].replace(/,/g, ""), 10);
  if (isNaN(n)) return null;
  return { count: n, noun: m[2] };
}

function countHits(text, list) {
  var hits = [];
  for (var i = 0; i < list.length; i++) {
    var needle = list[i];
    if (text.indexOf(needle) !== -1 && hits.indexOf(needle) === -1) hits.push(needle);
  }
  return hits;
}

function scoreUseCase(uc, text, industry) {
  var m = uc.match || {};
  var industryHit = (m.industries || []).indexOf(industry) !== -1;
  var phraseHits = countHits(text, m.phrases || []);
  var keywordHits = countHits(text, m.keywords || []);

  var score = 0;
  if (industryHit) score += 6;
  score += phraseHits.length * 4;
  score += keywordHits.length * 1.5;

  return { score: score, industryHit: industryHit, phrases: phraseHits, keywords: keywordHits };
}

function titleFirst(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// Pull the real rows from the research table for a picker industry. Claims are
// ordered so the best sourced ones lead, which is what the table's own weight
// guidance asks for.
var CONF_RANK = { strong: 0, directional: 1, vendor: 2 };
function researchFor(industry) {
  if (typeof RESEARCH === "undefined") return null;
  var ind = INDUSTRIES.filter(function (i) { return i.key === industry; })[0];
  var wanted = (ind && ind.notionRows) || [];
  var rows = RESEARCH.industries.filter(function (r) { return wanted.indexOf(r.industry) !== -1; });
  if (!rows.length) return null;
  var claims = [];
  rows.forEach(function (r) {
    r.claims.forEach(function (c) {
      if (!claims.some(function (x) { return x.claim === c.claim; })) claims.push(c);
    });
  });
  claims.sort(function (a, b) { return CONF_RANK[a.confidence] - CONF_RANK[b.confidence]; });
  return {
    rows: rows.map(function (r) {
      return { industry: r.industry, roi: r.roi, why: r.why, considerations: r.considerations, gap: r.gap };
    }),
    claims: claims,
    syncedAt: RESEARCH.source.syncedAt,
    sourceUrl: RESEARCH.source.url,
    database: RESEARCH.source.database
  };
}

function assess(input) {
  var industry = input.industry || "other";
  var text = normalise(input.description);
  var ind = INDUSTRIES.filter(function (i) { return i.key === industry; })[0]
    || INDUSTRIES[INDUSTRIES.length - 1];

  var cadence = detectCadence(text, industry);
  var audience = detectAudience(text);
  var nativeHits = countHits(text, NATIVE_HINTS);
  var platformHits = countHits(text, PLATFORMS);

  /* ---- score and rank ---- */

  var scored = Object.keys(LIBRARY).map(function (id) {
    var r = scoreUseCase(LIBRARY[id], text, industry);
    r.id = id;
    return r;
  }).sort(function (a, b) { return b.score - a.score; });

  // An industry match alone is not evidence — every use case tagged to that
  // industry would score the same, which is how an accountancy practice ends
  // up being told to build offline job capture. Require something the
  // visitor actually wrote.
  var earned = scored.filter(function (r) {
    return r.phrases.length > 0 || r.keywords.length > 0;
  });
  var best = earned[0] || { score: 0 };
  // Absolute floor rather than a share of the leader: one dominant match
  // should not crowd out a runner up that the visitor clearly described.
  // 10 is industry plus one real phrase, which is the bar for a strong fit.
  var keep = earned.filter(function (r) { return r.score >= 10; }).slice(0, 3);
  // Thin input still deserves an answer, so allow the single best weak match.
  if (!keep.length && best.score >= 7.5) keep = [best];

  /* ---- verdict position ---- */

  var position = cadence.score;
  if (best.score >= 18) position += 1;
  else if (best.score >= 12) position += 0.5;
  if (!keep.length) position -= 1.5;
  if (nativeHits.length === 0) position -= 0.5;

  var aps = [];
  if (audience && audience.count < 150) {
    position = Math.min(position, 2);
    aps.push("ap.tiny-audience");
  }
  if (cadence.key === "once") {
    position = Math.min(position, 1.6);
    if (aps.indexOf("ap.one-time-transaction") === -1) aps.push("ap.one-time-transaction");
  }
  if (cadence.key === "seasonal") {
    position = Math.min(position, 2.4);
    aps.push("ap.seasonal-only");
  }
  if (!keep.length && nativeHits.length === 0) {
    position = Math.min(position, 2);
    if (aps.indexOf("ap.no-native-need") === -1) aps.push("ap.no-native-need");
  }
  if (platformHits.length && position > 2) {
    // Not a no on its own, but worth raising.
    aps.push("ap.platform-already-has-one");
  }

  position = Math.max(1, Math.min(5, Math.round(position)));
  var hasPhases = position >= 3 && keep.length > 0;

  // Below the line there are no phases, so make sure there is at least
  // one honest reason why, and drop reasons that only apply to a yes.
  if (!hasPhases) {
    aps = aps.filter(function (a) { return a !== "ap.platform-already-has-one"; });
    if (!aps.length) aps.push(nativeHits.length ? "ap.tiny-audience" : "ap.no-native-need");
  } else {
    aps = aps.filter(function (a) { return a === "ap.platform-already-has-one"; });
  }

  var recs = hasPhases ? keep.slice(0, position === 3 ? 1 : 3) : [];
  var tone = position >= 4 ? "good" : position === 3 ? "caution" : "critical";

  /* ---- prose ---- */

  var top = recs.length ? LIBRARY[recs[0].id] : null;
  var cadenceWord = { daily: "every day", weekly: "every week", monthly: "every month", seasonal: "for a few months a year", once: "once" }[cadence.key];

  var restated = "A " + (ind.noun || "business") +
    (audience ? ", serving around " + audience.count.toLocaleString() + " " + audience.noun : "") +
    ", where the same person comes back " + cadenceWord +
    (cadence.inferred ? " as far as we can tell from what you wrote" : "") + ".";

  var facets = [
    ["Return cadence", cadence.label],
    ["Industry", ind.short],
    ["Native need", nativeHits.length ? titleFirst(nativeHits[0]) : "None stated"],
    ["Input", text.trim().length < 120 ? "Thin" : "Clear"]
  ];
  if (audience) facets.splice(1, 0, ["Audience", audience.count.toLocaleString()]);

  var short, lead, headline, reasoning, concept;

  if (position >= 4) {
    short = titleFirst(top.shortName.toLowerCase()) + " is the one to build first.";
    lead = "The same person comes back " + cadenceWord + ", which is the whole case and most businesses do not have it.";
    headline = "Yes. " + titleFirst(top.shortName.toLowerCase()) + " is the use case that earns the install.";
    reasoning = "You described a relationship where the same person returns " + cadenceWord +
      ", and that is what gives an app somewhere to accrue value. " +
      (nativeHits.length ? "You also mentioned " + nativeHits.slice(0, 2).join(" and ") + ", which is the part a website genuinely cannot do. " : "") +
      "We matched " + recs.length + " use case" + (recs.length === 1 ? "" : "s") +
      " against what you wrote, ranked by how much of it they explain.";
    concept = titleFirst(top.oneLiner.split(".")[0].toLowerCase()) + ".";
  } else if (position === 3) {
    short = "Start with one thing and see if people open it.";
    lead = "There is a real use case here, but not enough yet to justify a full build. Ship the smallest version and let usage decide.";
    headline = "Maybe. Build one thing, not an app.";
    reasoning = "What you described points at " + top.shortName.toLowerCase() +
      ", but the return cadence is " + cadence.label.toLowerCase() +
      ", which is on the edge of what makes an install worth keeping. " +
      "The honest move is to ship that single use case, measure whether people come back to it, and only then decide whether there is an app here.";
    concept = titleFirst(top.oneLiner.split(".")[0].toLowerCase()) + ", and nothing else yet.";
  } else {
    short = aps.indexOf("ap.tiny-audience") !== -1
      ? "There are not enough people here to carry two app stores."
      : "Nothing you described needs to be an app.";
    lead = "This is a judgement about the shape of the relationship, not about the business.";
    headline = position === 1
      ? "No. An app would cost you real money and give people nothing they need."
      : "Not yet. The shape of this does not support an install.";
    reasoning = "An app earns its keep when the same person opens it repeatedly, and " +
      (cadence.key === "once" ? "you described a relationship that ends after one transaction. "
        : cadence.key === "seasonal" ? "you described demand that concentrates into part of the year. "
        : "what you wrote does not show that pattern yet. ") +
      (audience && audience.count < 150 ? "At around " + audience.count + " " + audience.noun + ", the store listings, review cycles, and device testing cost more than the app can return. " : "") +
      (nativeHits.length === 0 ? "Nothing you mentioned needs push, offline, the camera, or a scan at a door, which is the short list of things only an app can do. " : "") +
      "That can change, and the panels below say what would have to.";
    concept = "A fast mobile web experience, and no install.";
  }

  /* ---- assemble, in the shape the view already renders ---- */

  var appLabel = ind.appLabel;
  var out = {
    live: true,
    label: ind.label,
    industry: industry,
    website: input.website || "",
    understanding: { restated: restated, facets: facets },
    verdict: { position: position, tone: tone, short: short, lead: lead, headline: headline, reasoning: reasoning },
    recs: recs.map(function (r, i) {
      var uc = LIBRARY[r.id];
      var sigs = r.phrases.slice(0, 3);
      if (!sigs.length && r.industryHit) sigs = [ind.noun || ind.label.toLowerCase()];
      return {
        id: r.id, rank: i + 1,
        fit: r.score >= 18 ? "core" : r.score >= 11 ? "strong" : "worth-considering",
        signals: sigs,
        why: (r.phrases.length
          ? "You mentioned " + r.phrases.slice(0, 2).map(function (p) { return "“" + p + "”"; }).join(" and ") + ", which is exactly what this addresses. "
          : "This is the strongest fit for a " + (ind.noun || "business") + " in the library. ") +
          uc.effortNote
      };
    }),
    antipatterns: aps,
    appName: APP_NAME[industry] || "MyApp",
    concept: concept,
    // Give the phone mocks a label that belongs to the visitor's world
    // rather than the coffee roastery the screens were written for.
    screenApp: appLabel,
    deadScreen: {
      app: appLabel, nav: "Nothing to open",
      hero: { label: "Last opened", value: "Never", sub: "A web page did the job without an install" },
      rowsTitle: "Why it stays closed",
      rows: [
        { title: "No reason to return " + cadenceWord, meta: "—", tone: "dead" },
        { title: "No balance to build", meta: "—", tone: "dead" },
        { title: audience ? "Only " + audience.count + " " + audience.noun : "Nothing needing push or offline", meta: "—", tone: "dead" }
      ],
      cta: "Use a mobile web page instead",
      tabs: ["Home", "About", "Me"], tab: 0, dead: true
    }
  };
  return out;
}
