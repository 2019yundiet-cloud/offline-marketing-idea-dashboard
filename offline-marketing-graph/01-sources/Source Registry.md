---
type: source-index
status: active
created: 2026-06-17
tags:
  - offline-marketing/sources
---

# 데이터 소스

성과 수치, 비용, 현장 기록, QR/쿠폰 집계, 매출 데이터를 연결하는 출처 인덱스입니다.

## 등록할 소스

| 소스 | 유형 | 갱신 주기 | 주요 필드 | 연결 노트 |
| --- | --- | --- | --- | --- |
| 자사몰 주문 데이터 | sales | daily | 주문일, 상품, 쿠폰, 매출, 마진 |  |
| 네이버 스마트스토어 주문 데이터 | sales | daily | 주문일, 유입, 쿠폰, 매출 |  |
| QR/UTM 클릭 로그 | tracking | campaign | QR명, URL, 클릭, 전환 |  |
| 현장 운영 기록 | field-note | event | 장소, 시간, 유동, 반응 |  |
| 파트너 정산 자료 | cost | monthly | 비용, 수수료, 정산일 |  |

## 소스 등록 기준

- 원천 파일 또는 시스템 위치를 남긴다.
- 수집 주기와 담당 기준을 남긴다.
- 숫자를 가져온 방식이 바뀌면 변경 이력을 남긴다.

## 관련

- [[00-system/Data Model|데이터 모델]]
- [[06-results/Metric Dashboard|성과 대시보드]]
