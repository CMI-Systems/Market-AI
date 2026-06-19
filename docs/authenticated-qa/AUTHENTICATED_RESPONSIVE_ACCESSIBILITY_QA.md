# Authenticated Responsive and Accessibility QA

Date: 2026-06-17

## Tested Viewports

Authenticated protected interiors were tested at:

- Desktop: 1440 x 900
- Tablet: 768 x 1024
- Mobile: 390 x 844
- Narrow Mobile: 320 x 568

Routes tested across the viewport matrix: 14

Total authenticated viewport-route checks: 56

Passing viewport-route checks: 56

Horizontal overflow defects: 0

Blank screens: 0

Visible NaN: 0

Visible undefined: 0

## Protected Route Results

| Route | Desktop | Tablet | Mobile | Narrow Mobile | Classification |
| --- | --- | --- | --- | --- | --- |
| `/command-center` | PASS | PASS | PASS | PASS | PASS |
| `/tactical-brain` | PASS | PASS | PASS | PASS | PASS |
| `/behavioral-brain` | PASS | PASS | PASS | PASS | PASS |
| `/failsafe-brain` | PASS | PASS | PASS | PASS | PASS |
| `/trading-journal` | PASS | PASS | PASS | PASS | PASS |
| `/replay-center` | PASS | PASS | PASS | PASS | PASS |
| `/watchlists` | PASS | PASS | PASS | PASS | PASS |
| `/signals` | PASS | PASS | PASS | PASS | PASS |
| `/alerts` | PASS | PASS | PASS | PASS | PASS |
| `/market-pulse` | PASS | PASS | PASS | PASS | PASS |
| `/global-scan` | PASS | PASS | PASS | PASS | PASS |
| `/data-streams` | PASS | PASS | PASS | PASS | PASS |
| `/newsletter` | PASS | PASS | PASS | PASS | PASS |
| `/settings` | PASS | PASS | PASS | PASS | PASS |

## Chart Findings

Classification: PASS

Findings:

- Chart surfaces rendered or showed explicit unavailable states without causing page overflow.
- Chart controls remained present.
- No blank chart crash was observed.
- Unavailable provider/chart states remained visible.

## Form Findings

Classification: PASS

Findings:

- Watchlists add-symbol control was usable.
- Trading Journal form rendered on mobile and narrow mobile without page overflow.
- Replay controls rendered without page overflow.
- System Settings display-only controls/status sections remained readable.

## Dense-Data Findings

Classification: PASS

Findings:

- Watchlist rows fit without page-level horizontal overflow.
- Global Scan rows fit without page-level horizontal overflow.
- Alerts and Signals card/table regions remained readable enough for the authenticated gate.

## Accessibility Classification

Accessibility: CONDITIONALLY_READY

Validated:

- Page headings were present on protected interiors.
- Buttons were semantic controls.
- Critical status values were textual, not color-only.
- Disabled/no-persistence states were described in text.
- Login and protected route controls were keyboard-addressable through semantic elements.

Remaining accessibility limitations:

- Full screen-reader traversal was not performed.
- Chart textual alternatives remain surrounding-context based rather than complete chart data alternatives.
- Some dense operational cards require further semantic refinement before full accessibility certification.

