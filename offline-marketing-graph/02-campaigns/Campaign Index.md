---
type: campaign-index
status: active
created: 2026-06-17
tags:
  - offline-marketing/campaigns
---

# 캠페인 인덱스

오프라인 마케팅 실행의 중심 허브입니다. 새 캠페인은 [[09-templates/Campaign Template|캠페인 템플릿]]으로 만듭니다.

## 캠페인 목록

```dataview
TABLE status, objective, start, end, budget, primary_metric
FROM "02-campaigns"
WHERE type = "campaign"
SORT start DESC
```

## 캠페인 설계 체크

- 목표 고객
- 오프라인 접점
- 제안/혜택
- 추적 방식
- 운영 비용
- 성과 기준
- 다음 액션

## 관련

- [[03-locations/Location Index|장소]]
- [[04-partners/Partner Index|파트너]]
- [[05-assets/Asset Index|소재]]
- [[06-events/Field Event Index|현장 실행]]
- [[06-results/Metric Dashboard|성과]]
- [[08-insights/Insight Index|인사이트]]
