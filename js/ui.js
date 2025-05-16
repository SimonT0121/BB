'use strict';

/**
 * @fileoverview UI 操作模組 - 負責所有 DOM 操作和 UI 更新
 * @author BabyLog 開發團隊
 * @version 1.0.0
 */

/**
 * UI 操作類
 * 封裝所有與 DOM 相關的操作和 UI 更新
 */
class UI {
  /**
   * 構造函數
   */
  constructor() {
    // 快取常用的 DOM 元素，避免重複查詢
    this.elements = {
      appContainer: null,
      appNav: null,
      appMain: null,
      currentDateDisplay: null,
      childSelector: null,
      todaySummary: null,
      reflectionPrompt: null,
      reflectionInput: null,
      childrenList: null,
      activityTimeline: null,
      selectedDateDisplay: null,
      modalContainer: null,
      toastContainer: null,
      quickAddMenu: null
    };
  }

  /**
   * 初始化 UI
   */
  initUI() {
    console.log('[UI] 初始化 UI...');
    
    // 快取常用的 DOM 元素
    this.cacheElements();
    
    // 設置初始日期顯示
    this.updateCurrentDate();
    
    // 初始化 toast 容器
    if (!this.elements.toastContainer) {
      this.elements.toastContainer = document.getElementById('toastContainer');
    }
    
    console.log('[UI] UI 初始化完成');
  }

  /**
   * 快取常用的 DOM 元素
   * @private
   */
  cacheElements() {
    this.elements.appContainer = document.getElementById('app');
    this.elements.appNav = document.getElementById('appNav');
    this.elements.appMain = document.getElementById('appMain');
    this.elements.currentDateDisplay = document.getElementById('currentDate');
    this.elements.childSelector = document.getElementById('childSelector');
    this.elements.todaySummary = document.getElementById('todaySummary');
    this.elements.reflectionPrompt = document.getElementById('reflectionPrompt');
    this.elements.reflectionInput = document.getElementById('reflectionInput');
    this.elements.childrenList = document.getElementById('childrenList');
    this.elements.activityTimeline = document.getElementById('activityTimeline');
    this.elements.selectedDateDisplay = document.getElementById('selectedDate');
    this.elements.modalContainer = document.getElementById('modalContainer');
    this.elements.toastContainer = document.getElementById('toastContainer');
    this.elements.quickAddMenu = document.getElementById('quickAddMenu');
  }

  /**
   * 更新當前日期顯示
   */
  updateCurrentDate() {
    if (this.elements.currentDateDisplay) {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      this.elements.currentDateDisplay.textContent = now.toLocaleDateString('zh-TW', options);
    }
  }

  /**
   * 更新選定日期顯示
   * @param {Date} date - 選定的日期
   */
  updateSelectedDate(date) {
    if (this.elements.selectedDateDisplay) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      this.elements.selectedDateDisplay.textContent = date.toLocaleDateString('zh-TW', options);
    }
  }

  /**
   * 顯示歡迎視圖
   */
  showWelcomeView() {
    this.changeView('welcome');
  }

  /**
   * 更改視圖
   * @param {string} viewName - 視圖名稱
   */
  changeView(viewName) {
    // 隱藏所有視圖
    const views = document.querySelectorAll('.app-view');
    views.forEach(view => {
      view.classList.remove('active-view');
    });
    
    // 顯示指定的視圖
    let viewElement;
    
    if (viewName === 'welcome') {
      viewElement = document.getElementById('welcomeView');
    } else {
      viewElement = document.getElementById(`${viewName}View`);
    }
    
    if (viewElement) {
      viewElement.classList.add('active-view');
    } else {
      console.warn(`[UI] 找不到視圖元素: ${viewName}View`);
    }
    
    // 關閉側邊選單（如果打開）
    this.toggleMenu(false);
    
    console.log(`[UI] 已切換到視圖: ${viewName}`);
  }

  /**
   * 切換選單顯示狀態
   * @param {boolean} [show] - 是否顯示選單，未指定則切換當前狀態
   */
  toggleMenu(show) {
    if (this.elements.appNav) {
      if (show === undefined) {
        // 切換當前狀態
        this.elements.appNav.classList.toggle('active');
        this.elements.appContainer.classList.toggle('menu-active');
      } else if (show) {
        // 顯示選單
        this.elements.appNav.classList.add('active');
        this.elements.appContainer.classList.add('menu-active');
      } else {
        // 隱藏選單
        this.elements.appNav.classList.remove('active');
        this.elements.appContainer.classList.remove('menu-active');
      }
    }
  }

  /**
   * 切換快速添加選單顯示狀態
   * @param {boolean} [show] - 是否顯示選單，未指定則切換當前狀態
   */
  toggleQuickAddMenu(show) {
    if (this.elements.quickAddMenu) {
      if (show === undefined) {
        // 切換當前狀態
        this.elements.quickAddMenu.classList.toggle('active');
      } else if (show) {
        // 顯示選單
        this.elements.quickAddMenu.classList.add('active');
      } else {
        // 隱藏選單
        this.elements.quickAddMenu.classList.remove('active');
      }
    }
  }

  /**
   * 更新活動導航項目
   * @param {string} viewName - 活動視圖的名稱
   */
  updateActiveNavItem(viewName) {
    // 更新側邊選單中的活動項目
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.view === viewName) {
        item.classList.add('active');
      }
    });
    
    // 更新底部導航中的活動項目
    document.querySelectorAll('.footer-nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.view === viewName) {
        item.classList.add('active');
      }
    });
  }

  /**
   * 渲染孩子選擇器
   * @param {Array} children - 孩子數據數組
   * @param {string|number} selectedChildId - 選定的孩子 ID
   */
  renderChildSelector(children, selectedChildId) {
    if (!this.elements.childSelector) return;
    
    if (!children || children.length === 0) {
      this.elements.childSelector.innerHTML = `
        <div class="no-children-message">
          <p>尚未添加任何孩子</p>
          <button id="addFirstChildButton" class="secondary-button">添加孩子</button>
        </div>
      `;
      
      // 綁定添加第一個孩子按鈕
      const addFirstChildButton = document.getElementById('addFirstChildButton');
      if (addFirstChildButton) {
        addFirstChildButton.addEventListener('click', () => {
          // 使用自定義事件觸發，讓 App 類處理
          const event = new CustomEvent('addFirstChild');
          document.dispatchEvent(event);
        });
      }
      
      return;
    }
    
    let html = '<div class="child-select-list">';
    
    children.forEach(child => {
      const isSelected = selectedChildId && child.id.toString() === selectedChildId.toString();
      
      html += `
        <div class="child-select-item ${isSelected ? 'selected' : ''}" data-child-id="${child.id}">
          <div class="child-avatar">
            ${child.photo ? `<img src="${child.photo}" alt="${child.name}">` : `<div class="avatar-placeholder">${child.name.charAt(0)}</div>`}
          </div>
          <div class="child-info">
            <h3>${child.name}</h3>
            <p>${this.calculateAge(child.birthDate)}</p>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    
    this.elements.childSelector.innerHTML = html;
  }

  /**
   * 計算年齡
   * @param {string} birthDate - 出生日期（格式：YYYY-MM-DD）
   * @returns {string} 格式化的年齡字符串
   * @private
   */
  calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const now = new Date();
    
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    
    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    
    // 如果不足一個月，顯示天數
    if (years === 0 && months === 0) {
      const days = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
      return `${days} 天`;
    }
    
    // 如果不足一年，只顯示月份
    if (years === 0) {
      return `${months} 個月`;
    }
    
    // 顯示年和月
    return `${years} 歲 ${months} 個月`;
  }

  /**
   * 更新選定的孩子
   * @param {string|number} childId - 孩子 ID
   */
  updateSelectedChild(childId) {
    // 更新孩子選擇器中的選定狀態
    if (this.elements.childSelector) {
      const items = this.elements.childSelector.querySelectorAll('.child-select-item');
      items.forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.childId === childId.toString()) {
          item.classList.add('selected');
        }
      });
    }
  }

  /**
   * 渲染今日摘要
   * @param {Object|null} data - 包含餵食、睡眠和尿布記錄的數據對象，null 表示清空
   */
  renderTodaySummary(data) {
    if (!this.elements.todaySummary) return;
    
    if (!data) {
      this.elements.todaySummary.innerHTML = `
        <div class="placeholder-content">
          <p>選擇一個孩子來查看今日摘要</p>
        </div>
      `;
      return;
    }
    
    // 獲取數據
    const { feeding = [], sleep = [], diaper = [] } = data;
    
    // 計算統計數據
    const feedingCount = feeding.length;
    const sleepMinutes = sleep.reduce((total, record) => {
      const start = record.startTime;
      const end = record.endTime || Date.now();
      return total + Math.floor((end - start) / (1000 * 60));
    }, 0);
    const diaperCount = diaper.length;
    
    // 格式化睡眠時間
    const sleepHours = Math.floor(sleepMinutes / 60);
    const sleepRemainingMinutes = sleepMinutes % 60;
    const sleepTimeFormatted = sleepHours > 0 
      ? `${sleepHours} 小時 ${sleepRemainingMinutes} 分鐘` 
      : `${sleepRemainingMinutes} 分鐘`;
    
    // 創建 HTML
    let html = `
      <div class="summary-stats">
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-utensils"></i></div>
          <div class="stat-value">${feedingCount}</div>
          <div class="stat-label">餵食</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-moon"></i></div>
          <div class="stat-value">${sleepHours}h ${sleepRemainingMinutes}m</div>
          <div class="stat-label">睡眠</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-baby"></i></div>
          <div class="stat-value">${diaperCount}</div>
          <div class="stat-label">尿布</div>
        </div>
      </div>
    `;
    
    // 最近活動列表
    html += '<div class="recent-activities">';
    html += '<h4>最近活動</h4>';
    
    // 合併所有活動並按時間排序
    const allActivities = [
      ...feeding.map(f => ({ type: 'feeding', data: f, time: f.timestamp })),
      ...sleep.map(s => ({ type: 'sleep', data: s, time: s.startTime })),
      ...diaper.map(d => ({ type: 'diaper', data: d, time: d.timestamp }))
    ].sort((a, b) => b.time - a.time); // 按時間降序排列
    
    if (allActivities.length === 0) {
      html += '<p class="no-activities">今天還沒有記錄活動</p>';
    } else {
      html += '<ul class="activity-list">';
      
      // 只顯示最近的 5 個活動
      const recentActivities = allActivities.slice(0, 5);
      
      recentActivities.forEach(activity => {
        const time = new Date(activity.time);
        const formattedTime = time.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
        
        let activityText = '';
        let activityIcon = '';
        
        switch (activity.type) {
          case 'feeding':
            activityIcon = 'fas fa-utensils';
            activityText = `餵食 - ${activity.data.type === 'breast' ? '母乳' : (activity.data.type === 'formula' ? '配方奶' : '副食品')}`;
            if (activity.data.amount) {
              activityText += ` (${activity.data.amount} ${activity.data.unit || 'ml'})`;
            }
            break;
          case 'sleep':
            activityIcon = 'fas fa-moon';
            if (activity.data.endTime) {
              const durationMinutes = Math.floor((activity.data.endTime - activity.data.startTime) / (1000 * 60));
              const hours = Math.floor(durationMinutes / 60);
              const minutes = durationMinutes % 60;
              activityText = `睡眠 - ${hours > 0 ? `${hours}小時` : ''}${minutes}分鐘`;
            } else {
              activityText = '睡眠開始';
            }
            break;
          case 'diaper':
            activityIcon = 'fas fa-baby';
            activityText = `尿布 - ${activity.data.type === 'wet' ? '尿濕' : (activity.data.type === 'dirty' ? '排便' : '混合')}`;
            break;
        }
        
        html += `
          <li class="activity-item">
            <div class="activity-time">${formattedTime}</div>
            <div class="activity-content">
              <i class="${activityIcon}"></i>
              <span>${activityText}</span>
            </div>
          </li>
        `;
      });
      
      html += '</ul>';
    }
    
    html += '</div>'; // 結束 recent-activities
    
    this.elements.todaySummary.innerHTML = html;
  }

  /**
   * 更新反思提示
   * @param {string} prompt - 反思提示文本
   */
  updateReflectionPrompt(prompt) {
    if (this.elements.reflectionPrompt) {
      this.elements.reflectionPrompt.textContent = prompt;
    }
  }

  /**
   * 渲染孩子列表
   * @param {Array} children - 孩子數據數組
   */
  renderChildrenList(children) {
    if (!this.elements.childrenList) return;
    
    if (!children || children.length === 0) {
      this.elements.childrenList.innerHTML = `
        <div class="placeholder-content">
          <p>尚未添加任何孩子</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    
    children.forEach(child => {
      const birthDate = new Date(child.birthDate);
      const formattedBirthDate = birthDate.toLocaleDateString('zh-TW');
      const age = this.calculateAge(child.birthDate);
      
      html += `
        <div class="child-item" data-child-id="${child.id}">
          <div class="child-item-header">
            <div class="child-avatar">
              ${child.photo ? `<img src="${child.photo}" alt="${child.name}">` : `<div class="avatar-placeholder">${child.name.charAt(0)}</div>`}
            </div>
            <div class="child-info">
              <h3>${child.name}</h3>
              <p>${age}</p>
              <p>出生日期：${formattedBirthDate}</p>
            </div>
            <button class="child-item-edit" aria-label="編輯">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
      `;
    });
    
    this.elements.childrenList.innerHTML = html;
  }

  /**
   * 渲染活動時間軸
   * @param {Object|null} data - 包含餵食、睡眠和尿布記錄的數據對象，null 表示清空
   */
  renderActivityTimeline(data) {
    if (!this.elements.activityTimeline) return;
    
    if (!data) {
      this.elements.activityTimeline.innerHTML = `
        <div class="placeholder-content">
          <p>選擇一個孩子和日期來查看活動</p>
        </div>
      `;
      return;
    }
    
    // 獲取數據
    const { feeding = [], sleep = [], diaper = [] } = data;
    
    // 合併所有活動並按時間排序
    const allActivities = [
      ...feeding.map(f => ({ type: 'feeding', data: f, time: f.timestamp })),
      ...sleep.map(s => ({ type: 'sleep', data: s, time: s.startTime })),
      ...diaper.map(d => ({ type: 'diaper', data: d, time: d.timestamp }))
    ].sort((a, b) => a.time - b.time); // 按時間升序排列
    
    if (allActivities.length === 0) {
      this.elements.activityTimeline.innerHTML = `
        <div class="no-activities">
          <p>這一天沒有記錄活動</p>
          <button id="addActivityButton" class="secondary-button">添加活動</button>
        </div>
      `;
      
      // 綁定添加活動按鈕
      const addActivityButton = document.getElementById('addActivityButton');
      if (addActivityButton) {
        addActivityButton.addEventListener('click', () => {
          // 使用自定義事件觸發，讓 App 類處理
          const event = new CustomEvent('addActivity');
          document.dispatchEvent(event);
        });
      }
      
      return;
    }
    
    let html = '<div class="timeline">';
    
    allActivities.forEach((activity, index) => {
      const time = new Date(activity.time);
      const formattedTime = time.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
      
      let activityContent = '';
      let activityIcon = '';
      let activityClass = '';
      
      switch (activity.type) {
        case 'feeding':
          activityIcon = 'fas fa-utensils';
          activityClass = 'feeding-activity';
          
          let feedingType = '';
          switch (activity.data.type) {
            case 'breast':
              feedingType = '母乳';
              break;
            case 'formula':
              feedingType = '配方奶';
              break;
            case 'solid':
              feedingType = '副食品';
              break;
            default:
              feedingType = '餵食';
          }
          
          activityContent = `
            <div class="activity-details">
              <h4>${feedingType}</h4>
              ${activity.data.amount ? `<p>份量: ${activity.data.amount} ${activity.data.unit || 'ml'}</p>` : ''}
              ${activity.data.notes ? `<p>備註: ${activity.data.notes}</p>` : ''}
            </div>
          `;
          break;
          
        case 'sleep':
          activityIcon = 'fas fa-moon';
          activityClass = 'sleep-activity';
          
          let sleepContent = '';
          if (activity.data.endTime) {
            const durationMinutes = Math.floor((activity.data.endTime - activity.data.startTime) / (1000 * 60));
            const hours = Math.floor(durationMinutes / 60);
            const minutes = durationMinutes % 60;
            const endTime = new Date(activity.data.endTime);
            const formattedEndTime = endTime.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
            
            sleepContent = `
              <p>開始: ${formattedTime}</p>
              <p>結束: ${formattedEndTime}</p>
              <p>時長: ${hours > 0 ? `${hours}小時` : ''}${minutes}分鐘</p>
            `;
          } else {
            sleepContent = `
              <p>開始: ${formattedTime}</p>
              <p>狀態: 睡眠中</p>
            `;
          }
          
          activityContent = `
            <div class="activity-details">
              <h4>睡眠</h4>
              ${sleepContent}
              ${activity.data.notes ? `<p>備註: ${activity.data.notes}</p>` : ''}
            </div>
          `;
          break;
          
        case 'diaper':
          activityIcon = 'fas fa-baby';
          activityClass = 'diaper-activity';
          
          let diaperType = '';
          switch (activity.data.type) {
            case 'wet':
              diaperType = '尿濕';
              break;
            case 'dirty':
              diaperType = '排便';
              break;
            case 'mixed':
              diaperType = '混合';
              break;
            default:
              diaperType = '尿布更換';
          }
          
          activityContent = `
            <div class="activity-details">
              <h4>${diaperType}</h4>
              ${activity.data.notes ? `<p>備註: ${activity.data.notes}</p>` : ''}
            </div>
          `;
          break;
      }
      
      html += `
        <div class="timeline-item ${activityClass}" data-activity-id="${activity.data.id}" data-activity-type="${activity.type}">
          <div class="timeline-time">${formattedTime}</div>
          <div class="timeline-icon"><i class="${activityIcon}"></i></div>
          <div class="timeline-content">
            ${activityContent}
            <div class="timeline-actions">
              <button class="edit-activity" data-id="${activity.data.id}" data-type="${activity.type}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete-activity" data-id="${activity.data.id}" data-type="${activity.type}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    });
    
    html += '</div>'; // 結束 timeline
    
    this.elements.activityTimeline.innerHTML = html;
    
    // 綁定編輯和刪除按鈕的事件
    document.querySelectorAll('.edit-activity').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        const type = e.currentTarget.dataset.type;
        
        // 使用自定義事件觸發，讓 App 類處理
        const event = new CustomEvent('editActivity', { 
          detail: { id, type } 
        });
        document.dispatchEvent(event);
      });
    });
    
    document.querySelectorAll('.delete-activity').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        const type = e.currentTarget.dataset.type;
        
        // 使用自定義事件觸發，讓 App 類處理
        const event = new CustomEvent('deleteActivity', { 
          detail: { id, type } 
        });
        document.dispatchEvent(event);
      });
    });
  }

  /**
   * 顯示模態窗口
   * @param {string} content - 窗口內容 HTML
   * @param {string} [className] - 額外的 CSS 類名
   */
  showModal(content, className = '') {
    if (!this.elements.modalContainer) return;
    
    // 創建模態窗口
    const modalHtml = `
      <div class="modal-backdrop"></div>
      <div class="modal-dialog ${className}">
        <div class="modal-content">
          ${content}
        </div>
      </div>
    `;
    
    this.elements.modalContainer.innerHTML = modalHtml;
    this.elements.modalContainer.classList.add('active');
    
    // 綁定背景點擊關閉事件
    const backdrop = this.elements.modalContainer.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        this.closeModal();
      });
    }
    
    // 防止滾動
    document.body.style.overflow = 'hidden';
  }

  /**
   * 關閉模態窗口
   */
  closeModal() {
    if (!this.elements.modalContainer) return;
    
    this.elements.modalContainer.classList.remove('active');
    this.elements.modalContainer.innerHTML = '';
    
    // 恢復滾動
    document.body.style.overflow = '';
  }

  /**
   * 顯示提示消息
   * @param {string} message - 消息文本
   * @param {string} [type='info'] - 消息類型：'info', 'success', 'warning', 'error'
   * @param {number} [duration=3000] - 顯示時間（毫秒）
   */
  showToast(message, type = 'info', duration = 3000) {
    if (!this.elements.toastContainer) return;
    
    // 創建提示元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // 設置圖標
    let icon = '';
    switch (type) {
      case 'success':
        icon = '<i class="fas fa-check-circle"></i>';
        break;
      case 'warning':
        icon = '<i class="fas fa-exclamation-triangle"></i>';
        break;
      case 'error':
        icon = '<i class="fas fa-times-circle"></i>';
        break;
      default:
        icon = '<i class="fas fa-info-circle"></i>';
    }
    
    // 設置內容
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    // 添加到容器
    this.elements.toastContainer.appendChild(toast);
    
    // 顯示動畫
    setTimeout(() => {
      toast.classList.add('active');
    }, 10);
    
    // 綁定關閉按鈕
    const closeButton = toast.querySelector('.toast-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.closeToast(toast);
      });
    }
    
    // 設置自動關閉計時器
    const timer = setTimeout(() => {
      this.closeToast(toast);
    }, duration);
    
    // 存儲計時器 ID
    toast.dataset.timer = timer;
  }

  /**
   * 關閉提示消息
   * @param {HTMLElement} toast - 提示元素
   * @private
   */
  closeToast(toast) {
    // 清除計時器
    clearTimeout(parseInt(toast.dataset.timer));
    
    // 移除活動狀態（觸發淡出動畫）
    toast.classList.remove('active');
    
    // 等待動畫完成後移除元素
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300); // 與 CSS 過渡時間相同
  }

  /**
   * 顯示錯誤消息
   * @param {string} title - 錯誤標題
   * @param {string} message - 錯誤詳情
   */
  showError(title, message) {
    // 創建錯誤模態窗口
    const errorContent = `
      <div class="error-modal">
        <div class="error-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <h2>${title}</h2>
        <p>${message}</p>
        <button id="closeErrorButton" class="primary-button">確定</button>
      </div>
    `;
    
    this.showModal(errorContent, 'error-dialog');
    
    // 綁定關閉按鈕
    const closeButton = document.getElementById('closeErrorButton');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.closeModal();
      });
    }
    
    // 同時顯示提示消息
    this.showToast(title, 'error');
    
    console.error(`[UI] 錯誤: ${title} - ${message}`);
  }

  /**
   * 顯示確認對話框
   * @param {string} title - 對話框標題
   * @param {string} message - 對話框消息
   * @param {Function} onConfirm - 確認回調函數
   * @param {Function} [onCancel] - 取消回調函數
   */
  showConfirm(title, message, onConfirm, onCancel) {
    // 創建確認對話框
    const confirmContent = `
      <div class="confirm-dialog">
        <h2>${title}</h2>
        <p>${message}</p>
        <div class="form-actions">
          <button id="cancelButton" class="secondary-button">取消</button>
          <button id="confirmButton" class="primary-button">確認</button>
        </div>
      </div>
    `;
    
    this.showModal(confirmContent, 'confirm-dialog');
    
    // 綁定確認按鈕
    const confirmButton = document.getElementById('confirmButton');
    if (confirmButton) {
      confirmButton.addEventListener('click', () => {
        this.closeModal();
        if (typeof onConfirm === 'function') {
          onConfirm();
        }
      });
    }
    
    // 綁定取消按鈕
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        this.closeModal();
        if (typeof onCancel === 'function') {
          onCancel();
        }
      });
    }
  }

  /**
   * 過濾活動列表根據類別
   * @param {string} category - 類別名稱：'all', 'feeding', 'sleep', 'diaper', 'other'
   */
  filterActivitiesByCategory(category) {
    // 更新分類標籤的活動狀態
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.category === category) {
        tab.classList.add('active');
      }
    });
    
    // 過濾時間軸項目
    if (category === 'all') {
      // 顯示所有項目
      document.querySelectorAll('.timeline-item').forEach(item => {
        item.style.display = '';
      });
    } else {
      // 顯示匹配類別的項目，隱藏其他項目
      document.querySelectorAll('.timeline-item').forEach(item => {
        if (item.dataset.activityType === category || 
            (category === 'other' && !['feeding', 'sleep', 'diaper'].includes(item.dataset.activityType))) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    }
  }

  /**
   * 變更時間視圖
   * @param {string} viewType - 視圖類型：'day', 'week', 'month'
   */
  changeTimeView(viewType) {
    // 更新視圖控制按鈕的活動狀態
    document.querySelectorAll('.view-control').forEach(control => {
      control.classList.remove('active');
      if (control.dataset.view === viewType) {
        control.classList.add('active');
      }
    });
    
    // 使用自定義事件觸發，讓 App 類處理
    const event = new CustomEvent('changeTimeView', { 
      detail: { viewType } 
    });
    document.dispatchEvent(event);
  }
}

// 導出 UI 類
export default UI;