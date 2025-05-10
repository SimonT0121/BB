/**
 * 嬰幼兒照顧追蹤應用 - 設置控制器
 * 處理應用程序設置和用戶偏好
 */

const BabyTracker = window.BabyTracker || {};

/**
 * 設置控制器
 */
BabyTracker.SettingsController = (function() {
    // 私有變量
    let viewContainer = null;
    let currentUser = null;
    let isInitialized = false;
    
    // DOM 元素引用
    const elements = {};
    
    // 初始化控制器
    const init = (container) => {
        if (isInitialized && container === viewContainer) {
            return Promise.resolve();
        }
        
        viewContainer = container;
        isInitialized = true;
        
        // 獲取當前用戶
        currentUser = BabyTracker.App.getCurrentUser();
        
        if (!currentUser) {
            renderError('無法獲取用戶資料');
            return Promise.resolve();
        }
        
        // 渲染設置頁面
        render();
        
        // 綁定事件
        bindEvents();
        
        return Promise.resolve();
    };
    
    // 渲染設置頁面
    const render = () => {
        if (!viewContainer) return;
        
        // 清空容器
        viewContainer.innerHTML = '';
        
        // 創建設置容器
        const settingsContainer = document.createElement('div');
        settingsContainer.className = 'settings-container';
        
        // 設置頁面標題
        const pageHeader = document.createElement('div');
        pageHeader.className = 'page-header';
        pageHeader.innerHTML = `
            <h1 class="page-title">設置</h1>
            <p class="page-subtitle">自定義您的應用程序設置與偏好</p>
        `;
        settingsContainer.appendChild(pageHeader);
        
        // 添加設置區段
        settingsContainer.appendChild(createAppearanceSection());
        settingsContainer.appendChild(createNotificationsSection());
        settingsContainer.appendChild(createDataSection());
        settingsContainer.appendChild(createAboutSection());
        
        // 添加到視圖容器
        viewContainer.appendChild(settingsContainer);
        
        // 緩存DOM元素引用
        cacheElementReferences();
    };
    
    // 創建外觀設置區段
    const createAppearanceSection = () => {
        const section = BabyTracker.UI.createCard({
            title: '外觀與顯示',
            icon: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z',
            classes: 'settings-card'
        });
        
        const cardContent = section.querySelector('.card-content');
        
        // 主題設置
        const themeGroup = document.createElement('div');
        themeGroup.className = 'settings-group';
        
        const themeLabel = document.createElement('label');
        themeLabel.className = 'settings-label';
        themeLabel.textContent = '主題模式';
        themeGroup.appendChild(themeLabel);
        
        const themeToggle = document.createElement('div');
        themeToggle.className = 'theme-toggle-switch';
        
        const themeInput = document.createElement('input');
        themeInput.type = 'checkbox';
        themeInput.id = 'theme-toggle-input';
        themeInput.checked = currentUser.settings.theme === BabyTracker.App.THEMES.DARK;
        
        const themeSlider = document.createElement('label');
        themeSlider.className = 'toggle-slider';
        themeSlider.setAttribute('for', 'theme-toggle-input');
        
        const themeIcons = document.createElement('div');
        themeIcons.className = 'toggle-icons';
        themeIcons.innerHTML = `
            <svg class="light-icon" viewBox="0 0 24 24" width="16" height="16">
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z"></path>
            </svg>
            <svg class="dark-icon" viewBox="0 0 24 24" width="16" height="16">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"></path>
            </svg>
        `;
        
        themeToggle.appendChild(themeInput);
        themeToggle.appendChild(themeIcons);
        themeToggle.appendChild(themeSlider);
        
        themeGroup.appendChild(themeToggle);
        cardContent.appendChild(themeGroup);
        
        // 語言設置
        const languageGroup = document.createElement('div');
        languageGroup.className = 'settings-group';
        
        const languageLabel = document.createElement('label');
        languageLabel.className = 'settings-label';
        languageLabel.textContent = '語言';
        languageGroup.appendChild(languageLabel);
        
        const languageSelect = document.createElement('select');
        languageSelect.id = 'language-select';
        languageSelect.className = 'settings-select';
        
        const languages = [
            { value: 'zh-TW', text: '繁體中文' },
            { value: 'en-US', text: 'English (US)' },
            { value: 'zh-CN', text: '简体中文' }
        ];
        
        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.value;
            option.textContent = lang.text;
            option.selected = currentUser.settings.language === lang.value;
            languageSelect.appendChild(option);
        });
        
        languageGroup.appendChild(languageSelect);
        cardContent.appendChild(languageGroup);
        
        // 時間格式設置
        const timeFormatGroup = document.createElement('div');
        timeFormatGroup.className = 'settings-group';
        
        const timeFormatLabel = document.createElement('label');
        timeFormatLabel.className = 'settings-label';
        timeFormatLabel.textContent = '時間格式';
        timeFormatGroup.appendChild(timeFormatLabel);
        
        const timeFormatRadioGroup = document.createElement('div');
        timeFormatRadioGroup.className = 'radio-group';
        
        const timeFormats = [
            { value: '12', text: '12小時制 (AM/PM)' },
            { value: '24', text: '24小時制' }
        ];
        
        timeFormats.forEach(format => {
            const radioWrapper = document.createElement('div');
            radioWrapper.className = 'radio-wrapper';
            
            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.id = `time-format-${format.value}`;
            radioInput.name = 'time-format';
            radioInput.value = format.value;
            radioInput.checked = (currentUser.settings.timeFormat || '24') === format.value;
            
            const radioLabel = document.createElement('label');
            radioLabel.setAttribute('for', `time-format-${format.value}`);
            radioLabel.textContent = format.text;
            
            radioWrapper.appendChild(radioInput);
            radioWrapper.appendChild(radioLabel);
            timeFormatRadioGroup.appendChild(radioWrapper);
        });
        
        timeFormatGroup.appendChild(timeFormatRadioGroup);
        cardContent.appendChild(timeFormatGroup);
        
        return section;
    };
    
    // 創建通知設置區段
    const createNotificationsSection = () => {
        const section = BabyTracker.UI.createCard({
            title: '通知與提醒',
            icon: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z',
            classes: 'settings-card'
        });
        
        const cardContent = section.querySelector('.card-content');
        
        // 啟用通知設置
        const notificationGroup = document.createElement('div');
        notificationGroup.className = 'settings-group';
        
        const notificationLabel = document.createElement('label');
        notificationLabel.className = 'settings-label';
        notificationLabel.textContent = '啟用通知';
        notificationGroup.appendChild(notificationLabel);
        
        const notificationToggle = document.createElement('div');
        notificationToggle.className = 'toggle-switch';
        
        const notificationInput = document.createElement('input');
        notificationInput.type = 'checkbox';
        notificationInput.id = 'notification-toggle';
        notificationInput.checked = currentUser.settings.notifications !== false;
        
        const notificationSlider = document.createElement('label');
        notificationSlider.className = 'toggle-slider';
        notificationSlider.setAttribute('for', 'notification-toggle');
        
        notificationToggle.appendChild(notificationInput);
        notificationToggle.appendChild(notificationSlider);
        
        notificationGroup.appendChild(notificationToggle);
        cardContent.appendChild(notificationGroup);
        
        // 提醒類型設置 (餵食、睡眠等)
        const reminderTypesGroup = document.createElement('div');
        reminderTypesGroup.className = 'settings-group reminder-types';
        reminderTypesGroup.style.display = notificationInput.checked ? 'block' : 'none';
        
        const reminderTypesList = document.createElement('div');
        reminderTypesList.className = 'reminder-types-list';
        
        const reminderTypes = [
            { id: 'feeding', text: '餵食提醒', icon: 'M11 8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h2c.55 0 1-.45 1-1s-.45-1-1-1h-2V4c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1z' },
            { id: 'sleep', text: '睡眠提醒', icon: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z' },
            { id: 'diaper', text: '尿布提醒', icon: 'M18.5 2h-13C4.67 2 4 2.67 4 3.5v17c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-17c0-.83-.67-1.5-1.5-1.5z' },
            { id: 'vaccine', text: '疫苗提醒', icon: 'M19.3 5.3l-4.6-4.6c-.7-.7-1.8-.7-2.5 0l-4.6 4.6c-.7.7-.7 1.8 0 2.5l4.6 4.6c.7.7 1.8.7 2.5 0l4.6-4.6c.7-.7.7-1.9 0-2.5zm-8.3.7c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z' },
            { id: 'medicine', text: '用藥提醒', icon: 'M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z' },
            { id: 'appointment', text: '就診提醒', icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z' }
        ];
        
        // 獲取用戶設置的提醒類型
        const userReminderTypes = currentUser.settings.reminderTypes || {};
        
        reminderTypes.forEach(type => {
            const typeItem = document.createElement('div');
            typeItem.className = 'reminder-type-item';
            
            const typeToggle = document.createElement('div');
            typeToggle.className = 'toggle-switch small';
            
            const typeInput = document.createElement('input');
            typeInput.type = 'checkbox';
            typeInput.id = `reminder-type-${type.id}`;
            typeInput.checked = userReminderTypes[type.id] !== false; // 默認啟用
            
            const typeSlider = document.createElement('label');
            typeSlider.className = 'toggle-slider';
            typeSlider.setAttribute('for', `reminder-type-${type.id}`);
            
            typeToggle.appendChild(typeInput);
            typeToggle.appendChild(typeSlider);
            
            const typeLabel = document.createElement('label');
            typeLabel.className = 'reminder-type-label';
            typeLabel.setAttribute('for', `reminder-type-${type.id}`);
            
            const typeIcon = document.createElement('span');
            typeIcon.className = 'reminder-type-icon';
            typeIcon.innerHTML = `
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="${type.icon}"></path>
                </svg>
            `;
            typeLabel.appendChild(typeIcon);
            
            const typeText = document.createElement('span');
            typeText.textContent = type.text;
            typeLabel.appendChild(typeText);
            
            typeItem.appendChild(typeLabel);
            typeItem.appendChild(typeToggle);
            
            reminderTypesList.appendChild(typeItem);
        });
        
        reminderTypesGroup.appendChild(reminderTypesList);
        cardContent.appendChild(reminderTypesGroup);
        
        // 靜音時間設置
        const quietHoursGroup = document.createElement('div');
        quietHoursGroup.className = 'settings-group';
        quietHoursGroup.style.display = notificationInput.checked ? 'block' : 'none';
        
        const quietHoursLabel = document.createElement('label');
        quietHoursLabel.className = 'settings-label';
        quietHoursLabel.textContent = '靜音時間';
        quietHoursGroup.appendChild(quietHoursLabel);
        
        const quietHoursToggle = document.createElement('div');
        quietHoursToggle.className = 'toggle-switch';
        
        const quietHoursInput = document.createElement('input');
        quietHoursInput.type = 'checkbox';
        quietHoursInput.id = 'quiet-hours-toggle';
        quietHoursInput.checked = currentUser.settings.quietHours && currentUser.settings.quietHours.enabled;
        
        const quietHoursSlider = document.createElement('label');
        quietHoursSlider.className = 'toggle-slider';
        quietHoursSlider.setAttribute('for', 'quiet-hours-toggle');
        
        quietHoursToggle.appendChild(quietHoursInput);
        quietHoursToggle.appendChild(quietHoursSlider);
        
        quietHoursGroup.appendChild(quietHoursToggle);
        
        // 靜音時間設置
        const quietHoursTimeGroup = document.createElement('div');
        quietHoursTimeGroup.className = 'quiet-hours-time';
        quietHoursTimeGroup.style.display = quietHoursInput.checked ? 'flex' : 'none';
        
        // 靜音開始時間
        const startTimeGroup = document.createElement('div');
        startTimeGroup.className = 'time-input-group';
        
        const startTimeLabel = document.createElement('label');
        startTimeLabel.setAttribute('for', 'quiet-hours-start');
        startTimeLabel.textContent = '開始時間';
        startTimeGroup.appendChild(startTimeLabel);
        
        const startTimeInput = document.createElement('input');
        startTimeInput.type = 'time';
        startTimeInput.id = 'quiet-hours-start';
        startTimeInput.className = 'time-input';
        startTimeInput.value = currentUser.settings.quietHours && currentUser.settings.quietHours.start || '22:00';
        startTimeGroup.appendChild(startTimeInput);
        
        quietHoursTimeGroup.appendChild(startTimeGroup);
        
        // 靜音結束時間
        const endTimeGroup = document.createElement('div');
        endTimeGroup.className = 'time-input-group';
        
        const endTimeLabel = document.createElement('label');
        endTimeLabel.setAttribute('for', 'quiet-hours-end');
        endTimeLabel.textContent = '結束時間';
        endTimeGroup.appendChild(endTimeLabel);
        
        const endTimeInput = document.createElement('input');
        endTimeInput.type = 'time';
        endTimeInput.id = 'quiet-hours-end';
        endTimeInput.className = 'time-input';
        endTimeInput.value = currentUser.settings.quietHours && currentUser.settings.quietHours.end || '07:00';
        endTimeGroup.appendChild(endTimeInput);
        
        quietHoursTimeGroup.appendChild(endTimeGroup);
        
        quietHoursGroup.appendChild(quietHoursTimeGroup);
        cardContent.appendChild(quietHoursGroup);
        
        // 設置通知顯示/隱藏邏輯
        notificationInput.addEventListener('change', () => {
            reminderTypesGroup.style.display = notificationInput.checked ? 'block' : 'none';
            quietHoursGroup.style.display = notificationInput.checked ? 'block' : 'none';
        });
        
        // 設置靜音時間顯示/隱藏邏輯
        quietHoursInput.addEventListener('change', () => {
            quietHoursTimeGroup.style.display = quietHoursInput.checked ? 'flex' : 'none';
        });
        
        return section;
    };
    
    // 創建數據設置區段
    const createDataSection = () => {
        const section = BabyTracker.UI.createCard({
            title: '數據管理',
            icon: 'M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z',
            classes: 'settings-card'
        });
        
        const cardContent = section.querySelector('.card-content');
        
        // 自動備份設置
        const autoBackupGroup = document.createElement('div');
        autoBackupGroup.className = 'settings-group';
        
        const autoBackupLabel = document.createElement('label');
        autoBackupLabel.className = 'settings-label';
        autoBackupLabel.textContent = '自動備份';
        autoBackupGroup.appendChild(autoBackupLabel);
        
        const autoBackupToggle = document.createElement('div');
        autoBackupToggle.className = 'toggle-switch';
        
        const autoBackupInput = document.createElement('input');
        autoBackupInput.type = 'checkbox';
        autoBackupInput.id = 'auto-backup-toggle';
        autoBackupInput.checked = currentUser.settings.autoBackup !== false;
        
        const autoBackupSlider = document.createElement('label');
        autoBackupSlider.className = 'toggle-slider';
        autoBackupSlider.setAttribute('for', 'auto-backup-toggle');
        
        autoBackupToggle.appendChild(autoBackupInput);
        autoBackupToggle.appendChild(autoBackupSlider);
        
        autoBackupGroup.appendChild(autoBackupToggle);
        cardContent.appendChild(autoBackupGroup);
        
        // 備份頻率設置
        const backupFrequencyGroup = document.createElement('div');
        backupFrequencyGroup.className = 'settings-group';
        backupFrequencyGroup.style.display = autoBackupInput.checked ? 'block' : 'none';
        
        const backupFrequencyLabel = document.createElement('label');
        backupFrequencyLabel.className = 'settings-label';
        backupFrequencyLabel.textContent = '備份頻率';
        backupFrequencyGroup.appendChild(backupFrequencyLabel);
        
        const backupFrequencySelect = document.createElement('select');
        backupFrequencySelect.id = 'backup-frequency-select';
        backupFrequencySelect.className = 'settings-select';
        
        const frequencies = [
            { value: '1', text: '每天' },
            { value: '7', text: '每週' },
            { value: '30', text: '每月' }
        ];
        
        frequencies.forEach(freq => {
            const option = document.createElement('option');
            option.value = freq.value;
            option.textContent = freq.text;
            option.selected = (currentUser.settings.backupFrequency || '7') === freq.value;
            backupFrequencySelect.appendChild(option);
        });
        
        backupFrequencyGroup.appendChild(backupFrequencySelect);
        cardContent.appendChild(backupFrequencyGroup);
        
        // 自動下載備份設置
        const autoDownloadGroup = document.createElement('div');
        autoDownloadGroup.className = 'settings-group';
        autoDownloadGroup.style.display = autoBackupInput.checked ? 'block' : 'none';
        
        const autoDownloadLabel = document.createElement('label');
        autoDownloadLabel.className = 'settings-label';
        autoDownloadLabel.textContent = '自動下載備份';
        autoDownloadGroup.appendChild(autoDownloadLabel);
        
        const autoDownloadToggle = document.createElement('div');
        autoDownloadToggle.className = 'toggle-switch';
        
        const autoDownloadInput = document.createElement('input');
        autoDownloadInput.type = 'checkbox';
        autoDownloadInput.id = 'auto-download-toggle';
        autoDownloadInput.checked = currentUser.settings.autoBackupDownload === true;
        
        const autoDownloadSlider = document.createElement('label');
        autoDownloadSlider.className = 'toggle-slider';
        autoDownloadSlider.setAttribute('for', 'auto-download-toggle');
        
        autoDownloadToggle.appendChild(autoDownloadInput);
        autoDownloadToggle.appendChild(autoDownloadSlider);
        
        autoDownloadGroup.appendChild(autoDownloadToggle);
        cardContent.appendChild(autoDownloadGroup);
        
        // 數據保留期設置
        const dataRetentionGroup = document.createElement('div');
        dataRetentionGroup.className = 'settings-group';
        
        const dataRetentionLabel = document.createElement('label');
        dataRetentionLabel.className = 'settings-label';
        dataRetentionLabel.textContent = '數據保留期';
        dataRetentionGroup.appendChild(dataRetentionLabel);
        
        const dataRetentionSelect = document.createElement('select');
        dataRetentionSelect.id = 'data-retention-select';
        dataRetentionSelect.className = 'settings-select';
        
        const retentionOptions = [
            { value: '90', text: '3個月' },
            { value: '180', text: '6個月' },
            { value: '365', text: '1年' },
            { value: '730', text: '2年' },
            { value: '0', text: '永久保留' }
        ];
        
        retentionOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            optionElement.selected = (currentUser.settings.dataRetention || '365') === option.value;
            dataRetentionSelect.appendChild(optionElement);
        });
        
        dataRetentionGroup.appendChild(dataRetentionSelect);
        cardContent.appendChild(dataRetentionGroup);
        
        // 手動備份與恢復按鈕
        const backupActionsGroup = document.createElement('div');
        backupActionsGroup.className = 'settings-group backup-actions';
        
        const backupButton = document.createElement('button');
        backupButton.id = 'create-backup-button';
        backupButton.className = 'primary-button';
        backupButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"></path>
            </svg>
            創建備份
        `;
        backupActionsGroup.appendChild(backupButton);
        
        const restoreButton = document.createElement('button');
        restoreButton.id = 'restore-backup-button';
        restoreButton.className = 'secondary-button';
        restoreButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5-5-5 5h3v4h4v-4h3z"></path>
            </svg>
            恢復備份
        `;
        backupActionsGroup.appendChild(restoreButton);
        
        cardContent.appendChild(backupActionsGroup);
        
        // 自動備份顯示/隱藏邏輯
        autoBackupInput.addEventListener('change', () => {
            backupFrequencyGroup.style.display = autoBackupInput.checked ? 'block' : 'none';
            autoDownloadGroup.style.display = autoBackupInput.checked ? 'block' : 'none';
        });
        
        return section;
    };
    
    // 創建關於區段
    const createAboutSection = () => {
        const section = BabyTracker.UI.createCard({
            title: '關於應用',
            icon: 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
            classes: 'settings-card'
        });
        
        const cardContent = section.querySelector('.card-content');
        
        // 版本信息
        const versionInfo = document.createElement('div');
        versionInfo.className = 'version-info';
        versionInfo.innerHTML = `
            <h3 class="app-name">寶寶成長記錄</h3>
            <p class="app-version">版本 1.0.0</p>
        `;
        cardContent.appendChild(versionInfo);
        
        // 應用說明
        const appDescription = document.createElement('div');
        appDescription.className = 'app-description';
        appDescription.innerHTML = `
            <p>本應用為嬰幼兒照顧追蹤工具，幫助父母和照顧者記錄嬰幼兒的日常活動、健康狀況和發展歷程。</p>
            <p>數據僅存儲在您的設備上，請定期備份以防數據丟失。</p>
        `;
        cardContent.appendChild(appDescription);
        
        // 聯繫與反饋
        const contactInfo = document.createElement('div');
        contactInfo.className = 'contact-info';
        contactInfo.innerHTML = `
            <h4>反饋與支持</h4>
            <p>如有問題或建議，請通過以下方式聯繫我們：</p>
            <a href="mailto:support@babytracker.example.com" class="contact-link">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
                </svg>
                support@babytracker.example.com
            </a>
        `;
        cardContent.appendChild(contactInfo);
        
        // 隱私聲明
        const privacyInfo = document.createElement('div');
        privacyInfo.className = 'privacy-info';
        privacyInfo.innerHTML = `
            <h4>隱私聲明</h4>
            <p>本應用不收集任何個人數據，所有信息僅存儲在您的設備上。</p>
            <p>多設備使用時，數據需通過手動備份和恢復進行同步。</p>
        `;
        cardContent.appendChild(privacyInfo);
        
        return section;
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
        errorMessage.textContent = message || '無法載入設置';
        errorView.appendChild(errorMessage);
        
        // 重試按鈕
        const retryButton = document.createElement('button');
        retryButton.className = 'primary-button retry-button';
        retryButton.textContent = '重試';
        
        retryButton.addEventListener('click', () => {
            // 重新初始化設置頁面
            init(viewContainer);
        });
        
        errorView.appendChild(retryButton);
        
        // 添加到視圖容器
        viewContainer.appendChild(errorView);
    };
    
    // 緩存DOM元素引用
    const cacheElementReferences = () => {
        // 外觀設置
        elements.themeToggle = document.getElementById('theme-toggle-input');
        elements.languageSelect = document.getElementById('language-select');
        elements.timeFormatRadios = document.querySelectorAll('input[name="time-format"]');
        
        // 通知設置
        elements.notificationToggle = document.getElementById('notification-toggle');
        elements.reminderTypeToggles = document.querySelectorAll('input[id^="reminder-type-"]');
        elements.quietHoursToggle = document.getElementById('quiet-hours-toggle');
        elements.quietHoursStart = document.getElementById('quiet-hours-start');
        elements.quietHoursEnd = document.getElementById('quiet-hours-end');
        
        // 數據設置
        elements.autoBackupToggle = document.getElementById('auto-backup-toggle');
        elements.backupFrequencySelect = document.getElementById('backup-frequency-select');
        elements.autoDownloadToggle = document.getElementById('auto-download-toggle');
        elements.dataRetentionSelect = document.getElementById('data-retention-select');
        elements.createBackupButton = document.getElementById('create-backup-button');
        elements.restoreBackupButton = document.getElementById('restore-backup-button');
    };
    
    // 綁定事件
    const bindEvents = () => {
        // 外觀設置事件
        elements.themeToggle.addEventListener('change', () => {
            const newTheme = elements.themeToggle.checked ? 
                BabyTracker.App.THEMES.DARK : BabyTracker.App.THEMES.LIGHT;
            
            // 更新用戶設置
            updateUserSetting('theme', newTheme);
            
            // 應用主題
            BabyTracker.App.toggleTheme();
        });
        
        elements.languageSelect.addEventListener('change', () => {
            updateUserSetting('language', elements.languageSelect.value);
        });
        
        elements.timeFormatRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    updateUserSetting('timeFormat', radio.value);
                }
            });
        });
        
        // 通知設置事件
        elements.notificationToggle.addEventListener('change', () => {
            updateUserSetting('notifications', elements.notificationToggle.checked);
        });
        
        elements.reminderTypeToggles.forEach(toggle => {
            toggle.addEventListener('change', () => {
                const typeId = toggle.id.replace('reminder-type-', '');
                
                // 更新提醒類型設置
                if (!currentUser.settings.reminderTypes) {
                    currentUser.settings.reminderTypes = {};
                }
                
                currentUser.settings.reminderTypes[typeId] = toggle.checked;
                saveUserSettings();
            });
        });
        
        elements.quietHoursToggle.addEventListener('change', () => {
            if (!currentUser.settings.quietHours) {
                currentUser.settings.quietHours = {
                    enabled: elements.quietHoursToggle.checked,
                    start: elements.quietHoursStart.value,
                    end: elements.quietHoursEnd.value
                };
            } else {
                currentUser.settings.quietHours.enabled = elements.quietHoursToggle.checked;
            }
            
            saveUserSettings();
        });
        
        elements.quietHoursStart.addEventListener('change', () => {
            if (!currentUser.settings.quietHours) {
                currentUser.settings.quietHours = {
                    enabled: elements.quietHoursToggle.checked,
                    start: elements.quietHoursStart.value,
                    end: elements.quietHoursEnd.value
                };
            } else {
                currentUser.settings.quietHours.start = elements.quietHoursStart.value;
            }
            
            saveUserSettings();
        });
        
        elements.quietHoursEnd.addEventListener('change', () => {
            if (!currentUser.settings.quietHours) {
                currentUser.settings.quietHours = {
                    enabled: elements.quietHoursToggle.checked,
                    start: elements.quietHoursStart.value,
                    end: elements.quietHoursEnd.value
                };
            } else {
                currentUser.settings.quietHours.end = elements.quietHoursEnd.value;
            }
            
            saveUserSettings();
        });
        
        // 數據設置事件
        elements.autoBackupToggle.addEventListener('change', () => {
            updateUserSetting('autoBackup', elements.autoBackupToggle.checked);
        });
        
        elements.backupFrequencySelect.addEventListener('change', () => {
            updateUserSetting('backupFrequency', elements.backupFrequencySelect.value);
        });
        
        elements.autoDownloadToggle.addEventListener('change', () => {
            updateUserSetting('autoBackupDownload', elements.autoDownloadToggle.checked);
        });
        
        elements.dataRetentionSelect.addEventListener('change', () => {
            updateUserSetting('dataRetention', elements.dataRetentionSelect.value);
        });
        
        // 備份按鈕事件
        elements.createBackupButton.addEventListener('click', () => {
            BabyTracker.BackupService.showBackupConfirmation();
        });
        
        elements.restoreBackupButton.addEventListener('click', () => {
            BabyTracker.BackupService.showRestoreConfirmation();
        });
    };
    
    // 更新用戶設置
    const updateUserSetting = (key, value) => {
        if (!currentUser || !currentUser.settings) {
            return;
        }
        
        currentUser.settings[key] = value;
        saveUserSettings();
    };
    
    // 保存用戶設置
    const saveUserSettings = () => {
        if (!currentUser) {
            return Promise.reject(new Error('用戶數據不存在'));
        }
        
        return BabyTracker.Storage.update(
            BabyTracker.Storage.STORES.USER,
            currentUser
        )
            .then(() => {
                // 發布用戶變更事件
                BabyTracker.EventBus.publish(BabyTracker.App.EVENTS.USER_CHANGED, currentUser);
            })
            .catch(error => {
                console.error('保存用戶設置時出錯', error);
                BabyTracker.UI.createNotification({
                    type: 'danger',
                    title: '保存失敗',
                    message: '無法保存設置，請重試'
                });
                
                throw error;
            });
    };
    
    // 清理資源
    const cleanup = () => {
        // 保存當前的設置
        if (currentUser) {
            saveUserSettings()
                .catch(error => console.error('清理時保存設置出錯', error));
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
