// AI文生视频课程交互脚本

// 全局状态管理
const AppState = {
    currentParams: {
        style: 'cinematic',
        subject: 'astronaut',
        action: 'riding'
    },
    sliderValues: {
        motionStrength: 50,
        consistency: 75,
        creativity: 60
    },
    activeStep: null,
    sparkPanelOpen: false
};

// 预设的视频数据（模拟AI生成结果）
const VideoDatabase = {
    // 基础组合
    'cinematic-astronaut-riding': {
        title: '电影风格宇航员骑行',
        description: '电影级画质，宇航员在月球表面骑马的史诗场景',
        thumbnail: '🎬🚀🐎',
        prompt: 'A astronaut riding a horse on the moon, cinematic'
    },
    'anime-astronaut-riding': {
        title: '动漫风格宇航员骑行',
        description: '日式动漫风格，可爱的宇航员角色设计',
        thumbnail: '🎌🚀🐎',
        prompt: 'A astronaut riding a horse on the moon, anime'
    },
    'realistic-astronaut-riding': {
        title: '写实风格宇航员骑行',
        description: '超写实渲染，真实的太空环境细节',
        thumbnail: '📸🚀🐎',
        prompt: 'A astronaut riding a horse on the moon, realistic'
    },
    'cinematic-cat-dancing': {
        title: '电影风格猫咪跳舞',
        description: '电影级光影效果，优雅的猫咪舞蹈动作',
        thumbnail: '🎬🐱💃',
        prompt: 'A cat dancing on the moon, cinematic'
    },
    'anime-robot-flying': {
        title: '动漫风格机器人飞行',
        description: '机甲动漫风格，炫酷的飞行特效',
        thumbnail: '🎌🤖✈️',
        prompt: 'A robot flying on the moon, anime'
    }
};

// 流程步骤详细说明
const ProcessSteps = {
    1: {
        title: '文本输入阶段',
        description: '用户输入创意提示词，AI开始理解用户的创作意图。这个阶段需要清晰、具体的描述来获得最佳效果。',
        animation: 'typing'
    },
    2: {
        title: '文本编码处理',
        description: 'AI将文本转换为数字向量，每个词汇都被映射到高维空间中的特定位置，形成语义理解的基础。',
        animation: 'encoding'
    },
    3: {
        title: '扩散模型生成',
        description: '从随机噪声开始，通过多步去噪过程逐渐生成清晰的图像内容，这是AI创作的核心技术。',
        animation: 'diffusion'
    },
    4: {
        title: '视频序列合成',
        description: '将静态图像扩展为动态视频，生成连续的帧序列，确保动作的流畅性和连贯性。',
        animation: 'synthesis'
    },
    5: {
        title: '输出优化处理',
        description: '对生成的视频进行后处理优化，包括色彩校正、稳定性增强和质量提升，输出最终作品。',
        animation: 'optimization'
    }
};

// 创意词库
const CreativeDatabase = {
    subjects: ['宇航员', '猫咪', '机器人', '独角兽', '龙', '精灵', '海豚', '凤凰', '熊猫', '狮子'],
    actions: ['跳舞', '飞行', '游泳', '奔跑', '旋转', '跳跃', '漂浮', '滑行', '攀爬', '翻滚'],
    scenes: ['月球表面', '深海世界', '云端之上', '森林深处', '沙漠绿洲', '冰雪王国', '火山口', '星空中', '彩虹桥上', '水晶洞穴'],
    styles: ['电影风格', '动漫风格', '写实风格', '油画风格', '水彩风格', '素描风格', '赛博朋克', '蒸汽朋克', '梦幻风格', '极简风格']
};

// 动画工具函数
function animate(element, keyframes, options = {}) {
    const defaultOptions = {
        duration: 300,
        easing: 'ease',
        fill: 'forwards'
    };
    return element.animate(keyframes, { ...defaultOptions, ...options });
}

// 初始化应用
function initializeApp() {
    setupParameterControls();
    setupComparisonLab();
    setupSliderControls();
    setupProcessMapper();
    setupIdeaSpark();
    
    console.log('AI文生视频课程已初始化');
}

// 设置参数控制按钮
function setupParameterControls() {
    const paramButtons = document.querySelectorAll('.param-btn');
    
    paramButtons.forEach(button => {
        button.addEventListener('click', () => {
            const param = button.dataset.param;
            const value = button.dataset.value;
            
            // 更新按钮状态
            const group = button.parentElement;
            group.querySelectorAll('.param-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 更新应用状态
            AppState.currentParams[param] = value;
            
            // 按钮点击动画
            animate(button, [
                { transform: 'scale(1)' },
                { transform: 'scale(0.95)' },
                { transform: 'scale(1)' }
            ], { duration: 200 });
            
            // 更新提示词显示
            updatePromptDisplay();
            
            console.log(`参数更新: ${param} = ${value}`);
        });
    });
}

// 设置对比实验台
function setupComparisonLab() {
    const generateBtn = document.getElementById('generate-comparison');
    const promptInput = document.getElementById('base-prompt');
    
    generateBtn.addEventListener('click', () => {
        generateComparison();
    });
    
    // 提示词输入实时更新
    promptInput.addEventListener('input', () => {
        updatePromptDisplay();
    });
}

// 生成对比视频
function generateComparison() {
    const generateBtn = document.getElementById('generate-comparison');
    const originalVideo = document.getElementById('video-original');
    const modifiedVideo = document.getElementById('video-modified');
    
    // 按钮加载状态
    generateBtn.textContent = '🔄 生成中...';
    generateBtn.disabled = true;
    
    // 生成动画
    animate(generateBtn, [
        { transform: 'scale(1)' },
        { transform: 'scale(0.98)' }
    ], { duration: 100 });
    
    // 模拟生成过程
    setTimeout(() => {
        // 获取视频数据
        const originalKey = 'cinematic-astronaut-riding';
        const modifiedKey = `${AppState.currentParams.style}-${AppState.currentParams.subject}-${AppState.currentParams.action}`;
        
        const originalData = VideoDatabase[originalKey] || VideoDatabase['cinematic-astronaut-riding'];
        const modifiedData = VideoDatabase[modifiedKey] || VideoDatabase['cinematic-astronaut-riding'];
        
        // 更新视频显示
        updateVideoDisplay(originalVideo, originalData);
        updateVideoDisplay(modifiedVideo, modifiedData);
        
        // 恢复按钮状态
        generateBtn.textContent = '🎬 生成对比视频';
        generateBtn.disabled = false;
        
        animate(generateBtn, [
            { transform: 'scale(0.98)' },
            { transform: 'scale(1)' }
        ], { duration: 200 });
        
        console.log('对比视频生成完成');
    }, 2000);
}

// 更新视频显示
function updateVideoDisplay(container, videoData) {
    const placeholderContent = container.querySelector('.placeholder-content');
    
    // 淡出动画
    animate(container, [
        { opacity: 1 },
        { opacity: 0.3 }
    ], { duration: 300 }).onfinish = () => {
        // 更新内容
        placeholderContent.innerHTML = `
            <div class="video-thumbnail">${videoData.thumbnail}</div>
            <h4>${videoData.title}</h4>
            <p>${videoData.description}</p>
        `;
        
        // 淡入动画
        animate(container, [
            { opacity: 0.3 },
            { opacity: 1 }
        ], { duration: 300 });
    };
    
    // 更新提示词显示
    const videoItem = container.closest('.video-item');
    const promptDisplay = videoItem.querySelector('.prompt-display');
    promptDisplay.textContent = videoData.prompt;
}

// 更新提示词显示
function updatePromptDisplay() {
    const basePrompt = document.getElementById('base-prompt').value;
    const modifiedPrompt = basePrompt
        .replace(/cinematic|anime|realistic/gi, AppState.currentParams.style)
        .replace(/astronaut|cat|robot/gi, AppState.currentParams.subject)
        .replace(/riding|dancing|flying/gi, AppState.currentParams.action);
    
    document.getElementById('modified-prompt').textContent = modifiedPrompt;
}

// 设置滑动条控制
function setupSliderControls() {
    const sliders = document.querySelectorAll('.slider');
    
    sliders.forEach(slider => {
        const valueDisplay = slider.parentElement.querySelector('.slider-value');
        
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            const param = e.target.id.replace('-', '');
            
            // 更新显示值
            valueDisplay.textContent = `${value}%`;
            
            // 更新应用状态
            AppState.sliderValues[param] = parseInt(value);
            
            // 触发高亮效果
            triggerParameterHighlight(param, value);
            
            console.log(`滑动条更新: ${param} = ${value}%`);
        });
    });
}

// 触发参数高亮效果
function triggerParameterHighlight(param, value) {
    const overlay = document.getElementById('highlight-overlay');
    
    // 移除之前的高亮
    overlay.classList.remove('active');
    
    // 短暂延迟后添加新高亮
    setTimeout(() => {
        overlay.classList.add('active');
        
        // 根据参数类型设置不同颜色
        const colors = {
            motionstrength: 'rgba(255, 107, 107, 0.3)',
            consistency: 'rgba(78, 205, 196, 0.3)',
            creativity: 'rgba(102, 126, 234, 0.3)'
        };
        
        overlay.style.boxShadow = `inset 0 0 0 3px ${colors[param] || 'rgba(0, 212, 255, 0.3)}'}`;
        
        // 自动移除高亮
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 1500);
    }, 100);
}

// 设置流程图交互
function setupProcessMapper() {
    const processSteps = document.querySelectorAll('.process-step');
    const detailTitle = document.getElementById('detail-title');
    const detailAnimation = document.getElementById('detail-animation');
    const detailDescription = document.getElementById('detail-description');
    
    processSteps.forEach(step => {
        step.addEventListener('click', () => {
            const stepNumber = parseInt(step.dataset.step);
            
            // 移除其他步骤的激活状态
            processSteps.forEach(s => s.classList.remove('active'));
            
            // 激活当前步骤
            step.classList.add('active');
            AppState.activeStep = stepNumber;
            
            // 步骤点击动画
            animate(step, [
                { transform: 'translateY(-5px) scale(1)' },
                { transform: 'translateY(-8px) scale(1.05)' },
                { transform: 'translateY(-5px) scale(1.05)' }
            ], { duration: 300 });
            
            // 更新详解内容
            updateProcessDetail(stepNumber);
            
            console.log(`流程步骤激活: ${stepNumber}`);
        });
    });
}

// 更新流程详解
function updateProcessDetail(stepNumber) {
    const stepData = ProcessSteps[stepNumber];
    const detailTitle = document.getElementById('detail-title');
    const detailAnimation = document.getElementById('detail-animation');
    const detailDescription = document.getElementById('detail-description');
    
    // 淡出当前内容
    const detailContent = document.querySelector('.detail-content');
    animate(detailContent, [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(10px)' }
    ], { duration: 200 }).onfinish = () => {
        // 更新内容
        detailTitle.textContent = stepData.title;
        detailDescription.textContent = stepData.description;
        
        // 激活动画
        detailAnimation.classList.add('active');
        
        // 淡入新内容
        animate(detailContent, [
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 300 });
    };
}

// 设置创意激发器
function setupIdeaSpark() {
    const sparkBtn = document.getElementById('spark-btn');
    const sparkPanel = document.getElementById('spark-panel');
    const randomBtn = document.getElementById('random-generate');
    const applyBtn = document.getElementById('apply-idea');
    
    // 切换面板显示
    sparkBtn.addEventListener('click', () => {
        AppState.sparkPanelOpen = !AppState.sparkPanelOpen;
        
        if (AppState.sparkPanelOpen) {
            sparkPanel.classList.add('active');
        } else {
            sparkPanel.classList.remove('active');
        }
        
        // 按钮旋转动画
        animate(sparkBtn, [
            { transform: 'rotate(0deg)' },
            { transform: 'rotate(180deg)' }
        ], { duration: 300 });
    });
    
    // 随机生成创意
    randomBtn.addEventListener('click', () => {
        generateRandomIdea();
    });
    
    // 应用创意到实验台
    applyBtn.addEventListener('click', () => {
        applyGeneratedIdea();
    });
    
    // 点击外部关闭面板
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.idea-spark') && AppState.sparkPanelOpen) {
            AppState.sparkPanelOpen = false;
            sparkPanel.classList.remove('active');
        }
    });
}

// 生成随机创意
function generateRandomIdea() {
    const slots = {
        'subject-slot': CreativeDatabase.subjects,
        'action-slot': CreativeDatabase.actions,
        'scene-slot': CreativeDatabase.scenes,
        'style-slot': CreativeDatabase.styles
    };
    
    Object.keys(slots).forEach((slotId, index) => {
        const slot = document.getElementById(slotId);
        const content = slot.querySelector('.slot-content');
        const options = slots[slotId];
        
        // 添加旋转动画
        slot.classList.add('spinning');
        
        setTimeout(() => {
            // 随机选择内容
            const randomIndex = Math.floor(Math.random() * options.length);
            content.textContent = options[randomIndex];
            
            // 移除动画类
            slot.classList.remove('spinning');
        }, 300 + index * 100);
    });
    
    console.log('随机创意生成完成');
}

// 应用生成的创意
function applyGeneratedIdea() {
    const subjectSlot = document.getElementById('subject-slot').querySelector('.slot-content').textContent;
    const actionSlot = document.getElementById('action-slot').querySelector('.slot-content').textContent;
    const sceneSlot = document.getElementById('scene-slot').querySelector('.slot-content').textContent;
    const styleSlot = document.getElementById('style-slot').querySelector('.slot-content').textContent;
    
    if (subjectSlot === '点击生成') {
        alert('请先生成随机创意！');
        return;
    }
    
    // 构建新的提示词
    const newPrompt = `A ${subjectSlot} ${actionSlot} in ${sceneSlot}, ${styleSlot} style`;
    
    // 更新实验台
    document.getElementById('base-prompt').value = newPrompt;
    updatePromptDisplay();
    
    // 关闭面板
    AppState.sparkPanelOpen = false;
    document.getElementById('spark-panel').classList.remove('active');
    
    // 成功提示动画
    const applyBtn = document.getElementById('apply-idea');
    animate(applyBtn, [
        { backgroundColor: '#4ecdc4' },
        { backgroundColor: '#f5576c' }
    ], { duration: 500 });
    
    console.log(`创意已应用: ${newPrompt}`);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    
    // 添加页面加载动画
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            animate(section, [
                { opacity: 0, transform: 'translateY(30px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], { duration: 600, easing: 'ease-out' });
        }, index * 200);
    });
});

// 导出全局对象供调试使用
window.AIVideoCourse = {
    AppState,
    VideoDatabase,
    ProcessSteps,
    CreativeDatabase
};