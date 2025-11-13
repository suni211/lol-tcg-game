const fs = require('fs');

let sql = fs.readFileSync('./database/seed.sql', 'utf-8');

// 전체 OVR을 낮추고 등급 재설정
// 새로운 등급 기준 (COMMON > RARE > EPIC > LEGENDARY):
// LEGENDARY: 85+ (최상위, 가장 희귀)
// EPIC: 80-84 (상위)
// RARE: 73-79 (중위)
// COMMON: ~72 (하위, 가장 많음)

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
    const oldOvr = parseInt(match[6]);
    const oldTier = match[7];
    const oldPrice = match[8];

    // OVR 하향 조정 (약 10-15 낮춤)
    let newOvr = Math.max(50, oldOvr - 12);

    // 특별히 높은 선수들은 조금 덜 낮춤
    if (oldOvr >= 95) {
      newOvr = oldOvr - 10; // 95+ -> 85+ (LEGENDARY)
    } else if (oldOvr >= 90) {
      newOvr = oldOvr - 11; // 90-94 -> 79-83 (EPIC/LEGENDARY)
    } else if (oldOvr >= 85) {
      newOvr = oldOvr - 12; // 85-89 -> 73-77 (RARE/EPIC)
    } else if (oldOvr >= 80) {
      newOvr = oldOvr - 13; // 80-84 -> 67-71 (RARE)
    } else if (oldOvr >= 75) {
      newOvr = oldOvr - 13; // 75-79 -> 62-66 (RARE/COMMON)
    } else {
      newOvr = oldOvr - 14; // 74 이하 -> 60 이하 (COMMON)
    }

    // 새로운 등급 기준 적용
    let newTier = 'COMMON';
    let newPrice = 100;

    if (newOvr >= 85) {
      newTier = 'LEGENDARY';
      newPrice = 1000;
    } else if (newOvr >= 80) {
      newTier = 'EPIC';
      newPrice = 500;
    } else if (newOvr >= 73) {
      newTier = 'RARE';
      newPrice = 300;
    } else {
      newTier = 'COMMON';
      newPrice = 100;
    }

    // 라인 교체
    line = line.replace(
      `${oldOvr}, '${oldTier}', ${oldPrice},`,
      `${newOvr}, '${newTier}', ${newPrice},`
    );

    console.log(`${playerName} (${team} ${position}): OVR ${oldOvr} -> ${newOvr}, ${oldTier} -> ${newTier}`);
  }

  newLines.push(line);
}

fs.writeFileSync('./database/seed.sql', newLines.join('\n'));
console.log('\n✅ OVR 하향 조정 및 등급 재설정 완료!');
