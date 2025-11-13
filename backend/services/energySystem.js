// 배틀 에너지 충전 시스템

class EnergySystem {
    constructor() {
        this.MAX_ENERGY = 10;
        this.RECHARGE_INTERVAL = 5 * 60 * 1000; // 5분 (밀리초)
    }

    // 사용자의 현재 에너지 계산
    calculateCurrentEnergy(battleEnergy, lastEnergyUpdate) {
        const now = new Date();
        const lastUpdate = new Date(lastEnergyUpdate);
        const timeDiff = now - lastUpdate;

        // 5분마다 1 에너지 충전
        const energyToAdd = Math.floor(timeDiff / this.RECHARGE_INTERVAL);

        // 최대 에너지를 넘지 않도록
        const currentEnergy = Math.min(this.MAX_ENERGY, battleEnergy + energyToAdd);

        return {
            currentEnergy,
            energyToAdd,
            nextRechargeIn: this.getNextRechargeTime(lastUpdate, energyToAdd)
        };
    }

    // 다음 충전까지 남은 시간 계산
    getNextRechargeTime(lastUpdate, energyAdded) {
        const now = new Date();
        const lastRechargeTime = new Date(lastUpdate.getTime() + (energyAdded * this.RECHARGE_INTERVAL));
        const nextRechargeTime = new Date(lastRechargeTime.getTime() + this.RECHARGE_INTERVAL);
        const timeUntilNext = Math.max(0, nextRechargeTime - now);

        const minutes = Math.floor(timeUntilNext / (60 * 1000));
        const seconds = Math.floor((timeUntilNext % (60 * 1000)) / 1000);

        return {
            milliseconds: timeUntilNext,
            minutes,
            seconds,
            formatted: `${minutes}분 ${seconds}초`
        };
    }

    // 에너지 사용
    async useEnergy(db, userId, amount = 1) {
        const [user] = await db.query(
            'SELECT battle_energy, last_energy_update FROM users WHERE user_id = ?',
            [userId]
        );

        if (user.length === 0) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        // 현재 에너지 계산
        const energyInfo = this.calculateCurrentEnergy(
            user[0].battle_energy,
            user[0].last_energy_update
        );

        if (energyInfo.currentEnergy < amount) {
            throw new Error('에너지가 부족합니다.');
        }

        // 에너지 차감 및 업데이트
        const newEnergy = energyInfo.currentEnergy - amount;
        await db.query(
            'UPDATE users SET battle_energy = ?, last_energy_update = NOW() WHERE user_id = ?',
            [newEnergy, userId]
        );

        return {
            success: true,
            remainingEnergy: newEnergy,
            nextRecharge: this.getNextRechargeTime(new Date(), 0)
        };
    }

    // 에너지 업데이트 (주기적으로 호출)
    async updateEnergy(db, userId) {
        const [user] = await db.query(
            'SELECT battle_energy, last_energy_update FROM users WHERE user_id = ?',
            [userId]
        );

        if (user.length === 0) {
            return null;
        }

        const energyInfo = this.calculateCurrentEnergy(
            user[0].battle_energy,
            user[0].last_energy_update
        );

        // 에너지가 증가했다면 DB 업데이트
        if (energyInfo.energyToAdd > 0 && energyInfo.currentEnergy < this.MAX_ENERGY) {
            await db.query(
                'UPDATE users SET battle_energy = ?, last_energy_update = NOW() WHERE user_id = ?',
                [energyInfo.currentEnergy, userId]
            );
        }

        return energyInfo;
    }

    // 배틀 중에도 타이머가 흐르도록 하기 위한 백그라운드 작업
    startEnergyRechargeTask(db) {
        // 1분마다 모든 유저의 에너지 확인 및 업데이트
        setInterval(async () => {
            try {
                const [users] = await db.query(
                    'SELECT user_id, battle_energy, last_energy_update FROM users WHERE battle_energy < ?',
                    [this.MAX_ENERGY]
                );

                for (const user of users) {
                    const energyInfo = this.calculateCurrentEnergy(
                        user.battle_energy,
                        user.last_energy_update
                    );

                    if (energyInfo.energyToAdd > 0) {
                        await db.query(
                            'UPDATE users SET battle_energy = ?, last_energy_update = NOW() WHERE user_id = ?',
                            [energyInfo.currentEnergy, user.user_id]
                        );
                    }
                }
            } catch (error) {
                console.error('에너지 충전 작업 오류:', error);
            }
        }, 60 * 1000); // 1분마다 실행

        console.log('에너지 충전 시스템이 시작되었습니다.');
    }
}

module.exports = new EnergySystem();
