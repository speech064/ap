// Vercel 서버리스 함수: 기상청 초단기실황(getUltraSrtNcst) 프록시. 인증키는 서버 환경변수에만 둬요.
const ENDPOINT = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';

// 한국 시간 기준 base_date/base_time. 실황은 매시 정각 자료가 40분 이후에 올라와요.
function baseTime(now = new Date()) {
  const kst = new Date(now.getTime() + 9 * 3600 * 1000);
  if (kst.getUTCMinutes() < 40) kst.setUTCHours(kst.getUTCHours() - 1);
  const p = n => String(n).padStart(2, '0');
  return {
    date: `${kst.getUTCFullYear()}${p(kst.getUTCMonth() + 1)}${p(kst.getUTCDate())}`,
    time: `${p(kst.getUTCHours())}00`
  };
}

export default async function handler(req, res) {
  const raw = process.env.DATA_GO_KR_KEY;
  if (!raw) return res.status(500).json({ error: 'DATA_GO_KR_KEY 환경변수가 없어요.' });
  const nx = parseInt(req.query.nx, 10), ny = parseInt(req.query.ny, 10);
  if (!Number.isInteger(nx) || !Number.isInteger(ny)) return res.status(400).json({ error: 'nx, ny 가 필요해요.' });

  // 인코딩된 키(%2B 등)를 붙여 넣어도, 디코딩된 키를 넣어도 한 번만 인코딩되게 맞춰요.
  let key = raw.trim();
  try { if (/%[0-9A-Fa-f]{2}/.test(key)) key = decodeURIComponent(key); } catch { /* 그대로 사용 */ }

  const { date, time } = baseTime();
  const url = `${ENDPOINT}?serviceKey=${encodeURIComponent(key)}&pageNo=1&numOfRows=10&dataType=JSON` +
    `&base_date=${date}&base_time=${time}&nx=${nx}&ny=${ny}`;
  try {
    const r = await fetch(url);
    const text = await r.text();
    let j; try { j = JSON.parse(text); } catch { return res.status(502).json({ error: '기상청 응답을 읽지 못했어요.', detail: text.slice(0, 200) }); }
    const head = j.response?.header;
    if (!head || head.resultCode !== '00') return res.status(502).json({ error: head?.resultMsg || '기상청 오류', code: head?.resultCode });
    const items = j.response.body?.items?.item || [];
    const v = {}; items.forEach(i => { v[i.category] = i.obsrValue; });
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300');
    res.status(200).json({ base: { date, time }, values: v });
  } catch (e) {
    res.status(502).json({ error: '기상청에 연결하지 못했어요.' });
  }
}
