# Authenticated Route Validation Matrix

Date: 2026-06-17

Authenticated session established: YES

Protected routes identified from `FrontendReact/src/App.jsx`: 19

Final authenticated route pass: 19/19

Console errors: 0

Blank screens: 0

Visible NaN: 0

Visible undefined: 0

Horizontal overflow at default viewport: 0

## Matrix

| Route | Component/Page | Authenticated Render | Loading/Unavailable State | Console Errors | NaN | Undefined | Blank | Navigation | Responsive | Classification |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| `/` | CommandCenter | Rendered | Explicit unavailable/blocked states | 0 | 0 | 0 | 0 | PASS | PASS | PASS |
| `/command-center` | CommandCenter | Rendered | Explicit unavailable/blocked states | 0 | 0 | 0 | 0 | PASS | PASS | PASS |
| `/system-boot` | SystemBoot | Rendered | Unavailable diagnostics visible | 0 | 0 | 0 | 0 | PASS | PASS | PASS |
| `/global-scan` | GlobalScan | Rendered | Unavailable/blocked scan rows visible | 0 | 0 | 0 | 0 | PASS | PASS | PASS |
| `/data-streams` | DataStreams | Rendered | REST/polling/snapshot limitation visible | 0 | 0 | 0 | 0 | PASS | PASS | PASS |
| `/newsletter` | Newsletter / Operator Briefing | Rendered | Internal briefing limitations visible | 0 | 0 | 0 | 0 | PASS | PASS | PASS |
| `/market-pulse` | MarketPulse | Rendered | Data unavailable states visible | 0 | 0 | 0 | 0 | PASS | PASS | PASS |
| `/tactical-brain` | TacticalBrain | Rendered | Unavailable state visible | 0 | 0 | 0 | 0 | PASS | PASS | PASS |
| `/behavioral-brain` | BehavioralBrain | Rendered | Behavioral limitations visible | 0 | 0 | 0 | 0 | PASS | PASS | PASS |
| `/failsafe-brain` | FailsafeBrain | Rendered | Blocking state visible | 0 | 0 | 0 | 0 | PASS | PASS | PASS |
| `/watchlists` | Watchlists | Rendered | Data unavailable states visible | 0 | 0 | 0 | 0 | PASS | PASS | PASS |
| `/alerts` | Alerts | Rendered | Alert surface visible | 0 | 0 | 0 | 0 | PASS | PASS | PASS |
| `/signals` | Signals | Rendered | Unavailable/blocked states visible | 0 | 0 | 0 | 0 | PASS | PASS | PASS |
| `/replay-center` | ReplayCenter | Rendered | Persistence unavailable and insufficient evidence visible | 0 | 0 | 0 | 0 | PASS | PASS | PARTIAL |
| `/trading-journal` | TradingJournal | Rendered | Persistence unavailable visible | 0 | 0 | 0 | 0 | PASS | PASS | PARTIAL |
| `/archives` | Archives | Rendered | Unavailable states visible | 0 | 0 | 0 | 0 | PASS | PASS | PASS |
| `/profiles` | Profiles | Rendered | Operator profile surface visible | 0 | 0 | 0 | 0 | PASS | PASS | PASS |
| `/subscriptions` | Subscriptions | Rendered | Closed beta access surface visible | 0 | 0 | 0 | 0 | PASS | PASS | PASS |
| `/settings` | SystemSettings | Rendered | Display-only settings visible | 0 | 0 | 0 | 0 | PASS | PASS | PASS |

## Route Notes

- `/system-settings` is not implemented in current `App.jsx`; `/settings` is the current System Settings route.
- `/newsletter` is the current Operator Briefing route.
- No route advertised News Intelligence as operational.
- No route advertised Mission Planning as implemented.

