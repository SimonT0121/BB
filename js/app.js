'use strict';

/**
 * @fileoverview 應用程式主要邏輯 - 協調各模組並處理主要事件
 * @author BabyLog 開發團隊
 * @version 1.0.0
 */

// 導入所需的模組
import BabyLogDB from './db.js';
import UI from './ui.js';
import { APP_CONFIG } from './config.js';

/**
 * 主應用程式類
 * 負責初始化和協調應用程式的各個部分
 */
class App {
  /**
   * 構造函數
   */
  constructor() {
    // 初始化數據庫
    this.db = new BabyLogDB(APP_CONFIG.DB_NAME, APP_CONFIG.DB_VERSION);
    
    // 初始化 UI
    this.ui = new UI();
    
    // 當前應用狀態
    this.state = {
      currentView: 'welcome',
      selectedChildId: null,
      selectedDate: new Date(),
      themeMode: 'light' // 預設淺色主題
    };
    
    // 綁定事件處理方法到當前實例
    this.handleViewChange = this.handleViewChange.bind(this);
    this.handleChildSelect = this.handleChildSelect.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleQuickAction = this.handleQuickAction.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleThemeToggle = this.handleThemeToggle.bind(this);
    this.handleNavigation = this.handleNavigation.bind(this);
  }

  /**
   * 初始化應用程式
   */
  async init() {
    try {
      console.log('[App] 初始化應用程式...');
      
      // 從本地存儲加載用戶偏好設置
      this.loadUserPreferences();
      
      // 初始化數據庫
      await this.db.initDatabase();
      
      // 初始化 UI
      this.ui.initUI();
      
      // 檢查是否首次使用
      const isFirstUse = await this.checkFirstUse();
      
      // 綁定事件監聽器
      this.bindEventListeners();
      
      // 根據是否首次使用決定初始視圖
      if (isFirstUse) {
        this.showWelcomeView();
      } else {
        // 加載孩子列表
        await this.loadChildrenList();
        
        // 如果有選定的孩子，加載他們的數據
        if (this.state.selectedChildId) {
          await this.loadChildData(this.state.selectedChildId);
        }
        
        // 顯示首頁視圖
        this.showHomeView();
      }
      
      console.log('[App] 應用程式初始化完成');
    } catch (error) {
      console.error('[App] 初始化應用程式時出錯:', error);
      this.ui.showError('初始化應用程式失敗', error.message);
    }
  }

  /**
   * 從本地存儲加載用戶偏好設置
   */
  loadUserPreferences() {
    try {
      // 加載主題設置
      const savedTheme = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.THEME);
      if (savedTheme) {
        this.state.themeMode = savedTheme;
        document.body.setAttribute('data-theme', savedTheme);
      }
      
      // 加載選定的孩子 ID
      const savedChildId = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SELECTED_CHILD);
      if (savedChildId) {
        this.state.selectedChildId = savedChildId;
      }
      
      console.log('[App] 已加載用戶偏好設置');
    } catch (error) {
      console.warn('[App] 加載用戶偏好設置時出錯:', error);
      // 使用預設設置，不中斷應用程式初始化
    }
  }

  /**
   * 保存用戶偏好設置到本地存儲
   */
  saveUserPreferences() {
    try {
      // 保存主題設置
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.THEME, this.state.themeMode);
      
      // 保存選定的孩子 ID
      if (this.state.selectedChildId) {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SELECTED_CHILD, this.state.selectedChildId);
      }
    } catch (error) {
      console.warn('[App] 保存用戶偏好設置時出錯:', error);
      // 不是嚴重錯誤，可以繼續運行
    }
  }

  /**
   * 檢查是否首次使用應用程式
   * @returns {Promise<boolean>} 是否首次使用
   */
  async checkFirstUse() {
    try {
      // 檢查 localStorage 中的首次使用標記
      const hasUsedBefore = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.FIRST_USE);
      
      if (hasUsedBefore) {
        return false;
      }
      
      // 檢查數據庫中是否有任何孩子記錄
      const children = await this.db.getAll('children');
      
      // 如果沒有孩子記錄且 localStorage 中沒有標記，視為首次使用
      return children.length === 0;
    } catch (error) {
      console.warn('[App] 檢查首次使用時出錯:', error);
      // 出錯時，假定為首次使用以顯示歡迎頁面
      return true;
    }
  }

  /**
   * 綁定全局事件監聽器
   */
  bindEventListeners() {
    // 導航切換監聽器
    document.querySelectorAll('.nav-item, .footer-nav-item').forEach(item => {
      if (!item.classList.contains('footer-nav-center')) {  // 排除快速添加按鈕
        item.addEventListener('click', this.handleNavigation);
      }
    });
    
    // 主題切換按鈕
    document.getElementById('themeToggle').addEventListener('click', this.handleThemeToggle);
    
    // 菜單開關
    document.getElementById('menuToggle').addEventListener('click', () => {
      this.ui.toggleMenu(true);
    });
    
    document.getElementById('closeMenu').addEventListener('click', () => {
      this.ui.toggleMenu(false);
    });
    
    // 快速操作按鈕
    document.querySelectorAll('.action-button').forEach(button => {
      button.addEventListener('click', this.handleQuickAction);
    });
    
    // 快速添加按鈕
    document.getElementById('quickAddButton').addEventListener('click', (e) => {
      e.preventDefault();
      this.ui.toggleQuickAddMenu();
    });
    
    // 快速添加選項
    document.querySelectorAll('.quick-option').forEach(option => {
      option.addEventListener('click', this.handleQuickAction);
    });
    
    // 快速添加背景點擊關閉
    document.querySelector('.quick-add-backdrop').addEventListener('click', () => {
      this.ui.toggleQuickAddMenu(false);
    });
    
    // 開始使用按鈕（歡迎頁面）
    document.getElementById('startButton').addEventListener('click', () => {
      this.handleFirstUseComplete();
    });
    
    // 添加孩子按鈕
    document.getElementById('addChildButton').addEventListener('click', () => {
      this.showAddChildForm();
    });
    
    // 日期導航按鈕
    document.getElementById('prevDate').addEventListener('click', () => {
      this.navigateDate(-1);
    });
    
    document.getElementById('nextDate').addEventListener('click', () => {
      this.navigateDate(1);
    });
    
    // 反思保存按鈕
    document.getElementById('saveReflection').addEventListener('click', () => {
      this.saveReflection();
    });
    
    // 備份和恢復按鈕
    document.getElementById('dataBackup').addEventListener('click', () => {
      this.backupData();
    });
    
    document.getElementById('dataRestore').addEventListener('click', () => {
      this.restoreData();
    });
    
    // 日期視圖控制
    document.querySelectorAll('.view-control').forEach(control => {
      control.addEventListener('click', (e) => {
        this.changeTimeView(e.target.dataset.view);
      });
    });
    
    // 分類標籤切換
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.filterActivitiesByCategory(e.target.dataset.category);
      });
    });
    
    console.log('[App] 已綁定所有事件監聽器');
  }

  /**
   * 處理導航事件
   * @param {Event} e - 事件對象
   */
  handleNavigation(e) {
    e.preventDefault();
    const view = e.currentTarget.dataset.view;
    if (view) {
      this.changeView(view);
    }
  }

  /**
   * 更改當前視圖
   * @param {string} viewName - 視圖名稱
   */
  changeView(viewName) {
    // 更新狀態
    this.state.currentView = viewName;
    
    // 更新 UI
    this.ui.changeView(viewName);
    
    // 根據視圖加載相應數據
    this.loadViewData(viewName);
    
    // 更新導航項目的活動狀態
    this.ui.updateActiveNavItem(viewName);
  }

  /**
   * 根據視圖名稱加載相應的數據
   * @param {string} viewName - 視圖名稱
   */
  async loadViewData(viewName) {
    try {
      switch (viewName) {
        case 'home':
          await this.loadHomeViewData();
          break;
        case 'children':
          await this.loadChildrenList();
          break;
        case 'daily':
          await this.loadDailyRecords();
          break;
        case 'health':
          await this.loadHealthRecords();
          break;
        case 'milestones':
          await this.loadMilestones();
          break;
        case 'reports':
          await this.loadReports();
          break;
        case 'reflection':
          await this.loadReflectionData();
          break;
        case 'settings':
          this.loadSettings();
          break;
        default:
          // 對於不需要特殊處理的視圖，不做操作
          break;
      }
    } catch (error) {
      console.error(`[App] 加載視圖數據時出錯 (${viewName}):`, error);
      this.ui.showError(`加載 ${viewName} 視圖數據失敗`, error.message);
    }
  }

  /**
   * 處理首次使用完成
   */
  async handleFirstUseComplete() {
    try {
      // 設置首次使用標記
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.FIRST_USE, 'true');
      
      // 顯示添加孩子表單
      this.showAddChildForm();
      
      console.log('[App] 首次使用完成');
    } catch (error) {
      console.error('[App] 處理首次使用完成時出錯:', error);
      this.ui.showError('設置首次使用標記失敗', error.message);
    }
  }

  /**
   * 顯示歡迎視圖
   */
  showWelcomeView() {
    this.state.currentView = 'welcome';
    this.ui.showWelcomeView();
  }

  /**
   * 顯示首頁視圖
   */
  showHomeView() {
    this.changeView('home');
  }

  /**
   * 加載首頁視圖數據
   */
  async loadHomeViewData() {
    try {
      // 更新當前日期顯示
      this.ui.updateCurrentDate();
      
      // 加載孩子選擇器
      await this.loadChildSelector();
      
      // 如果有選定的孩子，加載今日摘要
      if (this.state.selectedChildId) {
        await this.loadTodaySummary(this.state.selectedChildId);
      }
      
      // 加載今日反思提示
      this.loadReflectionPrompt();
      
      console.log('[App] 已加載首頁視圖數據');
    } catch (error) {
      console.error('[App] 加載首頁視圖數據時出錯:', error);
      this.ui.showError('加載首頁數據失敗', error.message);
    }
  }

  /**
   * 加載孩子選擇器
   */
  async loadChildSelector() {
    try {
      // 從數據庫獲取所有孩子
      const children = await this.db.getAll('children');
      
      // 更新 UI
      this.ui.renderChildSelector(children, this.state.selectedChildId);
      
      // 綁定孩子選擇事件
      document.querySelectorAll('.child-select-item').forEach(item => {
        item.addEventListener('click', this.handleChildSelect);
      });
      
      console.log('[App] 已加載孩子選擇器');
    } catch (error) {
      console.error('[App] 加載孩子選擇器時出錯:', error);
      this.ui.showError('加載孩子選擇器失敗', error.message);
    }
  }

  /**
   * 處理孩子選擇事件
   * @param {Event} e - 事件對象
   */
  async handleChildSelect(e) {
    const childId = e.currentTarget.dataset.childId;
    
    if (childId && childId !== this.state.selectedChildId) {
      // 更新選定的孩子 ID
      this.state.selectedChildId = childId;
      
      // 更新 UI
      this.ui.updateSelectedChild(childId);
      
      // 加載選定孩子的數據
      await this.loadChildData(childId);
      
      // 保存用戶偏好設置
      this.saveUserPreferences();
      
      console.log(`[App] 已選擇孩子: ${childId}`);
    }
  }

  /**
   * 加載選定孩子的數據
   * @param {string|number} childId - 孩子 ID
   */
  async loadChildData(childId) {
    try {
      // 根據當前視圖加載相應數據
      switch (this.state.currentView) {
        case 'home':
          await this.loadTodaySummary(childId);
          break;
        case 'daily':
          await this.loadDailyRecords(childId);
          break;
        case 'health':
          await this.loadHealthRecords(childId);
          break;
        case 'milestones':
          await this.loadMilestones(childId);
          break;
        case 'reports':
          await this.loadReports(childId);
          break;
        default:
          // 不需要特殊處理的視圖，不做操作
          break;
      }
      
      console.log(`[App] 已加載孩子數據: ${childId}`);
    } catch (error) {
      console.error(`[App] 加載孩子數據時出錯 (${childId}):`, error);
      this.ui.showError('加載孩子數據失敗', error.message);
    }
  }

  /**
   * 加載今日摘要
   * @param {string|number} childId - 孩子 ID
   */
  async loadTodaySummary(childId) {
    try {
      // 獲取今天的開始和結束時間戳
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
      
      // 獲取今日餵食記錄
      const feedingRecords = await this.db.getChildRecordsByTimeRange('feeding', childId, startOfDay, endOfDay);
      
      // 獲取今日睡眠記錄
      const sleepRecords = await this.db.getChildRecordsByTimeRange('sleep', childId, startOfDay, endOfDay);
      
      // 獲取今日尿布記錄
      const diaperRecords = await this.db.getChildRecordsByTimeRange('diaper', childId, startOfDay, endOfDay);
      
      // 更新 UI
      this.ui.renderTodaySummary({
        feeding: feedingRecords,
        sleep: sleepRecords,
        diaper: diaperRecords
      });
      
      console.log(`[App] 已加載今日摘要: ${childId}`);
    } catch (error) {
      console.error(`[App] 加載今日摘要時出錯 (${childId}):`, error);
      this.ui.showError('加載今日摘要失敗', error.message);
    }
  }

  /**
   * 加載反思提示
   */
  loadReflectionPrompt() {
    try {
      // 從提示列表中隨機選擇一個
      const prompts = APP_CONFIG.REFLECTION_PROMPTS;
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      
      // 更新 UI
      this.ui.updateReflectionPrompt(randomPrompt);
      
      console.log('[App] 已加載反思提示');
    } catch (error) {
      console.error('[App] 加載反思提示時出錯:', error);
      // 非關鍵功能，失敗不影響主要功能
    }
  }

  /**
   * 保存反思
   */
  async saveReflection() {
    try {
      const reflectionInput = document.getElementById('reflectionInput');
      const reflectionText = reflectionInput.value.trim();
      
      if (!reflectionText) {
        this.ui.showToast('反思內容不能為空', 'warning');
        return;
      }
      
      // 創建反思數據對象
      const reflectionData = {
        text: reflectionText,
        date: new Date().toISOString().split('T')[0], // 格式: YYYY-MM-DD
        timestamp: new Date().getTime()
      };
      
      // 保存到數據庫
      await this.db.add('parentReflection', reflectionData);
      
      // 清空輸入框
      reflectionInput.value = '';
      
      // 顯示成功消息
      this.ui.showToast('反思已保存', 'success');
      
      console.log('[App] 已保存反思');
    } catch (error) {
      console.error('[App] 保存反思時出錯:', error);
      this.ui.showError('保存反思失敗', error.message);
    }
  }

  /**
   * 加載孩子列表
   */
  async loadChildrenList() {
    try {
      // 從數據庫獲取所有孩子
      const children = await this.db.getAll('children');
      
      // 更新 UI
      this.ui.renderChildrenList(children);
      
      // 綁定孩子項目的事件
      document.querySelectorAll('.child-item-edit').forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const childId = e.currentTarget.closest('.child-item').dataset.childId;
          this.showEditChildForm(childId);
        });
      });
      
      document.querySelectorAll('.child-item').forEach(item => {
        item.addEventListener('click', (e) => {
          const childId = e.currentTarget.dataset.childId;
          this.state.selectedChildId = childId;
          this.saveUserPreferences();
          this.changeView('home');
        });
      });
      
      console.log('[App] 已加載孩子列表');
    } catch (error) {
      console.error('[App] 加載孩子列表時出錯:', error);
      this.ui.showError('加載孩子列表失敗', error.message);
    }
  }

  /**
   * 顯示添加孩子表單
   */
  showAddChildForm() {
    // 創建表單模板
    const formTemplate = `
      <h2>添加新孩子</h2>
      <form id="addChildForm">
        <div class="form-group">
          <label for="childName">孩子名字</label>
          <input type="text" id="childName" name="name" required>
        </div>
        <div class="form-group">
          <label for="childBirthDate">出生日期</label>
          <input type="date" id="childBirthDate" name="birthDate" required>
        </div>
        <div class="form-group">
          <label for="childGender">性別</label>
          <select id="childGender" name="gender">
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="other">其他</option>
          </select>
        </div>
        <div class="form-group">
          <label for="childPhoto">照片 (可選)</label>
          <input type="file" id="childPhoto" name="photo" accept="image/*">
          <div id="photoPreview" class="photo-preview"></div>
        </div>
        <div class="form-actions">
          <button type="button" id="cancelAddChild" class="secondary-button">取消</button>
          <button type="submit" class="primary-button">保存</button>
        </div>
      </form>
    `;
    
    // 顯示模態窗口
    this.ui.showModal(formTemplate, 'add-child-modal');
    
    // 綁定表單事件
    const form = document.getElementById('addChildForm');
    form.addEventListener('submit', this.handleAddChildSubmit.bind(this));
    
    // 綁定取消按鈕事件
    document.getElementById('cancelAddChild').addEventListener('click', () => {
      this.ui.closeModal();
    });
    
    // 處理照片預覽
    const photoInput = document.getElementById('childPhoto');
    const photoPreview = document.getElementById('photoPreview');
    
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          photoPreview.innerHTML = `<img src="${e.target.result}" alt="預覽">`;
        };
        reader.readAsDataURL(file);
      } else {
        photoPreview.innerHTML = '';
      }
    });
  }

  /**
   * 處理添加孩子表單提交
   * @param {Event} e - 事件對象
   */
  async handleAddChildSubmit(e) {
    e.preventDefault();
    
    try {
      // 獲取表單數據
      const formData = new FormData(e.target);
      const childData = {
        name: formData.get('name'),
        birthDate: formData.get('birthDate'),
        gender: formData.get('gender'),
        createdAt: new Date().getTime()
      };
      
      // 處理照片
      const photoFile = document.getElementById('childPhoto').files[0];
      if (photoFile) {
        const photoDataUrl = await this.readFileAsDataURL(photoFile);
        childData.photo = photoDataUrl;
      }
      
      // 添加到數據庫
      const childId = await this.db.add('children', childData);
      
      // 關閉模態窗口
      this.ui.closeModal();
      
      // 顯示成功消息
      this.ui.showToast('孩子資料已添加', 'success');
      
      // 選擇新添加的孩子
      this.state.selectedChildId = childId;
      this.saveUserPreferences();
      
      // 重新加載孩子列表
      await this.loadChildrenList();
      
      // 如果在首頁，更新孩子選擇器
      if (this.state.currentView === 'home') {
        await this.loadChildSelector();
        await this.loadTodaySummary(childId);
      }
      
      console.log(`[App] 已添加孩子: ${childId}`);
    } catch (error) {
      console.error('[App] 添加孩子時出錯:', error);
      this.ui.showError('添加孩子失敗', error.message);
    }
  }

  /**
   * 讀取文件為 Data URL
   * @param {File} file - 文件對象
   * @returns {Promise<string>} Data URL
   */
  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('讀取文件失敗'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * 顯示編輯孩子表單
   * @param {string|number} childId - 孩子 ID
   */
  async showEditChildForm(childId) {
    try {
      // 從數據庫獲取孩子資料
      const child = await this.db.get('children', parseInt(childId));
      
      if (!child) {
        throw new Error('找不到孩子資料');
      }
      
      // 創建表單模板
      const formTemplate = `
        <h2>編輯孩子資料</h2>
        <form id="editChildForm" data-child-id="${child.id}">
          <div class="form-group">
            <label for="childName">孩子名字</label>
            <input type="text" id="childName" name="name" value="${child.name}" required>
          </div>
          <div class="form-group">
            <label for="childBirthDate">出生日期</label>
            <input type="date" id="childBirthDate" name="birthDate" value="${child.birthDate}" required>
          </div>
          <div class="form-group">
            <label for="childGender">性別</label>
            <select id="childGender" name="gender">
              <option value="male" ${child.gender === 'male' ? 'selected' : ''}>男</option>
              <option value="female" ${child.gender === 'female' ? 'selected' : ''}>女</option>
              <option value="other" ${child.gender === 'other' ? 'selected' : ''}>其他</option>
            </select>
          </div>
          <div class="form-group">
            <label for="childPhoto">照片 (可選)</label>
            <input type="file" id="childPhoto" name="photo" accept="image/*">
            <div id="photoPreview" class="photo-preview">
              ${child.photo ? `<img src="${child.photo}" alt="${child.name}">` : ''}
            </div>
          </div>
          <div class="form-actions">
            <button type="button" id="deleteChild" class="danger-button">刪除</button>
            <button type="button" id="cancelEditChild" class="secondary-button">取消</button>
            <button type="submit" class="primary-button">保存</button>
          </div>
        </form>
      `;
      
      // 顯示模態窗口
      this.ui.showModal(formTemplate, 'edit-child-modal');
      
      // 綁定表單事件
      const form = document.getElementById('editChildForm');
      form.addEventListener('submit', this.handleEditChildSubmit.bind(this));
      
      // 綁定取消按鈕事件
      document.getElementById('cancelEditChild').addEventListener('click', () => {
        this.ui.closeModal();
      });
      
      // 綁定刪除按鈕事件
      document.getElementById('deleteChild').addEventListener('click', () => {
        this.confirmDeleteChild(child.id, child.name);
      });
      
      // 處理照片預覽
      const photoInput = document.getElementById('childPhoto');
      const photoPreview = document.getElementById('photoPreview');
      
      photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            photoPreview.innerHTML = `<img src="${e.target.result}" alt="預覽">`;
          };
          reader.readAsDataURL(file);
        }
      });
      
      console.log(`[App] 已顯示編輯孩子表單: ${childId}`);
    } catch (error) {
      console.error(`[App] 顯示編輯孩子表單時出錯 (${childId}):`, error);
      this.ui.showError('顯示編輯表單失敗', error.message);
    }
  }

  /**
   * 處理編輯孩子表單提交
   * @param {Event} e - 事件對象
   */
  async handleEditChildSubmit(e) {
    e.preventDefault();
    
    try {
      const form = e.target;
      const childId = parseInt(form.dataset.childId);
      
      // 獲取現有孩子數據
      const existingChild = await this.db.get('children', childId);
      
      if (!existingChild) {
        throw new Error('找不到孩子資料');
      }
      
      // 獲取表單數據
      const formData = new FormData(form);
      
      // 更新孩子數據
      const updatedChild = {
        ...existingChild,
        name: formData.get('name'),
        birthDate: formData.get('birthDate'),
        gender: formData.get('gender'),
        updatedAt: new Date().getTime()
      };
      
      // 處理照片
      const photoFile = document.getElementById('childPhoto').files[0];
      if (photoFile) {
        const photoDataUrl = await this.readFileAsDataURL(photoFile);
        updatedChild.photo = photoDataUrl;
      }
      
      // 更新數據庫
      await this.db.update('children', updatedChild);
      
      // 關閉模態窗口
      this.ui.closeModal();
      
      // 顯示成功消息
      this.ui.showToast('孩子資料已更新', 'success');
      
      // 重新加載孩子列表
      await this.loadChildrenList();
      
      // 如果在首頁且選定的孩子是當前編輯的孩子，更新孩子選擇器
      if (this.state.currentView === 'home' && this.state.selectedChildId === childId.toString()) {
        await this.loadChildSelector();
      }
      
      console.log(`[App] 已更新孩子資料: ${childId}`);
    } catch (error) {
      console.error('[App] 更新孩子資料時出錯:', error);
      this.ui.showError('更新孩子資料失敗', error.message);
    }
  }

  /**
   * 確認刪除孩子
   * @param {string|number} childId - 孩子 ID
   * @param {string} childName - 孩子名字
   */
  confirmDeleteChild(childId, childName) {
    const confirmContent = `
      <h2>確認刪除</h2>
      <p>您確定要刪除 ${childName} 的所有資料嗎？此操作無法撤銷。</p>
      <div class="form-actions">
        <button id="cancelDelete" class="secondary-button">取消</button>
        <button id="confirmDelete" class="danger-button">確認刪除</button>
      </div>
    `;
    
    // 顯示確認對話框
    this.ui.showModal(confirmContent, 'confirm-delete-modal');
    
    // 綁定取消按鈕事件
    document.getElementById('cancelDelete').addEventListener('click', () => {
      this.ui.closeModal();
      this.showEditChildForm(childId);
    });
    
    // 綁定確認按鈕事件
    document.getElementById('confirmDelete').addEventListener('click', () => {
      this.deleteChild(childId);
    });
  }

  /**
   * 刪除孩子及相關記錄
   * @param {string|number} childId - 孩子 ID
   */
  async deleteChild(childId) {
    try {
      // 刪除孩子記錄
      await this.db.delete('children', parseInt(childId));
      
      // 刪除相關的所有記錄
      const storeNames = [
        'feeding', 'sleep', 'diaper', 'health', 
        'moodBehavior', 'milestones', 'interactionLog'
      ];
      
      // 獲取並刪除每個存儲中與該孩子相關的記錄
      for (const storeName of storeNames) {
        const records = await this.db.getChildRecords(storeName, parseInt(childId));
        
        for (const record of records) {
          await this.db.delete(storeName, record.id);
        }
      }
      
      // 關閉模態窗口
      this.ui.closeModal();
      
      // 顯示成功消息
      this.ui.showToast('孩子資料已刪除', 'success');
      
      // 如果刪除的是當前選定的孩子，清除選定狀態
      if (this.state.selectedChildId === childId.toString()) {
        this.state.selectedChildId = null;
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.SELECTED_CHILD);
      }
      
      // 重新加載孩子列表
      await this.loadChildrenList();
      
      // 如果在首頁，更新孩子選擇器
      if (this.state.currentView === 'home') {
        await this.loadChildSelector();
        
        // 清空今日摘要
        if (!this.state.selectedChildId) {
          this.ui.renderTodaySummary(null);
        }
      }
      
      console.log(`[App] 已刪除孩子及相關記錄: ${childId}`);
    } catch (error) {
      console.error(`[App] 刪除孩子時出錯 (${childId}):`, error);
      this.ui.showError('刪除孩子失敗', error.message);
    }
  }

  /**
   * 處理視圖變更事件
   * @param {Event} e - 事件對象
   */
  handleViewChange(e) {
    const viewName = e.currentTarget.dataset.view;
    if (viewName) {
      this.changeView(viewName);
    }
  }

  /**
   * 處理日期變更事件
   * @param {Event} e - 事件對象
   */
  handleDateChange(e) {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      this.state.selectedDate = date;
      this.loadDateSpecificData();
    }
  }

  /**
   * 導航日期（前進/後退）
   * @param {number} days - 天數變化（正值為前進，負值為後退）
   */
  navigateDate(days) {
    const newDate = new Date(this.state.selectedDate);
    newDate.setDate(newDate.getDate() + days);
    this.state.selectedDate = newDate;
    
    // 更新 UI 顯示
    this.ui.updateSelectedDate(newDate);
    
    // 加載特定日期的數據
    this.loadDateSpecificData();
  }

  /**
   * 加載特定日期的數據
   */
  async loadDateSpecificData() {
    try {
      // 根據當前視圖加載相應數據
      switch (this.state.currentView) {
        case 'daily':
          await this.loadDailyRecords();
          break;
        case 'health':
          await this.loadHealthRecords();
          break;
        default:
          // 不需要特殊處理的視圖，不做操作
          break;
      }
    } catch (error) {
      console.error('[App] 加載特定日期數據時出錯:', error);
      this.ui.showError('加載數據失敗', error.message);
    }
  }

  /**
   * 加載每日記錄
   */
  async loadDailyRecords() {
    try {
      if (!this.state.selectedChildId) {
        this.ui.renderActivityTimeline(null);
        return;
      }
      
      // 獲取選定日期的開始和結束時間戳
      const selectedDate = this.state.selectedDate;
      const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
      
      // 獲取餵食記錄
      const feedingRecords = await this.db.getChildRecordsByTimeRange('feeding', this.state.selectedChildId, startOfDay, endOfDay);
      
      // 獲取睡眠記錄
      const sleepRecords = await this.db.getChildRecordsByTimeRange('sleep', this.state.selectedChildId, startOfDay, endOfDay);
      
      // 獲取尿布記錄
      const diaperRecords = await this.db.getChildRecordsByTimeRange('diaper', this.state.selectedChildId, startOfDay, endOfDay);
      
      // 更新 UI
      this.ui.renderActivityTimeline({
        feeding: feedingRecords,
        sleep: sleepRecords,
        diaper: diaperRecords
      });
      
      console.log(`[App] 已加載每日記錄: ${this.state.selectedChildId}, ${selectedDate.toDateString()}`);
    } catch (error) {
      console.error('[App] 加載每日記錄時出錯:', error);
      this.ui.showError('加載每日記錄失敗', error.message);
    }
  }

  /**
   * 處理快速操作事件
   * @param {Event} e - 事件對象
   */
  handleQuickAction(e) {
    const action = e.currentTarget.dataset.action;
    
    // 隱藏快速添加菜單（如果打開）
    this.ui.toggleQuickAddMenu(false);
    
    // 檢查是否選擇了孩子
    if (!this.state.selectedChildId && action !== 'reflection') {
      this.ui.showToast('請先選擇一個孩子', 'warning');
      return;
    }
    
    // 根據操作類型顯示相應的表單
    switch (action) {
      case 'feeding':
        this.showFeedingForm();
        break;
      case 'sleep':
        this.showSleepForm();
        break;
      case 'diaper':
        this.showDiaperForm();
        break;
      case 'health':
        this.showHealthForm();
        break;
      case 'milestone':
        this.showMilestoneForm();
        break;
      case 'note':
        this.showNoteForm();
        break;
      case 'reflection':
        this.focusReflection();
        break;
      default:
        console.warn(`[App] 未知的快速操作: ${action}`);
        break;
    }
  }

  /**
   * 處理表單提交事件
   * @param {Event} e - 事件對象
   */
  async handleFormSubmit(e) {
    e.preventDefault();
    
    try {
      const form = e.target;
      const formId = form.id;
      
      // 根據表單 ID 處理不同類型的表單
      switch (formId) {
        case 'feedingForm':
          await this.handleFeedingFormSubmit(form);
          break;
        case 'sleepForm':
          await this.handleSleepFormSubmit(form);
          break;
        case 'diaperForm':
          await this.handleDiaperFormSubmit(form);
          break;
        case 'healthForm':
          await this.handleHealthFormSubmit(form);
          break;
        case 'milestoneForm':
          await this.handleMilestoneFormSubmit(form);
          break;
        case 'noteForm':
          await this.handleNoteFormSubmit(form);
          break;
        default:
          console.warn(`[App] 未知的表單 ID: ${formId}`);
          break;
      }
    } catch (error) {
      console.error('[App] 處理表單提交時出錯:', error);
      this.ui.showError('保存記錄失敗', error.message);
    }
  }

  /**
   * 處理主題切換事件
   */
  handleThemeToggle() {
    // 切換主題模式
    this.state.themeMode = this.state.themeMode === 'light' ? 'dark' : 'light';
    
    // 更新 UI
    document.body.setAttribute('data-theme', this.state.themeMode);
    
    // 更新主題切換按鈕圖標
    const themeToggleIcon = document.querySelector('#themeToggle i');
    if (themeToggleIcon) {
      themeToggleIcon.className = this.state.themeMode === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    // 保存用戶偏好設置
    this.saveUserPreferences();
    
    console.log(`[App] 已切換主題模式: ${this.state.themeMode}`);
  }

  /**
   * 備份數據
   */
  async backupData() {
    try {
      // 關閉側邊選單
      this.ui.toggleMenu(false);
      
      // 顯示加載中提示
      this.ui.showToast('正在準備備份數據...', 'info');
      
      // 導出數據
      const exportData = await this.db.exportDatabase();
      
      // 創建 JSON 字符串
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // 創建下載檔案
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // 生成檔案名稱，包含日期
      const date = new Date();
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const fileName = `babylog-backup-${dateStr}.json`;
      
      // 創建下載連結
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      // 顯示成功消息
      this.ui.showToast('數據備份完成', 'success');
      
      console.log('[App] 已備份數據');
    } catch (error) {
      console.error('[App] 備份數據時出錯:', error);
      this.ui.showError('備份數據失敗', error.message);
    }
  }

  /**
   * 恢復數據
   */
  async restoreData() {
    // 關閉側邊選單
    this.ui.toggleMenu(false);
    
    // 創建表單模板
    const formTemplate = `
      <h2>恢復數據</h2>
      <p>選擇之前備份的 JSON 文件來恢復數據。所有現有數據將被替換。</p>
      <div class="form-group">
        <label for="backupFile">備份文件</label>
        <input type="file" id="backupFile" accept=".json" required>
      </div>
      <div class="form-actions">
        <button type="button" id="cancelRestore" class="secondary-button">取消</button>
        <button type="button" id="confirmRestore" class="primary-button">恢復數據</button>
      </div>
    `;
    
    // 顯示對話框
    this.ui.showModal(formTemplate, 'restore-data-modal');
    
    // 綁定取消按鈕事件
    document.getElementById('cancelRestore').addEventListener('click', () => {
      this.ui.closeModal();
    });
    
    // 綁定確認按鈕事件
    document.getElementById('confirmRestore').addEventListener('click', async () => {
      const fileInput = document.getElementById('backupFile');
      const file = fileInput.files[0];
      
      if (!file) {
        this.ui.showToast('請選擇備份文件', 'warning');
        return;
      }
      
      try {
        // 讀取文件
        const fileContent = await this.readFileAsText(file);
        
        // 解析 JSON
        const importData = JSON.parse(fileContent);
        
        // 確認數據格式是否正確
        if (!importData || typeof importData !== 'object') {
          throw new Error('備份文件格式不正確');
        }
        
        // 顯示加載中提示
        this.ui.showToast('正在恢復數據...', 'info');
        
        // 導入數據
        await this.db.importDatabase(importData);
        
        // 關閉模態窗口
        this.ui.closeModal();
        
        // 顯示成功消息
        this.ui.showToast('數據恢復完成，應用將重新載入', 'success');
        
        // 重載應用程式
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
        console.log('[App] 已恢復數據');
      } catch (error) {
        console.error('[App] 恢復數據時出錯:', error);
        this.ui.showError('恢復數據失敗', error.message);
      }
    });
  }

  /**
   * 讀取文件為文本
   * @param {File} file - 文件對象
   * @returns {Promise<string>} 文件內容
   */
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('讀取文件失敗'));
      reader.readAsText(file);
    });
  }
}

// 初始化並啟動應用程式
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App();
  await app.init();
});

// 導出應用程式類
export default App;