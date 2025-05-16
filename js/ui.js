/**
 * ui.js - UI 操作與渲染模組
 * 
 * 此模組負責所有 DOM 操作和 UI 更新，包括頁面切換、模態對話框、
 * 提示訊息、渲染列表和圖表等。
 * 
 * @author BabyGrow Team
 * @version 1.0.0
 */

'use strict';

/**
 * 顯示應用程式
 */
export function showApp() {
  document.getElementById('app').classList.remove('hidden');
}

/**
 * 顯示載入畫面
 * @param {string} message - 載入訊息
 */
export function showLoading(message = '載入中...') {
  const loadingScreen = document.getElementById('loading-screen');
  const loadingContent = loadingScreen.querySelector('.loading-content p');
  
  loadingContent.textContent = message;
  loadingScreen.classList.remove('hidden');
}

/**
 * 隱藏載入畫面
 */
export function hideLoading() {
  document.getElementById('loading-screen').classList.add('hidden');
}

/**
 * 切換側邊選單
 */
export function toggleSideMenu() {
  const sideMenu = document.getElementById('side-menu');
  sideMenu.classList.toggle('hidden');
}

/**
 * 關閉側邊選單
 */
export function closeSideMenu() {
  document.getElementById('side-menu').classList.add('hidden');
}

/**
 * 顯示指定頁面
 * @param {string} pageName - 頁面名稱
 */
export function showPage(pageName) {
  // 隱藏所有頁面
  document.querySelectorAll('.page').forEach(page => {
    page.classList.add('hidden');
  });
  
  // 顯示指定頁面
  const targetPage = document.getElementById(`${pageName}-page`);
  if (targetPage) {
    targetPage.classList.remove('hidden');
  } else {
    console.error(`找不到頁面: ${pageName}-page`);
  }
}

/**
 * 更新選單活躍項目
 * @param {string} pageName - 活躍頁面名稱
 */
export function updateMenuActiveItem(pageName) {
  // 移除所有活躍類別
  document.querySelectorAll('.menu-items li').forEach(item => {
    item.classList.remove('active');
  });
  
  // 添加活躍類別到當前頁面的選單項目
  const activeItem = document.querySelector(`.menu-items li[data-page="${pageName}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
}

/**
 * 更新頁面標題
 * @param {string} pageName - 頁面名稱
 * @param {Object} childData - 活躍子女數據（可選）
 */
export function updatePageTitle(pageName, childData) {
  let title = '寶貝成長日記';
  
  // 根據頁面名稱設置標題
  switch (pageName) {
    case 'welcome':
      title = '歡迎使用';
      break;
    case 'dashboard':
      title = '主頁';
      break;
    case 'feeding':
      title = '餵食記錄';
      break;
    case 'sleep':
      title = '睡眠記錄';
      break;
    case 'diaper':
      title = '尿布記錄';
      break;
    case 'health':
      title = '健康記錄';
      break;
    case 'milestone':
      title = '發展里程碑';
      break;
    case 'interaction':
      title = '親子互動日記';
      break;
    case 'mood':
      title = '情緒與行為';
      break;
    case 'analysis':
      title = '數據分析';
      break;
    case 'data-management':
      title = '數據管理';
      break;
  }
  
  // 如果有子女數據，添加子女名稱
  if (childData && childData.name) {
    title += ` - ${childData.name}`;
  }
  
  // 更新頁面標題
  document.getElementById('page-title').textContent = title;
}

/**
 * 渲染子女列表
 * @param {Array} children - 子女數據陣列
 * @param {number|string} activeChildId - 活躍子女 ID
 * @param {Function} onChildClick - 點擊子女項目時的回調函數
 */
export function renderChildrenList(children, activeChildId, onChildClick) {
  const childrenList = document.getElementById('children-list');
  
  // 清空列表
  childrenList.innerHTML = '';
  
  // 如果沒有子女，顯示提示訊息
  if (!children || children.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-children-message';
    emptyMessage.textContent = '尚未添加寶貝';
    childrenList.appendChild(emptyMessage);
    return;
  }
  
  // 渲染每個子女項目
  children.forEach(child => {
    const childItem = document.createElement('div');
    childItem.className = 'child-item';
    
    // 如果是活躍子女，添加活躍類別
    if (child.id == activeChildId) {
      childItem.classList.add('active');
    }
    
    // 計算年齡
    const ageText = calculateAgeText(child.birthday);
    
    // 創建子女頭像
    const avatar = document.createElement('div');
    avatar.className = 'child-avatar';
    
    if (child.photo) {
      // 如果有照片，使用照片
      const img = document.createElement('img');
      img.src = child.photo;
      img.alt = child.name;
      avatar.appendChild(img);
    } else {
      // 如果沒有照片，使用首字母
      avatar.textContent = child.name.charAt(0);
      
      // 根據性別設置不同的背景色
      if (child.gender === 'male') {
        avatar.classList.add('male');
      } else if (child.gender === 'female') {
        avatar.classList.add('female');
      }
    }
    
    // 創建子女資訊
    const info = document.createElement('div');
    info.className = 'child-info';
    
    const name = document.createElement('div');
    name.className = 'child-name';
    name.textContent = child.name;
    
    const age = document.createElement('div');
    age.className = 'child-age';
    age.textContent = ageText;
    
    info.appendChild(name);
    info.appendChild(age);
    
    // 組裝子女項目
    childItem.appendChild(avatar);
    childItem.appendChild(info);
    
    // 添加點擊事件
    childItem.addEventListener('click', () => {
      onChildClick(child.id);
    });
    
    // 添加到列表
    childrenList.appendChild(childItem);
  });
}

/**
 * 更新活躍子女顯示
 * @param {Object} childData - 活躍子女數據
 */
export function updateActiveChildDisplay(childData) {
  if (!childData) return;
  
  const activeChildProfile = document.getElementById('active-child-profile');
  
  // 創建內容
  const ageText = calculateAgeText(childData.birthday);
  
  activeChildProfile.innerHTML = `
    <div class="profile-header-content">
      <div class="child-avatar ${childData.gender}">
        ${childData.photo ? `<img src="${childData.photo}" alt="${childData.name}">` : childData.name.charAt(0)}
      </div>
      <div class="profile-info">
        <h2>${childData.name}</h2>
        <p>${ageText}</p>
      </div>
    </div>
  `;
}

/**
 * 渲染今日概覽
 * @param {Object} todayData - 今日數據
 */
export function renderTodaySummary(todayData) {
  const summaryContent = document.getElementById('today-summary-content');
  
  // 計算摘要統計
  const feedingCount = todayData.feedings ? todayData.feedings.length : 0;
  
  // 計算總睡眠時間（分鐘）
  let totalSleepMinutes = 0;
  if (todayData.sleep && todayData.sleep.length > 0) {
    todayData.sleep.forEach(record => {
      if (record.startTime && record.endTime) {
        totalSleepMinutes += (record.endTime - record.startTime) / (60 * 1000);
      }
    });
  }
  
  // 計算尿布更換次數
  const diaperCount = todayData.diapers ? todayData.diapers.length : 0;
  
  // 格式化睡眠時間
  const sleepHours = Math.floor(totalSleepMinutes / 60);
  const sleepMinutes = Math.round(totalSleepMinutes % 60);
  const sleepText = totalSleepMinutes > 0 
    ? `${sleepHours}小時 ${sleepMinutes}分鐘`
    : '尚無記錄';
  
  // 創建摘要卡片
  summaryContent.innerHTML = `
    <div class="summary-card">
      <div class="card-icon">
        <i class="fas fa-utensils"></i>
      </div>
      <div class="card-content">
        <h4>餵食</h4>
        <p class="card-value">${feedingCount} 次</p>
      </div>
    </div>
    
    <div class="summary-card">
      <div class="card-icon">
        <i class="fas fa-moon"></i>
      </div>
      <div class="card-content">
        <h4>睡眠</h4>
        <p class="card-value">${sleepText}</p>
      </div>
    </div>
    
    <div class="summary-card">
      <div class="card-icon">
        <i class="fas fa-baby"></i>
      </div>
      <div class="card-content">
        <h4>尿布</h4>
        <p class="card-value">${diaperCount} 次</p>
      </div>
    </div>
  `;
}

/**
 * 渲染近期活動
 * @param {Array} activities - 活動數據陣列
 */
export function renderRecentActivities(activities) {
  const activitiesList = document.getElementById('recent-activities-list');
  
  // 清空列表
  activitiesList.innerHTML = '';
  
  // 如果沒有活動，顯示提示訊息
  if (!activities || activities.length === 0) {
    activitiesList.innerHTML = `
      <div class="empty-list-message">
        <p>尚無近期活動</p>
        <p>使用上方的「快速記錄」按鈕開始記錄寶寶的活動</p>
      </div>
    `;
    return;
  }
  
  // 渲染每個活動項目
  activities.forEach(activity => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    // 獲取時間戳
    const timestamp = activity.timestamp || activity.startTime || activity.date;
    const dateObj = new Date(timestamp);
    
    // 格式化日期和時間
    const formattedDate = formatDate(dateObj);
    const formattedTime = formatTime(dateObj);
    
    // 根據活動類型設置圖標和標題
    let icon, title, details;
    
    switch (activity.type) {
      case 'feeding':
        icon = 'fa-utensils';
        title = '餵食';
        details = `${activity.method} - ${activity.amount} ${activity.unit}`;
        break;
      case 'sleep':
        icon = 'fa-moon';
        title = '睡眠';
        // 計算睡眠時長
        const endTime = new Date(activity.endTime);
        const durationMinutes = (activity.endTime - activity.startTime) / (60 * 1000);
        details = `睡眠時長: ${Math.floor(durationMinutes / 60)}小時 ${Math.round(durationMinutes % 60)}分鐘`;
        break;
      case 'diaper':
        icon = 'fa-baby';
        title = '尿布更換';
        details = `${activity.type} - ${activity.condition}`;
        break;
      case 'health':
        icon = 'fa-heartbeat';
        title = '健康記錄';
        details = activity.notes || '健康檢查';
        break;
      case 'milestone':
        icon = 'fa-star';
        title = '里程碑';
        details = activity.milestone;
        break;
      case 'mood':
        icon = 'fa-smile';
        title = '情緒記錄';
        details = `情緒: ${activity.mood} - ${activity.notes || ''}`;
        break;
      case 'interaction':
        icon = 'fa-heart';
        title = '親子互動';
        details = activity.title || '互動日記';
        break;
      default:
        icon = 'fa-calendar-check';
        title = '活動';
        details = '詳情';
    }
    
    // 創建活動卡片內容
    activityItem.innerHTML = `
      <div class="activity-icon">
        <i class="fas ${icon}"></i>
      </div>
      <div class="activity-details">
        <div class="activity-header">
          <h4>${title}</h4>
          <span class="activity-time">${formattedTime}</span>
        </div>
        <p class="activity-description">${details}</p>
        <div class="activity-date">${formattedDate}</div>
      </div>
    `;
    
    // 添加到列表
    activitiesList.appendChild(activityItem);
  });
}

/**
 * 渲染每週趨勢圖表
 * @param {Object} data - 圖表數據
 */
export function renderWeeklyChart(data) {
  // 檢查是否已載入 Chart.js
  if (!window.Chart) {
    console.error('Chart.js 未載入，無法渲染圖表');
    return;
  }
  
  // 獲取圖表容器
  const canvas = document.getElementById('weekly-chart');
  if (!canvas) return;
  
  // 清除現有圖表
  if (window.weeklyChart) {
    window.weeklyChart.destroy();
  }
  
  // 創建圖表
  window.weeklyChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: '餵食次數',
          data: data.feedingCounts,
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
          yAxisID: 'y-axis-1'
        },
        {
          label: '睡眠時數',
          data: data.sleepHours,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          yAxisID: 'y-axis-2',
          type: 'line',
          fill: false
        },
        {
          label: '尿布次數',
          data: data.diaperCounts,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          yAxisID: 'y-axis-1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            id: 'y-axis-1',
            type: 'linear',
            position: 'left',
            ticks: {
              beginAtZero: true,
              stepSize: 1
            },
            scaleLabel: {
              display: true,
              labelString: '次數'
            }
          },
          {
            id: 'y-axis-2',
            type: 'linear',
            position: 'right',
            ticks: {
              beginAtZero: true
            },
            scaleLabel: {
              display: true,
              labelString: '睡眠時數'
            },
            gridLines: {
              drawOnChartArea: false
            }
          }
        ]
      },
      title: {
        display: true,
        text: '過去一週趨勢'
      },
      legend: {
        position: 'top'
      },
      tooltips: {
        mode: 'index',
        intersect: false
      }
    }
  });
}

/**
 * 渲染親子反思
 * @param {Array} reflections - 反思數據陣列
 */
export function renderParentReflections(reflections) {
  const reflectionsContainer = document.getElementById('parent-reflections');
  
  // 清空容器
  reflectionsContainer.innerHTML = '';
  
  // 如果沒有反思，顯示提示訊息
  if (!reflections || reflections.length === 0) {
    reflectionsContainer.innerHTML = `
      <div class="empty-list-message">
        <p>尚無親子時刻反思</p>
        <p>記錄您與寶寶共度的珍貴時光和感受，幫助您成為更好的父母</p>
      </div>
    `;
    return;
  }
  
  // 最多顯示 3 條反思
  const displayReflections = reflections.slice(0, 3);
  
  // 渲染每條反思
  displayReflections.forEach(reflection => {
    const reflectionDate = new Date(reflection.date);
    const formattedDate = formatDate(reflectionDate);
    
    const reflectionItem = document.createElement('div');
    reflectionItem.className = 'reflection-item';
    
    reflectionItem.innerHTML = `
      <div class="reflection-date">${formattedDate}</div>
      <div class="reflection-content">
        <p>${reflection.parentReflection}</p>
      </div>
      ${reflection.prompt ? `<div class="reflection-prompt-tag">${reflection.prompt}</div>` : ''}
    `;
    
    reflectionsContainer.appendChild(reflectionItem);
  });
}

/**
 * 渲染分析圖表
 * @param {string} analysisType - 分析類型
 * @param {string} period - 時間週期
 * @param {Object} data - 圖表數據
 */
export function renderAnalysisChart(analysisType, period, data) {
  // 具體實現會根據分析類型和資料結構有所不同
  // 這裡提供一個基本框架
  
  // 獲取圖表容器
  const canvas = document.getElementById('analysis-chart');
  if (!canvas) return;
  
  // 清除現有圖表
  if (window.analysisChart) {
    window.analysisChart.destroy();
  }
  
  // 根據分析類型準備圖表數據和配置
  let chartConfig;
  
  switch (analysisType) {
    case 'feeding':
      // 實現餵食分析圖表
      chartConfig = createFeedingAnalysisChart(data, period);
      break;
    case 'sleep':
      // 實現睡眠分析圖表
      chartConfig = createSleepAnalysisChart(data, period);
      break;
    case 'health':
      // 實現健康分析圖表
      chartConfig = createHealthAnalysisChart(data, period);
      break;
    case 'mood':
      // 實現情緒分析圖表
      chartConfig = createMoodAnalysisChart(data, period);
      break;
    case 'development':
      // 實現發展分析圖表
      chartConfig = createDevelopmentAnalysisChart(data, period);
      break;
    default:
      // 預設圖表
      chartConfig = {
        type: 'bar',
        data: {
          labels: ['無數據'],
          datasets: [{
            label: '無數據',
            data: [0],
            backgroundColor: 'rgba(200, 200, 200, 0.6)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          title: {
            display: true,
            text: '無有效數據'
          }
        }
      };
  }
  
  // 創建圖表
  window.analysisChart = new Chart(canvas, chartConfig);
}

/**
 * 渲染分析洞見
 * @param {Array} insights - 洞見數據陣列
 */
export function renderAnalysisInsights(insights) {
  const insightsContainer = document.getElementById('analysis-insights');
  
  // 清空容器
  insightsContainer.innerHTML = '';
  
  // 如果沒有洞見，顯示提示訊息
  if (!insights || insights.length === 0) {
    insightsContainer.innerHTML = `
      <div class="empty-insights-message">
        <p>無法生成洞見</p>
        <p>請確保您有足夠的數據記錄</p>
      </div>
    `;
    return;
  }
  
  // 添加標題
  const insightsTitle = document.createElement('h3');
  insightsTitle.textContent = '數據洞見';
  insightsContainer.appendChild(insightsTitle);
  
  // 渲染每條洞見
  insights.forEach(insight => {
    const insightItem = document.createElement('div');
    insightItem.className = 'insight-item';
    
    insightItem.innerHTML = `
      <h4>${insight.title}</h4>
      <p>${insight.content}</p>
    `;
    
    insightsContainer.appendChild(insightItem);
  });
}

/**
 * 顯示模態對話框
 * @param {string} content - 對話框內容 HTML
 * @param {Object} options - 選項
 */
export function showModal(content, options = {}) {
  const modalContainer = document.getElementById('modal-container');
  
  // 設置預設選項
  const defaultOptions = {
    closeOnOverlayClick: true,
    showCloseButton: true,
    className: ''
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  // 創建模態對話框內容
  const modal = document.createElement('div');
  modal.className = `modal ${finalOptions.className}`;
  
  // 添加關閉按鈕
  let closeButton = '';
  if (finalOptions.showCloseButton) {
    closeButton = `
      <button class="modal-close" aria-label="關閉">
        <i class="fas fa-times"></i>
      </button>
    `;
  }
  
  // 設置模態對話框內容
  modal.innerHTML = `
    ${closeButton}
    <div class="modal-content">
      ${content}
    </div>
  `;
  
  // 清空並添加到容器
  modalContainer.innerHTML = '';
  modalContainer.appendChild(modal);
  
  // 顯示模態對話框
  modalContainer.classList.remove('hidden');
  
  // 綁定關閉事件
  if (finalOptions.showCloseButton) {
    modal.querySelector('.modal-close').addEventListener('click', () => {
      hideModal();
    });
  }
  
  // 點擊遮罩關閉
  if (finalOptions.closeOnOverlayClick) {
    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) {
        hideModal();
      }
    });
  }
  
  // 禁止背景滾動
  document.body.classList.add('modal-open');
  
  return {
    modalContainer,
    modal
  };
}

/**
 * 隱藏模態對話框
 */
export function hideModal() {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

/**
 * 顯示新增子女表單模態對話框
 * @param {Function} onSubmit - 表單提交回調函數
 */
export function showAddChildModal(onSubmit) {
  const content = `
    <div class="modal-header">
      <h2>添加新寶貝</h2>
    </div>
    <form id="add-child-form" class="modal-form">
      <div class="form-group">
        <label for="child-name">寶貝名稱 <span class="required">*</span></label>
        <input type="text" id="child-name" name="name" required>
      </div>
      
      <div class="form-group">
        <label for="child-birthday">出生日期 <span class="required">*</span></label>
        <input type="date" id="child-birthday" name="birthday" required>
      </div>
      
      <div class="form-group">
        <label>性別</label>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" name="gender" value="male" checked>
            <span>男寶寶</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="gender" value="female">
            <span>女寶寶</span>
          </label>
        </div>
      </div>
      
      <div class="form-group">
        <label for="child-photo">寶貝照片</label>
        <input type="file" id="child-photo" name="photo" accept="image/*">
        <div id="photo-preview" class="photo-preview hidden"></div>
      </div>
      
      <div class="form-group">
        <label for="child-notes">備註</label>
        <textarea id="child-notes" name="notes" rows="3"></textarea>
      </div>
      
      <div class="form-actions">
        <button type="button" class="secondary-button cancel-button">取消</button>
        <button type="submit" class="primary-button">添加寶貝</button>
      </div>
    </form>
  `;
  
  const { modal } = showModal(content, { className: 'add-child-modal' });
  
  // 處理照片預覽
  const photoInput = modal.querySelector('#child-photo');
  const photoPreview = modal.querySelector('#photo-preview');
  
  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        photoPreview.innerHTML = `<img src="${event.target.result}" alt="照片預覽">`;
        photoPreview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    } else {
      photoPreview.innerHTML = '';
      photoPreview.classList.add('hidden');
    }
  });
  
  // 綁定表單提交事件
  const form = modal.querySelector('#add-child-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 獲取表單數據
    const formData = new FormData(form);
    const childData = {
      name: formData.get('name'),
      gender: formData.get('gender'),
      notes: formData.get('notes') || ''
    };
    
    // 處理生日
    const birthdayStr = formData.get('birthday');
    if (birthdayStr) {
      childData.birthday = Date.parse(birthdayStr);
    }
    
    // 處理照片
    const photoFile = photoInput.files[0];
    if (photoFile) {
      try {
        const photoDataUrl = await readFileAsDataURL(photoFile);
        childData.photo = photoDataUrl;
      } catch (error) {
        console.error('讀取照片失敗:', error);
        showErrorMessage('無法讀取照片', '請選擇其他照片或稍後重試。');
        return;
      }
    }
    
    // 呼叫提交回調
    onSubmit(childData);
    
    // 關閉模態對話框
    hideModal();
  });
  
  // 綁定取消按鈕事件
  modal.querySelector('.cancel-button').addEventListener('click', () => {
    hideModal();
  });
}

/**
 * 顯示添加餵食記錄表單
 * @param {Object} childData - 子女數據
 * @param {Function} onSubmit - 表單提交回調函數
 */
export function showAddFeedingModal(childData, onSubmit) {
  const content = `
    <div class="modal-header">
      <h2>添加餵食記錄</h2>
      <div class="modal-subtitle">${childData.name}</div>
    </div>
    <form id="add-feeding-form" class="modal-form">
      <div class="form-group">
        <label for="feeding-time">餵食時間 <span class="required">*</span></label>
        <input type="datetime-local" id="feeding-time" name="feedingTime" required>
      </div>
      
      <div class="form-group">
        <label>餵食方式 <span class="required">*</span></label>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" name="method" value="母乳" checked>
            <span>母乳</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="method" value="奶瓶">
            <span>奶瓶</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="method" value="副食品">
            <span>副食品</span>
          </label>
        </div>
      </div>
      
      <div id="amount-container" class="form-group">
        <label for="feeding-amount">餵食量 <span class="required">*</span></label>
        <div class="input-with-unit">
          <input type="number" id="feeding-amount" name="amount" min="0" step="5" required>
          <select id="feeding-unit" name="unit">
            <option value="ml">毫升 (ml)</option>
            <option value="分鐘">分鐘</option>
            <option value="湯匙">湯匙</option>
            <option value="份">份</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label for="feeding-notes">備註</label>
        <textarea id="feeding-notes" name="notes" rows="3"></textarea>
      </div>
      
      <div class="form-actions">
        <button type="button" class="secondary-button cancel-button">取消</button>
        <button type="submit" class="primary-button">添加記錄</button>
      </div>
    </form>
  `;
  
  const { modal } = showModal(content, { className: 'add-feeding-modal' });
  
  // 設置預設餵食時間為現在
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  document.getElementById('feeding-time').value = `${year}-${month}-${day}T${hours}:${minutes}`;
  
  // 根據餵食方式調整單位
  const methodRadios = modal.querySelectorAll('input[name="method"]');
  methodRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const unitSelect = document.getElementById('feeding-unit');
      
      // 根據餵食方式設置適當的單位選項
      switch (radio.value) {
        case '母乳':
          unitSelect.innerHTML = `
            <option value="分鐘">分鐘</option>
            <option value="ml">毫升 (ml)</option>
          `;
          break;
        case '奶瓶':
          unitSelect.innerHTML = `
            <option value="ml">毫升 (ml)</option>
            <option value="安士">安士 (oz)</option>
          `;
          break;
        case '副食品':
          unitSelect.innerHTML = `
            <option value="湯匙">湯匙</option>
            <option value="份">份</option>
            <option value="克">克 (g)</option>
          `;
          break;
      }
    });
  });
  
  // 綁定表單提交事件
  const form = modal.querySelector('#add-feeding-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 獲取表單數據
    const formData = new FormData(form);
    
    // 處理時間戳
    const feedingTimeStr = formData.get('feedingTime');
    const timestamp = Date.parse(feedingTimeStr);
    
    const feedingData = {
      timestamp,
      method: formData.get('method'),
      amount: formData.get('amount'),
      unit: formData.get('unit'),
      notes: formData.get('notes') || ''
    };
    
    // 呼叫提交回調
    onSubmit(feedingData);
    
    // 關閉模態對話框
    hideModal();
  });
  
  // 綁定取消按鈕事件
  modal.querySelector('.cancel-button').addEventListener('click', () => {
    hideModal();
  });
}

/**
 * 顯示添加親子互動日記表單
 * @param {Object} childData - 子女數據
 * @param {Function} onSubmit - 表單提交回調函數
 */
export function showAddInteractionModal(childData, onSubmit) {
  const content = `
    <div class="modal-header">
      <h2>添加親子互動日記</h2>
      <div class="modal-subtitle">${childData.name}</div>
    </div>
    <form id="add-interaction-form" class="modal-form">
      <div class="form-group">
        <label for="interaction-date">日期 <span class="required">*</span></label>
        <input type="date" id="interaction-date" name="interactionDate" required>
      </div>
      
      <div class="form-group">
        <label for="interaction-title">標題 <span class="required">*</span></label>
        <input type="text" id="interaction-title" name="title" required 
               placeholder="例如：公園玩耍、一起閱讀、第一次微笑...">
      </div>
      
      <div class="form-group">
        <label for="interaction-content">互動內容 <span class="required">*</span></label>
        <textarea id="interaction-content" name="content" rows="4" required
                  placeholder="記錄今天與寶寶互動的細節..."></textarea>
      </div>
      
      <div class="form-group">
        <label for="parent-reflection">父母反思</label>
        <textarea id="parent-reflection" name="parentReflection" rows="3"
                  placeholder="這次互動讓您有什麼感受或發現？"></textarea>
      </div>
      
      <div class="form-actions">
        <button type="button" class="secondary-button cancel-button">取消</button>
        <button type="submit" class="primary-button">添加日記</button>
      </div>
    </form>
  `;
  
  const { modal } = showModal(content, { className: 'add-interaction-modal' });
  
  // 設置預設日期為今天
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('interaction-date').value = today;
  
  // 綁定表單提交事件
  const form = modal.querySelector('#add-interaction-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 獲取表單數據
    const formData = new FormData(form);
    
    // 處理日期
    const dateStr = formData.get('interactionDate');
    const date = Date.parse(dateStr);
    
    const interactionData = {
      date,
      title: formData.get('title'),
      content: formData.get('content'),
      parentReflection: formData.get('parentReflection') || ''
    };
    
    // 呼叫提交回調
    onSubmit(interactionData);
    
    // 關閉模態對話框
    hideModal();
  });
  
  // 綁定取消按鈕事件
  modal.querySelector('.cancel-button').addEventListener('click', () => {
    hideModal();
  });
}

/**
 * 顯示添加親子反思表單
 * @param {Object} childData - 子女數據
 * @param {string} prompt - 反思提示
 * @param {Function} onSubmit - 表單提交回調函數
 */
export function showAddReflectionModal(childData, prompt, onSubmit) {
  const content = `
    <div class="modal-header">
      <h2>親子時刻反思</h2>
      <div class="modal-subtitle">${childData.name}</div>
    </div>
    <form id="add-reflection-form" class="modal-form">
      <div class="reflection-prompt-card">
        <div class="prompt-icon">
          <i class="fas fa-lightbulb"></i>
        </div>
        <div class="prompt-content">
          <p id="reflection-prompt-text">${prompt}</p>
        </div>
      </div>
      
      <div class="form-group">
        <label for="reflection-content">您的反思 <span class="required">*</span></label>
        <textarea id="reflection-content" name="parentReflection" rows="5" required
                  placeholder="分享您的親子時刻與感受..."></textarea>
      </div>
      
      <div class="form-actions">
        <button type="button" class="secondary-button cancel-button">取消</button>
        <button type="submit" class="primary-button">保存反思</button>
      </div>
    </form>
  `;
  
  const { modal } = showModal(content, { className: 'add-reflection-modal' });
  
  // 綁定表單提交事件
  const form = modal.querySelector('#add-reflection-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 獲取表單數據
    const reflectionData = {
      parentReflection: form.elements.parentReflection.value,
      prompt: prompt,
      title: '親子時刻反思',
      content: prompt
    };
    
    // 呼叫提交回調
    onSubmit(reflectionData);
    
    // 關閉模態對話框
    hideModal();
  });
  
  // 綁定取消按鈕事件
  modal.querySelector('.cancel-button').addEventListener('click', () => {
    hideModal();
  });
}

/**
 * 顯示確認對話框
 * @param {string} title - 標題
 * @param {string} message - 訊息
 * @param {Function} onConfirm - 確認回調函數
 * @param {string} confirmText - 確認按鈕文字
 * @param {string} buttonType - 確認按鈕類型
 */
export function showConfirmModal(title, message, onConfirm, confirmText = '確認', buttonType = 'primary') {
  const content = `
    <div class="modal-header">
      <h2>${title}</h2>
    </div>
    <div class="modal-body">
      <p>${message}</p>
    </div>
    <div class="modal-actions">
      <button class="secondary-button cancel-button">取消</button>
      <button class="${buttonType}-button confirm-button">${confirmText}</button>
    </div>
  `;
  
  const { modal } = showModal(content, { className: 'confirm-modal' });
  
  // 綁定確認按鈕事件
  modal.querySelector('.confirm-button').addEventListener('click', () => {
    hideModal();
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  });
  
  // 綁定取消按鈕事件
  modal.querySelector('.cancel-button').addEventListener('click', () => {
    hideModal();
  });
}

/**
 * 顯示成功訊息吐司通知
 * @param {string} title - 標題
 * @param {string} message - 訊息
 */
export function showSuccessMessage(title, message) {
  showToast(title, message, 'success');
}

/**
 * 顯示錯誤訊息吐司通知
 * @param {string} title - 標題
 * @param {string} message - 訊息
 */
export function showErrorMessage(title, message) {
  showToast(title, message, 'error');
}

/**
 * 顯示資訊訊息吐司通知
 * @param {string} title - 標題
 * @param {string} message - 訊息
 */
export function showInfoMessage(title, message) {
  showToast(title, message, 'info');
}

/**
 * 顯示警告訊息吐司通知
 * @param {string} title - 標題
 * @param {string} message - 訊息
 */
export function showWarningMessage(title, message) {
  showToast(title, message, 'warning');
}

/**
 * 顯示吐司通知
 * @param {string} title - 標題
 * @param {string} message - 訊息
 * @param {string} type - 類型（'success'|'error'|'info'|'warning'）
 * @param {number} duration - 顯示時間（毫秒）
 */
function showToast(title, message, type = 'info', duration = 3000) {
  const toastContainer = document.getElementById('toast-container');
  
  // 創建吐司元素
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // 設置圖標
  let icon;
  switch (type) {
    case 'success':
      icon = 'fa-check-circle';
      break;
    case 'error':
      icon = 'fa-exclamation-circle';
      break;
    case 'warning':
      icon = 'fa-exclamation-triangle';
      break;
    case 'info':
    default:
      icon = 'fa-info-circle';
  }
  
  // 設置吐司內容
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas ${icon}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" aria-label="關閉">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // 添加到容器
  toastContainer.appendChild(toast);
  
  // 添加關閉按鈕事件
  const closeButton = toast.querySelector('.toast-close');
  closeButton.addEventListener('click', () => {
    closeToast(toast);
  });
  
  // 設置自動關閉
  setTimeout(() => {
    closeToast(toast);
  }, duration);
  
  // 添加顯示類別
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
}

/**
 * 關閉吐司通知
 * @param {HTMLElement} toast - 吐司元素
 */
function closeToast(toast) {
  // 移除顯示類別
  toast.classList.remove('show');
  
  // 設置過渡後移除元素
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

// 輔助函數 - 計算年齡文字
function calculateAgeText(birthday) {
  if (!birthday) return '未知年齡';
  
  const birthDate = new Date(birthday);
  const now = new Date();
  
  // 計算年齡（年、月、日）
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();
  
  // 調整月份和天數
  if (days < 0) {
    months--;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth(), 0);
    days += lastMonthDate.getDate();
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // 格式化年齡文字
  if (years > 0) {
    return `${years} 歲 ${months} 個月`;
  } else if (months > 0) {
    return `${months} 個月 ${days} 天`;
  } else {
    return `${days} 天`;
  }
}

// 輔助函數 - 格式化日期
function formatDate(dateObj) {
  if (!dateObj || !(dateObj instanceof Date)) return '';
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// 輔助函數 - 格式化時間
function formatTime(dateObj) {
  if (!dateObj || !(dateObj instanceof Date)) return '';
  
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

// 輔助函數 - 將文件讀取為 Data URL
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
}

// 分析圖表創建函數 - 這些函數在實際實現中會更加詳細
function createFeedingAnalysisChart(data, period) {
  // 這裡是一個示例實現
  // 實際實現會根據數據結構有所不同
  return {
    type: 'bar',
    data: {
      labels: ['範例數據'],
      datasets: [{
        label: '餵食次數',
        data: [data.feedings ? data.feedings.length : 0],
        backgroundColor: 'rgba(255, 159, 64, 0.6)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: true,
        text: '餵食分析'
      }
    }
  };
}

function createSleepAnalysisChart(data, period) {
  // 實現示例
  return {
    type: 'bar',
    data: {
      labels: ['範例數據'],
      datasets: [{
        label: '睡眠小時',
        data: [8],
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: true,
        text: '睡眠分析'
      }
    }
  };
}

function createHealthAnalysisChart(data, period) {
  // 實現示例
  return {
    type: 'line',
    data: {
      labels: ['範例數據'],
      datasets: [{
        label: '體重 (kg)',
        data: [5],
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: true,
        text: '健康趨勢'
      }
    }
  };
}

function createMoodAnalysisChart(data, period) {
  // 實現示例
  return {
    type: 'pie',
    data: {
      labels: ['開心', '平靜', '不安'],
      datasets: [{
        data: [5, 3, 1],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: true,
        text: '情緒分析'
      }
    }
  };
}

function createDevelopmentAnalysisChart(data, period) {
  // 實現示例
  return {
    type: 'radar',
    data: {
      labels: ['運動', '語言', '社交', '認知', '情緒'],
      datasets: [{
        label: '發展評估',
        data: [5, 3, 4, 4, 3],
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        pointBackgroundColor: 'rgba(153, 102, 255, 1)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: true,
        text: '發展評估'
      }
    }
  };
}