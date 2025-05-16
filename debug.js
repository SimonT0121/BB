/**
 * debug.js - 應用程式調試工具
 * 
 * 此文件提供調試功能，幫助在手機環境下診斷和解決問題。
 * 在index.html中引入此文件（放在其他JS檔案之前）即可啟用調試。
 * 
 * @author BabyGrow Team
 * @version 1.0.0
 */

'use strict';

// 立即執行函數，避免全局污染
(function() {
  // 創建調試介面
  function createDebugInterface() {
    // 創建調試面板
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(0, 0, 0, 0.8);
      color: #fff;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      max-height: 50vh;
      overflow-y: auto;
      padding: 10px;
      display: none;
    `;

    // 創建調試按鈕 (一直顯示在右下角)
    const debugButton = document.createElement('button');
    debugButton.id = 'debug-button';
    debugButton.textContent = '🐞';
    debugButton.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #4a86e8;
      color: white;
      font-size: 20px;
      border: none;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // 創建日誌區域
    const logContainer = document.createElement('div');
    logContainer.id = 'debug-log';
    logContainer.style.cssText = `
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    `;
    debugPanel.appendChild(logContainer);

    // 創建操作按鈕區域
    const actionContainer = document.createElement('div');
    actionContainer.id = 'debug-actions';
    actionContainer.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    `;
    debugPanel.appendChild(actionContainer);

    // 添加操作按鈕
    const actions = [
      { id: 'check-db', label: '檢查資料庫', action: checkDatabase },
      { id: 'fix-loading', label: '修復載入問題', action: fixLoadingIssue },
      { id: 'check-js', label: '檢查JS錯誤', action: checkJavaScriptErrors },
      { id: 'force-init', label: '強制初始化', action: forceInitialization },
      { id: 'toggle-dark', label: '切換暗色模式', action: toggleDarkMode },
      { id: 'clear-db', label: '清除資料庫', action: clearDatabase },
      { id: 'show-info', label: '顯示系統信息', action: showSystemInfo }
    ];

    actions.forEach(action => {
      const button = document.createElement('button');
      button.id = action.id;
      button.textContent = action.label;
      button.style.cssText = `
        background-color: #333;
        color: white;
        border: 1px solid #555;
        border-radius: 4px;
        padding: 5px 10px;
        font-size: 12px;
      `;
      button.addEventListener('click', action.action);
      actionContainer.appendChild(button);
    });

    // 添加到DOM
    document.body.appendChild(debugPanel);
    document.body.appendChild(debugButton);

    // 綁定事件：點擊調試按鈕顯示/隱藏調試面板
    debugButton.addEventListener('click', () => {
      if (debugPanel.style.display === 'none') {
        debugPanel.style.display = 'block';
      } else {
        debugPanel.style.display = 'none';
      }
    });

    // 返回調試相關元素
    return {
      panel: debugPanel,
      button: debugButton,
      log: logContainer,
      actions: actionContainer
    };
  }

  // 添加日誌到調試面板
  function log(message, type = 'info') {
    const logContainer = document.getElementById('debug-log');
    if (!logContainer) return;

    const logEntry = document.createElement('div');
    logEntry.style.cssText = `
      margin: 5px 0;
      padding: 3px;
      border-left: 3px solid ${getColorByType(type)};
      padding-left: 5px;
    `;

    const timestamp = new Date().toLocaleTimeString();
    logEntry.innerHTML = `<span style="color: #aaa;">[${timestamp}]</span> <span style="color: ${getColorByType(type)};">[${type.toUpperCase()}]</span> ${message}`;
    
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  // 根據日誌類型獲取顏色
  function getColorByType(type) {
    switch (type.toLowerCase()) {
      case 'error': return '#ff5252';
      case 'warning': return '#ffaa00';
      case 'success': return '#4caf50';
      default: return '#42a5f5';
    }
  }

  // 檢查資料庫連接
  function checkDatabase() {
    log('正在檢查 IndexedDB 連接...');
    
    if (!window.indexedDB) {
      log('您的瀏覽器不支持 IndexedDB', 'error');
      return;
    }
    
    try {
      const dbName = 'babyGrowDB';
      const request = indexedDB.open(dbName, 1);
      
      request.onerror = function(event) {
        log(`IndexedDB 錯誤: ${event.target.error}`, 'error');
        log('可能的解決方案：檢查瀏覽器設置，確保未禁用 IndexedDB 或處於隱私模式', 'info');
      };
      
      request.onsuccess = function(event) {
        log('IndexedDB 連接成功', 'success');
        const db = event.target.result;
        const storeNames = Array.from(db.objectStoreNames);
        log(`現有的 Object Stores: ${storeNames.join(', ') || '無'}`);
        db.close();
      };
      
      request.onupgradeneeded = function(event) {
        log('IndexedDB 正在進行升級，這表示資料庫是新的或版本已更改', 'info');
      };
    } catch (error) {
      log(`檢查數據庫時出錯: ${error.message}`, 'error');
    }
  }

  // 修復載入問題
  function fixLoadingIssue() {
    log('嘗試修復載入問題...');
    
    try {
      // 檢查載入畫面是否存在
      const loadingScreen = document.getElementById('loading-screen');
      if (!loadingScreen) {
        log('找不到載入畫面元素 (#loading-screen)', 'error');
        return;
      }
      
      // 強制隱藏載入畫面
      loadingScreen.style.display = 'none';
      log('已強制隱藏載入畫面', 'success');
      
      // 檢查應用程式容器
      const appContainer = document.getElementById('app');
      if (!appContainer) {
        log('找不到應用程式容器 (#app)', 'error');
        return;
      }
      
      // 確保應用程式可見
      if (appContainer.classList.contains('hidden')) {
        appContainer.classList.remove('hidden');
        log('已移除應用程式容器的 hidden 類', 'success');
      }
      
      log('載入問題修復完成。如果仍有問題，請嘗試 "強制初始化" 或檢查 JS 錯誤', 'info');
    } catch (error) {
      log(`修復載入問題時出錯: ${error.message}`, 'error');
    }
  }

  // 檢查 JavaScript 錯誤
  function checkJavaScriptErrors() {
    log('檢查 JavaScript 錯誤...');
    
    // 檢查是否所有必需的 JS 文件都已載入
    const requiredScripts = ['config.js', 'db.js', 'ui.js', 'app.js'];
    let missingScripts = [];
    
    requiredScripts.forEach(script => {
      // 非精確檢查，只確認是否有帶有此名稱的腳本
      const scriptElements = document.querySelectorAll(`script[src*="${script}"]`);
      if (scriptElements.length === 0) {
        missingScripts.push(script);
      }
    });
    
    if (missingScripts.length > 0) {
      log(`缺少以下JS檔案: ${missingScripts.join(', ')}`, 'error');
    } else {
      log('所有必需的JS檔案都已在頁面中找到', 'success');
    }
    
    // 檢查是否有全局錯誤處理器
    if (!window.onerror) {
      // 添加全局錯誤處理器以捕獲未捕獲的錯誤
      window.onerror = function(message, source, lineno, colno, error) {
        log(`全局JS錯誤: ${message} (${source}:${lineno}:${colno})`, 'error');
        return false;
      };
      log('已添加全局錯誤處理器', 'info');
    }
    
    // 檢查是否有未處理的 promise 拒絕
    window.addEventListener('unhandledrejection', function(event) {
      log(`未處理的 Promise 拒絕: ${event.reason}`, 'error');
    });
    
    log('JS錯誤檢查完成。查看上方日誌獲取詳細信息', 'info');
  }

  // 強制初始化應用程式
  function forceInitialization() {
    log('嘗試強制初始化應用程式...');
    
    try {
      // 隱藏載入畫面
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
        log('已隱藏載入畫面', 'success');
      }
      
      // 顯示應用程式容器
      const appContainer = document.getElementById('app');
      if (appContainer) {
        appContainer.classList.remove('hidden');
        log('已顯示應用程式容器', 'success');
      }
      
      // 檢查是否可以訪問 App 類實例
      if (window.app) {
        log('找到 App 實例，嘗試重新初始化', 'info');
        
        // 嘗試重新初始化
        try {
          window.app.init().then(() => {
            log('App 重新初始化成功', 'success');
          }).catch(error => {
            log(`App 重新初始化失敗: ${error.message}`, 'error');
          });
        } catch (error) {
          log(`調用 app.init() 時出錯: ${error.message}`, 'error');
        }
      } else {
        log('找不到 App 實例，嘗試創建新的實例', 'warning');
        
        // 檢查是否已加載必要的類
        if (typeof BabyDB !== 'undefined') {
          log('找到 BabyDB 類，正在創建新的 App 實例', 'info');
          
          // 這裡我們嘗試模仿 app.js 中的初始化代碼
          try {
            // 注意：這段代碼應該與 app.js 中的初始化邏輯相匹配
            // 但由於我們沒有完整的代碼訪問權，所以這只是一個簡化版本
            const db = new BabyDB('babyGrowDB', 1);
            db.initDatabase().then(() => {
              log('資料庫初始化成功', 'success');
              // 在這裡添加更多初始化步驟
            }).catch(error => {
              log(`資料庫初始化失敗: ${error.message}`, 'error');
            });
          } catch (error) {
            log(`創建新的 App 實例時出錯: ${error.message}`, 'error');
          }
        } else {
          log('找不到 BabyDB 類，請確保所有 JS 文件已正確加載', 'error');
        }
      }
      
      log('強制初始化完成。如果應用程式仍未正常工作，請刷新頁面或檢查控制台錯誤', 'info');
    } catch (error) {
      log(`強制初始化時出錯: ${error.message}`, 'error');
    }
  }

  // 切換深色/淺色模式
  function toggleDarkMode() {
    try {
      const body = document.body;
      if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        log('已切換到淺色模式', 'success');
      } else {
        body.classList.add('dark-mode');
        log('已切換到深色模式', 'success');
      }
    } catch (error) {
      log(`切換深色模式時出錯: ${error.message}`, 'error');
    }
  }

  // 清除資料庫
  function clearDatabase() {
    log('正在準備清除資料庫...');
    
    if (confirm('您確定要清除所有數據嗎？此操作無法撤銷！')) {
      try {
        const dbName = 'babyGrowDB';
        const request = indexedDB.deleteDatabase(dbName);
        
        request.onerror = function(event) {
          log(`刪除資料庫時出錯: ${event.target.error}`, 'error');
        };
        
        request.onsuccess = function(event) {
          log('資料庫已成功刪除', 'success');
          log('請刷新頁面以重新初始化應用程式', 'info');
        };
      } catch (error) {
        log(`清除資料庫時出錯: ${error.message}`, 'error');
      }
    } else {
      log('取消清除資料庫操作', 'info');
    }
  }

  // 顯示系統信息
  function showSystemInfo() {
    log('收集系統信息...');
    
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      indexedDBSupport: !!window.indexedDB,
      localStorage: !!window.localStorage,
      serviceWorker: !!navigator.serviceWorker,
      onLine: navigator.onLine,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    
    Object.entries(info).forEach(([key, value]) => {
      log(`${key}: ${value}`);
    });
    
    log('系統信息收集完成', 'success');
  }

  // 初始化調試工具
  function init() {
    // 確保DOM已加載
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createDebugInterface);
    } else {
      createDebugInterface();
    }
    
    // 捕獲全局錯誤
    window.onerror = function(message, source, lineno, colno, error) {
      console.error(`JS Error: ${message} (${source}:${lineno}:${colno})`);
      
      // 當調試面板已經創建時才記錄到面板中
      if (document.getElementById('debug-log')) {
        log(`JS錯誤: ${message} (${source}:${lineno}:${colno})`, 'error');
      }
      
      return false; // 允許默認錯誤處理
    };
    
    // 捕獲 Promise 錯誤
    window.addEventListener('unhandledrejection', function(event) {
      console.error('Unhandled Promise Rejection:', event.reason);
      
      if (document.getElementById('debug-log')) {
        log(`未處理的 Promise 拒絕: ${event.reason}`, 'error');
      }
    });
    
    console.log('Debug tools initialized');
  }

  // 初始化
  init();
})();

// 在window對象上添加調試助手方法，以便在控制台使用
window.babyGrowDebug = {
  checkDatabase: function() {
    try {
      const dbName = 'babyGrowDB';
      const request = indexedDB.open(dbName, 1);
      console.log('Checking database connection...');
      
      request.onerror = function(event) {
        console.error('Database error:', event.target.error);
      };
      
      request.onsuccess = function(event) {
        console.log('Database connected successfully');
        const db = event.target.result;
        console.log('Object stores:', Array.from(db.objectStoreNames));
        db.close();
      };
    } catch (error) {
      console.error('Error checking database:', error);
    }
  },
  
  fixLoadingScreen: function() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
      console.log('Loading screen hidden');
    }
    
    const app = document.getElementById('app');
    if (app && app.classList.contains('hidden')) {
      app.classList.remove('hidden');
      console.log('App container revealed');
    }
  },
  
  reinitializeApp: function() {
    if (window.app && typeof window.app.init === 'function') {
      console.log('Reinitializing app...');
      window.app.init()
        .then(() => console.log('App reinitialized successfully'))
        .catch(error => console.error('Error reinitializing app:', error));
    } else {
      console.error('App instance not found or init method not available');
    }
  }
};

// 提供一些快速修復問題的方法
window.quickFix = function() {
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('app').classList.remove('hidden');
  console.log('Quick fix applied');
};