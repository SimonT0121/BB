'use strict';

/**
 * @fileoverview 調試工具 - 用於診斷和修復應用程式的互動問題
 * @author BabyLog 開發團隊
 * @version 1.0.0
 */

/**
 * BabyLog調試工具類
 * 提供診斷和修復應用程式問題的方法
 */
class BabyLogDebugger {
  /**
   * 構造函數
   */
  constructor() {
    this.isActive = false;
    this.logHistory = [];
    this.fixedIssues = [];
    this.buttonSelectors = {
      quickAdd: '#quickAddButton',
      actionButtons: '.action-button',
      quickOptions: '.quick-option'
    };
  }

  /**
   * 初始化調試工具
   */
  init() {
    console.log('[Debug] 調試工具初始化中...');
    this.isActive = true;
    
    // 創建調試面板
    this.createDebugPanel();
    
    // 增強錯誤記錄
    this.enhanceErrorLogging();
    
    // 診斷按鈕問題
    this.diagnoseButtonIssues();
    
    console.log('[Debug] 調試工具已啟動');
    this.log('調試工具已啟動');
  }

  /**
   * 記錄調試信息
   * @param {string} message - 訊息文本
   * @param {string} [level='info'] - 日誌級別：'info', 'warning', 'error'
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, level };
    this.logHistory.push(logEntry);
    
    // 在調試面板上顯示
    if (this.debugLogElement) {
      const logItem = document.createElement('div');
      logItem.className = `debug-log-item ${level}`;
      logItem.innerHTML = `<span class="debug-timestamp">${timestamp.split('T')[1].slice(0, 8)}</span> <span class="debug-message">${message}</span>`;
      this.debugLogElement.appendChild(logItem);
      // 滾動到底部
      this.debugLogElement.scrollTop = this.debugLogElement.scrollHeight;
    }
    
    // 在控制台顯示
    switch (level) {
      case 'warning':
        console.warn(`[Debug] ${message}`);
        break;
      case 'error':
        console.error(`[Debug] ${message}`);
        break;
      default:
        console.log(`[Debug] ${message}`);
    }
  }

  /**
   * 創建調試面板
   */
  createDebugPanel() {
    // 創建面板容器
    const debugPanel = document.createElement('div');
    debugPanel.className = 'debug-panel';
    debugPanel.innerHTML = `
      <div class="debug-header">
        <h3>BabyLog 調試工具</h3>
        <div class="debug-controls">
          <button id="debugToggle" class="debug-button">隱藏</button>
          <button id="debugClose" class="debug-button">關閉</button>
        </div>
      </div>
      <div class="debug-content">
        <div class="debug-section">
          <h4>元素診斷</h4>
          <div id="debugElementStatus" class="debug-status"></div>
        </div>
        <div class="debug-section">
          <h4>事件監聽診斷</h4>
          <div id="debugEventStatus" class="debug-status"></div>
        </div>
        <div class="debug-section">
          <h4>快速修復</h4>
          <div class="debug-actions">
            <button id="debugFixEvents" class="debug-action-button">重新綁定事件</button>
            <button id="debugResetUI" class="debug-action-button">重設UI狀態</button>
            <button id="debugClearCache" class="debug-action-button">清除快取</button>
          </div>
        </div>
        <div class="debug-section">
          <h4>測試區域</h4>
          <div class="debug-test-area">
            <button id="debugTestQuickAdd" class="debug-test-button">測試快速添加</button>
            <button id="debugTestActionButton" class="debug-test-button">測試操作按鈕</button>
          </div>
        </div>
        <div class="debug-section">
          <h4>調試日誌</h4>
          <div id="debugLog" class="debug-log"></div>
        </div>
      </div>
    `;
    
    // 添加調試面板樣式
    const style = document.createElement('style');
    style.textContent = `
      .debug-panel {
        position: fixed;
        bottom: 0;
        right: 0;
        width: 350px;
        height: 500px;
        background-color: #fff;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
        z-index: 9999;
        font-family: monospace;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        border-radius: 5px 0 0 0;
        transition: transform 0.3s ease;
      }
      .debug-panel.minimized {
        transform: translateY(calc(100% - 30px));
      }
      .debug-header {
        padding: 8px;
        background-color: #f0f0f0;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .debug-header h3 {
        margin: 0;
        font-size: 14px;
      }
      .debug-controls {
        display: flex;
        gap: 5px;
      }
      .debug-button {
        padding: 3px 8px;
        border: 1px solid #ccc;
        background-color: #f8f8f8;
        border-radius: 3px;
        cursor: pointer;
        font-size: 11px;
      }
      .debug-content {
        flex-grow: 1;
        overflow-y: auto;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      .debug-section {
        border: 1px solid #eee;
        border-radius: 4px;
        padding: 8px;
      }
      .debug-section h4 {
        margin: 0 0 5px 0;
        font-size: 12px;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
      }
      .debug-status {
        font-size: 11px;
        line-height: 1.4;
      }
      .debug-status .success {
        color: green;
      }
      .debug-status .error {
        color: red;
      }
      .debug-status .warning {
        color: orange;
      }
      .debug-actions, .debug-test-area {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
      }
      .debug-action-button, .debug-test-button {
        padding: 5px 10px;
        border: 1px solid #ddd;
        background-color: #f8f8f8;
        border-radius: 3px;
        cursor: pointer;
        font-size: 11px;
      }
      .debug-test-button {
        background-color: #e8f5ff;
        border-color: #b3d8ff;
      }
      .debug-log {
        height: 150px;
        overflow-y: auto;
        background-color: #f8f8f8;
        border: 1px solid #eee;
        padding: 5px;
        font-size: 11px;
        line-height: 1.3;
      }
      .debug-log-item {
        margin-bottom: 3px;
        border-bottom: 1px dotted #eee;
        padding-bottom: 2px;
      }
      .debug-log-item.error {
        color: red;
      }
      .debug-log-item.warning {
        color: orange;
      }
      .debug-timestamp {
        color: #888;
        margin-right: 5px;
      }
    `;
    
    // 添加到文檔
    document.head.appendChild(style);
    document.body.appendChild(debugPanel);
    
    // 保存對調試日誌元素的引用
    this.debugLogElement = document.getElementById('debugLog');
    this.debugPanel = debugPanel;
    
    // 綁定調試面板的控制按鈕
    document.getElementById('debugToggle').addEventListener('click', () => {
      debugPanel.classList.toggle('minimized');
      document.getElementById('debugToggle').textContent = 
        debugPanel.classList.contains('minimized') ? '展開' : '隱藏';
    });
    
    document.getElementById('debugClose').addEventListener('click', () => {
      this.deactivate();
      debugPanel.remove();
    });
    
    // 綁定修復按鈕
    document.getElementById('debugFixEvents').addEventListener('click', () => this.rebindAllEvents());
    document.getElementById('debugResetUI').addEventListener('click', () => this.resetUIState());
    document.getElementById('debugClearCache').addEventListener('click', () => this.clearLocalCache());
    
    // 綁定測試按鈕
    document.getElementById('debugTestQuickAdd').addEventListener('click', () => this.testQuickAdd());
    document.getElementById('debugTestActionButton').addEventListener('click', () => this.testActionButtons());
  }

  /**
   * 診斷按鈕問題
   */
  diagnoseButtonIssues() {
    this.log('開始診斷按鈕問題...');
    const elementStatus = document.getElementById('debugElementStatus');
    const eventStatus = document.getElementById('debugEventStatus');
    
    // 檢查 DOM 元素
    elementStatus.innerHTML = '';
    let elementIssuesFound = false;
    
    // 檢查快速添加按鈕
    const quickAddButton = document.querySelector(this.buttonSelectors.quickAdd);
    if (quickAddButton) {
      elementStatus.innerHTML += `<div class="success">✓ 快速添加按鈕存在 (#quickAddButton)</div>`;
    } else {
      elementStatus.innerHTML += `<div class="error">✗ 快速添加按鈕不存在 (#quickAddButton)</div>`;
      elementIssuesFound = true;
    }
    
    // 檢查操作按鈕
    const actionButtons = document.querySelectorAll(this.buttonSelectors.actionButtons);
    if (actionButtons.length > 0) {
      elementStatus.innerHTML += `<div class="success">✓ 操作按鈕存在 (${actionButtons.length} 個)</div>`;
    } else {
      elementStatus.innerHTML += `<div class="error">✗ 操作按鈕不存在 (.action-button)</div>`;
      elementIssuesFound = true;
    }
    
    // 檢查快速選項按鈕
    const quickOptions = document.querySelectorAll(this.buttonSelectors.quickOptions);
    if (quickOptions.length > 0) {
      elementStatus.innerHTML += `<div class="success">✓ 快速選項按鈕存在 (${quickOptions.length} 個)</div>`;
    } else {
      elementStatus.innerHTML += `<div class="warning">! 快速選項按鈕不存在 (.quick-option) - 可能尚未初始化</div>`;
    }
    
    // 檢查快速添加菜單
    const quickAddMenu = document.getElementById('quickAddMenu');
    if (quickAddMenu) {
      elementStatus.innerHTML += `<div class="success">✓ 快速添加菜單存在 (#quickAddMenu)</div>`;
    } else {
      elementStatus.innerHTML += `<div class="error">✗ 快速添加菜單不存在 (#quickAddMenu)</div>`;
      elementIssuesFound = true;
    }
    
    // 檢查事件監聽器 (間接檢查)
    eventStatus.innerHTML = '';
    
    // 模擬點擊事件來檢查監聽器是否正常工作
    if (quickAddButton) {
      this.log('正在檢查快速添加按鈕的事件監聽器...');
      
      // 儲存原始的 classList.toggle 方法
      const originalToggle = quickAddMenu ? quickAddMenu.classList.toggle : null;
      let toggleCalled = false;
      
      // 如果菜單存在，則暫時替換 toggle 方法
      if (quickAddMenu && originalToggle) {
        quickAddMenu.classList.toggle = function(className) {
          toggleCalled = true;
          // 恢復原始方法並取消模擬點擊
          quickAddMenu.classList.toggle = originalToggle;
          return false; // 不執行實際的 toggle
        };
        
        // 模擬點擊
        try {
          this.simulateClick(quickAddButton);
          
          // 檢查結果
          if (toggleCalled) {
            eventStatus.innerHTML += `<div class="success">✓ 快速添加按鈕的事件監聽器正常工作</div>`;
          } else {
            eventStatus.innerHTML += `<div class="error">✗ 快速添加按鈕的事件監聽器不正常工作</div>`;
            this.log('快速添加按鈕沒有觸發 classList.toggle', 'error');
          }
        } catch (e) {
          eventStatus.innerHTML += `<div class="error">✗ 檢查快速添加按鈕時發生錯誤: ${e.message}</div>`;
          this.log(`檢查快速添加按鈕時發生錯誤: ${e.message}`, 'error');
        } finally {
          // 確保恢復原始方法
          if (quickAddMenu) {
            quickAddMenu.classList.toggle = originalToggle;
          }
        }
      } else {
        eventStatus.innerHTML += `<div class="warning">! 無法檢查快速添加按鈕的事件監聽器 (菜單不存在)</div>`;
      }
    } else {
      eventStatus.innerHTML += `<div class="warning">! 無法檢查快速添加按鈕的事件監聽器 (按鈕不存在)</div>`;
    }
    
    // 檢查是否有 z-index 衝突
    this.checkZIndexConflicts();
    
    // 檢查是否有 CSS transition 或 animation 問題
    this.checkCSSTransitionIssues();
    
    // 檢查 JavaScript 錯誤
    this.checkForJavaScriptErrors();
    
    this.log('診斷完成');
  }

  /**
   * 檢查 z-index 衝突
   */
  checkZIndexConflicts() {
    this.log('檢查 z-index 衝突...');
    const eventStatus = document.getElementById('debugEventStatus');
    
    const quickAddButton = document.querySelector(this.buttonSelectors.quickAdd);
    const quickAddMenu = document.getElementById('quickAddMenu');
    
    if (quickAddButton && quickAddMenu) {
      // 獲取元素的計算樣式
      const buttonStyle = window.getComputedStyle(quickAddButton);
      const menuStyle = window.getComputedStyle(quickAddMenu);
      
      // 檢查是否有其他元素覆蓋在按鈕上方
      const buttonRect = quickAddButton.getBoundingClientRect();
      const overlappingElements = this.getElementsAtPoint(buttonRect.left + buttonRect.width/2, buttonRect.top + buttonRect.height/2);
      
      // 查找可能擋住按鈕的元素
      const blockingElements = overlappingElements.filter(el => {
        // 排除按鈕本身和其子元素
        if (el === quickAddButton || quickAddButton.contains(el)) {
          return false;
        }
        
        const style = window.getComputedStyle(el);
        const zIndex = parseInt(style.zIndex) || 0;
        const buttonZIndex = parseInt(buttonStyle.zIndex) || 0;
        
        // 如果元素的 z-index 高於按鈕且位置重疊
        return zIndex > buttonZIndex;
      });
      
      if (blockingElements.length > 0) {
        const blockerInfo = blockingElements.map(el => {
          const style = window.getComputedStyle(el);
          return `${this.getElementDescription(el)} (z-index: ${style.zIndex})`;
        }).join(', ');
        
        eventStatus.innerHTML += `<div class="error">✗ 發現可能擋住按鈕的元素: ${blockerInfo}</div>`;
        this.log(`發現可能擋住按鈕的元素: ${blockerInfo}`, 'warning');
      } else {
        eventStatus.innerHTML += `<div class="success">✓ 沒有元素擋住快速添加按鈕</div>`;
      }
      
      // 檢查菜單的 z-index 是否足夠高
      const menuZIndex = parseInt(menuStyle.zIndex) || 0;
      if (menuZIndex < 100) {
        eventStatus.innerHTML += `<div class="warning">! 快速添加菜單的 z-index 可能太低 (${menuZIndex})</div>`;
        this.log(`快速添加菜單的 z-index 可能太低 (${menuZIndex})`, 'warning');
      }
    }
  }

  /**
   * 檢查 CSS transition 或 animation 問題
   */
  checkCSSTransitionIssues() {
    const eventStatus = document.getElementById('debugEventStatus');
    const quickAddMenu = document.getElementById('quickAddMenu');
    
    if (quickAddMenu) {
      const menuStyle = window.getComputedStyle(quickAddMenu);
      
      // 檢查 transition 屬性
      if (menuStyle.transition.includes('visibility') || menuStyle.transition.includes('opacity')) {
        // 檢查 transition 時間是否過長
        const transitionTimes = menuStyle.transitionDuration.split(',').map(t => {
          const value = parseFloat(t);
          return isNaN(value) ? 0 : value;
        });
        
        const maxTransitionTime = Math.max(...transitionTimes);
        if (maxTransitionTime > 1) {
          eventStatus.innerHTML += `<div class="warning">! 快速添加菜單的過渡時間可能過長 (${maxTransitionTime}s)</div>`;
          this.log(`快速添加菜單的過渡時間可能過長 (${maxTransitionTime}s)`, 'warning');
        }
      }
      
      // 檢查菜單的初始狀態
      if (menuStyle.visibility === 'hidden' && menuStyle.opacity === '0') {
        eventStatus.innerHTML += `<div class="success">✓ 快速添加菜單的初始狀態正確</div>`;
      } else {
        eventStatus.innerHTML += `<div class="warning">! 快速添加菜單的初始狀態可能有問題 (visibility: ${menuStyle.visibility}, opacity: ${menuStyle.opacity})</div>`;
        this.log(`快速添加菜單的初始狀態可能有問題 (visibility: ${menuStyle.visibility}, opacity: ${menuStyle.opacity})`, 'warning');
      }
    }
  }

  /**
   * 檢查 JavaScript 錯誤
   */
  checkForJavaScriptErrors() {
    const eventStatus = document.getElementById('debugEventStatus');
    
    // 檢查是否有未捕獲的 JavaScript 錯誤
    if (window.babyLogJSErrors && window.babyLogJSErrors.length > 0) {
      const recentErrors = window.babyLogJSErrors.slice(-3);
      
      eventStatus.innerHTML += `<div class="error">✗ 檢測到 JavaScript 錯誤:</div>`;
      recentErrors.forEach(error => {
        eventStatus.innerHTML += `<div class="error">&nbsp;&nbsp;- ${error.message} (${error.source})</div>`;
        this.log(`JavaScript 錯誤: ${error.message} (${error.source})`, 'error');
      });
    } else {
      eventStatus.innerHTML += `<div class="success">✓ 沒有檢測到 JavaScript 錯誤</div>`;
    }
  }

  /**
   * 獲取指定坐標上的所有元素
   * @param {number} x - X 坐標
   * @param {number} y - Y 坐標
   * @returns {Array} 元素列表
   */
  getElementsAtPoint(x, y) {
    const elements = [];
    let element = document.elementFromPoint(x, y);
    
    while (element && element !== document.documentElement) {
      elements.push(element);
      // 暫時隱藏元素以獲取其下方的元素
      element.style.pointerEvents = 'none';
      element = document.elementFromPoint(x, y);
    }
    
    // 恢復所有元素的 pointerEvents
    elements.forEach(el => {
      el.style.pointerEvents = '';
    });
    
    return elements;
  }

  /**
   * 獲取元素的描述性文本
   * @param {HTMLElement} element - HTML 元素
   * @returns {string} 元素描述
   */
  getElementDescription(element) {
    let description = element.tagName.toLowerCase();
    
    if (element.id) {
      description += `#${element.id}`;
    }
    
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ').filter(c => c.trim() !== '');
      if (classes.length > 0) {
        description += `.${classes.join('.')}`;
      }
    }
    
    return description;
  }

  /**
   * 增強錯誤記錄
   */
  enhanceErrorLogging() {
    // 保存原始的 console 方法
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // 創建全局錯誤數組
    if (!window.babyLogJSErrors) {
      window.babyLogJSErrors = [];
    }
    
    // 攔截 console.error
    console.error = (...args) => {
      // 調用原始方法
      originalConsoleError.apply(console, args);
      
      // 記錄錯誤
      if (this.isActive) {
        const errorMessage = args.map(arg => String(arg)).join(' ');
        this.log(`Console Error: ${errorMessage}`, 'error');
        
        window.babyLogJSErrors.push({
          type: 'error',
          message: errorMessage,
          source: 'console.error',
          timestamp: new Date()
        });
      }
    };
    
    // 攔截 console.warn
    console.warn = (...args) => {
      // 調用原始方法
      originalConsoleWarn.apply(console, args);
      
      // 記錄警告
      if (this.isActive) {
        const warnMessage = args.map(arg => String(arg)).join(' ');
        this.log(`Console Warning: ${warnMessage}`, 'warning');
        
        window.babyLogJSErrors.push({
          type: 'warning',
          message: warnMessage,
          source: 'console.warn',
          timestamp: new Date()
        });
      }
    };
    
    // 攔截未捕獲的錯誤
    window.addEventListener('error', (event) => {
      if (this.isActive) {
        const { message, filename, lineno, colno } = event;
        const errorInfo = `${message} (${filename}:${lineno}:${colno})`;
        this.log(`Uncaught Error: ${errorInfo}`, 'error');
        
        window.babyLogJSErrors.push({
          type: 'uncaught',
          message: message,
          source: `${filename}:${lineno}:${colno}`,
          timestamp: new Date()
        });
      }
    });
    
    // 攔截未處理的 Promise 拒絕
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isActive) {
        const reason = event.reason ? (event.reason.stack || event.reason.message || String(event.reason)) : 'Unknown Promise Rejection';
        this.log(`Unhandled Promise Rejection: ${reason}`, 'error');
        
        window.babyLogJSErrors.push({
          type: 'promise',
          message: reason,
          source: 'unhandledrejection',
          timestamp: new Date()
        });
      }
    });
    
    this.log('已增強錯誤記錄功能');
  }

  /**
   * 模擬點擊事件
   * @param {HTMLElement} element - 要點擊的元素
   */
  simulateClick(element) {
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    
    element.dispatchEvent(event);
  }

  /**
   * 測試快速添加按鈕
   */
  testQuickAdd() {
    this.log('測試快速添加按鈕...');
    const quickAddButton = document.querySelector(this.buttonSelectors.quickAdd);
    const quickAddMenu = document.getElementById('quickAddMenu');
    
    if (!quickAddButton) {
      this.log('找不到快速添加按鈕', 'error');
      return;
    }
    
    if (!quickAddMenu) {
      this.log('找不到快速添加菜單', 'error');
      return;
    }
    
    this.log('點擊快速添加按鈕');
    this.simulateClick(quickAddButton);
    
    // 檢查菜單是否顯示
    setTimeout(() => {
      const menuVisible = quickAddMenu.classList.contains('active');
      this.log(`菜單狀態變更: ${menuVisible ? '可見' : '不可見'}`);
      
      if (!menuVisible) {
        this.log('菜單沒有顯示，嘗試手動切換', 'warning');
        quickAddMenu.classList.add('active');
        
        // 再次檢查
        setTimeout(() => {
          const nowVisible = quickAddMenu.classList.contains('active');
          this.log(`手動切換後菜單狀態: ${nowVisible ? '可見' : '不可見'}`);
          
          // 如果仍然無法顯示，嘗試直接修改樣式
          if (!nowVisible) {
            this.log('嘗試直接修改樣式', 'warning');
            quickAddMenu.style.visibility = 'visible';
            quickAddMenu.style.opacity = '1';
          }
        }, 100);
      } else {
        // 如果菜單顯示了，等待一下再點擊關閉
        setTimeout(() => {
          this.log('再次點擊快速添加按鈕以關閉菜單');
          this.simulateClick(quickAddButton);
        }, 1000);
      }
    }, 300);
  }

  /**
   * 測試操作按鈕
   */
  testActionButtons() {
    this.log('測試操作按鈕...');
    const actionButtons = document.querySelectorAll(this.buttonSelectors.actionButtons);
    
    if (actionButtons.length === 0) {
      this.log('找不到操作按鈕', 'error');
      return;
    }
    
    this.log(`找到 ${actionButtons.length} 個操作按鈕`);
    
    // 檢查每個按鈕的點擊事件
    actionButtons.forEach((button, index) => {
      if (index < 3) { // 只測試前三個按鈕
        const action = button.dataset.action;
        this.log(`測試按鈕 #${index + 1} (${action || '未知操作'})`);
        
        // 添加臨時事件監聽器來檢測是否有其他監聽器
        let eventCaptured = false;
        const tempListener = (e) => {
          eventCaptured = true;
          e.preventDefault(); // 阻止實際操作
          e.stopPropagation(); // 停止事件傳播
          return false;
        };
        
        button.addEventListener('click', tempListener, true);
        
        // 模擬點擊
        this.simulateClick(button);
        
        // 移除臨時監聽器
        button.removeEventListener('click', tempListener, true);
        
        this.log(`按鈕 #${index + 1} 點擊事件${eventCaptured ? '被捕獲' : '未被捕獲'}`, eventCaptured ? 'info' : 'warning');
      }
    });
  }

  /**
   * 重新綁定所有事件
   */
  rebindAllEvents() {
    this.log('嘗試重新綁定所有事件...');
    
    try {
      // 嘗試獲取應用程式的實例
      let appInstance = null;
      
      // 檢查全局變量
      if (window.app && typeof window.app.bindEventListeners === 'function') {
        appInstance = window.app;
      }
      
      // 如果沒有找到實例，嘗試創建一個新的
      if (!appInstance) {
        this.log('找不到應用程式實例，嘗試從頭初始化', 'warning');
        
        // 模擬 DOMContentLoaded 事件
        const initEvent = new Event('DOMContentLoaded');
        document.dispatchEvent(initEvent);
        
        this.log('已模擬 DOMContentLoaded 事件');
        this.fixedIssues.push('重新初始化應用程式');
        return;
      }
      
      // 使用找到的應用程式實例重新綁定事件
      this.log('使用現有的應用程式實例重新綁定事件');
      
      // 先解綁所有按鈕事件
      this.unbindButtonEvents();
      
      // 然後重新綁定
      if (typeof appInstance.bindEventListeners === 'function') {
        appInstance.bindEventListeners();
        this.log('成功重新綁定事件監聽器');
        this.fixedIssues.push('重新綁定事件監聽器');
      } else {
        this.log('應用程式實例缺少 bindEventListeners 方法', 'error');
      }
    } catch (error) {
      this.log(`重新綁定事件時出錯: ${error.message}`, 'error');
    }
    
    // 手動綁定快速添加按鈕
    this.fixQuickAddButton();
  }

  /**
   * 解綁按鈕事件
   */
  unbindButtonEvents() {
    this.log('解綁按鈕事件...');
    
    // 解綁快速添加按鈕
    const quickAddButton = document.querySelector(this.buttonSelectors.quickAdd);
    if (quickAddButton) {
      // 克隆並替換元素以移除所有事件監聽器
      const newButton = quickAddButton.cloneNode(true);
      quickAddButton.parentNode.replaceChild(newButton, quickAddButton);
      this.log('已解綁快速添加按鈕事件');
    }
    
    // 解綁操作按鈕
    document.querySelectorAll(this.buttonSelectors.actionButtons).forEach(button => {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
    });
    this.log('已解綁操作按鈕事件');
    
    // 解綁快速選項按鈕
    document.querySelectorAll(this.buttonSelectors.quickOptions).forEach(button => {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
    });
    this.log('已解綁快速選項按鈕事件');
  }

  /**
   * 修復快速添加按鈕
   */
  fixQuickAddButton() {
    this.log('嘗試修復快速添加按鈕...');
    
    const quickAddButton = document.querySelector(this.buttonSelectors.quickAdd);
    const quickAddMenu = document.getElementById('quickAddMenu');
    
    if (!quickAddButton || !quickAddMenu) {
      this.log('找不到快速添加按鈕或菜單', 'error');
      return;
    }
    
    // 移除現有事件監聽器（通過克隆元素）
    const newButton = quickAddButton.cloneNode(true);
    quickAddButton.parentNode.replaceChild(newButton, quickAddButton);
    
    // 添加新的事件監聽器
    newButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.log('快速添加按鈕被點擊 (由調試工具處理)');
      
      // 切換菜單顯示狀態
      quickAddMenu.classList.toggle('active');
      
      // 如果菜單應該可見但不可見，直接設置樣式
      if (quickAddMenu.classList.contains('active')) {
        quickAddMenu.style.visibility = 'visible';
        quickAddMenu.style.opacity = '1';
      } else {
        // 等待過渡效果完成後再隱藏
        setTimeout(() => {
          if (!quickAddMenu.classList.contains('active')) {
            quickAddMenu.style.visibility = 'hidden';
          }
        }, 300);
      }
    });
    
    // 綁定背景點擊關閉
    const backdrop = quickAddMenu.querySelector('.quick-add-backdrop');
    if (backdrop) {
      // 移除現有事件監聽器
      const newBackdrop = backdrop.cloneNode(true);
      backdrop.parentNode.replaceChild(newBackdrop, backdrop);
      
      // 添加新的事件監聽器
      newBackdrop.addEventListener('click', () => {
        this.log('快速添加菜單背景被點擊 (由調試工具處理)');
        quickAddMenu.classList.remove('active');
        
        // 等待過渡效果完成後再隱藏
        setTimeout(() => {
          if (!quickAddMenu.classList.contains('active')) {
            quickAddMenu.style.visibility = 'hidden';
          }
        }, 300);
      });
    }
    
    this.log('已修復快速添加按鈕');
    this.fixedIssues.push('修復快速添加按鈕');
  }

  /**
   * 重設 UI 狀態
   */
  resetUIState() {
    this.log('重設 UI 狀態...');
    
    // 重設快速添加菜單
    const quickAddMenu = document.getElementById('quickAddMenu');
    if (quickAddMenu) {
      quickAddMenu.classList.remove('active');
      quickAddMenu.style.visibility = 'hidden';
      quickAddMenu.style.opacity = '0';
      this.log('已重設快速添加菜單狀態');
    }
    
    // 重設側邊選單
    const appNav = document.getElementById('appNav');
    if (appNav) {
      appNav.classList.remove('active');
      this.log('已重設側邊選單狀態');
    }
    
    // 重設模態窗口
    const modalContainer = document.getElementById('modalContainer');
    if (modalContainer) {
      modalContainer.classList.remove('active');
      modalContainer.innerHTML = '';
      this.log('已重設模態窗口狀態');
    }
    
    // 確保文檔可以滾動
    document.body.style.overflow = '';
    
    // 重新加載當前視圖
    const currentView = document.querySelector('.app-view.active-view');
    if (currentView) {
      const viewId = currentView.id;
      currentView.classList.remove('active-view');
      setTimeout(() => {
        currentView.classList.add('active-view');
        this.log(`已重新載入視圖: ${viewId}`);
      }, 10);
    }
    
    this.log('UI 狀態已重設');
    this.fixedIssues.push('重設 UI 狀態');
  }

  /**
   * 清除本地快取
   */
  clearLocalCache() {
    this.log('清除本地快取...');
    
    try {
      // 備份重要數據
      const backupData = {};
      const keysToKeep = ['babylogDB', 'babylog_first_use'];
      
      // 檢查 localStorage 中的鍵
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (keysToKeep.some(keepKey => key.startsWith(keepKey))) {
          backupData[key] = localStorage.getItem(key);
        }
      }
      
      // 清除所有 localStorage 數據
      localStorage.clear();
      
      // 恢復重要數據
      for (const [key, value] of Object.entries(backupData)) {
        localStorage.setItem(key, value);
      }
      
      this.log('已清除本地快取（已保留重要數據）');
      this.fixedIssues.push('清除本地快取');
    } catch (error) {
      this.log(`清除本地快取時出錯: ${error.message}`, 'error');
    }
  }

  /**
   * 重新加載應用程式
   */
  reloadApp() {
    this.log('準備重新加載應用程式...');
    
    // 添加重新加載標記
    localStorage.setItem('babylog_debug_reload', 'true');
    
    // 延遲重新加載，以確保日誌訊息顯示
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  /**
   * 停用調試工具
   */
  deactivate() {
    // 恢復原始的 console 方法
    if (this._originalConsoleError) {
      console.error = this._originalConsoleError;
    }
    
    if (this._originalConsoleWarn) {
      console.warn = this._originalConsoleWarn;
    }
    
    this.isActive = false;
    console.log('[Debug] 調試工具已停用');
  }
}

// 創建並導出調試工具實例
const debugger = new BabyLogDebugger();

// 在頁面加載完成後自動初始化調試工具
document.addEventListener('DOMContentLoaded', () => {
  // 如果是從調試工具觸發的重新加載，自動初始化調試工具
  if (localStorage.getItem('babylog_debug_reload') === 'true') {
    localStorage.removeItem('babylog_debug_reload');
    setTimeout(() => {
      debugger.init();
    }, 1000); // 等待應用程式初始化完成
  }
});

// 添加全局快捷鍵以啟動調試工具
document.addEventListener('keydown', (event) => {
  // Ctrl+Shift+D 啟動調試工具
  if (event.ctrlKey && event.shiftKey && event.key === 'D') {
    event.preventDefault();
    if (!debugger.isActive) {
      debugger.init();
    } else {
      // 如果已經啟動，切換調試面板顯示/隱藏
      if (debugger.debugPanel) {
        debugger.debugPanel.classList.toggle('minimized');
      }
    }
  }
});

// 導出調試工具
export default debugger;