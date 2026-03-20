# DraftKit Monorepo (Skeleton)

DraftKit을 실제 제품 코드와 예제 앱으로 분리한 최소 뼈대입니다.

## Structure

```text
examples/
  playground-next/     # example 앱 (Next.js)
packages/
  draftkit-core/       # 제품 핵심 로직 (생성/검증/직렬화)
  draftkit-react/      # React 렌더러/셸
  draftkit-next/       # Next 연결용 헬퍼
```

## Quick Start

```bash
pnpm install
pnpm dev
```

위 명령은 `examples/playground-next` 앱(`@draftkit/playground-next`)을 실행합니다.

## Commands

```bash
pnpm dev             # playground 앱 실행
pnpm build           # 워크스페이스 전체 빌드
pnpm typecheck       # 워크스페이스 전체 타입체크
pnpm lint            # 워크스페이스 전체 린트
```

## Current MVP Skeleton

- Prompt 입력
- Mock draft 생성 (`@draftkit/core`)
- Registry 기반 검증
- Overlay preview 렌더링 (`@draftkit/react`)
- JSX 코드 복사
- PNG export 버튼 자리(TODO)

## Next Steps

1. Storybook registry 추출기를 `@draftkit/core`에 추가
2. mock generator를 실제 LLM generation으로 교체
3. PNG export 파이프라인 구현
