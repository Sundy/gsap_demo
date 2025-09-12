// 键盘指法练习课程 - 主要功能模块

// 全局状态管理
const TypingCourse = {
    // 当前状态
    currentTab: 'tutorial',
    currentLevel: 'letters',
    currentGameMode: null,
    
    // 练习数据
    practiceData: {
        letters: ['asdf', 'jkl;', 'gh', 'we', 'io', 'qp', 'rt', 'yu', 'zx', 'cv', 'bn', 'm,./'],
        words: ['the', 'and', 'for', 'you', 'all', 'not', 'but', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did'],
        sentences: [
            'The quick brown fox jumps over the lazy dog.',
            'Pack my box with five dozen liquor jugs.',
            'How vexingly quick daft zebras jump!',
            'Bright vixens jump; dozy fowl quack.',
            'Sphinx of black quartz, judge my vow.'
        ]
    },
    
    // 游戏状态
    gameState: {
        isPlaying: false,
        isPaused: false,
        score: 0,
        lives: 3,
        timer: 60,
        fallingWords: [],
        gameInterval: null,
        spawnInterval: null
    },
    
    // 练习统计
    stats: {
        startTime: null,
        totalChars: 0,
        correctChars: 0,
        errors: 0,
        wpm: 0,
        accuracy: 100
    },
    
    // 成就系统
    achievements: {
        'first-practice': false,
        'speed-demon': false,
        'perfect-accuracy': false,
        'marathon': false
    }
};

// 键盘映射 - 定义每个键对应的手指
const keyFingerMap = {
    '`': 'left-pinky', '1': 'left-pinky', '2': 'left-ring', '3': 'left-middle', '4': 'left-index', '5': 'left-index',
    '6': 'right-index', '7': 'right-index', '8': 'right-middle', '9': 'right-ring', '0': 'right-pinky', '-': 'right-pinky', '=': 'right-pinky',
    'q': 'left-pinky', 'w': 'left-ring', 'e': 'left-middle', 'r': 'left-index', 't': 'left-index',
    'y': 'right-index', 'u': 'right-index', 'i': 'right-middle', 'o': 'right-ring', 'p': 'right-pinky', '[': 'right-pinky', ']': 'right-pinky',
    'a': 'left-pinky', 's': 'left-ring', 'd': 'left-middle', 'f': 'left-index', 'g': 'left-index',
    'h': 'right-index', 'j': 'right-index', 'k': 'right-middle', 'l': 'right-ring', ';': 'right-pinky', "'": 'right-pinky',
    'z': 'left-pinky', 'x': 'left-ring', 'c': 'left-middle', 'v': 'left-index', 'b': 'left-index',
    'n': 'right-index', 'm': 'right-index', ',': 'right-middle', '.': 'right-ring', '/': 'right-pinky',
    ' ': 'thumb'
};

// 初始化应用
function initApp() {
    setupTabNavigation();
    setupKeyboardInteraction();
    setupPracticeMode();
    setupGameMode();
    setupFloatingTips();
    loadAchievements();
    
    console.log('键盘指法练习课程已初始化');
}

// 设置标签页导航
function setupTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // 更新按钮状态
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新内容显示
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
            
            TypingCourse.currentTab = targetTab;
            
            // 标签页切换动画
            animateTabSwitch(targetTab);
        });
    });
}

// 设置键盘交互功能
function setupKeyboardInteraction() {
    const keys = document.querySelectorAll('.key');
    
    // 键盘按下事件
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        const keyElement = findKeyElement(key);
        
        if (keyElement) {
            keyElement.classList.add('active');
            highlightFingerGuide(keyElement.dataset.finger);
        }
    });
    
    // 键盘释放事件
    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        const keyElement = findKeyElement(key);
        
        if (keyElement) {
            keyElement.classList.remove('active');
            removeFingerHighlight();
        }
    });
    
    // 鼠标悬停显示手指对应
    keys.forEach(key => {
        key.addEventListener('mouseenter', () => {
            highlightFingerGuide(key.dataset.finger);
        });
        
        key.addEventListener('mouseleave', () => {
            removeFingerHighlight();
        });
    });
}

// 查找键盘元素
function findKeyElement(key) {
    const keys = document.querySelectorAll('.key');
    return Array.from(keys).find(k => k.textContent.toLowerCase() === key);
}

// 高亮手指指南
function highlightFingerGuide(fingerType) {
    const fingerItems = document.querySelectorAll('.finger-item');
    fingerItems.forEach(item => {
        const fingerColor = item.querySelector('.finger-color');
        if (fingerColor.classList.contains(fingerType)) {
            item.style.transform = 'scale(1.2)';
            item.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            item.style.color = 'white';
        }
    });
}

// 移除手指高亮
function removeFingerHighlight() {
    const fingerItems = document.querySelectorAll('.finger-item');
    fingerItems.forEach(item => {
        item.style.transform = '';
        item.style.background = '';
        item.style.color = '';
    });
}

// 设置练习模式
function setupPracticeMode() {
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const startBtn = document.getElementById('startPractice');
    const resetBtn = document.getElementById('resetPractice');
    const practiceInput = document.getElementById('practiceInput');
    
    // 难度选择
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            TypingCourse.currentLevel = btn.dataset.level;
            generatePracticeText();
        });
    });
    
    // 开始练习
    startBtn.addEventListener('click', startPractice);
    
    // 重新开始
    resetBtn.addEventListener('click', resetPractice);
    
    // 输入监听
    practiceInput.addEventListener('input', handlePracticeInput);
    
    // 初始化练习文本
    generatePracticeText();
}

// 生成练习文本
function generatePracticeText() {
    const targetText = document.getElementById('targetText');
    const level = TypingCourse.currentLevel;
    const data = TypingCourse.practiceData[level];
    
    let text = '';
    if (level === 'letters') {
        // 随机选择字母组合
        for (let i = 0; i < 5; i++) {
            text += data[Math.floor(Math.random() * data.length)] + ' ';
        }
    } else if (level === 'words') {
        // 随机选择单词
        for (let i = 0; i < 8; i++) {
            text += data[Math.floor(Math.random() * data.length)] + ' ';
        }
    } else {
        // 随机选择句子
        text = data[Math.floor(Math.random() * data.length)];
    }
    
    targetText.textContent = text.trim();
    formatTargetText();
}

// 格式化目标文本
function formatTargetText() {
    const targetText = document.getElementById('targetText');
    const text = targetText.textContent;
    
    targetText.innerHTML = text.split('').map((char, index) => 
        `<span class="char" data-index="${index}">${char}</span>`
    ).join('');
}

// 开始练习
function startPractice() {
    const practiceInput = document.getElementById('practiceInput');
    
    // 重置统计
    TypingCourse.stats = {
        startTime: Date.now(),
        totalChars: 0,
        correctChars: 0,
        errors: 0,
        wpm: 0,
        accuracy: 100
    };
    
    practiceInput.value = '';
    practiceInput.focus();
    practiceInput.disabled = false;
    
    // 开始统计更新
    updateStatsInterval = setInterval(updateStats, 100);
    
    // 解锁成就
    unlockAchievement('first-practice');
}

// 重置练习
function resetPractice() {
    const practiceInput = document.getElementById('practiceInput');
    
    practiceInput.value = '';
    practiceInput.disabled = false;
    
    // 清除所有字符状态
    const chars = document.querySelectorAll('.target-text .char');
    chars.forEach(char => {
        char.classList.remove('correct', 'incorrect', 'current');
    });
    
    // 重置统计
    document.getElementById('wpm').textContent = '0';
    document.getElementById('accuracy').textContent = '100';
    document.getElementById('progress').textContent = '0';
    
    if (updateStatsInterval) {
        clearInterval(updateStatsInterval);
    }
    
    generatePracticeText();
}

// 处理练习输入
function handlePracticeInput(e) {
    const input = e.target.value;
    const targetText = document.getElementById('targetText').textContent;
    const chars = document.querySelectorAll('.target-text .char');
    
    // 清除之前的状态
    chars.forEach(char => {
        char.classList.remove('correct', 'incorrect', 'current');
    });
    
    // 检查每个字符
    for (let i = 0; i < input.length; i++) {
        if (i < chars.length) {
            if (input[i] === targetText[i]) {
                chars[i].classList.add('correct');
                TypingCourse.stats.correctChars++;
            } else {
                chars[i].classList.add('incorrect');
                TypingCourse.stats.errors++;
            }
        }
    }
    
    // 标记当前位置
    if (input.length < chars.length) {
        chars[input.length].classList.add('current');
    }
    
    TypingCourse.stats.totalChars = input.length;
    
    // 检查是否完成
    if (input === targetText) {
        completePractice();
    }
}

// 完成练习
function completePractice() {
    const practiceInput = document.getElementById('practiceInput');
    practiceInput.disabled = true;
    
    if (updateStatsInterval) {
        clearInterval(updateStatsInterval);
    }
    
    // 检查成就
    if (TypingCourse.stats.wpm >= 50) {
        unlockAchievement('speed-demon');
    }
    
    if (TypingCourse.stats.accuracy === 100) {
        unlockAchievement('perfect-accuracy');
    }
    
    // 显示完成动画
    animateCompletion();
    
    // 3秒后生成新文本
    setTimeout(() => {
        generatePracticeText();
        resetPractice();
    }, 3000);
}

// 更新统计信息
function updateStats() {
    if (!TypingCourse.stats.startTime) return;
    
    const elapsed = (Date.now() - TypingCourse.stats.startTime) / 1000 / 60; // 分钟
    const totalChars = TypingCourse.stats.totalChars;
    const correctChars = TypingCourse.stats.correctChars;
    const targetLength = document.getElementById('targetText').textContent.length;
    
    // 计算WPM (每分钟字符数除以5)
    TypingCourse.stats.wpm = elapsed > 0 ? Math.round((correctChars / 5) / elapsed) : 0;
    
    // 计算准确率
    TypingCourse.stats.accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    
    // 计算进度
    const progress = Math.round((totalChars / targetLength) * 100);
    
    // 更新显示
    document.getElementById('wpm').textContent = TypingCourse.stats.wpm;
    document.getElementById('accuracy').textContent = TypingCourse.stats.accuracy;
    document.getElementById('progress').textContent = Math.min(progress, 100);
}

// 设置游戏模式
function setupGameMode() {
    const gameModeCards = document.querySelectorAll('.game-mode-card');
    const startGameBtn = document.getElementById('startGame');
    const pauseGameBtn = document.getElementById('pauseGame');
    const endGameBtn = document.getElementById('endGame');
    const gameInput = document.getElementById('gameInput');
    
    // 游戏模式选择
    gameModeCards.forEach(card => {
        card.addEventListener('click', () => {
            TypingCourse.currentGameMode = card.dataset.mode;
            document.querySelector('.game-area').style.display = 'block';
            initGameMode(card.dataset.mode);
        });
    });
    
    // 游戏控制
    startGameBtn.addEventListener('click', startGame);
    pauseGameBtn.addEventListener('click', pauseGame);
    endGameBtn.addEventListener('click', endGame);
    
    // 游戏输入
    gameInput.addEventListener('input', handleGameInput);
    gameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            checkGameInput();
        }
    });
}

// 初始化游戏模式
function initGameMode(mode) {
    const gameState = TypingCourse.gameState;
    
    switch (mode) {
        case 'speed':
            gameState.timer = 60;
            gameState.lives = Infinity;
            break;
        case 'accuracy':
            gameState.timer = 120;
            gameState.lives = Infinity;
            break;
        case 'survival':
            gameState.timer = Infinity;
            gameState.lives = 3;
            break;
    }
    
    gameState.score = 0;
    updateGameDisplay();
}

// 开始游戏
function startGame() {
    const gameState = TypingCourse.gameState;
    
    gameState.isPlaying = true;
    gameState.isPaused = false;
    
    // 开始游戏循环
    gameState.gameInterval = setInterval(updateGame, 1000);
    gameState.spawnInterval = setInterval(spawnFallingWord, 2000);
    
    document.getElementById('gameInput').focus();
}

// 暂停游戏
function pauseGame() {
    const gameState = TypingCourse.gameState;
    
    if (gameState.isPlaying) {
        gameState.isPaused = !gameState.isPaused;
        
        if (gameState.isPaused) {
            clearInterval(gameState.gameInterval);
            clearInterval(gameState.spawnInterval);
        } else {
            gameState.gameInterval = setInterval(updateGame, 1000);
            gameState.spawnInterval = setInterval(spawnFallingWord, 2000);
        }
    }
}

// 结束游戏
function endGame() {
    const gameState = TypingCourse.gameState;
    
    gameState.isPlaying = false;
    gameState.isPaused = false;
    
    clearInterval(gameState.gameInterval);
    clearInterval(gameState.spawnInterval);
    
    // 清除下落的单词
    document.getElementById('fallingText').innerHTML = '';
    gameState.fallingWords = [];
    
    // 显示游戏结果
    showGameResult();
}

// 生成下落单词
function spawnFallingWord() {
    if (!TypingCourse.gameState.isPlaying || TypingCourse.gameState.isPaused) return;
    
    const words = TypingCourse.practiceData.words;
    const word = words[Math.floor(Math.random() * words.length)];
    
    const wordElement = document.createElement('div');
    wordElement.className = 'falling-word';
    wordElement.textContent = word;
    wordElement.style.left = Math.random() * 80 + '%';
    wordElement.style.animationDuration = (Math.random() * 3 + 4) + 's';
    
    document.getElementById('fallingText').appendChild(wordElement);
    TypingCourse.gameState.fallingWords.push({
        element: wordElement,
        word: word,
        active: true
    });
    
    // 监听动画结束
    wordElement.addEventListener('animationend', () => {
        if (wordElement.parentNode) {
            wordElement.remove();
            // 生存模式下扣生命
            if (TypingCourse.currentGameMode === 'survival') {
                TypingCourse.gameState.lives--;
                updateGameDisplay();
                
                if (TypingCourse.gameState.lives <= 0) {
                    endGame();
                }
            }
        }
    });
}

// 处理游戏输入
function handleGameInput(e) {
    // 实时检查输入是否匹配任何下落的单词
    const input = e.target.value.toLowerCase().trim();
    const fallingWords = TypingCourse.gameState.fallingWords;
    
    fallingWords.forEach(wordObj => {
        if (wordObj.active && wordObj.word.startsWith(input)) {
            wordObj.element.style.background = '#4CAF50';
        } else if (wordObj.active) {
            wordObj.element.style.background = '';
        }
    });
}

// 检查游戏输入
function checkGameInput() {
    const gameInput = document.getElementById('gameInput');
    const input = gameInput.value.toLowerCase().trim();
    
    if (!input) return;
    
    const fallingWords = TypingCourse.gameState.fallingWords;
    let hit = false;
    
    // 检查是否击中任何单词
    fallingWords.forEach(wordObj => {
        if (wordObj.active && wordObj.word === input) {
            hit = true;
            wordObj.active = false;
            
            // 击中动画
            wordObj.element.classList.add('hit');
            setTimeout(() => {
                if (wordObj.element.parentNode) {
                    wordObj.element.remove();
                }
            }, 300);
            
            // 增加分数
            TypingCourse.gameState.score += input.length * 10;
            updateGameDisplay();
        }
    });
    
    if (!hit && TypingCourse.currentGameMode === 'accuracy') {
        // 准确模式下错误扣分
        TypingCourse.gameState.score = Math.max(0, TypingCourse.gameState.score - 50);
        updateGameDisplay();
    }
    
    gameInput.value = '';
}

// 更新游戏
function updateGame() {
    const gameState = TypingCourse.gameState;
    
    if (gameState.timer !== Infinity) {
        gameState.timer--;
        
        if (gameState.timer <= 0) {
            endGame();
            return;
        }
    }
    
    updateGameDisplay();
}

// 更新游戏显示
function updateGameDisplay() {
    const gameState = TypingCourse.gameState;
    
    document.getElementById('gameTimer').textContent = 
        gameState.timer === Infinity ? '∞' : gameState.timer;
    document.getElementById('gameScore').textContent = gameState.score;
    
    // 更新生命显示
    const livesDisplay = document.getElementById('gameLives');
    if (gameState.lives === Infinity) {
        livesDisplay.textContent = '∞';
    } else {
        livesDisplay.textContent = '❤️'.repeat(Math.max(0, gameState.lives));
    }
}

// 显示游戏结果
function showGameResult() {
    const score = TypingCourse.gameState.score;
    
    // 创建结果弹窗
    const resultModal = document.createElement('div');
    resultModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    resultModal.innerHTML = `
        <div style="
            background: white;
            padding: 2rem;
            border-radius: 20px;
            text-align: center;
            max-width: 400px;
            width: 90%;
        ">
            <h2 style="margin-bottom: 1rem; color: #667eea;">游戏结束!</h2>
            <p style="font-size: 1.5rem; margin-bottom: 1rem;">最终得分: <strong>${score}</strong></p>
            <button onclick="this.parentElement.parentElement.remove()" style="
                padding: 1rem 2rem;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 600;
            ">确定</button>
        </div>
    `;
    
    document.body.appendChild(resultModal);
}

// 设置浮动提示
function setupFloatingTips() {
    const tips = [
        '保持正确坐姿，手指轻放在键盘上',
        '记住基准键位：ASDF JKL;',
        '不要看键盘，培养肌肉记忆',
        '速度不重要，准确率更关键',
        '定期休息，避免手指疲劳'
    ];
    
    let currentTipIndex = 0;
    
    function showNextTip() {
        const floatingTips = document.getElementById('floatingTips');
        const tipText = floatingTips.querySelector('.tip-text');
        
        tipText.textContent = tips[currentTipIndex];
        floatingTips.classList.add('show');
        
        currentTipIndex = (currentTipIndex + 1) % tips.length;
        
        // 5秒后自动隐藏
        setTimeout(() => {
            floatingTips.classList.remove('show');
        }, 5000);
    }
    
    // 关闭按钮
    document.querySelector('.tip-close').addEventListener('click', () => {
        document.getElementById('floatingTips').classList.remove('show');
    });
    
    // 每30秒显示一个提示
    setInterval(showNextTip, 30000);
    
    // 初始显示
    setTimeout(showNextTip, 3000);
}

// 成就系统
function unlockAchievement(achievementId) {
    if (TypingCourse.achievements[achievementId]) return;
    
    TypingCourse.achievements[achievementId] = true;
    
    // 更新显示
    const achievementElement = document.querySelector(`[data-achievement="${achievementId}"]`);
    if (achievementElement) {
        achievementElement.classList.remove('locked');
        achievementElement.classList.add('unlocked');
        
        // 显示解锁动画
        animateAchievementUnlock(achievementElement);
    }
    
    // 保存到本地存储
    saveAchievements();
}

// 保存成就
function saveAchievements() {
    localStorage.setItem('typingCourseAchievements', JSON.stringify(TypingCourse.achievements));
}

// 加载成就
function loadAchievements() {
    const saved = localStorage.getItem('typingCourseAchievements');
    if (saved) {
        TypingCourse.achievements = { ...TypingCourse.achievements, ...JSON.parse(saved) };
        
        // 更新显示
        Object.keys(TypingCourse.achievements).forEach(achievementId => {
            if (TypingCourse.achievements[achievementId]) {
                const element = document.querySelector(`[data-achievement="${achievementId}"]`);
                if (element) {
                    element.classList.remove('locked');
                    element.classList.add('unlocked');
                }
            }
        });
    }
}

// 动画函数
function animateTabSwitch(tabId) {
    const content = document.getElementById(tabId);
    if (content) {
        content.style.transform = 'translateY(20px)';
        content.style.opacity = '0';
        
        setTimeout(() => {
            content.style.transition = 'all 0.3s ease';
            content.style.transform = 'translateY(0)';
            content.style.opacity = '1';
        }, 50);
    }
}

function animateCompletion() {
    const targetText = document.getElementById('targetText');
    targetText.style.animation = 'pulse 0.5s ease-in-out 3';
    
    setTimeout(() => {
        targetText.style.animation = '';
    }, 1500);
}

function animateAchievementUnlock(element) {
    element.style.animation = 'bounce 0.6s ease-in-out';
    
    // 显示解锁通知
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 1rem 2rem;
        border-radius: 25px;
        z-index: 10000;
        animation: slideDown 0.5s ease-out;
    `;
    
    const achievementName = element.querySelector('h4').textContent;
    notification.textContent = `🎉 解锁成就: ${achievementName}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
        element.style.animation = '';
    }, 3000);
}

// CSS动画定义
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
    }
    
    @keyframes slideDown {
        from { transform: translate(-50%, -100%); }
        to { transform: translate(-50%, 0); }
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);

// 导出全局对象供调试使用
window.TypingCourse = TypingCourse;