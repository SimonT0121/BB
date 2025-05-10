/**
 * 嬰幼兒照顧追蹤應用 - UI組件工廠
 * 實現工廠模式創建一致的UI元素
 */

const BabyTracker = window.BabyTracker || {};

/**
 * UI 組件工廠
 * 提供創建各種UI元素的方法
 */
BabyTracker.UI = (function() {
    /**
     * 創建基本卡片元素
     * @param {Object} options - 卡片選項
     * @param {String} options.title - 卡片標題
     * @param {String} options.icon - 卡片圖標 (SVG 路徑)
     * @param {String} options.color - 卡片顏色 (CSS 變量名)
     * @param {Boolean} options.collapsible - 卡片是否可折疊
     * @param {Boolean} options.collapsed - 卡片是否默認折疊
     * @param {String} options.classes - 額外的CSS類
     * @param {Function} options.onCollapse - 折疊回調函數
     * @returns {HTMLElement} 卡片元素
     */
    const createCard = (options) => {
        const defaults = {
            title: '',
            icon: null,
            color: null,
            collapsible: false,
            collapsed: false,
            classes: '',
            onCollapse: null
        };
        
        const settings = Object.assign({}, defaults, options);
        
        // 創建卡片容器
        const card = document.createElement('div');
        card.className = `card ${settings.classes}`;
        if (settings.color) {
            card.style.setProperty('--card-accent-color', `var(--${settings.color})`);
        }
        
        // 創建卡片頭部
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        
        // 創建標題區域
        const titleArea = document.createElement('div');
        titleArea.className = 'card-title-area';
        
        // 如果有圖標，添加圖標
        if (settings.icon) {
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'card-icon';
            iconWrapper.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24"><path d="${settings.icon}"></path></svg>`;
            titleArea.appendChild(iconWrapper);
        }
        
        // 添加標題
        const titleElement = document.createElement('h2');
        titleElement.className = 'card-title';
        titleElement.textContent = settings.title;
        titleArea.appendChild(titleElement);
        
        cardHeader.appendChild(titleArea);
        
        // 如果可折疊，添加折疊按鈕
        if (settings.collapsible) {
            const collapseButton = document.createElement('button');
            collapseButton.className = 'card-collapse-button';
            collapseButton.innerHTML = `
                <svg class="collapse-icon" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path>
                </svg>
                <svg class="expand-icon" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path>
                </svg>
            `;
            collapseButton.setAttribute('aria-label', '折疊卡片');
            collapseButton.setAttribute('type', 'button');
            
            // 添加折疊事件
            collapseButton.addEventListener('click', (e) => {
                card.classList.toggle('collapsed');
                
                // 執行折疊回調
                if (typeof settings.onCollapse === 'function') {
                    settings.onCollapse(card.classList.contains('collapsed'));
                }
            });
            
            cardHeader.appendChild(collapseButton);
            
            // 如果默認折疊，添加collapsed類
            if (settings.collapsed) {
                card.classList.add('collapsed');
            }
        }
        
        // 創建卡片內容
        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';
        
        // 組裝卡片
        card.appendChild(cardHeader);
        card.appendChild(cardContent);
        
        return card;
    };
    
    /**
     * 在卡片中創建數據摘要
     * @param {Object} options - 摘要選項
     * @param {String} options.label - 標籤文本
     * @param {String} options.value - 數值
     * @param {String} options.unit - 單位
     * @param {String} options.icon - 圖標 (SVG 路徑)
     * @param {String} options.trend - 趨勢 ('up', 'down', 或 null)
     * @param {String} options.trendValue - 趨勢值 (例如: '+15%')
     * @param {Boolean} options.positive - 趨勢是否為積極的 (綠色向上/紅色向下，或相反)
     * @returns {HTMLElement} 摘要元素
     */
    const createDataSummary = (options) => {
        const defaults = {
            label: '',
            value: '',
            unit: '',
            icon: null,
            trend: null,
            trendValue: '',
            positive: true
        };
        
        const settings = Object.assign({}, defaults, options);
        
        // 創建摘要容器
        const summary = document.createElement('div');
        summary.className = 'data-summary';
        
        // 如果有圖標，添加圖標
        if (settings.icon) {
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'summary-icon';
            iconWrapper.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24"><path d="${settings.icon}"></path></svg>`;
            summary.appendChild(iconWrapper);
        }
        
        // 創建內容容器
        const content = document.createElement('div');
        content.className = 'summary-content';
        
        // 添加標籤
        const label = document.createElement('div');
        label.className = 'summary-label';
        label.textContent = settings.label;
        content.appendChild(label);
        
        // 創建數值行
        const valueLine = document.createElement('div');
        valueLine.className = 'summary-value-line';
        
        // 添加主要數值
        const value = document.createElement('div');
        value.className = 'summary-value';
        value.textContent = settings.value;
        valueLine.appendChild(value);
        
        // 如果有單位，添加單位
        if (settings.unit) {
            const unit = document.createElement('div');
            unit.className = 'summary-unit';
            unit.textContent = settings.unit;
            valueLine.appendChild(unit);
        }
        
        content.appendChild(valueLine);
        
        // 如果有趨勢，添加趨勢
        if (settings.trend) {
            const trend = document.createElement('div');
            trend.className = `summary-trend ${settings.trend} ${settings.positive ? 'positive' : 'negative'}`;
            
            // 添加趨勢圖標
            const trendIcon = document.createElement('span');
            trendIcon.className = 'trend-icon';
            
            if (settings.trend === 'up') {
                trendIcon.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 14l5-5 5 5z"></path></svg>`;
            } else {
                trendIcon.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 10l5 5 5-5z"></path></svg>`;
            }
            
            trend.appendChild(trendIcon);
            
            // 添加趨勢值
            const trendValue = document.createElement('span');
            trendValue.className = 'trend-value';
            trendValue.textContent = settings.trendValue;
            trend.appendChild(trendValue);
            
            content.appendChild(trend);
        }
        
        summary.appendChild(content);
        
        return summary;
    };
    
    /**
     * 創建表單元素
     * @param {String} type - 輸入類型 ('text', 'number', 'select', 'radio', 'checkbox', 'textarea', 'date', 'time')
     * @param {Object} options - 表單元素選項
     * @returns {HTMLElement} 表單元素
     */
    const createFormElement = (type, options) => {
        const defaults = {
            id: '',
            name: '',
            label: '',
            value: '',
            placeholder: '',
            required: false,
            disabled: false,
            readOnly: false,
            options: [], // 用於select、radio和checkbox
            classes: '',
            attributes: {}, // 額外屬性
            validators: [], // 驗證器函數數組
            errorMessage: '', // 默認錯誤消息
            helpText: '', // 幫助文本
            onChange: null, // 變更回調
            onFocus: null, // 獲取焦點回調
            onBlur: null // 失去焦點回調
        };
        
        const settings = Object.assign({}, defaults, options);
        
        // 創建表單組容器
        const formGroup = document.createElement('div');
        formGroup.className = `form-group ${settings.classes}`;
        
        // 添加標籤 (select, radio, checkbox 除外)
        if (settings.label && type !== 'radio' && type !== 'checkbox') {
            const label = document.createElement('label');
            label.setAttribute('for', settings.id);
            label.className = 'form-label';
            
            const labelText = document.createElement('span');
            labelText.textContent = settings.label;
            label.appendChild(labelText);
            
            // 如果必填，添加必填標記
            if (settings.required) {
                const requiredMark = document.createElement('span');
                requiredMark.className = 'required-mark';
                requiredMark.textContent = '*';
                label.appendChild(requiredMark);
            }
            
            formGroup.appendChild(label);
        }
        
        let inputElement;
        
        // 根據類型創建不同的輸入元素
        switch(type) {
            case 'select':
                inputElement = document.createElement('select');
                
                // 添加選項
                settings.options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option.value;
                    optionElement.textContent = option.text;
                    
                    if (option.value === settings.value) {
                        optionElement.selected = true;
                    }
                    
                    inputElement.appendChild(optionElement);
                });
                break;
                
            case 'textarea':
                inputElement = document.createElement('textarea');
                inputElement.value = settings.value;
                break;
                
            case 'radio':
            case 'checkbox':
                // 創建容器
                inputElement = document.createElement('div');
                inputElement.className = `${type}-group`;
                
                // 添加選項
                settings.options.forEach(option => {
                    const wrapper = document.createElement('div');
                    wrapper.className = `${type}-wrapper`;
                    
                    const input = document.createElement('input');
                    input.type = type;
                    input.id = `${settings.id}-${option.value}`;
                    input.name = settings.name;
                    input.value = option.value;
                    
                    // 檢查是否選中
                    if (type === 'radio' && option.value === settings.value) {
                        input.checked = true;
                    } else if (type === 'checkbox' && Array.isArray(settings.value) && settings.value.includes(option.value)) {
                        input.checked = true;
                    }
                    
                    // 添加事件監聽器
                    if (settings.onChange) {
                        input.addEventListener('change', settings.onChange);
                    }
                    
                    const label = document.createElement('label');
                    label.setAttribute('for', `${settings.id}-${option.value}`);
                    label.textContent = option.text;
                    
                    wrapper.appendChild(input);
                    wrapper.appendChild(label);
                    
                    inputElement.appendChild(wrapper);
                });
                break;
                
            default: // text, number, date, time 等
                inputElement = document.createElement('input');
                inputElement.type = type;
                inputElement.value = settings.value;
                
                // 對於數字類型，添加 min, max, step 屬性
                if (type === 'number' && settings.attributes) {
                    if (settings.attributes.min !== undefined) {
                        inputElement.min = settings.attributes.min;
                    }
                    if (settings.attributes.max !== undefined) {
                        inputElement.max = settings.attributes.max;
                    }
                    if (settings.attributes.step !== undefined) {
                        inputElement.step = settings.attributes.step;
                    }
                }
        }
        
        // 添加通用屬性 (除了radio和checkbox之外)
        if (type !== 'radio' && type !== 'checkbox') {
            inputElement.id = settings.id;
            inputElement.name = settings.name;
            inputElement.className = `form-control form-${type}`;
            
            if (settings.placeholder) {
                inputElement.placeholder = settings.placeholder;
            }
            
            if (settings.required) {
                inputElement.required = true;
            }
            
            if (settings.disabled) {
                inputElement.disabled = true;
            }
            
            if (settings.readOnly) {
                inputElement.readOnly = true;
            }
            
            // 添加事件監聽器
            if (settings.onChange) {
                inputElement.addEventListener('change', settings.onChange);
            }
            
            if (settings.onFocus) {
                inputElement.addEventListener('focus', settings.onFocus);
            }
            
            if (settings.onBlur) {
                inputElement.addEventListener('blur', settings.onBlur);
            }
            
            // 添加驗證
            if (settings.validators && settings.validators.length > 0) {
                inputElement.addEventListener('blur', () => {
                    const errorContainer = formGroup.querySelector('.error-message');
                    
                    for (const validator of settings.validators) {
                        const isValid = validator.func(inputElement.value);
                        
                        if (!isValid) {
                            inputElement.classList.add('invalid');
                            
                            if (errorContainer) {
                                errorContainer.textContent = validator.message || settings.errorMessage;
                                errorContainer.style.display = 'block';
                            }
                            
                            return;
                        }
                    }
                    
                    // 如果所有驗證都通過
                    inputElement.classList.remove('invalid');
                    
                    if (errorContainer) {
                        errorContainer.textContent = '';
                        errorContainer.style.display = 'none';
                    }
                });
            }
        }
        
        // 添加其他自定義屬性
        if (settings.attributes) {
            for (const [key, value] of Object.entries(settings.attributes)) {
                // 跳過數字輸入框特殊屬性，因為已經處理過了
                if (type === 'number' && (key === 'min' || key === 'max' || key === 'step')) {
                    continue;
                }
                
                inputElement.setAttribute(key, value);
            }
        }
        
        // 將輸入元素添加到表單組
        formGroup.appendChild(inputElement);
        
        // 添加幫助文本
        if (settings.helpText) {
            const helpText = document.createElement('div');
            helpText.className = 'help-text';
            helpText.textContent = settings.helpText;
            formGroup.appendChild(helpText);
        }
        
        // 添加錯誤消息容器
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-message';
        errorContainer.style.display = 'none';
        formGroup.appendChild(errorContainer);
        
        return formGroup;
    };
    
    /**
     * 創建表格元素
     * @param {Object} options - 表格選項
     * @param {Array} options.columns - 列定義 [{id, title, width, sortable, renderer}]
     * @param {Array} options.data - 表格數據
     * @param {Boolean} options.sortable - 表格是否可排序
     * @param {Function} options.onRowClick - 行點擊回調
     * @param {Boolean} options.selectable - 是否可選擇行
     * @param {Array} options.selectedRows - 已選行的ID
     * @param {Function} options.onSelectionChange - 選擇變更回調
     * @returns {HTMLElement} 表格元素
     */
    const createTable = (options) => {
        const defaults = {
            columns: [],
            data: [],
            sortable: false,
            onRowClick: null,
            selectable: false,
            selectedRows: [],
            onSelectionChange: null
        };
        
        const settings = Object.assign({}, defaults, options);
        
        // 創建表格容器
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        
        // 創建表格
        const table = document.createElement('table');
        table.className = 'data-table';
        
        // 創建表頭
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // 如果可選擇，添加選擇列
        if (settings.selectable) {
            const selectAllCell = document.createElement('th');
            selectAllCell.className = 'selection-cell';
            
            const selectAllCheckbox = document.createElement('input');
            selectAllCheckbox.type = 'checkbox';
            selectAllCheckbox.className = 'select-all-checkbox';
            
            // 當所有行都被選中時，選中全選框
            const allSelected = settings.data.length > 0 && 
                settings.data.every(row => settings.selectedRows.includes(row.id));
            selectAllCheckbox.checked = allSelected;
            
            // 添加全選/取消全選事件
            selectAllCheckbox.addEventListener('change', () => {
                const checkboxes = table.querySelectorAll('.row-checkbox');
                const selectedIds = [];
                
                checkboxes.forEach(checkbox => {
                    checkbox.checked = selectAllCheckbox.checked;
                    
                    if (selectAllCheckbox.checked) {
                        const rowId = checkbox.getAttribute('data-row-id');
                        selectedIds.push(rowId);
                    }
                });
                
                // 調用選擇變更回調
                if (settings.onSelectionChange) {
                    settings.onSelectionChange(selectAllCheckbox.checked ? selectedIds : []);
                }
            });
            
            selectAllCell.appendChild(selectAllCheckbox);
            headerRow.appendChild(selectAllCell);
        }
        
        // 添加列頭
        settings.columns.forEach(column => {
            const th = document.createElement('th');
            
            if (column.width) {
                th.style.width = column.width;
            }
            
            const titleWrapper = document.createElement('div');
            titleWrapper.className = 'th-content';
            titleWrapper.textContent = column.title;
            
            // 如果列可排序，添加排序圖標
            if (settings.sortable && column.sortable !== false) {
                th.classList.add('sortable');
                
                const sortIcon = document.createElement('div');
                sortIcon.className = 'sort-icon';
                sortIcon.innerHTML = `
                    <svg class="sort-up" viewBox="0 0 24 24" width="16" height="16">
                        <path d="M7 14l5-5 5 5z"></path>
                    </svg>
                    <svg class="sort-down" viewBox="0 0 24 24" width="16" height="16">
                        <path d="M7 10l5 5 5-5z"></path>
                    </svg>
                `;
                
                titleWrapper.appendChild(sortIcon);
                
                // 添加排序事件
                th.addEventListener('click', () => {
                    const isAsc = th.classList.contains('sort-asc');
                    
                    // 先清除所有排序類
                    headerRow.querySelectorAll('th').forEach(cell => {
                        cell.classList.remove('sort-asc', 'sort-desc');
                    });
                    
                    // 設置新的排序方向
                    th.classList.add(isAsc ? 'sort-desc' : 'sort-asc');
                    
                    // 排序數據
                    settings.data.sort((a, b) => {
                        let valA = a[column.id];
                        let valB = b[column.id];
                        
                        // 使用自定義排序函數 (如果有)
                        if (column.sortFn) {
                            return isAsc ? 
                                column.sortFn(valB, valA) : 
                                column.sortFn(valA, valB);
                        }
                        
                        // 默認排序邏輯
                        if (typeof valA === 'string') {
                            valA = valA.toLowerCase();
                            valB = valB.toLowerCase();
                        }
                        
                        if (valA < valB) return isAsc ? 1 : -1;
                        if (valA > valB) return isAsc ? -1 : 1;
                        return 0;
                    });
                    
                    // 重新渲染表格內容
                    renderTableBody();
                });
            }
            
            th.appendChild(titleWrapper);
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // 創建表格主體
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        
        // 渲染表格主體
        const renderTableBody = () => {
            // 清空表格主體
            tbody.innerHTML = '';
            
            // 如果沒有數據，顯示空行
            if (settings.data.length === 0) {
                const emptyRow = document.createElement('tr');
                emptyRow.className = 'empty-row';
                
                const emptyCell = document.createElement('td');
                emptyCell.colSpan = settings.columns.length + (settings.selectable ? 1 : 0);
                emptyCell.textContent = '沒有數據';
                
                emptyRow.appendChild(emptyCell);
                tbody.appendChild(emptyRow);
                return;
            }
            
            // 為每行數據創建行
            settings.data.forEach(rowData => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', rowData.id);
                
                // 如果有行點擊事件，添加點擊類和事件
                if (settings.onRowClick) {
                    row.classList.add('clickable');
                    row.addEventListener('click', (e) => {
                        // 如果點擊的是複選框，不觸發行點擊事件
                        if (e.target.type === 'checkbox') {
                            return;
                        }
                        
                        settings.onRowClick(rowData);
                    });
                }
                
                // 如果可選擇，添加選擇列
                if (settings.selectable) {
                    const selectCell = document.createElement('td');
                    selectCell.className = 'selection-cell';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'row-checkbox';
                    checkbox.setAttribute('data-row-id', rowData.id);
                    
                    // 檢查是否預選
                    if (settings.selectedRows.includes(rowData.id)) {
                        checkbox.checked = true;
                        row.classList.add('selected');
                    }
                    
                    // 添加選擇事件
                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked) {
                            row.classList.add('selected');
                        } else {
                            row.classList.remove('selected');
                        }
                        
                        // 更新全選框狀態
                        if (settings.selectable) {
                            const allChecked = Array.from(tbody.querySelectorAll('.row-checkbox'))
                                .every(cb => cb.checked);
                            
                            const selectAllCheckbox = table.querySelector('.select-all-checkbox');
                            if (selectAllCheckbox) {
                                selectAllCheckbox.checked = allChecked;
                            }
                        }
                        
                        // 獲取所有選中的行ID
                        const selectedIds = Array.from(tbody.querySelectorAll('.row-checkbox:checked'))
                            .map(cb => cb.getAttribute('data-row-id'));
                        
                        // 調用選擇變更回調
                        if (settings.onSelectionChange) {
                            settings.onSelectionChange(selectedIds);
                        }
                    });
                    
                    selectCell.appendChild(checkbox);
                    row.appendChild(selectCell);
                }
                
                // 添加數據列
                settings.columns.forEach(column => {
                    const cell = document.createElement('td');
                    
                    // 使用自定義渲染函數 (如果有)
                    if (column.renderer) {
                        cell.innerHTML = column.renderer(rowData[column.id], rowData);
                    } else {
                        cell.textContent = rowData[column.id] || '';
                    }
                    
                    row.appendChild(cell);
                });
                
                tbody.appendChild(row);
            });
        };
        
        // 初始渲染表格主體
        renderTableBody();
        
        tableContainer.appendChild(table);
        
        // 提供更新數據的方法
        tableContainer.updateData = (newData) => {
            settings.data = newData;
            renderTableBody();
        };
        
        // 提供獲取選中行的方法
        tableContainer.getSelectedRows = () => {
            return Array.from(tbody.querySelectorAll('.row-checkbox:checked'))
                .map(cb => cb.getAttribute('data-row-id'));
        };
        
        return tableContainer;
    };
    
    /**
     * 創建標籤頁組件
     * @param {Object} options - 標籤頁選項
     * @param {Array} options.tabs - 標籤定義 [{id, title, content, active}]
     * @param {Function} options.onTabChange - 標籤變更回調
     * @returns {HTMLElement} 標籤頁元素
     */
    const createTabs = (options) => {
        const defaults = {
            tabs: [],
            onTabChange: null
        };
        
        const settings = Object.assign({}, defaults, options);
        
        // 創建標籤頁容器
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'tabs-container';
        
        // 創建標籤頭部
        const tabsHeader = document.createElement('div');
        tabsHeader.className = 'tabs-header';
        
        // 創建標籤內容區
        const tabsContent = document.createElement('div');
        tabsContent.className = 'tabs-content';
        
        // 添加標籤
        settings.tabs.forEach(tab => {
            // 創建標籤按鈕
            const tabButton = document.createElement('button');
            tabButton.className = `tab-button ${tab.active ? 'active' : ''}`;
            tabButton.setAttribute('data-tab', tab.id);
            tabButton.textContent = tab.title;
            
            // 添加標籤切換事件
            tabButton.addEventListener('click', () => {
                // 移除其他標籤的活動狀態
                tabsHeader.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // 隱藏所有標籤內容
                tabsContent.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                
                // 激活當前標籤
                tabButton.classList.add('active');
                
                // 顯示對應的標籤內容
                const tabPane = tabsContent.querySelector(`.tab-pane[data-tab="${tab.id}"]`);
                if (tabPane) {
                    tabPane.classList.add('active');
                }
                
                // 調用標籤變更回調
                if (settings.onTabChange) {
                    settings.onTabChange(tab.id);
                }
            });
            
            tabsHeader.appendChild(tabButton);
            
            // 創建標籤內容
            const tabPane = document.createElement('div');
            tabPane.className = `tab-pane ${tab.active ? 'active' : ''}`;
            tabPane.setAttribute('data-tab', tab.id);
            
            // 如果內容是HTML元素，直接添加
            if (tab.content instanceof HTMLElement) {
                tabPane.appendChild(tab.content);
            } else if (typeof tab.content === 'string') {
                // 如果內容是字符串，設置為innerHTML
                tabPane.innerHTML = tab.content;
            }
            
            tabsContent.appendChild(tabPane);
        });
        
        // 組裝標籤頁
        tabsContainer.appendChild(tabsHeader);
        tabsContainer.appendChild(tabsContent);
        
        // 提供設置活動標籤的方法
        tabsContainer.setActiveTab = (tabId) => {
            const tabButton = tabsHeader.querySelector(`.tab-button[data-tab="${tabId}"]`);
            
            if (tabButton) {
                tabButton.click();
            }
        };
        
        // 提供添加新標籤的方法
        tabsContainer.addTab = (tab) => {
            // 創建標籤按鈕
            const tabButton = document.createElement('button');
            tabButton.className = 'tab-button';
            tabButton.setAttribute('data-tab', tab.id);
            tabButton.textContent = tab.title;
            
            // 添加標籤切換事件
            tabButton.addEventListener('click', () => {
                // 移除其他標籤的活動狀態
                tabsHeader.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // 隱藏所有標籤內容
                tabsContent.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                
                // 激活當前標籤
                tabButton.classList.add('active');
                
                // 顯示對應的標籤內容
                const tabPane = tabsContent.querySelector(`.tab-pane[data-tab="${tab.id}"]`);
                if (tabPane) {
                    tabPane.classList.add('active');
                }
                
                // 調用標籤變更回調
                if (settings.onTabChange) {
                    settings.onTabChange(tab.id);
                }
            });
            
            tabsHeader.appendChild(tabButton);
            
            // 創建標籤內容
            const tabPane = document.createElement('div');
            tabPane.className = 'tab-pane';
            tabPane.setAttribute('data-tab', tab.id);
            
            // 如果內容是HTML元素，直接添加
            if (tab.content instanceof HTMLElement) {
                tabPane.appendChild(tab.content);
            } else if (typeof tab.content === 'string') {
                // 如果內容是字符串，設置為innerHTML
                tabPane.innerHTML = tab.content;
            }
            
            tabsContent.appendChild(tabPane);
            
            // 如果是活動標籤，激活它
            if (tab.active) {
                tabButton.click();
            }
        };
        
        return tabsContainer;
    };
    
    /**
     * 創建模態對話框
     * @param {Object} options - 模態對話框選項
     * @returns {Object} 模態對話框方法
     */
    const createModal = (options) => {
        const defaults = {
            id: `modal-${Date.now()}`,
            title: '',
            content: '',
            footer: true,
            closeButton: true,
            cancelButton: true,
            confirmButton: true,
            cancelText: '取消',
            confirmText: '確認',
            size: 'medium', // 'small', 'medium', 'large', 'fullscreen'
            onOpen: null,
            onClose: null,
            onCancel: null,
            onConfirm: null
        };
        
        const settings = Object.assign({}, defaults, options);
        
        // 檢查是否已存在相同ID的模態對話框
        let existingModal = document.getElementById(settings.id);
        if (existingModal) {
            // 如果存在，先移除
            existingModal.parentNode.removeChild(existingModal);
        }
        
        // 創建模態對話框容器
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        modalContainer.id = settings.id;
        
        // 創建模態對話框遮罩層
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        
        // 點擊遮罩層關閉模態對話框 (可選)
        if (settings.closeOnOverlay) {
            modalOverlay.addEventListener('click', () => {
                closeModal();
            });
        }
        
        // 創建模態對話框
        const modal = document.createElement('div');
        modal.className = `modal modal-${settings.size}`;
        
        // 創建模態對話框頭部
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        
        // 添加標題
        const modalTitle = document.createElement('h2');
        modalTitle.className = 'modal-title';
        modalTitle.textContent = settings.title;
        modalHeader.appendChild(modalTitle);
        
        // 添加關閉按鈕
        if (settings.closeButton) {
            const closeButton = document.createElement('button');
            closeButton.className = 'modal-close';
            closeButton.innerHTML = `
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </svg>
            `;
            closeButton.setAttribute('aria-label', '關閉');
            closeButton.setAttribute('type', 'button');
            
            // 添加關閉事件
            closeButton.addEventListener('click', closeModal);
            
            modalHeader.appendChild(closeButton);
        }
        
        // 創建模態對話框內容
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        
        // 如果內容是HTML元素，直接添加
        if (settings.content instanceof HTMLElement) {
            modalBody.appendChild(settings.content);
        } else if (typeof settings.content === 'string') {
            // 如果內容是字符串，設置為innerHTML
            modalBody.innerHTML = settings.content;
        }
        
        // 創建模態對話框底部
        let modalFooter;
        if (settings.footer) {
            modalFooter = document.createElement('div');
            modalFooter.className = 'modal-footer';
            
            // 添加取消按鈕
            if (settings.cancelButton) {
                const cancelButton = document.createElement('button');
                cancelButton.className = 'secondary-button';
                cancelButton.textContent = settings.cancelText;
                cancelButton.setAttribute('type', 'button');
                
                // 添加取消事件
                cancelButton.addEventListener('click', () => {
                    if (settings.onCancel) {
                        settings.onCancel();
                    }
                    
                    closeModal();
                });
                
                modalFooter.appendChild(cancelButton);
            }
            
            // 添加確認按鈕
            if (settings.confirmButton) {
                const confirmButton = document.createElement('button');
                confirmButton.className = 'primary-button';
                confirmButton.textContent = settings.confirmText;
                confirmButton.setAttribute('type', 'button');
                
                // 添加確認事件
                confirmButton.addEventListener('click', () => {
                    if (settings.onConfirm) {
                        settings.onConfirm();
                    }
                    
                    closeModal();
                });
                
                modalFooter.appendChild(confirmButton);
            }
        }
        
        // 組裝模態對話框
        modal.appendChild(modalHeader);
        modal.appendChild(modalBody);
        
        if (settings.footer) {
            modal.appendChild(modalFooter);
        }
        
        modalContainer.appendChild(modalOverlay);
        modalContainer.appendChild(modal);
        
        // 將模態對話框添加到body
        document.body.appendChild(modalContainer);
        
        // 打開模態對話框
        const openModal = () => {
            // 顯示模態對話框
            modalContainer.classList.add('visible');
            
            // 禁止背景滾動
            document.body.style.overflow = 'hidden';
            
            // 調用打開回調
            if (settings.onOpen) {
                settings.onOpen();
            }
        };
        
        // 關閉模態對話框
        function closeModal() {
            // 隱藏模態對話框
            modalContainer.classList.remove('visible');
            
            // 恢復背景滾動
            document.body.style.overflow = '';
            
            // 調用關閉回調
            if (settings.onClose) {
                settings.onClose();
            }
            
            // 延遲移除模態對話框元素
            setTimeout(() => {
                if (modalContainer.parentNode) {
                    modalContainer.parentNode.removeChild(modalContainer);
                }
            }, 300);
        }
        
        // 更新模態對話框內容
        const updateContent = (newContent) => {
            // 清空現有內容
            modalBody.innerHTML = '';
            
            // 如果新內容是HTML元素，直接添加
            if (newContent instanceof HTMLElement) {
                modalBody.appendChild(newContent);
            } else if (typeof newContent === 'string') {
                // 如果新內容是字符串，設置為innerHTML
                modalBody.innerHTML = newContent;
            }
        };
        
        // 返回模態對話框方法
        return {
            open: openModal,
            close: closeModal,
            updateContent
        };
    };
    
    /**
     * 創建通知
     * @param {Object} options - 通知選項
     */
    const createNotification = (options) => {
        const defaults = {
            type: 'info', // 'info', 'success', 'warning', 'danger'
            title: '',
            message: '',
            duration: 5000, // 毫秒，0表示不自動關閉
            closable: true
        };
        
        const settings = Object.assign({}, defaults, options);
        
        // 獲取通知容器
        let notificationContainer = document.getElementById('notification-container');
        
        // 如果容器不存在，創建它
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        // 創建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${settings.type}`;
        
        // 添加通知圖標
        const notificationIcon = document.createElement('div');
        notificationIcon.className = `notification-icon ${settings.type}`;
        
        // 設置不同類型的圖標
        let iconPath = '';
        switch(settings.type) {
            case 'success':
                iconPath = 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z';
                break;
            case 'warning':
                iconPath = 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z';
                break;
            case 'danger':
                iconPath = 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z';
                break;
            default: // info
                iconPath = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z';
        }
        
        notificationIcon.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20"><path d="${iconPath}"></path></svg>`;
        notification.appendChild(notificationIcon);
        
        // 創建通知內容
        const notificationContent = document.createElement('div');
        notificationContent.className = 'notification-content';
        
        // 添加通知標題
        if (settings.title) {
            const notificationTitle = document.createElement('div');
            notificationTitle.className = 'notification-title';
            notificationTitle.textContent = settings.title;
            notificationContent.appendChild(notificationTitle);
        }
        
        // 添加通知消息
        const notificationMessage = document.createElement('div');
        notificationMessage.className = 'notification-message';
        notificationMessage.textContent = settings.message;
        notificationContent.appendChild(notificationMessage);
        
        notification.appendChild(notificationContent);
        
        // 如果可關閉，添加關閉按鈕
        if (settings.closable) {
            const closeButton = document.createElement('button');
            closeButton.className = 'notification-close';
            closeButton.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </svg>
            `;
            closeButton.setAttribute('aria-label', '關閉');
            closeButton.setAttribute('type', 'button');
            
            // 添加關閉事件
            closeButton.addEventListener('click', () => {
                closeNotification();
            });
            
            notification.appendChild(closeButton);
        }
        
        // 添加通知到容器
        notificationContainer.appendChild(notification);
        
        // 顯示通知
        setTimeout(() => {
            notification.classList.add('visible');
        }, 10);
        
        // 關閉通知
        const closeNotification = () => {
            notification.classList.remove('visible');
            
            // 延遲移除通知元素
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                
                // 如果沒有更多通知，移除容器
                if (notificationContainer.children.length === 0) {
                    notificationContainer.parentNode.removeChild(notificationContainer);
                }
            }, 300);
        };
        
        // 如果設置了持續時間，自動關閉
        if (settings.duration > 0) {
            setTimeout(() => {
                closeNotification();
            }, settings.duration);
        }
        
        // 返回通知方法
        return {
            close: closeNotification
        };
    };
    
    // 公開API
    return {
        createCard,
        createDataSummary,
        createFormElement,
        createTable,
        createTabs,
        createModal,
        createNotification
    };
})();

// 將模塊導出到全局命名空間
window.BabyTracker = BabyTracker;
