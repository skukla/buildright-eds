# Research & External Validation

This folder contains external research findings and validation of our implementation approaches.

---

## Available Documents

### Dropin Customization Research

**[PERPLEXITY-DROPIN-CUSTOMIZATION-RESEARCH.md](./PERPLEXITY-DROPIN-CUSTOMIZATION-RESEARCH.md)** ⭐ **PRIMARY RESEARCH**

**Source**: Perplexity AI + Adobe Documentation  
**Date**: December 11, 2025  
**Topic**: How to customize Adobe Commerce Dropins with existing frontend design

**Key Findings**:
1. **Auth Dropin has ZERO slots** for form/input customization
2. **API-only approach is officially supported** by Adobe
3. **Direct API usage is valid** when containers lack customization points
4. **Event synchronization is required** when not using containers
5. **Our implementation is architecturally correct**

**Questions Answered**:
- Is API-only approach correct or am I missing something?
- Why doesn't the Auth Dropin have customization slots?
- What must I handle when bypassing Dropin containers?

---

**[RESEARCH-VALIDATION.md](./RESEARCH-VALIDATION.md)** ⭐ **VALIDATION SUMMARY**

**Purpose**: Point-by-point validation of BuildRight's implementation against Perplexity research

**Status**: ✅ **All Requirements Met**

**Validated Items**:
- ✅ Event synchronization (listening to `authenticated` event)
- ✅ State management (loading states, errors)
- ✅ Error handling (try/catch with user feedback)
- ✅ Session persistence (Dropin handles tokens)
- ✅ Performance optimization (sessionStorage caching)
- ✅ Documentation (decision records, patterns)

**Conclusion**: Our implementation is correct and follows Adobe's officially supported patterns.

---

**[PERPLEXITY-RESEARCH.md](./PERPLEXITY-RESEARCH.md)**

**Topic**: General BuildRight implementation research (existing)

---

## How to Use This Research

### When Making Decisions

1. **Read the research** - Understand what Adobe recommends
2. **Validate your approach** - Check against research findings
3. **Document your decision** - Create a record in [decisions/](../decisions/)
4. **Implement with confidence** - Research supports your approach

### When Onboarding

1. Start with **PERPLEXITY-DROPIN-CUSTOMIZATION-RESEARCH.md** to understand why we chose API-only
2. Read **RESEARCH-VALIDATION.md** to see how we've met all requirements
3. Review **[decisions/AUTH-DROPIN-API-ONLY.md](../decisions/AUTH-DROPIN-API-ONLY.md)** for implementation details

---

## Research Methodology

Our research process:

1. **Identify the problem** - "How do we match BuildRight design with Dropins?"
2. **External research** - Perplexity AI + Adobe docs
3. **Validate findings** - Compare to our implementation
4. **Document decision** - Create decision record
5. **Establish pattern** - Generalize for future use

---

## Related Documentation

- **[decisions/](../decisions/)** - Implementation decisions based on research
- **[standards/DROPIN-INTEGRATION-PATTERN.md](../../standards/DROPIN-INTEGRATION-PATTERN.md)** - Pattern established from research
- **[adr/](../../adr/)** - Architecture Decision Records (high-level)

---

## Contributing Research

When adding new research:

1. **Use descriptive filename** - `PERPLEXITY-[TOPIC]-RESEARCH.md` or `[SOURCE]-[TOPIC].md`
2. **Include metadata** - Date, source, topic, questions answered
3. **Extract key findings** - What are the actionable insights?
4. **Create validation doc** - How does our implementation align?
5. **Update this README** - Add to the list above

