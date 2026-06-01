# Parent-Facing Analysis Model

FencingAI should answer questions parents naturally ask after a competition. The product should avoid exposing sensitive exact personal data when a grouped signal is enough.

## Already Available From Score Packages

- Age band, derived from birthday but shown only as half-year buckets such as `2018 上半年`.
- Rank movement from pool standing to final rank.
- Elimination performance: wins, losses, scored, received, and score difference.
- Champion path and opponent strength.
- Club concentration and conversion: entrants, medals, top 8, best rank.
- Competition density: pool qualification rate, real elimination bouts, Bye ratio.

## Needs Athlete Detail Data Later

- Left-handed or right-handed distribution.
- Height and weight bands.
- Weapon hand versus opponent outcome.
- Transfer history and club stability.
- Registered type, for example public member versus other categories.

## Recommended Parent Metrics

- Relative age advantage: older half-year versus younger half-year inside the same age group.
- Stability: pool rank and final rank gap.
- Late-stage resilience: elimination wins after a mediocre pool rank.
- Close-bout ability: one-point or two-point wins and losses.
- Opponent familiarity: repeated opponents and win-loss changes over time.
- Club peer group: same-club entrants and internal ranking.
- Growth trajectory: best rank, median rank, top 8 rate across multiple events.

## Privacy Rule

Do not show exact birth date by default. Use age bands for public analysis. Exact profile fields such as birthday, height, weight, and hand should require athlete-page context or guardian-controlled visibility.
