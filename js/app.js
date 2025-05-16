/**
 * app.js - 應用程式的主要邏輯
 * 
 * 此檔案是應用程式的入口點，負責初始化資料庫、UI，
 * 並協調各模組間的通信。它處理用戶事件，調用資料庫操作，
 * 並更新 UI。
 * 
 * @author BabyGrow Team
 * @version 1.0.0
 */

'use strict';

import BabyDB from './db.js';
import * as UI from './ui.js';
import { DB_NAME, DB_VERSION, REFLECTION_PROMPTS } from './config.js';

/**
 * App 類 - 應用程式的主要協調器
 */
class App {
  /**
   * 建構子 - 初始化應用程式
   */
  constructor() {
    // 資料庫實例
    this.db = new BabyDB(DB_NAME, DB_VERSION);
    
    // 應用程式狀態
    this.state = {
      initialized: false,
      currentPage: 'dashboard',
      activeChildId: null,
      activeChildData: null,
      darkMode: false,
      lastSyncDate: null
    };
    
    // 事件監聽器的綁定
    this._bindEvents();
  }

  /**
   * 初始化應用程式
   */
  async init() {
    try {
      UI.showLoading('正在初始化應用程式...');
      
      // 初始化資料庫
      await this.db.initDatabase();
      
      // 載入應用程式設定
      await this._loadSettings();
      
      // 套用主題設定
      this._applyTheme();
      
      // 載入兒童檔案列表
      await this._loadChildrenList();
      
      // 如果沒有選擇活躍子女且有兒童檔案，則自動選擇第一個
      await this._ensureActiveChild();
      
      // 標記應用程式已初始化
      this.state.initialized = true;
      
      // 如果首次使用應用程式（沒有任何兒童檔案），顯示歡迎頁面
      // 否則顯示儀表板
      if (this.state.childrenList && this.state.childrenList.length === 0) {
        this.navigateTo('welcome');
      } else {
        // 載入活躍子女的儀表板數據
        await this._loadDashboardData();
        this.navigateTo('dashboard');
      }
      
      // 隱藏載入畫面，顯示應用程式
      UI.hideLoading();
      UI.showApp();
      
      console.log('應用程式初始化完成');
    } catch (error) {
      console.error('初始化應用程式失敗:', error);
      UI.hideLoading();
      UI.showErrorMessage('初始化應用程式失敗', error.message);
    }
  }

  /**
   * 導航到指定頁面
   * @param {string} pageName - 頁面名稱
   */
  navigateTo(pageName) {
    try {
      // 更新當前頁面狀態
      this.state.currentPage = pageName;
      
      // 更新 UI
      UI.showPage(pageName);
      UI.updateMenuActiveItem(pageName);
      UI.updatePageTitle(pageName, this.state.activeChildData);
      
      // 關閉側邊選單（如果在行動裝置上）
      UI.closeSideMenu();
      
      console.log(`已導航到 "${pageName}" 頁面`);
    } catch (error) {
      console.error(`導航到 "${pageName}" 頁面失敗:`, error);
      UI.showErrorMessage('頁面載入失敗', '無法載入請求的頁面，請重試。');
    }
  }

  /**
   * 切換深色/淺色模式
   */
  toggleTheme() {
    try {
      // 切換狀態
      this.state.darkMode = !this.state.darkMode;
      
      // 更新 UI
      this._applyTheme();
      
      // 儲存設定到資料庫
      this._saveSettings();
      
      console.log(`已切換到${this.state.darkMode ? '深色' : '淺色'}模式`);
    } catch (error) {
      console.error('切換主題失敗:', error);
      UI.showErrorMessage('無法切換主題', '請重試。');
    }
  }

  /**
   * 切換到指定子女的資料
   * @param {string|number} childId - 子女 ID
   */
  async switchActiveChild(childId) {
    try {
      if (this.state.activeChildId === childId) {
        return; // 已經是活躍子女，無需切換
      }
      
      // 更新狀態
      this.state.activeChildId = childId;
      
      // 從資料庫獲取子女詳細數據
      const childData = await this.db.get('children', parseInt(childId));
      this.state.activeChildData = childData;
      
      // 更新 UI
      UI.updateActiveChildDisplay(childData);
      UI.updatePageTitle(this.state.currentPage, childData);
      
      // 如果當前在儀表板頁面，重新載入儀表板數據
      if (this.state.currentPage === 'dashboard') {
        await this._loadDashboardData();
      }
      
      // 儲存設定到資料庫
      this._saveSettings();
      
      console.log(`已切換到子女: ${childData.name}`);
    } catch (error) {
      console.error('切換活躍子女失敗:', error);
      UI.showErrorMessage('無法切換子女檔案', '請重試。');
    }
  }

  /**
   * 顯示新增子女表單
   */
  showAddChildForm() {
    UI.showAddChildModal(this._handleAddChild.bind(this));
  }

  /**
   * 顯示新增餵食記錄表單
   */
  showAddFeedingForm() {
    if (!this._checkActiveChild()) return;
    
    UI.showAddFeedingModal(this.state.activeChildData, this._handleAddFeeding.bind(this));
  }

  /**
   * 顯示親子互動日記表單
   */
  showAddInteractionForm() {
    if (!this._checkActiveChild()) return;
    
    UI.showAddInteractionModal(this.state.activeChildData, this._handleAddInteraction.bind(this));
  }

  /**
   * 顯示親子反思表單
   */
  showAddReflectionForm() {
    if (!this._checkActiveChild()) return;
    
    const randomPrompt = this._getRandomReflectionPrompt();
    UI.showAddReflectionModal(this.state.activeChildData, randomPrompt, this._handleAddReflection.bind(this));
  }

  /**
   * 顯示數據匯出確認對話框
   */
  showExportDataConfirm() {
    UI.showConfirmModal(
      '匯出數據',
      '您即將匯出所有應用程式數據。這會包含您所有子女的所有記錄。要繼續嗎？',
      this._handleExportData.bind(this)
    );
  }

  /**
   * 顯示數據清除確認對話框
   */
  showClearDataConfirm() {
    UI.showConfirmModal(
      '清除所有數據',
      '警告：此操作將永久刪除所有應用程式數據，包括所有子女檔案和記錄。此操作無法復原！',
      this._handleClearData.bind(this),
      '清除所有數據',
      'danger'
    );
  }

  /**
   * 生成數據分析圖表
   */
  async generateAnalysis() {
    try {
      if (!this._checkActiveChild()) return;
      
      const analysisType = document.getElementById('analysis-type').value;
      const period = document.getElementById('analysis-period').value;
      
      // 根據時間週期計算日期範圍
      const endDate = new Date();
      let startDate = new Date();
      
      switch (period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      
      // 顯示載入中提示
      UI.showLoading('正在生成分析...');
      
      // 獲取數據
      let data;
      let insights;
      
      switch (analysisType) {
        case 'feeding':
          data = await this._getFeedingAnalysisData(startDate, endDate);
          insights = this._generateFeedingInsights(data);
          break;
        case 'sleep':
          data = await this._getSleepAnalysisData(startDate, endDate);
          insights = this._generateSleepInsights(data);
          break;
        case 'health':
          data = await this._getHealthAnalysisData(startDate, endDate);
          insights = this._generateHealthInsights(data);
          break;
        case 'mood':
          data = await this._getMoodAnalysisData(startDate, endDate);
          insights = this._generateMoodInsights(data);
          break;
        case 'development':
          data = await this._getDevelopmentAnalysisData(startDate, endDate);
          insights = this._generateDevelopmentInsights(data);
          break;
      }
      
      // 更新 UI
      UI.renderAnalysisChart(analysisType, period, data);
      UI.renderAnalysisInsights(insights);
      
      UI.hideLoading();
      console.log(`已生成 ${analysisType} 分析`);
    } catch (error) {
      console.error('生成分析失敗:', error);
      UI.hideLoading();
      UI.showErrorMessage('無法生成分析', '請稍後重試。');
    }
  }

  /**
   * 綁定事件監聽器
   * @private
   */
  _bindEvents() {
    // 側邊選單事件
    document.getElementById('menu-toggle').addEventListener('click', () => UI.toggleSideMenu());
    document.getElementById('close-menu').addEventListener('click', () => UI.closeSideMenu());
    
    // 主題切換
    document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
    
    // 選單項目導航
    document.querySelectorAll('.menu-items li').forEach(item => {
      item.addEventListener('click', () => {
        const pageName = item.getAttribute('data-page');
        this.navigateTo(pageName);
      });
    });
    
    // 快速操作按鈕
    document.querySelectorAll('.action-button').forEach(button => {
      button.addEventListener('click', () => {
        const action = button.getAttribute('data-action');
        this._handleQuickAction(action);
      });
    });
    
    // 歡迎頁面「開始使用」按鈕
    document.getElementById('get-started-button').addEventListener('click', () => {
      this.showAddChildForm();
    });
    
    // 添加新寶貝按鈕
    document.getElementById('add-child-button').addEventListener('click', () => {
      this.showAddChildForm();
    });
    
    // 餵食記錄頁面添加按鈕
    document.getElementById('add-feeding-record').addEventListener('click', () => {
      this.showAddFeedingForm();
    });
    
    // 親子互動日記添加按鈕
    document.getElementById('add-interaction-record').addEventListener('click', () => {
      this.showAddInteractionForm();
    });
    
    // 親子反思添加按鈕
    document.getElementById('add-reflection').addEventListener('click', () => {
      this.showAddReflectionForm();
    });
    
    // 數據管理頁面按鈕
    document.getElementById('export-data-button').addEventListener('click', () => {
      this.showExportDataConfirm();
    });
    
    document.getElementById('import-data-file').addEventListener('change', (event) => {
      const fileInput = event.target;
      const importButton = document.getElementById('import-data-button');
      
      if (fileInput.files.length > 0) {
        importButton.disabled = false;
      } else {
        importButton.disabled = true;
      }
    });
    
    document.getElementById('import-data-button').addEventListener('click', () => {
      this._handleImportData();
    });
    
    document.getElementById('clear-data-button').addEventListener('click', () => {
      this.showClearDataConfirm();
    });
    
    // 分析頁面生成按鈕
    document.getElementById('generate-analysis').addEventListener('click', () => {
      this.generateAnalysis();
    });
  }

  /**
   * 確保有活躍子女選擇
   * @private
   */
  async _ensureActiveChild() {
    try {
      // 從設定中載入上次選擇的活躍子女
      if (!this.state.activeChildId && this.state.childrenList && this.state.childrenList.length > 0) {
        // 如果沒有設定活躍子女但有子女檔案，選擇第一個
        await this.switchActiveChild(this.state.childrenList[0].id);
      } else if (this.state.activeChildId) {
        // 如果有設定活躍子女，載入其詳細數據
        const childData = await this.db.get('children', parseInt(this.state.activeChildId));
        if (childData) {
          this.state.activeChildData = childData;
          UI.updateActiveChildDisplay(childData);
        } else {
          // 找不到活躍子女（可能已被刪除），重設狀態
          this.state.activeChildId = null;
          this.state.activeChildData = null;
          
          // 嘗試選擇第一個子女
          if (this.state.childrenList && this.state.childrenList.length > 0) {
            await this.switchActiveChild(this.state.childrenList[0].id);
          }
        }
      }
    } catch (error) {
      console.error('確保活躍子女失敗:', error);
    }
  }

  /**
   * 檢查是否有活躍子女
   * @returns {boolean} 是否有活躍子女
   * @private
   */
  _checkActiveChild() {
    if (!this.state.activeChildId) {
      UI.showErrorMessage('未選擇寶貝', '請先添加或選擇一個寶貝。');
      return false;
    }
    return true;
  }

  /**
   * 載入應用程式設定
   * @private
   */
  async _loadSettings() {
    try {
      // 從 IndexedDB 載入應用程式設定
      const settings = await this.db.get('settings', 'appSettings');
      
      if (settings) {
        // 套用載入的設定
        this.state.darkMode = settings.darkMode || false;
        this.state.activeChildId = settings.activeChildId || null;
        this.state.lastSyncDate = settings.lastSyncDate || null;
      } else {
        // 如果沒有設定，創建預設設定
        const defaultSettings = {
          id: 'appSettings',
          darkMode: false,
          activeChildId: null,
          lastSyncDate: null
        };
        
        await this.db.add('settings', defaultSettings);
      }
    } catch (error) {
      console.error('載入設定失敗:', error);
      // 繼續使用預設設定
    }
  }

  /**
   * 儲存應用程式設定
   * @private
   */
  async _saveSettings() {
    try {
      const settings = {
        id: 'appSettings',
        darkMode: this.state.darkMode,
        activeChildId: this.state.activeChildId,
        lastSyncDate: this.state.lastSyncDate
      };
      
      await this.db.update('settings', settings);
    } catch (error) {
      console.error('儲存設定失敗:', error);
      UI.showErrorMessage('無法儲存設定', '您的偏好設定可能無法在下次使用時保留。');
    }
  }

  /**
   * 套用主題設定
   * @private
   */
  _applyTheme() {
    if (this.state.darkMode) {
      document.body.classList.add('dark-mode');
      document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      document.body.classList.remove('dark-mode');
      document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
    }
  }

  /**
   * 載入兒童檔案列表
   * @private
   */
  async _loadChildrenList() {
    try {
      // 從資料庫獲取所有子女
      const children = await this.db.getAll('children');
      
      // 更新狀態
      this.state.childrenList = children;
      
      // 更新 UI
      UI.renderChildrenList(children, this.state.activeChildId, (childId) => {
        this.switchActiveChild(childId);
      });
      
      return children;
    } catch (error) {
      console.error('載入子女列表失敗:', error);
      UI.showErrorMessage('無法載入寶貝列表', '請重新整理頁面。');
      return [];
    }
  }

  /**
   * 載入儀表板數據
   * @private
   */
  async _loadDashboardData() {
    try {
      if (!this._checkActiveChild()) return;
      
      // 計算今天的日期範圍
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      
      // 計算最近七天的日期範圍
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 6);
      
      // 獲取今日數據
      const todayFeedings = await this.db.getChildRecordsByDateRange(
        'feeding', 'childTimestampIndex', this.state.activeChildId, todayStart.getTime(), todayEnd.getTime()
      );
      
      const todaySleep = await this.db.getChildRecordsByDateRange(
        'sleep', 'childStartTimeIndex', this.state.activeChildId, todayStart.getTime(), todayEnd.getTime()
      );
      
      const todayDiapers = await this.db.getChildRecordsByDateRange(
        'diaper', 'childTimestampIndex', this.state.activeChildId, todayStart.getTime(), todayEnd.getTime()
      );
      
      const todayMood = await this.db.getChildRecordsByDateRange(
        'moodBehavior', 'childTimestampIndex', this.state.activeChildId, todayStart.getTime(), todayEnd.getTime()
      );
      
      // 獲取最近活動
      const recentActivities = await this._getRecentActivities();
      
      // 獲取本週數據用於圖表
      const weeklyData = await this._getWeeklyChartData(weekStart, todayEnd);
      
      // 獲取親子反思
      const reflections = await this.db.getChildRecordsByDateRange(
        'interactionLog', 'childDateIndex', this.state.activeChildId, weekStart.getTime(), todayEnd.getTime()
      );
      
      // 過濾出帶有反思的互動記錄
      const filteredReflections = reflections.filter(r => r.parentReflection && r.parentReflection.trim() !== '');
      
      // 更新 UI
      UI.renderTodaySummary({
        feedings: todayFeedings,
        sleep: todaySleep,
        diapers: todayDiapers,
        mood: todayMood
      });
      
      UI.renderRecentActivities(recentActivities);
      UI.renderWeeklyChart(weeklyData);
      UI.renderParentReflections(filteredReflections);
      
      // 隨機更新反思問題
      document.getElementById('reflection-question').textContent = this._getRandomReflectionPrompt();
    } catch (error) {
      console.error('載入儀表板數據失敗:', error);
      UI.showErrorMessage('載入數據失敗', '無法載入儀表板數據，請重試。');
    }
  }

  /**
   * 獲取最近活動
   * @returns {Promise<Array>} 最近活動數組
   * @private
   */
  async _getRecentActivities() {
    try {
      if (!this.state.activeChildId) return [];
      
      const childId = this.state.activeChildId;
      const now = Date.now();
      const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);
      
      // 獲取各類型的最近記錄
      const feedings = await this.db.getChildRecordsByDateRange(
        'feeding', 'childTimestampIndex', childId, threeDaysAgo, now
      );
      
      const sleep = await this.db.getChildRecordsByDateRange(
        'sleep', 'childStartTimeIndex', childId, threeDaysAgo, now
      );
      
      const diapers = await this.db.getChildRecordsByDateRange(
        'diaper', 'childTimestampIndex', childId, threeDaysAgo, now
      );
      
      const health = await this.db.getChildRecordsByDateRange(
        'health', 'childDateIndex', childId, threeDaysAgo, now
      );
      
      const milestones = await this.db.getChildRecordsByDateRange(
        'milestone', 'childDateIndex', childId, threeDaysAgo, now
      );
      
      const moods = await this.db.getChildRecordsByDateRange(
        'moodBehavior', 'childTimestampIndex', childId, threeDaysAgo, now
      );
      
      const interactions = await this.db.getChildRecordsByDateRange(
        'interactionLog', 'childDateIndex', childId, threeDaysAgo, now
      );
      
      // 合併所有記錄並添加類型標記
      const activities = [
        ...feedings.map(item => ({ ...item, type: 'feeding' })),
        ...sleep.map(item => ({ ...item, type: 'sleep' })),
        ...diapers.map(item => ({ ...item, type: 'diaper' })),
        ...health.map(item => ({ ...item, type: 'health' })),
        ...milestones.map(item => ({ ...item, type: 'milestone' })),
        ...moods.map(item => ({ ...item, type: 'mood' })),
        ...interactions.map(item => ({ ...item, type: 'interaction' }))
      ];
      
      // 按時間戳排序（最新的在前）
      activities.sort((a, b) => {
        const timeA = a.timestamp || a.startTime || a.date;
        const timeB = b.timestamp || b.startTime || b.date;
        return timeB - timeA;
      });
      
      // 只返回最近的 10 項活動
      return activities.slice(0, 10);
    } catch (error) {
      console.error('獲取最近活動失敗:', error);
      return [];
    }
  }

  /**
   * 獲取每週圖表數據
   * @param {Date} startDate - 開始日期
   * @param {Date} endDate - 結束日期
   * @returns {Promise<Object>} 圖表數據
   * @private
   */
  async _getWeeklyChartData(startDate, endDate) {
    try {
      const childId = this.state.activeChildId;
      
      // 準備日期標籤
      const dateLabels = [];
      const feedingCounts = [];
      const sleepHours = [];
      const diaperCounts = [];
      
      // 為每一天準備數據
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + 1);
        
        // 格式化日期標籤
        const dateLabel = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
        dateLabels.push(dateLabel);
        
        // 獲取當天的餵食次數
        const dayFeedings = await this.db.getChildRecordsByDateRange(
          'feeding', 'childTimestampIndex', childId, currentDate.getTime(), nextDate.getTime() - 1
        );
        feedingCounts.push(dayFeedings.length);
        
        // 獲取當天的睡眠時間
        const daySleepRecords = await this.db.getChildRecordsByDateRange(
          'sleep', 'childStartTimeIndex', childId, currentDate.getTime(), nextDate.getTime() - 1
        );
        
        // 計算睡眠小時數
        let totalSleepMinutes = 0;
        daySleepRecords.forEach(record => {
          if (record.startTime && record.endTime) {
            const sleepDuration = (record.endTime - record.startTime) / (60 * 1000); // 分鐘
            totalSleepMinutes += sleepDuration;
          }
        });
        
        sleepHours.push(Math.round(totalSleepMinutes / 60 * 10) / 10); // 四捨五入到小數點後一位
        
        // 獲取當天的尿布更換次數
        const dayDiapers = await this.db.getChildRecordsByDateRange(
          'diaper', 'childTimestampIndex', childId, currentDate.getTime(), nextDate.getTime() - 1
        );
        diaperCounts.push(dayDiapers.length);
      }
      
      return {
        labels: dateLabels,
        feedingCounts,
        sleepHours,
        diaperCounts
      };
    } catch (error) {
      console.error('獲取每週圖表數據失敗:', error);
      return {
        labels: [],
        feedingCounts: [],
        sleepHours: [],
        diaperCounts: []
      };
    }
  }

  /**
   * 處理添加新子女
   * @param {Object} childData - 子女數據
   * @private
   */
  async _handleAddChild(childData) {
    try {
      // 添加到資料庫
      const childId = await this.db.add('children', childData);
      
      // 重新載入子女列表
      await this._loadChildrenList();
      
      // 切換到新子女
      await this.switchActiveChild(childId);
      
      // 如果正在歡迎頁面，導航到儀表板
      if (this.state.currentPage === 'welcome') {
        this.navigateTo('dashboard');
      }
      
      UI.showSuccessMessage('已添加寶貝', `${childData.name} 的檔案已成功建立！`);
    } catch (error) {
      console.error('添加子女失敗:', error);
      UI.showErrorMessage('無法添加寶貝', '請檢查輸入並重試。');
    }
  }

  /**
   * 處理添加餵食記錄
   * @param {Object} feedingData - 餵食記錄數據
   * @private
   */
  async _handleAddFeeding(feedingData) {
    try {
      // 確保有活躍子女
      if (!this._checkActiveChild()) return;
      
      // 添加子女 ID
      feedingData.childId = this.state.activeChildId;
      
      // 添加到資料庫
      await this.db.add('feeding', feedingData);
      
      // 如果在儀表板頁面，重新載入數據
      if (this.state.currentPage === 'dashboard') {
        await this._loadDashboardData();
      } else if (this.state.currentPage === 'feeding') {
        // TODO: 重新載入餵食記錄頁面
      }
      
      UI.showSuccessMessage('已添加記錄', '餵食記錄已成功儲存！');
    } catch (error) {
      console.error('添加餵食記錄失敗:', error);
      UI.showErrorMessage('無法添加記錄', '請檢查輸入並重試。');
    }
  }

  /**
   * 處理添加親子互動日記
   * @param {Object} interactionData - 互動記錄數據
   * @private
   */
  async _handleAddInteraction(interactionData) {
    try {
      // 確保有活躍子女
      if (!this._checkActiveChild()) return;
      
      // 添加子女 ID
      interactionData.childId = this.state.activeChildId;
      
      // 添加到資料庫
      await this.db.add('interactionLog', interactionData);
      
      // 如果在儀表板頁面，重新載入數據
      if (this.state.currentPage === 'dashboard') {
        await this._loadDashboardData();
      } else if (this.state.currentPage === 'interaction') {
        // TODO: 重新載入互動日記頁面
      }
      
      UI.showSuccessMessage('已添加日記', '親子互動日記已成功儲存！');
    } catch (error) {
      console.error('添加親子互動日記失敗:', error);
      UI.showErrorMessage('無法添加日記', '請檢查輸入並重試。');
    }
  }

  /**
   * 處理添加親子反思
   * @param {Object} reflectionData - 反思數據
   * @private
   */
  async _handleAddReflection(reflectionData) {
    try {
      // 確保有活躍子女
      if (!this._checkActiveChild()) return;
      
      // 添加子女 ID
      reflectionData.childId = this.state.activeChildId;
      
      // 獲取今天的日期（YYYY-MM-DD 格式）
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      reflectionData.date = Date.parse(dateString);
      
      // 添加到資料庫
      await this.db.add('interactionLog', reflectionData);
      
      // 重新載入儀表板數據
      if (this.state.currentPage === 'dashboard') {
        await this._loadDashboardData();
      }
      
      UI.showSuccessMessage('已添加反思', '您的親子時刻反思已成功儲存！');
    } catch (error) {
      console.error('添加親子反思失敗:', error);
      UI.showErrorMessage('無法添加反思', '請檢查輸入並重試。');
    }
  }

  /**
   * 處理匯出數據
   * @private
   */
  async _handleExportData() {
    try {
      UI.showLoading('正在匯出數據...');
      
      // 從資料庫獲取所有數據
      const exportData = await this.db.exportAllData();
      
      // 將數據轉換為 JSON 字符串
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // 創建 Blob
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // 創建下載鏈接
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // 生成文件名（包含日期）
      const date = new Date().toISOString().split('T')[0];
      a.download = `寶貝成長日記_備份_${date}.json`;
      
      // 觸發下載
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // 釋放對象 URL
      URL.revokeObjectURL(url);
      
      UI.hideLoading();
      UI.showSuccessMessage('匯出成功', '所有數據已成功匯出！');
    } catch (error) {
      console.error('匯出數據失敗:', error);
      UI.hideLoading();
      UI.showErrorMessage('無法匯出數據', '請稍後重試。');
    }
  }

  /**
   * 處理匯入數據
   * @private
   */
  async _handleImportData() {
    try {
      const fileInput = document.getElementById('import-data-file');
      
      if (!fileInput.files || fileInput.files.length === 0) {
        UI.showErrorMessage('未選擇檔案', '請選擇有效的備份檔案。');
        return;
      }
      
      const file = fileInput.files[0];
      
      // 確認是否為 JSON 檔案
      if (!file.name.endsWith('.json')) {
        UI.showErrorMessage('檔案類型錯誤', '請選擇有效的 JSON 備份檔案。');
        return;
      }
      
      UI.showLoading('正在匯入數據...');
      
      // 讀取文件
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          // 解析 JSON
          const importData = JSON.parse(event.target.result);
          
          // 驗證數據
          if (!importData || !importData._metadata) {
            UI.hideLoading();
            UI.showErrorMessage('無效的備份檔案', '所選檔案不是有效的應用程式備份。');
            return;
          }
          
          // 確認匯入
          UI.hideLoading();
          UI.showConfirmModal(
            '匯入數據',
            '匯入數據將覆蓋當前的所有應用程式數據。此操作無法復原！要繼續嗎？',
            async () => {
              try {
                UI.showLoading('正在匯入數據...');
                
                // 匯入數據到資料庫
                await this.db.importAllData(importData);
                
                // 重新初始化應用程式
                this.state.initialized = false;
                await this.init();
                
                UI.hideLoading();
                UI.showSuccessMessage('匯入成功', '所有數據已成功匯入！');
                
                // 重置檔案輸入
                fileInput.value = '';
                document.getElementById('import-data-button').disabled = true;
              } catch (error) {
                console.error('匯入數據失敗:', error);
                UI.hideLoading();
                UI.showErrorMessage('匯入失敗', '無法匯入數據，可能是備份檔案格式不相容。');
              }
            }
          );
        } catch (error) {
          console.error('解析備份檔案失敗:', error);
          UI.hideLoading();
          UI.showErrorMessage('無法讀取備份檔案', '所選檔案不是有效的 JSON 格式。');
        }
      };
      
      reader.onerror = () => {
        UI.hideLoading();
        UI.showErrorMessage('讀取檔案失敗', '無法讀取所選檔案。');
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('匯入數據失敗:', error);
      UI.hideLoading();
      UI.showErrorMessage('無法匯入數據', '請檢查檔案並重試。');
    }
  }

  /**
   * 處理清除所有數據
   * @private
   */
  async _handleClearData() {
    try {
      UI.showLoading('正在清除數據...');
      
      // 刪除整個資料庫
      await this.db.deleteDatabase();
      
      // 重新載入頁面以重新初始化應用程式
      window.location.reload();
    } catch (error) {
      console.error('清除數據失敗:', error);
      UI.hideLoading();
      UI.showErrorMessage('無法清除數據', '請重新整理頁面並重試。');
    }
  }

  /**
   * 處理快速操作
   * @param {string} action - 操作類型
   * @private
   */
  _handleQuickAction(action) {
    switch (action) {
      case 'feeding':
        this.showAddFeedingForm();
        break;
      case 'sleep':
        // TODO: 實作睡眠記錄表單
        UI.showInfoMessage('功能開發中', '睡眠記錄功能即將推出！');
        break;
      case 'diaper':
        // TODO: 實作尿布記錄表單
        UI.showInfoMessage('功能開發中', '尿布記錄功能即將推出！');
        break;
      case 'mood':
        // TODO: 實作情緒記錄表單
        UI.showInfoMessage('功能開發中', '情緒記錄功能即將推出！');
        break;
      case 'milestone':
        // TODO: 實作里程碑記錄表單
        UI.showInfoMessage('功能開發中', '里程碑記錄功能即將推出！');
        break;
      case 'interaction':
        this.showAddInteractionForm();
        break;
      default:
        console.warn(`未知的快速操作: ${action}`);
    }
  }

  /**
   * 獲取隨機反思提示
   * @returns {string} 反思提示
   * @private
   */
  _getRandomReflectionPrompt() {
    const index = Math.floor(Math.random() * REFLECTION_PROMPTS.length);
    return REFLECTION_PROMPTS[index];
  }

  // 以下是分析相關的方法，實際實現會根據數據結構有所不同
  // 這裡提供基礎框架，實際功能應進一步完善

  /**
   * 獲取餵食分析數據
   * @param {Date} startDate - 開始日期
   * @param {Date} endDate - 結束日期
   * @returns {Promise<Object>} 餵食分析數據
   * @private
   */
  async _getFeedingAnalysisData(startDate, endDate) {
    try {
      // 獲取指定日期範圍內的餵食記錄
      const feedings = await this.db.getChildRecordsByDateRange(
        'feeding', 'childTimestampIndex', this.state.activeChildId, startDate.getTime(), endDate.getTime()
      );
      
      // TODO: 進一步處理數據以產生分析，例如按時間分組、計算平均值等
      
      return {
        feedings,
        startDate,
        endDate,
        // 可添加更多處理後的數據
      };
    } catch (error) {
      console.error('獲取餵食分析數據失敗:', error);
      throw error;
    }
  }

  /**
   * 生成餵食分析洞見
   * @param {Object} data - 餵食分析數據
   * @returns {Array<Object>} 洞見數組
   * @private
   */
  _generateFeedingInsights(data) {
    // TODO: 根據數據生成有意義的洞見
    const insights = [
      {
        title: '餵食頻率',
        content: `在所選期間內，您平均每天餵食 ${(data.feedings.length / ((data.endDate - data.startDate) / (24 * 60 * 60 * 1000))).toFixed(1)} 次。`
      },
      {
        title: '餵食時間模式',
        content: '大多數餵食發生在早晨和晚上。考慮調整餵食時間以更好地配合寶寶的生理節律。'
      }
    ];
    
    return insights;
  }

  /**
   * 獲取睡眠分析數據
   * @param {Date} startDate - 開始日期
   * @param {Date} endDate - 結束日期
   * @returns {Promise<Object>} 睡眠分析數據
   * @private
   */
  async _getSleepAnalysisData(startDate, endDate) {
    // TODO: 實現睡眠分析數據獲取
    return { startDate, endDate };
  }

  /**
   * 生成睡眠分析洞見
   * @param {Object} data - 睡眠分析數據
   * @returns {Array<Object>} 洞見數組
   * @private
   */
  _generateSleepInsights(data) {
    // TODO: 實現睡眠分析洞見生成
    return [
      {
        title: '睡眠模式',
        content: '數據分析進行中...'
      }
    ];
  }

  /**
   * 獲取健康分析數據
   * @param {Date} startDate - 開始日期
   * @param {Date} endDate - 結束日期
   * @returns {Promise<Object>} 健康分析數據
   * @private
   */
  async _getHealthAnalysisData(startDate, endDate) {
    // TODO: 實現健康分析數據獲取
    return { startDate, endDate };
  }

  /**
   * 生成健康分析洞見
   * @param {Object} data - 健康分析數據
   * @returns {Array<Object>} 洞見數組
   * @private
   */
  _generateHealthInsights(data) {
    // TODO: 實現健康分析洞見生成
    return [
      {
        title: '成長趨勢',
        content: '數據分析進行中...'
      }
    ];
  }

  /**
   * 獲取情緒分析數據
   * @param {Date} startDate - 開始日期
   * @param {Date} endDate - 結束日期
   * @returns {Promise<Object>} 情緒分析數據
   * @private
   */
  async _getMoodAnalysisData(startDate, endDate) {
    // TODO: 實現情緒分析數據獲取
    return { startDate, endDate };
  }

  /**
   * 生成情緒分析洞見
   * @param {Object} data - 情緒分析數據
   * @returns {Array<Object>} 洞見數組
   * @private
   */
  _generateMoodInsights(data) {
    // TODO: 實現情緒分析洞見生成
    return [
      {
        title: '情緒模式',
        content: '數據分析進行中...'
      }
    ];
  }

  /**
   * 獲取發展分析數據
   * @param {Date} startDate - 開始日期
   * @param {Date} endDate - 結束日期
   * @returns {Promise<Object>} 發展分析數據
   * @private
   */
  async _getDevelopmentAnalysisData(startDate, endDate) {
    // TODO: 實現發展分析數據獲取
    return { startDate, endDate };
  }

  /**
   * 生成發展分析洞見
   * @param {Object} data - 發展分析數據
   * @returns {Array<Object>} 洞見數組
   * @private
   */
  _generateDevelopmentInsights(data) {
    // TODO: 實現發展分析洞見生成
    return [
      {
        title: '發展進度',
        content: '數據分析進行中...'
      }
    ];
  }
}

// 當 DOM 內容載入完成時初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  
  // 將應用程式實例保存到 window 對象，以便在控制台進行調試
  window.app = app;
});

export default App;