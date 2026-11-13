# YesRain 응비제 웹 게임

## 프로젝트 개요

- NIVIS 응비제용 모바일 웹 게임 프로젝트임.
- 부품 수집 → 미션 확인 → 로봇 조립 → 파견 → 결과·코인 확인 흐름을 프로토타입으로 검증할 예정임.
- 상세 기획은 [PLAN.md](../PLAN.md) 참고.

## 현재 상태

- Git 및 공통 파일 설정 단계임.
- 현재 메인 게임 프로토타입 작업 위치는 `webGame-prototype/`임.
- 게임 코드와 실행 명령은 아직 없음.
- 프레임워크, 라이브러리, 빌드 및 배포 설정은 아직 없음.
- QR, 로그인, 실제 코인·인형 지급, 매점 결제는 후속 범위임.

## 시작 방법

- GitHub 저장소: [Loploy/YesRain-WebGame](https://github.com/Loploy/YesRain-WebGame)
- 새 작업 환경에서는 아래 명령으로 저장소를 가져옴.

```powershell
git clone https://github.com/Loploy/YesRain-WebGame.git yesrain-festival
cd yesrain-festival
```

- 현재 폴더에서는 다시 clone하지 않고 기존 폴더를 사용함.
- 게임 구현 전에 `PLAN.md`, `AGENTS.md`, `docs/todo.md`를 확인함.
- 프로토타입 실행 방법은 실제 코드와 개발 환경이 추가된 뒤 기록함.

## 폴더 구조

```text
yesrain-festival/
├── docs/
│   ├── README.md            # 프로젝트 안내 및 문서 목차
│   ├── todo.md              # 다음 작업과 완료 상태
│   └── devlog.md            # 개발 기록
├── webGame-prototype/       # 현재 메인 게임 프로토타입 작업 위치
│   └── .gitkeep             # 빈 작업 폴더 추적용 파일
├── balance-calculator/      # 기존 빈 폴더. 현재 작업 대상 아님
├── yesrain-web/             # 기존 빈 폴더. 현재 작업 대상 아님
├── PLAN.md                  # 기존 기획서
├── AGENTS.md                # 프로젝트 작업 규칙
├── .editorconfig            # 인코딩·들여쓰기 설정
├── .gitattributes           # Git 줄바꿈 및 바이너리 처리
└── .gitignore               # 로컬·생성 파일 추적 제외
```

- 여러 작업 영역이 있는 기존 구조를 유지함.
- 현재 프로토타입 코드는 루트 `src/` 대신 `webGame-prototype/`에 둘 예정임.
- `balance-calculator/`, `yesrain-web/`는 비어 있어 Git으로 추적되지 않음.
- 새 clone에서는 추적 중인 파일과 폴더만 생성됨.

## 공통 설정

- 텍스트 인코딩은 UTF-8 사용.
- 기본 들여쓰기는 공백 2칸 사용.
- 저장소 텍스트 줄바꿈은 LF 사용. Windows 명령 파일은 CRLF 사용.
- 의존성, 빌드 결과, 로그, 개인 IDE 설정, 로컬 환경 변수는 Git 추적에서 제외함.
- `.env.example`, `.env.*.example`에는 실제 인증 정보를 넣지 않음.

## Git 작업 방식

- 최초 기본 세팅은 `main`에 기준 커밋으로 기록함.
- 후속 구현은 최신 `main`에서 작업별 브랜치를 만들어 진행함.
- 프로토타입 구현 브랜치 이름은 `feat/game-prototype`을 후보로 둠.
- 실제 구현 시작 전 작업 범위와 브랜치를 확인함.
- 브라우저 및 모바일 실제 기능 확인은 사용자 테스트로 구분함.

## 문서 목차

- [기획서](../PLAN.md)
- [할 일](todo.md)
- [개발 로그](devlog.md)
- [프로젝트 작업 규칙](../AGENTS.md)
