/**
 * 嬰幼兒照顧追蹤應用 - 備份服務
 * 提供數據備份和恢復功能
 */

const BabyTracker = window.BabyTracker || {};

/**
 * 備份服務
 */
BabyTracker.BackupService = (function() {
    /**
     * 創建應用數據備份
     * @returns {Promise<Object>} 包含備份數據和元數據的物件
     */
    const createBackup = () => {
        // 顯示備份進度通知
        const notification = BabyTracker.UI.createNotification({
            type: 'info',
            title: '備份進行中',
            message: '正在準備數據備份...',
            duration: 0  // 不自動關閉
        });
        
        return BabyTracker.Storage.exportAllData()
            .then(data => {
                // 添加備份元數據
                const backup = {
                    data: data,
                    metadata: {
                        version: '1.0.0',
                        timestamp: new Date().toISOString(),
                        appName: 'BabyTracker'
                    }
                };
                
                // 關閉進度通知
                notification.close();
                
                // 顯示成功通知
                BabyTracker.UI.createNotification({
                    type: 'success',
                    title: '備份成功',
                    message: '資料備份已準備就緒'
                });
                
                return backup;
            })
            .catch(error => {
                console.error('創建備份時出錯', error);
                
                // 關閉進度通知
                notification.close();
                
                // 顯示錯誤通知
                BabyTracker.UI.createNotification({
                    type: 'danger',
                    title: '備份失敗',
                    message: '無法創建資料備份'
                });
                
                throw error;
            });
    };
    
    /**
     * 從備份恢復應用數據
     * @param {Object} backup - 備份數據
     * @returns {Promise<Object>} 恢復結果
     */
    const restoreFromBackup = (backup) => {
        // 驗證備份數據
        if (!isValidBackup(backup)) {
            return Promise.reject(new Error('無效的備份數據'));
        }
        
        // 顯示恢復進度通知
        const notification = BabyTracker.UI.createNotification({
            type: 'info',
            title: '恢復進行中',
            message: '正在恢復數據...',
            duration: 0  // 不自動關閉
        });
        
        // 開始恢復過程
        return BabyTracker.Storage.importAllData(backup.data)
            .then(result => {
                // 關閉進度通知
                notification.close();
                
                // 顯示成功通知
                BabyTracker.UI.createNotification({
                    type: 'success',
                    title: '恢復成功',
                    message: '資料已成功恢復'
                });
                
                return result;
            })
            .catch(error => {
                console.error('恢復數據時出錯', error);
                
                // 關閉進度通知
                notification.close();
                
                // 顯示錯誤通知
                BabyTracker.UI.createNotification({
                    type: 'danger',
                    title: '恢復失敗',
                    message: '無法恢復資料'
                });
                
                throw error;
            });
    };
    
    /**
     * 驗證備份數據的有效性
     * @param {Object} backup - 備份數據
     * @returns {Boolean} 是否是有效的備份
     */
    const isValidBackup = (backup) => {
        // 檢查基本結構
        if (!backup || typeof backup !== 'object') {
            return false;
        }
        
        // 檢查元數據
        if (!backup.metadata || typeof backup.metadata !== 'object') {
            return false;
        }
        
        // 檢查應用名稱
        if (backup.metadata.appName !== 'BabyTracker') {
            return false;
        }
        
        // 檢查數據
        if (!backup.data || typeof backup.data !== 'object') {
            return false;
        }
        
        // 檢查數據存儲是否存在
        const requiredStores = [
            'user',
            'children'
        ];
        
        for (const store of requiredStores) {
            if (!backup.data[store] || !Array.isArray(backup.data[store])) {
                return false;
            }
        }
        
        return true;
    };
    
    /**
     * 將備份數據導出為文件
     * @param {Object} backup - 備份數據
     * @returns {Blob} 數據文件
     */
    const exportBackupToFile = (backup) => {
        // 將數據轉換為JSON字符串
        const backupJson = JSON.stringify(backup);
        
        // 創建Blob
        const blob = new Blob([backupJson], { type: 'application/json' });
        
        return blob;
    };
    
    /**
     * 從文件導入備份數據
     * @param {File} file - 備份文件
     * @returns {Promise<Object>} 備份數據
     */
    const importBackupFromFile = (file) => {
        return new Promise((resolve, reject) => {
            // 檢查文件類型
            if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
                reject(new Error('無效的文件類型，請選擇JSON文件'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const backup = JSON.parse(event.target.result);
                    
                    // 驗證備份數據
                    if (!isValidBackup(backup)) {
                        reject(new Error('無效的備份文件格式'));
                        return;
                    }
                    
                    resolve(backup);
                } catch (error) {
                    reject(new Error('無法解析備份文件'));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('讀取文件時出錯'));
            };
            
            reader.readAsText(file);
        });
    };
    
    /**
     * 下載備份文件
     * @param {Blob} blob - 備份數據Blob
     * @param {String} filename - 文件名
     */
    const downloadBackup = (blob, filename) => {
        // 創建下載連結
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename || `babytracker-backup-${formatDateForFilename(new Date())}.json`;
        
        // 觸發下載
        document.body.appendChild(link);
        link.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }, 100);
    };
    
    /**
     * 創建並下載備份
     * @returns {Promise<void>}
     */
    const backupAndDownload = () => {
        return createBackup()
            .then(backup => {
                const blob = exportBackupToFile(backup);
                const filename = `babytracker-backup-${formatDateForFilename(new Date())}.json`;
                downloadBackup(blob, filename);
            });
    };
    
    /**
     * 顯示備份確認對話框
     */
    const showBackupConfirmation = () => {
        // 創建確認對話框內容
        const confirmContent = document.createElement('div');
        confirmContent.innerHTML = `
            <p>創建數據備份將導出所有兒童檔案和記錄。您可以使用此備份在將來恢復數據或在其他設備上繼續使用。</p>
            <p>備份文件將以JSON格式下載到您的設備。</p>
        `;
        
        // 創建並顯示模態對話框
        const modal = BabyTracker.UI.createModal({
            title: '創建數據備份',
            content: confirmContent,
            confirmText: '創建備份',
            cancelText: '取消',
            onConfirm: () => {
                backupAndDownload()
                    .catch(error => console.error('備份過程中出錯', error));
            }
        });
        
        modal.open();
    };
    
    /**
     * 顯示恢復確認對話框
     */
    const showRestoreConfirmation = () => {
        // 創建表單元素
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json,application/json';
        fileInput.style.display = 'none';
        
        // 創建確認對話框內容
        const confirmContent = document.createElement('div');
        confirmContent.className = 'restore-confirmation';
        confirmContent.innerHTML = `
            <p>恢復備份將覆蓋當前的所有數據！請確保您已經備份當前數據。</p>
            <p>選擇一個之前創建的備份文件 (.json)：</p>
            <div class="file-upload-area">
                <button type="button" class="primary-button select-file-button">選擇備份文件</button>
                <div class="selected-file">未選擇文件</div>
            </div>
            <div class="restore-warning">
                <strong>警告：</strong> 恢復過程無法撤銷，將覆蓋當前所有數據！
            </div>
        `;
        
        // 獲取選擇按鈕和文件顯示元素
        const selectButton = confirmContent.querySelector('.select-file-button');
        const selectedFileDisplay = confirmContent.querySelector('.selected-file');
        
        // 添加文件選擇事件
        selectButton.addEventListener('click', () => {
            fileInput.click();
        });
        
        // 監聽文件選擇變化
        fileInput.addEventListener('change', () => {
            if (fileInput.files && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                selectedFileDisplay.textContent = file.name;
                selectedFileDisplay.classList.add('file-selected');
            } else {
                selectedFileDisplay.textContent = '未選擇文件';
                selectedFileDisplay.classList.remove('file-selected');
            }
        });
        
        // 添加文件輸入到DOM
        document.body.appendChild(fileInput);
        
        // 創建並顯示模態對話框
        const modal = BabyTracker.UI.createModal({
            title: '恢復數據備份',
            content: confirmContent,
            confirmText: '恢復數據',
            cancelText: '取消',
            onConfirm: () => {
                if (!fileInput.files || fileInput.files.length === 0) {
                    BabyTracker.UI.createNotification({
                        type: 'warning',
                        title: '未選擇文件',
                        message: '請選擇一個備份文件'
                    });
                    return;
                }
                
                // 從文件導入備份
                importBackupFromFile(fileInput.files[0])
                    .then(backup => {
                        // 顯示最終確認
                        showFinalRestoreConfirmation(backup);
                    })
                    .catch(error => {
                        console.error('導入備份文件時出錯', error);
                        BabyTracker.UI.createNotification({
                            type: 'danger',
                            title: '導入失敗',
                            message: error.message || '無法導入備份文件'
                        });
                    });
            },
            onClose: () => {
                // 移除文件輸入
                if (fileInput.parentNode) {
                    fileInput.parentNode.removeChild(fileInput);
                }
            }
        });
        
        modal.open();
    };
    
    /**
     * 顯示最終恢復確認對話框
     * @param {Object} backup - 備份數據
     */
    const showFinalRestoreConfirmation = (backup) => {
        // 獲取備份中的兒童數量
        const childrenCount = backup.data.children ? backup.data.children.length : 0;
        
        // 獲取備份創建時間
        const backupDate = backup.metadata && backup.metadata.timestamp ? 
            new Date(backup.metadata.timestamp) : null;
        
        const formattedDate = backupDate ? 
            backupDate.toLocaleString('zh-TW') : '未知日期';
        
        // 創建確認對話框內容
        const confirmContent = document.createElement('div');
        confirmContent.className = 'final-restore-confirmation';
        confirmContent.innerHTML = `
            <p><strong>備份內容:</strong></p>
            <ul>
                <li>備份日期: ${formattedDate}</li>
                <li>兒童檔案數量: ${childrenCount}</li>
            </ul>
            <div class="restore-warning">
                <strong>最終警告：</strong> 
                <p>恢復操作將<strong>刪除所有當前數據</strong>並替換為備份中的數據。此操作無法撤銷！</p>
                <p>請確認您希望繼續。</p>
            </div>
        `;
        
        // 創建並顯示模態對話框
        const modal = BabyTracker.UI.createModal({
            title: '確認恢復數據',
            content: confirmContent,
            confirmText: '是，恢復數據',
            cancelText: '取消',
            onConfirm: () => {
                // 執行恢復操作
                restoreFromBackup(backup)
                    .then(() => {
                        // 恢復成功後重新加載應用
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    })
                    .catch(error => {
                        console.error('恢復數據時出錯', error);
                    });
            }
        });
        
        modal.open();
    };
    
    /**
     * 自動備份
     * 根據設置自動創建備份
     */
    const autoBackup = () => {
        // 獲取用戶備份設置
        const user = BabyTracker.App.getCurrentUser();
        
        if (!user || !user.settings || !user.settings.autoBackup) {
            return Promise.resolve(false);
        }
        
        // 檢查上次備份時間
        const lastBackup = user.settings.lastAutoBackup;
        const backupFrequency = user.settings.backupFrequency || 7; // 默認7天
        
        const now = new Date();
        const lastBackupDate = lastBackup ? new Date(lastBackup) : null;
        
        // 如果沒有上次備份或超過頻率時間
        if (!lastBackupDate || daysDifference(now, lastBackupDate) >= backupFrequency) {
            return createBackup()
                .then(backup => {
                    // 更新最後備份時間
                    user.settings.lastAutoBackup = now.toISOString();
                    
                    // 保存用戶設置
                    return BabyTracker.Storage.update(
                        BabyTracker.Storage.STORES.USER,
                        user
                    ).then(() => backup);
                })
                .then(backup => {
                    // 如果設置了自動下載
                    if (user.settings.autoBackupDownload) {
                        const blob = exportBackupToFile(backup);
                        const filename = `babytracker-autobackup-${formatDateForFilename(now)}.json`;
                        downloadBackup(blob, filename);
                    }
                    
                    return true;
                });
        }
        
        return Promise.resolve(false);
    };
    
    /**
     * 計算兩個日期之間的天數差異
     * @param {Date} date1 - 第一個日期
     * @param {Date} date2 - 第二個日期
     * @returns {Number} 相差的天數
     */
    const daysDifference = (date1, date2) => {
        const oneDay = 24 * 60 * 60 * 1000; // 毫秒數/天
        const diffTime = Math.abs(date1 - date2);
        return Math.floor(diffTime / oneDay);
    };
    
    /**
     * 格式化日期為文件名格式 (YYYYMMDD-HHMMSS)
     * @param {Date} date - 日期
     * @returns {String} 格式化後的日期字符串
     */
    const formatDateForFilename = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        
        return `${year}${month}${day}-${hours}${minutes}${seconds}`;
    };
    
    // 公開API
    return {
        createBackup,
        restoreFromBackup,
        exportBackupToFile,
        importBackupFromFile,
        downloadBackup,
        backupAndDownload,
        showBackupConfirmation,
        showRestoreConfirmation,
        autoBackup
    };
})();

// 將模塊導出到全局命名空間
window.BabyTracker = BabyTracker;
