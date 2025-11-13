// 리그오브레전드 배틀 시뮬레이션 엔진

class BattleEngine {
    constructor() {
        this.battleLog = [];
        this.gameTime = 0;
        this.traitEffects = {
            'laning_boost': { phase: 'laning', multiplier: 1.2 },
            'teamfight_boost': { phase: 'teamfight', multiplier: 1.15 },
            'clutch': { phase: 'clutch', multiplier: 1.18 },
            'comeback': { phase: 'comeback', multiplier: 1.15 },
            'snowball': { phase: 'snowball', multiplier: 1.12 },
            'vision': { phase: 'macro', multiplier: 1.15 },
            'engage': { phase: 'teamfight', multiplier: 1.18 },
            'peel': { phase: 'teamfight', multiplier: 1.12 },
            'jungle_control': { phase: 'jungle', multiplier: 1.18 },
            'team_boost': { phase: 'all', multiplier: 1.1 },
            'all_round': { phase: 'all', multiplier: 1.05 }
        };
        this.team1KDA = {};
        this.team2KDA = {};
    }

    // KDA 초기화
    initializeKDA(team, teamNumber) {
        const kdaMap = teamNumber === 1 ? this.team1KDA : this.team2KDA;
        team.forEach(player => {
            kdaMap[player.player_name] = {
                kills: 0,
                deaths: 0,
                assists: 0,
                position: player.position,
                rating: player.overall_rating,
                damageDealt: 0,
                goldEarned: 0
            };
        });
    }

    // 킬 기록
    recordKill(playerName, teamNumber, isAssist = false) {
        const kdaMap = teamNumber === 1 ? this.team1KDA : this.team2KDA;
        if (kdaMap[playerName]) {
            if (isAssist) {
                kdaMap[playerName].assists++;
            } else {
                kdaMap[playerName].kills++;
                kdaMap[playerName].goldEarned += 300;
            }
        }
    }

    // 데스 기록
    recordDeath(playerName, teamNumber) {
        const kdaMap = teamNumber === 1 ? this.team1KDA : this.team2KDA;
        if (kdaMap[playerName]) {
            kdaMap[playerName].deaths++;
        }
    }

    // 데미지 기록
    recordDamage(playerName, teamNumber, damage) {
        const kdaMap = teamNumber === 1 ? this.team1KDA : this.team2KDA;
        if (kdaMap[playerName]) {
            kdaMap[playerName].damageDealt += damage;
        }
    }

    // 메인 배틀 실행 함수
    async simulateBattle(team1, team2, synergyBonus1 = 0, synergyBonus2 = 0) {
        this.battleLog = [];
        this.gameTime = 0;
        this.team1KDA = {};
        this.team2KDA = {};

        // KDA 초기화
        this.initializeKDA(team1, 1);
        this.initializeKDA(team2, 2);

        // 특성 분석
        const team1Traits = this.analyzeTeamTraits(team1);
        const team2Traits = this.analyzeTeamTraits(team2);

        // 포지션 시너지 계산
        const positionSynergy1 = this.calculatePositionSynergy(team1);
        const positionSynergy2 = this.calculatePositionSynergy(team2);

        // 팀 능력치 계산 (시너지 보너스 + 포지션 시너지 적용)
        const totalSynergy1 = synergyBonus1 + positionSynergy1;
        const totalSynergy2 = synergyBonus2 + positionSynergy2;

        const team1Stats = this.calculateTeamStats(team1, totalSynergy1, team1Traits);
        const team2Stats = this.calculateTeamStats(team2, totalSynergy2, team2Traits);

        this.addLog(`=== 게임 시작 ===`);
        this.addLog(`블루팀 총 전투력: ${team1Stats.totalPower.toFixed(0)} (팀 시너지: +${synergyBonus1}%, 포지션 시너지: +${positionSynergy1}%)`);
        this.addLog(`레드팀 총 전투력: ${team2Stats.totalPower.toFixed(0)} (팀 시너지: +${synergyBonus2}%, 포지션 시너지: +${positionSynergy2}%)`);

        // 주요 특성 표시
        if (team1Traits.length > 0) {
            this.addLog(`블루팀 특성: ${team1Traits.map(t => t.trait).join(', ')}`);
        }
        if (team2Traits.length > 0) {
            this.addLog(`레드팀 특성: ${team2Traits.map(t => t.trait).join(', ')}`);
        }
        this.addLog('');

        // 게임 페이즈 시뮬레이션
        let team1Score = 0;
        let team2Score = 0;

        // 1. 라인전 페이즈 (0-15분)
        this.gameTime = 0;
        this.addLog('=== 라인전 페이즈 (0-15분) ===');
        const laningResult = this.simulateLaning(team1Stats, team2Stats);
        team1Score += laningResult.team1Points;
        team2Score += laningResult.team2Points;

        // 2. 미드게임 (15-25분)
        this.gameTime = 15;
        this.addLog('\n=== 미드게임 (15-25분) ===');
        const midGameResult = this.simulateMidGame(team1Stats, team2Stats);
        team1Score += midGameResult.team1Points;
        team2Score += midGameResult.team2Points;

        // 3. 후반 팀파이트 (25-35분)
        this.gameTime = 25;
        this.addLog('\n=== 후반 팀파이트 (25-35분) ===');
        const lateGameResult = this.simulateLateGame(team1Stats, team2Stats);
        team1Score += lateGameResult.team1Points;
        team2Score += lateGameResult.team2Points;

        // 4. 오브젝트 싸움
        const objectiveResult = this.simulateObjectives(team1Stats, team2Stats);
        team1Score += objectiveResult.team1Points;
        team2Score += objectiveResult.team2Points;

        // 최종 결과
        this.addLog('\n=== 게임 종료 ===');
        this.addLog(`블루팀 총점: ${team1Score.toFixed(0)}`);
        this.addLog(`레드팀 총점: ${team2Score.toFixed(0)}`);

        const winner = team1Score > team2Score ? 1 : 2;
        const winnerName = winner === 1 ? '블루팀' : '레드팀';
        this.addLog(`\n승자: ${winnerName}!`);

        // 경기 요약 생성
        const summary = this.generateBattleSummary(team1, team2, team1Score, team2Score, winner);

        return {
            winner: winner,
            team1Score: team1Score,
            team2Score: team2Score,
            battleLog: this.battleLog.join('\n'),
            duration: this.gameTime,
            team1KDA: this.team1KDA,
            team2KDA: this.team2KDA,
            summary: summary
        };
    }

    // 경기 요약 생성
    generateBattleSummary(team1, team2, team1Score, team2Score, winner) {
        // MVP 선정 (가장 높은 KDA + 데미지)
        const allPlayers = [
            ...Object.entries(this.team1KDA).map(([name, stats]) => ({
                name,
                ...stats,
                team: 1,
                kdaRatio: stats.deaths === 0 ? (stats.kills + stats.assists) : (stats.kills + stats.assists) / stats.deaths
            })),
            ...Object.entries(this.team2KDA).map(([name, stats]) => ({
                name,
                ...stats,
                team: 2,
                kdaRatio: stats.deaths === 0 ? (stats.kills + stats.assists) : (stats.kills + stats.assists) / stats.deaths
            }))
        ];

        // MVP 계산 (KDA * 0.6 + 데미지 비율 * 0.4)
        const maxDamage = Math.max(...allPlayers.map(p => p.damageDealt));
        allPlayers.forEach(p => {
            p.mvpScore = (p.kdaRatio * 0.6) + ((p.damageDealt / maxDamage) * 0.4);
        });

        const mvp = allPlayers.reduce((prev, current) =>
            (current.mvpScore > prev.mvpScore) ? current : prev
        );

        // 팀 총 킬/데스/어시스트
        const team1TotalKills = Object.values(this.team1KDA).reduce((sum, p) => sum + p.kills, 0);
        const team1TotalDeaths = Object.values(this.team1KDA).reduce((sum, p) => sum + p.deaths, 0);
        const team1TotalAssists = Object.values(this.team1KDA).reduce((sum, p) => sum + p.assists, 0);

        const team2TotalKills = Object.values(this.team2KDA).reduce((sum, p) => sum + p.kills, 0);
        const team2TotalDeaths = Object.values(this.team2KDA).reduce((sum, p) => sum + p.deaths, 0);
        const team2TotalAssists = Object.values(this.team2KDA).reduce((sum, p) => sum + p.assists, 0);

        // 총 데미지
        const team1TotalDamage = Object.values(this.team1KDA).reduce((sum, p) => sum + p.damageDealt, 0);
        const team2TotalDamage = Object.values(this.team2KDA).reduce((sum, p) => sum + p.damageDealt, 0);

        return {
            mvp: {
                playerName: mvp.name,
                team: mvp.team,
                position: mvp.position,
                kills: mvp.kills,
                deaths: mvp.deaths,
                assists: mvp.assists,
                kda: mvp.kdaRatio.toFixed(2),
                damageDealt: Math.floor(mvp.damageDealt),
                goldEarned: mvp.goldEarned
            },
            teamStats: {
                team1: {
                    totalKills: team1TotalKills,
                    totalDeaths: team1TotalDeaths,
                    totalAssists: team1TotalAssists,
                    totalDamage: Math.floor(team1TotalDamage),
                    score: Math.floor(team1Score)
                },
                team2: {
                    totalKills: team2TotalKills,
                    totalDeaths: team2TotalDeaths,
                    totalAssists: team2TotalAssists,
                    totalDamage: Math.floor(team2TotalDamage),
                    score: Math.floor(team2Score)
                }
            },
            winner: winner,
            gameDuration: `${Math.floor(this.gameTime)}분`
        };
    }

    // 팀 특성 분석
    analyzeTeamTraits(team) {
        const traits = [];
        team.forEach(player => {
            if (player.trait_1) traits.push({ player: player.player_name, trait: player.trait_1 });
            if (player.trait_2) traits.push({ player: player.player_name, trait: player.trait_2 });
            if (player.trait_3) traits.push({ player: player.player_name, trait: player.trait_3 });
        });
        return traits;
    }

    // 포지션 시너지 계산
    calculatePositionSynergy(team) {
        let synergyBonus = 0;
        const positions = team.map(p => p.position);

        // JUNGLE-MID 시너지
        if (positions.includes('JUNGLE') && positions.includes('MID')) {
            synergyBonus += 8;
        }

        // ADC-SUPPORT 시너지 (봇 듀오)
        if (positions.includes('ADC') && positions.includes('SUPPORT')) {
            synergyBonus += 12;
        }

        // TOP-JUNGLE 시너지
        if (positions.includes('TOP') && positions.includes('JUNGLE')) {
            synergyBonus += 7;
        }

        return synergyBonus;
    }

    // 팀 전체 능력치 계산 (특성 효과 적용)
    calculateTeamStats(team, synergyBonus, teamTraits) {
        const bonus = 1 + (synergyBonus / 100);

        let totalTop = 0, totalJungle = 0, totalMid = 0, totalAdc = 0, totalSupport = 0;
        let totalTeamfight = 0, totalLaning = 0, totalMacro = 0, totalOverall = 0;

        team.forEach(player => {
            // 기본 능력치에 시너지 보너스 적용
            let playerBonus = bonus;

            // '팀플레이어' 또는 '경험 많은 베테랑' 특성이 있으면 전체 보너스
            if (player.trait_1 === '팀플레이어' || player.trait_2 === '팀플레이어') {
                playerBonus *= 1.1;
            }
            if (player.trait_1 === '경험 많은 베테랑' || player.trait_2 === '경험 많은 베테랑') {
                playerBonus *= 1.05;
            }

            totalTop += player.stats_top * playerBonus;
            totalJungle += player.stats_jungle * playerBonus;
            totalMid += player.stats_mid * playerBonus;
            totalAdc += player.stats_adc * playerBonus;
            totalSupport += player.stats_support * playerBonus;
            totalTeamfight += player.stats_teamfight * playerBonus;
            totalLaning += player.stats_laning * playerBonus;
            totalMacro += player.stats_macro * playerBonus;
            totalOverall += player.overall_rating * playerBonus;
        });

        return {
            top: totalTop,
            jungle: totalJungle,
            mid: totalMid,
            adc: totalAdc,
            support: totalSupport,
            teamfight: totalTeamfight,
            laning: totalLaning,
            macro: totalMacro,
            totalPower: totalOverall,
            players: team,
            traits: teamTraits
        };
    }

    // 라인전 시뮬레이션
    simulateLaning(team1, team2) {
        let team1Points = 0;
        let team2Points = 0;

        // 라인전 특성 보너스 적용
        const team1LaningBonus = this.hasTraitEffect(team1.traits, ['솔로킬러', '스노볼러']) ? 1.2 : 1.0;
        const team2LaningBonus = this.hasTraitEffect(team2.traits, ['솔로킬러', '스노볼러']) ? 1.2 : 1.0;

        // 탑 라인전
        const topDiff = (team1.top * team1LaningBonus) - (team2.top * team2LaningBonus);
        if (Math.abs(topDiff) > 10) {
            const winner = topDiff > 0 ? '블루팀' : '레드팀';
            const winningTeam = topDiff > 0 ? team1 : team2;
            const losingTeam = topDiff > 0 ? team2 : team1;
            const topPlayer = winningTeam.players.find(p => p.position === 'TOP');
            const enemyTop = losingTeam.players.find(p => p.position === 'TOP');

            if (topPlayer && enemyTop) {
                // 킬 기록
                this.recordKill(topPlayer.player_name, topDiff > 0 ? 1 : 2);
                this.recordDeath(enemyTop.player_name, topDiff > 0 ? 2 : 1);
                this.recordDamage(topPlayer.player_name, topDiff > 0 ? 1 : 2, 1500);

                if (topPlayer.trait_1 === '솔로킬러' || topPlayer.trait_2 === '솔로킬러') {
                    this.addLog(`${this.gameTime + 8}분: 탑 라인에서 ${winner} ${topPlayer.player_name}의 [솔로킬러] 특성이 발동! 압도적인 솔로킬!`);
                    team1Points += topDiff > 0 ? 20 : 0;
                    team2Points += topDiff < 0 ? 20 : 0;
                } else {
                    this.addLog(`${this.gameTime + 8}분: 탑 라인에서 ${winner} ${topPlayer.player_name}이(가) 솔로킬을 따냅니다!`);
                    team1Points += topDiff > 0 ? 15 : 0;
                    team2Points += topDiff < 0 ? 15 : 0;
                }
            }
        }

        // 미드 라인전
        const midDiff = (team1.mid * team1LaningBonus) - (team2.mid * team2LaningBonus);
        if (Math.abs(midDiff) > 10) {
            const winner = midDiff > 0 ? '블루팀' : '레드팀';
            this.addLog(`${this.gameTime + 10}분: 미드 라인에서 ${winner}이(가) CS 우위를 가져갑니다!`);
            team1Points += midDiff > 0 ? 12 : 0;
            team2Points += midDiff < 0 ? 12 : 0;
        }

        // 봇 라인전
        const botDiff = (team1.adc + team1.support) - (team2.adc + team2.support);
        if (Math.abs(botDiff) > 15) {
            const winner = botDiff > 0 ? '블루팀' : '레드팀';
            this.addLog(`${this.gameTime + 12}분: 봇 라인에서 ${winner}이(가) 2vs2 교전에서 승리합니다!`);
            team1Points += botDiff > 0 ? 18 : 0;
            team2Points += botDiff < 0 ? 18 : 0;
        }

        // 라인전 전체 우위
        const laningDiff = (team1.laning * team1LaningBonus) - (team2.laning * team2LaningBonus);
        team1Points += laningDiff > 0 ? laningDiff * 0.3 : 0;
        team2Points += laningDiff < 0 ? Math.abs(laningDiff) * 0.3 : 0;

        return { team1Points, team2Points };
    }

    // 특성 효과 확인 헬퍼 함수
    hasTraitEffect(teamTraits, traitNames) {
        return teamTraits.some(t => traitNames.includes(t.trait));
    }

    // 미드게임 시뮬레이션
    simulateMidGame(team1, team2) {
        let team1Points = 0;
        let team2Points = 0;

        // 정글 컨트롤
        const jungleDiff = team1.jungle - team2.jungle;
        if (Math.abs(jungleDiff) > 10) {
            const winner = jungleDiff > 0 ? '블루팀' : '레드팀';
            this.addLog(`${this.gameTime + 3}분: ${winner} 정글러가 상대 정글을 장악합니다!`);
            team1Points += jungleDiff > 0 ? 20 : 0;
            team2Points += jungleDiff < 0 ? 20 : 0;
        }

        // 로밍 및 갱킹
        const macroDiff = team1.macro - team2.macro;
        if (Math.abs(macroDiff) > 15) {
            const winner = macroDiff > 0 ? '블루팀' : '레드팀';
            this.addLog(`${this.gameTime + 6}분: ${winner}이(가) 뛰어난 로밍으로 킬을 추가합니다!`);
            team1Points += macroDiff > 0 ? 15 : 0;
            team2Points += macroDiff < 0 ? 15 : 0;
        }

        // 소규모 교전
        const skirmishPower1 = (team1.teamfight * 0.5 + team1.macro * 0.5);
        const skirmishPower2 = (team2.teamfight * 0.5 + team2.macro * 0.5);
        const skirmishDiff = skirmishPower1 - skirmishPower2;

        if (Math.abs(skirmishDiff) > 10) {
            const winner = skirmishDiff > 0 ? '블루팀' : '레드팀';
            this.addLog(`${this.gameTime + 8}분: ${winner}이(가) 3vs3 교전에서 승리합니다!`);
            team1Points += skirmishDiff > 0 ? 18 : 0;
            team2Points += skirmishDiff < 0 ? 18 : 0;
        }

        return { team1Points, team2Points };
    }

    // 후반 팀파이트 시뮬레이션
    simulateLateGame(team1, team2) {
        let team1Points = 0;
        let team2Points = 0;

        // 팀파이트 특성 보너스
        const team1TFBonus = this.hasTraitEffect(team1.traits, ['하이퍼캐리', '완벽한 이니시', '이니시에이터']) ? 1.15 : 1.0;
        const team2TFBonus = this.hasTraitEffect(team2.traits, ['하이퍼캐리', '완벽한 이니시', '이니시에이터']) ? 1.15 : 1.0;

        // 클러치 특성 체크
        const team1HasClutch = this.hasTraitEffect(team1.traits, ['클러치', '역전의 명수']);
        const team2HasClutch = this.hasTraitEffect(team2.traits, ['클러치', '역전의 명수']);

        // 대규모 팀파이트 3회 시뮬레이션
        for (let i = 1; i <= 3; i++) {
            const randomFactor1 = 0.9 + Math.random() * 0.2; // 0.9 ~ 1.1
            const randomFactor2 = 0.9 + Math.random() * 0.2;

            let team1Power = team1.teamfight * team1TFBonus * randomFactor1;
            let team2Power = team2.teamfight * team2TFBonus * randomFactor2;

            // 역전 상황 체크 - 지고 있는 팀의 클러치/역전의 명수 발동
            const currentDiff = team1Points - team2Points;
            if (currentDiff < -20 && team1HasClutch) {
                team1Power *= 1.18; // 클러치/역전 보너스
                this.addLog(`${this.gameTime + (i * 3)}분: 블루팀의 [클러치/역전의 명수] 특성 발동!`);
            } else if (currentDiff > 20 && team2HasClutch) {
                team2Power *= 1.18;
                this.addLog(`${this.gameTime + (i * 3)}분: 레드팀의 [클러치/역전의 명수] 특성 발동!`);
            }

            const diff = team1Power - team2Power;

            if (Math.abs(diff) > 5) {
                const winner = diff > 0 ? '블루팀' : '레드팀';
                const winningTeam = diff > 0 ? team1 : team2;
                const losingTeam = diff > 0 ? team2 : team1;

                // 팀파이트 KDA 기록 (2-3명 킬, 전원 어시스트)
                const killCount = Math.floor(Math.random() * 2) + 2; // 2-3킬
                const winningTeamNum = diff > 0 ? 1 : 2;
                const losingTeamNum = diff > 0 ? 2 : 1;

                // 승리 팀에 킬과 어시스트 기록
                for (let k = 0; k < killCount && k < winningTeam.players.length; k++) {
                    this.recordKill(winningTeam.players[k].player_name, winningTeamNum);
                    this.recordDamage(winningTeam.players[k].player_name, winningTeamNum, 3000 + Math.random() * 2000);
                }
                // 나머지는 어시스트
                for (let k = killCount; k < winningTeam.players.length; k++) {
                    this.recordKill(winningTeam.players[k].player_name, winningTeamNum, true);
                    this.recordDamage(winningTeam.players[k].player_name, winningTeamNum, 2000 + Math.random() * 1000);
                }

                // 패배 팀 데스 기록
                for (let k = 0; k < killCount && k < losingTeam.players.length; k++) {
                    this.recordDeath(losingTeam.players[k].player_name, losingTeamNum);
                }

                // 하이퍼캐리 특성 표시
                const hypercarry = winningTeam.players.find(p =>
                    p.trait_1 === '하이퍼캐리' || p.trait_2 === '하이퍼캐리'
                );

                if (hypercarry) {
                    this.addLog(`${this.gameTime + (i * 3)}분: 대규모 팀파이트! ${winner} ${hypercarry.player_name}의 [하이퍼캐리] 특성으로 압도적인 딜을 넣습니다!`);
                    team1Points += diff > 0 ? 30 : 0;
                    team2Points += diff < 0 ? 30 : 0;
                } else {
                    this.addLog(`${this.gameTime + (i * 3)}분: 대규모 팀파이트에서 ${winner}이(가) 승리합니다!`);
                    team1Points += diff > 0 ? 25 : 0;
                    team2Points += diff < 0 ? 25 : 0;
                }
            } else {
                this.addLog(`${this.gameTime + (i * 3)}분: 팀파이트가 비등하게 진행됩니다.`);
            }
        }

        return { team1Points, team2Points };
    }

    // 오브젝트 싸움 시뮬레이션
    simulateObjectives(team1, team2) {
        let team1Points = 0;
        let team2Points = 0;

        // 드래곤 싸움
        const dragonControl = team1.jungle + team1.support - (team2.jungle + team2.support);
        if (Math.abs(dragonControl) > 15) {
            const winner = dragonControl > 0 ? '블루팀' : '레드팀';
            this.addLog(`18분: ${winner}이(가) 드래곤을 확보합니다!`);
            team1Points += dragonControl > 0 ? 12 : 0;
            team2Points += dragonControl < 0 ? 12 : 0;
        }

        // 전령 싸움
        const heraldControl = team1.jungle - team2.jungle;
        if (Math.abs(heraldControl) > 10) {
            const winner = heraldControl > 0 ? '블루팀' : '레드팀';
            this.addLog(`12분: ${winner}이(가) 협곡의 전령을 획득합니다!`);
            team1Points += heraldControl > 0 ? 10 : 0;
            team2Points += heraldControl < 0 ? 10 : 0;
        }

        // 바론 싸움
        const baronPower1 = team1.teamfight + team1.macro;
        const baronPower2 = team2.teamfight + team2.macro;
        const baronDiff = baronPower1 - baronPower2;

        if (Math.abs(baronDiff) > 20) {
            const winner = baronDiff > 0 ? '블루팀' : '레드팀';
            this.addLog(`28분: ${winner}이(가) 바론을 스틸합니다!`);
            team1Points += baronDiff > 0 ? 30 : 0;
            team2Points += baronDiff < 0 ? 30 : 0;
        }

        return { team1Points, team2Points };
    }

    addLog(message) {
        this.battleLog.push(message);
    }
}

module.exports = BattleEngine;
