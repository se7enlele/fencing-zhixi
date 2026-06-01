# FencingAI Search And Filter Model

The home page should help users find competitions by the way fencing families and coaches think about events, not by raw data fields.

## Current Primary Filters

- Keyword: competition name, venue, region, item short name, original item name.
- Year: derived from competition date first, then competition name.
- Region: derived from venue.
- Item: compact item grouping such as `U8 花剑`.

## Likely Future Filters

- Age group: `U6`, `U8`, `U10`, `U12`, `U14`.
- Weapon: foil, epee, sabre.
- Gender: male, female.
- Competition month or season.
- Athlete name.
- Club name.
- Competition scale: small, medium, large.
- Competition status: upcoming, running, finished.
- Data completeness: ranking only, full score package, with bout details.

## Product Rule

Keep the home page light. Add a filter only when it changes the user's finding behavior. Advanced filters should collapse behind a secondary control once the data volume is large enough.
