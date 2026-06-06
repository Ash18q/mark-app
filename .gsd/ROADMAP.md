# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0

## Must-Haves (from SPEC)
- [ ] Analog & Digital Clock (real-time updating)
- [ ] Scrollable timeline schedule view
- [ ] Tactile rotating wheel time picker
- [ ] Regex-based NLP parser with counted-task support
- [ ] Missed task detector with reason log
- [ ] Completion analytics dashboard
- [ ] Dynamic subsequent task shifting

## Phases

### Phase 1: Foundation
**Status**: ⬜ Not Started
**Objective**: Build skeleton app, design system (glowing dark/light glassmorphic UI), and the interactive analog & digital clock.
**Deliverables**:
- HTML/CSS layout (responsive grid, left/top sidebar for clock, right/main area for schedule and NLP input).
- LocalStorage state manager.
- Clock updates every second, with SVG vector hands for analog face.

### Phase 2: Schedule Timeline & Tactile Wheel Picker
**Status**: ⬜ Not Started
**Objective**: Build the vertical schedule timeline UI and custom tactile rotating scrollable wheel time picker.
**Deliverables**:
- Schedule timeline component displaying tasks with start/end time, duration, and status indicators.
- 3D or flat-scrolling rotating wheel picker for hours and minutes (independent scroll-snapped lists with drag, mouse wheel, and touch support).
- Form/Modal for manual task addition and edits.

### Phase 3: NLP Parser & AI scheduling engine
**Status**: ⬜ Not Started
**Objective**: Develop the client-side natural language scheduling parser and auto-chaining task scheduler.
**Deliverables**:
- Regex-based text parser handling inputs like "Task at HH:MM AM/PM [daily] takes X min" and "After [previous task], [new task] count times, duration per task".
- Automatic duration calculator for count-based tasks (e.g., 100 times * 6s = 10 min).
- Confirmation interface showing proposed schedule block before finalization.

### Phase 4: Tracking, Grace Period & Analytics
**Status**: ⬜ Not Started
**Objective**: Implement state transitions, grace-period checks, missed-reasons popup, and statistical analytics.
**Deliverables**:
- Track buttons with state updates (Pending -> Completed, with actual end time).
- Periodical checks: if current time > end time + 5 mins grace period, status becomes Missed.
- Missed reason modal (Overslept, Forgot, Emergency, Other).
- Analytics summary cards: completion rate (%), breakdown of missed reasons (bar chart or visual list).

### Phase 5: Dynamic Shifting & Launch Polish
**Status**: ⬜ Not Started
**Objective**: Shifting subsequent tasks, notifications, animations, and manual/automated verification.
**Deliverables**:
- Task completion shift dialog: "You completed early/late. Shift next task(s)?"
- Smooth micro-animations for card transitions.
- Light/Dark mode toggle transitions.
- Final automated verification check.
