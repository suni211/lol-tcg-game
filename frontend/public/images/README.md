# LOL TCG Game - 이미지 폴더 구조

이 폴더에는 게임에 사용되는 모든 이미지 파일이 저장됩니다.

## 폴더 구조

```
images/
├── teams/          # 팀 로고 이미지
│   ├── t1.svg
│   ├── geng.svg
│   ├── hle.svg
│   ├── kt.svg
│   ├── dk.svg
│   ├── ns.svg
│   ├── bro.svg
│   ├── drx.svg
│   └── dnf.svg
│
└── cards/          # 선수 카드 이미지
    ├── default_player.svg       # 기본 플레이어 이미지
    ├── position_top.svg         # TOP 포지션 기본 이미지
    ├── position_jungle.svg      # JUNGLE 포지션 기본 이미지
    ├── position_mid.svg         # MID 포지션 기본 이미지
    ├── position_adc.svg         # ADC 포지션 기본 이미지
    ├── position_support.svg     # SUPPORT 포지션 기본 이미지
    │
    └── [선수별 이미지]
        ├── faker_25.jpg
        ├── zeus_25.jpg
        ├── oner_25.jpg
        └── ... (더 많은 선수 이미지)
```

## 이미지 추가 방법

### 1. 팀 로고 추가
팀 로고는 `teams/` 폴더에 추가하세요:
- 파일명: 팀 약자 소문자 (예: `t1.svg`, `geng.svg`)
- 권장 크기: 200x200 pixels
- 권장 형식: SVG (투명 배경) 또는 PNG

### 2. 선수 카드 이미지 추가
선수 카드 이미지는 `cards/` 폴더에 추가하세요:
- 파일명 형식: `[선수명]_[시즌].jpg` (예: `faker_25.jpg`)
- 권장 크기: 300x400 pixels (3:4 비율)
- 권장 형식: JPG 또는 PNG
- 배경: 팀 컬러나 그라데이션 배경 추천

### 3. 이미지 파일 이름 규칙
- 모두 **소문자** 사용
- 공백 대신 **언더스코어(_)** 사용
- 특수문자 제외
- 예시:
  - ✅ `faker_25.jpg`
  - ✅ `gumayusi_25.jpg`
  - ✅ `brokenblade_25.jpg`
  - ❌ `Faker 25.jpg`
  - ❌ `GumaYusi-25.jpg`

## 이미지 최적화 팁

1. **파일 크기**: 각 이미지는 200KB 이하로 유지
2. **해상도**: 선명하지만 너무 크지 않게 (최대 500x667)
3. **형식**:
   - 사진: JPEG (품질 80-90%)
   - 로고/아이콘: SVG 또는 PNG (투명 배경)
4. **배경**:
   - 선수 사진은 팀 컬러 그라데이션 배경 추천
   - 로고는 투명 배경 권장

## 기본 이미지

선수 이미지가 없을 경우 자동으로 표시되는 기본 이미지:
- `default_player.svg` - 일반 플레이어 실루엣
- `position_[포지션].svg` - 각 포지션별 아이콘

## 데이터베이스 이미지 경로 업데이트

선수 이미지를 추가한 후, `database/seed.sql` 파일에서 해당 선수의 `image_url`을 업데이트하세요:

```sql
-- 예시
('Faker', '25 LCK', 'LCK', 'T1', 'MID', 97, 'LEGENDARY', 1000, 30, 40, 99, 35, 35, 98, 96, 97, '/images/cards/faker_25.jpg'),
```

## 예시 이미지 만들기

### Figma/Photoshop으로 선수 카드 만들기:
1. 캔버스 크기: 300x400px
2. 배경: 팀 컬러 그라데이션
3. 선수 사진: 중앙 배치
4. 여백: 상하좌우 20px
5. 내보내기: JPG (품질 85%)

### 온라인 도구:
- [Canva](https://canva.com) - 무료 디자인 도구
- [Figma](https://figma.com) - 무료 UI 디자인 도구
- [GIMP](https://gimp.org) - 무료 포토샵 대체

## 라이선스

선수 사진 및 팀 로고는 저작권을 확인하고 사용하세요.
- 공식 라이엇 게임즈 이미지
- 팀 공식 이미지
- 라이선스가 있는 이미지만 사용
