---
type: partner-index
status: active
created: 2026-06-17
tags:
  - offline-marketing/partners
---

# 파트너 인덱스

제휴처, 운영 대행사, 커뮤니티, 입점처, 현장 협력자를 관리합니다.

## 파트너 목록

```dataview
TABLE partner_type, status, region, fit_score, last_contact
FROM "04-partners"
WHERE type = "partner"
SORT fit_score DESC
```

## 평가 항목

- 타깃 고객 접근성
- 운영 신뢰도
- 비용 구조
- 성과 측정 가능성
- 재협업 가능성

## 관련

- [[09-templates/Partner Template|파트너 템플릿]]
- [[02-campaigns/Campaign Index|캠페인]]
- [[06-results/Metric Dashboard|성과]]
