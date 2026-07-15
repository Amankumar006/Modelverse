# Rule: News Sourcing and Credibility Lanes (Lane 1 & Lane 2)

This rule establishes the two distinct lanes of sourcing for Modelverse News and details the epistemic standards for each.

## Sourcing Lanes

### Lane 1: Catalog-Backed News
- **Scope**: Direct recaps, feature breakdowns, and models added to the official Modelverse catalog.
- **Epistemic Standard**: Zero speculation. All details must map directly to fields inside verified `data/models/` files.
- **Confidence Level**: Always `"confirmed"`.
- **Confidence Badge**: None shown (implied default).

### Lane 2: Industry News & Reporting
- **Scope**: Leaks, rumors, delay reports, benchmark gossip, or general community discussion about models or updates that are not (and should not be) in the model catalog as facts yet.
- **Epistemic Standard**: External sourcing via real, fetchable URLs specified in `externalSources`.
- **Confidence Levels**:
  - `"reported"`: CREDIBLE. Named outlet with clear byline and professional sourcing, but not yet officially confirmed by the company (e.g. tech journalism reports).
  - `"rumor"`: SPECULATIVE. Unverified leaks, anonymous posts, forum comments, or screenshots with low-to-medium verification.
  - `"community-discussion"`: SOCIAL. Aggregated community chatter/reactions on forums/social sites, representing public sentiment rather than fact claims.
- **Confidence Badge**: Renders prominently on article cards and article headers.

---

## Strict Writing Rules

1. **Hedged Language for unconfirmed content (reported, rumor, community-discussion)**:
   - Always prefix claims with phrases like "according to [outlet/reporter]," "allegedly," "reportedly," or "unconfirmed reports indicate."
   - Refuse to write flat, absolute declarative statements for unconfirmed claims (e.g., instead of "Google is delaying Gemini 3.5 Pro," write "Google is reportedly delaying its upcoming Gemini 3.5 Pro model, according to sources familiar with the matter").
2. **Catalog vs. News Separation**:
   - The catalog (`data/models`) remains strictly factual and speculative-free ("0 speculative catalog listings").
   - Speculative/reported content is kept exclusively in the News section and must be explicitly labeled.
3. **URL Validation**:
   - All URLs listed in `externalSources` must be real, valid, and fully-formed URLs.
