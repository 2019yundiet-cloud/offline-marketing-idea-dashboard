---
type: metric-dashboard
status: active
created: 2026-06-17
tags:
  - offline-marketing/results
---

# 성과 대시보드

성과 수치와 근거를 모으는 인덱스입니다. 새 스냅샷은 [[09-templates/Metric Snapshot Template|성과 스냅샷 템플릿]]으로 만듭니다.

## 최근 성과 스냅샷

```dataview
TABLE campaign, period_start, period_end, spend, revenue, orders, leads, cac, roas, source
FROM "06-results"
WHERE type = "metric-snapshot"
SORT period_end DESC
```

## 핵심 지표

- 비용: spend, production_cost, partner_fee, field_operation_cost
- 반응: impressions, QR scans, inquiries, samples
- 전환: leads, orders, coupon redemptions, first purchases
- 매출: gross revenue, net revenue, contribution margin
- 효율: CAC, CPA, ROAS, margin ROAS

## 해석 원칙

- 단기 반응과 실제 구매를 분리한다.
- QR/쿠폰 누락 가능성을 별도 메모한다.
- 현장 품질은 숫자와 관찰 기록을 함께 본다.
- 다음 캠페인에서 바꿀 행동을 반드시 남긴다.

## 관련

- [[01-sources/Source Registry|데이터 소스]]
- [[06-events/Field Event Index|현장 실행]]
- [[08-insights/Insight Index|인사이트]]
