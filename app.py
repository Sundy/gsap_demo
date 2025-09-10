#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
小熊学Python - 后端代码执行服务
提供安全的Python代码执行API接口
"""

import os
import sys
import subprocess
import tempfile
import time
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import threading

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # 允许跨域请求

# 配置
MAX_EXECUTION_TIME = 10  # 最大执行时间（秒）
MAX_OUTPUT_LENGTH = 5000  # 最大输出长度


def execute_python_code(code, timeout=MAX_EXECUTION_TIME):
    """
    安全执行Python代码
    
    Args:
        code (str): 要执行的Python代码
        timeout (int): 超时时间（秒）
    
    Returns:
        dict: 包含执行结果的字典
    """
    try:
        # 创建临时文件
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        # 执行Python代码
        start_time = time.time()
        process = subprocess.Popen(
            [sys.executable, temp_file],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        stdout, stderr = process.communicate(timeout=timeout)
        execution_time = time.time() - start_time
        
        # 清理临时文件
        os.unlink(temp_file)
        
        # 限制输出长度
        if len(stdout) > MAX_OUTPUT_LENGTH:
            stdout = stdout[:MAX_OUTPUT_LENGTH] + "\n[输出被截断...]"
        
        if len(stderr) > MAX_OUTPUT_LENGTH:
            stderr = stderr[:MAX_OUTPUT_LENGTH] + "\n[错误信息被截断...]"
        
        return {
            'success': True,
            'stdout': stdout,
            'stderr': stderr,
            'execution_time': round(execution_time, 3),
            'return_code': process.returncode
        }
        
    except subprocess.TimeoutExpired:
        # 清理临时文件
        if 'temp_file' in locals():
            try:
                os.unlink(temp_file)
            except:
                pass
        
        return {
            'success': False,
            'error': f'代码执行超时（超过{timeout}秒）',
            'stdout': '',
            'stderr': '',
            'execution_time': timeout
        }
        
    except Exception as e:
        # 清理临时文件
        if 'temp_file' in locals():
            try:
                os.unlink(temp_file)
            except:
                pass
        
        return {
            'success': False,
            'error': f'执行错误: {str(e)}',
            'stdout': '',
            'stderr': '',
            'execution_time': 0
        }


@app.route('/')
def index():
    """
    提供主页面
    """
    return send_from_directory('.', 'index.html')


@app.route('/api/execute', methods=['POST'])
def execute_code():
    """
    执行Python代码的API接口
    """
    try:
        data = request.get_json()
        
        if not data or 'code' not in data:
            return jsonify({
                'success': False,
                'error': '请提供要执行的代码'
            }), 400
        
        code = data['code'].strip()
        
        if not code:
            return jsonify({
                'success': False,
                'error': '代码不能为空'
            }), 400
        
        # 基本安全检查（禁止危险操作）
        dangerous_keywords = [
            'import os', 'import sys', 'import subprocess',
            'open(', 'file(', 'exec(', 'eval(',
            '__import__', 'globals(', 'locals(',
            'input(', 'raw_input('
        ]
        
        code_lower = code.lower()
        for keyword in dangerous_keywords:
            if keyword in code_lower:
                return jsonify({
                    'success': False,
                    'error': f'代码包含不允许的操作: {keyword}'
                }), 400
        
        # 执行代码
        result = execute_python_code(code)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'服务器错误: {str(e)}'
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    健康检查接口
    """
    return jsonify({
        'status': 'healthy',
        'service': '小熊学Python代码执行服务',
        'version': '1.0.0'
    })


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': '接口不存在'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': '服务器内部错误'
    }), 500


if __name__ == '__main__':
    # 创建临时目录
    os.makedirs('temp', exist_ok=True)
    
    print("🐻 小熊学Python代码执行服务启动中...")
    print("📡 API地址: http://localhost:8000")
    print("🔍 健康检查: http://localhost:8000/api/health")
    print("⚡ 代码执行: POST http://localhost:8000/api/execute")

    app.run(host='0.0.0.0', port=8000, debug=True)
