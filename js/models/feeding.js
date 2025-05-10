/**
 * 嬰幼兒照顧追蹤應用 - 餵食記錄模型
 * 處理餵食記錄的創建、讀取、更新和刪除操作
 */

const BabyTracker = window.BabyTracker || {};

/**
 * 餵食記錄模型
 */
BabyTracker.FeedingModel = (function() {
    // 常量
    const STORE_NAME = BabyTracker.Storage.STORES.FEEDING;
    
    // 餵食類型
    const FEEDING_TYPES = {
        BREAST_LEFT: 'breastLeft',
        BREAST_RIGHT: 'breastRight',
        BREAST_BOTH: 'breastBoth',
        FORMULA: 'formula',
        PUMPED_MILK: 'pumpedMilk',
        SOLID_FOOD: 'solidFood',
        WATER: 'water',
        OTHER: 'other'
    };
    
    // 餵食單位
    const FEEDING_UNITS = {
        ML: 'ml',
        OZ: 'oz',
        G: 'g',
        TBSP: 'tbsp',
        TSP: 'tsp',
        CUP: 'cup'
    };
    
    // 事件名稱
    const EVENTS = {
        FEEDING_CREATED: 'feeding:created',
        FEEDING_UPDATED: 'feeding:updated',
        FEEDING_DELETED: 'feeding:deleted',
        FEEDING_LIST_CHANGED: 'feeding:listChanged'
    };
    
    /**
     * 創建新的餵食記錄
     * @param {Object} feedingData - 餵食數據
     * @returns {Promise<Object>} 創建的餵食記錄
     */
    const createFeeding = (feedingData) => {
        // 檢查必填字段
        if (!feedingData.childId || !feedingData.timestamp || !feedingData.type) {
            return Promise.reject(new Error('兒童ID、時間和餵食類型為必填項'));
        }
        
        // 創建唯一ID (如果未提供)
        if (!feedingData.id) {
            feedingData.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
        }
        
        // 添加創建和更新時間戳
        const now = new Date().toISOString();
        feedingData.created = feedingData.created || now;
        feedingData.updated = now;
        
        // 根據餵食類型檢查和設置必要的字段
        switch (feedingData.type) {
            case FEEDING_TYPES.BREAST_LEFT:
            case FEEDING_TYPES.BREAST_RIGHT:
            case FEEDING_TYPES.BREAST_BOTH:
                // 母乳喂養應該有持續時間
                if (!feedingData.duration && feedingData.duration !== 0) {
                    feedingData.duration = 0;
                }
                break;
                
            case FEEDING_TYPES.FORMULA:
            case FEEDING_TYPES.PUMPED_MILK:
            case FEEDING_TYPES.WATER:
                // 配方奶、母乳瓶餵和水應該有數量和單位
                if (!feedingData.amount && feedingData.amount !== 0) {
                    feedingData.amount = 0;
                }
                if (!feedingData.unit) {
                    feedingData.unit = FEEDING_UNITS.ML;
                }
                break;
                
            case FEEDING_TYPES.SOLID_FOOD:
                // 固體食物應該有食物描述
                if (!feedingData.foodItems) {
                    feedingData.foodItems = [];
                }
                break;
        }
        
        // 保存到存儲
        return BabyTracker.Storage.add(STORE_NAME, feedingData)
            .then((savedFeeding) => {
                // 發布餵食創建事件
                BabyTracker.EventBus.publish(EVENTS.FEEDING_CREATED, savedFeeding);
                BabyTracker.EventBus.publish(EVENTS.FEEDING_LIST_CHANGED, { childId: savedFeeding.childId });
                
                return savedFeeding;
            });
    };
    
    /**
     * 獲取餵食記錄
     * @param {String} feedingId - 餵食記錄ID
     * @returns {Promise<Object>} 餵食記錄
     */
    const getFeeding = (feedingId) => {
        return BabyTracker.Storage.get(STORE_NAME, feedingId);
    };
    
    /**
     * 更新餵食記錄
     * @param {Object} feedingData - 餵食數據
     * @returns {Promise<Object>} 更新後的餵食記錄
     */
    const updateFeeding = (feedingData) => {
        // 檢查必填字段
        if (!feedingData.id || !feedingData.childId || !feedingData.timestamp || !feedingData.type) {
            return Promise.reject(new Error('ID、兒童ID、時間和餵食類型為必填項'));
        }
        
        // 檢查餵食記錄是否存在
        return getFeeding(feedingData.id)
            .then((existingFeeding) => {
                if (!existingFeeding) {
                    throw new Error('餵食記錄不存在');
                }
                
                // 更新時間戳
                feedingData.updated = new Date().toISOString();
                feedingData.created = existingFeeding.created;
                
                // 更新存儲
                return BabyTracker.Storage.update(STORE_NAME, feedingData);
            })
            .then((updatedFeeding) => {
                // 發布餵食更新事件
                BabyTracker.EventBus.publish(EVENTS.FEEDING_UPDATED, updatedFeeding);
                BabyTracker.EventBus.publish(EVENTS.FEEDING_LIST_CHANGED, { childId: updatedFeeding.childId });
                
                return updatedFeeding;
            });
    };
    
    /**
     * 刪除餵食記錄
     * @param {String} feedingId - 餵食記錄ID
     * @returns {Promise<Boolean>} 刪除是否成功
     */
    const deleteFeeding = (feedingId) => {
        // 檢查餵食記錄是否存在
        return getFeeding(feedingId)
            .then((existingFeeding) => {
                if (!existingFeeding) {
                    throw new Error('餵食記錄不存在');
                }
                
                const childId = existingFeeding.childId;
                
                // 刪除存儲
                return BabyTracker.Storage.remove(STORE_NAME, feedingId)
                    .then(success => ({ success, childId }));
            })
            .then(({ success, childId }) => {
                if (success) {
                    // 發布餵食刪除事件
                    BabyTracker.EventBus.publish(EVENTS.FEEDING_DELETED, feedingId);
                    BabyTracker.EventBus.publish(EVENTS.FEEDING_LIST_CHANGED, { childId });
                }
                
                return success;
            });
    };
    
    /**
     * 獲取兒童的所有餵食記錄
     * @param {String} childId - 兒童ID
     * @returns {Promise<Array>} 餵食記錄列表
     */
    const getChildFeedings = (childId) => {
        return BabyTracker.Storage.getByIndex(STORE_NAME, 'childIdIndex', childId)
            .then((feedings) => {
                // 按時間排序 (最近的在前)
                return feedings.sort((a, b) => {
                    return new Date(b.timestamp) - new Date(a.timestamp);
                });
            });
    };
    
    /**
     * 獲取兒童在特定時間範圍內的餵食記錄
     * @param {String} childId - 兒童ID
     * @param {Date} startDate - 開始日期
     * @param {Date} endDate - 結束日期
     * @returns {Promise<Array>} 餵食記錄列表
     */
    const getChildFeedingsByDateRange = (childId, startDate, endDate) => {
        // 先獲取所有餵食記錄
        return getChildFeedings(childId)
            .then((feedings) => {
                // 過濾特定時間範圍內的記錄
                return feedings.filter((feeding) => {
                    const feedingDate = new Date(feeding.timestamp);
                    return feedingDate >= startDate && feedingDate <= endDate;
                });
            });
    };
    
    /**
     * 獲取兒童最近的餵食記錄
     * @param {String} childId - 兒童ID
     * @param {Number} count - 記錄數量
     * @returns {Promise<Array>} 餵食記錄列表
     */
    const getRecentFeedings = (childId, count = 5) => {
        return getChildFeedings(childId)
            .then((feedings) => feedings.slice(0, count));
    };
    
    /**
     * 計算兒童的餵食統計數據
     * @param {String} childId - 兒童ID
     * @param {Date} date - 日期 (可選，默認為今天)
     * @returns {Promise<Object>} 統計數據
     */
    const calculateFeedingStats = (childId, date = new Date()) => {
        // 設置日期範圍 (當天)
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        return getChildFeedingsByDateRange(childId, startDate, endDate)
            .then((feedings) => {
                // 初始化統計數據
                const stats = {
                    total: feedings.length,
                    breastfeeding: {
                        count: 0,
                        totalDuration: 0,
                        leftCount: 0,
                        rightCount: 0,
                        bothCount: 0
                    },
                    bottle: {
                        count: 0,
                        totalAmount: 0,
                        formula: {
                            count: 0,
                            totalAmount: 0
                        },
                        pumpedMilk: {
                            count: 0,
                            totalAmount: 0
                        },
                        water: {
                            count: 0,
                            totalAmount: 0
                        }
                    },
                    solidFood: {
                        count: 0,
                        items: {}
                    },
                    lastFeeding: null,
                    nextPredicted: null
                };
                
                // 統計每種類型的餵食
                feedings.forEach((feeding) => {
                    // 更新最近的餵食
                    if (!stats.lastFeeding || new Date(feeding.timestamp) > new Date(stats.lastFeeding.timestamp)) {
                        stats.lastFeeding = feeding;
                    }
                    
                    switch (feeding.type) {
                        case FEEDING_TYPES.BREAST_LEFT:
                            stats.breastfeeding.count++;
                            stats.breastfeeding.leftCount++;
                            stats.breastfeeding.totalDuration += feeding.duration || 0;
                            break;
                            
                        case FEEDING_TYPES.BREAST_RIGHT:
                            stats.breastfeeding.count++;
                            stats.breastfeeding.rightCount++;
                            stats.breastfeeding.totalDuration += feeding.duration || 0;
                            break;
                            
                        case FEEDING_TYPES.BREAST_BOTH:
                            stats.breastfeeding.count++;
                            stats.breastfeeding.bothCount++;
                            stats.breastfeeding.totalDuration += feeding.duration || 0;
                            break;
                            
                        case FEEDING_TYPES.FORMULA:
                            stats.bottle.count++;
                            stats.bottle.formula.count++;
                            
                            if (feeding.amount) {
                                const amount = convertToStandardUnit(feeding.amount, feeding.unit);
                                stats.bottle.totalAmount += amount;
                                stats.bottle.formula.totalAmount += amount;
                            }
                            break;
                            
                        case FEEDING_TYPES.PUMPED_MILK:
                            stats.bottle.count++;
                            stats.bottle.pumpedMilk.count++;
                            
                            if (feeding.amount) {
                                const amount = convertToStandardUnit(feeding.amount, feeding.unit);
                                stats.bottle.totalAmount += amount;
                                stats.bottle.pumpedMilk.totalAmount += amount;
                            }
                            break;
                            
                        case FEEDING_TYPES.WATER:
                            stats.bottle.count++;
                            stats.bottle.water.count++;
                            
                            if (feeding.amount) {
                                const amount = convertToStandardUnit(feeding.amount, feeding.unit);
                                stats.bottle.totalAmount += amount;
                                stats.bottle.water.totalAmount += amount;
                            }
                            break;
                            
                        case FEEDING_TYPES.SOLID_FOOD:
                            stats.solidFood.count++;
                            
                            if (feeding.foodItems && Array.isArray(feeding.foodItems)) {
                                feeding.foodItems.forEach((item) => {
                                    if (!stats.solidFood.items[item]) {
                                        stats.solidFood.items[item] = 0;
                                    }
                                    
                                    stats.solidFood.items[item]++;
                                });
                            }
                            break;
                    }
                });
                
                // 預測下一次餵食時間
                if (stats.lastFeeding) {
                    // 預測基於過去的平均間隔
                    // 如果數據足夠，可以實現更複雜的預測算法
                    if (feedings.length >= 2) {
                        // 計算平均間隔（單位：毫秒）
                        let totalInterval = 0;
                        let intervalCount = 0;
                        
                        for (let i = 0; i < feedings.length - 1; i++) {
                            const currentTime = new Date(feedings[i].timestamp).getTime();
                            const nextTime = new Date(feedings[i + 1].timestamp).getTime();
                            const interval = Math.abs(currentTime - nextTime);
                            
                            if (interval > 0 && interval < 8 * 60 * 60 * 1000) { // 忽略大於8小時的間隔
                                totalInterval += interval;
                                intervalCount++;
                            }
                        }
                        
                        if (intervalCount > 0) {
                            const avgInterval = totalInterval / intervalCount;
                            const lastFeedingTime = new Date(stats.lastFeeding.timestamp).getTime();
                            const nextTime = lastFeedingTime + avgInterval;
                            
                            stats.nextPredicted = new Date(nextTime);
                        }
                    } else {
                        // 如果數據不足，默認3小時後
                        const lastFeedingTime = new Date(stats.lastFeeding.timestamp).getTime();
                        stats.nextPredicted = new Date(lastFeedingTime + 3 * 60 * 60 * 1000);
                    }
                }
                
                return stats;
            });
    };
    
    /**
     * 將餵食量轉換為標準單位（毫升）
     * @param {Number} amount - 餵食量
     * @param {String} unit - 單位
     * @returns {Number} 標準單位的餵食量
     */
    const convertToStandardUnit = (amount, unit) => {
        if (!amount) return 0;
        
        switch (unit) {
            case FEEDING_UNITS.ML:
                return amount;
                
            case FEEDING_UNITS.OZ:
                return amount * 29.5735; // 1盎司 = 29.5735毫升
                
            case FEEDING_UNITS.G:
                return amount; // 假設1克 = 1毫升 (對於液體)
                
            case FEEDING_UNITS.TBSP:
                return amount * 15; // 1湯匙 = 15毫升
                
            case FEEDING_UNITS.TSP:
                return amount * 5; // 1茶匙 = 5毫升
                
            case FEEDING_UNITS.CUP:
                return amount * 240; // 1杯 = 240毫升
                
            default:
                return amount;
        }
    };
    
    /**
     * 將標準單位轉換為指定單位
     * @param {Number} amount - 標準單位的餵食量（毫升）
     * @param {String} targetUnit - 目標單位
     * @returns {Number} 轉換後的餵食量
     */
    const convertFromStandardUnit = (amount, targetUnit) => {
        if (!amount) return 0;
        
        switch (targetUnit) {
            case FEEDING_UNITS.ML:
                return amount;
                
            case FEEDING_UNITS.OZ:
                return amount / 29.5735;
                
            case FEEDING_UNITS.G:
                return amount;
                
            case FEEDING_UNITS.TBSP:
                return amount / 15;
                
            case FEEDING_UNITS.TSP:
                return amount / 5;
                
            case FEEDING_UNITS.CUP:
                return amount / 240;
                
            default:
                return amount;
        }
    };
    
    /**
     * 格式化餵食時間
     * @param {Date} timestamp - 時間戳
     * @returns {String} 格式化的時間字符串
     */
    const formatFeedingTime = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${hours}:${minutes}`;
    };
    
    /**
     * 格式化餵食持續時間
     * @param {Number} duration - 持續時間（秒）
     * @returns {String} 格式化的持續時間字符串
     */
    const formatFeedingDuration = (duration) => {
        if (!duration && duration !== 0) return '0分鐘';
        
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        
        if (minutes === 0) {
            return `${seconds}秒`;
        } else if (seconds === 0) {
            return `${minutes}分鐘`;
        } else {
            return `${minutes}分${seconds}秒`;
        }
    };
    
    /**
     * 獲取餵食類型的顯示名稱
     * @param {String} type - 餵食類型
     * @returns {String} 顯示名稱
     */
    const getFeedingTypeName = (type) => {
        switch (type) {
            case FEEDING_TYPES.BREAST_LEFT:
                return '左側母乳';
                
            case FEEDING_TYPES.BREAST_RIGHT:
                return '右側母乳';
                
            case FEEDING_TYPES.BREAST_BOTH:
                return '雙側母乳';
                
            case FEEDING_TYPES.FORMULA:
                return '配方奶';
                
            case FEEDING_TYPES.PUMPED_MILK:
                return '瓶餵母乳';
                
            case FEEDING_TYPES.SOLID_FOOD:
                return '固體食物';
                
            case FEEDING_TYPES.WATER:
                return '水';
                
            case FEEDING_TYPES.OTHER:
                return '其他';
                
            default:
                return '未知';
        }
    };
    
    /**
     * 獲取餵食單位的顯示名稱
     * @param {String} unit - 餵食單位
     * @returns {String} 顯示名稱
     */
    const getFeedingUnitName = (unit) => {
        switch (unit) {
            case FEEDING_UNITS.ML:
                return '毫升';
                
            case FEEDING_UNITS.OZ:
                return '盎司';
                
            case FEEDING_UNITS.G:
                return '克';
                
            case FEEDING_UNITS.TBSP:
                return '湯匙';
                
            case FEEDING_UNITS.TSP:
                return '茶匙';
                
            case FEEDING_UNITS.CUP:
                return '杯';
                
            default:
                return '未知';
        }
    };
    
    // 公開API
    return {
        createFeeding,
        getFeeding,
        updateFeeding,
        deleteFeeding,
        getChildFeedings,
        getChildFeedingsByDateRange,
        getRecentFeedings,
        calculateFeedingStats,
        convertToStandardUnit,
        convertFromStandardUnit,
        formatFeedingTime,
        formatFeedingDuration,
        getFeedingTypeName,
        getFeedingUnitName,
        FEEDING_TYPES,
        FEEDING_UNITS,
        EVENTS
    };
})();

// 將模塊導出到全局命名空間
window.BabyTracker = BabyTracker;
