---
name: design-polish-audit
description: Audits a page or component against Awwwards-caliber visual and motion design heuristics and flags anything that looks like a generic template default. Use before considering any UI work finished, or when the user asks to "make this look better/more premium/more awwwards".
---

# Design Polish Audit

## When to use this skill
- Right after building or editing any page, layout, or reusable component.
- When the user says something looks "generic," "boring," "template-y," or
  asks you to push the visual quality up.

## How to use it

Walk through `references/checklist.md` against the component/page in
question. For each item that fails, either fix it directly (if small) or
list it as a concrete, actionable finding (not vague — "the hero heading
uses the default font stack, swap in the display font token" rather than
"typography could be better").

Do not mark the audit "passed" just because nothing is broken — the bar is
distinctiveness, not just absence of bugs. If everything technically works
but the layout is a centered stack of equal-width cards with no personality,
that's a fail on the "no generic patterns" checklist item.

Summarize findings as a short pass/fail list, then apply fixes for anything
you can safely do without more direction from the user.
