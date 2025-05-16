/**
 * db.js - IndexedDB 資料庫操作模組
 * 
 * 此模組封裝所有與 IndexedDB 相關的操作，包括資料庫初始化、
 * 各種 Object Store 的 CRUD 操作，以及事務管理。
 * 
 * @author BabyGrow Team
 * @version 1.0.0
 */

'use strict';

/**
 * BabyDB 類 - 負責所有 IndexedDB 資料庫操作
 */
class BabyDB {
  /**
   * 建構子
   * @param {string} dbName - 資料庫名稱
   * @param {number} dbVersion - 資料庫版本
   */
  constructor(dbName, dbVersion) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.db = null;
  }

  /**
   * 初始化資料庫連接並建立所需的 Object Stores
   * @returns {Promise<IDBDatabase>} 資料庫連接實例
   */
  async initDatabase() {
    try {
      return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
          reject(new Error('您的瀏覽器不支援 IndexedDB，請更新瀏覽器或使用其他現代瀏覽器。'));
          return;
        }

        const request = indexedDB.open(this.dbName, this.dbVersion);

        // 處理資料庫升級或初始化
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          this._createObjectStores(db);
        };

        // 處理資料庫打開成功
        request.onsuccess = (event) => {
          this.db = event.target.result;
          console.log(`資料庫 "${this.dbName}" (v${this.dbVersion}) 連接成功`);
          resolve(this.db);
        };

        // 處理資料庫打開錯誤
        request.onerror = (event) => {
          console.error('資料庫連接錯誤:', event.target.error);
          reject(new Error('無法連接資料庫，請檢查您的瀏覽器設定是否允許 IndexedDB。'));
        };
      });
    } catch (error) {
      console.error('初始化資料庫失敗:', error);
      throw error;
    }
  }

  /**
   * 創建資料庫所需的 Object Stores 和索引
   * @param {IDBDatabase} db - 資料庫連接實例
   * @private
   */
  _createObjectStores(db) {
    // 1. 兒童資訊 Object Store
    if (!db.objectStoreNames.contains('children')) {
      const childrenStore = db.createObjectStore('children', { keyPath: 'id', autoIncrement: true });
      childrenStore.createIndex('nameIndex', 'name', { unique: false });
      childrenStore.createIndex('birthdayIndex', 'birthday', { unique: false });
      console.log('已創建 "children" Object Store');
    }

    // 2. 餵食記錄 Object Store
    if (!db.objectStoreNames.contains('feeding')) {
      const feedingStore = db.createObjectStore('feeding', { keyPath: 'id', autoIncrement: true });
      feedingStore.createIndex('childIdIndex', 'childId', { unique: false });
      feedingStore.createIndex('timestampIndex', 'timestamp', { unique: false });
      feedingStore.createIndex('childTimestampIndex', ['childId', 'timestamp'], { unique: false });
      console.log('已創建 "feeding" Object Store');
    }

    // 3. 睡眠記錄 Object Store
    if (!db.objectStoreNames.contains('sleep')) {
      const sleepStore = db.createObjectStore('sleep', { keyPath: 'id', autoIncrement: true });
      sleepStore.createIndex('childIdIndex', 'childId', { unique: false });
      sleepStore.createIndex('startTimeIndex', 'startTime', { unique: false });
      sleepStore.createIndex('childStartTimeIndex', ['childId', 'startTime'], { unique: false });
      console.log('已創建 "sleep" Object Store');
    }

    // 4. 尿布更換記錄 Object Store
    if (!db.objectStoreNames.contains('diaper')) {
      const diaperStore = db.createObjectStore('diaper', { keyPath: 'id', autoIncrement: true });
      diaperStore.createIndex('childIdIndex', 'childId', { unique: false });
      diaperStore.createIndex('timestampIndex', 'timestamp', { unique: false });
      diaperStore.createIndex('childTimestampIndex', ['childId', 'timestamp'], { unique: false });
      console.log('已創建 "diaper" Object Store');
    }

    // 5. 健康記錄 Object Store
    if (!db.objectStoreNames.contains('health')) {
      const healthStore = db.createObjectStore('health', { keyPath: 'id', autoIncrement: true });
      healthStore.createIndex('childIdIndex', 'childId', { unique: false });
      healthStore.createIndex('dateIndex', 'date', { unique: false });
      healthStore.createIndex('typeIndex', 'type', { unique: false });
      healthStore.createIndex('childDateIndex', ['childId', 'date'], { unique: false });
      healthStore.createIndex('childTypeIndex', ['childId', 'type'], { unique: false });
      console.log('已創建 "health" Object Store');
    }

    // 6. 發展里程碑記錄 Object Store
    if (!db.objectStoreNames.contains('milestone')) {
      const milestoneStore = db.createObjectStore('milestone', { keyPath: 'id', autoIncrement: true });
      milestoneStore.createIndex('childIdIndex', 'childId', { unique: false });
      milestoneStore.createIndex('dateIndex', 'date', { unique: false });
      milestoneStore.createIndex('typeIndex', 'type', { unique: false });
      milestoneStore.createIndex('childTypeIndex', ['childId', 'type'], { unique: false });
      console.log('已創建 "milestone" Object Store');
    }

    // 7. 情緒與行為記錄 Object Store
    if (!db.objectStoreNames.contains('moodBehavior')) {
      const moodStore = db.createObjectStore('moodBehavior', { keyPath: 'id', autoIncrement: true });
      moodStore.createIndex('childIdIndex', 'childId', { unique: false });
      moodStore.createIndex('timestampIndex', 'timestamp', { unique: false });
      moodStore.createIndex('moodIndex', 'mood', { unique: false });
      moodStore.createIndex('childTimestampIndex', ['childId', 'timestamp'], { unique: false });
      console.log('已創建 "moodBehavior" Object Store');
    }

    // 8. 親子互動日記 Object Store
    if (!db.objectStoreNames.contains('interactionLog')) {
      const interactionStore = db.createObjectStore('interactionLog', { keyPath: 'id', autoIncrement: true });
      interactionStore.createIndex('childIdIndex', 'childId', { unique: false });
      interactionStore.createIndex('dateIndex', 'date', { unique: false });
      interactionStore.createIndex('childDateIndex', ['childId', 'date'], { unique: false });
      console.log('已創建 "interactionLog" Object Store');
    }

    // 9. 設定 Object Store
    if (!db.objectStoreNames.contains('settings')) {
      const settingsStore = db.createObjectStore('settings', { keyPath: 'id' });
      console.log('已創建 "settings" Object Store');
    }
  }

  /**
   * 檢查資料庫連接是否存在，不存在則初始化
   * @private
   */
  async _ensureDbConnection() {
    if (!this.db) {
      await this.initDatabase();
    }
  }

  /**
   * 獲取指定 Object Store 的事務
   * @param {string} storeName - Object Store 名稱
   * @param {string} mode - 事務模式 ('readonly' 或 'readwrite')
   * @returns {IDBObjectStore} - Object Store 實例
   * @private
   */
  _getObjectStore(storeName, mode = 'readonly') {
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  /**
   * 新增項目到指定的 Object Store
   * @param {string} storeName - Object Store 名稱
   * @param {Object} data - 要新增的數據
   * @returns {Promise<number>} 新增項目的 ID
   */
  async add(storeName, data) {
    try {
      await this._ensureDbConnection();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        // 添加時間戳（如果尚未提供）
        if (!data.timestamp && !data.date && 
            storeName !== 'children' && storeName !== 'settings') {
          data.timestamp = Date.now();
        }
        
        const request = store.add(data);

        request.onsuccess = (event) => {
          resolve(event.target.result);
        };

        request.onerror = (event) => {
          console.error(`添加到 "${storeName}" 失敗:`, event.target.error);
          reject(new Error(`無法添加數據: ${event.target.error}`));
        };

        transaction.oncomplete = () => {
          console.log(`數據已成功添加到 "${storeName}"`);
        };
      });
    } catch (error) {
      console.error(`添加到 "${storeName}" 失敗:`, error);
      throw error;
    }
  }

  /**
   * 更新指定 Object Store 中的項目
   * @param {string} storeName - Object Store 名稱
   * @param {Object} data - 要更新的數據 (必須包含 keyPath 欄位)
   * @returns {Promise<boolean>} 更新成功返回 true
   */
  async update(storeName, data) {
    try {
      await this._ensureDbConnection();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        // 更新時間戳（如果適用）
        if (storeName !== 'children' && storeName !== 'settings' && 
            !data.updateTimestamp) {
          data.updateTimestamp = Date.now();
        }
        
        const request = store.put(data);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          console.error(`更新 "${storeName}" 中的項目失敗:`, event.target.error);
          reject(new Error(`無法更新數據: ${event.target.error}`));
        };
      });
    } catch (error) {
      console.error(`更新 "${storeName}" 中的項目失敗:`, error);
      throw error;
    }
  }

  /**
   * 從指定的 Object Store 中刪除項目
   * @param {string} storeName - Object Store 名稱
   * @param {number|string} id - 要刪除的項目 ID
   * @returns {Promise<boolean>} 刪除成功返回 true
   */
  async delete(storeName, id) {
    try {
      await this._ensureDbConnection();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          console.error(`從 "${storeName}" 刪除項目失敗:`, event.target.error);
          reject(new Error(`無法刪除數據: ${event.target.error}`));
        };
      });
    } catch (error) {
      console.error(`從 "${storeName}" 刪除項目失敗:`, error);
      throw error;
    }
  }

  /**
   * 從指定的 Object Store 中獲取單個項目
   * @param {string} storeName - Object Store 名稱
   * @param {number|string} id - 要獲取的項目 ID
   * @returns {Promise<Object>} 獲取的項目
   */
  async get(storeName, id) {
    try {
      await this._ensureDbConnection();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = (event) => {
          resolve(event.target.result);
        };

        request.onerror = (event) => {
          console.error(`從 "${storeName}" 獲取項目失敗:`, event.target.error);
          reject(new Error(`無法獲取數據: ${event.target.error}`));
        };
      });
    } catch (error) {
      console.error(`從 "${storeName}" 獲取項目失敗:`, error);
      throw error;
    }
  }

  /**
   * 獲取指定 Object Store 中的所有項目
   * @param {string} storeName - Object Store 名稱
   * @returns {Promise<Array>} 項目數組
   */
  async getAll(storeName) {
    try {
      await this._ensureDbConnection();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = (event) => {
          resolve(event.target.result);
        };

        request.onerror = (event) => {
          console.error(`從 "${storeName}" 獲取所有項目失敗:`, event.target.error);
          reject(new Error(`無法獲取數據: ${event.target.error}`));
        };
      });
    } catch (error) {
      console.error(`從 "${storeName}" 獲取所有項目失敗:`, error);
      throw error;
    }
  }

  /**
   * 使用索引查詢項目
   * @param {string} storeName - Object Store 名稱
   * @param {string} indexName - 索引名稱
   * @param {*} value - 查詢值
   * @returns {Promise<Array>} 匹配的項目數組
   */
  async getByIndex(storeName, indexName, value) {
    try {
      await this._ensureDbConnection();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        
        // 確保索引存在
        if (!store.indexNames.contains(indexName)) {
          reject(new Error(`索引 "${indexName}" 不存在於 "${storeName}"`));
          return;
        }
        
        const index = store.index(indexName);
        const request = index.getAll(value);

        request.onsuccess = (event) => {
          resolve(event.target.result);
        };

        request.onerror = (event) => {
          console.error(`使用索引 "${indexName}" 查詢 "${storeName}" 失敗:`, event.target.error);
          reject(new Error(`索引查詢失敗: ${event.target.error}`));
        };
      });
    } catch (error) {
      console.error(`使用索引 "${indexName}" 查詢 "${storeName}" 失敗:`, error);
      throw error;
    }
  }

  /**
   * 使用複合索引查詢項目
   * @param {string} storeName - Object Store 名稱
   * @param {string} indexName - 複合索引名稱
   * @param {Array} values - 查詢值數組，須與複合索引中的欄位順序相符
   * @returns {Promise<Array>} 匹配的項目數組
   */
  async getByCompositeIndex(storeName, indexName, values) {
    try {
      await this._ensureDbConnection();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        
        // 確保索引存在
        if (!store.indexNames.contains(indexName)) {
          reject(new Error(`複合索引 "${indexName}" 不存在於 "${storeName}"`));
          return;
        }
        
        const index = store.index(indexName);
        // 使用IDBKeyRange.only來匹配精確的複合鍵值
        const keyRange = IDBKeyRange.only(values);
        const request = index.getAll(keyRange);

        request.onsuccess = (event) => {
          resolve(event.target.result);
        };

        request.onerror = (event) => {
          console.error(`使用複合索引 "${indexName}" 查詢 "${storeName}" 失敗:`, event.target.error);
          reject(new Error(`複合索引查詢失敗: ${event.target.error}`));
        };
      });
    } catch (error) {
      console.error(`使用複合索引 "${indexName}" 查詢 "${storeName}" 失敗:`, error);
      throw error;
    }
  }

  /**
   * 使用日期範圍查詢項目
   * @param {string} storeName - Object Store 名稱
   * @param {string} indexName - 日期索引名稱 (如 'timestampIndex' 或 'dateIndex')
   * @param {Date|number} startDate - 範圍開始日期
   * @param {Date|number} endDate - 範圍結束日期
   * @returns {Promise<Array>} 在日期範圍內的項目數組
   */
  async getByDateRange(storeName, indexName, startDate, endDate) {
    try {
      await this._ensureDbConnection();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        
        // 確保索引存在
        if (!store.indexNames.contains(indexName)) {
          reject(new Error(`日期索引 "${indexName}" 不存在於 "${storeName}"`));
          return;
        }
        
        // 轉換日期參數為數字時間戳（如果尚未轉換）
        const start = startDate instanceof Date ? startDate.getTime() : startDate;
        const end = endDate instanceof Date ? endDate.getTime() : endDate;
        
        const index = store.index(indexName);
        // 創建一個範圍查詢
        const keyRange = IDBKeyRange.bound(start, end, false, false);
        const request = index.getAll(keyRange);

        request.onsuccess = (event) => {
          resolve(event.target.result);
        };

        request.onerror = (event) => {
          console.error(`使用日期範圍查詢 "${storeName}" 失敗:`, event.target.error);
          reject(new Error(`日期範圍查詢失敗: ${event.target.error}`));
        };
      });
    } catch (error) {
      console.error(`使用日期範圍查詢 "${storeName}" 失敗:`, error);
      throw error;
    }
  }

  /**
   * 獲取特定子女在日期範圍內的記錄
   * @param {string} storeName - Object Store 名稱
   * @param {string} indexName - 複合索引名稱 (如 'childTimestampIndex')
   * @param {number|string} childId - 子女 ID
   * @param {Date|number} startDate - 範圍開始日期
   * @param {Date|number} endDate - 範圍結束日期
   * @returns {Promise<Array>} 符合條件的項目數組
   */
  async getChildRecordsByDateRange(storeName, indexName, childId, startDate, endDate) {
    try {
      await this._ensureDbConnection();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        
        // 確保索引存在
        if (!store.indexNames.contains(indexName)) {
          reject(new Error(`複合索引 "${indexName}" 不存在於 "${storeName}"`));
          return;
        }
        
        // 轉換日期參數為數字時間戳（如果尚未轉換）
        const start = startDate instanceof Date ? startDate.getTime() : startDate;
        const end = endDate instanceof Date ? endDate.getTime() : endDate;
        
        // 建立游標查詢
        const index = store.index(indexName);
        const results = [];
        
        // 創建範圍約束，第一個元素精確匹配 childId，第二個元素在時間範圍內
        // 注意：由於IDBKeyRange的限制，這裡採用游標遍歷而非直接getAll
        const request = index.openCursor();
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          
          if (cursor) {
            // 檢查是否符合我們的條件（childId 匹配且時間戳在範圍內）
            const [cursorChildId, cursorTimestamp] = cursor.key;
            
            if (cursorChildId === childId && cursorTimestamp >= start && cursorTimestamp <= end) {
              results.push(cursor.value);
            }
            
            // 如果當前 childId 已經大於目標 childId，無需繼續
            // 否則繼續遍歷下一個記錄
            if (cursorChildId > childId) {
              resolve(results);
            } else {
              cursor.continue();
            }
          } else {
            // 遍歷完成，返回結果
            resolve(results);
          }
        };

        request.onerror = (event) => {
          console.error(`獲取子女日期範圍記錄失敗:`, event.target.error);
          reject(new Error(`查詢失敗: ${event.target.error}`));
        };
      });
    } catch (error) {
      console.error(`獲取子女日期範圍記錄失敗:`, error);
      throw error;
    }
  }

  /**
   * 清空指定的 Object Store
   * @param {string} storeName - Object Store 名稱
   * @returns {Promise<boolean>} 清空成功返回 true
   */
  async clearStore(storeName) {
    try {
      await this._ensureDbConnection();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          console.log(`已清空 "${storeName}" Object Store`);
          resolve(true);
        };

        request.onerror = (event) => {
          console.error(`清空 "${storeName}" 失敗:`, event.target.error);
          reject(new Error(`無法清空數據: ${event.target.error}`));
        };
      });
    } catch (error) {
      console.error(`清空 "${storeName}" 失敗:`, error);
      throw error;
    }
  }

  /**
   * 獲取所有數據的備份（按 Object Store 分類）
   * @returns {Promise<Object>} 包含所有數據的物件，按 Object Store 分類
   */
  async exportAllData() {
    try {
      await this._ensureDbConnection();
      
      const exportData = {};
      const storeNames = Array.from(this.db.objectStoreNames);
      
      // 為每個 Object Store 獲取所有數據
      const promises = storeNames.map(async (storeName) => {
        exportData[storeName] = await this.getAll(storeName);
      });
      
      await Promise.all(promises);
      
      // 添加中繼數據
      exportData._metadata = {
        exportDate: new Date().toISOString(),
        dbName: this.dbName,
        dbVersion: this.dbVersion,
        exportVersion: '1.0'
      };
      
      return exportData;
    } catch (error) {
      console.error('導出所有數據失敗:', error);
      throw error;
    }
  }

  /**
   * 從備份數據恢復資料庫
   * @param {Object} importData - 從 exportAllData() 得到的備份數據
   * @returns {Promise<boolean>} 導入成功返回 true
   */
  async importAllData(importData) {
    try {
      await this._ensureDbConnection();
      
      // 驗證導入數據
      if (!importData || typeof importData !== 'object' || !importData._metadata) {
        throw new Error('無效的備份數據格式');
      }
      
      // 獲取 Object Store 名稱列表
      const storeNames = Array.from(this.db.objectStoreNames);
      
      // 開始事務，為每個 Object Store 導入數據
      for (const storeName of storeNames) {
        if (importData[storeName] && Array.isArray(importData[storeName])) {
          
          // 首先清空 Object Store
          await this.clearStore(storeName);
          
          // 然後導入每條記錄
          const records = importData[storeName];
          for (const record of records) {
            await this.add(storeName, record);
          }
          
          console.log(`已成功將 ${records.length} 條記錄導入 "${storeName}"`);
        }
      }
      
      console.log('數據庫恢復完成');
      return true;
    } catch (error) {
      console.error('導入數據失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除整個資料庫
   * @returns {Promise<boolean>} 刪除成功返回 true
   */
  async deleteDatabase() {
    try {
      // 關閉現有連接
      if (this.db) {
        this.db.close();
        this.db = null;
      }

      return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(this.dbName);

        request.onsuccess = () => {
          console.log(`資料庫 "${this.dbName}" 已成功刪除`);
          resolve(true);
        };

        request.onerror = (event) => {
          console.error(`刪除資料庫 "${this.dbName}" 失敗:`, event.target.error);
          reject(new Error(`無法刪除資料庫: ${event.target.error}`));
        };
      });
    } catch (error) {
      console.error(`刪除資料庫 "${this.dbName}" 失敗:`, error);
      throw error;
    }
  }
}

// 導出 BabyDB 類
export default BabyDB;