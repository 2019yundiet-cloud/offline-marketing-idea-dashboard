---
type: insight-index
status: active
created: 2026-06-17
tags:
  - offline-marketing/insights
---

# 인사이트 인덱스

오프라인 마케팅에서 반복 재사용할 판단 근거를 모읍니다.

## 인사이트 목록

```dataview
TABLE confidence, decision, evidence, related_campaigns
FROM "08-insights"
WHERE type = "insight"
SORT confidence DESC
```

## 승격 기준

- 다음 캠페인 의사결정에 영향을 준다.
- 특정 장소/파트너/소재에서 반복 관찰된다.
- 성과 스냅샷 또는 현장 기록으로 검증 가능하다.
- 반례와 적용 조건을 함께 적을 수 있다.

## 관련

- [[09-templates/Insight Template|인사이트 템플릿]]
- [[06-results/Metric Dashboard|성과]]
- [[03-locations/Location Index|장소]]
- [[04-partners/Partner Index|파트너]]
