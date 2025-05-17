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

    // 健康記錄按鈕
    document.getElementById('addHealthRecordButton')?.addEventListener('click', () => {
      this.showHealthForm();
    });

    // 里程碑按鈕
    document.getElementById('addMilestoneButton')?.addEventListener('click', () => {
      this.showMilestoneForm();
    });

    // 反思日記按鈕
    document.getElementById('addReflectionButton')?.addEventListener('click', () => {
      this.showReflectionForm();
    });

    // 保存反思按鈕
    document.getElementById('saveReflectionNote')?.addEventListener('click', () => {
      this.saveReflectionNote();
    });

    // 事件委託：處理某些動態生成的元素的事件
    document.addEventListener('addHealthRecord', () => {
      this.showHealthForm();
    });

    document.addEventListener('addMilestone', () => {
      this.showMilestoneForm();
    });

    document.addEventListener('editHealthRecord', (e) => {
      const { id, type } = e.detail;
      // 實現編輯健康記錄的方法
      console.log(`[App] 編輯健康記錄: ${id}, 類型: ${type}`);
      this.ui.showToast('編輯功能尚未實現', 'info');
    });

    document.addEventListener('deleteHealthRecord', (e) => {
      const { id, type } = e.detail;
      // 實現刪除健康記錄的方法
      console.log(`[App] 刪除健康記錄: ${id}, 類型: ${type}`);
      this.ui.showToast('刪除功能尚未實現', 'info');
    });

    document.addEventListener('editMilestone', (e) => {
      const { id } = e.detail;
      console.log(`[App] 編輯里程碑: ${id}`);
      this.ui.showToast('編輯功能尚未實現', 'info');
    });

    document.addEventListener('deleteMilestone', (e) => {
      const { id } = e.detail;
      console.log(`[App] 刪除里程碑: ${id}`);
      this.ui.showToast('刪除功能尚未實現', 'info');
    });

    document.addEventListener('recordMilestone', (e) => {
      const { category, milestoneId } = e.detail;
      console.log(`[App] 記錄里程碑達成: ${category}_${milestoneId}`);
      this.ui.showToast('記錄功能尚未實現', 'info');
    });

    document.addEventListener('viewFullReflection', (e) => {
      const { id } = e.detail;
      console.log(`[App] 查看完整反思: ${id}`);
      this.ui.showToast('查看功能尚未實現', 'info');
    });

    document.addEventListener('editReflection', (e) => {
      const { id } = e.detail;
      console.log(`[App] 編輯反思: ${id}`);
      this.ui.showToast('編輯功能尚未實現', 'info');
    });

    document.addEventListener('deleteReflection', (e) => {
      const { id } = e.detail;
      console.log(`[App] 刪除反思: ${id}`);
      this.ui.showToast('刪除功能尚未實現', 'info');
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

/**
   * 加載健康記錄
   * @param {string|number} [childId] - 可選的孩子 ID，未提供則使用當前選定的孩子
   */
  async loadHealthRecords(childId) {
    try {
      // 使用提供的孩子 ID 或當前選定的孩子 ID
      const targetChildId = childId || this.state.selectedChildId;
      
      if (!targetChildId) {
        this.ui.renderHealthRecords(null);
        return;
      }
      
      // 獲取選定日期的開始和結束時間戳
      const selectedDate = this.state.selectedDate;
      const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
      
      // 獲取健康記錄
      const healthRecords = await this.db.getChildRecordsByTimeRange('health', targetChildId, startOfDay, endOfDay);
      
      // 更新 UI
      this.ui.renderHealthRecords(healthRecords);
      
      // 更新選定的日期顯示
      this.ui.updateSelectedDate(selectedDate, 'selectedHealthDate');
      
      console.log(`[App] 已加載健康記錄: ${targetChildId}, ${selectedDate.toDateString()}`);
    } catch (error) {
      console.error('[App] 加載健康記錄時出錯:', error);
      this.ui.showError('加載健康記錄失敗', error.message);
    }
  }

  /**
   * 處理健康記錄表單提交
   * @param {HTMLFormElement} form - 表單元素
   */
  async handleHealthFormSubmit(form) {
    try {
      // 獲取表單數據
      const formData = new FormData(form);
      
      // 創建健康記錄數據對象
      const healthData = {
        childId: parseInt(this.state.selectedChildId),
        date: formData.get('date') || new Date().toISOString().split('T')[0],
        type: formData.get('recordType'),
        timestamp: new Date().getTime()
      };
      
      // 根據記錄類型添加特定字段
      switch (healthData.type) {
        case 'vaccination':
          healthData.vaccineName = formData.get('vaccineName');
          healthData.doseNumber = formData.get('doseNumber');
          healthData.location = formData.get('location');
          healthData.provider = formData.get('provider');
          healthData.reaction = formData.get('reaction');
          break;
          
        case 'medication':
          healthData.medicationName = formData.get('medicationName');
          healthData.dosage = formData.get('dosage');
          healthData.frequency = formData.get('frequency');
          healthData.reason = formData.get('reason');
          healthData.prescriber = formData.get('prescriber');
          break;
          
        case 'illness':
          healthData.symptom = formData.get('symptom');
          healthData.temperature = formData.get('temperature');
          healthData.started = formData.get('started');
          healthData.ended = formData.get('ended');
          healthData.treatment = formData.get('treatment');
          break;
          
        case 'checkup':
          healthData.provider = formData.get('provider');
          healthData.weight = formData.get('weight');
          healthData.height = formData.get('height');
          healthData.headCircumference = formData.get('headCircumference');
          break;
          
        case 'allergy':
          healthData.allergen = formData.get('allergen');
          healthData.reaction = formData.get('reaction');
          healthData.severity = formData.get('severity');
          break;
      }
      
      // 添加備註（如果有）
      if (formData.get('notes')) {
        healthData.notes = formData.get('notes');
      }
      
      // 添加到數據庫
      await this.db.add('health', healthData);
      
      // 關閉模態窗口
      this.ui.closeModal();
      
      // 顯示成功消息
      this.ui.showToast('健康記錄已添加', 'success');
      
      // 重新加載健康記錄
      await this.loadHealthRecords();
      
      console.log(`[App] 已添加健康記錄: ${healthData.type}`);
    } catch (error) {
      console.error('[App] 添加健康記錄時出錯:', error);
      this.ui.showError('添加健康記錄失敗', error.message);
    }
  }

/**
   * 顯示健康記錄表單
   */
  showHealthForm() {
    const today = new Date().toISOString().split('T')[0];
    const childName = this.getSelectedChildName();
    
    // 創建表單模板
    const formTemplate = `
      <h2>添加健康記錄</h2>
      <p>為 ${childName} 添加健康記錄</p>
      <form id="healthForm">
        <div class="form-group">
          <label for="recordType">記錄類型</label>
          <select id="recordType" name="recordType" required>
            <option value="">-- 選擇類型 --</option>
            <option value="vaccination">疫苗接種</option>
            <option value="medication">用藥記錄</option>
            <option value="illness">疾病記錄</option>
            <option value="checkup">體檢記錄</option>
            <option value="allergy">過敏記錄</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="date">日期</label>
          <input type="date" id="date" name="date" value="${today}" required>
        </div>
        
        <!-- 動態表單字段容器 -->
        <div id="dynamicFields"></div>
        
        <div class="form-group">
          <label for="notes">備註</label>
          <textarea id="notes" name="notes"></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" id="cancelHealthForm" class="secondary-button">取消</button>
          <button type="submit" class="primary-button">保存</button>
        </div>
      </form>
    `;
    
    // 顯示模態窗口
    this.ui.showModal(formTemplate, 'health-form-modal');
    
    // 綁定記錄類型變更事件
    const recordTypeSelect = document.getElementById('recordType');
    recordTypeSelect.addEventListener('change', () => {
      this.updateHealthFormFields(recordTypeSelect.value);
    });
    
    // 綁定表單事件
    const form = document.getElementById('healthForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleHealthFormSubmit(form);
    });
    
    // 綁定取消按鈕事件
    document.getElementById('cancelHealthForm').addEventListener('click', () => {
      this.ui.closeModal();
    });
  }

  /**
   * 根據記錄類型更新健康表單字段
   * @param {string} recordType - 記錄類型
   */
  updateHealthFormFields(recordType) {
    const dynamicFields = document.getElementById('dynamicFields');
    
    // 清空容器
    dynamicFields.innerHTML = '';
    
    if (!recordType) return;
    
    // 根據記錄類型添加不同的字段
    switch (recordType) {
      case 'vaccination':
        dynamicFields.innerHTML = `
          <div class="form-group">
            <label for="vaccineName">疫苗名稱</label>
            <select id="vaccineName" name="vaccineName" required>
              <option value="">-- 選擇疫苗 --</option>
              <option value="bcg">BCG (卡介苗)</option>
              <option value="hepb">B型肝炎疫苗</option>
              <option value="dtap">DTaP (白喉、破傷風、百日咳)</option>
              <option value="ipv">IPV (小兒麻痺)</option>
              <option value="hib">Hib (b型嗜血桿菌)</option>
              <option value="pcv">PCV (肺炎鏈球菌)</option>
              <option value="rv">RV (輪狀病毒)</option>
              <option value="mmr">MMR (麻疹、腮腺炎、德國麻疹)</option>
              <option value="var">VAR (水痘)</option>
              <option value="hepa">A型肝炎疫苗</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div class="form-group">
            <label for="doseNumber">劑次</label>
            <input type="number" id="doseNumber" name="doseNumber" min="1" value="1" required>
          </div>
          <div class="form-group">
            <label for="location">接種地點</label>
            <input type="text" id="location" name="location">
          </div>
          <div class="form-group">
            <label for="provider">醫護人員</label>
            <input type="text" id="provider" name="provider">
          </div>
          <div class="form-group">
            <label for="reaction">反應</label>
            <textarea id="reaction" name="reaction"></textarea>
          </div>
        `;
        break;
        
      case 'medication':
        dynamicFields.innerHTML = `
          <div class="form-group">
            <label for="medicationName">藥物名稱</label>
            <input type="text" id="medicationName" name="medicationName" required>
          </div>
          <div class="form-group">
            <label for="dosage">劑量</label>
            <input type="text" id="dosage" name="dosage" required>
          </div>
          <div class="form-group">
            <label for="frequency">頻率</label>
            <input type="text" id="frequency" name="frequency" placeholder="例如：每8小時一次">
          </div>
          <div class="form-group">
            <label for="reason">原因</label>
            <input type="text" id="reason" name="reason">
          </div>
          <div class="form-group">
            <label for="prescriber">處方醫生</label>
            <input type="text" id="prescriber" name="prescriber">
          </div>
        `;
        break;
        
      case 'illness':
        dynamicFields.innerHTML = `
          <div class="form-group">
            <label for="symptom">症狀</label>
            <input type="text" id="symptom" name="symptom" required>
          </div>
          <div class="form-group">
            <label for="temperature">體溫</label>
            <input type="text" id="temperature" name="temperature" placeholder="例如：38.5°C">
          </div>
          <div class="form-group">
            <label for="started">開始時間</label>
            <input type="datetime-local" id="started" name="started">
          </div>
          <div class="form-group">
            <label for="ended">結束時間</label>
            <input type="datetime-local" id="ended" name="ended">
          </div>
          <div class="form-group">
            <label for="treatment">治療</label>
            <textarea id="treatment" name="treatment"></textarea>
          </div>
        `;
        break;
        
      case 'checkup':
        dynamicFields.innerHTML = `
          <div class="form-group">
            <label for="provider">醫生/醫院</label>
            <input type="text" id="provider" name="provider" required>
          </div>
          <div class="form-group">
            <label for="weight">體重</label>
            <input type="text" id="weight" name="weight" placeholder="例如：5.2 kg">
          </div>
          <div class="form-group">
            <label for="height">身高</label>
            <input type="text" id="height" name="height" placeholder="例如：62 cm">
          </div>
          <div class="form-group">
            <label for="headCircumference">頭圍</label>
            <input type="text" id="headCircumference" name="headCircumference" placeholder="例如：40.5 cm">
          </div>
        `;
        break;
        
      case 'allergy':
        dynamicFields.innerHTML = `
          <div class="form-group">
            <label for="allergen">過敏原</label>
            <input type="text" id="allergen" name="allergen" required>
          </div>
          <div class="form-group">
            <label for="reaction">反應</label>
            <input type="text" id="reaction" name="reaction" required>
          </div>
          <div class="form-group">
            <label for="severity">嚴重程度</label>
            <select id="severity" name="severity">
              <option value="">-- 選擇嚴重程度 --</option>
              <option value="mild">輕微</option>
              <option value="moderate">中等</option>
              <option value="severe">嚴重</option>
            </select>
          </div>
        `;
        break;
    }
  }

  /**
   * 獲取選定孩子的名字
   * @returns {string} 孩子名字或"未選擇孩子"
   * @private
   */
  getSelectedChildName() {
    try {
      if (!this.state.selectedChildId) {
        return "未選擇孩子";
      }
      
      // 嘗試從 DOM 中獲取
      const selectedChild = document.querySelector(`.child-select-item.selected .child-info h3`);
      if (selectedChild) {
        return selectedChild.textContent;
      }
      
      // 如果 DOM 中找不到，返回一個默認值
      return "寶寶";
    } catch (error) {
      console.warn('[App] 獲取選定孩子名字時出錯:', error);
      return "寶寶";
    }
  }

/**
   * 加載里程碑數據
   * @param {string|number} [childId] - 可選的孩子 ID，未提供則使用當前選定的孩子
   */
  async loadMilestones(childId) {
    try {
      // 使用提供的孩子 ID 或當前選定的孩子 ID
      const targetChildId = childId || this.state.selectedChildId;
      
      if (!targetChildId) {
        this.ui.renderMilestones(null);
        return;
      }
      
      // 獲取里程碑記錄
      const milestones = await this.db.getChildRecords('milestones', targetChildId);
      
      // 獲取選定的孩子資料，以確定年齡
      const child = await this.db.get('children', parseInt(targetChildId));
      
      // 更新 UI
      this.ui.renderMilestones(milestones, child);
      
      // 生成推薦的待達成里程碑
      this.generateUpcomingMilestones(child);
      
      console.log(`[App] 已加載里程碑數據: ${targetChildId}`);
    } catch (error) {
      console.error('[App] 加載里程碑數據時出錯:', error);
      this.ui.showError('加載里程碑數據失敗', error.message);
    }
  }

  /**
   * 生成推薦的待達成里程碑
   * @param {Object} child - 孩子資料
   */
  async generateUpcomingMilestones(child) {
    try {
      if (!child || !child.birthDate) return;
      
      // 計算孩子年齡（月份）
      const birthDate = new Date(child.birthDate);
      const now = new Date();
      let ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12;
      ageInMonths += now.getMonth() - birthDate.getMonth();
      
      // 獲取已達成的里程碑
      const achievedMilestones = await this.db.getChildRecords('milestones', child.id);
      const achievedIds = achievedMilestones.map(m => `${m.category}_${m.milestoneId}`);
      
      // 從配置中獲取所有里程碑
      const { MILESTONE_CATEGORIES } = await import('./config.js');
      
      // 查找適合當前年齡的待達成里程碑
      const upcomingMilestones = [];
      
      MILESTONE_CATEGORIES.forEach(category => {
        category.milestones.forEach(milestone => {
          // 解析典型年齡範圍
          const ageRange = milestone.typical_age;
          let maxAge = 60; // 默認最大值（5歲）
          
          if (ageRange.includes('-')) {
            const parts = ageRange.split('-');
            const endPart = parts[1];
            
            if (endPart.includes('月')) {
              maxAge = parseInt(endPart);
            } else if (endPart.includes('歲')) {
              maxAge = parseInt(endPart) * 12;
            }
          }
          
          // 檢查是否是即將到達的里程碑（當前年齡的 ±3 個月內，且尚未達成）
          const inAgeRange = Math.abs(ageInMonths - maxAge) <= 3;
          const notAchieved = !achievedIds.includes(`${category.id}_${milestone.id}`);
          
          if (inAgeRange && notAchieved) {
            upcomingMilestones.push({
              category: category.id,
              categoryName: category.name,
              milestoneId: milestone.id,
              milestoneName: milestone.name,
              typicalAge: milestone.typical_age
            });
          }
        });
      });
      
      // 更新 UI
      this.ui.renderUpcomingMilestones(upcomingMilestones);
    } catch (error) {
      console.error('[App] 生成待達成里程碑時出錯:', error);
    }
  }

  /**
   * 顯示里程碑表單
   */
  showMilestoneForm() {
    const today = new Date().toISOString().split('T')[0];
    const childName = this.getSelectedChildName();
    
    // 從配置中獲取里程碑類別
    import('./config.js').then(({ MILESTONE_CATEGORIES }) => {
      // 創建里程碑類別選項
      let categoryOptions = '<option value="">-- 選擇類別 --</option>';
      MILESTONE_CATEGORIES.forEach(category => {
        categoryOptions += `<option value="${category.id}">${category.name}</option>`;
      });
      
      // 創建表單模板
      const formTemplate = `
        <h2>添加里程碑</h2>
        <p>記錄 ${childName} 的成長里程碑</p>
        <form id="milestoneForm">
          <div class="form-group">
            <label for="milestoneCategory">里程碑類別</label>
            <select id="milestoneCategory" name="category" required>
              ${categoryOptions}
            </select>
          </div>
          
          <div class="form-group">
            <label for="milestone">里程碑</label>
            <select id="milestone" name="milestoneId" required disabled>
              <option value="">-- 請先選擇類別 --</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="achievedDate">達成日期</label>
            <input type="date" id="achievedDate" name="date" value="${today}" required>
          </div>
          
          <div class="form-group">
            <label for="milestoneNotes">備註</label>
            <textarea id="milestoneNotes" name="notes" placeholder="記錄當時的情況或感受..."></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" id="cancelMilestoneForm" class="secondary-button">取消</button>
            <button type="submit" class="primary-button">保存</button>
          </div>
        </form>
      `;
      
      // 顯示模態窗口
      this.ui.showModal(formTemplate, 'milestone-form-modal');
      
      // 綁定類別變更事件
      const categorySelect = document.getElementById('milestoneCategory');
      categorySelect.addEventListener('change', () => {
        this.updateMilestoneOptions(categorySelect.value, MILESTONE_CATEGORIES);
      });
      
      // 綁定表單事件
      const form = document.getElementById('milestoneForm');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleMilestoneFormSubmit(form);
      });
      
      // 綁定取消按鈕事件
      document.getElementById('cancelMilestoneForm').addEventListener('click', () => {
        this.ui.closeModal();
      });
    }).catch(error => {
      console.error('[App] 加載里程碑配置時出錯:', error);
      this.ui.showError('加載里程碑配置失敗', error.message);
    });
  }

  /**
   * 更新里程碑選項
   * @param {string} categoryId - 類別 ID
   * @param {Array} categories - 里程碑類別數組
   */
  updateMilestoneOptions(categoryId, categories) {
    const milestoneSelect = document.getElementById('milestone');
    
    // 重置選項
    milestoneSelect.innerHTML = '<option value="">-- 選擇里程碑 --</option>';
    
    if (!categoryId) {
      milestoneSelect.disabled = true;
      return;
    }
    
    // 查找選定的類別
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) {
      milestoneSelect.disabled = true;
      return;
    }
    
    // 添加里程碑選項
    category.milestones.forEach(milestone => {
      milestoneSelect.innerHTML += `<option value="${milestone.id}">${milestone.name} (${milestone.typical_age})</option>`;
    });
    
    // 啟用選擇框
    milestoneSelect.disabled = false;
  }

  /**
   * 處理里程碑表單提交
   * @param {HTMLFormElement} form - 表單元素
   */
  async handleMilestoneFormSubmit(form) {
    try {
      // 獲取表單數據
      const formData = new FormData(form);
      
      // 創建里程碑數據對象
      const milestoneData = {
        childId: parseInt(this.state.selectedChildId),
        category: formData.get('category'),
        milestoneId: formData.get('milestoneId'),
        date: formData.get('date'),
        notes: formData.get('notes'),
        timestamp: new Date().getTime()
      };
      
      // 添加到數據庫
      await this.db.add('milestones', milestoneData);
      
      // 關閉模態窗口
      this.ui.closeModal();
      
      // 顯示成功消息
      this.ui.showToast('里程碑已記錄', 'success');
      
      // 重新加載里程碑
      await this.loadMilestones();
      
      console.log(`[App] 已添加里程碑: ${milestoneData.category}_${milestoneData.milestoneId}`);
    } catch (error) {
      console.error('[App] 添加里程碑時出錯:', error);
      this.ui.showError('添加里程碑失敗', error.message);
    }
  }

/**
   * 加載數據分析報告
   * @param {string|number} [childId] - 可選的孩子 ID，未提供則使用當前選定的孩子
   */
  async loadReports(childId) {
    try {
      // 使用提供的孩子 ID 或當前選定的孩子 ID
      const targetChildId = childId || this.state.selectedChildId;
      
      if (!targetChildId) {
        this.ui.clearChart();
        this.ui.renderReportSummary(null);
        return;
      }
      
      // 獲取報告視圖類型
      const viewType = document.querySelector('.view-control.active')?.dataset.view || 'month';
      
      // 獲取報告類型
      const reportType = document.querySelector('.report-type.active')?.dataset.report || 'sleeping';
      
      // 獲取選定日期範圍的數據
      const data = await this.getReportData(targetChildId, reportType, viewType);
      
      // 更新圖表
      this.ui.renderChart(data, reportType, viewType);
      
      // 更新報告摘要
      this.ui.renderReportSummary(data, reportType, viewType);
      
      // 更新選定的日期/月份/週顯示
      this.updateReportDateDisplay(viewType);
      
      console.log(`[App] 已加載報告: ${targetChildId}, ${reportType}, ${viewType}`);
    } catch (error) {
      console.error('[App] 加載報告時出錯:', error);
      this.ui.showError('加載報告失敗', error.message);
    }
  }

  /**
   * 獲取報告數據
   * @param {string|number} childId - 孩子 ID
   * @param {string} reportType - 報告類型
   * @param {string} viewType - 視圖類型
   * @returns {Promise<Object>} 報告數據
   */
  async getReportData(childId, reportType, viewType) {
    // 確定日期範圍
    const { startTime, endTime } = this.getReportDateRange(viewType);
    
    // 根據報告類型獲取對應的數據
    let data;
    
    switch (reportType) {
      case 'sleeping':
        data = await this.db.getChildRecordsByTimeRange('sleep', childId, startTime, endTime);
        break;
        
      case 'feeding':
        data = await this.db.getChildRecordsByTimeRange('feeding', childId, startTime, endTime);
        break;
        
      case 'diaper':
        data = await this.db.getChildRecordsByTimeRange('diaper', childId, startTime, endTime);
        break;
        
      case 'growth':
        // 獲取體檢記錄中的生長資料
        const healthRecords = await this.db.getChildRecords('health', childId);
        data = healthRecords.filter(record => record.type === 'checkup' && (record.weight || record.height));
        break;
    }
    
    return {
      type: reportType,
      viewType: viewType,
      startTime: startTime,
      endTime: endTime,
      data: data || []
    };
  }

  /**
   * 獲取報告日期範圍
   * @param {string} viewType - 視圖類型: 'day', 'week', 'month'
   * @returns {Object} 開始和結束時間戳
   */
  getReportDateRange(viewType) {
    const selectedDate = this.state.selectedDate;
    let startTime, endTime;
    
    switch (viewType) {
      case 'day':
        // 選定日期的整天
        startTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();
        endTime = startTime + 24 * 60 * 60 * 1000 - 1;
        break;
        
      case 'week':
        // 選定日期所在的週
        const dayOfWeek = selectedDate.getDay(); // 0-6, 0 是星期日
        const firstDayOfWeek = new Date(selectedDate);
        firstDayOfWeek.setDate(selectedDate.getDate() - dayOfWeek);
        
        startTime = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate()).getTime();
        endTime = startTime + 7 * 24 * 60 * 60 * 1000 - 1;
        break;
        
      case 'month':
        // 選定日期所在的月
        startTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getTime();
        endTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
        break;
    }
    
    return { startTime, endTime };
  }

  /**
   * 更新報告日期顯示
   * @param {string} viewType - 視圖類型
   */
  updateReportDateDisplay(viewType) {
    const selectedDate = this.state.selectedDate;
    const dateDisplay = document.getElementById('selectedReportDate');
    
    if (!dateDisplay) return;
    
    let formattedDate;
    
    switch (viewType) {
      case 'day':
        formattedDate = selectedDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
        break;
        
      case 'week':
        const dayOfWeek = selectedDate.getDay(); // 0-6, 0 是星期日
        const firstDayOfWeek = new Date(selectedDate);
        firstDayOfWeek.setDate(selectedDate.getDate() - dayOfWeek);
        
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        
        const firstDayFormatted = firstDayOfWeek.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
        const lastDayFormatted = lastDayOfWeek.toLocaleDateString('zh-TW', { year: 'numeric', month: 'numeric', day: 'numeric' });
        
        formattedDate = `${firstDayFormatted} - ${lastDayFormatted}`;
        break;
        
      case 'month':
        formattedDate = selectedDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });
        break;
    }
    
    dateDisplay.textContent = formattedDate;
  }

  /**
   * 變更時間視圖
   * @param {string} viewType - 視圖類型
   */
  changeTimeView(viewType) {
    // 更新視圖控制按鈕的活動狀態
    document.querySelectorAll('.view-control').forEach(control => {
      control.classList.toggle('active', control.dataset.view === viewType);
    });
    
    // 根據當前視圖加載相應數據
    switch (this.state.currentView) {
      case 'reports':
        this.loadReports();
        break;
      // 可以擴展以支持其他視圖的時間範圍變更
    }
  }

/**
   * 加載反思日記數據
   */
  async loadReflectionData() {
    try {
      // 獲取所有反思記錄
      const reflections = await this.db.getAll('parentReflection');
      
      // 按日期降序排序（最新的在前）
      reflections.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // 更新 UI
      this.ui.renderReflectionList(reflections);
      
      console.log(`[App] 已加載反思日記數據: ${reflections.length} 條記錄`);
    } catch (error) {
      console.error('[App] 加載反思日記數據時出錯:', error);
      this.ui.showError('加載反思日記數據失敗', error.message);
    }
  }

  /**
   * 保存反思日記
   */
  async saveReflectionNote() {
    try {
      const titleInput = document.getElementById('reflectionTitle');
      const textInput = document.getElementById('reflectionText');
      
      const title = titleInput?.value.trim();
      const text = textInput?.value.trim();
      
      if (!text) {
        this.ui.showToast('日記內容不能為空', 'warning');
        return;
      }
      
      // 創建反思數據對象
      const reflectionData = {
        title: title || `日記 - ${new Date().toLocaleDateString('zh-TW')}`,
        text: text,
        date: new Date().toISOString().split('T')[0], // 格式: YYYY-MM-DD
        timestamp: new Date().getTime()
      };
      
      // 保存到數據庫
      await this.db.add('parentReflection', reflectionData);
      
      // 清空輸入框
      if (titleInput) titleInput.value = '';
      if (textInput) textInput.value = '';
      
      // 顯示成功消息
      this.ui.showToast('日記已保存', 'success');
      
      // 重新加載日記列表
      await this.loadReflectionData();
      
      console.log('[App] 已保存反思日記');
    } catch (error) {
      console.error('[App] 保存反思日記時出錯:', error);
      this.ui.showError('保存反思日記失敗', error.message);
    }
  }

  /**
   * 顯示添加反思表單
   */
  showReflectionForm() {
    const today = new Date().toLocaleDateString('zh-TW');
    
    // 創建表單模板
    const formTemplate = `
      <h2>新增日記</h2>
      <form id="newReflectionForm">
        <div class="form-group">
          <label for="newReflectionTitle">標題</label>
          <input type="text" id="newReflectionTitle" name="title" placeholder="為今天的記錄取個標題">
        </div>
        
        <div class="form-group">
          <label for="newReflectionDate">日期</label>
          <input type="date" id="newReflectionDate" name="date" value="${new Date().toISOString().split('T')[0]}" required>
        </div>
        
        <div class="form-group">
          <label for="newReflectionText">內容</label>
          <textarea id="newReflectionText" name="text" placeholder="分享您今天的感受和想法..." required></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" id="cancelReflectionForm" class="secondary-button">取消</button>
          <button type="submit" class="primary-button">保存</button>
        </div>
      </form>
    `;
    
    // 顯示模態窗口
    this.ui.showModal(formTemplate, 'reflection-form-modal');
    
    // 綁定表單事件
    const form = document.getElementById('newReflectionForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleReflectionFormSubmit(form);
    });
    
    // 綁定取消按鈕事件
    document.getElementById('cancelReflectionForm').addEventListener('click', () => {
      this.ui.closeModal();
    });
  }

  /**
   * 處理反思表單提交
   * @param {HTMLFormElement} form - 表單元素
   */
  async handleReflectionFormSubmit(form) {
    try {
      // 獲取表單數據
      const formData = new FormData(form);
      
      // 創建反思數據對象
      const reflectionData = {
        title: formData.get('title') || `日記 - ${new Date(formData.get('date')).toLocaleDateString('zh-TW')}`,
        text: formData.get('text'),
        date: formData.get('date'),
        timestamp: new Date().getTime()
      };
      
      // 添加到數據庫
      await this.db.add('parentReflection', reflectionData);
      
      // 關閉模態窗口
      this.ui.closeModal();
      
      // 顯示成功消息
      this.ui.showToast('日記已保存', 'success');
      
      // 重新加載日記列表
      await this.loadReflectionData();
      
      console.log('[App] 已添加反思日記');
    } catch (error) {
      console.error('[App] 添加反思日記時出錯:', error);
      this.ui.showError('添加反思日記失敗', error.message);
    }
  }

/**
   * 加載設置
   */
  loadSettings() {
    try {
      // 載入主題設置
      const themeSelector = document.getElementById('themeSelector');
      if (themeSelector) {
        themeSelector.value = this.state.themeMode || 'light';
        
        // 綁定主題選擇器變更事件
        themeSelector.addEventListener('change', () => {
          this.state.themeMode = themeSelector.value;
          document.body.setAttribute('data-theme', this.state.themeMode);
          this.saveUserPreferences();
        });
      }
      
      // 載入通知設置
      const notificationToggle = document.getElementById('notificationToggle');
      if (notificationToggle) {
        const notificationsEnabled = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.NOTIFICATIONS) === 'true';
        notificationToggle.checked = notificationsEnabled;
        
        // 綁定通知切換事件
        notificationToggle.addEventListener('change', () => {
          localStorage.setItem(APP_CONFIG.STORAGE_KEYS.NOTIFICATIONS, notificationToggle.checked);
        });
      }
      
      // 綁定數據管理按鈕
      const exportDataButton = document.getElementById('exportDataButton');
      if (exportDataButton) {
        exportDataButton.addEventListener('click', () => {
          this.backupData();
        });
      }
      
      const importDataButton = document.getElementById('importDataButton');
      if (importDataButton) {
        importDataButton.addEventListener('click', () => {
          this.restoreData();
        });
      }
      
      const clearDataButton = document.getElementById('clearDataButton');
      if (clearDataButton) {
        clearDataButton.addEventListener('click', () => {
          this.confirmClearData();
        });
      }
      
      // 綁定隱私政策和使用條款連結
      const privacyPolicyLink = document.getElementById('privacyPolicyLink');
      if (privacyPolicyLink) {
        privacyPolicyLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.showPrivacyPolicy();
        });
      }
      
      const termsOfServiceLink = document.getElementById('termsOfServiceLink');
      if (termsOfServiceLink) {
        termsOfServiceLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.showTermsOfService();
        });
      }
      
      console.log('[App] 已加載設置');
    } catch (error) {
      console.error('[App] 加載設置時出錯:', error);
      this.ui.showError('加載設置失敗', error.message);
    }
  }

  /**
   * 確認清除所有數據
   */
  confirmClearData() {
    this.ui.showConfirm(
      '確認清除所有數據',
      '您確定要清除所有應用數據嗎？此操作無法撤銷，所有記錄將被永久刪除。',
      () => this.clearAllData(),
      null
    );
  }

  /**
   * 清除所有數據
   */
  async clearAllData() {
    try {
      // 顯示加載中提示
      this.ui.showToast('正在清除數據...', 'info');
      
      // 清除所有 Object Store
      for (const storeName of Object.keys(this.db.objectStores)) {
        await this.db.clear(storeName);
      }
      
      // 清除本地存儲中的用戶偏好設置
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.SELECTED_CHILD);
      
      // 重置應用狀態
      this.state.selectedChildId = null;
      
      // 顯示成功消息
      this.ui.showToast('所有數據已清除', 'success');
      
      // 重載應用程式
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      console.log('[App] 已清除所有數據');
    } catch (error) {
      console.error('[App] 清除數據時出錯:', error);
      this.ui.showError('清除數據失敗', error.message);
    }
  }

  /**
   * 顯示隱私政策
   */
  showPrivacyPolicy() {
    const content = `
      <h2>隱私政策</h2>
      <div class="policy-content">
        <p><strong>最後更新: 2025年5月1日</strong></p>
        
        <h3>數據儲存</h3>
        <p>寶貝日誌是一個純前端應用程式，所有數據都使用 IndexedDB 技術儲存在您的設備上。我們不會收集、傳輸或儲存您的任何個人數據到外部伺服器。</p>
        
        <h3>數據使用</h3>
        <p>您在應用程式中輸入的所有數據僅用於提供應用程式的功能，並且完全保留在您的設備上。應用程式不會訪問您設備上的其他數據。</p>
        
        <h3>數據備份</h3>
        <p>您可以使用應用程式的備份功能將數據導出為 JSON 文件。這些文件由您自己管理，我們建議您將其妥善保存在安全的位置。</p>
        
        <h3>第三方服務</h3>
        <p>本應用程式不使用任何第三方分析、追蹤或廣告服務。</p>
        
        <h3>聯繫我們</h3>
        <p>如果您對隱私政策有任何疑問，請通過 support@babylog.example.com 與我們聯繫。</p>
      </div>
      <div class="form-actions">
        <button id="closePrivacyPolicy" class="primary-button">關閉</button>
      </div>
    `;
    
    this.ui.showModal(content, 'policy-modal');
    
    document.getElementById('closePrivacyPolicy').addEventListener('click', () => {
      this.ui.closeModal();
    });
  }

  /**
   * 顯示使用條款
   */
  showTermsOfService() {
    const content = `
      <h2>使用條款</h2>
      <div class="policy-content">
        <p><strong>最後更新: 2025年5月1日</strong></p>
        
        <h3>許可授權</h3>
        <p>本應用程式根據 MIT 授權條款提供，您可以自由地使用、修改和分發本應用程式，但須遵守授權條款中的限制。</p>
        
        <h3>免責聲明</h3>
        <p>本應用程式僅用於追蹤和記錄嬰幼兒的照顧活動，不應被視為醫療建議或診斷工具。如有健康相關問題，請咨詢專業醫療人員。</p>
        
        <h3>責任限制</h3>
        <p>在任何情況下，應用程式開發者對因使用或無法使用本應用程式而導致的任何損失或損害不承擔責任，包括但不限於數據丟失。</p>
        
        <h3>數據備份</h3>
        <p>您負責定期備份您的數據。應用程式開發者不對數據丟失負責。</p>
        
        <h3>變更</h3>
        <p>我們保留隨時修改這些條款的權利。修改後的條款將在應用程式更新時生效。</p>
      </div>
      <div class="form-actions">
        <button id="closeTermsOfService" class="primary-button">關閉</button>
      </div>
    `;
    
    this.ui.showModal(content, 'terms-modal');
    
    document.getElementById('closeTermsOfService').addEventListener('click', () => {
      this.ui.closeModal();
    });
  }

/**
   * 過濾活動按類別
   * @param {string} category - 類別名稱
   */
  filterActivitiesByCategory(category) {
    // 更新分類標籤的活動狀態
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.category === category) {
        tab.classList.add('active');
      }
    });
    
    // 確定要過濾的容器
    let container;
    if (this.state.currentView === 'daily') {
      container = document.getElementById('activityTimeline');
    } else if (this.state.currentView === 'health') {
      container = document.getElementById('healthRecordsContainer');
    } else if (this.state.currentView === 'milestones') {
      container = document.getElementById('milestonesContainer');
    }
    
    if (!container) return;
    
    // 過濾項目
    if (category === 'all') {
      // 顯示所有項目
      container.querySelectorAll('.timeline-item, .health-record-item, .milestone-item').forEach(item => {
        item.style.display = '';
      });
    } else {
      // 顯示匹配類別的項目，隱藏其他項目
      container.querySelectorAll('.timeline-item, .health-record-item, .milestone-item').forEach(item => {
        if (item.dataset.activityType === category || 
            item.dataset.category === category || 
            (category === 'other' && !['feeding', 'sleep', 'diaper'].includes(item.dataset.activityType))) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    }
    
    console.log(`[App] 已過濾活動: ${category}`);
  }

  /**
   * 聚焦到反思輸入框
   */
  focusReflection() {
    const reflectionInput = document.getElementById('reflectionInput');
    if (reflectionInput) {
      reflectionInput.focus();
      // 滾動到反思區域
      reflectionInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // 如果反思輸入框不存在，切換到首頁
      this.changeView('home');
      // 稍後再聚焦
      setTimeout(() => {
        const input = document.getElementById('reflectionInput');
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }

  /**
   * 顯示餵食表單
   */
  showFeedingForm() {
    // TODO: 實現餵食表單
    this.ui.showToast('餵食記錄功能開發中', 'info');
    console.log('[App] 顯示餵食表單');
  }

  /**
   * 顯示睡眠表單
   */
  showSleepForm() {
    // TODO: 實現睡眠表單
    this.ui.showToast('睡眠記錄功能開發中', 'info');
    console.log('[App] 顯示睡眠表單');
  }

  /**
   * 顯示尿布表單
   */
  showDiaperForm() {
    // TODO: 實現尿布表單
    this.ui.showToast('尿布記錄功能開發中', 'info');
    console.log('[App] 顯示尿布表單');
  }

  /**
   * 顯示筆記表單
   */
  showNoteForm() {
    // TODO: 實現筆記表單
    this.ui.showToast('筆記功能開發中', 'info');
    console.log('[App] 顯示筆記表單');
  }

  /**
   * 處理餵食表單提交
   * @param {HTMLFormElement} form - 表單元素
   */
  async handleFeedingFormSubmit(form) {
    // TODO: 實現餵食表單提交
    console.log('[App] 處理餵食表單提交');
  }

  /**
   * 處理睡眠表單提交
   * @param {HTMLFormElement} form - 表單元素
   */
  async handleSleepFormSubmit(form) {
    // TODO: 實現睡眠表單提交
    console.log('[App] 處理睡眠表單提交');
  }

  /**
   * 處理尿布表單提交
   * @param {HTMLFormElement} form - 表單元素
   */
  async handleDiaperFormSubmit(form) {
    // TODO: 實現尿布表單提交
    console.log('[App] 處理尿布表單提交');
  }

  /**
   * 處理筆記表單提交
   * @param {HTMLFormElement} form - 表單元素
   */
  async handleNoteFormSubmit(form) {
    // TODO: 實現筆記表單提交
    console.log('[App] 處理筆記表單提交');
  }
}

// 初始化並啟動應用程式
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App();
  await app.init();
});

// 導出應用程式類
export default App;