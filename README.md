# ghav labs

Wound intelligence for the NHS.

Ghav Labs gives community nurses a continuous digital view of wound healing —
track every wound, flag what's failing, document in 30 seconds.

---

## The Problem

The NHS spent an estimated £8.3bn on wound management in 2017/18.
£5.6bn was associated with wounds that failed to heal within the year.
Community nurses made 54.4 million wound-related visits, yet clinicians
have no continuous visibility into wound trajectory between assessments.

Source: Guest et al., BMJ Open, 2020


## What We Built

A two-sided wound care platform for NHS community nursing.

Clinician Side:
  - Dashboard       → Patient caseload sorted by wound severity
  - Patient Detail  → Healing trajectory charts and assessment timeline
  - Assessment      → Photo upload with AI analysis + voice documentation
  - Triage          → Prioritised view of wounds needing attention

Patient Side:
  - Progress View   → Patients see their own healing trajectory
  - Photo Capture   → Send a wound photo to their nurse between visits

Extras:
  - Slides          → Built-in pitch deck at /slides
  - Pricing         → NHS ICB contract-based pricing at /pricing


## Tech Stack

  React 19 + TypeScript + Vite
  TanStack Router (file-based routing)
  Tailwind CSS v4
  Palantir Foundry OSDK
  Web Speech API (voice transcription)
  HTML5 camera capture
  Inline SVG charts (no chart library)
  shadcn/ui components
  Plus Jakarta Sans + IBM Plex Sans


## Data Model

  Patient  →  Wound  →  WoundAssessment
  (1:many)    (1:many)

  Patient:
    name, DOB, NHS number, contact, address

  Wound:
    type, location, date identified,
    status (Healing / Static / Deteriorating),
    severity (Green / Amber / Red)

  WoundAssessment:
    date, wound area (cm²),
    granulation %, slough %, necrotic %,
    periwound status, pain score, healing score,
    photo, clinician notes, documentation method


## Routes

  /              Landing page (Clinician / Patient toggle)
  /login         Login (Clinician or Patient role)
  /dashboard     Clinician dashboard
  /patient/:id   Patient detail + wound timeline
  /assess        New assessment (photo + voice + AI)
  /triage        Triage alerts
  /my-wounds     Patient portal
  /pricing       NHS ICB pricing
  /slides        Presentation deck (arrow keys to navigate)


## Seed Data

  10 patients, 12 wounds, 52 assessments.

  Key demo patients:
    Margaret Thornton  — Venous leg ulcer, 6-week deterioration (RED)
    David Okafor       — Diabetic foot ulcer, 4-week decline (RED)
    Emily Watson       — Venous leg ulcer, 5-week improvement (GREEN)


## Design Decisions

  1. Coordination, not judgement
     We automate documentation, tracking, and prioritisation.
     We do not automate clinical judgement.

  2. Two-sided platform
     Clinicians manage caseloads.
     Patients track healing and submit photos.

  3. Voice-first documentation
     Speak observations → structured wound assessment fields.

  4. Per-wound economics
     Pricing tied to wounds managed, not users logged in.


## Running Locally

  npm install
  npm run dev
