# 개발 로그

## 2026-11-13

### 저장소 기본 세팅

**문제 / 목표**

- 사용자가 지정한 `Loploy/YesRain-WebGame` 저장소와 로컬 작업 폴더 연결.
- 메인 게임 프로토타입 작업 위치를 `webGame-prototype/`으로 지정.
- 게임 구현 전 Git과 공통 파일 설정 준비.

**원인 파악**

- 작업 시작 당시 로컬 Git 저장소가 없었음.
- GitHub Git refs 조회에서 빈 저장소 응답 확인.
- 로컬에는 `PLAN.md`와 빈 폴더 3개만 있었음.
- 기존 기획서는 현재 프로토타입 작업 위치를 `yesrain-web`으로 안내하고 있었음.

**해결 / 구현**

- Git 초기화, 지정한 `origin` 연결, `main` 최초 커밋·push 범위를 사용자 승인받음.
- `main` Git 저장소 초기화 및 지정한 `origin` 연결 완료.
- `.gitignore`, `.gitattributes`, `.editorconfig` 추가.
- 프로젝트별 작업 위치와 현재 개발 상태를 `AGENTS.md`에 기록.
- 프로젝트 안내, TODO, 개발 로그 추가.
- 기존 `PLAN.md`의 현재 프로토타입 작업 위치 수정.
- `webGame-prototype/.gitkeep`으로 빈 작업 위치를 Git에서 추적하도록 준비.
- 기존 폴더와 다운로드 폴더의 기획서 원본은 이동·삭제하지 않음.
- 게임 코드, 라이브러리, 배포 설정은 이번 범위에서 제외함.

**확인**

- Git `2.53.0.windows.1`, Node.js `v22.14.0`, npm `10.9.2` 설치 확인.
- `python -X utf8 -`로 파일 9개, UTF-8, 신규 파일 LF, EditorConfig 형식, 문서 내부 링크 점검 통과.
- 다운로드 폴더 원본과 비교하여 `PLAN.md`의 작업 위치 두 줄만 변경됨을 확인.
- `git check-ignore`로 의존성·빌드 결과·환경 변수·개인 IDE 설정 제외 확인.
- `.env.example`, `.env.development.example` 추적 가능 확인.
- `git check-attr`로 일반 텍스트 LF와 Windows 명령 파일 CRLF 속성 확인.
- 기존 `balance-calculator/`, `yesrain-web/`가 빈 폴더로 유지됨을 확인.
- 실제 게임 코드가 없어 빌드·게임 기능·브라우저 테스트는 실행하지 않음.

**원격 반영**

- 최초 커밋 `511e2f3` 생성. 메시지는 `chore: YesRain 프로젝트 기본 세팅`임.
- 첫 push는 GitHub 비공개 이메일 보호 오류 `GH007`로 거절됨.
- 사용자의 재시도 요청 후 기존 커밋으로 `git push -u origin main` 성공.
- 이메일 설정 변경과 커밋 재작성 없이 원격 반영 완료.
- `git ls-remote origin refs/heads/main`으로 원격 `main`과 로컬 최초 커밋 해시 일치 확인.
- `main`의 upstream이 `origin/main`으로 설정됨.
