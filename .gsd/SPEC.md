# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
Build a premium, self-contained, secure, client-side web application ("AI Schedule Assistant") featuring a real-time analog/digital clock, a scrollable vertical schedule timeline, a tactile scrollable time picker (wheel picker), an NLP scheduling assistant, task tracking, and automatic dynamic adjustments. All data persists locally via `localStorage`.

## Goals
1. **Prominent Clock Display**: A beautiful, real-time updated analog and digital clock display.
2. **Scrollable Schedule View**: Highlighting current/past/upcoming events with dynamic statuses (Pending, Completed, Missed) and visual indicators.
3. **Smart NLP Scheduling Assistant**: Parses natural language inputs (e.g., "Fajr prayer at 5:00 AM daily, takes 15 min") and automatically calculates duration for counted tasks (e.g. "tasbeeh 100 times, 6 sec each" -> 10 mins) and schedules them in sequence.
4. **Task Tracking & Analytics**: Tracks task completion, captures reasons for missed tasks (Overslept, Forgot, Emergency, Other), and shows a weekly analytics breakdown.
5. **Tactile Wheel Time Picker**: Custom iOS-style rotating scroll wheels for hours and minutes separately, working smoothly with drag, touch, and scroll.
6. **Dynamic Adjustments**: Prompts user to shift subsequent tasks forward or backward when a task finishes early or late.
7. **Security & Performance**: Zero external frameworks, vanilla JS and CSS, fully self-contained, safe inputs, and complete local persistence.

## Non-Goals (Out of Scope)
- External backend databases or cloud hosting.
- User accounts and login flows (solely client-side single user).
- Real calendar sync (Google/iCal sync) for version 1.

## Users
Solo developers or productivity enthusiasts who want a tactile, automated schedule assistant that helps them sequence rituals or habits and tracks adherence.

## Constraints
- Single self-contained HTML/CSS/JS page (or clean separate files for structure, but compiled/embeddable for easy local running).
- Pure client-side execution, no backend.
- High-fidelity visual styling (curated dark/light theme, custom scrollbars, glowing glassmorphism).

## Success Criteria
- [ ] Render a gorgeous real-time clock (analog and digital).
- [ ] User can input natural language prompts like "Fajr prayer at 5:00 AM daily, takes 15 minutes" and have it successfully scheduled.
- [ ] Parse count-based tasks (e.g., "tasbeeh 100 times, 6 sec each") and calculate total duration (10 min) and schedule immediately after.
- [ ] Interactive scrollable wheel pickers for manual time edits.
- [ ] Automatic "Missed" transition after a 5-minute grace period with a reason popup.
- [ ] Subsequent task shifting prompt upon early/late completion.
- [ ] Analytics dashboard showing completion rates and missed reasons.
- [ ] Complete state persistence in localStorage across reloads.
