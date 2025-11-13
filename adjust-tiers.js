const fs = require('fs');

let sql = fs.readFileSync('./database/seed.sql', 'utf-8');

// OVR 기준으로 등급 재설정
// 96+ -> LEGENDARY (최상위, 가장 희귀)
// 92-95 -> EPIC (상위)
// 85-91 -> RARE (중위)
// ~84 -> COMMON (하위, 가장 많음)

const lines = sql.split('\n');
const newLines = [];

for (let line of lines) {
  // VALUES 줄에서 OVR, TIER, PRICE 찾기
  const match = line.match(/\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+),\s*'(LEGENDARY|EPIC|RARE|COMMON)',\s*(\d+),/);

  if (match) {
    const playerName = match[1];
    const season = match[2];
    const region = match[3];
    const team = match[4];
    const position = match[5];
    const ovr = parseInt(match[6]);
    const oldTier = match[7];
    const oldPrice = match[8];

    let newTier = 'COMMON';
    let newPrice = 100;

    if (ovr >= 96) {
      newTier = 'LEGENDARY';
      newPrice = 1000;
    } else if (ovr >= 92) {
      newTier = 'EPIC';
      newPrice = 500;
    } else if (ovr >= 85) {
      newTier = 'RARE';
      newPrice = 300;
    } else {
      newTier = 'COMMON';
      newPrice = 100;
    }

    // 라인 교체
    line = line.replace(
      `${ovr}, '${oldTier}', ${oldPrice},`,
      `${ovr}, '${newTier}', ${newPrice},`
    );

    if (oldTier !== newTier) {
      console.log(`${playerName} (OVR ${ovr}): ${oldTier} -> ${newTier}`);
    }
  }

  newLines.push(line);
}

fs.writeFileSync('./database/seed.sql', newLines.join('\n'));
console.log('\n✅ 등급 조정 완료!');
