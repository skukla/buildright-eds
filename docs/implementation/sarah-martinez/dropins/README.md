# Commerce Dropins Integration

**Purpose**: Documentation for integrating Adobe Commerce Dropins with BuildRight's hybrid architecture.

---

## Documents

| Document | Purpose | Status |
|----------|---------|--------|
| [best-practice-implementation-summary.md](../../../archive/completed/best-practice-implementation-summary.md) | Summary of dual-endpoint architecture decision | Archived |
| [commerce-dropins-integration.md](./commerce-dropins-integration.md) | How to integrate Commerce Dropins | Reference |
| [commerce-mesh-integration.md](./commerce-mesh-integration.md) | API Mesh configuration for dropins | Reference |
| [cart-api-only-implementation.md](./cart-api-only-implementation.md) | Cart dropin API-only mode | Complete |
| [codebase-audit-dropins.md](./codebase-audit-dropins.md) | Comprehensive dropin codebase audit | Reference |

---

## Architecture Summary

BuildRight uses a **dual-endpoint architecture** (per ADR-001):

```
Commerce Dropins → Commerce Direct (standard pattern)
Custom Queries   → API Mesh (ACO + BuildRight resolvers)
```

This replaces the earlier fetch adapter approach with Adobe's recommended best practice.

---

## Related Documentation

- **ADR-001**: [Use Dropins for Commerce](../../../adr/ADR-001-use-dropins-for-commerce.md)
- **Dropin Architecture**: [reference/dropin-architecture.md](../../../reference/dropin-architecture.md)
- **Mesh Adapter**: [explanations/mesh-adapter.md](../../../explanations/mesh-adapter.md)

---

**Last Updated**: 2026-01-02
