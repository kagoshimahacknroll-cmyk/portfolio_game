// 侍の領国経営ゲーム - JavaScript

class BushiLifeGame {
    constructor() {
        this.gameState = {
            // 基本情報
            playerName: '織田信長',
            year: 1,
            month: 1,
            era: '天正',
            
            // 資源
            resources: {
                rice: 1000,
                gold: 500,
                population: 2000,
                military: 100,
                territory: 1,
                reputation: 50
            },
            
            // 資源の月次増加量
            income: {
                rice: 30,
                gold: 15,
                population: 8,
                military: 3,
                reputation: 1
            },
            
            // プレイヤーの能力値
            stats: {
                swordsmanship: 50,
                strategy: 50,
                physical: 50,
                leadership: 50,
                diplomacy: 50
            },
            
            // 領国の発展度
            development: {
                farmland: 1,
                irrigation: 1,
                castle: 1,
                laws: 1,
                trade: 1
            },
            
            // イベント履歴
            events: [
                {
                    date: '天正元年 1月',
                    text: '領国経営を開始しました。平和な時代の始まりです。'
                }
            ],
            
            // 進行中のアクション
            activeActions: []
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initTerritoryMap();
        this.updateDisplay();
        this.loadGame();
    }
    
    setupEventListeners() {
        // タブ切り替え
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // ゲームコントロール
        document.getElementById('nextMonth').addEventListener('click', () => {
            this.nextMonth();
        });
        
        document.getElementById('saveGame').addEventListener('click', () => {
            this.saveGame();
        });
        
        document.getElementById('loadGame').addEventListener('click', () => {
            this.loadGame();
        });
        
        // プレイヤー名変更
        document.getElementById('playerName').addEventListener('change', (e) => {
            this.gameState.playerName = e.target.value;
        });
    }
    
    switchTab(tabName) {
        // タブボタンの状態更新
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // タブコンテンツの表示切り替え
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
    
    updateDisplay() {
        // 資源表示の更新
        Object.keys(this.gameState.resources).forEach(resource => {
            const element = document.getElementById(resource);
            if (element) {
                element.textContent = this.gameState.resources[resource].toLocaleString();
            }
        });
        
        // 年号表示の更新
        document.getElementById('currentYear').textContent = 
            `${this.gameState.era}${this.gameState.year}年`;
        
        // イベントログの更新
        this.updateEventLog();
        
        // 資源の月次増加量表示の更新
        this.updateIncomeDisplay();
    }
    
    updateIncomeDisplay() {
        const incomeElements = document.querySelectorAll('.resource-per-turn');
        const incomeValues = [
            `+${this.gameState.income.rice}/月`,
            `+${this.gameState.income.gold}/月`,
            `+${this.gameState.income.population}/月`,
            `+${this.gameState.income.military}/月`,
            '安定',
            `+${this.gameState.income.reputation}/月`
        ];
        
        incomeElements.forEach((element, index) => {
            element.textContent = incomeValues[index];
        });
    }
    
    updateEventLog() {
        const eventLog = document.getElementById('eventLog');
        eventLog.innerHTML = '';
        
        this.gameState.events.slice(-10).forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            eventItem.innerHTML = `
                <span class="event-date">${event.date}</span>
                <span class="event-text">${event.text}</span>
            `;
            eventLog.appendChild(eventItem);
        });
        
        // 最新のイベントを一番下にスクロール
        eventLog.scrollTop = eventLog.scrollHeight;
    }
    
    addEvent(text) {
        const date = `${this.gameState.era}${this.gameState.year}年 ${this.gameState.month}月`;
        this.gameState.events.push({ date, text });
        this.updateEventLog();
    }
    
    canAfford(costs) {
        return Object.keys(costs).every(resource => {
            return this.gameState.resources[resource] >= costs[resource];
        });
    }
    
    spendResources(costs) {
        if (!this.canAfford(costs)) {
            this.addEvent('資源が不足しています。');
            return false;
        }
        
        Object.keys(costs).forEach(resource => {
            this.gameState.resources[resource] -= costs[resource];
        });
        
        this.updateDisplay();
        this.updateTerritoryMap();
        return true;
    }
    
    nextMonth() {
        this.month++;
        
        if (this.month > 12) {
            this.month = 1;
            this.year++;
        }
        
        // 月次収入の適用
        this.gameState.resources.rice += this.gameState.income.rice;
        this.gameState.resources.gold += this.gameState.income.gold;
        this.gameState.resources.population += this.gameState.income.population;
        this.gameState.resources.military += this.gameState.income.military;
        this.gameState.resources.reputation += this.gameState.income.reputation;
        
        // ランダムイベントの発生
        this.triggerRandomEvent();
        
        // 進行中のアクションの処理
        this.processActiveActions();
        
        this.updateDisplay();
        this.updateTerritoryMap();
        this.addEvent('新しい月が始まりました。');
    }
    
    triggerRandomEvent() {
        const events = [
            // 良いイベント
            {
                probability: 0.1,
                text: '豊作の年です！米の収穫量が増加しました。',
                effect: () => { this.gameState.resources.rice += 200; }
            },
            {
                probability: 0.08,
                text: '商人が来訪し、貿易が活発になりました。',
                effect: () => { this.gameState.resources.gold += 150; }
            },
            {
                probability: 0.06,
                text: '他国からの使者が来訪しました。',
                effect: () => { this.gameState.resources.reputation += 10; }
            },
            {
                probability: 0.05,
                text: '優秀な家臣が仕官を希望しています。',
                effect: () => { 
                    this.gameState.stats.leadership += 5;
                    this.gameState.resources.military += 20;
                }
            },
            {
                probability: 0.04,
                text: '新しい技術が導入されました。',
                effect: () => { 
                    this.gameState.income.rice += 10;
                    this.gameState.income.gold += 5;
                }
            },
            
            // 悪いイベント
            {
                probability: 0.05,
                text: '疫病が発生しました。人口が減少します。',
                effect: () => { this.gameState.resources.population -= 100; }
            },
            {
                probability: 0.07,
                text: '盗賊が領内を荒らしました。',
                effect: () => { 
                    this.gameState.resources.gold -= 50;
                    this.gameState.resources.rice -= 100;
                }
            },
            {
                probability: 0.04,
                text: '干ばつが発生しました。農作物が被害を受けました。',
                effect: () => { 
                    this.gameState.resources.rice -= 150;
                    this.gameState.income.rice -= 10;
                }
            },
            {
                probability: 0.03,
                text: '隣国が領土を要求してきました。',
                effect: () => { this.triggerDiplomaticCrisis(); }
            },
            {
                probability: 0.02,
                text: '大規模な反乱が発生しました！',
                effect: () => { this.triggerRebellion(); }
            },
            {
                probability: 0.03,
                text: '敵国が侵攻してきました！',
                effect: () => { this.triggerInvasion(); }
            }
        ];
        
        events.forEach(event => {
            if (Math.random() < event.probability) {
                event.effect();
                this.addEvent(event.text);
            }
        });
    }
    
    triggerDiplomaticCrisis() {
        const options = [
            {
                text: '要求を拒否する（戦争の可能性）',
                effect: () => {
                    if (Math.random() < 0.3) {
                        this.addEvent('戦争が勃発しました！');
                        this.triggerWar();
                    } else {
                        this.addEvent('要求を拒否しましたが、関係は悪化しました。');
                        this.gameState.resources.reputation -= 20;
                    }
                }
            },
            {
                text: '要求を受け入れる（領土を失う）',
                effect: () => {
                    this.addEvent('要求を受け入れました。領土を失いました。');
                    this.gameState.resources.territory -= 0.1;
                    this.gameState.resources.reputation -= 10;
                }
            },
            {
                text: '金で解決する',
                effect: () => {
                    if (this.gameState.resources.gold >= 300) {
                        this.gameState.resources.gold -= 300;
                        this.addEvent('金で解決しました。関係は維持されました。');
                    } else {
                        this.addEvent('金が不足していたため、要求を拒否しました。');
                        this.gameState.resources.reputation -= 15;
                    }
                }
            }
        ];
        
        // プレイヤーに選択肢を提示（簡易版）
        const choice = Math.floor(Math.random() * options.length);
        options[choice].effect();
    }
    
    triggerRebellion() {
        const rebellionStrength = Math.floor(this.gameState.resources.population * 0.1);
        const militaryStrength = this.gameState.resources.military;
        
        if (militaryStrength > rebellionStrength * 2) {
            this.addEvent('反乱を鎮圧しました。');
            this.gameState.resources.military -= Math.floor(rebellionStrength * 0.3);
            this.gameState.resources.reputation += 5;
        } else if (militaryStrength > rebellionStrength) {
            this.addEvent('反乱を鎮圧しましたが、大きな損害を受けました。');
            this.gameState.resources.military -= Math.floor(militaryStrength * 0.4);
            this.gameState.resources.population -= 200;
        } else {
            this.addEvent('反乱に敗北しました。領国が混乱しています。');
            this.gameState.resources.military -= Math.floor(militaryStrength * 0.6);
            this.gameState.resources.population -= 300;
            this.gameState.resources.reputation -= 30;
            this.gameState.income.gold -= 10;
        }
    }
    
    triggerInvasion() {
        const enemyStrength = Math.floor(this.gameState.resources.military * (0.8 + Math.random() * 0.4));
        const defenseStrength = this.gameState.resources.military + (this.gameState.development.castle * 20);
        
        if (defenseStrength > enemyStrength * 1.2) {
            this.addEvent('敵の侵攻を撃退しました！');
            this.gameState.resources.military -= Math.floor(enemyStrength * 0.2);
            this.gameState.resources.reputation += 20;
            this.gameState.resources.gold += 100; // 戦利品
        } else if (defenseStrength > enemyStrength * 0.8) {
            this.addEvent('敵の侵攻を撃退しましたが、大きな損害を受けました。');
            this.gameState.resources.military -= Math.floor(defenseStrength * 0.3);
            this.gameState.resources.population -= 150;
        } else {
            this.addEvent('敵の侵攻に敗北しました。領土を失いました。');
            this.gameState.resources.military -= Math.floor(defenseStrength * 0.5);
            this.gameState.resources.population -= 300;
            this.gameState.resources.territory -= 0.2;
            this.gameState.resources.reputation -= 25;
            this.gameState.income.rice -= 20;
            this.gameState.income.gold -= 15;
        }
    }
    
    triggerWar() {
        const warDuration = Math.floor(Math.random() * 6) + 3; // 3-8ヶ月
        this.addEvent(`戦争が始まりました。予想される期間: ${warDuration}ヶ月`);
        
        // 戦争中の月次イベント
        for (let i = 0; i < warDuration; i++) {
            setTimeout(() => {
                this.processWarMonth();
            }, i * 1000); // 1秒間隔で処理
        }
    }
    
    processWarMonth() {
        const battleResult = Math.random();
        
        if (battleResult > 0.6) {
            this.addEvent('戦場で勝利しました。');
            this.gameState.resources.military -= Math.floor(this.gameState.resources.military * 0.1);
            this.gameState.resources.gold += 50;
        } else if (battleResult > 0.3) {
            this.addEvent('戦場で引き分けました。');
            this.gameState.resources.military -= Math.floor(this.gameState.resources.military * 0.15);
        } else {
            this.addEvent('戦場で敗北しました。');
            this.gameState.resources.military -= Math.floor(this.gameState.resources.military * 0.25);
            this.gameState.resources.population -= 100;
        }
        
        // 戦争継続コスト
        this.gameState.resources.gold -= 100;
        this.gameState.resources.rice -= 200;
        
        this.updateDisplay();
    }
    
    processActiveActions() {
        // 進行中のアクションの処理（将来の拡張用）
        this.gameState.activeActions = this.gameState.activeActions.filter(action => {
            action.duration--;
            if (action.duration <= 0) {
                action.complete();
                return false;
            }
            return true;
        });
    }
    
    // 鍛錬・訓練アクション
    trainSwordsmanship() {
        const cost = { gold: 40 };
        if (this.spendResources(cost)) {
            this.gameState.stats.swordsmanship += 3;
            this.gameState.resources.military += 8;
            this.addEvent('剣術訓練を完了しました。戦闘力が向上しました。');
        }
    }
    
    studyStrategy() {
        const cost = { gold: 80 };
        if (this.spendResources(cost)) {
            this.gameState.stats.strategy += 5;
            this.gameState.stats.leadership += 2;
            this.addEvent('兵法研究を完了しました。戦略能力が向上しました。');
        }
    }
    
    trainPhysical() {
        const cost = { gold: 25 };
        if (this.spendResources(cost)) {
            this.gameState.stats.physical += 4;
            this.gameState.resources.population += 3;
            this.addEvent('体力鍛錬を完了しました。健康状態が改善しました。');
        }
    }
    
    // 農業・栽培アクション
    developFarmland() {
        const cost = { gold: 150, population: 30 };
        if (this.spendResources(cost)) {
            this.gameState.development.farmland += 1;
            this.gameState.income.rice += 15;
            this.addEvent('新しい田畑を開墾しました。米の生産量が増加しました。');
        }
    }
    
    improveIrrigation() {
        const cost = { gold: 120 };
        if (this.spendResources(cost)) {
            this.gameState.development.irrigation += 1;
            this.gameState.income.rice += 12;
            this.addEvent('灌漑整備を完了しました。農地の生産性が向上しました。');
        }
    }
    
    introduceNewCrop() {
        const cost = { gold: 80 };
        if (this.spendResources(cost)) {
            this.gameState.income.rice += 8;
            this.gameState.income.gold += 3;
            this.addEvent('新しい作物を導入しました。収入が増加しました。');
        }
    }
    
    // 政治・統治アクション
    reformTax() {
        const cost = { gold: 250 };
        if (this.spendResources(cost)) {
            this.gameState.income.gold += 15;
            this.gameState.resources.reputation += 3;
            this.addEvent('税制改革を実施しました。税収が安定しました。');
        }
    }
    
    establishLaws() {
        const cost = { gold: 200 };
        if (this.spendResources(cost)) {
            this.gameState.development.laws += 1;
            this.gameState.income.population += 3;
            this.addEvent('法制度を整備しました。領内の治安が向上しました。');
        }
    }
    
    diplomacy() {
        const cost = { gold: 150 };
        if (this.spendResources(cost)) {
            this.gameState.stats.diplomacy += 3;
            this.gameState.resources.reputation += 10;
            this.addEvent('外交活動を実施しました。他国との関係が改善しました。');
        }
    }
    
    // 軍事・防衛アクション
    recruitSoldiers() {
        const cost = { gold: 120, rice: 80 };
        if (this.spendResources(cost)) {
            this.gameState.resources.military += 40;
            this.addEvent('新しい兵士を募集しました。兵力が増強されました。');
        }
    }
    
    buildCastle() {
        const cost = { gold: 400, population: 80 };
        if (this.spendResources(cost)) {
            this.gameState.development.castle += 1;
            this.gameState.income.military += 8;
            this.addEvent('城郭を建設しました。防御力が大幅に向上しました。');
        }
    }
    
    manufactureWeapons() {
        const cost = { gold: 150 };
        if (this.spendResources(cost)) {
            this.gameState.resources.military += 25;
            this.gameState.stats.swordsmanship += 2;
            this.addEvent('新しい武器を製造しました。装備が改良されました。');
        }
    }
    
    // セーブ・ロード機能
    saveGame() {
        const saveData = {
            gameState: this.gameState,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('bushiLifeSave', JSON.stringify(saveData));
        this.addEvent('ゲームを保存しました。');
    }
    
    loadGame() {
        const saveData = localStorage.getItem('bushiLifeSave');
        if (saveData) {
            try {
                const parsed = JSON.parse(saveData);
                this.gameState = parsed.gameState;
                this.updateDisplay();
                this.updateTerritoryMap();
                this.addEvent('ゲームを読み込みました。');
            } catch (error) {
                console.error('セーブデータの読み込みに失敗しました:', error);
                this.addEvent('セーブデータの読み込みに失敗しました。');
            }
        }
    }
    
    // 領地マップシステム
    initTerritoryMap() {
        this.canvas = document.getElementById('territoryCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.characters = [];
        this.animationFrame = 0;
        
        // キャラクターの初期化
        this.initCharacters();
        
        // アニメーション開始
        this.startAnimation();
    }
    
    initCharacters() {
        this.characters = [
            // 領民
            { type: 'villager', x: 50, y: 200, direction: 1, speed: 0.5, color: '#2c1810' },
            { type: 'villager', x: 150, y: 180, direction: -1, speed: 0.3, color: '#2c1810' },
            { type: 'villager', x: 250, y: 220, direction: 1, speed: 0.4, color: '#2c1810' },
            { type: 'villager', x: 350, y: 190, direction: -1, speed: 0.6, color: '#2c1810' },
            
            // 家臣
            { type: 'samurai', x: 100, y: 150, direction: 1, speed: 0.2, color: '#8b0000' },
            { type: 'samurai', x: 300, y: 160, direction: -1, speed: 0.3, color: '#8b0000' },
            
            // 領主（プレイヤー）
            { type: 'lord', x: 200, y: 100, direction: 1, speed: 0.1, color: '#ffd700' }
        ];
    }
    
    updateTerritoryMap() {
        this.drawTerritoryMap();
        this.updateCastleInfo();
    }
    
    drawTerritoryMap() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // 背景をクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 水墨画風の背景
        this.drawBackground();
        
        // 地形の描画
        this.drawTerrain();
        
        // 城の描画
        this.drawCastle();
        
        // キャラクターの描画
        this.drawCharacters();
    }
    
    drawBackground() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // グラデーション背景（水墨画風）
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#f5f5dc');
        gradient.addColorStop(0.3, '#e6e6d3');
        gradient.addColorStop(0.7, '#d3d3c7');
        gradient.addColorStop(1, '#c0c0b8');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 雲の効果
        this.drawClouds();
    }
    
    drawClouds() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        ctx.fillStyle = 'rgba(200, 200, 200, 0.1)';
        
        // 雲を描画
        for (let i = 0; i < 3; i++) {
            const x = (canvas.width / 3) * i + Math.sin(this.animationFrame * 0.01 + i) * 20;
            const y = 50 + Math.sin(this.animationFrame * 0.005 + i) * 10;
            
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.arc(x + 20, y, 25, 0, Math.PI * 2);
            ctx.arc(x + 40, y, 20, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawTerrain() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // 河川の描画（水墨画風）
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.7);
        ctx.quadraticCurveTo(canvas.width * 0.3, canvas.height * 0.6, canvas.width * 0.7, canvas.height * 0.8);
        ctx.quadraticCurveTo(canvas.width, canvas.height * 0.75, canvas.width, canvas.height * 0.9);
        ctx.stroke();
        
        // 河川の内側（水の表現）
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.7);
        ctx.quadraticCurveTo(canvas.width * 0.3, canvas.height * 0.6, canvas.width * 0.7, canvas.height * 0.8);
        ctx.quadraticCurveTo(canvas.width, canvas.height * 0.75, canvas.width, canvas.height * 0.9);
        ctx.stroke();
        
        // 農地の描画
        this.drawFarmland();
        
        // 山の描画
        this.drawMountains();
        
        // 木の描画
        this.drawTrees();
    }
    
    drawFarmland() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        const farmlandLevel = this.gameState.development.farmland;
        
        // 農地の数に応じて描画
        for (let i = 0; i < Math.min(farmlandLevel, 5); i++) {
            const x = 50 + (i * 70);
            const y = canvas.height * 0.6 + Math.sin(i) * 20;
            
            // 田んぼの区画（水墨画風）
            ctx.fillStyle = '#d4d4aa';
            ctx.fillRect(x, y, 60, 40);
            
            // 田んぼの境界線
            ctx.strokeStyle = '#2c1810';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, 60, 40);
            
            // 稲の表現（水墨画風）
            ctx.fillStyle = '#2c1810';
            for (let j = 0; j < 4; j++) {
                for (let k = 0; k < 3; k++) {
                    // 稲を水墨画風に描画
                    ctx.beginPath();
                    ctx.moveTo(x + 10 + j * 15, y + 30);
                    ctx.lineTo(x + 10 + j * 15, y + 25 - k * 8);
                    ctx.stroke();
                }
            }
        }
    }
    
    drawMountains() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // 遠景の山（水墨画風）
        ctx.fillStyle = '#b8b8b8';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.4);
        ctx.lineTo(canvas.width * 0.2, canvas.height * 0.2);
        ctx.lineTo(canvas.width * 0.4, canvas.height * 0.3);
        ctx.lineTo(canvas.width * 0.6, canvas.height * 0.15);
        ctx.lineTo(canvas.width * 0.8, canvas.height * 0.25);
        ctx.lineTo(canvas.width, canvas.height * 0.35);
        ctx.lineTo(canvas.width, canvas.height * 0.4);
        ctx.closePath();
        ctx.fill();
        
        // 山の輪郭（水墨画風）
        ctx.strokeStyle = '#2c1810';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 山の陰影
        ctx.fillStyle = 'rgba(44, 24, 16, 0.2)';
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.2, canvas.height * 0.2);
        ctx.lineTo(canvas.width * 0.4, canvas.height * 0.3);
        ctx.lineTo(canvas.width * 0.4, canvas.height * 0.4);
        ctx.lineTo(canvas.width * 0.2, canvas.height * 0.4);
        ctx.closePath();
        ctx.fill();
    }
    
    drawTrees() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // 木の位置
        const treePositions = [
            { x: 80, y: canvas.height * 0.5 },
            { x: 320, y: canvas.height * 0.45 },
            { x: 150, y: canvas.height * 0.55 }
        ];
        
        treePositions.forEach(tree => {
            // 木の幹
            ctx.fillStyle = '#2c1810';
            ctx.fillRect(tree.x - 2, tree.y, 4, 20);
            
            // 木の葉（水墨画風）
            ctx.fillStyle = '#2c1810';
            ctx.beginPath();
            ctx.arc(tree.x, tree.y - 10, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // 葉の詳細
            ctx.fillStyle = 'rgba(44, 24, 16, 0.3)';
            ctx.beginPath();
            ctx.arc(tree.x - 5, tree.y - 15, 8, 0, Math.PI * 2);
            ctx.arc(tree.x + 5, tree.y - 12, 10, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    drawCastle() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const reputation = this.gameState.resources.reputation;
        const castleLevel = this.gameState.development.castle;
        
        const x = canvas.width * 0.5;
        const y = canvas.height * 0.3;
        
        // 城の基本サイズ（名声と城レベルに応じて変化）
        const baseSize = 20 + (reputation / 10) + (castleLevel * 5);
        const luxury = Math.min(reputation / 50, 3); // 豪華さレベル
        
        // 城の色（名声に応じて変化）
        let castleColor = '#8b4513'; // 基本色
        if (reputation > 100) castleColor = '#a0522d';
        if (reputation > 200) castleColor = '#cd853f';
        if (reputation > 300) castleColor = '#daa520';
        
        // 城の描画
        ctx.fillStyle = castleColor;
        
        // 天守閣
        ctx.fillRect(x - baseSize/2, y - baseSize, baseSize, baseSize);
        
        // 屋根
        ctx.fillStyle = '#2c1810';
        ctx.beginPath();
        ctx.moveTo(x - baseSize/2 - 5, y - baseSize);
        ctx.lineTo(x, y - baseSize - 15);
        ctx.lineTo(x + baseSize/2 + 5, y - baseSize);
        ctx.closePath();
        ctx.fill();
        
        // 豪華さに応じた装飾
        if (luxury >= 1) {
            // 装飾的な屋根
            ctx.fillStyle = '#8b0000';
            ctx.fillRect(x - baseSize/4, y - baseSize - 20, baseSize/2, 5);
        }
        
        if (luxury >= 2) {
            // 旗
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(x + baseSize/2, y - baseSize/2, 8, 20);
        }
        
        if (luxury >= 3) {
            // 追加の建物
            ctx.fillStyle = castleColor;
            ctx.fillRect(x - baseSize, y - baseSize/2, baseSize/2, baseSize/2);
            ctx.fillRect(x + baseSize/2, y - baseSize/2, baseSize/2, baseSize/2);
        }
        
        // 城の輪郭
        ctx.strokeStyle = '#2c1810';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - baseSize/2, y - baseSize, baseSize, baseSize);
    }
    
    drawCharacters() {
        const ctx = this.ctx;
        
        this.characters.forEach(character => {
            // キャラクターの位置を更新
            character.x += character.direction * character.speed;
            
            // 画面端で方向転換
            if (character.x < 10 || character.x > this.canvas.width - 10) {
                character.direction *= -1;
            }
            
            // キャラクターの描画（水墨画風）
            ctx.fillStyle = character.color;
            ctx.strokeStyle = character.color;
            ctx.lineWidth = 1;
            
            if (character.type === 'villager') {
                // 領民（水墨画風の人物）
                this.drawVillager(character.x, character.y, character.direction);
            } else if (character.type === 'samurai') {
                // 家臣（侍）
                this.drawSamurai(character.x, character.y, character.direction);
            } else if (character.type === 'lord') {
                // 領主（大名）
                this.drawLord(character.x, character.y, character.direction);
            }
        });
    }
    
    drawVillager(x, y, direction) {
        const ctx = this.ctx;
        
        // 体
        ctx.fillStyle = '#2c1810';
        ctx.fillRect(x - 2, y - 8, 4, 12);
        
        // 頭
        ctx.beginPath();
        ctx.arc(x, y - 10, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 足（歩行の表現）
        const walkOffset = Math.sin(this.animationFrame * 0.1) * 1;
        ctx.fillRect(x - 3, y + 4, 2, 4);
        ctx.fillRect(x + 1, y + 4 + walkOffset, 2, 4);
    }
    
    drawSamurai(x, y, direction) {
        const ctx = this.ctx;
        
        // 体（侍の鎧）
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(x - 3, y - 10, 6, 15);
        
        // 頭
        ctx.fillStyle = '#2c1810';
        ctx.beginPath();
        ctx.arc(x, y - 12, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 刀
        ctx.strokeStyle = '#2c1810';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 4, y - 5);
        ctx.lineTo(x + 8, y - 8);
        ctx.stroke();
        
        // 足
        ctx.fillStyle = '#2c1810';
        ctx.fillRect(x - 2, y + 5, 2, 6);
        ctx.fillRect(x, y + 5, 2, 6);
    }
    
    drawLord(x, y, direction) {
        const ctx = this.ctx;
        
        // 体（豪華な衣装）
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x - 4, y - 12, 8, 18);
        
        // 頭
        ctx.fillStyle = '#2c1810';
        ctx.beginPath();
        ctx.arc(x, y - 14, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // 冠
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(x - 3, y - 18, 6, 4);
        
        // 装飾
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x - 1, y - 17, 2, 2);
        
        // 足
        ctx.fillStyle = '#2c1810';
        ctx.fillRect(x - 3, y + 6, 3, 8);
        ctx.fillRect(x, y + 6, 3, 8);
    }
    
    drawStar(x, y, outerRadius, innerRadius, points) {
        const ctx = this.ctx;
        ctx.beginPath();
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    updateCastleInfo() {
        const reputation = this.gameState.resources.reputation;
        const castleLevel = this.gameState.development.castle;
        
        let castleName = '質素な城';
        if (reputation > 100) castleName = '立派な城';
        if (reputation > 200) castleName = '豪華な城';
        if (reputation > 300) castleName = '天下の名城';
        
        document.getElementById('castleName').textContent = castleName;
        document.getElementById('castleLevel').textContent = `Lv.${castleLevel}`;
    }
    
    startAnimation() {
        const animate = () => {
            this.animationFrame++;
            this.drawTerritoryMap();
            requestAnimationFrame(animate);
        };
        animate();
    }
}

// グローバル関数（HTMLから呼び出し用）
let game;

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    game = new BushiLifeGame();
});

// HTMLから呼び出される関数
function trainSwordsmanship() { game.trainSwordsmanship(); }
function studyStrategy() { game.studyStrategy(); }
function trainPhysical() { game.trainPhysical(); }
function developFarmland() { game.developFarmland(); }
function improveIrrigation() { game.improveIrrigation(); }
function introduceNewCrop() { game.introduceNewCrop(); }
function reformTax() { game.reformTax(); }
function establishLaws() { game.establishLaws(); }
function diplomacy() { game.diplomacy(); }
function recruitSoldiers() { game.recruitSoldiers(); }
function buildCastle() { game.buildCastle(); }
function manufactureWeapons() { game.manufactureWeapons(); }
