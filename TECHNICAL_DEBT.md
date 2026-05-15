# Technical Debt

## Overview

This document tracks technical debt items identified for Tinkuy frontend. Each item is evaluated for impact and effort to prioritize remediation.

## Prioritization Matrix

|  | Low Effort | Medium Effort | High Effort |
|--|------------|---------------|-------------|
| **High Impact** | Quick wins | Plan for soon | Critical - schedule ASAP |
| **Medium Impact** | When convenient | Schedule for sprint | Plan for soon |
| **Low Impact** | Backlog | Backlog | When capacity allows |

---

## Debt Register

| ID | Item | Categoría | Impacto | Esfuerzo | Sprint |
|---|---|---|---|---|---|
| TD-01 | Migrar a Next.js 16 | Seguridad | Alto | Alto | Cuando salga estable |
| TD-02 | Dividir admin (738 líneas) | Código | Medio | Medio | Sprint 5 |
| TD-03 | DataLoader para N+1 | Performance | Medio | Medio | Sprint 5 |
| TD-04 | Cluster mode backend | Escalabilidad | Medio | Bajo | Sprint 6 |
| TD-05 | Prometheus + Grafana | Observabilidad | Bajo | Alto | Sprint 7 |
| TD-06 | App React Native | Features | Alto | Muy Alto | Q2 2026 |
| TD-07 | Blog SEO | Marketing | Alto | Medio | Sprint 5 |
| TD-08 | Programa afiliados | Negocio | Medio | Alto | Q2 2026 |
| TD-09 | Andreani API envíos | Logística | Alto | Medio | Sprint 5 |
| TD-10 | A/B testing | Conversión | Medio | Medio | Sprint 6 |

---

## Detailed Items

### TD-01 — Migrar a Next.js 16

**Category:** Seguridad  
**Impact:** Alto  
**Effort:** Alto  
**Target:** Cuando salga estable

**Description:**
Next.js 16 will include security patches and performance improvements. Current version is 14.2.35.

**Rationale:**
- Security vulnerabilities in older versions
- Performance improvements in newer releases
- New features that may benefit the application

**Dependencies:**
- Next.js 16 stable release
- Compatibility check with Apollo Client 4.x
- Verify all current Next.js plugins work

---

### TD-02 — Dividir admin (738 líneas)

**Category:** Código  
**Impact:** Medio  
**Effort:** Medio  
**Target:** Sprint 5

**Description:**
The admin layout file `src/app/(admin)/admin/layout.tsx` has grown to 738 lines and handles multiple responsibilities:
- Navigation state management
- Admin metrics fetching
- Sidebar/menu rendering
- Activity tracking
- Session timeout warnings

**Rationale:**
- Violates Single Responsibility Principle
- Hard to test individual features
- Increases cognitive load for new developers
- Difficult to onboard team members

**Proposed Split:**
```
src/components/admin/
├── AdminShell.tsx          # Main layout wrapper
├── AdminNav.tsx           # Navigation sidebar
├── AdminMetrics.tsx       # Metrics fetching + display
├── AdminActivityTracker.tsx # Activity detection
└── AdminTimeoutWarning.tsx # Session timeout UI
```

---

### TD-03 — DataLoader para N+1

**Category:** Performance  
**Impact:** Medio  
**Effort:** Medio  
**Target:** Sprint 5

**Description:**
Implement DataLoader pattern for GraphQL queries to prevent N+1 database queries.

**Current State:**
Products, orders, and customers queries may trigger multiple database calls when resolving nested fields.

**Target State:**
- Single batched query per resolver level
- Configured in Apollo Client with `dataloader` library

**Rationale:**
- Reduces database load significantly
- Improves response times for complex queries
- Standard pattern for GraphQL performance

---

### TD-04 — Cluster mode backend

**Category:** Escalabilidad  
**Impact:** Medio  
**Effort:** Bajo  
**Target:** Sprint 6

**Description:**
Enable Node.js cluster mode to utilize multiple CPU cores for the backend server.

**Current State:**
Single-threaded Node.js process.

**Target State:**
```
                  ┌─ Worker 1 (port 4001)
── Master ────────┼─ Worker 2 (port 4002)
                  └─ Worker N (port 400N)
```

**Rationale:**
- Backend runs on multi-core Railway instances
- Easy win for handling concurrent requests
- Minimal code changes with `cluster` module

---

### TD-05 — Prometheus + Grafana

**Category:** Observabilidad  
**Impact:** Bajo  
**Effort:** Alto  
**Target:** Sprint 7

**Description:**
Implement application metrics collection and visualization.

**Metrics to Track:**
- Request latency (p50, p95, p99)
- Error rates by type
- GraphQL query complexity
- Cache hit ratios
- Active connections

**Stack:**
- Prometheus (collection)
- Grafana (visualization)
- Existing Sentry for error tracking

**Rationale:**
- Proactive debugging before users report issues
- Performance trending over time
- Capacity planning data

---

### TD-06 — App React Native

**Category:** Features  
**Impact:** Alto  
**Effort:** Muy Alto  
**Target:** Q2 2026

**Description:**
Build native mobile applications for iOS and Android.

**Scope:**
- Product catalog browsing
- Shopping cart
- Order tracking
- Push notifications for promotions
- Loyalty program integration

**Rationale:**
- Mobile-first market in Argentina
- Competitive advantage
- Enhanced customer engagement

**Note:** This is a major feature, not purely debt. Listed here for tracking alongside other initiatives.

---

### TD-07 — Blog SEO

**Category:** Marketing  
**Impact:** Alto  
**Effort:** Medio  
**Target:** Sprint 5

**Description:**
Improve blog section for SEO optimization.

**Current State:**
Basic blog pages exist but lack:
- Structured data (JSON-LD)
- Open Graph tags per post
- Category taxonomy
- Related posts linking
- Social sharing buttons
- Reading time estimates

**Target State:**
- Full SEO optimization
- Integration with Google Search Console
- Sitemap updates on publish

**Rationale:**
- Organic search traffic growth
- Low effort, high potential return
- Complements content marketing strategy

---

### TD-08 — Programa afiliados

**Category:** Negocio  
**Impact:** Medio  
**Effort:** Alto  
**Target:** Q2 2026

**Description:**
Implement affiliate marketing program.

**Features:**
- Unique affiliate codes per partner
- Commission tracking
- Partner dashboard
- Payout processing
- Anti-fraud detection

**Rationale:**
- New customer acquisition channel
- Performance-based marketing spend
- Partnership monetization

---

### TD-09 — Andreani API envíos

**Category:** Logística  
**Impact:** Alto  
**Effort:** Medio  
**Target:** Sprint 5

**Description:**
Integrate Andreani shipping API for real-time shipping rates and label generation.

**Scope:**
- Shipping rate calculation at checkout
- Label generation on order confirmation
- Tracking updates
- Pickup point integration

**Rationale:**
- Core logistics requirement
- Competitor differentiator
- Customer experience improvement

---

### TD-10 — A/B testing

**Category:** Conversión  
**Impact:** Medio  
**Effort:** Medio  
**Target:** Sprint 6

**Description:**
Implement A/B testing framework for conversion optimization.

**Use Cases:**
- Checkout flow variations
- CTA button colors/text
- Product page layouts
- Pricing display options

**Stack Options:**
- Vercel Edge Config (for feature flags)
- Custom solution with analytics
- Third-party (LaunchDarkly, Optimizely)

**Rationale:**
- Data-driven product decisions
- Low risk: test before full rollout
- Measurable impact on KPIs

---

## Metrics

### Debt Health Indicators

| Metric | Current | Target |
|--------|---------|--------|
| Code coverage | TBD | >80% |
| Admin layout lines | 738 | <200 |
| GraphQL N+1 issues | Known | 0 |
| Security vulnerabilities | 0 | 0 |

---

## Process

### Adding New Debt

1. Identify issue during development or review
2. Document in this file with ID, description, category, impact, effort
3. Add to appropriate sprint during planning
4. Mark as resolved when fixed
5. Update metrics section

### Review Cadence

- **Monthly:** Review backlog items, update priorities
- **Quarterly:** Major debt assessment
- **Pre-release:** Ensure critical items are addressed

---

## Related Documents

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — System architecture
- [SECURITY.md](./docs/SECURITY.md) — Security implementation details
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) — Deployment procedures
