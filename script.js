// 儿童Python循环学习网站 - Framer Motion动画脚本

// 全局变量
let isAnimating = false;
let currentStep = 0;
let monacoEditor = null; // Monaco Editor实例

// DOM元素引用
const bear = document.getElementById('bear');
const honeyJars = document.querySelectorAll('.honey-jar');
const consoleElement = document.getElementById('console');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const nextLessonBtn = document.getElementById('nextLessonBtn');
const whileLesson = document.getElementById('whileLesson');
const startWhileBtn = document.getElementById('startWhileBtn');
const backToForBtn = document.getElementById('backToForBtn');

// 音频控制元素
const voiceToggle = document.getElementById('voiceToggle');
const soundToggle = document.getElementById('soundToggle');
const speakIntroBtn = document.getElementById('speakIntro');
const voiceSettingsBtn = document.getElementById('voiceSettings');
const voiceSettingsPanel = document.getElementById('voiceSettingsPanel');
const voiceSelect = document.getElementById('voiceSelect');
const testVoiceBtn = document.getElementById('testVoice');
const closeSettingsBtn = document.getElementById('closeSettings');
const currentVoiceName = document.getElementById('currentVoiceName');
const currentVoiceLang = document.getElementById('currentVoiceLang');

// Web Animations API动画工具函数
function animate(element, keyframes, options = {}) {
    if (!element) return Promise.resolve();
    
    // 转换属性名称映射
    const propMap = {
        'x': 'transform',
        'y': 'transform', 
        'scale': 'transform',
        'rotate': 'transform'
    };
    
    // 处理transform属性
    let transformValues = [];
    const otherKeyframes = {};
    
    Object.keys(keyframes).forEach(prop => {
        const value = keyframes[prop];
        const values = Array.isArray(value) ? value : [value];
        
        if (prop === 'x') {
            values.forEach((v, i) => {
                if (!transformValues[i]) transformValues[i] = {};
                transformValues[i].x = v;
            });
        } else if (prop === 'y') {
            values.forEach((v, i) => {
                if (!transformValues[i]) transformValues[i] = {};
                transformValues[i].y = v;
            });
        } else if (prop === 'scale') {
            values.forEach((v, i) => {
                if (!transformValues[i]) transformValues[i] = {};
                transformValues[i].scale = v;
            });
        } else if (prop === 'rotate') {
            values.forEach((v, i) => {
                if (!transformValues[i]) transformValues[i] = {};
                transformValues[i].rotate = v;
            });
        } else {
            otherKeyframes[prop] = values;
        }
    });
    
    // 构建transform字符串
    if (transformValues.length > 0) {
        otherKeyframes.transform = transformValues.map(tv => {
            let transform = '';
            if (tv.x !== undefined) transform += `translateX(${tv.x}px) `;
            if (tv.y !== undefined) transform += `translateY(${tv.y}px) `;
            if (tv.scale !== undefined) transform += `scale(${tv.scale}) `;
            if (tv.rotate !== undefined) transform += `rotate(${tv.rotate}deg) `;
            return transform.trim();
        });
    }
    
    const webOptions = {
        duration: (options.duration || 1) * 1000,
        easing: options.ease || 'ease',
        fill: 'forwards'
    };
    
    return element.animate(otherKeyframes, webOptions).finished;
}

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，确保页面完全加载
    setTimeout(function() {
        initializeMonacoEditor();
        initializeAnimations();
        setupEventListeners();
        showWelcomeAnimation();
    }, 100);
});

/**
 * 初始化动画设置
 */
function initializeAnimations() {
    // 设置初始状态
    if (bear) {
        bear.style.transform = 'translateX(0px) translateY(-50%) scale(1) rotate(0deg)';
    }
    
    // 为蜂蜜罐添加悬停效果
    honeyJars.forEach((jar, index) => {
        jar.addEventListener('mouseenter', () => {
            if (!jar.classList.contains('eaten')) {
                animate(jar, {
                    scale: 1.2,
                    rotate: 10
                }, { duration: 0.3, ease: 'ease-out' });
            }
        });
        
        jar.addEventListener('mouseleave', () => {
            if (!jar.classList.contains('eaten')) {
                animate(jar, {
                    scale: 1,
                    rotate: 0
                }, { duration: 0.3, ease: 'ease-out' });
            }
        });
    });
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    // 开始动画按钮
    if (startBtn) {
        startBtn.addEventListener('click', startForLoopAnimation);
    }
    
    // 重置按钮
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAnimation);
    }
    
    // 下一课按钮
    if (nextLessonBtn) {
        nextLessonBtn.addEventListener('click', showWhileLesson);
    }
    
    // while循环开始按钮
    if (startWhileBtn) {
        startWhileBtn.addEventListener('click', startWhileLoopAnimation);
    }
    
    // 返回for循环按钮
    if (backToForBtn) {
        backToForBtn.addEventListener('click', showForLesson);
    }
    
    // 小熊点击事件
    if (bear) {
        bear.addEventListener('click', bearWave);
    }
    
    // 蜂蜜罐点击事件
    honeyJars.forEach((jar, index) => {
        jar.addEventListener('click', () => eatHoney(index));
    });
    
    // 练习按钮
    const practiceBtn = document.getElementById('practiceBtn');
    if (practiceBtn) {
        practiceBtn.addEventListener('click', initializePractice);
    }
    
    // 设置音频控制
    setupAudioControls();
}

/**
 * 设置音频控制
 */
function setupAudioControls() {
    // 语音开关
    if (voiceToggle) {
        voiceToggle.addEventListener('click', function() {
            const isEnabled = this.classList.contains('voice-enabled');
            if (isEnabled) {
                this.classList.remove('voice-enabled');
                this.classList.add('voice-disabled');
                this.innerHTML = '🔇 语音';
                if (window.audioManager) {
                    window.audioManager.setVoiceEnabled(false);
                }
            } else {
                this.classList.remove('voice-disabled');
                this.classList.add('voice-enabled');
                this.innerHTML = '🔊 语音';
                if (window.audioManager) {
                    window.audioManager.setVoiceEnabled(true);
                }
            }
        });
    }
    
    // 音效开关
    if (soundToggle) {
        soundToggle.addEventListener('click', function() {
            const isEnabled = this.classList.contains('sound-enabled');
            if (isEnabled) {
                this.classList.remove('sound-enabled');
                this.classList.add('sound-disabled');
                this.innerHTML = '🔇 音效';
                if (window.audioManager) {
                    window.audioManager.setSoundEnabled(false);
                }
            } else {
                this.classList.remove('sound-disabled');
                this.classList.add('sound-enabled');
                this.innerHTML = '🎵 音效';
                if (window.audioManager) {
                    window.audioManager.setSoundEnabled(true);
                }
            }
        });
    }
    
    // 播放介绍按钮
    if (speakIntroBtn) {
        speakIntroBtn.addEventListener('click', speakIntroduction);
    }
    
    // 语音设置按钮
    if (voiceSettingsBtn) {
        voiceSettingsBtn.addEventListener('click', toggleVoiceSettings);
    }
    
    // 关闭设置按钮
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', hideVoiceSettings);
    }
    
    // 测试语音按钮
    if (testVoiceBtn) {
        testVoiceBtn.addEventListener('click', function() {
            if (window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance('你好，我是小熊！');
                const selectedVoice = voiceSelect.value;
                if (selectedVoice) {
                    const voices = window.speechSynthesis.getVoices();
                    utterance.voice = voices.find(voice => voice.name === selectedVoice);
                }
                window.speechSynthesis.speak(utterance);
            }
        });
    }
    
    // 语音选择变化
    if (voiceSelect) {
        voiceSelect.addEventListener('change', updateVoiceInfo);
    }
    
    // 初始化语音设置
    initializeVoiceSettings();
}

/**
 * 显示欢迎动画
 */
function showWelcomeAnimation() {
    // 标题弹跳动画
    const title = document.querySelector('.title');
    if (title) {
        animate(title, {
            scale: [1, 1.1, 1],
            y: [0, -10, 0],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
            }
        });
    }
    
    // 小熊入场动画
    if (bear) {
        animate(bear, {
            scale: [0, 1.2, 1],
            rotate: [0, 360, 0],
            transition: {
                duration: 1.5,
                ease: 'backOut'
            }
        });
    }
    
    // 蜂蜜罐依次出现
    honeyJars.forEach((jar, index) => {
        animate(jar, {
            scale: [0, 1.3, 1],
            rotate: [0, 180, 0],
            transition: {
                duration: 0.8,
                delay: index * 0.2,
                ease: 'backOut'
            }
        });
    });
    
    // 播放欢迎语音
    setTimeout(() => {
        speakIntroduction();
    }, 2000);
}

/**
 * 庆祝动画
 */
function celebrateAnimation() {
    // 小熊庆祝动画 - 更丰富的效果
    if (bear) {
        animate(bear, {
            y: [-50, 0],
            rotate: [0, 720],
            scale: [1, 1.5, 1],
            transition: {
                duration: 1.5,
                ease: 'backOut'
            }
        });
    }
    
    // 创建粒子爆炸效果
    createParticleExplosion();
    
    // 创建彩虹效果
    createRainbowEffect();
    
    // 播放庆祝音效
    if (window.audioManager) {
        window.audioManager.playSound('celebration');
    }
}

/**
 * 创建粒子爆炸效果
 */
function createParticleExplosion() {
    const particles = ['🎉', '🎊', '🌟', '✨', '🎈', '🍯', '🐻', '❤️'];
    const container = document.querySelector('.story-scene');
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.position = 'absolute';
        particle.style.fontSize = '2em';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        particle.style.left = '50%';
        particle.style.top = '50%';
        
        container.appendChild(particle);
        
        // 随机方向和距离
        const angle = (Math.PI * 2 * i) / 20;
        const distance = 100 + Math.random() * 200;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        animate(particle, {
            x: [0, x],
            y: [0, y],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
            scale: [0, 1.5, 0],
            opacity: [1, 1, 0],
            transition: {
                duration: 2,
                ease: 'easeOut'
            }
        }).then(() => {
            particle.remove();
        });
    }
}

/**
 * 创建彩虹效果
 */
function createRainbowEffect() {
    const rainbow = document.createElement('div');
    rainbow.innerHTML = '🌈';
    rainbow.style.position = 'fixed';
    rainbow.style.fontSize = '5em';
    rainbow.style.left = '50%';
    rainbow.style.top = '20%';
    rainbow.style.transform = 'translateX(-50%)';
    rainbow.style.pointerEvents = 'none';
    rainbow.style.zIndex = '999';
    
    document.body.appendChild(rainbow);
    
    animate(rainbow, {
        scale: [0, 1.5, 1],
        rotate: [0, 360],
        opacity: [0, 1, 0],
        transition: {
            duration: 3,
            ease: 'easeInOut'
        }
    }).then(() => {
        rainbow.remove();
    });
}

/**
 * 初始化Monaco编辑器
 */
function initializeMonacoEditor() {
    // Monaco编辑器初始化代码保持不变
    if (typeof require !== 'undefined') {
        require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.44.0/min/vs' }});
        require(['vs/editor/editor.main'], function () {
            const container = document.getElementById('monacoEditorContainer');
            if (container) {
                monacoEditor = monaco.editor.create(container, {
                    value: '# 在这里编写你的Python代码\nfor i in range(3):\n    print(f"小熊吃掉了第{i+1}个蜂蜜罐 🍯")',
                    language: 'python',
                    theme: 'vs-light',
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollbar: {
                        vertical: 'auto',
                        horizontal: 'auto'
                    }
                });
            }
        });
    }
}

/**
 * 小熊挥手动画
 */
function bearWave() {
    if (isAnimating) return;
    
    animate(bear, {
        rotate: [0, -15, 15, -15, 15, 0],
        scale: [1, 1.1, 1],
        transition: {
            duration: 1,
            ease: 'easeInOut'
        }
    });
    
    // 播放问候语音
    if (window.audioManager) {
        window.audioManager.playSound('bear-greeting');
    }
    
    addConsoleOutput('🐻 小熊向你挥手问好！');
}

/**
 * 小熊跳舞动画
 */
function bearDance() {
    if (isAnimating) return;
    
    const danceSequence = [
        { rotate: -30, scale: 1.1 },
        { rotate: 30, scale: 0.9 },
        { rotate: -30, scale: 1.1 },
        { rotate: 30, scale: 0.9 },
        { rotate: 0, scale: 1 }
    ];
    
    danceSequence.forEach((step, index) => {
        setTimeout(() => {
            animate(bear, {
                ...step,
                transition: {
                    duration: 0.3,
                    ease: 'easeInOut'
                }
            });
        }, index * 300);
    });
}

/**
 * 开始for循环动画 - 增强版
 */
function startForLoopAnimation() {
    if (isAnimating) return;
    
    isAnimating = true;
    
    // 播放开始音效和语音解说
    if (window.audioManager) {
        window.audioManager.playSound('click');
        setTimeout(() => {
            speakForLoopExplanation();
        }, 1000);
    }
    
    currentStep = 0;
    
    // 清空控制台
    clearConsole();
    addConsoleOutput('>>> 开始执行for循环...');
    
    // 禁用按钮
    startBtn.disabled = true;
    
    // 创建动画序列
    animateForLoop();
}

/**
 * for循环动画序列
 */
async function animateForLoop() {
    for (let index = 0; index < honeyJars.length; index++) {
        const jar = honeyJars[index];
        
        // 添加控制台输出
        addConsoleOutput(`小熊吃掉了第${index + 1}个蜂蜜罐 🍯`);
        highlightCodeLine(index);
        
        // 小熊移动到蜂蜜罐位置 - 弹性动画
        await animate(bear, {
            x: jar.offsetLeft - 100
        }, { duration: 0.8, ease: 'ease-out' });
        
        // 播放移动音效
        if (window.audioManager) {
            window.audioManager.playSound('bear-move');
        }
        
        // 小熊旋转 - 更流畅的动画
        await animate(bear, {
            rotate: 360,
            scale: [1, 1.2, 1]
        }, { duration: 0.6, ease: 'ease-out' });
        
        // 蜂蜜罐消失动画 - 更丰富的效果
        await Promise.all([
            animate(jar, {
                scale: [1, 0.5, 0],
                rotate: [0, 180, 360],
                opacity: [1, 0.5, 0]
            }, { duration: 0.8, ease: 'ease-in' }),
            // 同时创建闪烁效果
            createSparkleEffect(jar)
        ]);
        
        jar.classList.add('eaten');
        
        // 小熊复位
        await animate(bear, {
            rotate: 0
        }, { duration: 0.3 });
        
        // 短暂暂停
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 小熊回到起始位置
    await animate(bear, {
        x: 0
    }, { duration: 1, ease: 'ease-out' });
    
    // 动画完成
    isAnimating = false;
    startBtn.disabled = false;
    addConsoleOutput('🎉 循环执行完毕！小熊吃饱了！');
    celebrateAnimation();
}

/**
 * 单独吃蜂蜜动画（点击蜂蜜罐时触发）
 */
async function eatHoney(index) {
    if (isAnimating) return;
    
    const jar = honeyJars[index];
    if (jar.classList.contains('eaten')) return;
    
    // 播放吃蜂蜜音效
    if (window.audioManager) {
        window.audioManager.playSound('honey-eat');
    }
    
    // 小熊移动
    await animate(bear, {
        x: jar.offsetLeft - 100,
        transition: {
            type: 'spring',
            stiffness: 150,
            damping: 20,
            duration: 0.6
        }
    });
    
    // 蜂蜜罐消失
    await animate(jar, {
        scale: [1, 0.5, 0],
        rotate: [0, 180, 360],
        opacity: [1, 0.3, 0],
        transition: {
            duration: 0.6,
            ease: 'backIn'
        }
    });
    
    jar.classList.add('eaten');
    createSparkleEffect(jar);
    addConsoleOutput(`🍯 小熊吃掉了一个蜂蜜罐！`);
    
    // 小熊回到起始位置
    await animate(bear, {
        x: 0,
        transition: {
            type: 'spring',
            stiffness: 150,
            damping: 20,
            duration: 0.6
        }
    });
}

/**
 * 重置动画
 */
function resetAnimation() {
    if (isAnimating) return;
    
    // 重置小熊位置
    animate(bear, {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: 'easeOut'
        }
    });
    
    // 重置蜂蜜罐状态
    honeyJars.forEach((jar, index) => {
        jar.classList.remove('eaten');
        animate(jar, {
            scale: [0, 1.2, 1],
            opacity: [0, 1],
            rotate: [180, 0],
            transition: {
                duration: 0.6,
                delay: index * 0.1,
                ease: 'backOut'
            }
        });
    });
    
    // 清空控制台
    clearConsole();
    addConsoleOutput('>>> 重置完成，准备开始新的循环！');
    
    // 重新启用按钮
    startBtn.disabled = false;
    currentStep = 0;
}

/**
 * 显示while循环课程
 */
function showWhileLesson() {
    const forContent = document.querySelector('.lesson-content');
    const whileContent = document.getElementById('whileLesson');
    
    if (forContent && whileContent) {
        // 隐藏for循环内容
        animate(forContent, {
            opacity: 0,
            x: -50,
            transition: {
                duration: 0.5
            }
        }).then(() => {
            forContent.style.display = 'none';
            whileContent.classList.remove('hidden');
            
            // 显示while循环内容
            animate(whileContent, {
                opacity: [0, 1],
                x: [50, 0],
                transition: {
                    duration: 0.5
                }
            });
        });
    }
}

/**
 * 显示for循环课程
 */
function showForLesson() {
    const forContent = document.querySelector('.lesson-content');
    const whileContent = document.getElementById('whileLesson');
    
    if (forContent && whileContent) {
        // 隐藏while循环内容
        animate(whileContent, {
            opacity: 0,
            x: 50,
            transition: {
                duration: 0.5
            }
        }).then(() => {
            whileContent.classList.add('hidden');
            forContent.style.display = 'flex';
            
            // 显示for循环内容
            animate(forContent, {
                opacity: [0, 1],
                x: [-50, 0],
                transition: {
                    duration: 0.5
                }
            });
        });
    }
}

/**
 * 开始while循环动画
 */
function startWhileLoopAnimation() {
    if (isAnimating) return;
    
    isAnimating = true;
    
    // 播放开始音效和语音解说
    if (window.audioManager) {
        window.audioManager.playSound('click');
        setTimeout(() => {
            speakWhileLoopExplanation();
        }, 1000);
    }
    
    let honeyCount = 0;
    const maxHoney = 3;
    
    clearConsole();
    addConsoleOutput('>>> 开始执行while循环...');
    addConsoleOutput(`honey_count = ${honeyCount}`);
    
    startWhileBtn.disabled = true;
    
    animateWhileLoop(honeyCount, maxHoney);
}

/**
 * while循环动画序列
 */
async function animateWhileLoop(honeyCount, maxHoney) {
    while (honeyCount < maxHoney) {
        addConsoleOutput(`小熊找到了蜂蜜！现在有${honeyCount + 1}个`);
        
        // 创建新的蜂蜜罐
        const newHoney = createHoneyEffect();
        
        // 小熊移动到新蜂蜜位置
        await animate(bear, {
            x: 200 + honeyCount * 100,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 15,
                duration: 0.8
            }
        });
        
        // 小熊收集蜂蜜
        await animate(bear, {
            rotate: 360,
            scale: [1, 1.2, 1],
            transition: {
                duration: 0.6,
                ease: 'backOut'
            }
        });
        
        honeyCount++;
        addConsoleOutput(`honey_count = ${honeyCount}`);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // while循环结束
    addConsoleOutput('小熊终于吃饱了！😊');
    
    // 小熊回到起始位置
    await animate(bear, {
        x: 0,
        rotate: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
            duration: 1
        }
    });
    
    isAnimating = false;
    startWhileBtn.disabled = false;
    celebrateAnimation();
}

/**
 * 创建蜂蜜效果
 */
function createHoneyEffect() {
    const honey = document.createElement('div');
    honey.innerHTML = '🍯';
    honey.style.position = 'absolute';
    honey.style.fontSize = '3em';
    honey.style.left = '200px';
    honey.style.top = '50%';
    honey.style.transform = 'translateY(-50%)';
    
    document.querySelector('.story-scene').appendChild(honey);
    
    // 蜂蜜出现动画
    animate(honey, {
        scale: [0, 1.3, 1],
        rotate: [0, 360],
        transition: {
            duration: 0.8,
            ease: 'backOut'
        }
    });
    
    return honey;
}

/**
 * 创建闪烁效果
 */
function createSparkleEffect(element) {
    const sparkles = ['✨', '⭐', '🌟', '💫'];
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 5; i++) {
        const sparkle = document.createElement('div');
        sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
        sparkle.style.position = 'fixed';
        sparkle.style.left = rect.left + rect.width / 2 + 'px';
        sparkle.style.top = rect.top + rect.height / 2 + 'px';
        sparkle.style.fontSize = '1.5em';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '1000';
        
        document.body.appendChild(sparkle);
        
        const angle = (Math.PI * 2 * i) / 5;
        const distance = 50 + Math.random() * 50;
        
        animate(sparkle, {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            scale: [0, 1, 0],
            rotate: [0, 360],
            opacity: [1, 1, 0],
            transition: {
                duration: 1.5,
                ease: 'easeOut'
            }
        }).then(() => {
            sparkle.remove();
        });
    }
}

/**
 * 高亮代码行
 */
function highlightCodeLine(lineIndex) {
    const codeBlock = document.getElementById('codeBlock');
    if (!codeBlock) return;
    
    // 移除之前的高亮
    const previousHighlight = codeBlock.querySelector('.highlight-line');
    if (previousHighlight) {
        previousHighlight.classList.remove('highlight-line');
    }
    
    // 添加新的高亮（这里简化处理）
    const lines = codeBlock.textContent.split('\n');
    const targetLine = lines.find(line => line.includes('print'));
    if (targetLine) {
        // 创建高亮效果
        codeBlock.style.background = 'linear-gradient(90deg, #fff3cd 0%, #fff3cd 100%)';
        setTimeout(() => {
            codeBlock.style.background = '';
        }, 1000);
    }
}

/**
 * 添加控制台输出
 */
function addConsoleOutput(text) {
    if (!consoleElement) return;
    
    const outputLine = document.createElement('p');
    outputLine.textContent = text;
    outputLine.style.margin = '5px 0';
    outputLine.style.opacity = '0';
    
    consoleElement.appendChild(outputLine);
    
    // 输出动画
    animate(outputLine, {
        opacity: [0, 1],
        x: [-20, 0],
        transition: {
            duration: 0.5,
            ease: 'easeOut'
        }
    });
    
    // 自动滚动到底部
    consoleElement.scrollTop = consoleElement.scrollHeight;
}

/**
 * 清空控制台
 */
function clearConsole() {
    if (consoleElement) {
        consoleElement.innerHTML = '';
    }
}

// 语音相关函数（保持原有功能）
function speakIntroduction() {
    if (window.speechSynthesis && window.audioManager && window.audioManager.isVoiceEnabled()) {
        const text = '欢迎来到小熊学编程！今天我们要学习Python的循环语句。循环可以让我们重复执行相同的操作，就像小熊一个一个吃蜂蜜一样！';
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
    }
}

function speakForLoopExplanation() {
    if (window.speechSynthesis && window.audioManager && window.audioManager.isVoiceEnabled()) {
        const text = 'for循环可以让小熊按照指定的次数重复做事情。现在小熊要一个一个地吃掉所有的蜂蜜罐！';
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
    }
}

function speakWhileLoopExplanation() {
    if (window.speechSynthesis && window.audioManager && window.audioManager.isVoiceEnabled()) {
        const text = 'while循环会一直重复，直到条件不满足为止。小熊会一直找蜂蜜，直到找够指定的数量！';
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
    }
}

// 语音设置相关函数（保持原有功能）
function initializeVoiceSettings() {
    if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = populateVoiceSelect;
        populateVoiceSelect();
    }
}

function populateVoiceSelect() {
    if (!voiceSelect) return;
    
    const voices = window.speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    
    // 优先显示中文语音
    const chineseVoices = voices.filter(voice => 
        voice.lang.includes('zh') || 
        voice.name.includes('Chinese') || 
        voice.name.includes('中文')
    );
    
    const otherVoices = voices.filter(voice => 
        !voice.lang.includes('zh') && 
        !voice.name.includes('Chinese') && 
        !voice.name.includes('中文')
    );
    
    // 添加中文语音选项
    if (chineseVoices.length > 0) {
        const chineseGroup = document.createElement('optgroup');
        chineseGroup.label = '中文语音';
        chineseVoices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            chineseGroup.appendChild(option);
        });
        voiceSelect.appendChild(chineseGroup);
        
        // 默认选择第一个中文语音
        voiceSelect.value = chineseVoices[0].name;
    }
    
    // 添加其他语音选项
    if (otherVoices.length > 0) {
        const otherGroup = document.createElement('optgroup');
        otherGroup.label = '其他语音';
        otherVoices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            otherGroup.appendChild(option);
        });
        voiceSelect.appendChild(otherGroup);
    }
    
    updateVoiceInfo();
}

function updateVoiceInfo() {
    if (!voiceSelect || !currentVoiceName || !currentVoiceLang) return;
    
    const selectedVoiceName = voiceSelect.value;
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.name === selectedVoiceName);
    
    if (selectedVoice) {
        currentVoiceName.textContent = selectedVoice.name;
        currentVoiceLang.textContent = selectedVoice.lang;
    }
}

function toggleVoiceSettings() {
    if (voiceSettingsPanel.classList.contains('hidden')) {
        showVoiceSettings();
    } else {
        hideVoiceSettings();
    }
}

function showVoiceSettings() {
    voiceSettingsPanel.classList.remove('hidden');
    animate(voiceSettingsPanel, {
        opacity: [0, 1],
        scale: [0.8, 1],
        transition: {
            duration: 0.3,
            ease: 'backOut'
        }
    });
}

function hideVoiceSettings() {
    animate(voiceSettingsPanel, {
        opacity: [1, 0],
        scale: [1, 0.8],
        transition: {
            duration: 0.3,
            ease: 'backIn'
        }
    }).then(() => {
        voiceSettingsPanel.classList.add('hidden');
    });
}

// 练习功能相关（简化版本）
function initializePractice() {
    const practiceArea = document.getElementById('practiceArea');
    if (practiceArea) {
        practiceArea.classList.remove('hidden');
        animate(practiceArea, {
            opacity: [0, 1],
            y: [50, 0],
            transition: {
                duration: 0.5,
                ease: 'easeOut'
            }
        });
    }
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (document.hidden && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
});

// 窗口大小变化处理
window.addEventListener('resize', function() {
    if (monacoEditor) {
        monacoEditor.layout();
    }
});