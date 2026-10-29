# 제주 지금 날씨

기상청 **초단기실황**(`getUltraSrtNcst`) API로 제주시·서귀포·성산의 현재 날씨를 보여줘요.

```
{End Point}/{오퍼레이션}?serviceKey={인증키}&pageNo=1&numOfRows=10&dataType=JSON&base_date=...&base_time=...&nx=..&ny=..
```

## 구조
- `index.html` — 화면 (지역 버튼 → `/api/weather` 호출)
- `api/weather.js` — Vercel 서버리스 함수. 인증키를 숨긴 채 기상청을 대신 호출 (GET)

## 환경변수 1개
| 이름 | 값 |
|---|---|
| `DATA_GO_KR_KEY` | 공공데이터포털 → 마이페이지 → 해당 API의 **일반 인증키** (인코딩/디코딩 어느 쪽이든 OK) |

> ⚠️ 인증키를 `index.html` 이나 GitHub 에 직접 쓰지 마세요. 브라우저에서 보이면 누구나 가져갈 수 있어요.

## 배포
1. GitHub 저장소에 올리기
2. Vercel → Add New Project → Import → Environment Variables 에 `DATA_GO_KR_KEY` 추가 → Deploy
3. 공공데이터포털에서 "기상청_단기예보 조회서비스" **활용 신청**이 승인돼 있어야 해요 (승인 직후엔 몇 분~1시간 걸릴 수 있어요).

## 참고
- 실황은 매시 정각 자료가 약 40분 뒤에 올라와서, 함수가 40분 이전이면 한 시간 전 자료를 요청해요.
- PTY(강수형태): 0 없음, 1 비, 2 비/눈, 3 눈, 5 빗방울, 6 빗방울/눈날림, 7 눈날림.
