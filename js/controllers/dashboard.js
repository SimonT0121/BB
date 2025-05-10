/**
 * 嬰幼兒照顧追蹤應用 - 儀表板控制器
 * 處理應用程序儀表板頁面的顯示和交互
 */

const BabyTracker = window.BabyTracker || {};

/**
 * 儀表板控制器
 */
BabyTracker.DashboardController = (function() {
    // 私有變量
    let viewContainer = null;
    let activeChild = null;
    let dashboardData = null;
    let isInitialized = false;
    let refreshInterval = null;
    
    // 常量
    const REFRESH_INTERVAL = 60000; // 1分鐘更新一次數據
    
    // 初始化控制器
    const init = (container) => {
        if (isInitialized && container === viewContainer) {
            return Promise.resolve();
        }
        
        viewContainer = container;
        isInitialized = true;
        
        // 獲取活動兒童
        activeChild = BabyTracker.App.getActiveChild();
        
        // 訂閱事件
        subscribeToEvents();
        
        // 如果沒有活動兒童，顯示入門引導
        if (!activeChild) {
            return BabyTracker.Storage.getAll(BabyTracker.Storage.STORES.CHILDREN)
                .then(children => {
                    if (!children || children.length === 0) {
                        // 沒有兒童檔案，顯示入門引導
                        renderOnboarding();
                    } else {
                        // 有兒童檔案但沒有選擇活動兒童，顯示選擇兒童視圖
                        renderChildSelector(children);
                    }
                })
                .catch(error => {
                    console.error('檢查兒童檔案時出錯', error);
                    renderError('無法讀取兒童檔案數據');
                });
        }
        
        // 載入儀表板數據
        return loadDashboardData()
            .then(() => {
                // 渲染儀表板
                renderDashboard();
                
                // 設置定期刷新（如果設置了更新週期）
                if (REFRESH_INTERVAL > 0) {
                    clearInterval(refreshInterval);
                    refreshInterval = setInterval(() => {
                        loadDashboardData().then(() => renderDashboard());
                    }, REFRESH_INTERVAL);
                }
            })
            .catch(error => {
                console.error('載入儀表板數據時出錯', error);
                renderError('載入儀表板數據時出錯');
            });
    };
    
    // 訂閱相關事件
    const subscribeToEvents = () => {
        // 活動兒童變更事件
        BabyTracker.EventBus.subscribe(
            BabyTracker.App.EVENTS.ACTIVE_CHILD_CHANGED,
            (child) => {
                activeChild = child;
                
                if (child) {
                    // 重新載入數據
                    loadDashboardData()
                        .then(() => renderDashboard())
                        .catch(error => {
                            console.error('切換兒童後載入儀表板數據時出錯', error);
                            renderError('載入儀表板數據時出錯');
                        });
                } else {
                    // 沒有活動兒童，顯示入門引導
                    BabyTracker.Storage.getAll(BabyTracker.Storage.STORES.CHILDREN)
                        .then(children => {
                            if (!children || children.length === 0) {
                                renderOnboarding();
                            } else {
                                renderChildSelector(children);
                            }
                        })
                        .catch(error => {
                            console.error('檢查兒童檔案時出錯', error);
                            renderError('無法讀取兒童檔案數據');
                        });
                }
            }
        );
        
        // 數據變更事件 (餵食、睡眠、尿布等)
        const dataChangeEvents = [
            BabyTracker.FeedingModel.EVENTS.FEEDING_LIST_CHANGED,
            'sleep:listChanged', // 需要實現相應的模型
            'diaper:listChanged',
            'mood:listChanged',
            'activity:listChanged',
            'growth:listChanged',
            'health:listChanged',
            'milestone:listChanged'
        ];
        
        dataChangeEvents.forEach(event => {
            BabyTracker.EventBus.subscribe(event, () => {
                if (activeChild) {
                    loadDashboardData()
                        .then(() => renderDashboard())
                        .catch(error => console.error('數據變更後載入儀表板數據時出錯', error));
                }
            });
        });
    };
    
    // 載入儀表板數據
    const loadDashboardData = () => {
        if (!activeChild) {
            return Promise.resolve();
        }
        
        // 當前日期
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // 定義需要獲取的數據和相應的 Promise
        const dataPromises = [
            // 兒童信息
            BabyTracker.ChildModel.getChild(activeChild.id),
            
            // 餵食統計
            BabyTracker.FeedingModel.calculateFeedingStats(activeChild.id),
            
            // 睡眠統計 (假設有類似的方法)
            BabyTracker.SleepModel ? 
                BabyTracker.SleepModel.calculateSleepStats(activeChild.id) : 
                Promise.resolve({}),
            
            // 尿布統計
            BabyTracker.DiaperModel ? 
                BabyTracker.DiaperModel.calculateDiaperStats(activeChild.id) : 
                Promise.resolve({}),
            
            // 生長數據
            BabyTracker.GrowthModel ? 
                BabyTracker.GrowthModel.getLatestGrowthRecord(activeChild.id) : 
                Promise.resolve({}),
            
            // 里程碑
            BabyTracker.ChildModel.getNextMilestone(activeChild),
            
            // 最近餵食記錄 (最近 3 條)
            BabyTracker.FeedingModel.getRecentFeedings(activeChild.id, 3),
            
            // 最近睡眠記錄 (最近 3 條)
            BabyTracker.SleepModel ? 
                BabyTracker.SleepModel.getRecentSleep(activeChild.id, 3) : 
                Promise.resolve([]),
            
            // 最近尿布記錄 (最近 3 條)
            BabyTracker.DiaperModel ? 
                BabyTracker.DiaperModel.getRecentDiapers(activeChild.id, 3) : 
                Promise.resolve([])
        ];
        
        // 並行獲取所有數據
        return Promise.all(dataPromises)
            .then(([
                childInfo,
                feedingStats,
                sleepStats,
                diaperStats,
                growthRecord,
                nextMilestone,
                recentFeedings,
                recentSleep,
                recentDiapers
            ]) => {
                // 計算年齡
                const age = BabyTracker.ChildModel.calculateAge(childInfo);
                
                // 更新儀表板數據
                dashboardData = {
                    child: {
                        ...childInfo,
                        age,
                        formattedAge: BabyTracker.ChildModel.formatAge(age)
                    },
                    stats: {
                        feeding: feedingStats,
                        sleep: sleepStats,
                        diaper: diaperStats
                    },
                    growth: growthRecord,
                    nextMilestone,
                    recent: {
                        feeding: recentFeedings,
                        sleep: recentSleep,
                        diaper: recentDiapers
                    }
                };
            });
    };
    
    // 渲染儀表板
    const renderDashboard = () => {
        if (!viewContainer || !activeChild || !dashboardData) return;
        
        // 清空容器
        viewContainer.innerHTML = '';
        
        // 創建儀表板容器
        const dashboardContainer = document.createElement('div');
        dashboardContainer.className = 'dashboard-container';
        
        // 頭部區域 (兒童信息和快速操作)
        const headerSection = createHeaderSection();
        dashboardContainer.appendChild(headerSection);
        
        // 統計摘要區域
        const statsSection = createStatsSection();
        dashboardContainer.appendChild(statsSection);
        
        // 最近活動區域
        const recentSection = createRecentSection();
        dashboardContainer.appendChild(recentSection);
        
        // 里程碑和生長曲線區域
        const developmentSection = createDevelopmentSection();
        dashboardContainer.appendChild(developmentSection);
        
        // 添加到視圖容器
        viewContainer.appendChild(dashboardContainer);
        
        // 綁定事件
        bindEvents();
    };
    
    // 創建頭部區域
    const createHeaderSection = () => {
        const section = document.createElement('section');
        section.className = 'dashboard-header';
        
        // 兒童信息卡片
        const childInfoCard = BabyTracker.UI.createCard({
            title: '',
            classes: 'child-info-card'
        });
        
        const cardContent = childInfoCard.querySelector('.card-content');
        
        // 兒童基本信息
        const childBasicInfo = document.createElement('div');
        childBasicInfo.className = 'child-basic-info';
        
        // 兒童照片
        const photoContainer = document.createElement('div');
        photoContainer.className = 'child-photo';
        
        if (dashboardData.child.photo) {
            const photo = document.createElement('img');
            photo.src = dashboardData.child.photo;
            photo.alt = dashboardData.child.name;
            photoContainer.appendChild(photo);
        } else {
            // 無照片時顯示預設頭像
            const defaultIcon = document.createElement('div');
            defaultIcon.className = 'default-photo';
            defaultIcon.innerHTML = `
                <svg viewBox="0 0 24 24" width="40" height="40">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                </svg>
            `;
            photoContainer.appendChild(defaultIcon);
        }
        
        childBasicInfo.appendChild(photoContainer);
        
        // 兒童姓名和年齡
        const childNameAge = document.createElement('div');
        childNameAge.className = 'child-name-age';
        
        const childName = document.createElement('h2');
        childName.className = 'child-name';
        childName.textContent = dashboardData.child.name;
        childNameAge.appendChild(childName);
        
        const childAge = document.createElement('div');
        childAge.className = 'child-age';
        childAge.textContent = dashboardData.child.formattedAge;
        childNameAge.appendChild(childAge);
        
        childBasicInfo.appendChild(childNameAge);
        
        // 編輯按鈕
        const editButton = document.createElement('button');
        editButton.className = 'icon-button edit-child-button';
        editButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
            </svg>
        `;
        editButton.setAttribute('id', 'edit-child-button');
        editButton.setAttribute('aria-label', '編輯兒童檔案');
        childBasicInfo.appendChild(editButton);
        
        cardContent.appendChild(childBasicInfo);
        
        // 兒童詳細信息
        const childDetails = document.createElement('div');
        childDetails.className = 'child-details';
        
        // 如果有血型，顯示血型
        if (dashboardData.child.bloodType) {
            const bloodType = document.createElement('div');
            bloodType.className = 'child-detail';
            bloodType.innerHTML = `<span class="detail-label">血型：</span><span class="detail-value">${dashboardData.child.bloodType}</span>`;
            childDetails.appendChild(bloodType);
        }
        
        // 如果有過敏信息，顯示過敏信息
        if (dashboardData.child.allergies && dashboardData.child.allergies.length > 0) {
            const allergies = document.createElement('div');
            allergies.className = 'child-detail';
            allergies.innerHTML = `<span class="detail-label">過敏：</span><span class="detail-value">${dashboardData.child.allergies.join('、')}</span>`;
            childDetails.appendChild(allergies);
        }
        
        cardContent.appendChild(childDetails);
        
        section.appendChild(childInfoCard);
        
        // 快速操作按鈕
        const quickActions = document.createElement('div');
        quickActions.className = 'quick-actions';
        
        // 添加常用操作按鈕
        const actionButtons = [
            { 
                id: 'quick-feeding-button',
                icon: 'M11 8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h2c.55 0 1-.45 1-1s-.45-1-1-1h-2V4c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1z',
                text: '餵食',
                view: BabyTracker.App.VIEWS.FEEDING,
                params: { showAddModal: true }
            },
            { 
                id: 'quick-sleep-button',
                icon: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z',
                text: '睡眠',
                view: BabyTracker.App.VIEWS.SLEEP,
                params: { showAddModal: true }
            },
            { 
                id: 'quick-diaper-button',
                icon: 'M18.5 2h-13C4.67 2 4 2.67 4 3.5v17c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5z',
                text: '尿布',
                view: BabyTracker.App.VIEWS.DIAPER,
                params: { showAddModal: true }
            },
            { 
                id: 'quick-growth-button',
                icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
                text: '生長',
                view: BabyTracker.App.VIEWS.GROWTH,
                params: { showAddModal: true }
            }
        ];
        
        actionButtons.forEach(button => {
            const actionButton = document.createElement('button');
            actionButton.className = 'quick-action-button';
            actionButton.id = button.id;
            
            actionButton.innerHTML = `
                <div class="action-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path d="${button.icon}"></path>
                    </svg>
                </div>
                <span class="action-text">${button.text}</span>
            `;
            
            quickActions.appendChild(actionButton);
        });
        
        section.appendChild(quickActions);
        
        return section;
    };
    
    // 創建統計摘要區域
    const createStatsSection = () => {
        const section = document.createElement('section');
        section.className = 'stats-section';
        
        // 創建統計卡片
        const statsCard = BabyTracker.UI.createCard({
            title: '今日概覽',
            icon: 'M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-8.99h-8.97z',
            classes: 'stats-card'
        });
        
        const cardContent = statsCard.querySelector('.card-content');
        
        // 創建統計網格
        const statsGrid = document.createElement('div');
        statsGrid.className = 'stats-grid-3';
        
        // 餵食統計
        const feedingStats = dashboardData.stats.feeding;
        
        const feedingSummary = BabyTracker.UI.createDataSummary({
            label: '餵食',
            value: feedingStats.total.toString(),
            unit: '次',
            icon: 'M11 8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h2c.55 0 1-.45 1-1s-.45-1-1-1h-2V4c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1z'
        });
        statsGrid.appendChild(feedingSummary);
        
        // 睡眠統計
        const sleepStats = dashboardData.stats.sleep;
        
        const sleepDuration = sleepStats && sleepStats.totalDuration ? 
            formatDuration(sleepStats.totalDuration) : '0小時';
        
        const sleepSummary = BabyTracker.UI.createDataSummary({
            label: '睡眠',
            value: sleepDuration,
            icon: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z'
        });
        statsGrid.appendChild(sleepSummary);
        
        // 尿布統計
        const diaperStats = dashboardData.stats.diaper;
        
        const diaperCount = diaperStats && diaperStats.total ? 
            diaperStats.total : 0;
        
        const diaperSummary = BabyTracker.UI.createDataSummary({
            label: '尿布更換',
            value: diaperCount.toString(),
            unit: '次',
            icon: 'M18.5 2h-13C4.67 2 4 2.67 4 3.5v17c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5z'
        });
        statsGrid.appendChild(diaperSummary);
        
        cardContent.appendChild(statsGrid);
        
        // 如果有餵食預測，添加下次餵食時間
        if (feedingStats && feedingStats.nextPredicted) {
            const nextFeeding = document.createElement('div');
            nextFeeding.className = 'next-feeding';
            
            const nextFeedingIcon = document.createElement('span');
            nextFeedingIcon.className = 'next-feeding-icon';
            nextFeedingIcon.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path>
                    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path>
                </svg>
            `;
            
            const nextFeedingText = document.createElement('span');
            nextFeedingText.className = 'next-feeding-text';
            nextFeedingText.textContent = `預計下次餵食: ${formatTime(new Date(feedingStats.nextPredicted))}`;
            
            nextFeeding.appendChild(nextFeedingIcon);
            nextFeeding.appendChild(nextFeedingText);
            
            cardContent.appendChild(nextFeeding);
        }
        
        section.appendChild(statsCard);
        
        return section;
    };
    
    // 創建最近活動區域
    const createRecentSection = () => {
        const section = document.createElement('section');
        section.className = 'recent-section';
        
        // 創建標籤頁
        const recentTabs = [
            {
                id: 'recent-feeding',
                title: '餵食記錄',
                content: createRecentFeedingTab(),
                active: true
            },
            {
                id: 'recent-sleep',
                title: '睡眠記錄',
                content: createRecentSleepTab()
            },
            {
                id: 'recent-diaper',
                title: '尿布記錄',
                content: createRecentDiaperTab()
            }
        ];
        
        const tabsElement = BabyTracker.UI.createTabs({
            tabs: recentTabs
        });
        
        tabsElement.className = 'recent-tabs';
        
        section.appendChild(tabsElement);
        
        return section;
    };
    
    // 創建最近餵食標籤內容
    const createRecentFeedingTab = () => {
        const tabContent = document.createElement('div');
        tabContent.className = 'recent-tab-content';
        
        // 獲取最近餵食記錄
        const recentFeedings = dashboardData.recent.feeding || [];
        
        if (recentFeedings.length === 0) {
            // 無記錄時顯示空狀態
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-tab-state';
            emptyState.textContent = '今天還沒有餵食記錄';
            tabContent.appendChild(emptyState);
        } else {
            // 創建列表
            const feedingList = document.createElement('div');
            feedingList.className = 'recent-list';
            
            // 添加記錄項
            recentFeedings.forEach(feeding => {
                const item = document.createElement('div');
                item.className = 'recent-item';
                item.setAttribute('data-id', feeding.id);
                
                // 時間
                const time = document.createElement('div');
                time.className = 'item-time';
                time.textContent = formatTime(new Date(feeding.timestamp));
                item.appendChild(time);
                
                // 內容
                const content = document.createElement('div');
                content.className = 'item-content';
                
                // 類型
                const type = document.createElement('div');
                type.className = 'item-type';
                type.textContent = BabyTracker.FeedingModel.getFeedingTypeName(feeding.type);
                content.appendChild(type);
                
                // 詳細信息
                const details = document.createElement('div');
                details.className = 'item-details';
                
                switch (feeding.type) {
                    case BabyTracker.FeedingModel.FEEDING_TYPES.BREAST_LEFT:
                    case BabyTracker.FeedingModel.FEEDING_TYPES.BREAST_RIGHT:
                    case BabyTracker.FeedingModel.FEEDING_TYPES.BREAST_BOTH:
                        if (feeding.duration) {
                            details.textContent = BabyTracker.FeedingModel.formatFeedingDuration(feeding.duration);
                        }
                        break;
                        
                    case BabyTracker.FeedingModel.FEEDING_TYPES.FORMULA:
                    case BabyTracker.FeedingModel.FEEDING_TYPES.PUMPED_MILK:
                    case BabyTracker.FeedingModel.FEEDING_TYPES.WATER:
                        if (feeding.amount) {
                            details.textContent = `${feeding.amount} ${BabyTracker.FeedingModel.getFeedingUnitName(feeding.unit)}`;
                        }
                        break;
                        
                    case BabyTracker.FeedingModel.FEEDING_TYPES.SOLID_FOOD:
                        if (feeding.foodItems && feeding.foodItems.length > 0) {
                            details.textContent = feeding.foodItems.join('、');
                        }
                        break;
                }
                
                content.appendChild(details);
                item.appendChild(content);
                
                // 箭頭
                const arrow = document.createElement('div');
                arrow.className = 'item-arrow';
                arrow.innerHTML = `
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path>
                    </svg>
                `;
                item.appendChild(arrow);
                
                // 添加點擊事件
                item.addEventListener('click', () => {
                    // 導航到詳細信息頁面
                    BabyTracker.App.renderView(BabyTracker.App.VIEWS.FEEDING, { showDetailsModal: feeding.id });
                });
                
                feedingList.appendChild(item);
            });
            
            tabContent.appendChild(feedingList);
        }
        
        // 添加查看全部按鈕
        const viewAllButton = document.createElement('button');
        viewAllButton.className = 'view-all-button';
        viewAllButton.innerHTML = `
            查看全部
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path>
            </svg>
        `;
        
        viewAllButton.addEventListener('click', () => {
            BabyTracker.App.renderView(BabyTracker.App.VIEWS.FEEDING);
        });
        
        tabContent.appendChild(viewAllButton);
        
        return tabContent;
    };
    
    // 創建最近睡眠標籤內容
    const createRecentSleepTab = () => {
        const tabContent = document.createElement('div');
        tabContent.className = 'recent-tab-content';
        
        // 獲取最近睡眠記錄
        const recentSleep = dashboardData.recent.sleep || [];
        
        if (recentSleep.length === 0) {
            // 無記錄時顯示空狀態
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-tab-state';
            emptyState.textContent = '今天還沒有睡眠記錄';
            tabContent.appendChild(emptyState);
        } else {
            // 創建列表 (實現類似於餵食的列表)
            const sleepList = document.createElement('div');
            sleepList.className = 'recent-list';
            
            // TODO: 添加睡眠記錄項 (需要 SleepModel 實現)
            // 這裡放置占位符
            const placeholderItem = document.createElement('div');
            placeholderItem.className = 'recent-item placeholder';
            placeholderItem.textContent = '睡眠記錄將顯示在這裡';
            sleepList.appendChild(placeholderItem);
            
            tabContent.appendChild(sleepList);
        }
        
        // 添加查看全部按鈕
        const viewAllButton = document.createElement('button');
        viewAllButton.className = 'view-all-button';
        viewAllButton.innerHTML = `
            查看全部
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path>
            </svg>
        `;
        
        viewAllButton.addEventListener('click', () => {
            BabyTracker.App.renderView(BabyTracker.App.VIEWS.SLEEP);
        });
        
        tabContent.appendChild(viewAllButton);
        
        return tabContent;
    };
    
    // 創建最近尿布標籤內容
    const createRecentDiaperTab = () => {
        const tabContent = document.createElement('div');
        tabContent.className = 'recent-tab-content';
        
        // 獲取最近尿布記錄
        const recentDiapers = dashboardData.recent.diaper || [];
        
        if (recentDiapers.length === 0) {
            // 無記錄時顯示空狀態
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-tab-state';
            emptyState.textContent = '今天還沒有尿布記錄';
            tabContent.appendChild(emptyState);
        } else {
            // 創建列表 (實現類似於餵食的列表)
            const diaperList = document.createElement('div');
            diaperList.className = 'recent-list';
            
            // TODO: 添加尿布記錄項 (需要 DiaperModel 實現)
            // 這裡放置占位符
            const placeholderItem = document.createElement('div');
            placeholderItem.className = 'recent-item placeholder';
            placeholderItem.textContent = '尿布記錄將顯示在這裡';
            diaperList.appendChild(placeholderItem);
            
            tabContent.appendChild(diaperList);
        }
        
        // 添加查看全部按鈕
        const viewAllButton = document.createElement('button');
        viewAllButton.className = 'view-all-button';
        viewAllButton.innerHTML = `
            查看全部
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path>
            </svg>
        `;
        
        viewAllButton.addEventListener('click', () => {
            BabyTracker.App.renderView(BabyTracker.App.VIEWS.DIAPER);
        });
        
        tabContent.appendChild(viewAllButton);
        
        return tabContent;
    };
    
    // 創建里程碑和生長曲線區域
    const createDevelopmentSection = () => {
        const section = document.createElement('section');
        section.className = 'development-section';
        
        // 創建兩列布局
        const twoColumns = document.createElement('div');
        twoColumns.className = 'two-columns';
        
        // 里程碑卡片
        const milestoneCard = BabyTracker.UI.createCard({
            title: '發展里程碑',
            icon: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM7 10.82C5.84 10.4 5 9.3 5 8V7h2v3.82zM19 8c0 1.3-.84 2.4-2 2.82V7h2v1z',
            color: 'milestone-color',
            classes: 'milestone-card'
        });
        
        const milestoneContent = milestoneCard.querySelector('.card-content');
        
        // 添加下一個里程碑信息
        if (dashboardData.nextMilestone) {
            const milestone = dashboardData.nextMilestone;
            
            const milestoneItem = document.createElement('div');
            milestoneItem.className = 'milestone-item';
            
            const milestoneName = document.createElement('div');
            milestoneName.className = 'milestone-name';
            milestoneName.textContent = milestone.name;
            milestoneItem.appendChild(milestoneName);
            
            const milestoneAge = document.createElement('div');
            milestoneAge.className = 'milestone-age';
            
            // 計算預期年齡範圍
            const minAgeMonths = Math.floor(milestone.expectedAgeMin);
            const maxAgeMonths = Math.floor(milestone.expectedAgeMax);
            
            let ageRangeText = '';
            
            if (minAgeMonths === maxAgeMonths) {
                ageRangeText = `大約 ${minAgeMonths} 個月`;
            } else {
                ageRangeText = `${minAgeMonths}-${maxAgeMonths} 個月`;
            }
            
            milestoneAge.textContent = `預期年齡: ${ageRangeText}`;
            milestoneItem.appendChild(milestoneAge);
            
            // 進度條
            const progressContainer = document.createElement('div');
            progressContainer.className = 'milestone-progress-container';
            
            // 計算進度
            const childAge = dashboardData.child.age.totalDays / 30; // 轉換為月
            const minAge = milestone.expectedAgeMin;
            const maxAge = milestone.expectedAgeMax;
            
            let progress = 0;
            
            if (childAge >= minAge) {
                // 已經達到最小年齡
                if (childAge >= maxAge) {
                    // 已經超過最大年齡
                    progress = 100;
                } else {
                    // 在年齡範圍內
                    progress = ((childAge - minAge) / (maxAge - minAge)) * 100;
                }
            }
            
            // 確保進度在 0-100 之間
            progress = Math.max(0, Math.min(100, progress));
            
            const progressBar = document.createElement('div');
            progressBar.className = 'milestone-progress-bar';
            progressBar.style.width = `${progress}%`;
            progressContainer.appendChild(progressBar);
            
            milestoneItem.appendChild(progressContainer);
            
            milestoneContent.appendChild(milestoneItem);
        } else {
            // 無下一個里程碑
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-milestone';
            emptyState.textContent = '沒有未完成的里程碑';
            milestoneContent.appendChild(emptyState);
        }
        
        // 添加查看全部按鈕
        const viewAllMilestones = document.createElement('button');
        viewAllMilestones.className = 'view-all-button';
        viewAllMilestones.innerHTML = `
            查看全部里程碑
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path>
            </svg>
        `;
        
        viewAllMilestones.addEventListener('click', () => {
            BabyTracker.App.renderView(BabyTracker.App.VIEWS.MILESTONE);
        });
        
        milestoneContent.appendChild(viewAllMilestones);
        
        // 生長數據卡片
        const growthCard = BabyTracker.UI.createCard({
            title: '生長數據',
            icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
            color: 'growth-color',
            classes: 'growth-card'
        });
        
        const growthContent = growthCard.querySelector('.card-content');
        
        // 添加最近的生長數據
        if (dashboardData.growth && Object.keys(dashboardData.growth).length > 0) {
            const growth = dashboardData.growth;
            
            const growthData = document.createElement('div');
            growthData.className = 'growth-data';
            
            // 體重
            if (growth.weight) {
                const weightItem = document.createElement('div');
                weightItem.className = 'growth-item';
                
                const weightLabel = document.createElement('div');
                weightLabel.className = 'growth-label';
                weightLabel.textContent = '體重';
                weightItem.appendChild(weightLabel);
                
                const weightValue = document.createElement('div');
                weightValue.className = 'growth-value';
                weightValue.textContent = `${growth.weight} kg`;
                weightItem.appendChild(weightValue);
                
                // 百分位數 (如果有)
                if (growth.weightPercentile) {
                    const percentile = document.createElement('div');
                    percentile.className = 'growth-percentile';
                    percentile.textContent = `${growth.weightPercentile}%`;
                    weightItem.appendChild(percentile);
                }
                
                growthData.appendChild(weightItem);
            }
            
            // 身高/身長
            if (growth.height) {
                const heightItem = document.createElement('div');
                heightItem.className = 'growth-item';
                
                const heightLabel = document.createElement('div');
                heightLabel.className = 'growth-label';
                heightLabel.textContent = '身高';
                heightItem.appendChild(heightLabel);
                
                const heightValue = document.createElement('div');
                heightValue.className = 'growth-value';
                heightValue.textContent = `${growth.height} cm`;
                heightItem.appendChild(heightValue);
                
                // 百分位數 (如果有)
                if (growth.heightPercentile) {
                    const percentile = document.createElement('div');
                    percentile.className = 'growth-percentile';
                    percentile.textContent = `${growth.heightPercentile}%`;
                    heightItem.appendChild(percentile);
                }
                
                growthData.appendChild(heightItem);
            }
            
            // 頭圍
            if (growth.headCircumference) {
                const headItem = document.createElement('div');
                headItem.className = 'growth-item';
                
                const headLabel = document.createElement('div');
                headLabel.className = 'growth-label';
                headLabel.textContent = '頭圍';
                headItem.appendChild(headLabel);
                
                const headValue = document.createElement('div');
                headValue.className = 'growth-value';
                headValue.textContent = `${growth.headCircumference} cm`;
                headItem.appendChild(headValue);
                
                // 百分位數 (如果有)
                if (growth.headPercentile) {
                    const percentile = document.createElement('div');
                    percentile.className = 'growth-percentile';
                    percentile.textContent = `${growth.headPercentile}%`;
                    headItem.appendChild(percentile);
                }
                
                growthData.appendChild(headItem);
            }
            
            growthContent.appendChild(growthData);
            
            // 記錄日期
            if (growth.date) {
                const dateInfo = document.createElement('div');
                dateInfo.className = 'growth-date';
                dateInfo.textContent = `記錄於 ${formatDate(new Date(growth.date))}`;
                growthContent.appendChild(dateInfo);
            }
        } else {
            // 無生長數據
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-growth';
            emptyState.textContent = '尚未添加生長數據';
            growthContent.appendChild(emptyState);
        }
        
        // 添加記錄按鈕
        const addGrowthButton = document.createElement('button');
        addGrowthButton.className = 'primary-button add-growth-button';
        addGrowthButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
            </svg>
            <span>記錄生長數據</span>
        `;
        
        addGrowthButton.addEventListener('click', () => {
            BabyTracker.App.renderView(BabyTracker.App.VIEWS.GROWTH, { showAddModal: true });
        });
        
        growthContent.appendChild(addGrowthButton);
        
        // 添加到兩列布局
        twoColumns.appendChild(milestoneCard);
        twoColumns.appendChild(growthCard);
        
        section.appendChild(twoColumns);
        
        return section;
    };
    
    // 渲染入門引導
    const renderOnboarding = () => {
        if (!viewContainer) return;
        
        // 清空容器
        viewContainer.innerHTML = '';
        
        // 創建入門引導
        const onboarding = document.createElement('div');
        onboarding.className = 'onboarding';
        
        // 歡迎圖標
        const welcomeIcon = document.createElement('div');
        welcomeIcon.className = 'welcome-icon';
        welcomeIcon.innerHTML = `
            <svg viewBox="0 0 24 24" width="80" height="80">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
            </svg>
        `;
        onboarding.appendChild(welcomeIcon);
        
        // 歡迎標題
        const welcomeTitle = document.createElement('h1');
        welcomeTitle.className = 'welcome-title';
        welcomeTitle.textContent = '歡迎使用寶寶成長記錄';
        onboarding.appendChild(welcomeTitle);
        
        // 歡迎文本
        const welcomeText = document.createElement('p');
        welcomeText.className = 'welcome-text';
        welcomeText.textContent = '首先，讓我們創建您的第一個寶寶檔案。';
        onboarding.appendChild(welcomeText);
        
        // 創建寶寶檔案按鈕
        const createButton = document.createElement('button');
        createButton.className = 'primary-button create-child-button';
        createButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
            </svg>
            <span>創建寶寶檔案</span>
        `;
        
        createButton.addEventListener('click', () => {
            // 導航到兒童檔案視圖並傳遞創建參數
            BabyTracker.App.renderView(BabyTracker.App.VIEWS.CHILD_PROFILE, { create: true });
        });
        
        onboarding.appendChild(createButton);
        
        // 添加到視圖容器
        viewContainer.appendChild(onboarding);
    };
    
    // 渲染兒童選擇器
    const renderChildSelector = (children) => {
        if (!viewContainer) return;
        
        // 清空容器
        viewContainer.innerHTML = '';
        
        // 創建選擇器
        const selector = document.createElement('div');
        selector.className = 'child-selector-view';
        
        // 選擇器標題
        const selectorTitle = document.createElement('h2');
        selectorTitle.className = 'selector-title';
        selectorTitle.textContent = '選擇一個寶寶檔案';
        selector.appendChild(selectorTitle);
        
        // 選擇器文本
        const selectorText = document.createElement('p');
        selectorText.className = 'selector-text';
        selectorText.textContent = '您有多個寶寶檔案，請選擇一個開始使用：';
        selector.appendChild(selectorText);
        
        // 兒童列表
        const childList = document.createElement('div');
        childList.className = 'child-list';
        
        // 添加兒童項
        children.forEach(child => {
            const childItem = document.createElement('div');
            childItem.className = 'child-list-item';
            childItem.setAttribute('data-id', child.id);
            
            // 照片/頭像
            const photoContainer = document.createElement('div');
            photoContainer.className = 'child-list-photo';
            
            if (child.photo) {
                const photo = document.createElement('img');
                photo.src = child.photo;
                photo.alt = child.name;
                photoContainer.appendChild(photo);
            } else {
                // 無照片時顯示預設頭像
                const defaultIcon = document.createElement('div');
                defaultIcon.className = 'default-photo';
                defaultIcon.innerHTML = `
                    <svg viewBox="0 0 24 24" width="32" height="32">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                    </svg>
                `;
                photoContainer.appendChild(defaultIcon);
            }
            
            childItem.appendChild(photoContainer);
            
            // 詳細信息
            const childDetails = document.createElement('div');
            childDetails.className = 'child-list-details';
            
            // 姓名
            const childName = document.createElement('div');
            childName.className = 'child-list-name';
            childName.textContent = child.name;
            childDetails.appendChild(childName);
            
            // 年齡
            if (child.birthDate) {
                const age = BabyTracker.ChildModel.calculateAge(child);
                const formattedAge = BabyTracker.ChildModel.formatAge(age);
                
                const childAge = document.createElement('div');
                childAge.className = 'child-list-age';
                childAge.textContent = formattedAge;
                childDetails.appendChild(childAge);
            }
            
            childItem.appendChild(childDetails);
            
            // 選擇按鈕
            const selectButton = document.createElement('button');
            selectButton.className = 'secondary-button select-child-button';
            selectButton.textContent = '選擇';
            
            selectButton.addEventListener('click', () => {
                // 設置活動兒童
                BabyTracker.App.setActiveChild(child.id)
                    .then(() => {
                        // 重新載入儀表板
                        loadDashboardData()
                            .then(() => renderDashboard())
                            .catch(error => console.error('選擇兒童後載入數據時出錯', error));
                    })
                    .catch(error => console.error('設置活動兒童時出錯', error));
            });
            
            childItem.appendChild(selectButton);
            
            childList.appendChild(childItem);
        });
        
        selector.appendChild(childList);
        
        // 添加新兒童按鈕
        const addNewButton = document.createElement('button');
        addNewButton.className = 'primary-button add-new-child-button';
        addNewButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
            </svg>
            <span>添加新的寶寶檔案</span>
        `;
        
        addNewButton.addEventListener('click', () => {
            // 導航到兒童檔案視圖並傳遞創建參數
            BabyTracker.App.renderView(BabyTracker.App.VIEWS.CHILD_PROFILE, { create: true });
        });
        
        selector.appendChild(addNewButton);
        
        // 添加到視圖容器
        viewContainer.appendChild(selector);
    };
    
    // 渲染錯誤信息
    const renderError = (message) => {
        if (!viewContainer) return;
        
        // 清空容器
        viewContainer.innerHTML = '';
        
        // 創建錯誤視圖
        const errorView = document.createElement('div');
        errorView.className = 'error-view';
        
        // 錯誤圖標
        const errorIcon = document.createElement('div');
        errorIcon.className = 'error-icon';
        errorIcon.innerHTML = `
            <svg viewBox="0 0 24 24" width="64" height="64">
                <path d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path>
            </svg>
        `;
        errorView.appendChild(errorIcon);
        
        // 錯誤標題
        const errorTitle = document.createElement('h2');
        errorTitle.className = 'error-title';
        errorTitle.textContent = '出了點問題';
        errorView.appendChild(errorTitle);
        
        // 錯誤消息
        const errorMessage = document.createElement('p');
        errorMessage.className = 'error-message';
        errorMessage.textContent = message || '無法載入儀表板';
        errorView.appendChild(errorMessage);
        
        // 重試按鈕
        const retryButton = document.createElement('button');
        retryButton.className = 'primary-button retry-button';
        retryButton.textContent = '重試';
        
        retryButton.addEventListener('click', () => {
            // 重新初始化儀表板
            init(viewContainer);
        });
        
        errorView.appendChild(retryButton);
        
        // 添加到視圖容器
        viewContainer.appendChild(errorView);
    };
    
    // 綁定事件
    const bindEvents = () => {
        // 編輯兒童按鈕
        const editChildButton = document.getElementById('edit-child-button');
        
        if (editChildButton) {
            editChildButton.addEventListener('click', () => {
                // 導航到兒童檔案視圖並傳遞編輯參數
                BabyTracker.App.renderView(BabyTracker.App.VIEWS.CHILD_PROFILE, { edit: activeChild.id });
            });
        }
        
        // 快速操作按鈕
        const actionButtons = [
            {
                id: 'quick-feeding-button',
                view: BabyTracker.App.VIEWS.FEEDING,
                params: { showAddModal: true }
            },
            {
                id: 'quick-sleep-button',
                view: BabyTracker.App.VIEWS.SLEEP,
                params: { showAddModal: true }
            },
            {
                id: 'quick-diaper-button',
                view: BabyTracker.App.VIEWS.DIAPER,
                params: { showAddModal: true }
            },
            {
                id: 'quick-growth-button',
                view: BabyTracker.App.VIEWS.GROWTH,
                params: { showAddModal: true }
            }
        ];
        
        actionButtons.forEach(button => {
            const buttonElement = document.getElementById(button.id);
            
            if (buttonElement) {
                buttonElement.addEventListener('click', () => {
                    // 導航到相應視圖
                    BabyTracker.App.renderView(button.view, button.params);
                });
            }
        });
    };
    
    // 格式化日期
    const formatDate = (date) => {
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    // 格式化時間
    const formatTime = (date) => {
        return date.toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    // 格式化持續時間
    const formatDuration = (durationMinutes) => {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        
        if (hours > 0) {
            return `${hours}小時${minutes > 0 ? ` ${minutes}分鐘` : ''}`;
        } else {
            return `${minutes}分鐘`;
        }
    };
    
    // 清理資源
    const cleanup = () => {
        // 清除定時器
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    };
    
    // 公開API
    return {
        init,
        cleanup
    };
})();

// 將模塊導出到全局命名空間
window.BabyTracker = BabyTracker;
