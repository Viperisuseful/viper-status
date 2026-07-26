# Design System

## Direction

ViperCapture identity adapted to a public operational surface. Familiar status-page structure, strong typography, quiet surfaces, cobalt interaction color, and semantic service states.

Design dials:

- Design variance: 5
- Motion intensity: 3
- Visual density: 5

## Theme

System light and dark modes. One page-level theme at a time. No section-level inversion.

### Light

- Background: ViperCapture `#fbfcfd`
- Foreground: `#0a0e12`
- Surface: `#ffffff`
- Secondary surface: `#f0f4f8`
- Border: `#dadee5`
- Muted foreground: `#5d646c`
- Brand cobalt: `#3069f6`
- Brand-soft: `#e6efff`

### Dark

- Background: ViperCapture `#070a0f`
- Foreground: `#f2f4f6`
- Surface: `#10141a`
- Secondary surface: `#171c22`
- Border: `rgba(255, 255, 255, 0.11)`
- Muted foreground: `#959ca5`
- Brand cobalt: `#5c8fff`
- Brand-soft: `#162137`

### Semantic state

Use dedicated success, degraded, outage, maintenance, and unknown tokens. Each state pairs color with icon and text. Healthy green remains localized to status evidence, not page decoration.

## Typography

Use self-hosted Viper Sans, sourced from the existing ViperCapture font asset. UI labels, product names, uptime values, incident text, and navigation use one family.

- Page title: 40px desktop, 32px mobile, semibold, tracking no tighter than -0.03em
- Overall status: 28px desktop, 24px mobile, semibold
- Product name: 16px, semibold
- Body: 15px, regular, 1.55 line height
- Metadata: 13px, medium
- Numeric status data: tabular numerals

Body copy stays within 70 characters where practical. Headings use balanced wrapping.

## Shape

- Panels: 14px radius
- Buttons and compact controls: 10px radius
- Status chips: full pill only when compact state labeling requires it
- Borders: 1px
- Shadows: none by default

## Layout

- Maximum content width: 1040px
- Desktop gutters: 32px
- Tablet gutters: 24px
- Mobile gutters: 16px
- Header height: 68px
- Service list uses open rows within one section, not individual floating cards
- Incident history uses a chronological vertical flow
- Mobile collapses every service row into one column with status and uptime grouped below the product name

## Components

- Header with Viper mark, Viper Status wordmark, portfolio link, theme control
- Overall status panel
- Active incident or maintenance alert
- Service group
- Service row
- Recent-check rail
- 24-hour uptime value
- Incident history entry
- Data freshness line
- Loading skeleton
- Stale-data alert
- Unavailable-data state

Use shadcn primitives for Button, Badge, Alert, Skeleton, Separator, and Tooltip. Components must be themed beyond registry defaults.

## Motion

State transitions use 150-200ms opacity and color changes. Recent-check tooltips appear without decorative movement. No orchestrated page load. Respect reduced-motion preference.

## Content

Public components:

1. Portfolio
2. ViperCapture
3. ViperCapture API
4. Turtle Cave
5. QuickRunLab
6. QuickRunLab API

Use plain operational copy. Do not use em dashes, marketing slogans, version labels, fake percentages, or decorative metadata.

## Approved visual direction

The approved concept board is stored at
`docs/design/status-concept-board.png`, with desktop and mobile references at
`docs/design/status-desktop.png` and `docs/design/status-mobile.png`.

- Design dials: density 5, expression 3, motion 5
- One unified service register instead of independent metric cards
- Compact mobile status dots retain accessible text for assistive technology
- Healthy state uses the AA-safe light-theme green `#08683a`
- Real recent checks may begin with unknown segments when a monitor has less
  than 30 retained checks
