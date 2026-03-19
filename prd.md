# DraftKit PRD (v1.0)

## 1. Overview

DraftKit은 기존 React 애플리케이션 위에서 동작하는 AI 기반 디자인 드래프트 에이전트로,  
자연어 입력을 통해 UI를 생성하고 실시간으로 렌더링하며,  
최종적으로 복붙 가능한 코드와 PNG 이미지로 결과를 제공하는 시스템이다.

DraftKit은 특정 UI 라이브러리에 종속되지 않으며,  
Storybook에 등록된 디자인 시스템 컴포넌트를 기반으로 UI를 생성한다.

---

## 2. Problem

현재 UI 개발 및 디자인 프로세스는 다음과 같은 문제를 가진다:

- UI 수정 → 코드 변경 → 빌드 → 확인 과정이 반복되며 속도가 느림
- 디자이너, 기획자, 개발자 간 커뮤니케이션 비용이 높음
- AI가 생성한 UI를 실제 앱 맥락에서 바로 확인하기 어려움
- 디자인 아이디어를 빠르게 시각화하고 검증하기 어려움

---

## 3. Solution

DraftKit은 다음과 같은 방식으로 문제를 해결한다:

- 자연어 기반 UI 생성 (Chat interface)
- Storybook 기반 Component Registry 활용
- DraftKit 내장 Layout System
- 실시간 렌더링 (Live Preview)
- 기존 앱 위 Overlay 방식의 Draft 표시
- 코드 및 이미지(PNG) Export 제공

핵심 컨셉:

> AI가 UI를 생성하고, 앱 위에서 즉시 확인하며, 결과를 바로 사용할 수 있다

---

## 4. Target Users

- 프론트엔드 개발자
- 제품 기획자
- 디자이너 (개발 친화적 환경 사용자)

---

## 5. Product Principles

- 특정 UI 라이브러리에 종속되지 않는다
- 등록된 Component Registry만 사용한다
- 자유 코드 실행기가 아니다
- 실시간 Preview 경험을 최우선으로 한다
- 결과물은 반드시 재사용 가능한 코드여야 한다

---

## 6. Core Experience

1. 사용자가 기존 프로젝트를 실행한다
2. DraftKit 패널을 오픈한다 (우측 패널 + Overlay)
3. 자연어로 UI 요청을 입력한다
4. AI가 Component Registry 기반으로 UI를 생성한다
5. 생성된 UI가 기존 앱 위에 Overlay 형태로 실시간 렌더링된다
6. 사용자는 반복적으로 수정 요청을 한다
7. 최종 결과를 코드 및 PNG로 export한다

---

## 7. Key Features

- Chat-based UI generation
- Live preview rendering
- Overlay-based draft visualization
- Component-restricted rendering (Registry 기반)
- Layout system (DraftKit 내장)
- Iterative refinement
- Code export (JSX)
- PNG export

---

## 8. System Design

### 8.1 Flow

User Prompt
↓
AI Generation (JSX)
↓
Validation (AST 기반)
↓
Renderer (react-live)
↓
Overlay Preview
↓
Export (Code + PNG)

---

### 8.2 Component Registry

- Source: Storybook
- 포함 정보:
  - Component name
  - Props (argTypes 기반)
  - Default values
  - Description
  - Import path

---

### 8.3 Layout System (DraftKit 내장)

#### Core Components

- Page
- Section
- Container
- Stack
- Inline
- Grid
- Spacer
- Divider

#### Rules

- div 직접 사용 금지
- spacing은 gap 기반
- layout은 반드시 primitive 사용
- responsive는 primitive props로 처리
- nesting depth 제한 (3~4)

---

### 8.4 Rendering Engine

- react-live 기반 live rendering
- 제한된 scope에서만 실행
- 허용된 컴포넌트만 사용 가능

---

### 8.5 Validation

- 허용된 Component만 사용
- 허용된 Props만 사용
- import 금지
- window / document 접근 금지
- arbitrary JS 실행 금지

---

## 9. UI/UX Model

### 기본 모드

- 우측 Chat Panel
- 중앙 Overlay Preview

### 보조 모드

- Fullscreen Draft Canvas (확장 모드)

---

## 10. Export

### 10.1 Code Export

- Single file React component
- import 포함
- clean JSX
- 복붙 가능

---

### 10.2 PNG Export

- Draft UI 영역만 캡처
- padding 포함
- device frame 없음

---

## 11. Interaction Scope

### 허용

- Button click (단순 이벤트)
- Tabs / Accordion / Dialog (UI interaction)
- UI 라이브러리 기본 interaction

### 비허용

- useState
- API 호출
- async logic
- complex state management

---

## 12. Non-goals

- Full code editor 제공
- Arbitrary JavaScript 실행
- Backend/API 생성
- 기존 UI 자동 수정 (MVP 제외)

---

## 13. Future Vision

- 기존 UI 분석 및 수정 기능
- JSON DSL 기반 rendering
- Multi-page flow 생성
- Design system 자동 동기화
- Figma integration
- Multi-file code export
- Collaboration features

---

## 14. MVP Scope

포함:

- Chat-based UI generation
- Storybook registry 연동
- Layout system
- Live preview (overlay)
- Code export (single file)
- PNG export

제외:

- 기존 UI 수정
- complex interaction
- multi-file 구조
- external dependency 지원

---

## 15. Key Insight

DraftKit은 단순한 코드 생성 도구가 아니라,

> “Design System을 기반으로 UI를 조립하고 실시간으로 보여주는 AI Runtime”이다.

