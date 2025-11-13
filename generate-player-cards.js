const fs = require('fs');
const path = require('path');

// 팀 색상 매핑
const teamColors = {
  // LCK
  'T1': { primary: '#E30613', secondary: '#8B0000', accent: '#FFD700' },
  'Gen.G': { primary: '#FFD700', secondary: '#FFA500', accent: '#000000' },
  'HLE': { primary: '#FF6B00', secondary: '#FF4500', accent: '#FFFFFF' },
  'KT': { primary: '#000000', secondary: '#E30613', accent: '#FFFFFF' },
  'DK': { primary: '#1E3A8A', secondary: '#0A1E3D', accent: '#60A5FA' },
  'NS': { primary: '#DC2626', secondary: '#991B1B', accent: '#FBBF24' },
  'BRO': { primary: '#0EA5E9', secondary: '#0369A1', accent: '#FFFFFF' },
  'DRX': { primary: '#3B82F6', secondary: '#1E40AF', accent: '#60A5FA' },
  'DNF': { primary: '#10B981', secondary: '#059669', accent: '#34D399' },
  'FEARX': { primary: '#FF6B35', secondary: '#D84315', accent: '#FFD54F' },
  // LPL
  'BLG': { primary: '#FF1493', secondary: '#C71585', accent: '#FFD700' },
  'JDG': { primary: '#DC143C', secondary: '#8B0000', accent: '#FFFFFF' },
  'WBG': { primary: '#1E90FF', secondary: '#0000CD', accent: '#00BFFF' },
  'TES': { primary: '#FFD700', secondary: '#FFA500', accent: '#000000' },
  'LNG': { primary: '#4169E1', secondary: '#191970', accent: '#87CEEB' },
  'IG': { primary: '#000000', secondary: '#2F4F4F', accent: '#FFFFFF' },
  // LEC
  'G2': { primary: '#0A192F', secondary: '#172A45', accent: '#E30613' },
  'FNC': { primary: '#FF5500', secondary: '#CC4400', accent: '#000000' },
  'MAD': { primary: '#FFD700', secondary: '#FFA500', accent: '#000000' },
  // LCS
  'C9': { primary: '#0080FF', secondary: '#004D99', accent: '#FFFFFF' },
  'TL': { primary: '#003366', secondary: '#001A33', accent: '#00BFFF' }
};

// 등급별 색상
const tierColors = {
  'LEGENDARY': '#FF8C00',
  'EPIC': '#9400D3',
  'RARE': '#4169E1',
  'COMMON': '#808080'
};

// 포지션별 아이콘
const positionIcons = {
  'TOP': '🛡️',
  'JUNGLE': '🐾',
  'MID': '⚡',
  'ADC': '🎯',
  'SUPPORT': '💚'
};

function generatePlayerCard(playerName, team, position, overall, tier, season) {
  const teamColor = teamColors[team] || { primary: '#667eea', secondary: '#764ba2', accent: '#FFFFFF' };
  const tierColor = tierColors[tier];
  const posIcon = positionIcons[position] || '⭐';

  const cleanName = playerName.toLowerCase().replace(/\s+/g, '_');
  const svg = `<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${cleanName}Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${teamColor.primary};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${teamColor.secondary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${teamColor.primary};stop-opacity:0.8" />
    </linearGradient>
    <filter id="${cleanName}Glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Card Background -->
  <rect width="300" height="400" rx="20" fill="url(#${cleanName}Grad)"/>

  <!-- Tier Badge -->
  <rect x="10" y="10" width="80" height="30" rx="15" fill="${tierColor}" opacity="0.9"/>
  <text x="50" y="30" font-family="Arial" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${tier}</text>

  <!-- OVR Rating -->
  <circle cx="260" cy="30" r="25" fill="${teamColor.accent}" opacity="0.95"/>
  <text x="260" y="38" font-family="Arial Black" font-size="22" font-weight="bold" fill="${teamColor.primary}" text-anchor="middle">${overall}</text>

  <!-- Player Image Area (Silhouette) -->
  <circle cx="150" cy="140" r="70" fill="${teamColor.accent}" opacity="0.2"/>
  <circle cx="150" cy="115" r="35" fill="${teamColor.accent}" opacity="0.3"/>
  <ellipse cx="150" cy="175" rx="50" ry="60" fill="${teamColor.accent}" opacity="0.3"/>

  <!-- Position Icon -->
  <text x="150" y="200" font-family="Arial" font-size="60" text-anchor="middle" filter="url(#${cleanName}Glow)">${posIcon}</text>

  <!-- Player Name -->
  <rect x="20" y="250" width="260" height="50" rx="10" fill="#000000" opacity="0.7"/>
  <text x="150" y="283" font-family="Arial Black" font-size="28" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${playerName}</text>

  <!-- Team & Position Info -->
  <rect x="30" y="315" width="240" height="35" rx="8" fill="${teamColor.accent}" opacity="0.9"/>
  <text x="150" y="337" font-family="Arial" font-size="16" font-weight="bold" fill="${teamColor.primary}" text-anchor="middle">${team} | ${position}</text>

  <!-- Season -->
  <text x="150" y="370" font-family="Arial" font-size="14" fill="${teamColor.accent}" text-anchor="middle" opacity="0.8">${season}</text>

  <!-- Decorative elements -->
  <circle cx="30" cy="30" r="3" fill="${teamColor.accent}" opacity="0.5"/>
  <circle cx="270" cy="370" r="3" fill="${teamColor.accent}" opacity="0.5"/>
  <circle cx="30" cy="370" r="3" fill="${teamColor.accent}" opacity="0.5"/>
</svg>`;

  return svg;
}

// seed.sql에서 선수 정보 파싱
const seedContent = fs.readFileSync('./database/seed.sql', 'utf-8');
const playerRegex = /\('([^']+)',\s*'([^']+)',\s*'[^']+',\s*'([^']+)',\s*'([^']+)',\s*(\d+),\s*'([^']+)'/g;

const outputDir = './frontend/public/images/cards';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let match;
let count = 0;

console.log('🎴 선수 카드 생성 시작...\n');

while ((match = playerRegex.exec(seedContent)) !== null) {
  const [, playerName, season, team, position, overall, tier] = match;

  const svg = generatePlayerCard(playerName, team, position, overall, tier, season);
  const filename = `${playerName.toLowerCase().replace(/\s+/g, '_')}_25.svg`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, svg);
  count++;
  console.log(`✅ ${count}. ${playerName} (${team} ${position}) - ${filename}`);
}

console.log(`\n🎉 완료! 총 ${count}개의 선수 카드가 생성되었습니다!`);
console.log(`📁 위치: ${outputDir}`);
