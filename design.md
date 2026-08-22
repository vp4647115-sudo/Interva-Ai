# AI Mock Interview Platform — Design System & UI Specification

## 1. Design Goal
Recreate the visual language and interaction quality of the supplied UI references for an AI Mock Interview product. Do not clone unrelated copy, logos, testimonials, or product claims. Adapt the patterns into original AI interview screens.

## 2. Visual DNA from the Supplied References
The screenshots establish a consistent product language:
- very light gray/white application canvas;
- soft lavender/pink marketing gradients;
- saturated violet primary action;
- green success accents;
- black/dark navy typography;
- large bold headlines;
- rounded white cards;
- pill-shaped primary buttons;
- subtle gray borders and shadows;
- wide whitespace;
- centered onboarding cards;
- thin left-side authenticated navigation;
- compact tab navigation on settings pages;
- simple, high-contrast accordions;
- testimonial/rating micro-components near CTA areas;
- large feature cards/video cards for premium capabilities.

## 3. Color Theme
### Light theme
```text
Primary Violet:        #6C4CFF
Primary Hover:         #5B3FE6
Violet Soft:           #F0ECFF
Lavender Hero:         #EDE3F8
Pink Gradient:         #F9EAF3
Accent Pink:           #F72585
Success Green:         #22C55E
Success Soft:          #E9F9EF
Warning Amber:         #F59E0B
Warning Soft:          #FFF7E6
Error Red:             #EF4444
Error Soft:            #FEF2F2
Background:            #F7F7F8
Surface:               #FFFFFF
Surface Alt:           #FAFAFC
Border:                #E7E7EC
Text Primary:          #111111
Text Secondary:        #667085
Text Muted:            #98A2B3
```

### Gradient
Hero gradient may use:
`linear-gradient(135deg, #E8DDF7 0%, #F6EAF4 55%, #F9F2F5 100%)`

Use gradients mainly for marketing/hero surfaces, not every component.

### Dark theme
```text
Background: #0F1015
Surface: #171923
Surface Alt: #1D1F2A
Border: #2B2E3B
Text Primary: #F8FAFC
Text Secondary: #B7BBC8
Primary: #7C63FF
Primary Soft: #241D4D
Success: #34D399
Warning: #FBBF24
Error: #F87171
```

## 4. Typography
Use a modern geometric sans-serif close to the reference. Recommended:
`Plus Jakarta Sans`, fallback `Inter, ui-sans-serif, system-ui`.

### Scale
```text
Display: 64/72, 700–800
H1:      48/56, 700–800
H2:      36/44, 700
H3:      26/34, 700
H4:      20/28, 700
Body:    16/26, 400–500
Small:   14/22, 400–500
Tiny:    12/18, 500
```

Desktop marketing headlines can use `64px` with a maximum line length around 14–18 words.

## 5. Radius / Shadow / Spacing
```text
Pill: 999px
Input: 14px
Card: 20–28px
Modal: 24–32px
Button: 999px

Shadow-card: 0 8px 30px rgba(17,17,17,0.06)
Shadow-modal: 0 20px 60px rgba(17,17,17,0.12)

Spacing unit: 4px
Common: 8, 12, 16, 20, 24, 32, 40, 56, 72, 96
```

## 6. Responsive Layout
Breakpoints:
```text
sm: 640
md: 768
lg: 1024
xl: 1280
2xl: 1536
```

Desktop authenticated shell:
- sidebar: 260–300px;
- main content max-width: 1280px;
- page horizontal padding: 28–40px.

Mobile:
- collapse sidebar into drawer;
- sticky compact header;
- cards stack to one column;
- tabs become horizontal scroll;
- full-width primary actions;
- live interview question always visible before secondary information.

## 7. Landing Page Blueprint — Reference 1
### Layout
```text
Top Navigation
  logo | language | AI Tools | Log in | Sign up

Hero
  rating row
  huge headline
  gradient highlighted phrase
  supporting paragraph
  primary pill CTA
  social proof avatar stack + rating

Value Section
  large statement
  feature cards

Purple CTA Banner
  headline
  short copy
  green/purple action
  trust row

FAQ
  accordion rows

Footer
```

Hero background should have a very large soft curved lavender/pink shape toward the lower half, matching the feel of the reference.

## 8. Authentication — Reference 2
Desktop split layout:
```text
               ┌───────────────┐
               │ Auth Card     │
               │ Logo/headline │
               │ Google        │
               │ OR            │
               │ Email         │
               │ Continue      │
               │ Terms         │
               └───────────────┘
                         │
      testimonial / trust panel on right
```

Auth card:
- white;
- 420–480px width;
- 20–24px radius;
- subtle shadow;
- 24–32px internal padding;
- Google button is white/outlined;
- primary email CTA can be green as a secondary reference-derived success action, but product-wide primary action remains violet.

## 9. Onboarding — Reference 3
Use a full-page soft background with a faint office/professional image treatment and a strong translucent white overlay.

Header:
- centered brand;
- back/exit pill at upper left.

Body:
- `Unlock Your Perfect Job` style heading adapted to `Get Interview-Ready` / `Build Your Interview Profile`;
- one question;
- 4–6 large option rows in a white rounded panel;
- social-proof micro-row at bottom of content.

Interaction:
- selected row gets violet outline + light violet fill;
- hover lifts by 1–2px;
- keyboard arrows/tab accessible;
- continue automatically or explicit Continue based on step type.

## 10. CTA + FAQ — References 4 and 5
CTA banner:
- full-width rounded container;
- primary violet background;
- white H2;
- green pill CTA;
- social-proof row under CTA.

FAQ:
- centered heading;
- max width 900–1050px;
- each row 64–76px high;
- white or near-white background;
- rounded corners;
- chevron right;
- open state expands smoothly but not excessively.

## 11. Authenticated Sidebar — References 6 and 7
Desktop shell:
```text
┌─────────────────────┐
│ Logo            ⊠   │
│                     │
│ INTERVIEW PREP      │
│  ◉ Dashboard        │
│  ○ Mock Interviews  │
│  ○ Saved Reports    │
│  ○ Answer Library   │
│  ○ Preferences      │
│                     │
│ DOCUMENTS           │
│  ○ Resumes          │
│  ○ Reports          │
│                     │
│ AI TOOLS            │
│  ○ Interview Buddy  │
│                     │
│─────────────────────│
│ user name   Free ▼  │
└─────────────────────┘
```

Sidebar rules:
- white surface;
- thin right border;
- selected item uses light gray/lavender background;
- icon + label;
- section labels in small uppercase text;
- bottom profile area sticky.

## 12. Feature/Modal Card — References 6 and 7
For premium feature education:
- centered white modal/card;
- 520–620px width desktop;
- bold two-line headline;
- gray supporting paragraph;
- video thumbnail with play button;
- violet CTA pill;
- testimonial/rating below.

Use for `Interview Buddy` or premium voice interview capabilities.

## 13. Pricing — Reference 8
Three equal cards:
- Starter.
- Pro.
- Pro+.

Recommended card:
- violet border;
- selected radio indicator;
- green `MOST POPULAR` badge.

Price typography:
- large violet amount;
- small period label;
- crossed old price only when a genuine discount exists.

Feature area:
- soft lavender box inside card;
- 3–5 concise bullets;
- green check indicators.

CTA centered below cards.

## 14. Resume Import — Reference 9
Page structure:
```text
Step indicator: 1 Import -> 2 Interview Profile

Heading: Import Your Resume
Subtitle: Choose the most up-to-date source

Source toggle:
[ Upload Resume ] [ Supported external source ]

Large drag/drop card
  upload icon
  Click to upload, or drag and drop
  supported formats
```

After upload, replace the drop zone with:
- file row;
- parsing progress;
- extraction preview;
- confirm button.

## 15. Answer Library — Reference 10
Authenticated content page:
- sidebar shell;
- title `Answer Library`;
- tabs if needed;
- search field at top;
- Add Answer button;
- violet informational callout;
- answer cards/questions stacked vertically;
- three-dot menu on each item.

For interview product use cases, answer cards should support:
- category;
- question;
- answer;
- tags;
- saved date;
- AI improvement state.

## 16. Weak Topic / Rejection Pattern — Reference 11
Adapt the reference's `Rejection Reasons` into `Interview Weak Areas`.

Content:
- Heading and explanation.
- `Question Topics` input.
- `Skill Areas` input.
- add buttons.
- empty state when no rule exists.

Example:
`Weak topics` → SQL joins, recursion, system design.
`Confidence blockers` → concise answers, examples, explaining trade-offs.

## 17. Interview Preferences — Reference 12
Use a wide form with two-column desktop structure:
- question label left;
- field/select right.

Settings:
- current employment status;
- desired role;
- target experience;
- industry;
- work mode;
- interview language;
- interview difficulty;
- default duration;
- target companies;
- preferred interview type.

Top area includes search preferences and Save button.

## 18. Quick Settings — Reference 13
Use a settings page with a tab strip:
`Quick Settings | Interview Preferences | Answer Library | Weak Areas`

Include callouts for incomplete setup:
`5 profile items are still incomplete` with a violet `Complete Profile` action.

Use radio-card choices for AI behavior:
- Guided.
- Adaptive.
- Strict Interview.

## 19. Interview Buddy — Reference 14
Marketing/feature screen:
- authenticated sidebar;
- page title/subtitle;
- large dark video/hero frame;
- violet glow;
- centered play button;
- green `Unlock to access` button when premium;
- Windows/macOS support note if desktop capability is released.

## 20. Product Mode Selection — Capture Reference
Use a 3-card onboarding decision page:
1. Resume / Career Profile.
2. Mock Interview.
3. Interview Buddy.

Each card contains:
- small category label;
- title;
- short description;
- miniature visual preview;
- selection radio;
- recommended badge for the default choice.

Below:
- `Not sure? See how they compare` disclosure;
- large Continue pill;
- reassurance text that selection can be changed later.

## 21. Mock Interview Dashboard UI
Adapt the reference authenticated shell to interview analytics:
```text
Header: Mock Interviews
Subtitle: Practice role-specific interviews with AI.

Top row:
[Overall Score] [Interviews] [Best Score] [Profile]

Main:
Performance chart | Recommended Practice

Recent:
Interview cards with role, type, score, date

CTA:
Start New Interview
```

## 22. Mock Interview Setup UI
Use three/four large cards or a clean form:
- Role.
- Interview type.
- Difficulty.
- Duration.
- Language.
- Voice/Text.
- Resume/JD context.

Selected controls use violet border + soft lavender fill.

## 23. Live Interview UI
Desktop:
```text
┌Sidebar hidden / focus mode─────────────────────────────┐
│ Mock Interview        Q4/10      12:32      Exit      │
├──────────────────────┬─────────────────────────────────┤
│ AI interviewer       │ Question                        │
│ avatar/video         │                                 │
│ status                │ Explain dependency injection. │
│                       │                                 │
├──────────────────────┴─────────────────────────────────┤
│ Answer                                                │
│ [ voice waveform / text editor ]                     │
│                                                     │
│ [Submit]        [Pause]       [End Interview]       │
└─────────────────────────────────────────────────────┘
```

Live rules:
- no distracting marketing content;
- no unrelated side navigation;
- timer always visible;
- recoverable network state;
- keyboard shortcuts documented;
- voice permission failure automatically offers text mode.

## 24. Report UI
Use white cards and violet visual emphasis:
- score hero;
- skill bars/radar;
- strengths card;
- weaknesses card;
- question-level breakdown;
- improved answer card;
- practice plan;
- `Start Another Interview` CTA.

## 25. Component Library
Build reusable:
- `PillButton`.
- `PrimaryButton`.
- `SecondaryButton`.
- `AuthCard`.
- `PageShell`.
- `Sidebar`.
- `TabBar`.
- `OptionCard`.
- `StepIndicator`.
- `ProfileCompletionCard`.
- `InterviewConfigCard`.
- `QuestionCard`.
- `AnswerComposer`.
- `WaveformStatus`.
- `ScoreCard`.
- `MetricCard`.
- `FAQItem`.
- `PricingCard`.
- `UploadDropzone`.
- `CalloutBanner`.
- `TestimonialRow`.
- `AvatarStack`.
- `EmptyState`.
- `Skeleton`.
- `ErrorState`.

## 26. Memory / UI Preferences
Remember only user-allowed UI preferences:
- theme mode;
- language;
- sidebar collapsed/expanded state;
- last selected interview type;
- last selected target role;
- last selected duration/difficulty;
- dismissible onboarding tips.

Do not persist secret data in UI preference storage.

## 27. Accessibility
- Keyboard navigation for all choices.
- Visible focus ring.
- `aria-live` for live interview status changes.
- Labels tied to fields.
- Errors linked to inputs.
- Reduced motion mode.
- No meaning conveyed by color alone.
- Large tap targets on mobile.
- Voice controls have text alternatives.

## 28. UI Quality Gate
Every new screen must answer:
1. Does it look like the same product family as the reference screenshots?
2. Is the primary action visually obvious?
3. Is the page usable on 360px mobile width?
4. Are loading/empty/error/success states designed?
5. Is all UI text consistent with the product vocabulary?
6. Is the screen accessible by keyboard and screen reader?
