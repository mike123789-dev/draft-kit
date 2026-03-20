# DraftKit Workspace Rules

## 1) 제품 코드와 예제 코드 분리

- `packages/`는 제품 코드입니다.
- `apps/`는 데모/검증용 코드입니다.
- 제품 기능 추가는 먼저 `packages/`에 구현하고, `apps/`에서는 연결만 합니다.

## 2) 패키지 역할

- `@draftkit/core`: 생성/검증/직렬화 같은 순수 로직
- `@draftkit/react`: 프리뷰 렌더러와 UI 셸
- `@draftkit/next`: Next.js 전용 연결 헬퍼

## 3) 금지 규칙

- `@draftkit/core`에서 `next`를 import하지 않습니다.
- 예제 앱 의존 로직을 `@draftkit/core`에 넣지 않습니다.

## 4) 개발 순서

1. `core` 기능 구현
2. `react` 렌더링 연결
3. `playground-next`에서 최종 확인
