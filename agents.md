# Antigravity Agentic Coding Assistant Architecture

This file documents the agentic system architecture, capabilities, and workflows used by the AI coding assistants operating in this workspace.

---

## 1. Agent Roles & Capabilities

The workspace uses a multi-agent system consisting of a main coordinator and specialized subagents that can be defined and invoked programmatically.

### Main Coordinator (Antigravity)
* **Role**: Primary pair-programmer and project manager.
* **Responsibilities**:
  * Coordinates overall feature implementation and debugging.
  * Conducts architectural planning, creates implementation plans, and tracks progress.
  * Directly modifies files, executes builds, and runs database migrations.
  * Facilitates communication with the user.

### Research Subagent (`research`)
* **Role**: Specialized Codebase & Documentation Researcher.
* **Capabilities**: Read-only tools for file reading, grep searching, and web searches.
* **Usage**: Invoked dynamically to perform background lookups, check documentation, or trace code linkages across large files without cluttering the main context.

### Self Subagent (`self`)
* **Role**: Cloned Assistant context.
* **Capabilities**: Inherits all parent tools and permissions (including write tools and commands).
* **Usage**: Invoked for concurrent background execution of tasks (e.g. running mock servers, long-running diagnostics) while the main agent continues coding.

---

## 2. Interactive Slash Commands

The chat interface exposes several high-level workflow shortcuts:

* `/goal`: Activates thorough, long-running execution mode for complex overnight tasks.
* `/schedule`: Schedules recurring checks, cron jobs, or one-shot reminders.
* `/browser`: Initiates visual web browsing or interaction with web applications.
* `/grill-me`: Triggers an interactive design interview to resolve ambiguities before coding.
* `/teamwork-preview`: Orchestrates a multi-agent swarm to preview large-scale project execution.

---

## 3. Sandboxed Task Execution

Antigravity executes system processes asynchronously in a sandboxed background thread, ensuring:
* **Non-blocking builds**: Next.js compilation (`pnpm run build`) runs in the background.
* **Automatic wakeups**: The system wakes up the coordinator automatically upon process completion or error emission.
* **Log isolation**: Standard output and error streams are piped to dedicated logs under `.system_generated/tasks/` for granular debugging.

---

## 4. Documentation & Artifact Standards

During execution, the agents maintain three living markdown documents to guarantee progress visibility and alignment:
1. `implementation_plan.md`: Outlines proposed architectural changes and requests user feedback.
2. `task.md`: Serves as the active checklist (TODO list) for component-level tasks.
3. `walkthrough.md`: Summarizes completed changes and validation results with visual details.

---

## 5. Quote Section Layout Settings & Parameters

The quote section supports layout variants and parameters configured in the CMS database:
* **Layout Variants (`layout`)**:
  * **Premium Editorial (`editorial`)**: Solid gold flat-top quote icon above the text, left-aligned text and signature, parallel diagonal background overlays, and a transparent portrait cutout overlapping the background. Breakpoint set at `lg` (1024px) so portrait stacks below on mobile and tablet.
  * **Simple Classic (`simple`)**: Centered/left-aligned quote icon, text, and signature with no portrait, using plain radial blurs.
  * **Modern Split (`split-flat`)**: A 50/50 division layout. Left side has left-aligned quote, signature, and gold divider. Right side has a flat, rectangular portrait image filling the right column (not skewed, not cutout).
  * **Glass Card Testimonial (`card-testimonial`)**: Quote contained inside a glassmorphism card with a gold border (`border border-[var(--champagne-gold)]/15`) and translucent background, supporting left or centered alignment.
* **Layout Properties**:
  * **Portrait Image (`image`)**: File path to picker-selected portrait image (shows on `editorial` and `split-flat`).
  * **Portrait Image Size (`imageSize`)**: Dropdown option to select `small`, `medium`, `large`, `xl`, or `xxl` scale bounds.
  * **Text Alignment (`align`)**: Toggle between `center` and `left` alignments (shows on `simple` and `card-testimonial`).
  * **Typography Style (`fontStyle`)**: Toggle between `serif` (Premium Editorial Playfair Display) and `sans` (Modern Clean Inter).
  * **Background Accents (`showAccents`)**: Checkbox toggle to show/hide background radial blurs and slanted overlay panels.
  * **Fixed-Height Portrait Containment**: Dynamic vertical bounds ranging from `h-[280px]` (small) to `h-[560px]` (xxl) with `object-contain` to fit any image format without cropping.
  * **Enlarged Signature Size**: Handdrawn signature SVG width scaled to `290px` and PNG signature image height scaled to `h-20 md:h-28` for high legibility.
  * **Foreground Parallax Stripe**: Nested inside the portrait image container. An absolute-positioned diagonal stripe at `right-0 bottom-0` in the bottom-right corner skewed at `-skew-x-[22deg]` overlaying the portrait image (`z-20`) to create a layered parallax depth effect that remains aligned at all screen widths.
* **Snappy Cascaded Animation Timings**:
  - Animations are propagated from a single parent `motion.section` observer (`initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}`) for 100% trigger reliability.
  - Background/foreground stripes: `delay: 0.05s / 0.1s / 0.15s / 0.25s` (with `skewX: -22` handled by motion properties to prevent overrides)
  - Quote Icon: `delay: 0s`
  - Quote Text: `delay: 0.1s`
  - Signature parent: `delay: 0.2s` (internal drawing transitions set to `0s` delay to prevent double-delay lag)
  - Portrait: `delay: 0.15s` (slides in softly)
