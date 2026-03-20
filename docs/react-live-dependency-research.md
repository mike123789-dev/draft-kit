# React Live Dependency Research (MVP)

작성일: 2026-03-20  
대상: DraftKit PRD v1.0의 Live Preview/Validation 요구사항 검토

## 1) 현재 설치 기준

- `react`: `19.2.4`
- `react-dom`: `19.2.4`
- `react-live`: `4.1.8`
- `@babel/parser`: `7.29.2`

설치 위치:

- `packages/draftkit-react/package.json`

검증 결과:

- `pnpm lint` 통과
- `pnpm typecheck` 통과

## 2) 결론 요약

- `react-live@4.1.8`은 DraftKit MVP의 **Live Preview 엔진**으로 적합하다.
- `@babel/parser`는 PRD의 **AST 기반 사전 검증** 요구와 잘 맞는다.
- 단, `react-live`만으로는 PRD의 보안 규칙(import 금지, arbitrary JS 금지 등)을 완성할 수 없다.
- 따라서 반드시 `@babel/parser` 기반 검증 레이어 + `scope` 화이트리스트를 함께 써야 한다.

## 3) PRD 요구사항과 매핑

### A. Live preview rendering

- PRD 요구: 실시간 렌더링
- 매핑: `react-live`의 `LiveProvider` + `LivePreview`
- 판단: 적합

### B. Component-restricted rendering (Registry 기반)

- PRD 요구: 등록된 컴포넌트만 사용
- 매핑: `react-live`의 `scope`로 허용 컴포넌트만 주입
- 판단: 적합 (화이트리스트 운영 전제)

### C. Validation (AST 기반)

- PRD 요구: 허용된 컴포넌트/props만, import 금지, `window/document` 금지
- 매핑: `@babel/parser`로 AST 생성 후 룰 검사
- 판단: 적합 (DraftKit 자체 룰 구현 필요)

### D. Overlay Preview

- PRD 요구: 앱 위 Overlay 형태
- 매핑: `react-live`는 렌더 엔진 역할만 담당, Overlay UI는 별도 UI 계층(예: dialog/panel)에서 구성
- 판단: 구조적으로 적합

## 4) 중요한 한계 (실무 주의)

- `react-live`는 코드 평가/프리뷰 도구이지, 보안 샌드박스 정책을 완전히 대신하지 않는다.
- 즉, 아래 3단계를 강제해야 PRD 의도와 맞는다.

1. 프롬프트 결과 JSX를 `@babel/parser`로 파싱한다.
2. 금지 규칙(import, 전역 객체 접근, 임의 실행 패턴 등)을 AST 룰로 차단한다.
3. 통과한 코드만 `react-live`에 전달하고, `scope`에는 허용 컴포넌트만 넣는다.


## 5) 조사 근거 링크

- React Live repository: https://github.com/FormidableLabs/react-live
- React Live releases (`4.1.8`, 2024-11-19 표기): https://github.com/FormidableLabs/react-live/releases
- React Live package metadata (peer/deps): https://raw.githubusercontent.com/FormidableLabs/react-live/master/packages/react-live/package.json
- React Live type definitions (`LiveProvider` props: `scope`, `transformCode`, `noInline`): https://app.unpkg.com/react-live%404.1.7/files/dist/index.d.ts
