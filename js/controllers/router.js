/**
 * 嬰幼兒照顧追蹤應用 - 路由控制器
 * 處理應用程序的視圖切換和導航
 */

const BabyTracker = window.BabyTracker || {};

/**
 * 路由控制器
 */
BabyTracker.RouterController = (function() {
    // 私有變量
    let currentView = null;
    let previousView = null;
    let viewContainer = null;
    let isInitialized = false;
    
    // 視圖控制器映射
    const viewControllers = {
        [BabyTracker.App.VIEWS.DASHBOARD]: BabyTracker.DashboardController,
        [BabyTracker.App.VIEWS.CHILD_PROFILE]: BabyTracker.ChildProfileController,
        [BabyTracker.App.VIEWS.FEEDING]: BabyTracker.FeedingController,
        [BabyTracker.App.VIEWS.SLEEP]: BabyTracker.SleepController,
        [BabyTracker.App.VIEWS.DIAPER]: BabyTracker.DiaperController,
        [BabyTracker.App.VIEWS.MOOD]: BabyTracker.MoodController,
        [BabyTracker.App.VIEWS.ACTIVITY]: BabyTracker.ActivityController,
        [BabyTracker.App.VIEWS.GROWTH]: BabyTracker.GrowthController,
        [BabyTracker.App.VIEWS.HEALTH]: BabyTracker.HealthController,
        [BabyTracker.App.VIEWS.MILESTONE]: BabyTracker.MilestoneController,
        [BabyTracker.App.VIEWS.SETTINGS]: BabyTracker.SettingsController,
        'onboarding': BabyTracker.OnboardingController
    };
    
    // 初始化路由控制器
    const init = () => {
        if (isInitialized) {
            return;
        }
        
        // 獲取視圖容器
        viewContainer = document.getElementById('view-container');
        
        if (!viewContainer) {
            console.error('找不到視圖容器元素');
            return;
        }
        
        // 訂閱視圖變更事件
        BabyTracker.EventBus.subscribe(
            BabyTracker.App.EVENTS.VIEW_CHANGED,
            handleViewChange
        );
        
        // 綁定導航菜單事件
        bindNavigationEvents();
        
        // 處理瀏覽器歷史 popstate 事件
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.view) {
                navigateToView(event.state.view, event.state.params, true);
            }
        });
        
        // 從 URL 獲取初始視圖
        const initialView = getViewFromUrl() || BabyTracker.App.VIEWS.DASHBOARD;
        const params = getParamsFromUrl();
        
        // 設置初始視圖
        navigateToView(initialView, params);
        
        isInitialized = true;
    };
    
    // 處理視圖變更
    const handleViewChange = ({ viewName, params }) => {
        // 導航到新視圖
        navigateToView(viewName, params);
    };
    
    // 導航到指定視圖
    const navigateToView = (viewName, params = {}, fromPopState = false) => {
        // 檢查視圖控制器是否存在
        if (!viewControllers[viewName]) {
            console.error(`視圖控制器不存在: ${viewName}`);
            viewName = BabyTracker.App.VIEWS.DASHBOARD;
        }
        
        // 保存前一個視圖
        previousView = currentView;
        currentView = viewName;
        
        // 更新活動導航項
        updateActiveNavItem(viewName);
        
        // 更新 URL (如果不是由 popstate 事件觸發)
        if (!fromPopState) {
            updateUrl(viewName, params);
        }
        
        // 清空視圖容器
        viewContainer.innerHTML = '';
        
        // 加載視圖
        const viewController = viewControllers[viewName];
        
        if (viewController && typeof viewController.init === 'function') {
            // 創建新的視圖容器
            const newViewContainer = document.createElement('div');
            newViewContainer.className = `view view-${viewName}`;
            viewContainer.appendChild(newViewContainer);
            
            // 初始化視圖控制器
            viewController.init(newViewContainer, params);
        } else {
            // 顯示錯誤信息
            viewContainer.innerHTML = `
                <div class="error-view">
                    <h2>無法載入視圖</h2>
                    <p>視圖控制器 "${viewName}" 未實現或初始化方法不存在。</p>
                    <button class="primary-button" id="go-home-button">返回首頁</button>
                </div>
            `;
            
            // 綁定返回首頁按鈕
            document.getElementById('go-home-button').addEventListener('click', () => {
                navigateToView(BabyTracker.App.VIEWS.DASHBOARD);
            });
        }
    };
    
    // 綁定導航菜單事件
    const bindNavigationEvents = () => {
        // 側邊欄導航項
        document.querySelectorAll('.nav-link').forEach(navLink => {
            navLink.addEventListener('click', (event) => {
                event.preventDefault();
                
                const viewName = navLink.getAttribute('data-view');
                navigateToView(viewName);
            });
        });
        
        // 移動端底部導航項
        document.querySelectorAll('.mobile-nav-item').forEach(navItem => {
            navItem.addEventListener('click', (event) => {
                event.preventDefault();
                
                const viewName = navItem.getAttribute('data-view');
                
                // 處理"更多"按鈕
                if (viewName === 'more') {
                    toggleMobileMoreMenu();
                } else {
                    navigateToView(viewName);
                }
            });
        });
        
        // 側邊欄切換按鈕
        const menuToggle = document.getElementById('menu-toggle');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleSidebar);
        }
        
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', toggleSidebar);
        }
        
        // 添加兒童按鈕
        const addChildButton = document.getElementById('add-child-button');
        
        if (addChildButton) {
            addChildButton.addEventListener('click', () => {
                // 導航到兒童檔案視圖並傳遞創建參數
                navigateToView(BabyTracker.App.VIEWS.CHILD_PROFILE, { create: true });
            });
        }
        
        // 快速添加按鈕
        const quickAddButton = document.getElementById('quick-add-button');
        
        if (quickAddButton) {
            quickAddButton.addEventListener('click', showQuickAddMenu);
        }
    };
    
    // 切換側邊欄顯示/隱藏
    const toggleSidebar = () => {
        document.body.classList.toggle('sidebar-open');
    };
    
    // 切換移動端更多菜單
    const toggleMobileMoreMenu = () => {
        // 實現移動端更多菜單邏輯
        const moreMenu = document.querySelector('.mobile-more-menu');
        
        if (!moreMenu) {
            // 創建更多菜單
            createMobileMoreMenu();
        } else {
            // 切換菜單顯示/隱藏
            moreMenu.classList.toggle('visible');
        }
    };
    
    // 創建移動端更多菜單
    const createMobileMoreMenu = () => {
        // 創建更多菜單容器
        const moreMenu = document.createElement('div');
        moreMenu.className = 'mobile-more-menu visible';
        
        // 創建菜單項
        const menuItems = [
            { view: BabyTracker.App.VIEWS.MOOD, icon: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z', text: '情緒' },
            { view: BabyTracker.App.VIEWS.ACTIVITY, icon: 'M13.5 5.5c0 .83.67 1.5 1.5 1.5.83 0 1.5-.67 1.5-1.5S15.83 4 15 4c-.83 0-1.5.67-1.5 1.5zM20 12v-1.5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2V12h-1c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h8v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1h-1zm-4.8-2h3.6c.33 0 .6.27.6.6v.9H14.6v-.9c0-.33.27-.6.6-.6zM9.5 5.5c0 .83.67 1.5 1.5 1.5.83 0 1.5-.67 1.5-1.5S11.83 4 11 4c-.83 0-1.5.67-1.5 1.5zM11 10H7c-1.1 0-2 .9-2 2v5c0 .55.45 1 1 1h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h2v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c.55 0 1-.45 1-1v-5c0-1.1-.9-2-2-2z', text: '活動' },
            { view: BabyTracker.App.VIEWS.GROWTH, icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z', text: '生長' },
            { view: BabyTracker.App.VIEWS.HEALTH, icon: 'M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z', text: '健康' },
            { view: BabyTracker.App.VIEWS.MILESTONE, icon: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM7 10.82C5.84 10.4 5 9.3 5 8V7h2v3.82zM19 8c0 1.3-.84 2.4-2 2.82V7h2v1z', text: '里程碑' },
            { view: BabyTracker.App.VIEWS.SETTINGS, icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z', text: '設置' }
        ];
        
        // 為每個菜單項創建元素
        menuItems.forEach(item => {
            const menuItem = document.createElement('a');
            menuItem.href = '#';
            menuItem.className = 'more-menu-item';
            menuItem.setAttribute('data-view', item.view);
            
            menuItem.innerHTML = `
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="${item.icon}"></path>
                </svg>
                <span>${item.text}</span>
            `;
            
            // 添加點擊事件
            menuItem.addEventListener('click', (event) => {
                event.preventDefault();
                
                // 隱藏菜單
                moreMenu.classList.remove('visible');
                
                // 導航到視圖
                navigateToView(item.view);
            });
            
            moreMenu.appendChild(menuItem);
        });
        
        // 添加菜單遮罩層
        const menuOverlay = document.createElement('div');
        menuOverlay.className = 'more-menu-overlay';
        menuOverlay.addEventListener('click', () => {
            moreMenu.classList.remove('visible');
        });
        
        // 添加到文檔
        document.body.appendChild(menuOverlay);
        document.body.appendChild(moreMenu);
    };
    
    // 顯示快速添加菜單
    const showQuickAddMenu = () => {
        // 獲取活動兒童
        const activeChild = BabyTracker.App.getActiveChild();
        
        if (!activeChild) {
            // 如果沒有活動兒童，顯示提示
            BabyTracker.UI.createNotification({
                type: 'warning',
                title: '未選擇兒童',
                message: '請先選擇或創建兒童檔案'
            });
            
            // 導航到兒童檔案視圖
            navigateToView(BabyTracker.App.VIEWS.CHILD_PROFILE);
            return;
        }
        
        // 創建快速添加菜單
        const menuItems = [
            { 
                title: '餵食',
                icon: 'M11 8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h2c.55 0 1-.45 1-1s-.45-1-1-1h-2V4c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1z',
                color: 'var(--feeding-color)',
                action: () => {
                    // 切換到餵食視圖並顯示添加記錄模態框
                    navigateToView(BabyTracker.App.VIEWS.FEEDING, { showAddModal: true });
                }
            },
            { 
                title: '睡眠',
                icon: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z',
                color: 'var(--sleep-color)',
                action: () => {
                    navigateToView(BabyTracker.App.VIEWS.SLEEP, { showAddModal: true });
                }
            },
            { 
                title: '尿布',
                icon: 'M18.5 2h-13C4.67 2 4 2.67 4 3.5v17c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5z',
                color: 'var(--diaper-color)',
                action: () => {
                    navigateToView(BabyTracker.App.VIEWS.DIAPER, { showAddModal: true });
                }
            },
            { 
                title: '生長數據',
                icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
                color: 'var(--growth-color)',
                action: () => {
                    navigateToView(BabyTracker.App.VIEWS.GROWTH, { showAddModal: true });
                }
            }
        ];
        
        // 創建輻射式菜單
        const menuContainer = document.createElement('div');
        menuContainer.className = 'quick-add-menu';
        
        // 添加菜單項
        menuItems.forEach((item, index) => {
            const menuItem = document.createElement('div');
            menuItem.className = 'quick-add-item';
            menuItem.style.setProperty('--item-index', index);
            menuItem.style.setProperty('--items-count', menuItems.length);
            
            // 按鈕
            const button = document.createElement('button');
            button.className = 'quick-add-button';
            button.style.backgroundColor = item.color;
            button.innerHTML = `
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="${item.icon}"></path>
                </svg>
            `;
            
            // 標籤
            const label = document.createElement('span');
            label.className = 'quick-add-label';
            label.textContent = item.title;
            
            // 添加點擊事件
            button.addEventListener('click', () => {
                // 移除菜單
                menuContainer.remove();
                overlayElement.remove();
                
                // 執行操作
                item.action();
            });
            
            menuItem.appendChild(button);
            menuItem.appendChild(label);
            menuContainer.appendChild(menuItem);
        });
        
        // 添加遮罩層
        const overlayElement = document.createElement('div');
        overlayElement.className = 'quick-add-overlay';
        
        // 點擊遮罩層關閉菜單
        overlayElement.addEventListener('click', () => {
            menuContainer.remove();
            overlayElement.remove();
        });
        
        // 添加到文檔
        document.body.appendChild(overlayElement);
        document.body.appendChild(menuContainer);
        
        // 延遲顯示菜單項（用於動畫）
        setTimeout(() => {
            menuContainer.classList.add('visible');
        }, 10);
    };
    
    // 更新活動導航項
    const updateActiveNavItem = (viewName) => {
        // 移除所有活動類
        document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 添加活動類到匹配的導航項
        document.querySelectorAll(`.nav-link[data-view="${viewName}"], .mobile-nav-item[data-view="${viewName}"]`).forEach(item => {
            item.classList.add('active');
        });
        
        // 特殊情況處理（例如，更多菜單中的項目）
        if (['mood', 'activity', 'growth', 'health', 'milestone', 'settings'].includes(viewName)) {
            // 在移動端，將"更多"菜單項設為活動
            document.querySelectorAll('.mobile-nav-item[data-view="more"]').forEach(item => {
                item.classList.add('active');
            });
        }
    };
    
    // 從 URL 獲取視圖名稱
    const getViewFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('view') || null;
    };
    
    // 從 URL 獲取參數
    const getParamsFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        
        // 獲取除了 'view' 之外的所有參數
        for (const [key, value] of urlParams.entries()) {
            if (key !== 'view') {
                // 將字符串 'true' 和 'false' 轉換為布爾值
                if (value === 'true') {
                    params[key] = true;
                } else if (value === 'false') {
                    params[key] = false;
                } else {
                    params[key] = value;
                }
            }
        }
        
        return params;
    };
    
    // 更新 URL
    const updateUrl = (viewName, params = {}) => {
        const url = new URL(window.location);
        
        // 設置視圖
        url.searchParams.set('view', viewName);
        
        // 設置其他參數
        for (const [key, value] of Object.entries(params)) {
            if (value === true) {
                url.searchParams.set(key, 'true');
            } else if (value === false) {
                url.searchParams.set(key, 'false');
            } else if (value !== undefined && value !== null) {
                url.searchParams.set(key, value);
            } else {
                url.searchParams.delete(key);
            }
        }
        
        // 使用歷史 API 更新 URL
        window.history.pushState({ view: viewName, params }, '', url);
    };
    
    // 後退導航
    const goBack = () => {
        if (previousView) {
            navigateToView(previousView);
        } else {
            navigateToView(BabyTracker.App.VIEWS.DASHBOARD);
        }
    };
    
    // 公開API
    return {
        init,
        navigateToView,
        goBack,
        getCurrentView: () => currentView
    };
})();

// 將模塊導出到全局命名空間
window.BabyTracker = BabyTracker;
