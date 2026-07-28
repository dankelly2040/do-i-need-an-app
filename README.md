# Do I need a mobile app?

Interactive prototype of the "Do I need a mobile app?" tool for expo.dev.

**Live:** https://do-i-need-an-app.expo.app
**Dashboard:** https://expo.dev/accounts/dannymanning/projects/do-i-need-an-app

## What this is

A **static prototype for demos.** There is no model behind it and no server. Three
worked examples are hardcoded, and submitting replays a scripted response on a
timer that mirrors the real streaming sequence, including the pause while the
model would be thinking.

The three examples deliberately cover different outcomes:

| Preset | Verdict | What it demonstrates |
| --- | --- | --- |
| Coffee roastery | Strong yes | Three ranked use cases, evidence table, generated Expo prompt |
| HVAC contractor | Yes | A cost-to-serve case, plus the failed-website-fetch fallback |
| Wedding photographer | Probably not | The honest no: anti-patterns, an alternative, and what would change the answer |

Typing your own description falls back to the roastery response. That is a
limitation of the prototype, not a bug to fix here.

## What is real

- The design tokens are Expo's own, read off expo.dev: Radix `slate` neutrals,
  the `--expo-theme-*` semantic triplets for the verdict tones, the Inter and
  JetBrains Mono stacks, pill buttons with a black primary, 24px card radii.
- The generated starting prompt is assembled from the use case data the same way
  the real build should do it: union the capabilities across the matched use
  cases, derive the EAS service list, fill a template. Switch presets and the
  service chips and phase list change. Every command in it is verbatim correct.

## What is fabricated

The statistics. They are rewritten from the Notion research rather than quoted,
so **do not screenshot the evidence table as fact.** The page carries
`noindex, nofollow` for this reason.

## Layout

```
src/page.html     the prototype, authored as an artifact fragment
build.mjs         wraps it into a standalone document in dist/
dist/index.html   generated, gitignored
app.json          EAS project link
```

`src/page.html` is the single source. It is also published as a Claude artifact,
so editing it here and rebuilding keeps the two in sync.

## Commands

```bash
node build.mjs                 # build dist/index.html
npx eas-cli deploy             # preview URL
npx eas-cli deploy --prod      # promote to do-i-need-an-app.expo.app
```

Or `npm run deploy`, which does both steps.

## How this relates to the real build

This prototype is not step one of the production version. That one is an Expo
Router app with `web.output: "server"`, an `/api/assess+api.ts` route calling
`claude-opus-5` with enum-constrained structured output, and a use case library
synced from a curated research database.

The grounding design is the interesting part and is worth restating: the model
never emits a use case name, an example app, or a statistic. Its output schema
constrains every identifier to an `enum` generated from the library, so
recommending something that does not exist is not improbable, it is
unrepresentable. Names, apps, and evidence are looked up server-side and merged
into the card. The "because you said" chips are the same mechanism pointed the
other way: the model must cite which library-declared signal it matched.

When that starts, this repo gets replaced rather than extended. Its job is to
settle the interaction design and the copy before any of that is written, and it
has done that.

One thing worth carrying over: per the plan, EAS Hosting API routes run on
Cloudflare Workers, not Node. No `fs`, `crypto.subtle` for hashing, and
rate-limit and cache state needs an HTTP-reachable store.

## License

MIT. See [LICENSE](LICENSE).
