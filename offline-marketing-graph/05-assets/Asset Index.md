---
type: asset-index
status: active
created: 2026-06-17
tags:
  - offline-marketing/assets
---

# 소재 인덱스

현장에서 쓰는 모든 오프라인 소재와 추적 수단을 관리합니다.

## 소재 목록

```dataview
TABLE asset_type, campaign, status, offer, tracking_code
FROM "05-assets"
WHERE type = "asset"
SORT file.mtime DESC
```

## 소재 유형

- 배너
- POP
- 전단
- 쿠폰
- QR 카드
- 시식대 구성
- 현장 안내문
- 제휴 제안서

## 관련

- [[09-templates/Asset Template|소재 템플릿]]
- [[02-campaigns/Campaign Index|캠페인]]
- [[06-results/Metric Dashboard|성과]]
