// 리그오브레전드 배틀 시뮬레이션 엔진

class BattleEngine {
    constructor() {
        this.battleLog = [];
        this.gameTime = 0;
    }

    // 메인 배틀 실행 함수
    async simulateBattle(team1, team2, synergyBonus1 = 0, synergyBonus2 = 0) {
        this.battleLog = [];
        this.gameTime = 0;

        // 팀 능력치 계산 (시너지 보너스 적용)
        const team1Stats = this.calculateTeamStats(team1, synergyBonus1);
        const team2Stats = this.calculateTeamStats(team2, synergyBonus2);

        this.addLog(`=== 게임 시작 ===`);
        this.addLog(`블루팀 총 전투력: ${team1Stats.totalPower.toFixed(0)} (시너지: +${synergyBonus1}%)`);
        this.addLog(`레드팀 총 전투력: ${team2Stats.totalPower.toFixed(0)} (시너지: +${synergyBonus2}%)`);
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

        return {
            winner: winner,
            team1Score: team1Score,
            team2Score: team2Score,
            battleLog: this.battleLog.join('\n'),
            duration: this.gameTime
        };
    }

    // 팀 전체 능력치 계산
    calculateTeamStats(team, synergyBonus) {
        const bonus = 1 + (synergyBonus / 100);

        let totalTop = 0, totalJungle = 0, totalMid = 0, totalAdc = 0, totalSupport = 0;
        let totalTeamfight = 0, totalLaning = 0, totalMacro = 0, totalOverall = 0;

        team.forEach(player => {
            totalTop += player.stats_top * bonus;
            totalJungle += player.stats_jungle * bonus;
            totalMid += player.stats_mid * bonus;
            totalAdc += player.stats_adc * bonus;
            totalSupport += player.stats_support * bonus;
            totalTeamfight += player.stats_teamfight * bonus;
            totalLaning += player.stats_laning * bonus;
            totalMacro += player.stats_macro * bonus;
            totalOverall += player.overall_rating * bonus;
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
            players: team
        };
    }

    // 라인전 시뮬레이션
    simulateLaning(team1, team2) {
        let team1Points = 0;
        let team2Points = 0;

        // 탑 라인전
        const topDiff = team1.top - team2.top;
        if (Math.abs(topDiff) > 10) {
            const winner = topDiff > 0 ? '블루팀' : '레드팀';
            this.addLog(`${this.gameTime + 8}분: 탑 라인에서 ${winner} ${team1.players[0].player_name}이(가) 솔로킬을 따냅니다!`);
            team1Points += topDiff > 0 ? 15 : 0;
            team2Points += topDiff < 0 ? 15 : 0;
        }

        // 미드 라인전
        const midDiff = team1.mid - team2.mid;
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
        const laningDiff = team1.laning - team2.laning;
        team1Points += laningDiff > 0 ? laningDiff * 0.3 : 0;
        team2Points += laningDiff < 0 ? Math.abs(laningDiff) * 0.3 : 0;

        return { team1Points, team2Points };
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

        // 대규모 팀파이트 3회 시뮬레이션
        for (let i = 1; i <= 3; i++) {
            const randomFactor1 = 0.9 + Math.random() * 0.2; // 0.9 ~ 1.1
            const randomFactor2 = 0.9 + Math.random() * 0.2;

            const team1Power = team1.teamfight * randomFactor1;
            const team2Power = team2.teamfight * randomFactor2;
            const diff = team1Power - team2Power;

            if (Math.abs(diff) > 5) {
                const winner = diff > 0 ? '블루팀' : '레드팀';
                this.addLog(`${this.gameTime + (i * 3)}분: 대규모 팀파이트에서 ${winner}이(가) 승리합니다!`);
                team1Points += diff > 0 ? 25 : 0;
                team2Points += diff < 0 ? 25 : 0;
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
