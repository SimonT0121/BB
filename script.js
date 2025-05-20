// 數據庫維護功能
function initDatabaseMaintenance() {
    // 在設定頁面添加數據庫維護區塊
    const settingsContainer = document.querySelector('.settings-container');
    if (!settingsContainer) return;
    
    // 創建維護區塊
    const maintenanceGroup = document.createElement('div');
    maintenanceGroup.className = 'settings-group';
    maintenanceGroup.innerHTML = `
        <div class="maintenance-header">
            <h3>數據庫維護</h3>
            <span class="maintenance-badge">進階</span>
        </div>
        <div class="setting-item">
            <button id="repair-database-btn" class="primary-btn">
                <i class="fas fa-wrench"></i> 修復數據庫
            </button>
        </div>
        <div class="setting-item">
            <div id="db-console" class="db-console">
                <div class="console-content"></div>
                <button id="clear-console-btn" class="secondary-btn">
                    <i class="fas fa-trash"></i> 清除訊息
                </button>
            </div>
        </div>
    `;
    
    // 添加到設定頁面
    settingsContainer.appendChild(maintenanceGroup);
    
    // 添加事件監聽器
    document.getElementById('repair-database-btn').addEventListener('click', repairDatabase);
    document.getElementById('clear-console-btn').addEventListener('click', clearConsole);
}

// 記錄訊息到控制台
function logToConsole(message, type = 'info') {
    const consoleContent = document.querySelector('.console-content');
    if (!consoleContent) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `console-message console-${type}`;
    messageDiv.textContent = message;
    
    consoleContent.appendChild(messageDiv);
    
    // 滾動到底部
    const dbConsole = document.getElementById('db-console');
    if (dbConsole) {
        dbConsole.scrollTop = dbConsole.scrollHeight;
    }
}

// 清除控制台
function clearConsole() {
    const consoleContent = document.querySelector('.console-content');
    if (consoleContent) {
        consoleContent.innerHTML = '';
        logToConsole('控制台已清除', 'info');
    }
}

// 修復數據庫
async function repairDatabase() {
    logToConsole('開始檢查數據庫結構...', 'info');
    
    // 檢查數據庫結構
    try {
        const dbInfo = {
            objectStores: Array.from(db.objectStoreNames)
        };
        
        logToConsole(`存儲區: ${dbInfo.objectStores.join(', ')}`, 'info');
        
        // 檢查是否缺少存儲區
        const missingStores = [];
        for (const storeName in STORES) {
            const storeValue = STORES[storeName];
            if (!dbInfo.objectStores.includes(storeValue)) {
                missingStores.push(storeValue);
                logToConsole(`存儲區 ${storeValue} 不存在!`, 'error');
            } else {
                logToConsole(`存儲區 ${storeValue} 存在`, 'success');
            }
        }
        
        if (missingStores.length > 0) {
            logToConsole(`發現缺少的存儲區: ${missingStores.join(', ')}`, 'warning');
            
            if (confirm('需要重新創建數據庫以修復結構，這可能會導致部分數據丟失。建議先備份現有數據。是否繼續？')) {
                // 關閉現有數據庫連接
                db.close();
                
                // 刪除並重新創建數據庫
                await deleteAndRecreateDatabase();
            } else {
                logToConsole('取消修復操作', 'warning');
            }
        } else {
            // 檢查健康測量存儲區的索引
            if (dbInfo.objectStores.includes(STORES.HEALTH_MEASUREMENTS)) {
                const transaction = db.transaction(STORES.HEALTH_MEASUREMENTS, "readonly");
                const store = transaction.objectStore(STORES.HEALTH_MEASUREMENTS);
                const indexNames = Array.from(store.indexNames);
                
                logToConsole(`健康測量存儲區的索引: ${indexNames.join(', ')}`, 'info');
                
                // 檢查必要的索引是否存在
                const requiredIndices = ['childId', 'timestamp', 'type', 'childId_type_timestamp'];
                const missingIndices = requiredIndices.filter(index => !indexNames.includes(index));
                
                if (missingIndices.length > 0) {
                    logToConsole(`健康測量存儲區缺少索引: ${missingIndices.join(', ')}`, 'warning');
                    
                    if (confirm('需要重新創建數據庫以修復索引，這可能會導致部分數據丟失。建議先備份現有數據。是否繼續？')) {
                        // 關閉現有數據庫連接
                        db.close();
                        
                        // 刪除並重新創建數據庫
                        await deleteAndRecreateDatabase();
                    } else {
                        logToConsole('取消修復操作', 'warning');
                    }
                } else {
                    logToConsole('數據庫結構完整，無需修復', 'success');
                }
            }
        }
    } catch (error) {
        logToConsole(`檢查數據庫時發生錯誤: ${error.message}`, 'error');
    }
}

// 刪除並重新創建數據庫
async function deleteAndRecreateDatabase() {
    try {
        logToConsole('正在刪除現有數據庫...', 'warning');
        
        // 保存現有數據
        const dataBackup = {};
        for (const storeName in STORES) {
            const storeValue = STORES[storeName];
            try {
                if (Array.from(db.objectStoreNames).includes(storeValue)) {
                    dataBackup[storeValue] = await getAllRecords(storeValue);
                    logToConsole(`已備份 ${storeValue} 數據: ${dataBackup[storeValue].length} 條記錄`, 'info');
                }
            } catch (e) {
                logToConsole(`備份 ${storeValue} 數據時出錯: ${e.message}`, 'error');
            }
        }
        
        // 關閉數據庫連接
        db.close();
        
        // 刪除數據庫
        await new Promise((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
            
            deleteRequest.onsuccess = function() {
                logToConsole('數據庫刪除成功', 'success');
                resolve();
            };
            
            deleteRequest.onerror = function(event) {
                logToConsole(`數據庫刪除失敗: ${event.target.error}`, 'error');
                reject(event.target.error);
            };
        });
        
        // 重新初始化數據庫
        logToConsole('正在重新創建數據庫...', 'info');
        await initDatabase();
        
        // 恢復備份的數據
        logToConsole('正在恢復數據...', 'info');
        for (const storeName in dataBackup) {
            if (dataBackup[storeName] && dataBackup[storeName].length > 0) {
                try {
                    for (const record of dataBackup[storeName]) {
                        await addRecord(storeName, record);
                    }
                    logToConsole(`已恢復 ${storeName} 數據: ${dataBackup[storeName].length} 條記錄`, 'success');
                } catch (e) {
                    logToConsole(`恢復 ${storeName} 數據時出錯: ${e.message}`, 'error');
                }
            }
        }
        
        // 重新載入頁面以套用變更
        logToConsole('數據庫修復完成，將在 3 秒後重新載入頁面...', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    } catch (error) {
        logToConsole(`修復數據庫時發生錯誤: ${error.message}`, 'error');
    }
}