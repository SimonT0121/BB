'use strict';

/**
 * @fileoverview IndexedDB 操作模組 - 負責所有數據庫相關操作
 * @author BabyLog 開發團隊
 * @version 1.0.0
 */

/**
 * IndexedDB 數據庫管理類
 * 封裝所有與 IndexedDB 相關的操作
 */
class BabyLogDB {
  /**
   * 構造函數
   * @param {string} dbName - 數據庫名稱
   * @param {number} dbVersion - 數據庫版本
   */
  constructor(dbName = 'babylogDB', dbVersion = 1) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.db = null;
    
    // 數據庫結構定義
    this.objectStores = {
      children: { 
        keyPath: 'id', 
        autoIncrement: true,
        indexes: [
          { name: 'name', keyPath: 'name', options: { unique: false } },
          { name: 'birthDate', keyPath: 'birthDate', options: { unique: false } }
        ]
      },
      feeding: { 
        keyPath: 'id', 
        autoIncrement: true,
        indexes: [
          { name: 'childId', keyPath: 'childId', options: { unique: false } },
          { name: 'timestamp', keyPath: 'timestamp', options: { unique: false } },
          { name: 'childIdAndTimestamp', keyPath: ['childId', 'timestamp'], options: { unique: false } }
        ]
      },
      sleep: { 
        keyPath: 'id', 
        autoIncrement: true,
        indexes: [
          { name: 'childId', keyPath: 'childId', options: { unique: false } },
          { name: 'startTime', keyPath: 'startTime', options: { unique: false } },
          { name: 'endTime', keyPath: 'endTime', options: { unique: false } },
          { name: 'childIdAndStartTime', keyPath: ['childId', 'startTime'], options: { unique: false } }
        ]
      },
      diaper: { 
        keyPath: 'id', 
        autoIncrement: true,
        indexes: [
          { name: 'childId', keyPath: 'childId', options: { unique: false } },
          { name: 'timestamp', keyPath: 'timestamp', options: { unique: false } },
          { name: 'childIdAndTimestamp', keyPath: ['childId', 'timestamp'], options: { unique: false } }
        ]
      },
      health: { 
        keyPath: 'id', 
        autoIncrement: true,
        indexes: [
          { name: 'childId', keyPath: 'childId', options: { unique: false } },
          { name: 'date', keyPath: 'date', options: { unique: false } },
          { name: 'type', keyPath: 'type', options: { unique: false } },
          { name: 'childIdAndDate', keyPath: ['childId', 'date'], options: { unique: false } }
        ]
      },
      moodBehavior: { 
        keyPath: 'id', 
        autoIncrement: true,
        indexes: [
          { name: 'childId', keyPath: 'childId', options: { unique: false } },
          { name: 'timestamp', keyPath: 'timestamp', options: { unique: false } },
          { name: 'childIdAndTimestamp', keyPath: ['childId', 'timestamp'], options: { unique: false } }
        ]
      },
      milestones: { 
        keyPath: 'id', 
        autoIncrement: true,
        indexes: [
          { name: 'childId', keyPath: 'childId', options: { unique: false } },
          { name: 'date', keyPath: 'date', options: { unique: false } },
          { name: 'category', keyPath: 'category', options: { unique: false } },
          { name: 'childIdAndCategory', keyPath: ['childId', 'category'], options: { unique: false } }
        ]
      },
      interactionLog: { 
        keyPath: 'id', 
        autoIncrement: true,
        indexes: [
          { name: 'childId', keyPath: 'childId', options: { unique: false } },
          { name: 'date', keyPath: 'date', options: { unique: false } },
          { name: 'childIdAndDate', keyPath: ['childId', 'date'], options: { unique: false } }
        ]
      },
      parentReflection: { 
        keyPath: 'id', 
        autoIncrement: true,
        indexes: [
          { name: 'date', keyPath: 'date', options: { unique: false } }
        ]
      }
    };
  }

  /**
   * 初始化數據庫連接
   * @returns {Promise<IDBDatabase>} 數據庫連接對象
   */
  async initDatabase() {
    try {
      return new Promise((resolve, reject) => {
        // 檢查瀏覽器是否支持 IndexedDB
        if (!window.indexedDB) {
          reject(new Error('您的瀏覽器不支持 IndexedDB，無法使用本應用。'));
          return;
        }

        // 打開或創建數據庫
        const request = window.indexedDB.open(this.dbName, this.dbVersion);

        // 處理數據庫升級事件（首次創建或版本更新時觸發）
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          // 創建所有 Object Stores
          for (const [storeName, storeConfig] of Object.entries(this.objectStores)) {
            // 檢查 Object Store 是否已存在
            if (!db.objectStoreNames.contains(storeName)) {
              // 創建 Object Store
              const objectStore = db.createObjectStore(storeName, { 
                keyPath: storeConfig.keyPath, 
                autoIncrement: storeConfig.autoIncrement 
              });
              
              // 為每個 Object Store 創建索引
              if (storeConfig.indexes) {
                storeConfig.indexes.forEach(indexConfig => {
                  objectStore.createIndex(indexConfig.name, indexConfig.keyPath, indexConfig.options);
                });
              }
              
              console.log(`[BabyLogDB] Object Store "${storeName}" 已創建`);
            }
          }
        };

        // 處理成功事件
        request.onsuccess = (event) => {
          this.db = event.target.result;
          console.log(`[BabyLogDB] 數據庫連接成功: ${this.dbName}`);
          resolve(this.db);
        };

        // 處理錯誤事件
        request.onerror = (event) => {
          console.error('[BabyLogDB] 數據庫連接錯誤:', event.target.error);
          reject(new Error('數據庫連接失敗，請確保您的瀏覽器設置允許網站存儲數據。'));
        };
      });
    } catch (error) {
      console.error('[BabyLogDB] 初始化數據庫時出錯:', error);
      throw new Error('初始化數據庫失敗: ' + error.message);
    }
  }

  /**
   * 確保數據庫已連接，如未連接則初始化
   * @returns {Promise<IDBDatabase>} 數據庫連接對象
   * @private
   */
  async _ensureDbConnection() {
    if (this.db) return this.db;
    return this.initDatabase();
  }

  /**
   * 添加新記錄
   * @param {string} storeName - Object Store 名稱
   * @param {Object} data - 要添加的數據對象
   * @returns {Promise<number>} 返回新添加記錄的 ID
   */
  async add(storeName, data) {
    try {
      await this._ensureDbConnection();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        // 添加當前時間戳（如果數據中未提供）
        if (!data.timestamp && !data.date) {
          data.timestamp = new Date().getTime();
        }
        
        const request = store.add(data);
        
        request.onsuccess = (event) => {
          resolve(event.target.result); // 返回新添加記錄的 ID
        };
        
        request.onerror = (event) => {
          console.error(`[BabyLogDB] 添加記錄失敗 (${storeName}):`, event.target.error);
          reject(new Error(`添加記錄失敗: ${event.target.error.message}`));
        };
      });
    } catch (error) {
      console.error(`[BabyLogDB] 添加記錄時出錯 (${storeName}):`, error);
      throw new Error(`添加記錄失敗: ${error.message}`);
    }
  }

  /**
   * 取得單條記錄
   * @param {string} storeName - Object Store 名稱
   * @param {number|string} id - 記錄 ID 或主鍵值
   * @returns {Promise<Object|null>} 返回找到的記錄或 null
   */
  async get(storeName, id) {
    try {
      await this._ensureDbConnection();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        
        request.onsuccess = (event) => {
          resolve(event.target.result || null);
        };
        
        request.onerror = (event) => {
          console.error(`[BabyLogDB] 取得記錄失敗 (${storeName}):`, event.target.error);
          reject(new Error(`取得記錄失敗: ${event.target.error.message}`));
        };
      });
    } catch (error) {
      console.error(`[BabyLogDB] 取得記錄時出錯 (${storeName}):`, error);
      throw new Error(`取得記錄失敗: ${error.message}`);
    }
  }

  /**
   * 更新現有記錄
   * @param {string} storeName - Object Store 名稱
   * @param {Object} data - 要更新的數據對象（必須包含 ID 或主鍵）
   * @returns {Promise<Object>} 返回更新後的記錄
   */
  async update(storeName, data) {
    try {
      await this._ensureDbConnection();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        // 添加更新時間戳（如果適用）
        if (!data.updatedAt) {
          data.updatedAt = new Date().getTime();
        }
        
        const request = store.put(data);
        
        request.onsuccess = (event) => {
          resolve(data);
        };
        
        request.onerror = (event) => {
          console.error(`[BabyLogDB] 更新記錄失敗 (${storeName}):`, event.target.error);
          reject(new Error(`更新記錄失敗: ${event.target.error.message}`));
        };
      });
    } catch (error) {
      console.error(`[BabyLogDB] 更新記錄時出錯 (${storeName}):`, error);
      throw new Error(`更新記錄失敗: ${error.message}`);
    }
  }

  /**
   * 刪除記錄
   * @param {string} storeName - Object Store 名稱
   * @param {number|string} id - 記錄 ID 或主鍵值
   * @returns {Promise<boolean>} 返回是否成功刪除
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
          console.error(`[BabyLogDB] 刪除記錄失敗 (${storeName}):`, event.target.error);
          reject(new Error(`刪除記錄失敗: ${event.target.error.message}`));
        };
      });
    } catch (error) {
      console.error(`[BabyLogDB] 刪除記錄時出錯 (${storeName}):`, error);
      throw new Error(`刪除記錄失敗: ${error.message}`);
    }
  }

  /**
   * 取得所有記錄
   * @param {string} storeName - Object Store 名稱
   * @returns {Promise<Array>} 返回記錄數組
   */
  async getAll(storeName) {
    try {
      await this._ensureDbConnection();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = (event) => {
          resolve(event.target.result || []);
        };
        
        request.onerror = (event) => {
          console.error(`[BabyLogDB] 取得所有記錄失敗 (${storeName}):`, event.target.error);
          reject(new Error(`取得所有記錄失敗: ${event.target.error.message}`));
        };
      });
    } catch (error) {
      console.error(`[BabyLogDB] 取得所有記錄時出錯 (${storeName}):`, error);
      throw new Error(`取得所有記錄失敗: ${error.message}`);
    }
  }

  /**
   * 根據索引查詢記錄
   * @param {string} storeName - Object Store 名稱
   * @param {string} indexName - 索引名稱
   * @param {*} indexValue - 索引值
   * @returns {Promise<Array>} 返回符合條件的記錄數組
   */
  async getByIndex(storeName, indexName, indexValue) {
    try {
      await this._ensureDbConnection();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(indexValue);
        
        request.onsuccess = (event) => {
          resolve(event.target.result || []);
        };
        
        request.onerror = (event) => {
          console.error(`[BabyLogDB] 根據索引查詢失敗 (${storeName}.${indexName}):`, event.target.error);
          reject(new Error(`根據索引查詢失敗: ${event.target.error.message}`));
        };
      });
    } catch (error) {
      console.error(`[BabyLogDB] 根據索引查詢時出錯 (${storeName}.${indexName}):`, error);
      throw new Error(`根據索引查詢失敗: ${error.message}`);
    }
  }

  /**
   * 根據索引範圍查詢記錄
   * @param {string} storeName - Object Store 名稱
   * @param {string} indexName - 索引名稱
   * @param {IDBKeyRange} range - 索引範圍
   * @returns {Promise<Array>} 返回符合條件的記錄數組
   */
  async getByRange(storeName, indexName, range) {
    try {
      await this._ensureDbConnection();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(range);
        
        request.onsuccess = (event) => {
          resolve(event.target.result || []);
        };
        
        request.onerror = (event) => {
          console.error(`[BabyLogDB] 範圍查詢失敗 (${storeName}.${indexName}):`, event.target.error);
          reject(new Error(`範圍查詢失敗: ${event.target.error.message}`));
        };
      });
    } catch (error) {
      console.error(`[BabyLogDB] 範圍查詢時出錯 (${storeName}.${indexName}):`, error);
      throw new Error(`範圍查詢失敗: ${error.message}`);
    }
  }

  /**
   * 獲取特定孩子的指定時間範圍內的記錄
   * @param {string} storeName - Object Store 名稱
   * @param {number|string} childId - 孩子 ID
   * @param {number} startTime - 開始時間戳
   * @param {number} endTime - 結束時間戳
   * @returns {Promise<Array>} 返回符合條件的記錄數組
   */
  async getChildRecordsByTimeRange(storeName, childId, startTime, endTime) {
    try {
      await this._ensureDbConnection();
      
      // 決定使用哪個索引，根據 storeName 來確定
      let indexName, timeField;
      
      if (storeName === 'sleep') {
        indexName = 'childIdAndStartTime';
        timeField = 'startTime';
      } else {
        indexName = 'childIdAndTimestamp';
        timeField = 'timestamp';
      }
      
      // 創建日期範圍
      const range = IDBKeyRange.bound(
        [childId, startTime],
        [childId, endTime]
      );
      
      return this.getByRange(storeName, indexName, range);
    } catch (error) {
      console.error(`[BabyLogDB] 獲取孩子在時間範圍內的記錄時出錯 (${storeName}):`, error);
      throw new Error(`獲取孩子在時間範圍內的記錄失敗: ${error.message}`);
    }
  }

  /**
   * 獲取特定孩子的所有記錄
   * @param {string} storeName - Object Store 名稱
   * @param {number|string} childId - 孩子 ID
   * @returns {Promise<Array>} 返回符合條件的記錄數組
   */
  async getChildRecords(storeName, childId) {
    return this.getByIndex(storeName, 'childId', childId);
  }

  /**
   * 清除整個 Object Store 中的所有數據
   * @param {string} storeName - Object Store 名稱
   * @returns {Promise<boolean>} 返回是否成功清除
   */
  async clear(storeName) {
    try {
      await this._ensureDbConnection();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          console.log(`[BabyLogDB] 已清除 Object Store: ${storeName}`);
          resolve(true);
        };
        
        request.onerror = (event) => {
          console.error(`[BabyLogDB] 清除 Object Store 失敗 (${storeName}):`, event.target.error);
          reject(new Error(`清除數據失敗: ${event.target.error.message}`));
        };
      });
    } catch (error) {
      console.error(`[BabyLogDB] 清除 Object Store 時出錯 (${storeName}):`, error);
      throw new Error(`清除數據失敗: ${error.message}`);
    }
  }

  /**
   * 導出整個數據庫的數據（備份功能）
   * @returns {Promise<Object>} 返回包含所有數據的對象
   */
  async exportDatabase() {
    try {
      await this._ensureDbConnection();
      const exportData = {};
      
      // 遍歷所有 Object Stores 並收集數據
      for (const storeName of Object.keys(this.objectStores)) {
        exportData[storeName] = await this.getAll(storeName);
      }
      
      return exportData;
    } catch (error) {
      console.error('[BabyLogDB] 導出數據庫時出錯:', error);
      throw new Error(`導出數據庫失敗: ${error.message}`);
    }
  }

  /**
   * 導入數據到數據庫（恢復備份）
   * @param {Object} importData - 要導入的數據
   * @param {boolean} clearExisting - 是否在導入前清除現有數據
   * @returns {Promise<boolean>} 返回是否成功導入
   */
  async importDatabase(importData, clearExisting = true) {
    try {
      await this._ensureDbConnection();
      
      // 確認導入數據的格式是否正確
      if (!importData || typeof importData !== 'object') {
        throw new Error('導入數據格式不正確');
      }
      
      // 開始導入過程
      for (const [storeName, data] of Object.entries(importData)) {
        // 檢查 Object Store 是否存在
        if (!this.objectStores[storeName]) {
          console.warn(`[BabyLogDB] 跳過不存在的 Object Store: ${storeName}`);
          continue;
        }
        
        // 如果需要，清除現有數據
        if (clearExisting) {
          await this.clear(storeName);
        }
        
        // 添加數據
        if (Array.isArray(data)) {
          for (const item of data) {
            if (clearExisting) {
              // 避免主鍵衝突，刪除 ID 讓系統自動生成
              const { id, ...newItem } = item;
              await this.add(storeName, newItem);
            } else {
              // 嘗試先更新，如果失敗則添加
              try {
                await this.update(storeName, item);
              } catch (error) {
                const { id, ...newItem } = item;
                await this.add(storeName, newItem);
              }
            }
          }
        }
      }
      
      console.log('[BabyLogDB] 數據庫導入成功');
      return true;
    } catch (error) {
      console.error('[BabyLogDB] 導入數據庫時出錯:', error);
      throw new Error(`導入數據庫失敗: ${error.message}`);
    }
  }
}

// 導出數據庫類
export default BabyLogDB;