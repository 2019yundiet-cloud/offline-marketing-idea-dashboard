---
type: field-event-index
status: active
created: 2026-06-17
tags:
  - offline-marketing/events
---

# 현장 실행 인덱스

특정 날짜와 장소에서 실제로 벌어진 오프라인 활동을 기록합니다. 새 기록은 [[09-templates/Field Event Template|현장 실행 템플릿]]으로 만듭니다.

## 실행 목록

```dataview
TABLE event_date, campaign, location, partner, status, staff_count, estimated_traffic, leads, orders
FROM "06-events"
WHERE type = "field-event"
SORT event_date DESC
```

## 기록 기준

- 현장 조건: 날씨, 시간대, 유동, 주변 행사
- 운영 품질: 설치, 동선, 응대, 대기, 샘플 소진
- 고객 반응: 질문, 거절 이유, 구매 트리거
- 추적 누락: QR 미스캔, 쿠폰 미사용, 현장 구두 반응

## 관련

- [[02-campaigns/Campaign Index|캠페인]]
- [[03-locations/Location Index|장소]]
- [[04-partners/Partner Index|파트너]]
- [[06-results/Metric Dashboard|성과]]
