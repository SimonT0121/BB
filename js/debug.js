'use strict';

/**
 * @fileoverview 調試工具 - 用於幫助診斷和解決應用程式問題
 * @author BabyLog 開發團隊
 * @version 1.0.0
 */

/**
 * 調試工具類
 * 提供各種調試功能來診斷應用問題
 */
class BabyLogDebug {
  /**
   * 構造函數
   */
  constructor() {
    // 調試狀態
    this.enabled = false;
    
    // 調試日誌容器
    this.logContainer = null;
    
    // 調試面板
    this.debugPanel = null;
    
    // 事件追蹤
    this.eventTracking = false;
    
    // 初始化
    this.init();
  }

  /**
   * 初始化調試工具
   */
  init() {
    console.log('[Debug] 初始化調試工具...');
    
    // 創建快捷鍵監聽
    this.createKeyboardShortcut();
    
    // 檢查 URL 參數
    if (this.checkDebugParam()) {
      this.enable();
    }
  }

  /**
   * 檢查 URL 是否有調試參數
   * @returns {boolean} 是否啟用調試
   */
  checkDebugParam() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('debug');
  }

  /**
   * 創建調試模式快捷鍵 (連續點擊頁面右上角 5 次，或同時按下 Shift+D+B)
   */
  createKeyboardShortcut() {
    // 追蹤連續點擊
    let clicks = 0;
    let clickTimer = null;
    let lastX = 0;
    let lastY = 0;
    
    // 檢測頁面右上角的連續點擊
    document.addEventListener('click', (e) => {
      // 檢查是否在頁面右上角區域 (右上角 10% 的區域)
      const rightTopArea = e.clientX > window.innerWidth * 0.9 && e.clientY < window.innerHeight * 0.1;
      
      if (rightTopArea) {
        // 檢查是否與上次點擊位置接近
        const closeToLast = Math.abs(e.clientX - lastX) < 20 && Math.abs(e.clientY - lastY) < 20;
        
        if (closeToLast) {
          clicks++;
          
          if (clicks >= 5) {
            clicks = 0;
            this.toggleDebug();
          }
        } else {
          clicks = 1;
        }
        
        lastX = e.clientX;
        lastY = e.clientY;
        
        // 重置計時器
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
          clicks = 0;
        }, 2000);
      }
    });
    
    // 鍵盤快捷鍵 (Shift+D+B)
    let keysPressed = {
      'Shift': false,
      'KeyD': false,
      'KeyB': false
    };
    
    document.addEventListener('keydown', (e) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        keysPressed['Shift'] = true;
      } else if (e.code === 'KeyD') {
        keysPressed['KeyD'] = true;
      } else if (e.code === 'KeyB') {
        keysPressed['KeyB'] = true;
      }
      
      // 檢查是否所有按鍵都被按下
      if (keysPressed['Shift'] && keysPressed['KeyD'] && keysPressed['KeyB']) {
        this.toggleDebug();
        
        // 重置按鍵狀態
        keysPressed = { 'Shift': false, 'KeyD': false, 'KeyB': false };
      }
    });
    
    document.addEventListener('keyup', (e) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        keysPressed['Shift'] = false;
      } else if (e.code === 'KeyD') {
        keysPressed['KeyD'] = false;
      } else if (e.code === 'KeyB') {
        keysPressed['KeyB'] = false;
      }
    });
    
    // 為移動設備添加特殊手勢
    let touchStartTime = 0;
    let touchCount = 0;
    
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 3) { // 三指觸摸
        const now = new Date().getTime();
        
        if (now - touchStartTime < 500) {
          touchCount++;
          
          if (touchCount >= 3) {
            this.toggleDebug();
            touchCount = 0;
          }
        } else {
          touchCount = 1;
        }
        
        touchStartTime = now;
      }
    });
  }

  /**
   * 切換調試模式
   */
  toggleDebug() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  /**
   * 啟用調試模式
   */
  enable() {
    if (this.enabled) return;
    
    this.enabled = true;
    console.log('[Debug] 調試模式已啟用');
    
    // 創建調試界面
    this.createDebugInterface();
    
    // 修補原始的 console 方法
    this.patchConsole();
    
    // 啟用事件調試
    this.setupEventDebugging();
    
    // 檢查應用狀態
    this.checkAppState();
  }

  /**
   * 禁用調試模式
   */
  disable() {
    if (!this.enabled) return;
    
    this.enabled = false;
    console.log('[Debug] 調試模式已禁用');
    
    // 移除調試界面
    if (this.debugPanel) {
      document.body.removeChild(this.debugPanel);
      this.debugPanel = null;
      this.logContainer = null;
    }
    
    // 恢復原始的 console 方法
    this.restoreConsole();
    
    // 禁用事件調試
    this.stopEventDebugging();
  }

  /**
   * 創建調試界面
   */
  createDebugInterface() {
    // 創建調試面板
    this.debugPanel = document.createElement('div');
    this.debugPanel.className = 'debug-panel';
    this.debugPanel.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40%;
      background-color: rgba(0, 0, 0, 0.8);
      color: #fff;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: height 0.3s;
    `;
    
    // 創建調試面板標題
    const headerHeight = 30;
    const header = document.createElement('div');
    header.className = 'debug-header';
    header.style.cssText = `
      height: ${headerHeight}px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 10px;
      background-color: #444;
      border-bottom: 1px solid #666;
    `;
    
    // 標題
    const title = document.createElement('div');
    title.textContent = '調試面板';
    
    // 按鈕容器
    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.gap = '5px';
    
    // 清除按鈕
    const clearBtn = document.createElement('button');
    clearBtn.textContent = '清除';
    clearBtn.style.cssText = `
      background-color: #555;
      color: #fff;
      border: none;
      border-radius: 3px;
      padding: 2px 5px;
      font-size: 11px;
      cursor: pointer;
    `;
    clearBtn.onclick = () => this.clearLogs();
    
    // 檢查按鈕
    const checkBtn = document.createElement('button');
    checkBtn.textContent = '檢查按鈕';
    checkBtn.style.cssText = `
      background-color: #264559;
      color: #fff;
      border: none;
      border-radius: 3px;
      padding: 2px 5px;
      font-size: 11px;
      cursor: pointer;
    `;
    checkBtn.onclick = () => this.debugButtonIssues();
    
    // 事件追蹤按鈕
    const eventBtn = document.createElement('button');
    eventBtn.textContent = '追蹤事件';
    eventBtn.className = 'event-track-btn';
    eventBtn.style.cssText = `
      background-color: #555;
      color: #fff;
      border: none;
      border-radius: 3px;
      padding: 2px 5px;
      font-size: 11px;
      cursor: pointer;
    `;
    eventBtn.onclick = () => this.toggleEventTracking(eventBtn);
    
    // 關閉按鈕
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '關閉';
    closeBtn.style.cssText = `
      background-color: #933;
      color: #fff;
      border: none;
      border-radius: 3px;
      padding: 2px 5px;
      font-size: 11px;
      cursor: pointer;
    `;
    closeBtn.onclick = () => this.disable();
    
    // 添加按鈕到容器
    buttons.appendChild(clearBtn);
    buttons.appendChild(checkBtn);
    buttons.appendChild(eventBtn);
    buttons.appendChild(closeBtn);
    
    // 添加子元素到標題
    header.appendChild(title);
    header.appendChild(buttons);
    
    // 創建日誌容器
    this.logContainer = document.createElement('div');
    this.logContainer.className = 'debug-logs';
    this.logContainer.style.cssText = `
      flex-grow: 1;
      overflow-y: auto;
      padding: 5px;
      word-wrap: break-word;
      white-space: pre-wrap;
    `;
    
    // 添加元素到調試面板
    this.debugPanel.appendChild(header);
    this.debugPanel.appendChild(this.logContainer);
    
    // 添加到頁面
    document.body.appendChild(this.debugPanel);
    
    // 調整主內容區域，避免被調試面板遮擋
    document.querySelector('.app-main').style.paddingBottom = '40%';
    
    // 確保調試面板可以最小化（點擊標題隱藏/顯示日誌部分）
    header.addEventListener('click', (e) => {
      if (e.target === header || e.target === title) {
        if (this.debugPanel.style.height === '40%') {
          this.debugPanel.style.height = `${headerHeight}px`;
        } else {
          this.debugPanel.style.height = '40%';
        }
      }
    });
  }

  /**
   * 修補 console 方法，將日誌輸出到調試面板
   */
  patchConsole() {
    // 保存原始 console 方法
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };
    
    // 修補 console.log
    console.log = (...args) => {
      this.originalConsole.log.apply(console, args);
      this.logToPanel('log', ...args);
    };
    
    // 修補 console.warn
    console.warn = (...args) => {
      this.originalConsole.warn.apply(console, args);
      this.logToPanel('warn', ...args);
    };
    
    // 修補 console.error
    console.error = (...args) => {
      this.originalConsole.error.apply(console, args);
      this.logToPanel('error', ...args);
    };
    
    // 修補 console.info
    console.info = (...args) => {
      this.originalConsole.info.apply(console, args);
      this.logToPanel('info', ...args);
    };
    
    // 添加全局錯誤處理
    window.addEventListener('error', (e) => {
      this.logToPanel('error', `未捕獲錯誤: ${e.message} at ${e.filename}:${e.lineno}:${e.colno}`);
      return false;
    });
    
    // 添加 Promise 錯誤處理
    window.addEventListener('unhandledrejection', (e) => {
      this.logToPanel('error', `未處理的 Promise 拒絕: ${e.reason}`);
    });
  }

  /**
   * 恢復原始的 console 方法
   */
  restoreConsole() {
    if (this.originalConsole) {
      console.log = this.originalConsole.log;
      console.warn = this.originalConsole.warn;
      console.error = this.originalConsole.error;
      console.info = this.originalConsole.info;
    }
  }

  /**
   * 將日誌輸出到調試面板
   * @param {string} type - 日誌類型：'log', 'warn', 'error', 'info'
   * @param {...any} args - 日誌參數
   */
  logToPanel(type, ...args) {
    if (!this.logContainer) return;
    
    // 獲取當前時間
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    
    // 創建新的日誌條目
    const logEntry = document.createElement('div');
    logEntry.className = `debug-log ${type}`;
    
    // 設置條目樣式
    switch (type) {
      case 'warn':
        logEntry.style.color = '#ffa500';
        break;
      case 'error':
        logEntry.style.color = '#ff5555';
        break;
      case 'info':
        logEntry.style.color = '#3498db';
        break;
      default:
        logEntry.style.color = '#ffffff';
    }
    
    // 格式化參數
    const formattedArgs = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    // 設置日誌內容
    logEntry.innerHTML = `<span style="color:#999;">[${timeString}]</span> <span style="color:#ccc;">[${type.toUpperCase()}]</span> ${formattedArgs}`;
    
    // 添加到日誌容器
    this.logContainer.appendChild(logEntry);
    
    // 滾動到底部
    this.logContainer.scrollTop = this.logContainer.scrollHeight;
  }

  /**
   * 清除調試面板中的所有日誌
   */
  clearLogs() {
    if (this.logContainer) {
      this.logContainer.innerHTML = '';
    }
  }

  /**
   * 設置事件調試
   */
  setupEventDebugging() {
    // 創建一個 MutationObserver 來觀察 DOM 變化
    this.observer = new MutationObserver((mutations) => {
      if (!this.eventTracking) return;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              this.logToPanel('info', `DOM 添加: <${node.nodeName.toLowerCase()}${node.id ? ' id="'+node.id+'"' : ''}${node.className ? ' class="'+node.className+'"' : ''}>`);
            }
          });
          
          mutation.removedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              this.logToPanel('info', `DOM 移除: <${node.nodeName.toLowerCase()}${node.id ? ' id="'+node.id+'"' : ''}${node.className ? ' class="'+node.className+'"' : ''}>`);
            }
          });
        }
      });
    });
    
    // 開始觀察整個 document
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * 停止事件調試
   */
  stopEventDebugging() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    this.eventTracking = false;
  }

  /**
   * 切換事件追蹤
   * @param {HTMLElement} button - 追蹤按鈕
   */
  toggleEventTracking(button) {
    this.eventTracking = !this.eventTracking;
    
    if (this.eventTracking) {
      button.style.backgroundColor = '#006699';
      button.textContent = '停止追蹤';
      
      // 監聽點擊事件
      this.clickHandler = (e) => {
        const path = this.getElementPath(e.target);
        this.logToPanel('info', `點擊: ${path}`);
      };
      
      document.addEventListener('click', this.clickHandler, true);
      
      // 監聽觸摸事件
      this.touchStartHandler = (e) => {
        const path = this.getElementPath(e.target);
        this.logToPanel('info', `觸摸開始: ${path}`);
      };
      
      document.addEventListener('touchstart', this.touchStartHandler, true);
      
      this.logToPanel('info', '事件追蹤已啟用');
    } else {
      button.style.backgroundColor = '#555';
      button.textContent = '追蹤事件';
      
      // 移除事件監聽
      document.removeEventListener('click', this.clickHandler, true);
      document.removeEventListener('touchstart', this.touchStartHandler, true);
      
      this.logToPanel('info', '事件追蹤已禁用');
    }
  }

  /**
   * 獲取元素路徑
   * @param {HTMLElement} element - 要獲取路徑的元素
   * @returns {string} 元素路徑
   */
  getElementPath(element) {
    if (!element || element.nodeType !== 1) {
      return '';
    }
    
    let path = [];
    let currentElement = element;
    
    while (currentElement) {
      let selector = currentElement.nodeName.toLowerCase();
      
      if (currentElement.id) {
        selector += `#${currentElement.id}`;
      } else if (currentElement.className) {
        selector += `.${Array.from(currentElement.classList).join('.')}`;
      }
      
      path.unshift(selector);
      
      // 添加數據屬性
      const dataActions = currentElement.getAttribute('data-action');
      if (dataActions) {
        path[0] += `[data-action="${dataActions}"]`;
      }
      
      // 添加更多重要的屬性
      const views = currentElement.getAttribute('data-view');
      if (views) {
        path[0] += `[data-view="${views}"]`;
      }
      
      // 檢查快速添加按鈕
      if (currentElement.id === 'quickAddButton' || currentElement.classList.contains('quick-add-button')) {
        path[0] += ' <-- 可能的問題按鈕';
      }
      
      if (currentElement.classList.contains('action-button') || currentElement.classList.contains('quick-option')) {
        path[0] += ' <-- 可能的問題按鈕';
      }
      
      currentElement = currentElement.parentElement;
    }
    
    return path.join(' > ');
  }

  /**
   * 檢查應用狀態
   */
  checkAppState() {
    this.logToPanel('info', '檢查應用狀態...');
    
    // 檢查 IndexedDB 支持
    if (!window.indexedDB) {
      this.logToPanel('error', '您的瀏覽器不支持 IndexedDB，這可能導致應用無法正常工作。');
    } else {
      this.logToPanel('info', 'IndexedDB 支持: ✅');
    }
    
    // 檢查用戶代理字符串
    this.logToPanel('info', `用戶代理: ${navigator.userAgent}`);
    
    // 檢查屏幕尺寸
    this.logToPanel('info', `屏幕尺寸: ${window.innerWidth}x${window.innerHeight}`);
    
    // 檢查重要的 DOM 元素
    this.checkImportantElements();
    
    // 檢查按鈕事件綁定
    this.checkEventBindings();
  }

  /**
   * 檢查重要的 DOM 元素是否存在
   */
  checkImportantElements() {
    const criticalElements = [
      { id: 'app', name: '應用容器' },
      { id: 'appMain', name: '主內容區' },
      { id: 'quickAddButton', name: '快速添加按鈕' },
      { id: 'appNav', name: '側邊導航' },
      { id: 'quickAddMenu', name: '快速添加菜單' }
    ];
    
    criticalElements.forEach(element => {
      const domElement = document.getElementById(element.id);
      if (!domElement) {
        this.logToPanel('error', `找不到 ${element.name} (ID: ${element.id})`);
      } else {
        this.logToPanel('info', `${element.name} (ID: ${element.id}): ✅`);
        
        // 檢查元素的可見性
        const style = window.getComputedStyle(domElement);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          this.logToPanel('warn', `${element.name} 存在但不可見 (display: ${style.display}, visibility: ${style.visibility}, opacity: ${style.opacity})`);
        }
        
        // 檢查元素的尺寸
        const rect = domElement.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          this.logToPanel('warn', `${element.name} 尺寸為零 (width: ${rect.width}, height: ${rect.height})`);
        }
      }
    });
    
    // 檢查快速操作按鈕
    const actionButtons = document.querySelectorAll('.action-button');
    this.logToPanel('info', `找到 ${actionButtons.length} 個快速操作按鈕`);
    
    // 檢查快速添加選項
    const quickOptions = document.querySelectorAll('.quick-option');
    this.logToPanel('info', `找到 ${quickOptions.length} 個快速添加選項`);
  }

  /**
   * 檢查事件綁定
   */
  checkEventBindings() {
    // 無法直接檢查事件綁定，但可以檢查關鍵元素是否有點擊處理
    this.logToPanel('info', '準備檢查事件綁定...');
    
    // 將在用戶手動點擊"檢查按鈕"後執行更詳細的檢查
  }

  /**
   * 調試按鈕問題
   */
  debugButtonIssues() {
    this.logToPanel('info', '開始檢查按鈕問題...');
    
    // 檢查快速添加按鈕
    const quickAddButton = document.getElementById('quickAddButton');
    if (quickAddButton) {
      // 檢查樣式
      const style = window.getComputedStyle(quickAddButton);
      this.logToPanel('info', `快速添加按鈕樣式: position=${style.position}, z-index=${style.zIndex}, pointer-events=${style.pointerEvents}`);
      
      // 檢查位置和大小
      const rect = quickAddButton.getBoundingClientRect();
      this.logToPanel('info', `快速添加按鈕位置: left=${rect.left}, top=${rect.top}, width=${rect.width}, height=${rect.height}`);
      
      // 嘗試模擬點擊
      this.logToPanel('info', '模擬點擊快速添加按鈕');
      try {
        quickAddButton.click();
        setTimeout(() => {
          const menu = document.getElementById('quickAddMenu');
          if (menu && menu.classList.contains('active')) {
            this.logToPanel('info', '點擊事件有效，菜單已顯示 ✅');
          } else {
            this.logToPanel('error', '點擊事件無效，菜單沒有顯示 ❌');
            this.suggestFixes("quickAddButton");
          }
        }, 100);
      } catch (e) {
        this.logToPanel('error', `模擬點擊出錯: ${e.message}`);
      }
    } else {
      this.logToPanel('error', '找不到快速添加按鈕 ❌');
    }
    
    // 檢查快速操作按鈕
    const actionButtons = document.querySelectorAll('.action-button');
    this.logToPanel('info', `檢查 ${actionButtons.length} 個快速操作按鈕`);
    
    actionButtons.forEach((button, index) => {
      const action = button.getAttribute('data-action');
      const style = window.getComputedStyle(button);
      const rect = button.getBoundingClientRect();
      
      this.logToPanel('info', `快速操作按鈕 #${index + 1}:`);
      this.logToPanel('info', `  - 操作: ${action || '未設置'}`);
      this.logToPanel('info', `  - 位置: left=${rect.left}, top=${rect.top}, width=${rect.width}, height=${rect.height}`);
      this.logToPanel('info', `  - 樣式: pointer-events=${style.pointerEvents}, display=${style.display}`);
      
      // 檢查是否有可點擊的父元素攔截了事件
      let parent = button.parentElement;
      while (parent && parent !== document.body) {
        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.pointerEvents === 'none') {
          this.logToPanel('error', `  - 父元素 <${parent.nodeName.toLowerCase()}${parent.id ? ' id="'+parent.id+'"' : ''}${parent.className ? ' class="'+parent.className+'"' : ''}> 設置了 pointer-events: none`);
        }
        parent = parent.parentElement;
      }
    });
    
    // 檢查快速添加選項
    const quickOptions = document.querySelectorAll('.quick-option');
    this.logToPanel('info', `檢查 ${quickOptions.length} 個快速添加選項`);
    
    quickOptions.forEach((option, index) => {
      const action = option.getAttribute('data-action');
      const style = window.getComputedStyle(option);
      
      this.logToPanel('info', `快速添加選項 #${index + 1}:`);
      this.logToPanel('info', `  - 操作: ${action || '未設置'}`);
      this.logToPanel('info', `  - 樣式: pointer-events=${style.pointerEvents}, display=${style.display}`);
    });
    
    // 檢查 z-index 層疊關係
    this.checkZIndexStacking();
    
    // 檢查 touchEvent 支持
    this.checkTouchSupport();
  }

  /**
   * 檢查 z-index 層疊關係
   */
  checkZIndexStacking() {
    const elements = [
      { selector: '.app-header', name: '頂部導航' },
      { selector: '.app-footer', name: '底部導航' },
      { selector: '.app-nav', name: '側邊選單' },
      { selector: '.quick-add-menu', name: '快速添加選單' },
      { selector: '.modal-container', name: '模態窗口' },
      { selector: '.toast-container', name: '提示消息' }
    ];
    
    this.logToPanel('info', '檢查 z-index 層疊關係:');
    
    elements.forEach(item => {
      const element = document.querySelector(item.selector);
      if (element) {
        const style = window.getComputedStyle(element);
        this.logToPanel('info', `  - ${item.name}: z-index=${style.zIndex}`);
      }
    });
  }

  /**
   * 檢查觸摸事件支持
   */
  checkTouchSupport() {
    if ('ontouchstart' in window) {
      this.logToPanel('info', '設備支持觸摸事件 ✅');
    } else {
      this.logToPanel('warn', '設備可能不支持觸摸事件，這可能導致在移動設備上的交互問題');
    }
    
    // 檢查事件監聽器
    this.logToPanel('info', '嘗試添加觸摸事件監聽器進行測試...');
    
    const testHandler = (e) => {
      this.logToPanel('info', `觸發測試觸摸事件: ${e.type}, touches=${e.touches.length}`);
      document.removeEventListener('touchstart', testHandler);
    };
    
    document.addEventListener('touchstart', testHandler);
    this.logToPanel('info', '請觸摸屏幕任意位置來測試觸摸事件');
  }

  /**
   * 根據問題類型提供修復建議
   * @param {string} problemType - 問題類型
   */
  suggestFixes(problemType) {
    switch (problemType) {
      case 'quickAddButton':
        this.logToPanel('info', '建議的修復方案:');
        this.logToPanel('info', '1. 檢查 app.js 中對 quickAddButton 的事件綁定');
        this.logToPanel('info', '2. 確保 preventDefault() 正確使用');
        this.logToPanel('info', '3. 在移動設備上，點擊事件可能需要替換為 touchstart/touchend');
        this.logToPanel('info', '4. 嘗試添加以下代碼到 app.js 中:');
        this.logToPanel('info', `
// 修復快速添加按鈕
document.addEventListener('DOMContentLoaded', () => {
  const quickAddButton = document.getElementById('quickAddButton');
  const quickAddMenu = document.getElementById('quickAddMenu');
  
  if (quickAddButton && quickAddMenu) {
    // 移除現有的事件監聽器 (如果可能)
    const clone = quickAddButton.cloneNode(true);
    quickAddButton.parentNode.replaceChild(clone, quickAddButton);
    
    // 添加新的事件監聽器
    clone.addEventListener('click', (e) => {
      e.preventDefault();
      quickAddMenu.classList.toggle('active');
    });
    
    // 添加觸摸事件支持
    clone.addEventListener('touchend', (e) => {
      e.preventDefault();
      quickAddMenu.classList.toggle('active');
    }, { passive: false });
  }
});`);
        break;
    }
  }
}

// 創建調試工具實例
const debugTool = new BabyLogDebug();

// 將調試工具導出為全局變量，以便在控制台訪問
window.debugTool = debugTool;

// 為所有按鈕添加調試輔助
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    // 使用 setTimeout 確保在應用初始化完成後執行
    
    // 為所有按鈕添加調試日誌
    const allButtons = document.querySelectorAll('button, .action-button, .quick-option, a[href="#quick-add"]');
    
    allButtons.forEach(button => {
      // 保存原始 onclick 處理程序（如果有的話）
      const originalClick = button.onclick;
      
      // 添加新的 onclick 處理程序
      button.onclick = function(e) {
        console.log(`[Debug] 按鈕點擊: ${button.textContent.trim() || button.className}`);
        
        // 調用原始處理程序（如果有的話）
        if (typeof originalClick === 'function') {
          return originalClick.call(this, e);
        }
      };
      
      // 為移動設備添加觸摸事件處理程序
      button.addEventListener('touchstart', function(e) {
        console.log(`[Debug] 按鈕觸摸開始: ${button.textContent.trim() || button.className}`);
      });
      
      button.addEventListener('touchend', function(e) {
        console.log(`[Debug] 按鈕觸摸結束: ${button.textContent.trim() || button.className}`);
      });
    });
    
    // 特別處理快速添加按鈕
    const quickAddButton = document.getElementById('quickAddButton');
    if (quickAddButton) {
      // 修復可能的事件問題
      quickAddButton.addEventListener('touchend', function(e) {
        e.preventDefault();
        console.log('[Debug] 快速添加按鈕觸摸結束 - 嘗試強制打開選單');
        const quickAddMenu = document.getElementById('quickAddMenu');
        if (quickAddMenu) {
          quickAddMenu.classList.toggle('active');
        }
      }, { passive: false });
    }
    
    console.log('[Debug] 已為所有按鈕添加調試輔助');
  }, 1000);
});

/**
 * 快速修復常見問題
 */
function quickFixCommonIssues() {
  // 修復快速添加按鈕
  const quickAddButton = document.getElementById('quickAddButton');
  const quickAddMenu = document.getElementById('quickAddMenu');
  
  if (quickAddButton && quickAddMenu) {
    // 移除現有的事件監聽器 (如果可能)
    const clone = quickAddButton.cloneNode(true);
    quickAddButton.parentNode.replaceChild(clone, quickAddButton);
    
    // 添加新的事件監聽器
    clone.addEventListener('click', (e) => {
      e.preventDefault();
      quickAddMenu.classList.toggle('active');
    });
    
    // 添加觸摸事件支持
    clone.addEventListener('touchend', (e) => {
      e.preventDefault();
      quickAddMenu.classList.toggle('active');
    }, { passive: false });
    
    console.log('[Debug] 已應用快速修復到快速添加按鈕');
  }
  
  // 修復所有快速操作按鈕
  const actionButtons = document.querySelectorAll('.action-button');
  actionButtons.forEach(button => {
    // 檢查 data-action 屬性
    const action = button.getAttribute('data-action');
    if (action) {
      // 添加觸摸事件處理程序
      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        console.log(`[Debug] 觸發操作: ${action}`);
        // 觸發自定義事件，讓 App 類處理
        const event = new CustomEvent('quickAction', { 
          detail: { action: action } 
        });
        document.dispatchEvent(event);
      }, { passive: false });
    }
  });
  
  // 修復所有快速添加選項
  const quickOptions = document.querySelectorAll('.quick-option');
  quickOptions.forEach(option => {
    const action = option.getAttribute('data-action');
    if (action) {
      option.addEventListener('touchend', (e) => {
        e.preventDefault();
        console.log(`[Debug] 觸發快速添加選項: ${action}`);
        const event = new CustomEvent('quickAction', { 
          detail: { action: action } 
        });
        document.dispatchEvent(event);
        
        // 關閉快速添加選單
        const quickAddMenu = document.getElementById('quickAddMenu');
        if (quickAddMenu) {
          quickAddMenu.classList.remove('active');
        }
      }, { passive: false });
    }
  });
  
  console.log('[Debug] 已完成常見問題的快速修復');
}

// 在文檔加載完成後應用快速修復
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(quickFixCommonIssues, 1500);
});

// 導出調試工具
export default debugTool;