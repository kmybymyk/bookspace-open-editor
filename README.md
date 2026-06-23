# BookSpace Open Editor

[한국어](#한국어) | [English](#english)

## 한국어

BookSpace Open Editor는 BookSpace가 만드는 오픈소스 EPUB 웹 에디터입니다. 데스크톱 BookSpace의 구조 편집 흐름을 브라우저에서 가볍게 사용할 수 있도록 만든 React/Vite 기반 EPUB editor입니다.

브라우저 로컬 저장소에 프로젝트를 자동 저장하고, `.bksp` 프로젝트 파일 저장/불러오기, Markdown 가져오기, EPUB 가져오기, EPUB 내보내기를 지원합니다.

이 저장소는 EPUB 제작을 위한 BookSpace의 웹용 오픈 에디터를 다룹니다. BookSpace 데스크톱 앱 전체, `bookspace.work` 운영 인프라, 계정/결제/클라우드 저장소, 비공개 출판 워크플로우는 이 저장소의 공개 범위에 포함되지 않습니다.

### 주요 기능

- 앞부분/본문/뒷부분 구조 패널
- 페이지 종류 변경, 삭제, 드래그 재정렬
- TipTap 기반 본문 에디터
- 웹/문서 붙여넣기 HTML 정리
- 책 정보, 표지, 디자인 설정 패널
- 웹 버전 범위 안내와 앱 전환용 프로젝트 저장 CTA
- 에디터 사용 이벤트를 위한 Google Analytics 이벤트 훅
- 로컬 스냅샷 복원
- 브라우저 언어 기반 한국어/영어 UI와 수동 언어 전환
- 모바일 폭에서 에디터 우선 배치와 가로 overflow 방지
- `.bksp` 프로젝트 저장/불러오기
- Markdown 가져오기
- EPUB 가져오기
- EPUB 3 패키지 생성
- EPUB 구조 검증 테스트
- 재배포 가능한 Gowun Batang, Gowun Dodum, Noto Serif KR, Noto Sans KR 웹폰트 포함

### 오픈소스 범위

이 저장소에 포함되는 것:

- 웹 에디터 UI와 상호작용 코드
- EPUB export와 validation 로직
- `.bksp` 프로젝트 저장/불러오기 포맷
- Markdown import
- EPUB import
- 브라우저 로컬 저장소와 스냅샷 처리
- 에디터 전용 SEO/analytics 코드
- 문서와 QA 체크리스트

이 저장소에 포함되지 않는 것:

- BookSpace 데스크톱 앱 내부 구현
- `bookspace.work` 루트 랜딩 사이트와 운영 인프라
- 계정, 결제, 클라우드 동기화 시스템
- 비공개 또는 미공개 출판 워크플로우

### 로컬 실행

```sh
npm install
npm run dev
```

기본 개발 서버는 Vite가 제공하는 localhost URL을 사용합니다.

### 스크립트

- `npm run dev`: 개발 서버 실행
- `npm run test`: Vitest 테스트 실행
- `npm run build`: TypeScript 검사와 production build 실행
- `npm run qa`: 테스트와 production build 실행
- `npm run preview`: production build 로컬 서빙

### QA

```sh
npm run qa
```

`npm run qa`는 단위/통합 테스트와 production build를 모두 실행합니다.

추가 릴리스 전 확인:

```sh
npm audit --audit-level=moderate
npm run preview -- --host 127.0.0.1 --port 4173
```

브라우저 smoke:

- 새 챕터 생성
- 본문 편집
- 페이지 종류 변경
- 프로젝트 저장
- EPUB 가져오기
- EPUB 생성
- 웹 버전 범위 안내와 EPUB import 변환 리포트 확인
- 모바일 폭에서 가로 overflow 없음
- 콘솔 에러 없음

### 배포

정적 Vite 앱이지만 이 저장소를 `bookspace.work` 루트에 직접 배포하지 않습니다.
운영 환경에서는 `bookspace_web` 랜딩 프로젝트가 루트 도메인을 소유하고, 이 에디터의 빌드 결과를 `/editor/`와 `/en/editor/` 경로에 임베드합니다.

`npm run build`는 `dist/index.html`과 함께 `dist/editor/index.html`, `dist/en/editor/index.html` SPA 진입점 사본을 생성합니다.
자세한 절차와 금지 사항은 [Deployment](docs/deployment.md)를 따르세요.

배포 전 확인 항목:

- `bookspace.work` 루트가 기존 랜딩 페이지로 유지됨
- `/editor/`, `/en/editor/`가 에디터를 제공함
- 새 챕터 생성
- 본문 편집과 붙여넣기 정리
- 프로젝트 저장/불러오기
- EPUB 가져오기
- EPUB 생성
- EPUB package validation 테스트 통과

### 문서

- [Architecture](docs/architecture.md)
- [QA Checklist](docs/qa.md)
- [Deployment](docs/deployment.md)
- [EPUB Import](docs/epub-import.md)
- [EPUB Export](docs/epub-export.md)
- [Project Format](docs/project-format.md)
- [Open Source Documentation Scope](docs/open-source-docs.md)

### 로드맵

- 외부 validator와 reader 기준 EPUB 호환성 개선
- 웹 에디터 흐름을 유지하면서 에디터 formatting controls 확장
- import/export regression fixture 보강
- 키보드 내비게이션과 접근성 개선
- 외부 기여자가 다루기 쉬운 import/export fixture 보강

### 기여

웹용 오픈 에디터 범위의 기여를 환영합니다. [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)를 참고하세요.

### 라이선스

BookSpace Open Editor는 Apache License 2.0으로 배포됩니다. [LICENSE](LICENSE)와 [NOTICE](NOTICE)를 참고하세요.

포함된 웹폰트:

- Gowun Batang: OFL license, see `public/licenses/gowun-batang-OFL.txt`
- Gowun Dodum: OFL license, see `public/licenses/gowun-dodum-OFL.txt`
- Noto Serif KR: OFL license, see `public/licenses/noto-serif-kr-OFL.txt`
- Noto Sans KR: OFL license, see `public/licenses/noto-sans-kr-OFL.txt`

## English

BookSpace Open Editor is an open-source EPUB web editor by BookSpace. It is a React/Vite EPUB editor that brings the structural editing flow of the desktop BookSpace app to a lightweight browser-based workspace.

Projects are autosaved in browser local storage. The editor supports `.bksp` project save/load, Markdown import, EPUB import, and EPUB export.

This repository covers the open web EPUB editor for BookSpace. It does not include the full BookSpace desktop app, `bookspace.work` service infrastructure, accounts, payments, cloud storage, or private publishing workflows.

### Features

- Front matter/body/back matter structure panel
- Page type changes, deletion, and drag reordering
- TipTap-based body editor
- Cleaned HTML paste from web and document sources
- Book metadata, cover, and design settings panels
- Web-version scope guidance and project-file CTA for app handoff
- Google Analytics event hooks for editor usage events
- Local snapshot restore
- Browser-language Korean/English UI with manual language switching
- Editor-first mobile layout with horizontal overflow checks
- `.bksp` project save/load
- Markdown import
- EPUB import
- EPUB 3 package generation
- EPUB structure validation tests
- Redistributable Gowun Batang, Gowun Dodum, Noto Serif KR, and Noto Sans KR webfonts

### Open Source Scope

This repository includes:

- Web editor UI and interaction code
- EPUB export and validation logic
- `.bksp` project save/load format
- Markdown import
- EPUB import
- Local browser storage and snapshot handling
- Editor-specific SEO and analytics code
- Documentation and QA checklist

This repository does not include:

- BookSpace desktop app internals
- The `bookspace.work` root landing site or hosted service infrastructure
- Account, payment, or cloud sync systems
- Proprietary or unreleased publishing workflows

### Local Development

```sh
npm install
npm run dev
```

The development server uses the localhost URL provided by Vite.

### Scripts

- `npm run dev`: run the development server
- `npm run test`: run the Vitest test suite
- `npm run build`: run TypeScript checks and the production build
- `npm run qa`: run tests and the production build
- `npm run preview`: serve the production build locally

### QA

```sh
npm run qa
```

`npm run qa` runs unit/integration tests and the production build.

Additional release checks:

```sh
npm audit --audit-level=moderate
npm run preview -- --host 127.0.0.1 --port 4173
```

Browser smoke checks:

- Create a new chapter
- Edit body content
- Change page type
- Save project
- Import EPUB
- Generate EPUB
- Check the web-version scope guidance and EPUB import conversion report
- No horizontal overflow on mobile width
- No console errors

### Deploy

This is a static Vite app, but this repository must not be deployed directly to the `bookspace.work` root.
In production, the `bookspace_web` landing project owns the root domain and embeds this editor build under `/editor/` and `/en/editor/`.

`npm run build` creates `dist/index.html` plus SPA entry copies at `dist/editor/index.html` and `dist/en/editor/index.html`.
Follow [Deployment](docs/deployment.md) for the exact production flow and guardrails.

Pre-deploy checks:

- `bookspace.work` root still serves the existing landing page
- `/editor/` and `/en/editor/` serve the editor
- Create a new chapter
- Edit body content and verify paste cleanup
- Save/load project
- Import EPUB
- Generate EPUB
- EPUB package validation tests pass

### Documentation

- [Architecture](docs/architecture.md)
- [QA Checklist](docs/qa.md)
- [Deployment](docs/deployment.md)
- [EPUB Import](docs/epub-import.md)
- [EPUB Export](docs/epub-export.md)
- [Project Format](docs/project-format.md)
- [Open Source Documentation Scope](docs/open-source-docs.md)

### Roadmap

- Improve EPUB compatibility with external validators and readers
- Expand editor formatting controls while keeping the web editor workflow simple
- Add stronger import/export regression fixtures
- Improve keyboard navigation and accessibility
- Add stronger import/export fixtures for external contributors

### Contributing

Contributions are welcome within the open web editor scope. See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

### License

BookSpace Open Editor is licensed under the Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

Included webfonts:

- Gowun Batang: OFL license, see `public/licenses/gowun-batang-OFL.txt`
- Gowun Dodum: OFL license, see `public/licenses/gowun-dodum-OFL.txt`
- Noto Serif KR: OFL license, see `public/licenses/noto-serif-kr-OFL.txt`
- Noto Sans KR: OFL license, see `public/licenses/noto-sans-kr-OFL.txt`
