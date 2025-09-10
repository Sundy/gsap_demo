/**
 * 音频管理系统
 * 负责语音合成、音效播放和音频控制
 */
class AudioManager {
    constructor() {
        this.isEnabled = true;
        this.voiceEnabled = true;
        this.soundEnabled = true;
        this.currentSpeech = null;
        this.audioContext = null;
        this.soundEffects = new Map();
        this.voiceQueue = [];
        this.isPlaying = false;
        
        this.init();
    }

    /**
     * 初始化音频系统
     */
    async init() {
        try {
            // 初始化Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 检查语音合成支持
            if ('speechSynthesis' in window) {
                this.speechSynthesis = window.speechSynthesis;
                this.loadVoices();
            } else {
                console.warn('浏览器不支持语音合成');
            }
            
            // 预加载音效
            await this.preloadSoundEffects();
            
            console.log('音频管理系统初始化完成');
        } catch (error) {
            console.error('音频系统初始化失败:', error);
        }
    }

    /**
     * 加载可用的语音
     */
    loadVoices() {
        const voices = this.speechSynthesis.getVoices();
        
        // 优先选择高质量的中文语音
        const chineseVoices = voices.filter(voice => {
            const lang = voice.lang.toLowerCase();
            return lang.includes('zh') || lang.includes('cmn') || 
                   lang.includes('chinese') || voice.name.includes('Chinese');
        });
        
        // 按优先级排序中文语音
        const voicePriority = [
            // macOS 高质量中文语音
            'Ting-Ting', 'Sin-ji', 'Mei-Jia',
            // Windows 中文语音
            'Microsoft Yaoyao', 'Microsoft Kangkang', 'Microsoft Huihui',
            // Google Chrome 中文语音
            'Google 普通话（中国大陆）', 'Google 中文（香港）', 'Google 中文（台湾）'
        ];
        
        // 寻找最佳中文语音
        this.selectedVoice = null;
        for (const priorityName of voicePriority) {
            const voice = chineseVoices.find(v => 
                v.name.includes(priorityName) || v.name === priorityName
            );
            if (voice) {
                this.selectedVoice = voice;
                break;
            }
        }
        
        // 如果没找到优先语音，选择第一个中文语音
        if (!this.selectedVoice && chineseVoices.length > 0) {
            this.selectedVoice = chineseVoices[0];
        }
        
        // 最后备选：任意语音
        if (!this.selectedVoice && voices.length > 0) {
            this.selectedVoice = voices[0];
        }
        
        if (voices.length === 0) {
            // 如果语音还没加载完成，等待加载
            this.speechSynthesis.onvoiceschanged = () => {
                this.loadVoices();
            };
        } else {
            console.log('选择的语音:', this.selectedVoice?.name, this.selectedVoice?.lang);
        }
    }

    /**
     * 预加载音效文件
     */
    async preloadSoundEffects() {
        const soundEffects = {
            'bear-move': this.createBeepSound(220, 0.1), // 小熊移动音效
            'honey-eat': this.createBeepSound(440, 0.2), // 吃蜂蜜音效
            'success': this.createBeepSound(660, 0.3), // 成功音效
            'click': this.createBeepSound(800, 0.05), // 点击音效
            'celebration': this.createCelebrationSound(), // 庆祝音效
        };

        for (const [name, sound] of Object.entries(soundEffects)) {
            this.soundEffects.set(name, sound);
        }
    }

    /**
     * 创建简单的蜂鸣音效
     */
    createBeepSound(frequency, duration) {
        return () => {
            if (!this.soundEnabled || !this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    /**
     * 创建庆祝音效
     */
    createCelebrationSound() {
        return () => {
            if (!this.soundEnabled || !this.audioContext) return;
            
            const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    oscillator.type = 'triangle';
                    
                    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.3);
                }, index * 100);
            });
        };
    }

    /**
     * 播放音效
     */
    playSound(soundName) {
        if (!this.soundEnabled) return;
        
        const sound = this.soundEffects.get(soundName);
        if (sound) {
            try {
                sound();
            } catch (error) {
                console.warn(`播放音效失败: ${soundName}`, error);
            }
        }
    }

    /**
     * 语音播报文本
     */
    speak(text, options = {}) {
        if (!this.voiceEnabled || !this.speechSynthesis) return Promise.resolve();
        
        return new Promise((resolve, reject) => {
            // 停止当前播放的语音
            this.stopSpeech();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // 设置语音参数 - 针对中文优化
            utterance.voice = this.selectedVoice;
            
            // 根据语音类型调整参数
            const isChinese = this.selectedVoice && (
                this.selectedVoice.lang.includes('zh') || 
                this.selectedVoice.lang.includes('cmn') ||
                this.selectedVoice.name.includes('Chinese')
            );
            
            if (isChinese) {
                // 中文语音优化参数
                utterance.rate = options.rate || 0.75;  // 稍慢的语速
                utterance.pitch = options.pitch || 0.95; // 稍低的音调
                utterance.volume = options.volume || 0.9; // 稍大的音量
            } else {
                // 其他语言默认参数
                utterance.rate = options.rate || 0.9;
                utterance.pitch = options.pitch || 1.0;
                utterance.volume = options.volume || 0.8;
            }
            
            // 事件监听
            utterance.onend = () => {
                this.currentSpeech = null;
                this.isPlaying = false;
                resolve();
            };
            
            utterance.onerror = (error) => {
                this.currentSpeech = null;
                this.isPlaying = false;
                console.error('语音播放错误:', error);
                reject(error);
            };
            
            // 开始播放
            this.currentSpeech = utterance;
            this.isPlaying = true;
            this.speechSynthesis.speak(utterance);
        });
    }

    /**
     * 停止当前语音播放
     */
    stopSpeech() {
        if (this.speechSynthesis && this.isPlaying) {
            this.speechSynthesis.cancel();
            this.currentSpeech = null;
            this.isPlaying = false;
        }
    }

    /**
     * 队列播放语音
     */
    async speakQueue(textArray) {
        if (!this.voiceEnabled) return;
        
        for (const text of textArray) {
            await this.speak(text);
            // 短暂停顿
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    /**
     * 设置语音开关
     */
    setVoiceEnabled(enabled) {
        this.voiceEnabled = enabled;
        if (!enabled) {
            this.stopSpeech();
        }
    }

    /**
     * 设置音效开关
     */
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }

    /**
     * 设置总开关
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.stopSpeech();
        }
    }

    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            isEnabled: this.isEnabled,
            voiceEnabled: this.voiceEnabled,
            soundEnabled: this.soundEnabled,
            isPlaying: this.isPlaying,
            hasVoiceSupport: !!this.speechSynthesis,
            hasAudioContext: !!this.audioContext,
            selectedVoice: this.selectedVoice?.name || 'None',
            availableVoices: this.speechSynthesis ? this.speechSynthesis.getVoices().length : 0
        };
    }

    /**
     * 获取所有可用的中文语音
     */
    getChineseVoices() {
        if (!this.speechSynthesis) return [];
        
        const voices = this.speechSynthesis.getVoices();
        return voices.filter(voice => {
            const lang = voice.lang.toLowerCase();
            return lang.includes('zh') || lang.includes('cmn') || 
                   lang.includes('chinese') || voice.name.includes('Chinese');
        });
    }

    /**
     * 切换语音
     */
    switchVoice(voiceName) {
        if (!this.speechSynthesis) return false;
        
        const voices = this.speechSynthesis.getVoices();
        const voice = voices.find(v => v.name === voiceName);
        
        if (voice) {
            this.selectedVoice = voice;
            console.log('切换到语音:', voice.name, voice.lang);
            return true;
        }
        
        return false;
    }

    /**
     * 测试语音效果
     */
    testVoice(voiceName = null) {
        const testText = '你好！我是小熊学编程的语音助手。这是语音测试。';
        
        if (voiceName) {
            const originalVoice = this.selectedVoice;
            if (this.switchVoice(voiceName)) {
                this.speak(testText).then(() => {
                    // 测试完成后恢复原语音
                    this.selectedVoice = originalVoice;
                });
            }
        } else {
            this.speak(testText);
        }
    }
}

// 创建全局音频管理器实例
window.audioManager = new AudioManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}