---
type: hub
status: active
created: 2026-06-17
tags:
  - offline-marketing
  - hub
---

# 오프라인 마케팅 그래프

이 볼트는 오프라인 마케팅 전용 데이터 그래프입니다. 캠페인, 장소, 파트너, 소재, 실행 이벤트, 성과 스냅샷, 인사이트를 별도 지식망으로 관리합니다.

## 바로가기

- [[00-system/Graph Operating Manual|운영 원칙]]
- [[00-system/Data Model|데이터 모델]]
- [[00-system/Taxonomy|분류 체계]]
- [[00-system/Quality Checks|품질 체크]]
- [[01-sources/Source Registry|데이터 소스]]
- [[02-campaigns/Campaign Index|캠페인]]
- [[03-locations/Location Index|장소]]
- [[04-partners/Partner Index|파트너]]
- [[05-assets/Asset Index|소재]]
- [[06-events/Field Event Index|현장 실행]]
- [[06-results/Metric Dashboard|성과]]
- [[07-experiments/Experiment Index|실험]]
- [[08-insights/Insight Index|인사이트]]

## 주간 루틴

- [ ] 새 오프라인 활동을 [[02-campaigns/Campaign Index|캠페인]] 또는 [[07-experiments/Experiment Index|실험]]으로 등록
- [ ] 장소, 파트너, 소재, 실행 이벤트를 각각 독립 노트로 분리
- [ ] 성과 수치에는 반드시 [[01-sources/Source Registry|출처]]와 집계 기준일 연결
- [ ] 반복 패턴과 의사결정은 [[08-insights/Insight Index|인사이트]]로 승격

## 링크 원칙

캠페인을 중심 허브로 두되, 장소와 파트너도 독립 노드로 관리합니다. 이렇게 해야 같은 장소/파트너가 여러 캠페인에서 재사용될 때 그래프가 실제 운영 지식처럼 자랍니다.
