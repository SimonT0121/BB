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
    
    // 保存狀態
    this.state = {
      selectedDate: new Date()
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
    
    // 更新狀態
    this.state.selectedDate = date;
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

  /**
   * 渲染健康記錄
   * @param {Array|null} records - 健康記錄數組或 null
   */
  renderHealthRecords(records) {
    const container = document.getElementById('healthRecordsContainer');
    if (!container) return;
    
    if (!records || records.length === 0) {
      container.innerHTML = `
        <div class="placeholder-content">
          <p>這一天沒有健康記錄</p>
          <button id="addHealthRecordFromEmpty" class="secondary-button">添加健康記錄</button>
        </div>
      `;
      
      // 綁定添加健康記錄按鈕
      const addButton = document.getElementById('addHealthRecordFromEmpty');
      if (addButton) {
        addButton.addEventListener('click', () => {
          // 使用自定義事件觸發，讓 App 類處理
          const event = new CustomEvent('addHealthRecord');
          document.dispatchEvent(event);
        });
      }
      
      return;
    }
    
    // 按時間排序
    records.sort((a, b) => b.timestamp - a.timestamp);
    
    let html = `<div class="health-records-list">`;
    
    records.forEach(record => {
      // 獲取記錄類型名稱
      let typeName = '';
      let typeIcon = '';
      
      switch (record.type) {
        case 'vaccination':
          typeName = '疫苗接種';
          typeIcon = 'fas fa-syringe';
          break;
        case 'medication':
          typeName = '用藥記錄';
          typeIcon = 'fas fa-pills';
          break;
        case 'illness':
          typeName = '疾病記錄';
          typeIcon = 'fas fa-thermometer-half';
          break;
        case 'checkup':
          typeName = '體檢記錄';
          typeIcon = 'fas fa-stethoscope';
          break;
        case 'allergy':
          typeName = '過敏記錄';
          typeIcon = 'fas fa-allergies';
          break;
        default:
          typeName = '健康記錄';
          typeIcon = 'fas fa-notes-medical';
      }
      
      // 格式化日期
      const recordDate = new Date(record.date);
      const formattedDate = recordDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
      
      // 創建詳細內容
      let detailsHtml = '';
      
      switch (record.type) {
        case 'vaccination':
          let vaccineName = record.vaccineName;
          // 翻譯疫苗 ID 為名稱
          if (vaccineName && !vaccineName.includes(' ')) {
            const vaccines = {
              'bcg': 'BCG (卡介苗)',
              'hepb': 'B型肝炎疫苗',
              'dtap': 'DTaP (白喉、破傷風、百日咳)',
              'ipv': 'IPV (小兒麻痺)',
              'hib': 'Hib (b型嗜血桿菌)',
              'pcv': 'PCV (肺炎鏈球菌)',
              'rv': 'RV (輪狀病毒)',
              'mmr': 'MMR (麻疹、腮腺炎、德國麻疹)',
              'var': 'VAR (水痘)',
              'hepa': 'A型肝炎疫苗'
            };
            vaccineName = vaccines[vaccineName] || vaccineName;
          }
          
          detailsHtml = `
            <p>疫苗: ${vaccineName || '未指定'}</p>
            ${record.doseNumber ? `<p>劑次: ${record.doseNumber}</p>` : ''}
            ${record.location ? `<p>接種地點: ${record.location}</p>` : ''}
            ${record.provider ? `<p>醫護人員: ${record.provider}</p>` : ''}
            ${record.reaction ? `<p>反應: ${record.reaction}</p>` : ''}
          `;
          break;
          
        case 'medication':
          detailsHtml = `
            <p>藥物: ${record.medicationName || '未指定'}</p>
            ${record.dosage ? `<p>劑量: ${record.dosage}</p>` : ''}
            ${record.frequency ? `<p>頻率: ${record.frequency}</p>` : ''}
            ${record.reason ? `<p>原因: ${record.reason}</p>` : ''}
            ${record.prescriber ? `<p>處方醫生: ${record.prescriber}</p>` : ''}
          `;
          break;
          
        case 'illness':
          detailsHtml = `
            <p>症狀: ${record.symptom || '未指定'}</p>
            ${record.temperature ? `<p>體溫: ${record.temperature}</p>` : ''}
            ${record.started ? `<p>開始時間: ${new Date(record.started).toLocaleString('zh-TW')}</p>` : ''}
            ${record.ended ? `<p>結束時間: ${new Date(record.ended).toLocaleString('zh-TW')}</p>` : ''}
            ${record.treatment ? `<p>治療: ${record.treatment}</p>` : ''}
          `;
          break;
          
        case 'checkup':
          detailsHtml = `
            <p>醫生/醫院: ${record.provider || '未指定'}</p>
            ${record.weight ? `<p>體重: ${record.weight}</p>` : ''}
            ${record.height ? `<p>身高: ${record.height}</p>` : ''}
            ${record.headCircumference ? `<p>頭圍: ${record.headCircumference}</p>` : ''}
          `;
          break;
          
        case 'allergy':
          detailsHtml = `
            <p>過敏原: ${record.allergen || '未指定'}</p>
            ${record.reaction ? `<p>反應: ${record.reaction}</p>` : ''}
            ${record.severity ? `<p>嚴重程度: ${
              record.severity === 'mild' ? '輕微' : 
              (record.severity === 'moderate' ? '中等' : 
              (record.severity === 'severe' ? '嚴重' : record.severity))
            }</p>` : ''}
          `;
          break;
      }
      
      // 添加備註（如果有）
      if (record.notes) {
        detailsHtml += `<p>備註: ${record.notes}</p>`;
      }
      
      // 創建記錄卡片
      html += `
        <div class="health-record-item" data-record-id="${record.id}" data-category="${record.type}">
          <div class="record-header">
            <div class="record-icon"><i class="${typeIcon}"></i></div>
            <div class="record-title">
              <h4>${typeName}</h4>
              <p class="record-date">${formattedDate}</p>
            </div>
            <div class="record-actions">
              <button class="edit-record" data-id="${record.id}" data-type="${record.type}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete-record" data-id="${record.id}" data-type="${record.type}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="record-details">
            ${detailsHtml}
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
    
    container.innerHTML = html;
    
    // 綁定編輯和刪除按鈕的事件
    document.querySelectorAll('.edit-record').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        const type = e.currentTarget.dataset.type;
        
        // 使用自定義事件觸發，讓 App 類處理
        const event = new CustomEvent('editHealthRecord', { 
          detail: { id, type } 
        });
        document.dispatchEvent(event);
      });
    });
    
    document.querySelectorAll('.delete-record').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        const type = e.currentTarget.dataset.type;
        
        // 使用自定義事件觸發，讓 App 類處理
        const event = new CustomEvent('deleteHealthRecord', { 
          detail: { id, type } 
        });
        document.dispatchEvent(event);
      });
    });
  }

  /**
   * 渲染里程碑
   * @param {Array|null} milestones - 里程碑記錄數組或 null
   * @param {Object} child - 孩子資料
   */
  renderMilestones(milestones, child) {
    const container = document.getElementById('milestonesContainer');
    if (!container) return;
    
    if (!milestones || milestones.length === 0 || !child) {
      container.innerHTML = `
        <div class="placeholder-content">
          <p>尚未記錄任何里程碑</p>
          <button id="addMilestoneFromEmpty" class="secondary-button">添加里程碑</button>
        </div>
      `;
      
      // 綁定添加里程碑按鈕
      const addButton = document.getElementById('addMilestoneFromEmpty');
      if (addButton) {
        addButton.addEventListener('click', () => {
          // 使用自定義事件觸發，讓 App 類處理
          const event = new CustomEvent('addMilestone');
          document.dispatchEvent(event);
        });
      }
      
      return;
    }
    
    // 按日期降序排序
    milestones.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 從配置中獲取里程碑類別和名稱
    import('./config.js').then(({ MILESTONE_CATEGORIES }) => {
      let html = `<div class="milestones-list">`;
      
      // 按類別分組顯示里程碑
      MILESTONE_CATEGORIES.forEach(category => {
        // 過濾當前類別的里程碑
        const categoryMilestones = milestones.filter(m => m.category === category.id);
        
        if (categoryMilestones.length === 0) return;
        
        html += `
          <div class="milestone-category" data-category="${category.id}">
            <h3 class="category-title">${category.name}</h3>
            <div class="category-milestones">
        `;
        
        categoryMilestones.forEach(milestone => {
          // 查找里程碑詳細信息
          const milestoneInfo = category.milestones.find(m => m.id === milestone.milestoneId) || { name: milestone.milestoneId, typical_age: '未知' };
          
          // 格式化日期
          const milestoneDate = new Date(milestone.date);
          const formattedDate = milestoneDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
          
          // 計算達成時的年齡
          const birthDate = new Date(child.birthDate);
          const ageInDays = Math.floor((milestoneDate - birthDate) / (1000 * 60 * 60 * 24));
          let ageText = '';
          
          if (ageInDays < 30) {
            ageText = `${ageInDays} 天`;
          } else {
            const months = Math.floor(ageInDays / 30);
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;
            
            if (years > 0) {
              ageText = `${years} 歲 ${remainingMonths} 個月`;
            } else {
              ageText = `${months} 個月`;
            }
          }
          
          html += `
            <div class="milestone-item" data-milestone-id="${milestone.id}" data-category="${category.id}">
              <div class="milestone-info">
                <div class="milestone-header">
                  <h4>${milestoneInfo.name}</h4>
                  <span class="typical-age">典型年齡: ${milestoneInfo.typical_age}</span>
                </div>
                <div class="milestone-details">
                  <p>達成日期: ${formattedDate}</p>
                  <p>孩子年齡: ${ageText}</p>
                  ${milestone.notes ? `<p>備註: ${milestone.notes}</p>` : ''}
                </div>
              </div>
              <div class="milestone-actions">
                <button class="edit-milestone" data-id="${milestone.id}">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="delete-milestone" data-id="${milestone.id}">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `;
        });
        
        html += `
            </div>
          </div>
        `;
      });
      
      html += `</div>`;
      
      container.innerHTML = html;
      
      // 綁定編輯和刪除按鈕的事件
      document.querySelectorAll('.edit-milestone').forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = e.currentTarget.dataset.id;
          
          // 使用自定義事件觸發，讓 App 類處理
          const event = new CustomEvent('editMilestone', { 
            detail: { id } 
          });
          document.dispatchEvent(event);
        });
      });
      
      document.querySelectorAll('.delete-milestone').forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = e.currentTarget.dataset.id;
          
          // 使用自定義事件觸發，讓 App 類處理
          const event = new CustomEvent('deleteMilestone', { 
            detail: { id } 
          });
          document.dispatchEvent(event);
        });
      });
    }).catch(error => {
      console.error('[UI] 加載里程碑配置時出錯:', error);
      container.innerHTML = `
        <div class="error-message">
          <p>加載里程碑配置失敗</p>
          <p>${error.message}</p>
        </div>
      `;
    });
  }

  /**
   * 渲染即將達成的里程碑
   * @param {Array} milestones - 即將達成的里程碑數組
   */
  renderUpcomingMilestones(milestones) {
    const container = document.getElementById('upcomingMilestones');
    if (!container) return;
    
    if (!milestones || milestones.length === 0) {
      container.innerHTML = `<p class="no-items">暫無推薦的里程碑</p>`;
      return;
    }
    
    let html = '';
    
    milestones.forEach(milestone => {
      html += `
        <div class="upcoming-milestone" data-category="${milestone.category}" data-milestone-id="${milestone.milestoneId}">
          <div class="upcoming-milestone-info">
            <h4>${milestone.milestoneName}</h4>
            <p>類別: ${milestone.categoryName}</p>
            <p>典型年齡: ${milestone.typicalAge}</p>
          </div>
          <button class="record-milestone" data-category="${milestone.category}" data-milestone-id="${milestone.milestoneId}">
            記錄達成
          </button>
        </div>
      `;
    });
    
    container.innerHTML = html;
    
    // 綁定記錄達成按鈕的事件
    document.querySelectorAll('.record-milestone').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const category = e.currentTarget.dataset.category;
        const milestoneId = e.currentTarget.dataset.milestoneId;
        
        // 使用自定義事件觸發，讓 App 類處理
        const event = new CustomEvent('recordMilestone', { 
          detail: { category, milestoneId } 
        });
        document.dispatchEvent(event);
      });
    });
  }

  /**
   * 渲染圖表
   * @param {Object} data - 報告數據
   * @param {string} reportType - 報告類型
   * @param {string} viewType - 視圖類型
   */
  renderChart(data, reportType, viewType) {
    // 獲取畫布元素
    const canvas = document.getElementById('reportChart');
    if (!canvas) return;
    
    // 清除現有圖表
    this.clearChart();
    
    // 如果沒有數據或數據為空，顯示提示
    if (!data || !data.data || data.data.length === 0) {
      const ctx = canvas.getContext('2d');
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#757575';
      ctx.textAlign = 'center';
      ctx.fillText('暫無數據', canvas.width / 2, canvas.height / 2);
      return;
    }
    
    // 準備圖表數據
    const chartData = this.prepareChartData(data.data, reportType, viewType, data.startTime, data.endTime);
    
    // 創建 Chart.js 配置
    const config = {
      type: this.getChartType(reportType, viewType),
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: this.getChartTitle(reportType, viewType)
          }
        },
        scales: this.getChartScales(reportType, viewType)
      }
    };
    
    // 創建圖表
    // 注意：在實際應用中，您需要導入 Chart.js 庫
    // 這裡僅提供示例代碼
    if (window.chart) {
      window.chart.destroy();
    }
    
    if (window.Chart) {
      window.chart = new Chart(canvas, config);
    } else {
      console.error('[UI] Chart.js 未找到，無法創建圖表');
      const ctx = canvas.getContext('2d');
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#757575';
      ctx.textAlign = 'center';
      ctx.fillText('圖表庫未加載', canvas.width / 2, canvas.height / 2);
    }
  }

  /**
   * 準備圖表數據
   * @param {Array} records - 記錄數組
   * @param {string} reportType - 報告類型
   * @param {string} viewType - 視圖類型
   * @param {number} startTime - 開始時間戳
   * @param {number} endTime - 結束時間戳
   * @returns {Object} 圖表數據
   */
  prepareChartData(records, reportType, viewType, startTime, endTime) {
    // 根據報告類型和視圖類型處理數據
    switch (reportType) {
      case 'sleeping':
        return this.prepareSleepChartData(records, viewType, startTime, endTime);
      case 'feeding':
        return this.prepareFeedingChartData(records, viewType, startTime, endTime);
      case 'diaper':
        return this.prepareDiaperChartData(records, viewType, startTime, endTime);
      case 'growth':
        return this.prepareGrowthChartData(records, viewType);
      default:
        return { labels: [], datasets: [] };
    }
  }

  /**
   * 獲取圖表類型
   * @param {string} reportType - 報告類型
   * @param {string} viewType - 視圖類型
   * @returns {string} 圖表類型
   */
  getChartType(reportType, viewType) {
    switch (reportType) {
      case 'sleeping':
        return 'bar';
      case 'feeding':
        return 'bar';
      case 'diaper':
        return 'bar';
      case 'growth':
        return 'line';
      default:
        return 'bar';
    }
  }

  /**
   * 獲取圖表標題
   * @param {string} reportType - 報告類型
   * @param {string} viewType - 視圖類型
   * @returns {string} 圖表標題
   */
  getChartTitle(reportType, viewType) {
    let title = '';
    
    switch (reportType) {
      case 'sleeping':
        title = '睡眠時間';
        break;
      case 'feeding':
        title = '餵食次數';
        break;
      case 'diaper':
        title = '尿布更換次數';
        break;
      case 'growth':
        title = '成長趨勢';
        break;
      default:
        title = '數據報告';
    }
    
    switch (viewType) {
      case 'day':
        title += ' (日)';
        break;
      case 'week':
        title += ' (週)';
        break;
      case 'month':
        title += ' (月)';
        break;
    }
    
    return title;
  }

  /**
   * 獲取圖表坐標軸配置
   * @param {string} reportType - 報告類型
   * @param {string} viewType - 視圖類型
   * @returns {Object} 坐標軸配置
   */
  getChartScales(reportType, viewType) {
    const scales = {
      x: {
        title: {
          display: true,
          text: '日期'
        }
      },
      y: {
        title: {
          display: true,
          text: ''
        },
        beginAtZero: true
      }
    };
    
    switch (reportType) {
      case 'sleeping':
        scales.y.title.text = '小時';
        break;
      case 'feeding':
        scales.y.title.text = '次數';
        break;
      case 'diaper':
        scales.y.title.text = '次數';
        break;
      case 'growth':
        scales.y1 = {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: '身高 (cm)'
          },
          beginAtZero: false
        };
        scales.y2 = {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: '體重 (kg)'
          },
          beginAtZero: false,
          grid: {
            drawOnChartArea: false
          }
        };
        break;
    }
    
    return scales;
  }

  /**
   * 清除圖表
   */
  clearChart() {
    if (window.chart) {
      window.chart.destroy();
      window.chart = null;
    }
  }

  /**
   * 渲染報告摘要
   * @param {Object|null} data - 報告數據或 null
   * @param {string} reportType - 報告類型
   * @param {string} viewType - 視圖類型
   */
  renderReportSummary(data, reportType, viewType) {
    const container = document.getElementById('reportSummary');
    if (!container) return;
    
    if (!data || !data.data || data.data.length === 0) {
      container.innerHTML = `
        <div class="placeholder-content">
          <p>選擇一個孩子和時間範圍來查看報告</p>
        </div>
      `;
      return;
    }
    
    // 按報告類型生成摘要
    let summaryHtml = '';
    
    switch (reportType) {
      case 'sleeping':
        summaryHtml = this.generateSleepSummary(data.data, viewType);
        break;
      case 'feeding':
        summaryHtml = this.generateFeedingSummary(data.data, viewType);
        break;
      case 'diaper':
        summaryHtml = this.generateDiaperSummary(data.data, viewType);
        break;
      case 'growth':
        summaryHtml = this.generateGrowthSummary(data.data, viewType);
        break;
      default:
        summaryHtml = '<p>無可用摘要</p>';
    }
    
    container.innerHTML = `
      <div class="report-summary-content">
        <h3>摘要統計</h3>
        ${summaryHtml}
      </div>
    `;
  }

  /**
   * 渲染反思日記列表
   * @param {Array} reflections - 反思記錄數組
   */
  renderReflectionList(reflections) {
    const container = document.getElementById('reflectionList');
    if (!container) return;
    
    if (!reflections || reflections.length === 0) {
      container.innerHTML = `
        <div class="placeholder-content">
          <p>還沒有日記記錄</p>
          <p>記錄您與寶寶的日常感受和想法</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    
    reflections.forEach(reflection => {
      // 格式化日期
      const reflectionDate = new Date(reflection.date);
      const formattedDate = reflectionDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
      
      // 截取顯示部分文本
      const maxLength = 150;
      let previewText = reflection.text;
      let hasMore = false;
      
      if (previewText.length > maxLength) {
        previewText = previewText.substring(0, maxLength) + '...';
        hasMore = true;
      }
      
      html += `
        <div class="reflection-item" data-reflection-id="${reflection.id}">
          <div class="reflection-header">
            <h4>${reflection.title}</h4>
            <p class="reflection-date">${formattedDate}</p>
          </div>
          <div class="reflection-preview">
            <p>${previewText}</p>
            ${hasMore ? `<button class="view-full-reflection" data-id="${reflection.id}">查看完整內容</button>` : ''}
          </div>
          <div class="reflection-actions">
            <button class="edit-reflection" data-id="${reflection.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-reflection" data-id="${reflection.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    
    // 綁定查看完整內容按鈕的事件
    document.querySelectorAll('.view-full-reflection').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        
        // 使用自定義事件觸發，讓 App 類處理
        const event = new CustomEvent('viewFullReflection', { 
          detail: { id } 
        });
        document.dispatchEvent(event);
      });
    });
    
    // 綁定編輯和刪除按鈕的事件
    document.querySelectorAll('.edit-reflection').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        
        // 使用自定義事件觸發，讓 App 類處理
        const event = new CustomEvent('editReflection', { 
          detail: { id } 
        });
        document.dispatchEvent(event);
      });
    });
    
    document.querySelectorAll('.delete-reflection').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        
        // 使用自定義事件觸發，讓 App 類處理
        const event = new CustomEvent('deleteReflection', { 
          detail: { id } 
        });
        document.dispatchEvent(event);
      });
    });
  }

  /**
   * 更新選定日期，支持多個日期顯示元素
   * @param {Date} date - 日期
   * @param {string} [elementId] - 可選的元素 ID，未提供則使用默認的 selectedDate
   */
  updateSelectedDate(date, elementId = 'selectedDate') {
    const dateDisplay = document.getElementById(elementId);
    if (dateDisplay) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      dateDisplay.textContent = date.toLocaleDateString('zh-TW', options);
    }
    
    // 更新狀態
    this.state.selectedDate = date;
  }

  /**
   * 輔助方法：生成睡眠摘要
   * @param {Array} records - 睡眠記錄
   * @param {string} viewType - 視圖類型
   * @returns {string} 摘要 HTML
   */
  generateSleepSummary(records, viewType) {
    // 計算總睡眠時間
    let totalSleepMinutes = 0;
    let longestSleepMinutes = 0;
    let shortestSleepMinutes = Infinity;
    
    records.forEach(record => {
      if (record.endTime) {
        const duration = (record.endTime - record.startTime) / (1000 * 60);
        totalSleepMinutes += duration;
        
        if (duration > longestSleepMinutes) {
          longestSleepMinutes = duration;
        }
        
        if (duration < shortestSleepMinutes) {
          shortestSleepMinutes = duration;
        }
      }
    });
    
    // 如果沒有完整的睡眠記錄
    if (shortestSleepMinutes === Infinity) {
      shortestSleepMinutes = 0;
    }
    
    // 格式化時間
    const totalSleepHours = Math.floor(totalSleepMinutes / 60);
    const totalSleepRemainingMinutes = Math.round(totalSleepMinutes % 60);
    
    const longestSleepHours = Math.floor(longestSleepMinutes / 60);
    const longestSleepRemainingMinutes = Math.round(longestSleepMinutes % 60);
    
    const shortestSleepHours = Math.floor(shortestSleepMinutes / 60);
    const shortestSleepRemainingMinutes = Math.round(shortestSleepMinutes % 60);
    
    // 計算每日平均
    let avgSleepMinutesPerDay = 0;
    
    if (viewType === 'week') {
      avgSleepMinutesPerDay = totalSleepMinutes / 7;
    } else if (viewType === 'month') {
      // 使用選定日期的月份天數
      const daysInMonth = new Date(this.state?.selectedDate.getFullYear(), this.state?.selectedDate.getMonth() + 1, 0).getDate();
      avgSleepMinutesPerDay = totalSleepMinutes / daysInMonth;
    } else {
      // 日視圖就是總時間
      avgSleepMinutesPerDay = totalSleepMinutes;
    }
    
    const avgSleepHours = Math.floor(avgSleepMinutesPerDay / 60);
    const avgSleepRemainingMinutes = Math.round(avgSleepMinutesPerDay % 60);
    
    return `
      <div class="summary-stats">
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-clock"></i></div>
          <div class="stat-value">${totalSleepHours}小時 ${totalSleepRemainingMinutes}分鐘</div>
          <div class="stat-label">總睡眠時間</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-bed"></i></div>
          <div class="stat-value">${avgSleepHours}小時 ${avgSleepRemainingMinutes}分鐘</div>
          <div class="stat-label">日均睡眠</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-arrow-up"></i></div>
          <div class="stat-value">${longestSleepHours}小時 ${longestSleepRemainingMinutes}分鐘</div>
          <div class="stat-label">最長睡眠</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-arrow-down"></i></div>
          <div class="stat-value">${shortestSleepHours}小時 ${shortestSleepRemainingMinutes}分鐘</div>
          <div class="stat-label">最短睡眠</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-list-ol"></i></div>
          <div class="stat-value">${records.length}</div>
          <div class="stat-label">睡眠次數</div>
        </div>
      </div>
    `;
  }

  /**
   * 輔助方法：生成餵食摘要
   * @param {Array} records - 餵食記錄
   * @param {string} viewType - 視圖類型
   * @returns {string} 摘要 HTML
   */
  generateFeedingSummary(records, viewType) {
    // 計算各種類型的餵食次數
    let breastCount = 0;
    let formulaCount = 0;
    let solidCount = 0;
    let totalAmount = 0;
    let validAmountCount = 0;
    
    records.forEach(record => {
      if (record.type === 'breast') {
        breastCount++;
      } else if (record.type === 'formula') {
        formulaCount++;
      } else if (record.type === 'solid') {
        solidCount++;
      }
      
      // 計算總量（僅限有標記量的記錄）
      if (record.amount && !isNaN(parseFloat(record.amount))) {
        totalAmount += parseFloat(record.amount);
        validAmountCount++;
      }
    });
    
    // 計算平均量
    const avgAmount = validAmountCount > 0 ? Math.round(totalAmount / validAmountCount) : 0;
    
    // 計算每日平均次數
    let daysCount = 1;
    
    if (viewType === 'week') {
      daysCount = 7;
    } else if (viewType === 'month') {
      // 使用選定日期的月份天數
      daysCount = new Date(this.state?.selectedDate.getFullYear(), this.state?.selectedDate.getMonth() + 1, 0).getDate();
    }
    
    const avgFeedingsPerDay = Math.round((records.length / daysCount) * 10) / 10;
    
    return `
      <div class="summary-stats">
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-utensils"></i></div>
          <div class="stat-value">${records.length}</div>
          <div class="stat-label">總餵食次數</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-calendar-day"></i></div>
          <div class="stat-value">${avgFeedingsPerDay}</div>
          <div class="stat-label">日均次數</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-tint"></i></div>
          <div class="stat-value">${breastCount}</div>
          <div class="stat-label">母乳次數</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-baby-carriage"></i></div>
          <div class="stat-value">${formulaCount}</div>
          <div class="stat-label">配方奶次數</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-drumstick-bite"></i></div>
          <div class="stat-value">${solidCount}</div>
          <div class="stat-label">副食品次數</div>
        </div>
        ${validAmountCount > 0 ? `
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-flask"></i></div>
          <div class="stat-value">${avgAmount} ml</div>
          <div class="stat-label">平均量 (${validAmountCount}次)</div>
        </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * 輔助方法：生成尿布摘要
   * @param {Array} records - 尿布記錄
   * @param {string} viewType - 視圖類型
   * @returns {string} 摘要 HTML
   */
  generateDiaperSummary(records, viewType) {
    // 計算各種類型的尿布次數
    let wetCount = 0;
    let dirtyCount = 0;
    let mixedCount = 0;
    
    records.forEach(record => {
      if (record.type === 'wet') {
        wetCount++;
      } else if (record.type === 'dirty') {
        dirtyCount++;
      } else if (record.type === 'mixed') {
        mixedCount++;
      }
    });
    
    // 計算每日平均次數
    let daysCount = 1;
    
    if (viewType === 'week') {
      daysCount = 7;
    } else if (viewType === 'month') {
      // 使用選定日期的月份天數
      daysCount = new Date(this.state?.selectedDate.getFullYear(), this.state?.selectedDate.getMonth() + 1, 0).getDate();
    }
    
    const avgDiapersPerDay = Math.round((records.length / daysCount) * 10) / 10;
    
    return `
      <div class="summary-stats">
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-baby"></i></div>
          <div class="stat-value">${records.length}</div>
          <div class="stat-label">總換尿布次數</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-calendar-day"></i></div>
          <div class="stat-value">${avgDiapersPerDay}</div>
          <div class="stat-label">日均次數</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-tint"></i></div>
          <div class="stat-value">${wetCount}</div>
          <div class="stat-label">尿濕</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-poo"></i></div>
          <div class="stat-value">${dirtyCount}</div>
          <div class="stat-label">排便</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><i class="fas fa-wind"></i></div>
          <div class="stat-value">${mixedCount}</div>
          <div class="stat-label">混合</div>
        </div>
      </div>
    `;
  }

  /**
   * 輔助方法：生成成長摘要
   * @param {Array} records - 成長記錄
   * @param {string} viewType - 視圖類型
   * @returns {string} 摘要 HTML
   */
  generateGrowthSummary(records, viewType) {
    // 只保留有體重或身高數據的記錄
    const validRecords = records.filter(record => record.weight || record.height);
    
    if (validRecords.length === 0) {
      return '<p>無有效的成長數據</p>';
    }
    
    // 按日期排序
    validRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 獲取最新記錄
    const latestRecord = validRecords[validRecords.length - 1];
    
    // 獲取最早記錄（用於計算變化）
    const earliestRecord = validRecords[0];
    
    // 解析數值（移除單位）
    const parseValue = (value, defaultValue = 0) => {
      if (!value) return defaultValue;
      
      const numericValue = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
      return isNaN(numericValue) ? defaultValue : numericValue;
    };
    
    // 獲取當前值
    const currentWeight = parseValue(latestRecord.weight);
    const currentHeight = parseValue(latestRecord.height);
    const currentHeadCircumference = parseValue(latestRecord.headCircumference);
    
    // 計算變化
    const initialWeight = parseValue(earliestRecord.weight);
    const initialHeight = parseValue(earliestRecord.height);
    const initialHeadCircumference = parseValue(earliestRecord.headCircumference);
    
    const weightChange = currentWeight - initialWeight;
    const heightChange = currentHeight - initialHeight;
    const headCircumferenceChange = currentHeadCircumference - initialHeadCircumference;
    
    // 格式化日期
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('zh-TW', { year: 'numeric', month: 'numeric', day: 'numeric' });
    };
    
    return `
      <div class="growth-summary">
        <div class="current-measurements">
          <h4>當前數據 (${formatDate(latestRecord.date)})</h4>
          <div class="summary-stats">
            ${currentWeight ? `
            <div class="stat-item">
              <div class="stat-icon"><i class="fas fa-weight"></i></div>
              <div class="stat-value">${currentWeight} kg</div>
              <div class="stat-label">體重</div>
            </div>
            ` : ''}
            ${currentHeight ? `
            <div class="stat-item">
              <div class="stat-icon"><i class="fas fa-ruler-vertical"></i></div>
              <div class="stat-value">${currentHeight} cm</div>
              <div class="stat-label">身高</div>
            </div>
            ` : ''}
            ${currentHeadCircumference ? `
            <div class="stat-item">
              <div class="stat-icon"><i class="fas fa-circle"></i></div>
              <div class="stat-value">${currentHeadCircumference} cm</div>
              <div class="stat-label">頭圍</div>
            </div>
            ` : ''}
          </div>
        </div>
        
        ${validRecords.length > 1 ? `
        <div class="measurement-changes">
          <h4>變化 (自 ${formatDate(earliestRecord.date)})</h4>
          <div class="summary-stats">
            ${initialWeight && currentWeight ? `
            <div class="stat-item">
              <div class="stat-icon"><i class="fas fa-weight"></i></div>
              <div class="stat-value ${weightChange >= 0 ? 'positive' : 'negative'}">
                ${weightChange >= 0 ? '+' : ''}${weightChange.toFixed(2)} kg
              </div>
              <div class="stat-label">體重變化</div>
            </div>
            ` : ''}
            ${initialHeight && currentHeight ? `
            <div class="stat-item">
              <div class="stat-icon"><i class="fas fa-ruler-vertical"></i></div>
              <div class="stat-value ${heightChange >= 0 ? 'positive' : 'negative'}">
                ${heightChange >= 0 ? '+' : ''}${heightChange.toFixed(1)} cm
              </div>
              <div class="stat-label">身高變化</div>
            </div>
            ` : ''}
            ${initialHeadCircumference && currentHeadCircumference ? `
            <div class="stat-item">
              <div class="stat-icon"><i class="fas fa-circle"></i></div>
              <div class="stat-value ${headCircumferenceChange >= 0 ? 'positive' : 'negative'}">
                ${headCircumferenceChange >= 0 ? '+' : ''}${headCircumferenceChange.toFixed(1)} cm
              </div>
              <div class="stat-label">頭圍變化</div>
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}
        
        <div class="record-count">
          <p>共 ${validRecords.length} 條記錄</p>
        </div>
      </div>
    `;
  }
  
  // 這裡可以添加其他圖表數據準備方法，例如：
  // prepareSleepChartData、prepareFeedingChartData 等
  // 由於篇幅限制，這些方法的具體實現未包含在此示例中
}

// 導出 UI 類
export default UI;