# BookSpace Open Editor

BookSpace Lite 웹 에디터입니다. 데스크톱 BookSpace의 구조 편집 흐름을 웹에서 가볍게 사용할 수 있도록 만든 React/Vite 앱입니다.

브라우저 로컬 저장소에 프로젝트를 자동 저장하고, `.bksp` 프로젝트 파일과 EPUB 파일을 내보냅니다.

## Features

- 앞부분/본문/뒷부분 구조 패널
- 페이지 종류 변경, 삭제, 드래그 재정렬
- TipTap 기반 본문 에디터
- 웹/문서 붙여넣기 HTML 정리
- 책 정보, 표지, 디자인 설정 패널
- 로컬 스냅샷 복원
- `.bksp` 프로젝트 저장/불러오기
- Markdown 가져오기
- EPUB 3 패키지 생성
- EPUB 구조 검증 테스트
- 재배포 가능한 Gowun Batang, Gowun Dodum 웹폰트 포함

## Local

```sh
npm install
npm run dev
```

기본 개발 서버는 Vite가 제공하는 localhost URL을 사용합니다.

## Scripts

- `npm run dev`: development server
- `npm run test`: Vitest test suite
- `npm run build`: TypeScript check and production build
- `npm run qa`: test and production build
- `npm run preview`: serve the production build locally

## QA

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
- EPUB 생성
- 모바일 폭에서 가로 overflow 없음
- 콘솔 에러 없음

## Deploy

정적 Vite 앱이므로 `npm run build` 후 생성되는 `dist/`를 `bookspace.work`에 배포합니다.

배포 전 확인 항목:

- 새 챕터 생성
- 본문 편집과 붙여넣기 정리
- 프로젝트 저장/불러오기
- EPUB 생성
- EPUB package validation 테스트 통과

## Documentation

- [Architecture](docs/architecture.md)
- [QA Checklist](docs/qa.md)
- [Deployment](docs/deployment.md)
- [EPUB Export](docs/epub-export.md)

## License Notes

Included webfonts:

- Gowun Batang: OFL license, see `public/licenses/gowun-batang-OFL.txt`
- Gowun Dodum: OFL license, see `public/licenses/gowun-dodum-OFL.txt`
