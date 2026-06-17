---
type: experiment-index
status: active
created: 2026-06-17
tags:
  - offline-marketing/experiments
---

# 실험 인덱스

가설 검증형 오프라인 실행을 관리합니다.

## 실험 목록

```dataview
TABLE status, hypothesis, campaign, start, end, primary_metric, result
FROM "07-experiments"
WHERE type = "experiment"
SORT start DESC
```

## 좋은 실험 조건

- 한 번에 하나의 가설만 검증한다.
- 비교 기준이 있다.
- 측정 가능한 성공 조건이 있다.
- 실패해도 다음 판단에 도움 되는 기록을 남긴다.

## 관련

- [[09-templates/Experiment Template|실험 템플릿]]
- [[02-campaigns/Campaign Index|캠페인]]
- [[06-results/Metric Dashboard|성과]]
- [[08-insights/Insight Index|인사이트]]
