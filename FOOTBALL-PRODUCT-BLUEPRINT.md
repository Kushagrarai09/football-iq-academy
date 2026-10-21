# Football Interactive Learning Website — Product Blueprint & Development Research

## Product vision
Build a multi-page, interactive, responsive football learning website that teaches association-football rules, player positions, formations, tactics, techniques and match situations through visual explanations. The website should be publicly deployed for general use. **This blueprint intentionally excludes a learning-progression or level-based curriculum.**

## Product principles
- Learn through interaction instead of text alone.
- Keep official Laws of the Game separate from tactical principles and coaching advice.
- Use a shared knowledge base across rules pages, diagrams, scenarios and quizzes.
- Make accuracy, accessibility, responsive design and public deployment first-class requirements.
- Prefer a two-dimensional top-down SVG pitch for the first version; defer full 3D and full-match simulation.

## Official sources
- IFAB official documents: https://www.theifab.com/documents/
- IFAB Laws of the Game: https://www.theifab.com/laws/
- FIFA Football for Schools: https://footballforschools.fifa.com/en/index.php
- Next.js docs: https://nextjs.org/docs
- Vercel docs: https://vercel.com/docs
- Playwright docs: https://playwright.dev/docs/intro

IFAB is the primary authority for the laws. Always verify the applicable edition and competition rules. Treat this project's summaries as educational outlines until every rule and scenario is reviewed against the official source.

## Separate knowledge categories
1. Official laws: offside, fouls, handball, restarts, match duration, equipment, officials.
2. Tactical principles: pressing, counterattacking, positional play, defensive compactness, passing lanes.
3. Coaching advice: passing, shooting, first touch, overlapping, defending wingers.

## Recommended sitemap
| Page | Route | Purpose |
|---|---|---|
| Home | `/` | Introduce key features and navigation |
| Basics | `/basics` | Objective, teams, match structure and restarts |
| Interactive Pitch | `/pitch` | Explore pitch, players and positions |
| Rules index | `/rules` | Browse all 17 Laws |
| Individual rule | `/rules/[slug]` | Summary, conditions, exceptions, scenarios and official references |
| Positions | `/positions` | Goalkeeper, defenders, midfielders, forwards |
| Formations | `/formations` | Compare typical shapes and trade-offs |
| Tactics | `/tactics` | Attacking, defending, pressing and transitions |
| Skills | `/skills` | Passing, receiving, dribbling, shooting and more |
| Scenarios | `/scenarios` | User decisions and answer explanations |
| Referee lab | `/referee` | Practice rule decisions and restarts |
| Glossary | `/glossary` | Search football terminology |
| Quiz | `/quiz` | Interactive questions with explanations |
| About and sources | `/about` | Editorial principles, sources and disclaimer |

## Homepage concept
Headline: **Understand Football. See the Game Differently.**
Supporting text: Explore the rules, positions and tactics of football through interactive pitches, tactical diagrams and realistic match situations.
Primary CTA: Explore the Pitch. Secondary CTA: Browse the Rules.
Sections: hero with pitch preview; topic cards; clickable player preview; a “make the decision” scenario; formation comparison; rule/term links; footer with sources, disclaimer and project information.

## Interactive pitch requirements
- Mark touchlines, goal lines, halfway line, centre mark/circle, penalty areas, goal areas, penalty marks/arcs, corner arcs and goals.
- Preserve relative geometry when responsive.
- Represent players with jersey number, team identity, optional role labels, focus state and movement indicators.
- Support player selection, formation changes, movement, ball repositioning, arrows, labels, reset and explanation panels.
- Support touch and keyboard alternatives to drag-only interactions.
- Make clear that the starter sandbox does not adjudicate every Laws of the Game scenario.

## Rules curriculum: all 17 Laws
1. The Field of Play
2. The Ball
3. The Players
4. The Players' Equipment
5. The Referee
6. The Other Match Officials
7. The Duration of the Match
8. The Start and Restart of Play
9. The Ball In and Out of Play
10. Determining the Outcome of a Match
11. Offside
12. Fouls and Misconduct
13. Free Kicks
14. The Penalty Kick
15. The Throw-in
16. The Goal Kick
17. The Corner Kick

Each rule page should include a concise overview, detailed conditions, exceptions, visual demonstration, examples, interactive challenge, explanation, related concepts, official source and law edition. Do not publish definitive scenario outcomes until reviewed against the relevant IFAB law.

## Offside simulator research requirements
A simple attacker-versus-defender coordinate comparison is insufficient. Record player positions at the instant a teammate plays or touches the ball; the ball position; the relevant opponents; subsequent involvement in active play; applicable exceptions; and whether a rebound, deliberate save or deliberate play by an opponent affects the decision. Start with curated, verified scenarios. If information is insufficient, say so rather than fabricating certainty.

## Positions and formations
Roles: goalkeeper; centre-back; full-back; wing-back; defensive, central and attacking midfielder; wide midfielder/winger; striker; second striker. Cover responsibilities in possession and out of possession, common movements, useful skills, tactical variations and related formations. These are tactical conventions, not positions mandated by the Laws.

Formations to cover: 4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 3-4-3 and 4-1-4-1. Explain defensive coverage, midfield distribution, attacking width and forward support as trade-offs, not universal guarantees.

## Tactics and strategy topics
Attacking: build-up, possession, width, depth, support, mobility, penetration, through balls, overlaps, underlaps, numerical advantages, crossing, finishing, attacking transitions.
Defending: high press, mid-block, low block, man-marking, zonal marking, pressure, cover, balance, compactness, interception, defensive transitions and recovery.
Use interactive decision comparisons; explain risks and benefits rather than claiming a single option is always correct.

## Skills and techniques
Passing, receiving/first touch, dribbling, shooting, heading (age-appropriate safety guidance), tackling, interception, crossing, shielding and goalkeeping. Distinguish technique from an offence: an inaccurate pass or missed shot is not automatically a foul.

## Referee decision trainer
Present a situation and separately explain (a) what happened, (b) which law applies, (c) the restart, and (d) disciplinary action if applicable. Restarts and cards are not mutually exclusive outcomes. Include offside, handball, penalty incidents, free kicks, throw-ins, goalkeeper handling, advantage, cards, boundaries and goal decisions. State that the tool is educational and does not replace a match official.

## Glossary and quiz
Glossary fields: term, plain-language meaning, detailed explanation, example, category, related concepts and related laws where relevant. Include offside, handball, advantage, direct/indirect free kick, penalty, added time, extra time, through ball, cross, counterattack, overlap, underlap, build-up, first touch, pressing, high line, low block, marking, clean sheet, hat-trick, volley and others. Quizzes should include multiple choice, “judge the situation”, find-the-problem, choose-an-option, formation arrangement and matching terms. Explain every answer.

## Visual design and accessibility
Dark tactical style with deep green/charcoal backgrounds, clear pitch markings, contrasting team markers, readable typography and purposeful animation. Responsive desktop and mobile layouts. Include keyboard navigation, screen-reader labels, text alternatives for diagrams, visible focus, adequate contrast, reduced-motion support and controls that do not require dragging. Do not communicate meaning through colour alone.

## Technical architecture
- Next.js App Router, React and TypeScript.
- Tailwind CSS for responsive styling.
- SVG for pitch geometry, player markers, arrows and animations.
- Use local TS/JSON content initially; no backend required for basic rules, formations, scenarios, glossary and quiz.
- Add Supabase/PostgreSQL only if saved user data, accounts, community content or an admin editor are needed.
- Reuse content records across pages; do not duplicate rule logic in every component.

## Suggested shared data schemas
Rule record: ID, law number, title, summary, explanation, conditions, exceptions, restart, disciplinary action, examples, visual requirements, source, edition, review date and related concepts.
Position record: ID, name, aliases, starting area, responsibilities, in-possession role, out-of-possession role, skills, variations, formations and examples.
Formation record: ID, name, line counts, coordinates, roles, attacking/defensive shape, strengths, trade-offs and related concepts.
Scenario record: ID, objective, initial player positions, ball position, possession team, event sequence, question, options, answer, explanation, law source, alternate scenarios and difficulty.

## Testing requirements
- Unit: formation player counts, normalized coordinates, pitch geometry, glossary search, scenario scoring and curated offside examples.
- Component: player selection, formation update, reset, answer feedback, keyboard and touch interaction.
- E2E with Playwright: homepage, navigation, pitch interaction, formation switch, rule detail, scenario, quiz, glossary search, mobile viewport and error states.
- A passing build is not proof of browser correctness or legal accuracy.

## Public deployment
Use Vercel for the Next.js project. Push to GitHub, import the repository into Vercel, deploy with no environment variables for the static-content starter, and test public routes after deployment. Add descriptive metadata, sitemap, README, sources, disclaimer, mobile testing and accessibility checks.

## Content rights and maintenance
Write original explanations; verify licences for all third-party images, video and icons; avoid implying affiliation with IFAB/FIFA. Version each law record, cite its source and review date, track amendments, identify affected pages and scenarios, update content and retest expected decisions against the revised edition.

## Initial public version scope
Include: responsive homepage, multiple routes, basics, 17-law index, important rule detail pages, positions, formations, tactics, skills, glossary, source references, interactive pitch, formation switcher, simple player movement, scenario questions, referee examples and quizzes.
Defer: full 3D football, multiplayer, advanced 22-player AI, video analysis, complex physics, user accounts unless required.

## Acceptance checklist
- [ ] Every route loads directly and navigation works.
- [ ] All 17 laws are listed and sources are identified.
- [ ] Published law explanations and scenario outcomes have been reviewed.
- [ ] The pitch resizes correctly and its controls work on mobile/keyboard.
- [ ] Formation changes and reset work.
- [ ] Scenario and quiz answers include explanations.
- [ ] Glossary search works and handles no results.
- [ ] No inaccessible colour-only cues or mandatory drag-only tasks.
- [ ] Metadata, sitemap and README are present.
- [ ] Public deployment and browser interactions have been tested.
