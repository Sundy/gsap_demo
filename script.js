// 儿童Python循环学习网站 - 交互式动画脚本

// 全局变量
let isAnimating = false;
let currentStep = 0;
let animationTimeline;
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeMonacoEditor();
    initializeAnimations();
    setupEventListeners();
    showWelcomeAnimation();
});

/**
 * 初始化GSAP动画设置
 */
function initializeAnimations() {
    // 设置初始状态
    gsap.set(bear, { x: 0, y: 0, rotation: 0 });
    gsap.set(honeyJars, { scale: 1, opacity: 1, rotation: 0 });
    
    // 创建主时间轴
    animationTimeline = gsap.timeline({ paused: true });
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    startBtn.addEventListener('click', startForLoopAnimation);
    resetBtn.addEventListener('click', resetAnimation);
    nextLessonBtn.addEventListener('click', showWhileLesson);
    startWhileBtn.addEventListener('click', startWhileLoopAnimation);
    backToForBtn.addEventListener('click', showForLesson);
    
    // 蜂蜜罐点击事件
    honeyJars.forEach((jar, index) => {
        jar.addEventListener('click', () => eatHoney(index));
    });
    
    // 小熊点击事件
    bear.addEventListener('click', bearDance);
    
    // 在线练习按钮事件
    document.getElementById('practiceBtn').addEventListener('click', function() {
        document.querySelector('.lesson-content').classList.add('hidden');
        document.getElementById('whileLesson').classList.add('hidden');
        document.getElementById('practiceArea').classList.remove('hidden');
        initializePractice();
    });

    // 返回课程按钮事件
    document.getElementById('backToLessonBtn').addEventListener('click', function() {
        document.getElementById('practiceArea').classList.add('hidden');
        document.querySelector('.lesson-content').classList.remove('hidden');
    });

    // 初始化在线练习功能
    initializePracticeFeatures();
}

/**
 * 显示欢迎动画
 */
function showWelcomeAnimation() {
    const tl = gsap.timeline();
    
    tl.from('.header', { y: -100, opacity: 0, duration: 1, ease: 'bounce.out' })
      .from('.story-scene', { scale: 0.8, opacity: 0, duration: 0.8, ease: 'back.out(1.7)' }, '-=0.5')
      .from('.lesson-content', { y: 50, opacity: 0, duration: 0.6, stagger: 0.2 }, '-=0.3')
      .from('.output-area', { x: -100, opacity: 0, duration: 0.6 }, '-=0.2')
      .from('.concept-explanation', { scale: 0.9, opacity: 0, duration: 0.8, ease: 'back.out(1.7)' }, '-=0.4');
    
    // 小熊入场动画
    gsap.from(bear, { 
        x: -200, 
        duration: 2, 
        ease: 'power2.out',
        delay: 1.5,
        onComplete: () => {
            bearWave();
            animateConceptElements();
        }
    });
    
    // 蜂蜜罐闪烁动画
    gsap.to(honeyJars, {
        scale: 1.1,
        duration: 0.5,
        yoyo: true,
        repeat: -1,
        stagger: 0.2,
        ease: 'power2.inOut',
        delay: 2
    });
}

/**
 * 初始化Monaco Editor
 */
/**
 * 初始化Monaco Editor编辑器
 */
function initializeMonacoEditor() {
    require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } });
    require(['vs/editor/editor.main'], function () {
        const container = document.getElementById('monacoEditorContainer');
        if (container) {
            // 配置Python语言特性
            monaco.languages.registerCompletionItemProvider('python', {
                provideCompletionItems: function(model, position) {
                    // 儿童友好的Python关键词和函数提示
                    const suggestions = [
                        {
                            label: 'for',
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: 'for ${1:i} in range(${2:3}):\n    ${3:print("小熊执行第", i+1, "次")}',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: '创建一个for循环，让小熊重复执行任务'
                        },
                        {
                            label: 'while',
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: 'while ${1:condition}:\n    ${2:print("小熊继续工作")}',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: '创建一个while循环，当条件为真时小熊继续执行'
                        },
                        {
                            label: 'print',
                            kind: monaco.languages.CompletionItemKind.Function,
                            insertText: 'print("${1:小熊说：你好！}")',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: '让小熊说话或显示信息'
                        },
                        {
                            label: 'range',
                            kind: monaco.languages.CompletionItemKind.Function,
                            insertText: 'range(${1:3})',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: '创建一个数字序列，常用于for循环'
                        }
                    ];
                    return { suggestions: suggestions };
                }
            });
            
            // 创建Monaco Editor实例
            monacoEditor = monaco.editor.create(container, {
                value: '# 🐻 小熊学Python - 在这里编写你的代码\n# 例如：\nfor i in range(3):\n    print(f"小熊吃掉了第{i+1}个蜂蜜罐 🍯")',
                language: 'python',
                theme: 'vs-dark',
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                minimap: { enabled: false },
                wordWrap: 'on',
                lineHeight: 22,
                folding: true,
                renderLineHighlight: 'line',
                selectOnLineNumbers: true,
                matchBrackets: 'always',
                // 智能提示配置
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: 'on',
                tabCompletion: 'on',
                wordBasedSuggestions: true,
                // 代码格式化
                formatOnPaste: true,
                formatOnType: true,
                // 括号匹配
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                autoIndent: 'full',
                // 滚动条
                scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto',
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8
                }
            });
            
            // 添加快捷键
            monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function() {
                runPythonCode();
            });
            
            // 初始化练习功能
            setTimeout(() => {
                initializePracticeFeatures();
                initializePractice();
            }, 100);
        }
    });
}

/**
 * 获取Monaco Editor中的代码内容
 */
function getEditorCode() {
    return monacoEditor ? monacoEditor.getValue() : '';
}

/**
 * 设置Monaco Editor中的代码内容
 */
function setEditorCode(code) {
    if (monacoEditor) {
        monacoEditor.setValue(code);
    }
}

/**
 * 概念元素动画效果
 */
function animateConceptElements() {
    // 语法框闪烁效果
    gsap.to('.syntax-box', {
        boxShadow: '0 0 20px rgba(243, 156, 18, 0.5)',
        duration: 1,
        yoyo: true,
        repeat: 2,
        ease: 'power2.inOut',
        delay: 1
    });
    
    // 概念讲解区域的图标动画
    gsap.to('.concept-explanation::before', {
        rotation: 360,
        duration: 2,
        ease: 'power2.inOut',
        delay: 2
    });
}

/**
 * 初始化在线练习功能
 */
function initializePracticeFeatures() {
    // 练习题目切换
    const exerciseTabs = document.querySelectorAll('.exercise-tab');
    const exercises = document.querySelectorAll('.exercise');
    
    exerciseTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const exerciseId = this.dataset.exercise;
            
            // 更新标签状态
            exerciseTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应练习
            exercises.forEach(ex => ex.classList.add('hidden'));
            document.getElementById(`exercise-${exerciseId}`).classList.remove('hidden');
            
            // 重置代码编辑器
            resetCodeEditor(exerciseId);
        });
    });
    
    // 代码编辑器功能
    const runCodeBtn = document.getElementById('runCodeBtn');
    const resetCodeBtn = document.getElementById('resetCodeBtn');
    const hintBtn = document.getElementById('hintBtn');
    const checkAnswerBtn = document.getElementById('checkAnswerBtn');
    const nextExerciseBtn = document.getElementById('nextExerciseBtn');
    
    runCodeBtn.addEventListener('click', runPythonCode);
    resetCodeBtn.addEventListener('click', () => resetCodeEditor(getCurrentExercise()));
    hintBtn.addEventListener('click', showHint);
    checkAnswerBtn.addEventListener('click', checkAnswer);
    nextExerciseBtn.addEventListener('click', nextExercise);
}

/**
 * 初始化练习（设置默认代码）
 */
function initializePractice() {
    resetCodeEditor('for1');
    clearResult();
}

/**
 * 获取当前练习ID
 */
function getCurrentExercise() {
    const activeTab = document.querySelector('.exercise-tab.active');
    return activeTab ? activeTab.dataset.exercise : 'for1';
}

/**
 * 重置代码编辑器
 */
/**
 * 重置代码编辑器内容
 */
function resetCodeEditor(exerciseId) {
    const templates = {
        'for1': '# 使用for循环让小熊吃3个蜂蜜罐\nfor i in range(3):\n    print(f"小熊吃掉了第{i+1}个蜂蜜罐 🍯")',
        'for2': '# 使用for循环让小熊数星星\nfor i in range(1, 6):\n    print(f"小熊数到了第{i}颗星星 ⭐")',
        'while1': '# 使用while循环让小熊找苹果\napple_count = 0\nwhile apple_count < 5:\n    apple_count += 1\n    print(f"小熊找到了第{apple_count}个苹果 🍎")\nprint("小熊找够了苹果！")'
    };
    const code = templates[exerciseId] || templates['for1'];
    setEditorCode(code);
    clearResult();
}

/**
 * Python代码执行引擎（通过Docker API执行）
 */
async function runPythonCode() {
    const code = getEditorCode();
    const resultConsole = document.getElementById('resultConsole');
    const resultStatus = document.getElementById('resultStatus');
    
    try {
        // 清空之前的结果并显示加载状态
        resultConsole.innerHTML = '<div style="color: #666;">🐻 小熊正在执行代码...</div>';
        resultConsole.className = 'result-console loading';
        resultStatus.className = 'result-status loading';
        resultStatus.textContent = '代码执行中...';
        
        // 调用后端API执行代码
        const response = await fetch('http://localhost:5001/api/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code })
        });
        
        const result = await response.json();
        
        // 移除加载状态
        resultConsole.className = 'result-console';
        
        if (result.success) {
            // 执行成功
            let output = '';
            if (result.stdout) {
                output += result.stdout;
            }
            if (result.stderr) {
                output += `<span style="color: #ff9800;">${result.stderr}</span>`;
            }
            
            resultConsole.innerHTML = output || '<div style="color: #666;">代码执行完成，无输出</div>';
            resultStatus.className = 'result-status success';
            resultStatus.textContent = `执行成功！用时 ${result.execution_time}s`;
        } else {
            // 执行失败
            resultConsole.innerHTML = `<span style="color: #ff6b6b;">${result.error}</span>`;
            resultStatus.className = 'result-status error';
            resultStatus.textContent = '代码执行出错';
        }
    } catch (error) {
        // 网络或其他错误
        console.error('代码执行错误:', error);
        resultConsole.innerHTML = `<span style="color: #ff6b6b;">❌ 连接执行服务失败: ${error.message}</span>`;
        resultStatus.className = 'result-status error';
        resultStatus.textContent = '服务连接失败';
    }
}

/**
 * 模拟Python代码执行
 */
function simulatePythonExecution(code) {
    try {
        let output = [];
        let variables = {};
        
        // 解析代码结构
        const codeStructure = parseCodeStructure(code);
        
        // 执行代码
        const result = executeCodeStructure(codeStructure, variables, output);
        if (result.error) {
            return { error: result.error };
        }
        
        return { result: output.join('\n') };
    } catch (error) {
        return { error: error.message };
    }
}

/**
 * 解析代码结构
 */
function parseCodeStructure(code) {
    const lines = code.split('\n');
    const structure = [];
    let i = 0;
    
    while (i < lines.length) {
        const line = lines[i].trim();
        
        if (!line || line.startsWith('#')) {
            i++;
            continue;
        }
        
        if (line.startsWith('for ') && line.endsWith(':')) {
            // 解析for循环
            const loopBody = [];
            i++;
            while (i < lines.length && (lines[i].startsWith('    ') || lines[i].trim() === '')) {
                if (lines[i].trim()) {
                    loopBody.push(lines[i].trim());
                }
                i++;
            }
            structure.push({ type: 'for', line: line, body: loopBody });
        } else if (line.startsWith('while ') && line.endsWith(':')) {
            // 解析while循环
            const loopBody = [];
            i++;
            while (i < lines.length && (lines[i].startsWith('    ') || lines[i].trim() === '')) {
                if (lines[i].trim()) {
                    loopBody.push(lines[i].trim());
                }
                i++;
            }
            structure.push({ type: 'while', line: line, body: loopBody });
        } else {
            // 普通语句
            structure.push({ type: 'statement', line: line });
            i++;
        }
    }
    
    return structure;
}

/**
 * 执行代码结构
 */
function executeCodeStructure(structure, variables, output) {
    for (let item of structure) {
        if (item.type === 'statement') {
            const result = executeLine(item.line, variables, output);
            if (result.error) {
                return { error: result.error };
            }
        } else if (item.type === 'for') {
            const result = executeForLoopWithBody(item.line, item.body, variables, output);
            if (result.error) {
                return { error: result.error };
            }
        } else if (item.type === 'while') {
            const result = executeWhileLoopWithBody(item.line, item.body, variables, output);
            if (result.error) {
                return { error: result.error };
            }
        }
    }
    
    return { success: true };
}

/**
 * 执行单行代码
 */
function executeLine(line, variables, output) {
    try {
        // 处理变量赋值
        if (line.includes(' = ') && !line.includes('==')) {
            const [varName, value] = line.split(' = ').map(s => s.trim());
            variables[varName] = evaluateExpression(value, variables);
            return { success: true };
        }
        
        // 处理for循环
        if (line.startsWith('for ')) {
            return executeForLoop(line, variables, output);
        }
        
        // 处理while循环
        if (line.startsWith('while ')) {
            return executeWhileLoop(line, variables, output);
        }
        
        // 处理print语句
        if (line.startsWith('print(')) {
            const printContent = line.match(/print\((.+)\)/)[1];
            const result = evaluateExpression(printContent, variables);
            output.push(result);
            return { success: true };
        }
        
        // 处理自增操作
        if (line.includes(' += ')) {
            const [varName, increment] = line.split(' += ').map(s => s.trim());
            variables[varName] = (variables[varName] || 0) + evaluateExpression(increment, variables);
            return { success: true };
        }
        
        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
}

/**
 * 执行for循环（带循环体）
 */
function executeForLoopWithBody(line, body, variables, output) {
    const match = line.match(/for (\w+) in range\((.+)\):/);
    if (!match) return { error: 'for循环语法错误' };
    
    const [, varName, rangeExpr] = match;
    const range = parseRange(rangeExpr, variables);
    
    for (let i of range) {
        variables[varName] = i;
        
        // 执行循环体
        for (let bodyLine of body) {
            const result = executeLine(bodyLine, variables, output);
            if (result.error) {
                return { error: result.error };
            }
        }
    }
    
    return { success: true };
}

/**
 * 执行while循环（带循环体）
 */
function executeWhileLoopWithBody(line, body, variables, output) {
    const match = line.match(/while (.+):/);
    if (!match) return { error: 'while循环语法错误' };
    
    const condition = match[1];
    let iterations = 0;
    const maxIterations = 100; // 防止无限循环
    
    while (evaluateCondition(condition, variables) && iterations < maxIterations) {
        iterations++;
        
        // 执行循环体
        for (let bodyLine of body) {
            const result = executeLine(bodyLine, variables, output);
            if (result.error) {
                return { error: result.error };
            }
        }
    }
    
    if (iterations >= maxIterations) {
        return { error: '循环次数过多，可能存在无限循环' };
    }
    
    return { success: true };
}

/**
 * 执行for循环（兼容旧版本）
 */
function executeForLoop(line, variables, output) {
    return executeForLoopWithBody(line, [], variables, output);
}

/**
 * 执行while循环（兼容旧版本）
 */
function executeWhileLoop(line, variables, output) {
    return executeWhileLoopWithBody(line, [], variables, output);
}

/**
 * 解析range函数
 */
function parseRange(expr, variables) {
    const args = expr.split(',').map(s => evaluateExpression(s.trim(), variables));
    
    if (args.length === 1) {
        return Array.from({ length: args[0] }, (_, i) => i);
    } else if (args.length === 2) {
        return Array.from({ length: args[1] - args[0] }, (_, i) => i + args[0]);
    }
    
    return [];
}

/**
 * 计算表达式
 */
function evaluateExpression(expr, variables) {
    // 处理字符串
    if (expr.startsWith('"') && expr.endsWith('"')) {
        return expr.slice(1, -1);
    }
    if (expr.startsWith("'") && expr.endsWith("'")) {
        return expr.slice(1, -1);
    }
    
    // 处理f-string
    if (expr.startsWith('f"') || expr.startsWith("f'")) {
        return evaluateFString(expr, variables);
    }
    
    // 处理数字
    if (!isNaN(expr)) {
        return parseInt(expr);
    }
    
    // 处理变量
    if (variables.hasOwnProperty(expr)) {
        return variables[expr];
    }
    
    // 处理简单的数学表达式
    if (expr.includes('+')) {
        const parts = expr.split('+').map(s => evaluateExpression(s.trim(), variables));
        return parts.reduce((a, b) => a + b, 0);
    }
    
    return expr;
}

/**
 * 计算f-string
 */
function evaluateFString(fstring, variables) {
    let result = fstring.slice(2, -1); // 移除f" 和 "
    
    // 替换{变量}格式
    result = result.replace(/\{([^}]+)\}/g, (match, expr) => {
        return evaluateExpression(expr, variables);
    });
    
    return result;
}

/**
 * 计算条件表达式
 */
function evaluateCondition(condition, variables) {
    if (condition.includes(' < ')) {
        const [left, right] = condition.split(' < ').map(s => evaluateExpression(s.trim(), variables));
        return left < right;
    }
    if (condition.includes(' > ')) {
        const [left, right] = condition.split(' > ').map(s => evaluateExpression(s.trim(), variables));
        return left > right;
    }
    if (condition.includes(' <= ')) {
        const [left, right] = condition.split(' <= ').map(s => evaluateExpression(s.trim(), variables));
        return left <= right;
    }
    if (condition.includes(' >= ')) {
        const [left, right] = condition.split(' >= ').map(s => evaluateExpression(s.trim(), variables));
        return left >= right;
    }
    if (condition.includes(' == ')) {
        const [left, right] = condition.split(' == ').map(s => evaluateExpression(s.trim(), variables));
        return left == right;
    }
    
    return false;
}

/**
 * 显示提示
 */
function showHint() {
    const exerciseId = getCurrentExercise();
    const hints = {
        'for1': '提示：使用 for i in range(3): 来循环3次，然后用 print(f"小熊吃掉了第{i+1}个蜂蜜罐 🍯") 来输出',
        'for2': '提示：使用 for i in range(1, 6): 来从1循环到5，然后用 print(f"小熊数到了第{i}颗星星 ⭐") 来输出',
        'while1': '提示：先设置 apple_count = 0，然后用 while apple_count < 5: 来循环，记得在循环内用 apple_count += 1 来增加计数'
    };
    
    alert(hints[exerciseId] || '暂无提示');
}

/**
 * 检查答案
 */
function checkAnswer() {
    const exerciseId = getCurrentExercise();
    const code = getEditorCode();
    const resultConsole = document.getElementById('resultConsole');
    
    // 先运行代码
    runPythonCode();
    
    // 检查输出是否正确
    setTimeout(() => {
        const output = resultConsole.textContent;
        const isCorrect = validateAnswer(exerciseId, output);
        
        const resultStatus = document.getElementById('resultStatus');
        if (isCorrect) {
            resultStatus.className = 'result-status success';
            resultStatus.textContent = '🎉 答案正确！你真棒！';
        } else {
            resultStatus.className = 'result-status warning';
            resultStatus.textContent = '答案不完全正确，再试试看吧！';
        }
    }, 100);
}

/**
 * 验证答案
 */
function validateAnswer(exerciseId, output) {
    const expectedOutputs = {
        'for1': ['小熊吃掉了第1个蜂蜜罐 🍯', '小熊吃掉了第2个蜂蜜罐 🍯', '小熊吃掉了第3个蜂蜜罐 🍯'],
        'for2': ['小熊数到了第1颗星星 ⭐', '小熊数到了第2颗星星 ⭐', '小熊数到了第3颗星星 ⭐', '小熊数到了第4颗星星 ⭐', '小熊数到了第5颗星星 ⭐'],
        'while1': ['小熊找到了第1个苹果 🍎', '小熊找到了第2个苹果 🍎', '小熊找到了第3个苹果 🍎', '小熊找到了第4个苹果 🍎', '小熊找到了第5个苹果 🍎', '小熊找够了苹果！']
    };
    
    const expected = expectedOutputs[exerciseId];
    if (!expected) return false;
    
    const outputLines = output.split('\n').filter(line => line.trim());
    
    return expected.every((expectedLine, index) => {
        return outputLines[index] && outputLines[index].includes(expectedLine);
    });
}

/**
 * 下一题
 */
function nextExercise() {
    const tabs = document.querySelectorAll('.exercise-tab');
    const currentIndex = Array.from(tabs).findIndex(tab => tab.classList.contains('active'));
    const nextIndex = (currentIndex + 1) % tabs.length;
    
    tabs[nextIndex].click();
}

/**
 * 清空结果
 */
function clearResult() {
    document.getElementById('resultConsole').innerHTML = '<p class="console-prompt">>> 点击"运行代码"来执行你的程序</p>';
    document.getElementById('resultStatus').className = 'result-status';
}

/**
 * 小熊挥手动画
 */
function bearWave() {
    gsap.to(bear, {
        rotation: 15,
        duration: 0.3,
        yoyo: true,
        repeat: 5,
        ease: 'power2.inOut'
    });
}

/**
 * 小熊跳舞动画
 */
function bearDance() {
    if (isAnimating) return;
    
    const tl = gsap.timeline();
    tl.to(bear, { y: -20, duration: 0.2, ease: 'power2.out' })
      .to(bear, { y: 0, rotation: 360, duration: 0.4, ease: 'bounce.out' })
      .to(bear, { rotation: 0, duration: 0.2 });
    
    addConsoleOutput('🐻 小熊很开心地跳了个舞！');
}

/**
 * 开始for循环动画
 */
function startForLoopAnimation() {
    if (isAnimating) return;
    
    isAnimating = true;
    currentStep = 0;
    
    // 清空控制台
    clearConsole();
    addConsoleOutput('>>> 开始执行for循环...');
    
    // 禁用按钮
    startBtn.disabled = true;
    
    // 创建动画时间轴
    const tl = gsap.timeline({
        onComplete: () => {
            isAnimating = false;
            startBtn.disabled = false;
            addConsoleOutput('🎉 循环执行完毕！小熊吃饱了！');
            celebrateAnimation();
        }
    });
    
    // 为每个蜂蜜罐创建动画序列
    honeyJars.forEach((jar, index) => {
        tl.call(() => {
            addConsoleOutput(`小熊吃掉了第${index + 1}个蜂蜜罐 🍯`);
            highlightCodeLine(index);
        })
        .to(bear, { 
            x: jar.offsetLeft - 100, 
            duration: 0.8, 
            ease: 'power2.inOut' 
        })
        .to(bear, { 
            rotation: 360, 
            duration: 0.5, 
            ease: 'power2.inOut' 
        }, '-=0.2')
        .to(jar, { 
            scale: 0.5, 
            opacity: 0.3, 
            rotation: 180, 
            duration: 0.5,
            ease: 'back.in(1.7)'
        }, '-=0.3')
        .call(() => {
            jar.classList.add('eaten');
            createSparkleEffect(jar);
        })
        .to(bear, { rotation: 0, duration: 0.2 })
        .to({}, { duration: 0.5 }); // 暂停
    });
    
    // 小熊回到起始位置
    tl.to(bear, { 
        x: 0, 
        duration: 1, 
        ease: 'power2.inOut' 
    });
}

/**
 * 单独吃蜂蜜动画（点击蜂蜜罐时触发）
 */
function eatHoney(index) {
    if (isAnimating) return;
    
    const jar = honeyJars[index];
    if (jar.classList.contains('eaten')) return;
    
    const tl = gsap.timeline();
    
    tl.to(bear, { 
        x: jar.offsetLeft - 100, 
        duration: 0.6, 
        ease: 'power2.inOut' 
    })
    .to(jar, { 
        scale: 0.5, 
        opacity: 0.3, 
        rotation: 180, 
        duration: 0.4,
        ease: 'back.in(1.7)'
    }, '-=0.2')
    .call(() => {
        jar.classList.add('eaten');
        createSparkleEffect(jar);
        addConsoleOutput(`🍯 小熊吃掉了一个蜂蜜罐！`);
    })
    .to(bear, { 
        x: 0, 
        duration: 0.6, 
        ease: 'power2.inOut' 
    });
}

/**
 * 重置动画
 */
function resetAnimation() {
    if (isAnimating) return;
    
    // 重置小熊位置
    gsap.set(bear, { x: 0, y: 0, rotation: 0 });
    
    // 重置蜂蜜罐状态
    honeyJars.forEach(jar => {
        jar.classList.remove('eaten');
        gsap.set(jar, { scale: 1, opacity: 1, rotation: 0 });
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
    const tl = gsap.timeline();
    
    tl.to('.lesson-content, .output-area', { 
        opacity: 0, 
        y: -50, 
        duration: 0.5 
    })
    .call(() => {
        document.querySelector('.lesson-content').style.display = 'none';
        document.querySelector('.output-area').style.display = 'none';
        whileLesson.classList.remove('hidden');
    })
    .from(whileLesson, { 
        opacity: 0, 
        y: 50, 
        duration: 0.8, 
        ease: 'back.out(1.7)' 
    });
    
    // 重置场景
    resetWhileScene();
}

/**
 * 显示for循环课程
 */
function showForLesson() {
    const tl = gsap.timeline();
    
    tl.to(whileLesson, { 
        opacity: 0, 
        y: -50, 
        duration: 0.5 
    })
    .call(() => {
        whileLesson.classList.add('hidden');
        document.querySelector('.lesson-content').style.display = 'grid';
        document.querySelector('.output-area').style.display = 'block';
    })
    .to('.lesson-content, .output-area', { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        ease: 'back.out(1.7)' 
    });
}

/**
 * 开始while循环动画
 */
function startWhileLoopAnimation() {
    if (isAnimating) return;
    
    isAnimating = true;
    let honeyCount = 0;
    
    // 清空控制台并添加while循环输出
    clearConsole();
    addConsoleOutput('>>> 开始执行while循环...');
    addConsoleOutput('honey_count = 0');
    
    const tl = gsap.timeline({
        onComplete: () => {
            isAnimating = false;
            addConsoleOutput('小熊终于吃饱了！😊');
            celebrateAnimation();
        }
    });
    
    // while循环执行3次
    for (let i = 0; i < 3; i++) {
        tl.call(() => {
            honeyCount++;
            addConsoleOutput(`小熊找到了蜂蜜！现在有${honeyCount}个`);
            addConsoleOutput(`honey_count += 1  # 现在 honey_count = ${honeyCount}`);
        })
        .to(bear, { 
            x: Math.random() * 200 + 100, 
            y: Math.random() * 50 - 25,
            duration: 0.8, 
            ease: 'power2.inOut' 
        })
        .call(() => {
            createHoneyEffect();
        })
        .to(bear, { 
            rotation: 360, 
            duration: 0.5, 
            ease: 'power2.inOut' 
        }, '-=0.3')
        .to(bear, { rotation: 0, duration: 0.2 })
        .to({}, { duration: 0.8 }); // 暂停
    }
    
    // 小熊回到起始位置
    tl.to(bear, { 
        x: 0, 
        y: 0, 
        duration: 1, 
        ease: 'power2.inOut' 
    });
}

/**
 * 重置while循环场景
 */
function resetWhileScene() {
    gsap.set(bear, { x: 0, y: 0, rotation: 0 });
    clearConsole();
    addConsoleOutput('>>> 准备开始while循环演示！');
}

/**
 * 创建蜂蜜效果
 */
function createHoneyEffect() {
    const honey = document.createElement('div');
    honey.textContent = '🍯';
    honey.style.position = 'absolute';
    honey.style.fontSize = '2em';
    honey.style.left = bear.offsetLeft + 'px';
    honey.style.top = bear.offsetTop + 'px';
    honey.style.pointerEvents = 'none';
    honey.style.zIndex = '5';
    
    document.querySelector('.story-scene').appendChild(honey);
    
    gsap.to(honey, {
        y: -50,
        opacity: 0,
        scale: 1.5,
        duration: 1,
        ease: 'power2.out',
        onComplete: () => {
            honey.remove();
        }
    });
}

/**
 * 创建闪烁效果
 */
function createSparkleEffect(element) {
    const sparkles = ['✨', '⭐', '💫', '🌟'];
    
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
            sparkle.style.position = 'absolute';
            sparkle.style.left = element.offsetLeft + Math.random() * 50 + 'px';
            sparkle.style.top = element.offsetTop + Math.random() * 50 + 'px';
            sparkle.style.fontSize = '1.5em';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '10';
            
            document.querySelector('.story-scene').appendChild(sparkle);
            
            gsap.to(sparkle, {
                y: -30,
                opacity: 0,
                scale: 1.5,
                rotation: 360,
                duration: 1,
                ease: 'power2.out',
                onComplete: () => {
                    sparkle.remove();
                }
            });
        }, i * 200);
    }
}

/**
 * 庆祝动画
 */
function celebrateAnimation() {
    const tl = gsap.timeline();
    
    // 小熊庆祝动画
    tl.to(bear, {
        y: -30,
        rotation: 360,
        scale: 1.2,
        duration: 0.6,
        ease: 'back.out(1.7)'
    })
    .to(bear, {
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 0.4,
        ease: 'bounce.out'
    });
    
    // 创建庆祝特效
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            createCelebrationEffect();
        }, i * 100);
    }
}

/**
 * 创建庆祝特效
 */
function createCelebrationEffect() {
    const effects = ['🎉', '🎊', '🌟', '✨', '🎈'];
    const effect = document.createElement('div');
    
    effect.textContent = effects[Math.floor(Math.random() * effects.length)];
    effect.style.position = 'fixed';
    effect.style.left = Math.random() * window.innerWidth + 'px';
    effect.style.top = '0px';
    effect.style.fontSize = '2em';
    effect.style.pointerEvents = 'none';
    effect.style.zIndex = '1000';
    
    document.body.appendChild(effect);
    
    gsap.to(effect, {
        y: window.innerHeight,
        rotation: 360,
        duration: 3,
        ease: 'power2.in',
        onComplete: () => {
            effect.remove();
        }
    });
}

/**
 * 高亮代码行
 */
function highlightCodeLine(lineIndex) {
    // 这里可以添加代码高亮逻辑
    const codeBlock = document.getElementById('codeBlock');
    const lines = codeBlock.textContent.split('\n');
    
    // 简单的高亮效果
    gsap.to(codeBlock, {
        backgroundColor: '#3498DB',
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
    });
}

/**
 * 添加控制台输出
 */
function addConsoleOutput(text) {
    const output = document.createElement('p');
    output.className = 'console-output';
    output.textContent = text;
    consoleElement.appendChild(output);
    
    // 自动滚动到底部
    consoleElement.scrollTop = consoleElement.scrollHeight;
    
    // 添加打字机效果
    gsap.from(output, {
        opacity: 0,
        x: -20,
        duration: 0.5,
        ease: 'power2.out'
    });
}

/**
 * 清空控制台
 */
function clearConsole() {
    consoleElement.innerHTML = '';
}

// 页面可见性变化时暂停/恢复动画
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        gsap.globalTimeline.pause();
    } else {
        gsap.globalTimeline.resume();
    }
});

// 窗口大小变化时重新计算位置
window.addEventListener('resize', function() {
    if (!isAnimating) {
        resetAnimation();
    }
});