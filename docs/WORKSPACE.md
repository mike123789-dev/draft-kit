# DraftKit Workspace Rules

## 1) 제품 코드와 예제 코드 분리

- `packages/`는 제품 코드입니다.
- `examples/`는 데모/검증용 코드입니다.
- 제품 기능 추가는 먼저 `packages/`에 구현하고, `examples/`에서는 연결만 합니다.

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

## 5) Storybook 운영 가이드 (2026-03 조사)

### 조사 출처

- Storybook Next.js Vite 프레임워크 문서: https://storybook.js.org/docs/get-started/frameworks/nextjs-vite
- Story 작성(CSF) 문서: https://storybook.js.org/docs/writing-stories
- Autodocs 문서: https://storybook.js.org/docs/writing-docs/autodocs
- Testing 문서: https://storybook.js.org/docs/writing-tests

### 우리 프로젝트 권장 방식

- 프레임워크는 `@storybook/nextjs-vite`를 기본으로 사용한다.
- 모든 컴포넌트 스토리는 CSF + 타입 안전 메타(`satisfies Meta<typeof Component>`)로 작성한다.
- 컴포넌트 문서는 `tags: ["autodocs"]` 기준으로 자동 생성한다.
- Registry에 필요한 메타(`importPath`, `componentName`, `description`, `argTypes`)는 story의 `parameters`와 `argTypes`에 명시한다.
- Storybook은 `examples/playground-next`에서 운영하고, registry JSON은 추출 스크립트로 생성한다.

### PRD 매핑

- PRD 3/8.2 `Storybook 기반 Component Registry 활용`
  - 구현: story 메타 기반 `src/registry/storybook-registry.json` 자동 생성
- PRD 5 `등록된 Component Registry만 사용`
  - 구현: story에 등록된 컴포넌트/props만 registry로 승격
- PRD 7 `Component-restricted rendering`
  - 구현: 생성 파이프라인은 registry 엔트리만 허용하도록 검증
- PRD 14 `MVP Scope: Storybook registry 연동`
  - 구현: Storybook build + registry extract를 CI/검증 루틴에 포함

### 운영 체크리스트

1. 새 UI 컴포넌트를 추가하면 `.stories.tsx`도 함께 추가
2. `argTypes`와 `parameters.draftkit` 메타를 반드시 채움
3. `pnpm --filter @draftkit/playground-next build-storybook` 성공 확인
4. `pnpm --filter @draftkit/playground-next registry:extract` 실행 후 결과 확인
