# Baggu | Portfolio

게임 개발 / AI / 소프트웨어 개발 프로젝트를 정리하는 정적 포트폴리오입니다. HTML, CSS, JavaScript만 사용하며 npm 설치, 빌드 과정, 백엔드, 외부 폰트/CDN이 필요하지 않습니다.

사이트 UI, 이미지 설명, 접근성 문구는 모두 영어입니다. 기존 다크 테마와 연두색 포인트, 카드·상세보기 구조를 유지합니다. 프로젝트는 Purrfect Parcel, ParcelKnight, Animal Rider, WeatherTwin 순서로 등록되어 있으며, 제공된 실제 작업 내용을 바탕으로 작성했습니다. 개발 기간과 제공되지 않은 링크는 표시하지 않습니다.

## 로컬 실행

가장 간단한 방법은 `index.html`을 브라우저에서 여는 것입니다. `fetch()`나 ES module을 사용하지 않아 더블클릭으로도 카드, 필터, 상세보기가 작동합니다.

HTTP 환경에서 확인하려면 Python이 있는 환경에서 다음 명령을 사용합니다.

```powershell
cd D:\WebProject\Portfolio
py -m http.server 8000 --bind 127.0.0.1
```

브라우저에서 <http://127.0.0.1:8000>을 엽니다. 종료는 터미널에서 `Ctrl+C`입니다. 이 서버는 개발용이며 배포에는 필요하지 않습니다.

## 폴더 구조

```text
/
├─ index.html                 # Hero / About / Projects / Skills / Contact
├─ css/
│  └─ style.css               # 테마, 레이아웃, 반응형, 접근성
├─ js/
│  ├─ config.js               # 프로필 이미지, 자기소개, 기술, 연락처
│  ├─ projects.js             # 모든 프로젝트 데이터
│  └─ main.js                 # 카드, 복수 카테고리 필터, 상세보기, 갤러리, 확대보기
├─ assets/
│  ├─ profile/
│  │  ├─ profile.webp         # 교체할 기본 프로필 이미지
│  │  └─ placeholder.svg      # 프로필 누락/오류 시 대체 이미지
│  ├─ projects/
│  │  ├─ purrfect-parcel/     # 01.webp, 02.webp, ...
│  │  ├─ parcelknight/        # 01.webp, 02.webp, ...
│  │  ├─ animal-rider/        # 01.webp, 02.webp, ...
│  │  └─ weathertwin/         # 01.webp, 02.webp, ...
│  ├─ images/                 # 기존 Hero 일러스트 및 SVG fallback
│  ├─ gifs/                   # 직접 추가할 GIF
│  └─ icons/                  # favicon
├─ .gitignore
├─ .nojekyll                  # Jekyll 처리 없이 정적 파일 제공
└─ README.md
```

## 자기소개, Skills, Contact 수정

`js/config.js`에서 `profileImage`, `about`, `focuses`, `skillGroups`, `github`, `discord`, `email`을 수정합니다. 연락처는 `tom44024402@gmail.com`, GitHub, Discord이며 외부 링크는 새 탭에서 열립니다. 메일 링크는 `mailto:tom44024402@gmail.com`입니다.

프로필 사진은 **`D:\WebProject\Portfolio\assets\profile\profile.webp`**를 자신의 사진으로 교체하세요. 현재 파일은 사람이 아닌 일반 아바타 아이콘입니다. PNG/JPG를 사용할 때에는 `config.js`의 `profileImage`를 `./assets/profile/profile.png`처럼 변경하면 됩니다. 44px 원형 프레임 안에서 `object-fit: cover`를 적용하고, 클릭하면 페이지 최상단으로 이동합니다. 경로가 없거나 이미지가 손상되어도 SVG 아바타로 대체합니다.

Hero 이름과 역할, 페이지 제목·설명은 `index.html`에 있습니다. 색상은 `css/style.css` 맨 위의 CSS 변수에서 변경할 수 있습니다. 기본 시스템 폰트를 사용하므로 외부 폰트 요청이 없습니다.

## 프로젝트 추가

모든 프로젝트 데이터는 **`D:\WebProject\Portfolio\js\projects.js`**의 `window.PORTFOLIO_PROJECTS` 배열에서 관리합니다. 카테고리는 `categories` 배열이며 한 프로젝트가 여러 필터에 포함될 수 있습니다. 기본 필터는 **All / Unity / Unreal Engine / Digital Twin**입니다. Unity는 Purrfect Parcel과 WeatherTwin, Unreal Engine은 ParcelKnight와 Animal Rider, Digital Twin은 WeatherTwin을 표시합니다.

다음은 현재 등록된 프로젝트를 기준으로 한 데이터 형식입니다. 추가 이미지는 배열에 직접 등록합니다.

```javascript
{
  id: "purrfect-parcel",
  title: "Purrfect Parcel",
  categories: ["Unity"],
  type: "Mobile Game",
  role: "Full Development & Release",
  description: "A mobile game developed with Unity. I handled the project from development through release on Android and iOS.",
  period: "",                              // 실제 기간을 알 때만 입력
  technologies: ["Unity", "C#", "Mobile", "Android", "iOS"],
  images: [
    "./assets/projects/purrfect-parcel/01.webp",
    "./assets/projects/purrfect-parcel/02.webp",
    "./assets/projects/purrfect-parcel/03.jpg"
  ],
  imageAlts: [
    "Purrfect Parcel gameplay screenshot",
    "Purrfect Parcel mobile gameplay",
    "Purrfect Parcel game screen"
  ],
  gif: "",                                // 선택: 클릭 시 로드할 GIF 경로
  technicalChallenges: [
    "Handled the game development process from implementation to mobile release."
  ],
  links: {
    github: "", video: "", demo: "", download: "", store: ""
  }
}
```

객체 사이에는 쉼표를 넣습니다. 문자열 안에서 큰따옴표는 `\"`로 작성합니다. 배열의 순서가 카드 순서입니다. HTML을 수정하지 않아도 카드, 분야 필터, 프로젝트 개수, 상세보기 모달이 갱신됩니다. `technicalChallenges`는 설명 배열이고 HTML 태그를 실행하지 않는 일반 텍스트입니다. 작성하는 UI 텍스트와 `imageAlts`는 영어를 사용하세요.

빈 링크는 버튼을 만들지 않습니다. 잘못된 URL이나 `javascript:` 등의 실행 가능한 URL도 링크로 만들지 않습니다. `links.video`는 **Watch Video** 버튼입니다. ParcelKnight에는 제공된 YouTube 링크, WeatherTwin에는 제공된 GitHub 링크만 등록했습니다. 다른 프로젝트의 저장소나 스토어 URL을 임의로 만들지 않았습니다.

배열을 `[]`로 비우면 영어 빈 상태 안내가 나타납니다. 새로운 카테고리는 `categories`에 넣으면 필터에 추가됩니다. 기본 필터 순서는 `main.js`의 `filterCategories`에 있습니다.

## 이미지 / GIF 추가

1. 아래 프로젝트별 폴더의 **`01.webp`를 실제 대표 이미지로 교체**합니다. 현재는 실제 게임 화면이 아닌 이미지 준비 중 일러스트입니다.
2. 추가 이미지는 같은 폴더에 `02.webp`, `03.webp` 등의 이름으로 넣습니다.
3. `js/projects.js`에서 해당 프로젝트의 `images` 배열에 추가 파일의 **index.html 기준 상대 경로**를 순서대로 등록합니다.
4. `imageAlts`에 같은 순서로 각 이미지의 내용을 영어로 설명합니다. `gif`는 선택 사항이며 기존 `assets/gifs/` 또는 프로젝트별 폴더의 경로를 사용할 수 있습니다.

**`images[0]`이 항상 카드와 상세보기의 대표 이미지**입니다. 두 번째 항목부터 `images.slice(1)`을 상세 설명·기술·링크가 모두 끝난 뒤 **Project Gallery**에 표시합니다. 한 장만 등록하면 갤러리를 만들지 않습니다. 파일 이름 자체를 자동 검색하지 않으므로 `02` 파일을 복사한 뒤 배열에도 등록해야 합니다. PNG/JPG/WebP 등 확장자를 바꿀 때에는 배열 경로도 일치시켜 주세요.

바로 파일을 넣을 위치 (루트: `D:\WebProject\Portfolio`):

```text
Profile
assets/profile/profile.webp

Purrfect Parcel
assets/projects/purrfect-parcel/01.webp
assets/projects/purrfect-parcel/02.webp
...

ParcelKnight
assets/projects/parcelknight/01.webp
assets/projects/parcelknight/02.webp
...

Animal Rider
assets/projects/animal-rider/01.webp
assets/projects/animal-rider/02.webp
...

WeatherTwin
assets/projects/weathertwin/01.webp
assets/projects/weathertwin/02.webp
...
```

권장 사항:

- 대표 이미지는 WebP/AVIF/JPEG를 사용하고, 원본을 적절한 해상도로 줄여 저장하세요. 카드용은 대략 가로 800–1200px, 파일 크기 100–300KB 수준을 목표로 하면 좋습니다. 자동 압축 기능은 없습니다.
- 미리보기는 16:10 비율입니다. 카드에는 `object-fit: cover`를 적용하므로 원본 비율은 유지하되 가장자리가 잘릴 수 있습니다. 상세보기는 `object-fit: contain`으로 전체 이미지를 보여 줍니다.
- `images`가 비었거나 대표 이미지 경로가 잘못되면 로컬 SVG와 영어 준비 중 표시가 나옵니다. 갤러리의 잘못된 이미지도 대체하며 확대 버튼을 비활성화합니다. 레이아웃 크기는 유지됩니다.
- 카드는 `loading="lazy"`, `decoding="async"`, 고정 미디어 비율로 로딩 부담과 화면 이동을 줄입니다.
- GIF는 자동으로 받거나 재생하지 않습니다. **Play GIF** 버튼을 눌러야 로드하고, **Pause GIF**로 정적 이미지로 돌아갑니다. 짧고 적절한 해상도의 GIF를 사용하세요. 상세보기를 닫으면 모달의 GIF도 제거됩니다.
- 갤러리는 PC·태블릿 2열, 모바일 1열입니다. 클릭하면 기본 dialog를 사용하는 확대보기가 열립니다. `Escape`로 확대보기를 닫으면 원래 갤러리 버튼으로 돌아가며, 다시 `Escape`를 누르면 프로젝트 상세보기를 닫습니다.
- 파일명은 소문자 영문, 숫자, 하이픈을 권장합니다. GitHub Pages는 대소문자를 구분합니다. `Preview.webp`와 `preview.webp`는 다릅니다.
- `C:\...` 또는 `/assets/...` 같은 경로 대신 `./assets/...`를 사용하세요. 프로젝트 사이트의 하위 경로에서도 작동합니다.

## GitHub 저장소와 목표 주소

현재 연결할 저장소는 요청한 `https://github.com/baggu4402/baggu4402.git`이고, 로컬 브랜치는 `main`입니다.

**저장소 이름과 목표 주소에 차이가 있습니다.**

| 저장소 | GitHub Pages 기본 주소 |
| --- | --- |
| `baggu4402/baggu4402` | `https://baggu4402.github.io/baggu4402/` |
| `baggu4402/baggu4402.github.io` | `https://baggu4402.github.io/` |

최종 목표인 루트 주소를 사용하려면 나중에 GitHub에서 `baggu4402.github.io` 저장소를 만들거나 현재 저장소 이름을 변경해야 합니다. 이번 작업에서는 원격 저장소를 변경하거나 새로 생성하지 않습니다. 저장소를 변경하기로 결정한 뒤에는 로컬 origin도 일치시킵니다.

```powershell
# 목표 주소용 저장소를 준비하고 변경을 결정한 뒤에만 실행
git remote set-url origin https://github.com/baggu4402/baggu4402.github.io.git
```

근거: [GitHub 공식 문서 — 사용자 사이트는 <user>.github.io 저장소 이름 사용](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## GitHub Pages 배포

작업물 확인 후 직접 커밋·푸시할 때:

```powershell
git status --short --branch
git diff
git add index.html css js assets .gitignore .nojekyll README.md
git diff --cached
git commit -m "Create developer portfolio"
git push -u origin main
```

초기 파일들은 untracked 상태이므로 `git diff`에는 나타나지 않습니다. 파일을 열어 확인하거나 `git add` 후 `git diff --cached`로 확인하세요. **이번 제작 작업에서는 add, commit, push를 실행하지 않습니다.** 원격에 다른 변경이 생겼다면 상태를 확인하고 먼저 조정하세요.

푸시한 뒤 GitHub 저장소에서:

1. **Settings → Pages**를 엽니다.
2. **Build and deployment → Source**에서 **Deploy from a branch**를 선택합니다.
3. 브랜치를 **main**, 폴더를 **/(root)**로 선택하고 저장합니다.
4. 배포가 끝나면 Pages에서 표시하는 주소로 접속합니다.

빌드 서버나 별도 Actions 파일을 추가할 필요가 없습니다. `index.html`은 루트에 있고 `.nojekyll`을 포함합니다. [GitHub 공식 배포 설정 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## 화면과 동작 확인

- PC, 태블릿, 모바일 너비에서 수평 스크롤과 카드 레이아웃을 확인합니다.
- 브라우저 개발자 도구의 Console / Network에서 오류와 404를 확인합니다.
- 모든 분야 필터, 상세보기, 닫기 버튼, `Escape`, 키보드 포커스를 확인합니다.
- 모바일 메뉴를 열고 각 섹션으로 이동하는지 확인합니다.
- 실제 이미지/GIF를 추가한 뒤 재생·정지와 경로를 다시 확인합니다.
- 실제 배포 후 HTTPS 주소에서 한 번 더 확인합니다. 로컬 검증과 실제 Pages 배포 검증은 별개입니다.

접근성을 위해 건너뛰기 링크, 키보드 포커스, 필터 상태, 기본 dialog의 포커스 제한, 감소된 모션 설정을 지원합니다.

## 제작 시 검증 결과 (2026-09-30)

Microsoft Edge(Chromium) 로컬 검증 **25개 항목이 모두 통과**했습니다. 결과는 `.local/verification-baggu.json`에 있습니다. Baggu 브랜딩·영어 UI·연락처·지정 링크, 정확히 네 프로젝트와 복수 카테고리, 375 / 768 / 1024 / 1440px 레이아웃, 대표 이미지·하단 갤러리·확대보기의 키보드 접근성, 이미지 누락 처리, `file://` 직접 열기와 `/baggu4402/` 하위 경로를 확인했습니다. 기본 화면의 콘솔·실행 오류, 실패 요청, HTTP 오류는 모두 0건입니다. 실제 스크린샷이 아직 없으므로 추가 이미지와 실패 경로는 별도 임시 검증 데이터로 확인했으며 프로젝트 데이터에는 남기지 않았습니다.

검증 스크립트·화면 캡처·결과 JSON은 Git에서 제외한 로컬 `.local/`에 있습니다. 커밋·푸시·실제 GitHub Pages 배포는 수행하지 않았으므로 원격 배포 화면은 아직 검증하지 않았습니다.
