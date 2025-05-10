/**
 * 嬰幼兒照顧追蹤應用 - 存儲模塊
 * 封裝IndexedDB操作，提供統一的數據存取接口
 */

const BabyTracker = window.BabyTracker || {};

// 存儲模塊
BabyTracker.Storage = (function() {
    // 數據庫設置
    const DB_NAME = 'babyTrackerDB';
    const DB_VERSION = 1;
    
    // 存儲對象名稱
    const STORES = {
        USER: 'user',
        CHILDREN: 'children',
        FEEDING: 'feeding',
        SLEEP: 'sleep',
        DIAPER: 'diaper',
        MOOD: 'mood',
        ACTIVITY: 'activity',
        GROWTH: 'growth',
        HEALTH_VISIT: 'healthVisit',
        VACCINE: 'vaccine',
        MEDICATION: 'medication',
        MILESTONE: 'milestone'
    };
    
    // 私有變量
    let db = null;
    
    // 初始化數據庫
    const initDatabase = () => {
        return new Promise((resolve, reject) => {
            if (db) {
                resolve(db);
                return;
            }
            
            const request = window.indexedDB.open(DB_NAME, DB_VERSION);
            
            // 處理數據庫版本升級
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 創建用戶設置存儲
                if (!db.objectStoreNames.contains(STORES.USER)) {
                    db.createObjectStore(STORES.USER, { keyPath: 'id' });
                }
                
                // 創建兒童存儲
                if (!db.objectStoreNames.contains(STORES.CHILDREN)) {
                    const childrenStore = db.createObjectStore(STORES.CHILDREN, { keyPath: 'id' });
                    childrenStore.createIndex('nameIndex', 'name', { unique: false });
                }
                
                // 創建餵食記錄存儲
                if (!db.objectStoreNames.contains(STORES.FEEDING)) {
                    const feedingStore = db.createObjectStore(STORES.FEEDING, { keyPath: 'id' });
                    feedingStore.createIndex('childIdIndex', 'childId', { unique: false });
                    feedingStore.createIndex('timestampIndex', 'timestamp', { unique: false });
                }
                
                // 創建睡眠記錄存儲
                if (!db.objectStoreNames.contains(STORES.SLEEP)) {
                    const sleepStore = db.createObjectStore(STORES.SLEEP, { keyPath: 'id' });
                    sleepStore.createIndex('childIdIndex', 'childId', { unique: false });
                    sleepStore.createIndex('startTimeIndex', 'startTime', { unique: false });
                }
                
                // 創建尿布記錄存儲
                if (!db.objectStoreNames.contains(STORES.DIAPER)) {
                    const diaperStore = db.createObjectStore(STORES.DIAPER, { keyPath: 'id' });
                    diaperStore.createIndex('childIdIndex', 'childId', { unique: false });
                    diaperStore.createIndex('timestampIndex', 'timestamp', { unique: false });
                }
                
                // 創建情緒記錄存儲
                if (!db.objectStoreNames.contains(STORES.MOOD)) {
                    const moodStore = db.createObjectStore(STORES.MOOD, { keyPath: 'id' });
                    moodStore.createIndex('childIdIndex', 'childId', { unique: false });
                    moodStore.createIndex('timestampIndex', 'timestamp', { unique: false });
                }
                
                // 創建活動記錄存儲
                if (!db.objectStoreNames.contains(STORES.ACTIVITY)) {
                    const activityStore = db.createObjectStore(STORES.ACTIVITY, { keyPath: 'id' });
                    activityStore.createIndex('childIdIndex', 'childId', { unique: false });
                    activityStore.createIndex('timestampIndex', 'timestamp', { unique: false });
                }
                
                // 創建生長記錄存儲
                if (!db.objectStoreNames.contains(STORES.GROWTH)) {
                    const growthStore = db.createObjectStore(STORES.GROWTH, { keyPath: 'id' });
                    growthStore.createIndex('childIdIndex', 'childId', { unique: false });
                    growthStore.createIndex('dateIndex', 'date', { unique: false });
                }
                
                // 創建健康訪視存儲
                if (!db.objectStoreNames.contains(STORES.HEALTH_VISIT)) {
                    const healthVisitStore = db.createObjectStore(STORES.HEALTH_VISIT, { keyPath: 'id' });
                    healthVisitStore.createIndex('childIdIndex', 'childId', { unique: false });
                    healthVisitStore.createIndex('dateIndex', 'date', { unique: false });
                }
                
                // 創建疫苗記錄存儲
                if (!db.objectStoreNames.contains(STORES.VACCINE)) {
                    const vaccineStore = db.createObjectStore(STORES.VACCINE, { keyPath: 'id' });
                    vaccineStore.createIndex('childIdIndex', 'childId', { unique: false });
                    vaccineStore.createIndex('dateIndex', 'date', { unique: false });
                    vaccineStore.createIndex('dueDateIndex', 'dueDate', { unique: false });
                }
                
                // 創建用藥記錄存儲
                if (!db.objectStoreNames.contains(STORES.MEDICATION)) {
                    const medicationStore = db.createObjectStore(STORES.MEDICATION, { keyPath: 'id' });
                    medicationStore.createIndex('childIdIndex', 'childId', { unique: false });
                    medicationStore.createIndex('startDateIndex', 'startDate', { unique: false });
                }
                
                // 創建里程碑記錄存儲
                if (!db.objectStoreNames.contains(STORES.MILESTONE)) {
                    const milestoneStore = db.createObjectStore(STORES.MILESTONE, { keyPath: 'id' });
                    milestoneStore.createIndex('childIdIndex', 'childId', { unique: false });
                    milestoneStore.createIndex('categoryIndex', 'category', { unique: false });
                }
            };
            
            // 處理成功
            request.onsuccess = (event) => {
                db = event.target.result;
                resolve(db);
            };
            
            // 處理錯誤
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    };
    
    // 通用添加記錄方法
    const add = (storeName, data) => {
        return new Promise((resolve, reject) => {
            initDatabase().then(db => {
                // 確保數據有唯一ID
                if (!data.id) {
                    data.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
                }
                
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.add(data);
                
                request.onsuccess = () => resolve(data);
                request.onerror = (event) => reject(event.target.error);
            }).catch(error => reject(error));
        });
    };
    
    // 通用獲取記錄方法
    const get = (storeName, id) => {
        return new Promise((resolve, reject) => {
            initDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(id);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = (event) => reject(event.target.error);
            }).catch(error => reject(error));
        });
    };
    
    // 通用更新記錄方法
    const update = (storeName, data) => {
        return new Promise((resolve, reject) => {
            initDatabase().then(db => {
                if (!data.id) {
                    reject(new Error('更新記錄必須包含ID'));
                    return;
                }
                
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.put(data);
                
                request.onsuccess = () => resolve(data);
                request.onerror = (event) => reject(event.target.error);
            }).catch(error => reject(error));
        });
    };
    
    // 通用刪除記錄方法
    const remove = (storeName, id) => {
        return new Promise((resolve, reject) => {
            initDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.delete(id);
                
                request.onsuccess = () => resolve(true);
                request.onerror = (event) => reject(event.target.error);
            }).catch(error => reject(error));
        });
    };
    
    // 通用獲取所有記錄方法
    const getAll = (storeName) => {
        return new Promise((resolve, reject) => {
            initDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = (event) => reject(event.target.error);
            }).catch(error => reject(error));
        });
    };
    
    // 通過索引查詢記錄
    const getByIndex = (storeName, indexName, value) => {
        return new Promise((resolve, reject) => {
            initDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const index = store.index(indexName);
                const request = index.getAll(value);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = (event) => reject(event.target.error);
            }).catch(error => reject(error));
        });
    };
    
    // 在時間範圍內查詢記錄
    const getByTimeRange = (storeName, indexName, startTime, endTime) => {
        return new Promise((resolve, reject) => {
            initDatabase().then(db => {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const index = store.index(indexName);
                const range = IDBKeyRange.bound(startTime, endTime);
                const request = index.getAll(range);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = (event) => reject(event.target.error);
            }).catch(error => reject(error));
        });
    };
    
    // 導出所有數據
    const exportAllData = () => {
        return new Promise((resolve, reject) => {
            const exportData = {};
            const promises = [];
            
            for (const store of Object.values(STORES)) {
                const promise = getAll(store).then(data => {
                    exportData[store] = data;
                });
                promises.push(promise);
            }
            
            Promise.all(promises)
                .then(() => {
                    // 添加元數據
                    exportData.metadata = {
                        version: DB_VERSION,
                        exportDate: new Date().toISOString(),
                        appName: 'BabyTracker'
                    };
                    
                    resolve(exportData);
                })
                .catch(error => reject(error));
        });
    };
    
    // 導入所有數據
    const importAllData = (importData) => {
        return new Promise((resolve, reject) => {
            // 驗證導入數據
            if (!importData || !importData.metadata) {
                reject(new Error('無效的導入數據'));
                return;
            }
            
            initDatabase().then(db => {
                const transaction = db.transaction(Object.values(STORES), 'readwrite');
                let successCount = 0;
                
                // 為每個存儲導入數據
                for (const storeName of Object.values(STORES)) {
                    if (!importData[storeName] || !Array.isArray(importData[storeName])) {
                        continue;
                    }
                    
                    const store = transaction.objectStore(storeName);
                    
                    // 清除現有數據
                    store.clear();
                    
                    // 添加導入的數據
                    for (const item of importData[storeName]) {
                        store.add(item);
                    }
                    
                    successCount++;
                }
                
                transaction.oncomplete = () => {
                    resolve({
                        success: true,
                        message: `成功導入 ${successCount} 個存儲的數據`
                    });
                };
                
                transaction.onerror = (event) => {
                    reject(event.target.error);
                };
            }).catch(error => reject(error));
        });
    };
    
    // 公開API
    return {
        init: initDatabase,
        add,
        get,
        update,
        remove,
        getAll,
        getByIndex,
        getByTimeRange,
        exportAllData,
        importAllData,
        STORES
    };
})();

// 將模塊導出到全局命名空間
window.BabyTracker = BabyTracker;
