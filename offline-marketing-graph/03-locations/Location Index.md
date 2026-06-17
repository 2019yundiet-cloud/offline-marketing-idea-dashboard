---
type: location-index
status: active
created: 2026-06-17
tags:
  - offline-marketing/locations
---

# 장소 인덱스

장소는 캠페인과 별개로 관리합니다. 같은 장소가 반복 사용되면 과거 성과와 운영 노하우가 자동으로 연결됩니다.

## 장소 목록

```dataview
TABLE location_type, region, audience, status, last_used
FROM "03-locations"
WHERE type = "location"
SORT region ASC
```

## 장소 평가 항목

- 예상 유동/체류 시간
- 고객 적합도
- 운영 난이도
- 설치 가능 소재
- 허가/계약 조건
- 과거 전환 품질

## 관련

- [[09-templates/Location Template|장소 템플릿]]
- [[02-campaigns/Campaign Index|캠페인]]
- [[08-insights/Insight Index|인사이트]]
