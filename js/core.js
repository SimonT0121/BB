/**
 * 嬰幼兒照顧追蹤應用 - 核心架構
 * 包含事件總線和應用程序入口點
 */

// 全局命名空間
const BabyTracker = window.BabyTracker || {};

// 事件總線模塊 - 用於組件間通信的發布-訂閱模式實現
BabyTracker.EventBus = (function() {
    const events = {};
    
    // 訂閱事件
    const subscribe = (eventName, callback) => {
        if (!events[eventName]) {
            events[eventName] = [];
        }
        
        // 返回訂閱ID，用於取消訂閱
        const subscriptionId = Date.now().toString(36);
        events[eventName].push({
            id: subscriptionId,
            callback
        });
        
        return subscriptionId;
    };
    
    // 取消訂閱
    const unsubscribe = (eventName, subscriptionId) => {
        if (!events[eventName]) {
            return false;
        }
        
        const initialLength = events[eventName].length;
        events[eventName] = events[eventName].filter(
            subscription => subscription.id !== subscriptionId
        );
        
        return events[eventName].length !== initialLength;
    };
    
    // 發布事件
    const publish = (eventName, data) => {
        if (!events[eventName]) {
            return;
        }
        
        events[eventName].forEach(subscription => {
            // 使用setTimeout確保異步執行，防止阻塞
            setTimeout(() => {
                subscription.callback(data);
            }, 0);
        });
    };
    
    // 公開API
    return {
        subscribe,
        unsubscribe,
        publish
    };
})();

// 應用程序入口點
BabyTracker.App = (function() {
    // 私有變量
    let initialized = false;
    let currentUser = null;
    let activeChild = null;
    
    // 常量
    const EVENTS = {
        APP_INITIALIZED: 'app:initialized',
        USER_CHANGED: 'user:changed',
        ACTIVE_CHILD_CHANGED: 'child:activeChanged',
        DATA_CHANGED: 'data:changed',
        VIEW_CHANGED: 'view:changed',
        ERROR: 'app:error'
    };
    
    // 主題設置
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark'
    };
    
    // 視圖設置
    const VIEWS = {
        DASHBOARD: 'dashboard',
        CHILD_PROFILE: 'childProfile',
        FEEDING: 'feeding',
        SLEEP: 'sleep',
        DIAPER: 'diaper',
        MOOD: 'mood',
        ACTIVITY: 'activity',
        GROWTH: 'growth',
        HEALTH: 'health',
        MILESTONE: 'milestone',
        SETTINGS: 'settings'
    };
    
    // 初始化應用程序
    const init = () => {
        if (initialized) {
            return Promise.resolve();
        }
        
        // 初始化存儲
        return BabyTracker.Storage.init()
            .then(() => {
                // 加載用戶設置
                return loadUserSettings();
            })
            .then(user => {
                currentUser = user;
                
                // 如果沒有用戶，創建默認用戶
                if (!currentUser) {
                    return createDefaultUser();
                }
                
                return currentUser;
            })
            .then(user => {
                // 加載當前活動兒童
                if (user.activeChildId) {
                    return BabyTracker.Storage.get(
                        BabyTracker.Storage.STORES.CHILDREN,
                        user.activeChildId
                    );
                }
                
                return null;
            })
            .then(child => {
                activeChild = child;
                
                // 應用主題
                applyTheme(currentUser.settings.theme);
                
                // 初始化視圖
                initView();
                
                // 標記為已初始化
                initialized = true;
                
                // 發布初始化完成事件
                BabyTracker.EventBus.publish(EVENTS.APP_INITIALIZED, {
                    user: currentUser,
                    activeChild
                });
                
                return {
                    user: currentUser,
                    activeChild
                };
            })
            .catch(error => {
                // 發布錯誤事件
                BabyTracker.EventBus.publish(EVENTS.ERROR, {
                    message: '初始化應用程序時出錯',
                    error
                });
                
                throw error;
            });
    };
    
    // 加載用戶設置
    const loadUserSettings = () => {
        return BabyTracker.Storage.getAll(BabyTracker.Storage.STORES.USER)
            .then(users => {
                // 使用第一個用戶（應該只有一個）
                return users && users.length > 0 ? users[0] : null;
            });
    };
    
    // 創建默認用戶和設置
    const createDefaultUser = () => {
        const defaultUser = {
            id: 'default-user',
            settings: {
                theme: THEMES.LIGHT,
                language: 'zh-TW',
                notifications: true,
                dataRetention: 365, // 預設保留數據天數
                defaultView: VIEWS.DASHBOARD
            },
            activeChildId: null,
            created: new Date().toISOString()
        };
        
        return BabyTracker.Storage.add(
            BabyTracker.Storage.STORES.USER,
            defaultUser
        );
    };
    
    // 應用主題設置
    const applyTheme = (theme) => {
        document.body.classList.remove(THEMES.LIGHT, THEMES.DARK);
        document.body.classList.add(theme);
        
        // 更新元標籤用於移動設備
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = theme === THEMES.DARK ? '#121212' : '#ffffff';
        }
    };
    
    // 切換主題
    const toggleTheme = () => {
        const newTheme = currentUser.settings.theme === THEMES.LIGHT ? 
            THEMES.DARK : THEMES.LIGHT;
        
        // 更新用戶設置
        currentUser.settings.theme = newTheme;
        
        // 保存設置
        BabyTracker.Storage.update(
            BabyTracker.Storage.STORES.USER,
            currentUser
        )
            .then(() => {
                // 應用新主題
                applyTheme(newTheme);
                
                // 發布用戶變更事件
                BabyTracker.EventBus.publish(EVENTS.USER_CHANGED, currentUser);
            })
            .catch(error => {
                BabyTracker.EventBus.publish(EVENTS.ERROR, {
                    message: '保存主題設置時出錯',
                    error
                });
            });
    };
    
    // 設置活動兒童
    const setActiveChild = (childId) => {
        if (currentUser.activeChildId === childId) {
            return Promise.resolve(activeChild);
        }
        
        // 更新用戶設置
        currentUser.activeChildId = childId;
        
        // 保存設置
        return BabyTracker.Storage.update(
            BabyTracker.Storage.STORES.USER,
            currentUser
        )
            .then(() => {
                // 加載新活動兒童
                if (childId) {
                    return BabyTracker.Storage.get(
                        BabyTracker.Storage.STORES.CHILDREN,
                        childId
                    );
                }
                
                return null;
            })
            .then(child => {
                activeChild = child;
                
                // 發布活動兒童變更事件
                BabyTracker.EventBus.publish(EVENTS.ACTIVE_CHILD_CHANGED, activeChild);
                
                return activeChild;
            });
    };
    
    // 初始化視圖
    const initView = () => {
        // 默認視圖
        let initialView = VIEWS.DASHBOARD;
        
        // 如果沒有活動兒童且沒有任何兒童檔案，顯示入門引導
        if (!activeChild) {
            BabyTracker.Storage.getAll(BabyTracker.Storage.STORES.CHILDREN)
                .then(children => {
                    if (!children || children.length === 0) {
                        initialView = 'onboarding';
                    }
                    
                    // 渲染初始視圖
                    renderView(initialView);
                })
                .catch(error => {
                    console.error('檢查兒童檔案時出錯', error);
                    renderView(initialView);
                });
        } else {
            // 有活動兒童，直接顯示儀表板
            renderView(initialView);
        }
    };
    
    // 渲染視圖
    const renderView = (viewName, params = {}) => {
        // 發布視圖變更事件
        BabyTracker.EventBus.publish(EVENTS.VIEW_CHANGED, {
            viewName,
            params
        });
        
        // 更新URL (使用歷史API，不刷新頁面)
        const url = new URL(window.location);
        url.searchParams.set('view', viewName);
        
        if (params.id) {
            url.searchParams.set('id', params.id);
        } else {
            url.searchParams.delete('id');
        }
        
        window.history.pushState({}, '', url);
    };
    
    // 暴露應用程序API
    return {
        init,
        toggleTheme,
        setActiveChild,
        renderView,
        getCurrentUser: () => currentUser,
        getActiveChild: () => activeChild,
        EVENTS,
        THEMES,
        VIEWS
    };
})();

// 將模塊導出到全局命名空間
window.BabyTracker = BabyTracker;

// 當DOM加載完成時初始化應用
document.addEventListener('DOMContentLoaded', () => {
    BabyTracker.App.init()
        .then(() => {
            console.log('嬰幼兒照顧追蹤應用已初始化');
        })
        .catch(error => {
            console.error('初始化應用程序時出錯', error);
        });
});
