/**
 * 嬰幼兒照顧追蹤應用 - 兒童檔案模型
 * 處理兒童檔案的創建、讀取、更新和刪除操作
 */

const BabyTracker = window.BabyTracker || {};

/**
 * 兒童檔案模型
 */
BabyTracker.ChildModel = (function() {
    // 常量
    const STORE_NAME = BabyTracker.Storage.STORES.CHILDREN;
    
    // 事件名稱
    const EVENTS = {
        CHILD_CREATED: 'child:created',
        CHILD_UPDATED: 'child:updated',
        CHILD_DELETED: 'child:deleted',
        CHILD_LIST_CHANGED: 'child:listChanged'
    };
    
    /**
     * 創建新的兒童檔案
     * @param {Object} childData - 兒童數據
     * @returns {Promise<Object>} 創建的兒童檔案
     */
    const createChild = (childData) => {
        // 檢查必填字段
        if (!childData.name || !childData.birthDate) {
            return Promise.reject(new Error('姓名和出生日期為必填項'));
        }
        
        // 創建唯一ID (如果未提供)
        if (!childData.id) {
            childData.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
        }
        
        // 添加創建和更新時間戳
        const now = new Date().toISOString();
        childData.created = childData.created || now;
        childData.updated = now;
        
        // 保存到存儲
        return BabyTracker.Storage.add(STORE_NAME, childData)
            .then((savedChild) => {
                // 發布兒童創建事件
                BabyTracker.EventBus.publish(EVENTS.CHILD_CREATED, savedChild);
                BabyTracker.EventBus.publish(EVENTS.CHILD_LIST_CHANGED);
                
                return savedChild;
            });
    };
    
    /**
     * 獲取兒童檔案
     * @param {String} childId - 兒童ID
     * @returns {Promise<Object>} 兒童檔案
     */
    const getChild = (childId) => {
        return BabyTracker.Storage.get(STORE_NAME, childId);
    };
    
    /**
     * 更新兒童檔案
     * @param {Object} childData - 兒童數據
     * @returns {Promise<Object>} 更新後的兒童檔案
     */
    const updateChild = (childData) => {
        // 檢查必填字段
        if (!childData.id || !childData.name || !childData.birthDate) {
            return Promise.reject(new Error('ID、姓名和出生日期為必填項'));
        }
        
        // 檢查兒童檔案是否存在
        return getChild(childData.id)
            .then((existingChild) => {
                if (!existingChild) {
                    throw new Error('兒童檔案不存在');
                }
                
                // 更新時間戳
                childData.updated = new Date().toISOString();
                childData.created = existingChild.created;
                
                // 更新存儲
                return BabyTracker.Storage.update(STORE_NAME, childData);
            })
            .then((updatedChild) => {
                // 發布兒童更新事件
                BabyTracker.EventBus.publish(EVENTS.CHILD_UPDATED, updatedChild);
                BabyTracker.EventBus.publish(EVENTS.CHILD_LIST_CHANGED);
                
                return updatedChild;
            });
    };
    
    /**
     * 刪除兒童檔案
     * @param {String} childId - 兒童ID
     * @returns {Promise<Boolean>} 刪除是否成功
     */
    const deleteChild = (childId) => {
        // 檢查兒童檔案是否存在
        return getChild(childId)
            .then((existingChild) => {
                if (!existingChild) {
                    throw new Error('兒童檔案不存在');
                }
                
                // 刪除存儲
                return BabyTracker.Storage.remove(STORE_NAME, childId);
            })
            .then((success) => {
                if (success) {
                    // 發布兒童刪除事件
                    BabyTracker.EventBus.publish(EVENTS.CHILD_DELETED, childId);
                    BabyTracker.EventBus.publish(EVENTS.CHILD_LIST_CHANGED);
                }
                
                return success;
            });
    };
    
    /**
     * 獲取所有兒童檔案列表
     * @returns {Promise<Array>} 兒童檔案列表
     */
    const getAllChildren = () => {
        return BabyTracker.Storage.getAll(STORE_NAME)
            .then((children) => {
                // 按更新時間排序 (最近更新的在前)
                return children.sort((a, b) => {
                    return new Date(b.updated) - new Date(a.updated);
                });
            });
    };
    
    /**
     * 計算兒童當前年齡
     * @param {Object} child - 兒童數據
     * @returns {Object} 年齡信息 {years, months, days, totalDays}
     */
    const calculateAge = (child) => {
        if (!child || !child.birthDate) {
            return { years: 0, months: 0, days: 0, totalDays: 0 };
        }
        
        const birthDate = new Date(child.birthDate);
        const today = new Date();
        
        // 計算總天數
        const totalDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));
        
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();
        
        // 調整月份和年份
        if (days < 0) {
            months--;
            // 獲取上個月的天數
            const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
            days += lastMonth;
        }
        
        if (months < 0) {
            years--;
            months += 12;
        }
        
        return {
            years,
            months,
            days,
            totalDays
        };
    };
    
    /**
     * 獲取下一個發展里程碑
     * @param {Object} child - 兒童數據
     * @returns {Promise<Object>} 下一個里程碑
     */
    const getNextMilestone = (child) => {
        if (!child) {
            return Promise.resolve(null);
        }
        
        // 計算年齡
        const age = calculateAge(child);
        
        // 獲取該兒童的所有里程碑
        return BabyTracker.Storage.getByIndex(
            BabyTracker.Storage.STORES.MILESTONE,
            'childIdIndex',
            child.id
        )
            .then((milestones) => {
                // 按年齡排序所有未完成的里程碑
                const unachievedMilestones = milestones
                    .filter(milestone => !milestone.achievedDate)
                    .sort((a, b) => a.expectedAgeMin - b.expectedAgeMin);
                
                // 找到未來最近的里程碑
                return unachievedMilestones.find(milestone => 
                    milestone.expectedAgeMin > age.totalDays / 30
                ) || null;
            });
    };
    
    /**
     * 格式化年齡顯示
     * @param {Object} age - 年齡對象 {years, months, days}
     * @returns {String} 格式化的年齡字符串
     */
    const formatAge = (age) => {
        if (age.years > 0) {
            return `${age.years}歲${age.months > 0 ? ` ${age.months}個月` : ''}`;
        } else if (age.months > 0) {
            return `${age.months}個月${age.days > 0 ? ` ${age.days}天` : ''}`;
        } else {
            return `${age.days}天`;
        }
    };
    
    // 公開API
    return {
        createChild,
        getChild,
        updateChild,
        deleteChild,
        getAllChildren,
        calculateAge,
        getNextMilestone,
        formatAge,
        EVENTS
    };
})();

// 將模塊導出到全局命名空間
window.BabyTracker = BabyTracker;
