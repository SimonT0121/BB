/**
 * 嬰幼兒照顧追蹤應用 - 餵食記錄控制器
 * 處理餵食記錄頁面的用戶交互和業務邏輯
 */

const BabyTracker = window.BabyTracker || {};

/**
 * 餵食記錄控制器
 */
BabyTracker.FeedingController = (function() {
    // 私有變量
    let viewContainer = null;
    let activeChildId = null;
    let currentDate = new Date();
    let feedingRecords = [];
    let feedingStats = null;
    let isInitialized = false;
    
    // DOM 元素引用
    let elements = {};
    
    // 常量
    const DATE_FORMAT_OPTIONS = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const FEEDING_TYPES = BabyTracker.FeedingModel.FEEDING_TYPES;
    const FEEDING_UNITS = BabyTracker.FeedingModel.FEEDING_UNITS;
    
    // 初始化控制器
    const init = (container) => {
        if (isInitialized && container === viewContainer) {
            return Promise.resolve();
        }
        
        viewContainer = container;
        isInitialized = true;
        
        // 獲取活動兒童
        activeChildId = BabyTracker.App.getActiveChild()?.id;
        
        if (!activeChildId) {
            renderNoChildView();
            return Promise.resolve();
        }
        
        // 訂閱事件
        subscribeToEvents();
        
        // 載入當天數據
        return loadData(currentDate)
            .then(() => {
                // 渲染頁面
                render();
            })
            .catch(error => {
                console.error('載入餵食數據時出錯', error);
                BabyTracker.UI.createNotification({
                    type: 'danger',
                    title: '載入錯誤',
                    message: '無法載入餵食數據，請重試。'
                });
            });
    };
    
    // 訂閱相關事件
    const subscribeToEvents = () => {
        // 餵食記錄變更事件
        BabyTracker.EventBus.subscribe(
            BabyTracker.FeedingModel.EVENTS.FEEDING_LIST_CHANGED,
            ({ childId }) => {
                if (childId === activeChildId) {
                    loadData(currentDate)
                        .then(() => render())
                        .catch(error => console.error('重新載入餵食數據時出錯', error));
                }
            }
        );
        
        // 活動兒童變更事件
        BabyTracker.EventBus.subscribe(
            BabyTracker.App.EVENTS.ACTIVE_CHILD_CHANGED,
            (child) => {
                if (child) {
                    activeChildId = child.id;
                    loadData(currentDate)
                        .then(() => render())
                        .catch(error => console.error('切換兒童後載入餵食數據時出錯', error));
                } else {
                    activeChildId = null;
                    renderNoChildView();
                }
            }
        );
    };
    
    // 載入特定日期的餵食數據
    const loadData = (date) => {
        if (!activeChildId) {
            return Promise.resolve();
        }
        
        // 設置日期範圍 (當天)
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        // 並行獲取數據和統計
        return Promise.all([
            BabyTracker.FeedingModel.getChildFeedingsByDateRange(activeChildId, startDate, endDate),
            BabyTracker.FeedingModel.calculateFeedingStats(activeChildId, date)
        ])
            .then(([records, stats]) => {
                feedingRecords = records;
                feedingStats = stats;
            });
    };
    
    // 渲染頁面
    const render = () => {
        if (!viewContainer) return;
        
        // 清空容器
        viewContainer.innerHTML = '';
        
        // 頭部區域 (日期選擇器和摘要)
        const headerSection = createHeaderSection();
        viewContainer.appendChild(headerSection);
        
        // 統計區域
        const statsSection = createStatsSection();
        viewContainer.appendChild(statsSection);
        
        // 餵食記錄列表
        const recordsSection = createRecordsSection();
        viewContainer.appendChild(recordsSection);
        
        // 存儲元素引用
        cacheElementReferences();
        
        // 綁定事件
        bindEvents();
    };
    
    // 創建頭部區域
    const createHeaderSection = () => {
        const section = document.createElement('section');
        section.className = 'page-header';
        
        // 日期顯示和導航
        const dateNav = document.createElement('div');
        dateNav.className = 'date-navigator';
        
        // 前一天按鈕
        const prevButton = document.createElement('button');
        prevButton.className = 'icon-button date-nav-button';
        prevButton.setAttribute('id', 'prev-date-button');
        prevButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
            </svg>
        `;
        prevButton.setAttribute('aria-label', '前一天');
        dateNav.appendChild(prevButton);
        
        // 日期顯示
        const dateDisplay = document.createElement('div');
        dateDisplay.className = 'current-date';
        dateDisplay.setAttribute('id', 'current-date-display');
        dateDisplay.textContent = formatDate(currentDate);
        dateNav.appendChild(dateDisplay);
        
        // 下一天按鈕
        const nextButton = document.createElement('button');
        nextButton.className = 'icon-button date-nav-button';
        nextButton.setAttribute('id', 'next-date-button');
        nextButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
            </svg>
        `;
        nextButton.setAttribute('aria-label', '下一天');
        dateNav.appendChild(nextButton);
        
        // 今天按鈕
        const todayButton = document.createElement('button');
        todayButton.className = 'text-button today-button';
        todayButton.setAttribute('id', 'today-button');
        todayButton.textContent = '今天';
        dateNav.appendChild(todayButton);
        
        section.appendChild(dateNav);
        
        // 添加餵食記錄按鈕
        const addButton = document.createElement('button');
        addButton.className = 'primary-button add-feeding-button';
        addButton.setAttribute('id', 'add-feeding-button');
        addButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
            </svg>
            <span>添加餵食記錄</span>
        `;
        section.appendChild(addButton);
        
        return section;
    };
    
    // 創建統計區域
    const createStatsSection = () => {
        const section = document.createElement('section');
        section.className = 'stats-section';
        
        // 創建統計卡片
        const statsCard = BabyTracker.UI.createCard({
            title: '今日餵食摘要',
            icon: 'M11 8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h2c.55 0 1-.45 1-1s-.45-1-1-1h-2V4c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1zm1 10c-3.31 0-6-2.69-6-6 0-3.32 2.69-6 6-6 3.31 0 6 2.68 6 6 0 3.31-2.69 6-6 6zm10-7h-2c0-5.52-4.48-10-10-10S0 5.48 0 11v7c0 1.66 1.34 3 3 3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2c1.66 0 3-1.34 3-3v-3c0-2.21-1.79-4-4-4z',
            color: 'feeding-color',
            collapsible: true
        });
        
        // 添加統計摘要內容
        const statsContent = statsCard.querySelector('.card-content');
        
        // 創建統計數據網格
        const statsGrid = document.createElement('div');
        statsGrid.className = 'stats-grid';
        
        // 總餵食次數
        const totalStats = BabyTracker.UI.createDataSummary({
            label: '總餵食次數',
            value: feedingStats ? feedingStats.total.toString() : '0',
            unit: '次',
            icon: 'M11 8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h2c.55 0 1-.45 1-1s-.45-1-1-1h-2V4c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1z'
        });
        statsGrid.appendChild(totalStats);
        
        // 母乳餵食次數
        const breastStats = BabyTracker.UI.createDataSummary({
            label: '母乳餵食',
            value: feedingStats ? feedingStats.breastfeeding.count.toString() : '0',
            unit: '次',
            icon: 'M18.5 8c.7 0 1.4.1 2.1.2.2-1.4-.1-2.9-1-4.1-1.3-1.7-3.3-2.7-5.5-2.7-.5 0-1.1.2-1.4.6-.6.6-.5 1.5 0 2.1s1.5.5 2.1 0c.2-.1.3-.1.5-.1 1.2 0 2.4.6 3.1 1.6.3.4.3.7.2 1.4-1.9-.4-3.8-.1-5.5.7-1.1.5-2.1 1.3-2.9 2.3-1.7 2.2-1.9 5.3-.6 7.8 1.3 2.4 3.9 3.9 6.7 3.9 1 0 2.1-.2 3.1-.6 2.1-.8 3.8-2.5 4.6-4.6.8-2.1.8-4.5 0-6.6-.3-.9-.8-1.7-1.4-2.4-1.1-.3-2.3-.5-3.5-.5-1.8 0-3.5.4-5 1.3-.5.3-.7.9-.5 1.4.3.5.9.7 1.4.5 1.2-.7 2.6-1 4.1-1zM17 17c-2.8 0-5-2.2-5-5s2.2-5 5-5c.2 0 .4 0 .7.1-.5.6-.7 1.4-.7 2.4 0 2.2 1.8 3.8 3.8 3.8.9 0 1.7-.3 2.4-.7 0 .2.1.4.1.7-.2 2-1.3 3.8-3.1 4.7-.7.4-1.5.5-2.3.5h-.2c-.5-.5-.5-1.4-.1-1.9.4-.6.2-1.4-.3-1.9-.5-.4-1.3-.5-1.8-.1-.9.7-1.1 2.1-.5 3.1.4.6 1.1 1.1 1.8 1.3.6.1 1.5.1 2.2-.1 2.3-1.2 3.7-3.4 3.9-5.9.2-.6.1-1.2 0-1.9-1-.6-2-1-3.1-1z'
        });
        statsGrid.appendChild(breastStats);
        
        // 奶瓶餵食總量
        const bottleStats = BabyTracker.UI.createDataSummary({
            label: '奶瓶餵食',
            value: feedingStats ? feedingStats.bottle.totalAmount.toFixed(0) : '0',
            unit: '毫升',
            icon: 'M11 8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h2c.55 0 1-.45 1-1s-.45-1-1-1h-2V4c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1z'
        });
        statsGrid.appendChild(bottleStats);
        
        // 固體食物餵食次數
        const solidStats = BabyTracker.UI.createDataSummary({
            label: '固體食物',
            value: feedingStats ? feedingStats.solidFood.count.toString() : '0',
            unit: '次',
            icon: 'M1 21h15v2H1z M5 10h3V7h2v3h3v2h-3v3h-2v-3H5z M17 5h2v3h-2z M17 9h2v3h-2z M17 13h2v3h-2z M17 17h2v3h-2z'
        });
        statsGrid.appendChild(solidStats);
        
        statsContent.appendChild(statsGrid);
        
        // 添加上次/下次餵食信息
        if (feedingStats && feedingStats.lastFeeding) {
            const feedingTiming = document.createElement('div');
            feedingTiming.className = 'feeding-timing';
            
            // 上次餵食
            const lastFeeding = document.createElement('div');
            lastFeeding.className = 'timing-item';
            
            const lastLabel = document.createElement('span');
            lastLabel.className = 'timing-label';
            lastLabel.textContent = '上次餵食：';
            lastFeeding.appendChild(lastLabel);
            
            const lastTime = document.createElement('span');
            lastTime.className = 'timing-time';
            lastTime.textContent = formatTime(new Date(feedingStats.lastFeeding.timestamp));
            lastFeeding.appendChild(lastTime);
            
            const lastType = document.createElement('span');
            lastType.className = 'timing-type';
            lastType.textContent = ` (${BabyTracker.FeedingModel.getFeedingTypeName(feedingStats.lastFeeding.type)})`;
            lastFeeding.appendChild(lastType);
            
            feedingTiming.appendChild(lastFeeding);
            
            // 預測下次餵食
            if (feedingStats.nextPredicted) {
                const nextFeeding = document.createElement('div');
                nextFeeding.className = 'timing-item';
                
                const nextLabel = document.createElement('span');
                nextLabel.className = 'timing-label';
                nextLabel.textContent = '預計下次餵食：';
                nextFeeding.appendChild(nextLabel);
                
                const nextTime = document.createElement('span');
                nextTime.className = 'timing-time';
                nextTime.textContent = formatTime(new Date(feedingStats.nextPredicted));
                nextFeeding.appendChild(nextTime);
                
                feedingTiming.appendChild(nextFeeding);
            }
            
            statsContent.appendChild(feedingTiming);
        }
        
        section.appendChild(statsCard);
        
        return section;
    };
    
    // 創建記錄列表區域
    const createRecordsSection = () => {
        const section = document.createElement('section');
        section.className = 'records-section';
        
        // 創建記錄卡片
        const recordsCard = BabyTracker.UI.createCard({
            title: '餵食記錄',
            icon: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7zm-4 6h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z',
            color: 'feeding-color'
        });
        
        const recordsContent = recordsCard.querySelector('.card-content');
        
        // 如果沒有記錄，顯示空狀態
        if (!feedingRecords || feedingRecords.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            
            const emptyIcon = document.createElement('div');
            emptyIcon.className = 'empty-icon';
            emptyIcon.innerHTML = `
                <svg viewBox="0 0 24 24" width="64" height="64">
                    <path d="M11 8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h2c.55 0 1-.45 1-1s-.45-1-1-1h-2V4c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1zm1 10c-3.31 0-6-2.69-6-6 0-3.32 2.69-6 6-6 3.31 0 6 2.68 6 6 0 3.31-2.69 6-6 6zm10-7h-2c0-5.52-4.48-10-10-10S0 5.48 0 11v7c0 1.66 1.34 3 3 3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2c1.66 0 3-1.34 3-3v-3c0-2.21-1.79-4-4-4z"></path>
                </svg>
            `;
            emptyState.appendChild(emptyIcon);
            
            const emptyText = document.createElement('div');
            emptyText.className = 'empty-text';
            emptyText.textContent = '今天還沒有餵食記錄';
            emptyState.appendChild(emptyText);
            
            const addButton = document.createElement('button');
            addButton.className = 'primary-button add-record-button';
            addButton.textContent = '添加第一筆記錄';
            addButton.addEventListener('click', () => showAddFeedingModal());
            emptyState.appendChild(addButton);
            
            recordsContent.appendChild(emptyState);
        } else {
            // 創建記錄列表
            const recordsList = document.createElement('div');
            recordsList.className = 'records-timeline';
            
            // 按時間排序記錄（從最近到最早）
            const sortedRecords = [...feedingRecords].sort((a, b) => {
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
            
            // 添加每個記錄
            sortedRecords.forEach(record => {
                const recordItem = createRecordItem(record);
                recordsList.appendChild(recordItem);
            });
            
            recordsContent.appendChild(recordsList);
        }
        
        section.appendChild(recordsCard);
        
        return section;
    };
    
    // 創建單個記錄項目
    const createRecordItem = (record) => {
        const item = document.createElement('div');
        item.className = 'record-item';
        item.setAttribute('data-id', record.id);
        
        // 時間線圓點
        const timelineDot = document.createElement('div');
        timelineDot.className = 'timeline-dot';
        item.appendChild(timelineDot);
        
        // 記錄內容
        const recordContent = document.createElement('div');
        recordContent.className = 'record-content';
        
        // 記錄頭部（時間和類型）
        const recordHeader = document.createElement('div');
        recordHeader.className = 'record-header';
        
        // 時間
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'record-time';
        timeDisplay.textContent = formatTime(new Date(record.timestamp));
        recordHeader.appendChild(timeDisplay);
        
        // 類型
        const typeDisplay = document.createElement('div');
        typeDisplay.className = 'record-type';
        typeDisplay.textContent = BabyTracker.FeedingModel.getFeedingTypeName(record.type);
        recordHeader.appendChild(typeDisplay);
        
        // 操作按鈕
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'record-actions';
        
        const editButton = document.createElement('button');
        editButton.className = 'icon-button edit-button';
        editButton.setAttribute('aria-label', '編輯');
        editButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
            </svg>
        `;
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            showEditFeedingModal(record.id);
        });
        actionsContainer.appendChild(editButton);
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'icon-button delete-button';
        deleteButton.setAttribute('aria-label', '刪除');
        deleteButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
            </svg>
        `;
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            showDeleteConfirmModal(record.id);
        });
        actionsContainer.appendChild(deleteButton);
        
        recordHeader.appendChild(actionsContainer);
        recordContent.appendChild(recordHeader);
        
        // 記錄詳細內容
        const recordDetails = document.createElement('div');
        recordDetails.className = 'record-details';
        
        // 根據餵食類型顯示不同的內容
        switch (record.type) {
            case FEEDING_TYPES.BREAST_LEFT:
            case FEEDING_TYPES.BREAST_RIGHT:
            case FEEDING_TYPES.BREAST_BOTH:
                if (record.duration) {
                    const durationDisplay = document.createElement('div');
                    durationDisplay.className = 'detail-item';
                    durationDisplay.innerHTML = `<span class="detail-label">持續時間：</span><span class="detail-value">${BabyTracker.FeedingModel.formatFeedingDuration(record.duration)}</span>`;
                    recordDetails.appendChild(durationDisplay);
                }
                break;
                
            case FEEDING_TYPES.FORMULA:
            case FEEDING_TYPES.PUMPED_MILK:
            case FEEDING_TYPES.WATER:
                if (record.amount) {
                    const amountDisplay = document.createElement('div');
                    amountDisplay.className = 'detail-item';
                    amountDisplay.innerHTML = `<span class="detail-label">數量：</span><span class="detail-value">${record.amount} ${BabyTracker.FeedingModel.getFeedingUnitName(record.unit)}</span>`;
                    recordDetails.appendChild(amountDisplay);
                }
                break;
                
            case FEEDING_TYPES.SOLID_FOOD:
                if (record.foodItems && record.foodItems.length > 0) {
                    const foodDisplay = document.createElement('div');
                    foodDisplay.className = 'detail-item';
                    foodDisplay.innerHTML = `<span class="detail-label">食物：</span><span class="detail-value">${record.foodItems.join('、')}</span>`;
                    recordDetails.appendChild(foodDisplay);
                }
                break;
        }
        
        // 如果有備註，顯示備註
        if (record.notes) {
            const notesDisplay = document.createElement('div');
            notesDisplay.className = 'detail-item notes';
            notesDisplay.innerHTML = `<span class="detail-label">備註：</span><span class="detail-value">${record.notes}</span>`;
            recordDetails.appendChild(notesDisplay);
        }
        
        recordContent.appendChild(recordDetails);
        item.appendChild(recordContent);
        
        // 添加點擊事件，顯示詳細資訊
        item.addEventListener('click', () => {
            showFeedingDetailsModal(record.id);
        });
        
        return item;
    };
    
    // 創建添加/編輯餵食記錄表單
    const createFeedingForm = (feedingData = null) => {
        const isEdit = !!feedingData;
        
        // 創建表單容器
        const formContainer = document.createElement('div');
        formContainer.className = 'feeding-form';
        
        // 創建表單
        const form = document.createElement('form');
        form.setAttribute('id', 'feeding-form');
        form.className = 'form';
        
        // 餵食類型選擇
        const typeGroup = document.createElement('div');
        typeGroup.className = 'form-section';
        
        const typeLabel = document.createElement('label');
        typeLabel.className = 'section-label';
        typeLabel.textContent = '餵食類型';
        typeGroup.appendChild(typeLabel);
        
        const typeOptions = [
            { value: FEEDING_TYPES.BREAST_LEFT, text: '左側母乳' },
            { value: FEEDING_TYPES.BREAST_RIGHT, text: '右側母乳' },
            { value: FEEDING_TYPES.BREAST_BOTH, text: '雙側母乳' },
            { value: FEEDING_TYPES.FORMULA, text: '配方奶' },
            { value: FEEDING_TYPES.PUMPED_MILK, text: '瓶餵母乳' },
            { value: FEEDING_TYPES.SOLID_FOOD, text: '固體食物' },
            { value: FEEDING_TYPES.WATER, text: '水' },
            { value: FEEDING_TYPES.OTHER, text: '其他' }
        ];
        
        const selectedType = feedingData ? feedingData.type : FEEDING_TYPES.BREAST_LEFT;
        
        const typeButtons = document.createElement('div');
        typeButtons.className = 'type-buttons';
        
        typeOptions.forEach(option => {
            const typeButton = document.createElement('button');
            typeButton.type = 'button';
            typeButton.className = `type-button ${option.value === selectedType ? 'active' : ''}`;
            typeButton.setAttribute('data-type', option.value);
            typeButton.textContent = option.text;
            
            typeButton.addEventListener('click', () => {
                // 移除其他按鈕的活動狀態
                document.querySelectorAll('.type-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // 激活當前按鈕
                typeButton.classList.add('active');
                
                // 顯示/隱藏相應的表單字段
                toggleFormFields(option.value);
            });
            
            typeButtons.appendChild(typeButton);
        });
        
        typeGroup.appendChild(typeButtons);
        form.appendChild(typeGroup);
        
        // 時間選擇
        const timeGroup = document.createElement('div');
        timeGroup.className = 'form-row';
        
        // 設置預設時間（現在或記錄時間）
        const defaultTime = feedingData ? new Date(feedingData.timestamp) : new Date();
        const formattedDate = defaultTime.toISOString().substr(0, 10); // YYYY-MM-DD 格式
        const formattedTime = defaultTime.toTimeString().substr(0, 5); // HH:MM 格式
        
        // 日期輸入
        const dateField = BabyTracker.UI.createFormElement('date', {
            id: 'feeding-date',
            name: 'date',
            label: '日期',
            value: formattedDate,
            required: true
        });
        dateField.classList.add('form-group-half');
        timeGroup.appendChild(dateField);
        
        // 時間輸入
        const timeField = BabyTracker.UI.createFormElement('time', {
            id: 'feeding-time',
            name: 'time',
            label: '時間',
            value: formattedTime,
            required: true
        });
        timeField.classList.add('form-group-half');
        timeGroup.appendChild(timeField);
        
        form.appendChild(timeGroup);
        
        // 母乳喂養相關字段
        const breastfeedingGroup = document.createElement('div');
        breastfeedingGroup.className = 'form-section conditional-field breastfeeding-fields';
        breastfeedingGroup.style.display = isBreastfeeding(selectedType) ? 'block' : 'none';
        
        // 持續時間
        const durationLabel = document.createElement('label');
        durationLabel.className = 'section-label';
        durationLabel.textContent = '持續時間';
        breastfeedingGroup.appendChild(durationLabel);
        
        const durationRow = document.createElement('div');
        durationRow.className = 'form-row duration-row';
        
        // 分鐘選擇
        const minutesField = BabyTracker.UI.createFormElement('number', {
            id: 'feeding-minutes',
            name: 'minutes',
            label: '分鐘',
            value: feedingData && feedingData.duration ? Math.floor(feedingData.duration / 60).toString() : '0',
            attributes: {
                min: '0',
                max: '60',
                step: '1'
            }
        });
        minutesField.classList.add('form-group-half');
        durationRow.appendChild(minutesField);
        
        // 秒鐘選擇
        const secondsField = BabyTracker.UI.createFormElement('number', {
            id: 'feeding-seconds',
            name: 'seconds',
            label: '秒鐘',
            value: feedingData && feedingData.duration ? (feedingData.duration % 60).toString() : '0',
            attributes: {
                min: '0',
                max: '59',
                step: '1'
            }
        });
        secondsField.classList.add('form-group-half');
        durationRow.appendChild(secondsField);
        
        breastfeedingGroup.appendChild(durationRow);
        form.appendChild(breastfeedingGroup);
        
        // 瓶餵相關字段
        const bottleGroup = document.createElement('div');
        bottleGroup.className = 'form-section conditional-field bottle-fields';
        bottleGroup.style.display = isBottleFeeding(selectedType) ? 'block' : 'none';
        
        // 數量和單位
        const amountLabel = document.createElement('label');
        amountLabel.className = 'section-label';
        amountLabel.textContent = '餵食量';
        bottleGroup.appendChild(amountLabel);
        
        const amountRow = document.createElement('div');
        amountRow.className = 'form-row amount-row';
        
        // 數量輸入
        const amountField = BabyTracker.UI.createFormElement('number', {
            id: 'feeding-amount',
            name: 'amount',
            label: '數量',
            value: feedingData && feedingData.amount ? feedingData.amount.toString() : '',
            attributes: {
                min: '0',
                step: '0.1'
            }
        });
        amountField.classList.add('form-group-half');
        amountRow.appendChild(amountField);
        
        // 單位選擇
        const unitOptions = [
            { value: FEEDING_UNITS.ML, text: '毫升 (ml)' },
            { value: FEEDING_UNITS.OZ, text: '盎司 (oz)' },
            { value: FEEDING_UNITS.G, text: '克 (g)' },
            { value: FEEDING_UNITS.TBSP, text: '湯匙' },
            { value: FEEDING_UNITS.TSP, text: '茶匙' },
            { value: FEEDING_UNITS.CUP, text: '杯' }
        ];
        
        const unitField = BabyTracker.UI.createFormElement('select', {
            id: 'feeding-unit',
            name: 'unit',
            label: '單位',
            value: feedingData ? feedingData.unit : FEEDING_UNITS.ML,
            options: unitOptions
        });
        unitField.classList.add('form-group-half');
        amountRow.appendChild(unitField);
        
        bottleGroup.appendChild(amountRow);
        form.appendChild(bottleGroup);
        
        // 固體食物相關字段
        const solidFoodGroup = document.createElement('div');
        solidFoodGroup.className = 'form-section conditional-field solid-food-fields';
        solidFoodGroup.style.display = selectedType === FEEDING_TYPES.SOLID_FOOD ? 'block' : 'none';
        
        // 食物項目
        const foodItemsLabel = document.createElement('label');
        foodItemsLabel.className = 'section-label';
        foodItemsLabel.textContent = '食物項目';
        solidFoodGroup.appendChild(foodItemsLabel);
        
        const foodItemsField = document.createElement('div');
        foodItemsField.className = 'food-items-field';
        
        const foodItemsInput = document.createElement('input');
        foodItemsInput.type = 'text';
        foodItemsInput.id = 'food-item-input';
        foodItemsInput.className = 'form-control';
        foodItemsInput.placeholder = '輸入食物項目並按回車添加';
        
        foodItemsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = foodItemsInput.value.trim();
                
                if (value) {
                    addFoodItem(value);
                    foodItemsInput.value = '';
                }
            }
        });
        
        foodItemsField.appendChild(foodItemsInput);
        
        const foodItemsList = document.createElement('div');
        foodItemsList.className = 'food-items-list';
        foodItemsList.id = 'food-items-list';
        
        // 如果編輯模式且有食物項目，添加它們
        if (feedingData && feedingData.foodItems && Array.isArray(feedingData.foodItems)) {
            feedingData.foodItems.forEach(item => {
                const foodChip = createFoodItemChip(item);
                foodItemsList.appendChild(foodChip);
            });
        }
        
        foodItemsField.appendChild(foodItemsList);
        solidFoodGroup.appendChild(foodItemsField);
        form.appendChild(solidFoodGroup);
        
        // 備註
        const notesField = BabyTracker.UI.createFormElement('textarea', {
            id: 'feeding-notes',
            name: 'notes',
            label: '備註',
            value: feedingData && feedingData.notes ? feedingData.notes : '',
            placeholder: '添加關於此次餵食的備註...'
        });
        form.appendChild(notesField);
        
        // 如果是編輯模式，添加ID
        if (isEdit) {
            const idField = document.createElement('input');
            idField.type = 'hidden';
            idField.id = 'feeding-id';
            idField.name = 'id';
            idField.value = feedingData.id;
            form.appendChild(idField);
        }
        
        formContainer.appendChild(form);
        
        return formContainer;
    };
    
    // 添加食物項目
    const addFoodItem = (item) => {
        const list = document.getElementById('food-items-list');
        
        if (list) {
            const foodChip = createFoodItemChip(item);
            list.appendChild(foodChip);
        }
    };
    
    // 創建食物項目標籤
    const createFoodItemChip = (item) => {
        const chip = document.createElement('div');
        chip.className = 'food-item-chip';
        chip.setAttribute('data-value', item);
        
        const chipText = document.createElement('span');
        chipText.className = 'food-item-text';
        chipText.textContent = item;
        chip.appendChild(chipText);
        
        const removeButton = document.createElement('button');
        removeButton.className = 'food-item-remove';
        removeButton.type = 'button';
        removeButton.innerHTML = '×';
        removeButton.setAttribute('aria-label', '移除食物項目');
        
        removeButton.addEventListener('click', () => {
            chip.remove();
        });
        
        chip.appendChild(removeButton);
        
        return chip;
    };
    
    // 判斷是否為母乳喂養
    const isBreastfeeding = (type) => {
        return [
            FEEDING_TYPES.BREAST_LEFT,
            FEEDING_TYPES.BREAST_RIGHT,
            FEEDING_TYPES.BREAST_BOTH
        ].includes(type);
    };
    
    // 判斷是否為瓶餵
    const isBottleFeeding = (type) => {
        return [
            FEEDING_TYPES.FORMULA,
            FEEDING_TYPES.PUMPED_MILK,
            FEEDING_TYPES.WATER
        ].includes(type);
    };
    
    // 切換表單字段顯示/隱藏
    const toggleFormFields = (type) => {
        const breastfeedingFields = document.querySelector('.breastfeeding-fields');
        const bottleFields = document.querySelector('.bottle-fields');
        const solidFoodFields = document.querySelector('.solid-food-fields');
        
        breastfeedingFields.style.display = isBreastfeeding(type) ? 'block' : 'none';
        bottleFields.style.display = isBottleFeeding(type) ? 'block' : 'none';
        solidFoodFields.style.display = type === FEEDING_TYPES.SOLID_FOOD ? 'block' : 'none';
    };
    
    // 收集表單數據
    const collectFormData = () => {
        const form = document.getElementById('feeding-form');
        
        if (!form) return null;
        
        // 獲取基本字段
        const id = form.querySelector('#feeding-id')?.value;
        const date = form.querySelector('#feeding-date').value;
        const time = form.querySelector('#feeding-time').value;
        const type = form.querySelector('.type-button.active').getAttribute('data-type');
        const notes = form.querySelector('#feeding-notes').value;
        
        // 創建時間戳
        const timestamp = new Date(`${date}T${time}`).toISOString();
        
        // 基本數據
        const formData = {
            id,
            childId: activeChildId,
            timestamp,
            type,
            notes
        };
        
        // 根據類型收集特定字段
        if (isBreastfeeding(type)) {
            const minutes = parseInt(form.querySelector('#feeding-minutes').value) || 0;
            const seconds = parseInt(form.querySelector('#feeding-seconds').value) || 0;
            formData.duration = minutes * 60 + seconds;
        } else if (isBottleFeeding(type)) {
            formData.amount = parseFloat(form.querySelector('#feeding-amount').value) || 0;
            formData.unit = form.querySelector('#feeding-unit').value;
        } else if (type === FEEDING_TYPES.SOLID_FOOD) {
            const foodItems = [];
            form.querySelectorAll('.food-item-chip').forEach(chip => {
                foodItems.push(chip.getAttribute('data-value'));
            });
            formData.foodItems = foodItems;
        }
        
        return formData;
    };
    
    // 顯示添加餵食記錄模態框
    const showAddFeedingModal = () => {
        const formContainer = createFeedingForm();
        
        const modal = BabyTracker.UI.createModal({
            title: '添加餵食記錄',
            content: formContainer,
            confirmText: '保存',
            cancelText: '取消',
            onConfirm: () => {
                const formData = collectFormData();
                
                if (formData) {
                    BabyTracker.FeedingModel.createFeeding(formData)
                        .then(() => {
                            BabyTracker.UI.createNotification({
                                type: 'success',
                                title: '成功',
                                message: '餵食記錄已添加'
                            });
                        })
                        .catch(error => {
                            console.error('創建餵食記錄時出錯', error);
                            BabyTracker.UI.createNotification({
                                type: 'danger',
                                title: '錯誤',
                                message: '無法添加餵食記錄，請重試'
                            });
                        });
                }
            }
        });
        
        modal.open();
    };
    
    // 顯示編輯餵食記錄模態框
    const showEditFeedingModal = (feedingId) => {
        BabyTracker.FeedingModel.getFeeding(feedingId)
            .then(feedingData => {
                if (!feedingData) {
                    throw new Error('找不到餵食記錄');
                }
                
                const formContainer = createFeedingForm(feedingData);
                
                const modal = BabyTracker.UI.createModal({
                    title: '編輯餵食記錄',
                    content: formContainer,
                    confirmText: '保存',
                    cancelText: '取消',
                    onConfirm: () => {
                        const formData = collectFormData();
                        
                        if (formData) {
                            BabyTracker.FeedingModel.updateFeeding(formData)
                                .then(() => {
                                    BabyTracker.UI.createNotification({
                                        type: 'success',
                                        title: '成功',
                                        message: '餵食記錄已更新'
                                    });
                                })
                                .catch(error => {
                                    console.error('更新餵食記錄時出錯', error);
                                    BabyTracker.UI.createNotification({
                                        type: 'danger',
                                        title: '錯誤',
                                        message: '無法更新餵食記錄，請重試'
                                    });
                                });
                        }
                    }
                });
                
                modal.open();
            })
            .catch(error => {
                console.error('載入餵食記錄時出錯', error);
                BabyTracker.UI.createNotification({
                    type: 'danger',
                    title: '錯誤',
                    message: '無法載入餵食記錄，請重試'
                });
            });
    };
    
    // 顯示餵食記錄詳細信息模態框
    const showFeedingDetailsModal = (feedingId) => {
        BabyTracker.FeedingModel.getFeeding(feedingId)
            .then(feedingData => {
                if (!feedingData) {
                    throw new Error('找不到餵食記錄');
                }
                
                // 創建詳細信息容器
                const detailsContainer = document.createElement('div');
                detailsContainer.className = 'feeding-details';
                
                // 添加一個小標題指示日期
                const dateTitle = document.createElement('div');
                dateTitle.className = 'details-date';
                dateTitle.textContent = formatDate(new Date(feedingData.timestamp));
                detailsContainer.appendChild(dateTitle);
                
                // 創建信息列表
                const detailsList = document.createElement('dl');
                detailsList.className = 'details-list';
                
                // 添加時間
                addDetailItem(detailsList, '時間', formatTime(new Date(feedingData.timestamp)));
                
                // 添加類型
                addDetailItem(detailsList, '類型', BabyTracker.FeedingModel.getFeedingTypeName(feedingData.type));
                
                // 根據類型添加特定信息
                switch (feedingData.type) {
                    case FEEDING_TYPES.BREAST_LEFT:
                    case FEEDING_TYPES.BREAST_RIGHT:
                    case FEEDING_TYPES.BREAST_BOTH:
                        if (feedingData.duration || feedingData.duration === 0) {
                            addDetailItem(detailsList, '持續時間', BabyTracker.FeedingModel.formatFeedingDuration(feedingData.duration));
                        }
                        break;
                        
                    case FEEDING_TYPES.FORMULA:
                    case FEEDING_TYPES.PUMPED_MILK:
                    case FEEDING_TYPES.WATER:
                        if (feedingData.amount || feedingData.amount === 0) {
                            addDetailItem(detailsList, '數量', `${feedingData.amount} ${BabyTracker.FeedingModel.getFeedingUnitName(feedingData.unit)}`);
                        }
                        break;
                        
                    case FEEDING_TYPES.SOLID_FOOD:
                        if (feedingData.foodItems && feedingData.foodItems.length > 0) {
                            addDetailItem(detailsList, '食物', feedingData.foodItems.join('、'));
                        }
                        break;
                }
                
                // 添加備註
                if (feedingData.notes) {
                    addDetailItem(detailsList, '備註', feedingData.notes);
                }
                
                // 添加創建/更新時間
                if (feedingData.created) {
                    const createdDate = new Date(feedingData.created);
                    addDetailItem(detailsList, '創建時間', formatDateTime(createdDate));
                }
                
                if (feedingData.updated && feedingData.updated !== feedingData.created) {
                    const updatedDate = new Date(feedingData.updated);
                    addDetailItem(detailsList, '更新時間', formatDateTime(updatedDate));
                }
                
                detailsContainer.appendChild(detailsList);
                
                // 按鈕容器
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'details-buttons';
                
                // 編輯按鈕
                const editButton = document.createElement('button');
                editButton.className = 'secondary-button';
                editButton.textContent = '編輯';
                editButton.addEventListener('click', () => {
                    modal.close();
                    showEditFeedingModal(feedingId);
                });
                buttonContainer.appendChild(editButton);
                
                // 刪除按鈕
                const deleteButton = document.createElement('button');
                deleteButton.className = 'danger-button';
                deleteButton.textContent = '刪除';
                deleteButton.addEventListener('click', () => {
                    modal.close();
                    showDeleteConfirmModal(feedingId);
                });
                buttonContainer.appendChild(deleteButton);
                
                detailsContainer.appendChild(buttonContainer);
                
                // 創建並打開模態框
                const modal = BabyTracker.UI.createModal({
                    title: '餵食記錄詳細信息',
                    content: detailsContainer,
                    confirmButton: false,
                    cancelText: '關閉'
                });
                
                modal.open();
            })
            .catch(error => {
                console.error('載入餵食記錄時出錯', error);
                BabyTracker.UI.createNotification({
                    type: 'danger',
                    title: '錯誤',
                    message: '無法載入餵食記錄，請重試'
                });
            });
    };
    
    // 添加詳細信息項目
    const addDetailItem = (list, term, description) => {
        const termElement = document.createElement('dt');
        termElement.textContent = term;
        list.appendChild(termElement);
        
        const descElement = document.createElement('dd');
        descElement.textContent = description;
        list.appendChild(descElement);
    };
    
    // 顯示刪除確認模態框
    const showDeleteConfirmModal = (feedingId) => {
        const confirmContent = document.createElement('div');
        confirmContent.className = 'confirm-dialog';
        confirmContent.innerHTML = '<p>您確定要刪除這條餵食記錄嗎？此操作無法撤銷。</p>';
        
        const modal = BabyTracker.UI.createModal({
            title: '確認刪除',
            content: confirmContent,
            confirmText: '刪除',
            cancelText: '取消',
            onConfirm: () => {
                BabyTracker.FeedingModel.deleteFeeding(feedingId)
                    .then(() => {
                        BabyTracker.UI.createNotification({
                            type: 'success',
                            title: '成功',
                            message: '餵食記錄已刪除'
                        });
                    })
                    .catch(error => {
                        console.error('刪除餵食記錄時出錯', error);
                        BabyTracker.UI.createNotification({
                            type: 'danger',
                            title: '錯誤',
                            message: '無法刪除餵食記錄，請重試'
                        });
                    });
            }
        });
        
        modal.open();
    };
    
    // 渲染無兒童視圖
    const renderNoChildView = () => {
        if (!viewContainer) return;
        
        // 清空容器
        viewContainer.innerHTML = '';
        
        // 創建空狀態
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        
        const emptyIcon = document.createElement('div');
        emptyIcon.className = 'empty-icon';
        emptyIcon.innerHTML = `
            <svg viewBox="0 0 24 24" width="64" height="64">
                <path d="M13 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zM8 8h8c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zm11 3V6c0-1.11-.9-2-2-2h-1V2c0-.55-.45-1-1-1s-1 .45-1 1v2H9V2c0-.55-.45-1-1-1s-1 .45-1 1v2H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h8v-5h5zM6 6h12v2H6V6zm0 12V10h12v4h-5v4H6z"></path>
            </svg>
        `;
        emptyState.appendChild(emptyIcon);
        
        const emptyTitle = document.createElement('h2');
        emptyTitle.className = 'empty-title';
        emptyTitle.textContent = '沒有活動兒童';
        emptyState.appendChild(emptyTitle);
        
        const emptyText = document.createElement('div');
        emptyText.className = 'empty-text';
        emptyText.textContent = '請先創建兒童檔案或選擇一個已有的兒童檔案';
        emptyState.appendChild(emptyText);
        
        const addButton = document.createElement('button');
        addButton.className = 'primary-button';
        addButton.textContent = '創建兒童檔案';
        addButton.addEventListener('click', () => {
            // 切換到兒童檔案視圖
            BabyTracker.App.renderView('childProfile');
        });
        emptyState.appendChild(addButton);
        
        viewContainer.appendChild(emptyState);
    };
    
    // 緩存DOM元素引用
    const cacheElementReferences = () => {
        elements.prevDateButton = document.getElementById('prev-date-button');
        elements.nextDateButton = document.getElementById('next-date-button');
        elements.todayButton = document.getElementById('today-button');
        elements.currentDateDisplay = document.getElementById('current-date-display');
        elements.addFeedingButton = document.getElementById('add-feeding-button');
    };
    
    // 綁定事件
    const bindEvents = () => {
        // 前一天按鈕
        elements.prevDateButton.addEventListener('click', () => {
            navigateDate(-1);
        });
        
        // 下一天按鈕
        elements.nextDateButton.addEventListener('click', () => {
            navigateDate(1);
        });
        
        // 今天按鈕
        elements.todayButton.addEventListener('click', () => {
            navigateToToday();
        });
        
        // 添加餵食記錄按鈕
        elements.addFeedingButton.addEventListener('click', () => {
            showAddFeedingModal();
        });
    };
    
    // 前往前一天或後一天
    const navigateDate = (days) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        
        currentDate = newDate;
        
        // 更新日期顯示
        elements.currentDateDisplay.textContent = formatDate(currentDate);
        
        // 載入新日期數據
        loadData(currentDate)
            .then(() => render())
            .catch(error => console.error('導航到新日期時出錯', error));
    };
    
    // 前往今天
    const navigateToToday = () => {
        currentDate = new Date();
        
        // 更新日期顯示
        elements.currentDateDisplay.textContent = formatDate(currentDate);
        
        // 載入今天數據
        loadData(currentDate)
            .then(() => render())
            .catch(error => console.error('導航到今天時出錯', error));
    };
    
    // 格式化日期
    const formatDate = (date) => {
        return date.toLocaleDateString('zh-TW', DATE_FORMAT_OPTIONS);
    };
    
    // 格式化時間
    const formatTime = (date) => {
        return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    };
    
    // 格式化日期時間
    const formatDateTime = (date) => {
        return date.toLocaleString('zh-TW', { 
            year: 'numeric', 
            month: 'numeric', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
        });
    };
    
    // 公開API
    return {
        init
    };
})();

// 將模塊導出到全局命名空間
window.BabyTracker = BabyTracker;
