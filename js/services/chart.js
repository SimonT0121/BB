/**
 * 嬰幼兒照顧追蹤應用 - 圖表服務
 * 提供創建各種圖表的方法
 */

const BabyTracker = window.BabyTracker || {};

/**
 * 圖表服務
 */
BabyTracker.ChartService = (function() {
    // 顏色常量
    const COLORS = {
        primary: 'var(--primary-color)',
        primaryLight: 'var(--primary-light)',
        feeding: 'var(--feeding-color)',
        sleep: 'var(--sleep-color)',
        diaper: 'var(--diaper-color)',
        mood: 'var(--mood-color)',
        activity: 'var(--activity-color)',
        growth: 'var(--growth-color)',
        health: 'var(--health-color)',
        milestone: 'var(--milestone-color)',
        grid: 'var(--border-color)',
        text: 'var(--text-secondary)',
        // 圖表特定顏色
        breastfeeding: '#8bc34a',
        formula: '#03a9f4',
        solidFood: '#ff9800',
        wetDiaper: '#03a9f4',
        dirtyDiaper: '#8bc34a',
        mixedDiaper: '#ff9800',
        happy: '#4caf50',
        sad: '#f44336',
        calm: '#03a9f4',
        fussy: '#ff9800',
        // 圖表系列顏色
        series: [
            '#4e6ef2', // 主色
            '#f69435', // 次色
            '#58cc02', // 強調色
            '#e91e63', // 額外色1
            '#00bcd4', // 額外色2
            '#9c27b0', // 額外色3
            '#ff5722', // 額外色4
            '#3f51b5'  // 額外色5
        ]
    };
    
    // 主題設置
    const getChartTheme = () => {
        const isDarkMode = document.body.classList.contains('dark');
        
        return {
            backgroundColor: 'transparent',
            textStyle: {
                color: isDarkMode ? '#e0e0e0' : '#333333'
            },
            title: {
                textStyle: {
                    color: isDarkMode ? '#e0e0e0' : '#333333'
                }
            },
            legend: {
                textStyle: {
                    color: isDarkMode ? '#b0b0b0' : '#666666'
                }
            },
            xAxis: {
                axisLine: {
                    lineStyle: {
                        color: isDarkMode ? '#3a3a3a' : '#e0e0e0'
                    }
                },
                axisLabel: {
                    color: isDarkMode ? '#b0b0b0' : '#666666'
                },
                splitLine: {
                    lineStyle: {
                        color: isDarkMode ? '#2c2c2c' : '#f1f3f4'
                    }
                }
            },
            yAxis: {
                axisLine: {
                    lineStyle: {
                        color: isDarkMode ? '#3a3a3a' : '#e0e0e0'
                    }
                },
                axisLabel: {
                    color: isDarkMode ? '#b0b0b0' : '#666666'
                },
                splitLine: {
                    lineStyle: {
                        color: isDarkMode ? '#2c2c2c' : '#f1f3f4'
                    }
                }
            },
            timeline: {
                lineStyle: {
                    color: isDarkMode ? '#5c7bf5' : '#4e6ef2'
                },
                controlStyle: {
                    color: isDarkMode ? '#5c7bf5' : '#4e6ef2',
                    borderColor: isDarkMode ? '#5c7bf5' : '#4e6ef2'
                },
                label: {
                    color: isDarkMode ? '#b0b0b0' : '#666666'
                }
            }
        };
    };
    
    /**
     * 創建餵食統計圖表
     * @param {String} containerId - 容器元素ID
     * @param {Array} data - 餵食數據
     * @param {Object} options - 圖表選項
     * @returns {Object} ECharts實例
     */
    const createFeedingChart = (containerId, data, options = {}) => {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`找不到ID為 "${containerId}" 的圖表容器`);
            return null;
        }
        
        // 確保echarts已載入
        if (!window.echarts) {
            console.error('ECharts 庫未載入');
            return null;
        }
        
        // 預設選項
        const defaultOptions = {
            chartType: 'daily', // 'daily', 'weekly', 'monthly'
            showLegend: true,
            height: '300px'
        };
        
        const chartOptions = Object.assign({}, defaultOptions, options);
        
        // 設置容器高度
        container.style.height = chartOptions.height;
        
        // 初始化圖表
        const chart = window.echarts.init(container);
        
        // 根據圖表類型處理數據
        let chartData;
        let chartTitle;
        
        if (chartOptions.chartType === 'daily') {
            chartData = processDailyFeedingData(data);
            chartTitle = '每日餵食分佈';
        } else if (chartOptions.chartType === 'weekly') {
            chartData = processWeeklyFeedingData(data);
            chartTitle = '每週餵食趨勢';
        } else {
            chartData = processMonthlyFeedingData(data);
            chartTitle = '每月餵食趨勢';
        }
        
        // 設置圖表配置
        const config = {
            title: {
                text: chartTitle,
                left: 'center',
                top: 0,
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'normal'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function(params) {
                    let tooltip = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].name}</div>`;
                    
                    params.forEach(param => {
                        tooltip += `<div style="display:flex;align-items:center;margin:3px 0;">
                            <span style="display:inline-block;width:10px;height:10px;background:${param.color};margin-right:5px;border-radius:50%;"></span>
                            <span style="margin-right:5px;">${param.seriesName}:</span>
                            <span style="font-weight:bold;">${param.value}</span>
                            <span style="margin-left:2px;">${param.seriesName.includes('量') ? 'ml' : '次'}</span>
                        </div>`;
                    });
                    
                    return tooltip;
                }
            },
            legend: {
                show: chartOptions.showLegend,
                bottom: 0,
                data: chartData.legend
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: chartOptions.showLegend ? '60px' : '30px',
                top: '60px',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: chartData.xAxis,
                axisLabel: {
                    interval: chartOptions.chartType === 'daily' ? 0 : 'auto'
                }
            },
            yAxis: [
                {
                    type: 'value',
                    name: '次數',
                    position: 'left',
                    axisLine: {
                        show: true
                    },
                    axisLabel: {
                        formatter: '{value} 次'
                    }
                },
                {
                    type: 'value',
                    name: '餵食量',
                    position: 'right',
                    axisLine: {
                        show: true
                    },
                    axisLabel: {
                        formatter: '{value} ml'
                    }
                }
            ],
            series: chartData.series
        };
        
        // 應用主題
        const theme = getChartTheme();
        Object.assign(config, theme);
        
        // 設置圖表配置並渲染
        chart.setOption(config);
        
        // 設置響應式調整大小
        window.addEventListener('resize', () => {
            chart.resize();
        });
        
        return chart;
    };
    
    /**
     * 處理每日餵食數據
     * @param {Array} data - 餵食數據
     * @returns {Object} 處理後的圖表數據
     */
    const processDailyFeedingData = (data) => {
        // 按小時分組
        const hourlyData = {};
        
        // 初始化24小時數據
        for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, '0');
            hourlyData[hour] = {
                breastfeeding: 0,
                formula: 0,
                solidFood: 0,
                other: 0,
                totalAmount: 0
            };
        }
        
        // 統計數據
        data.forEach(item => {
            const date = new Date(item.timestamp);
            const hour = date.getHours().toString().padStart(2, '0');
            
            if (!hourlyData[hour]) {
                hourlyData[hour] = {
                    breastfeeding: 0,
                    formula: 0,
                    solidFood: 0,
                    other: 0,
                    totalAmount: 0
                };
            }
            
            const hourData = hourlyData[hour];
            
            // 根據餵食類型統計
            switch (item.type) {
                case BabyTracker.FeedingModel.FEEDING_TYPES.BREAST_LEFT:
                case BabyTracker.FeedingModel.FEEDING_TYPES.BREAST_RIGHT:
                case BabyTracker.FeedingModel.FEEDING_TYPES.BREAST_BOTH:
                    hourData.breastfeeding++;
                    break;
                    
                case BabyTracker.FeedingModel.FEEDING_TYPES.FORMULA:
                case BabyTracker.FeedingModel.FEEDING_TYPES.PUMPED_MILK:
                    hourData.formula++;
                    
                    // 累計餵食量
                    if (item.amount) {
                        const amount = BabyTracker.FeedingModel.convertToStandardUnit(item.amount, item.unit);
                        hourData.totalAmount += amount;
                    }
                    break;
                    
                case BabyTracker.FeedingModel.FEEDING_TYPES.SOLID_FOOD:
                    hourData.solidFood++;
                    break;
                    
                default:
                    hourData.other++;
            }
        });
        
        // 準備圖表數據
        const xAxis = [];
        const breastfeedingData = [];
        const formulaData = [];
        const solidFoodData = [];
        const amountData = [];
        
        // 收集每個小時的數據
        for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, '0');
            xAxis.push(`${hour}:00`);
            
            const hourData = hourlyData[hour];
            breastfeedingData.push(hourData.breastfeeding);
            formulaData.push(hourData.formula);
            solidFoodData.push(hourData.solidFood);
            amountData.push(hourData.totalAmount);
        }
        
        return {
            xAxis,
            legend: ['母乳餵食', '奶瓶餵食', '固體食物', '餵食量'],
            series: [
                {
                    name: '母乳餵食',
                    type: 'bar',
                    stack: 'total',
                    data: breastfeedingData,
                    color: COLORS.breastfeeding
                },
                {
                    name: '奶瓶餵食',
                    type: 'bar',
                    stack: 'total',
                    data: formulaData,
                    color: COLORS.formula
                },
                {
                    name: '固體食物',
                    type: 'bar',
                    stack: 'total',
                    data: solidFoodData,
                    color: COLORS.solidFood
                },
                {
                    name: '餵食量',
                    type: 'line',
                    yAxisIndex: 1,
                    data: amountData,
                    color: COLORS.primary,
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: {
                        width: 2
                    }
                }
            ]
        };
    };
    
    /**
     * 處理每週餵食數據
     * @param {Array} data - 餵食數據
     * @returns {Object} 處理後的圖表數據
     */
    const processWeeklyFeedingData = (data) => {
        // 按日期分組
        const dailyData = {};
        
        // 獲取日期範圍
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 6); // 一週前
        
        // 初始化日期數據
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateString = formatDate(date);
            
            dailyData[dateString] = {
                breastfeeding: 0,
                formula: 0,
                solidFood: 0,
                other: 0,
                totalAmount: 0
            };
        }
        
        // 統計數據
        data.forEach(item => {
            const date = new Date(item.timestamp);
            date.setHours(0, 0, 0, 0);
            
            // 只處理一週內的數據
            if (date < startDate || date > today) {
                return;
            }
            
            const dateString = formatDate(date);
            
            if (!dailyData[dateString]) {
                dailyData[dateString] = {
                    breastfeeding: 0,
                    formula: 0,
                    solidFood: 0,
                    other: 0,
                    totalAmount: 0
                };
            }
            
            const dayData = dailyData[dateString];
            
            // 根據餵食類型統計
            switch (item.type) {
                case BabyTracker.FeedingModel.FEEDING_TYPES.BREAST_LEFT:
                case BabyTracker.FeedingModel.FEEDING_TYPES.BREAST_RIGHT:
                case BabyTracker.FeedingModel.FEEDING_TYPES.BREAST_BOTH:
                    dayData.breastfeeding++;
                    break;
                    
                case BabyTracker.FeedingModel.FEEDING_TYPES.FORMULA:
                case BabyTracker.FeedingModel.FEEDING_TYPES.PUMPED_MILK:
                    dayData.formula++;
                    
                    // 累計餵食量
                    if (item.amount) {
                        const amount = BabyTracker.FeedingModel.convertToStandardUnit(item.amount, item.unit);
                        dayData.totalAmount += amount;
                    }
                    break;
                    
                case BabyTracker.FeedingModel.FEEDING_TYPES.SOLID_FOOD:
                    dayData.solidFood++;
                    break;
                    
                default:
                    dayData.other++;
            }
        });
        
        // 準備圖表數據
        const xAxis = [];
        const breastfeedingData = [];
        const formulaData = [];
        const solidFoodData = [];
        const amountData = [];
        
        // 收集每日的數據
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateString = formatDate(date);
            
            xAxis.push(formatShortDate(date));
            
            const dayData = dailyData[dateString];
            breastfeedingData.push(dayData.breastfeeding);
            formulaData.push(dayData.formula);
            solidFoodData.push(dayData.solidFood);
            amountData.push(dayData.totalAmount);
        }
        
        return {
            xAxis,
            legend: ['母乳餵食', '奶瓶餵食', '固體食物', '餵食量'],
            series: [
                {
                    name: '母乳餵食',
                    type: 'bar',
                    stack: 'total',
                    data: breastfeedingData,
                    color: COLORS.breastfeeding
                },
                {
                    name: '奶瓶餵食',
                    type: 'bar',
                    stack: 'total',
                    data: formulaData,
                    color: COLORS.formula
                },
                {
                    name: '固體食物',
                    type: 'bar',
                    stack: 'total',
                    data: solidFoodData,
                    color: COLORS.solidFood
                },
                {
                    name: '餵食量',
                    type: 'line',
                    yAxisIndex: 1,
                    data: amountData,
                    color: COLORS.primary,
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: {
                        width: 2
                    }
                }
            ]
        };
    };
    
    /**
     * 處理每月餵食數據
     * @param {Array} data - 餵食數據
     * @returns {Object} 處理後的圖表數據
     */
    const processMonthlyFeedingData = (data) => {
        // 按週分組
        const weeklyData = {};
        
        // 獲取日期範圍
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 29); // 30天前
        
        // 初始化週數據
        for (let i = 0; i < 5; i++) {
            const weekStart = new Date(startDate);
            weekStart.setDate(startDate.getDate() + i * 7);
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            const weekKey = `W${i + 1}`;
            
            weeklyData[weekKey] = {
                breastfeeding: 0,
                formula: 0,
                solidFood: 0,
                other: 0,
                totalAmount: 0,
                startDate: weekStart,
                endDate: weekEnd
            };
        }
        
        // 統計數據
        data.forEach(item => {
            const date = new Date(item.timestamp);
            date.setHours(0, 0, 0, 0);
            
            // 只處理一個月內的數據
            if (date < startDate || date > today) {
                return;
            }
            
            // 確定週數
            let weekKey = '';
            for (const key in weeklyData) {
                const week = weeklyData[key];
                if (date >= week.startDate && date <= week.endDate) {
                    weekKey = key;
                    break;
                }
            }
            
            if (!weekKey) return;
            
            const weekData = weeklyData[weekKey];
            
            // 根據餵食類型統計
            switch (item.type) {
                case BabyTracker.FeedingModel.FEEDING_TYPES.BREAST_LEFT:
                case BabyTracker.FeedingModel.FEEDING_TYPES.BREAST_RIGHT:
                case BabyTracker.FeedingModel.FEEDING_TYPES.BREAST_BOTH:
                    weekData.breastfeeding++;
                    break;
                    
                case BabyTracker.FeedingModel.FEEDING_TYPES.FORMULA:
                case BabyTracker.FeedingModel.FEEDING_TYPES.PUMPED_MILK:
                    weekData.formula++;
                    
                    // 累計餵食量
                    if (item.amount) {
                        const amount = BabyTracker.FeedingModel.convertToStandardUnit(item.amount, item.unit);
                        weekData.totalAmount += amount;
                    }
                    break;
                    
                case BabyTracker.FeedingModel.FEEDING_TYPES.SOLID_FOOD:
                    weekData.solidFood++;
                    break;
                    
                default:
                    weekData.other++;
            }
        });
        
        // 準備圖表數據
        const xAxis = [];
        const breastfeedingData = [];
        const formulaData = [];
        const solidFoodData = [];
        const amountData = [];
        
        // 收集每週的數據
        for (let i = 0; i < 5; i++) {
            const weekKey = `W${i + 1}`;
            const week = weeklyData[weekKey];
            
            // 格式化週標籤
            const weekLabel = `${formatMonthDay(week.startDate)}-${formatMonthDay(week.endDate)}`;
            xAxis.push(weekLabel);
            
            breastfeedingData.push(week.breastfeeding);
            formulaData.push(week.formula);
            solidFoodData.push(week.solidFood);
            amountData.push(week.totalAmount);
        }
        
        return {
            xAxis,
            legend: ['母乳餵食', '奶瓶餵食', '固體食物', '餵食量'],
            series: [
                {
                    name: '母乳餵食',
                    type: 'bar',
                    stack: 'total',
                    data: breastfeedingData,
                    color: COLORS.breastfeeding
                },
                {
                    name: '奶瓶餵食',
                    type: 'bar',
                    stack: 'total',
                    data: formulaData,
                    color: COLORS.formula
                },
                {
                    name: '固體食物',
                    type: 'bar',
                    stack: 'total',
                    data: solidFoodData,
                    color: COLORS.solidFood
                },
                {
                    name: '餵食量',
                    type: 'line',
                    yAxisIndex: 1,
                    data: amountData,
                    color: COLORS.primary,
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: {
                        width: 2
                    }
                }
            ]
        };
    };
    
    /**
     * 創建睡眠統計圖表
     * @param {String} containerId - 容器元素ID
     * @param {Array} data - 睡眠數據
     * @param {Object} options - 圖表選項
     * @returns {Object} ECharts實例
     */
    const createSleepChart = (containerId, data, options = {}) => {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`找不到ID為 "${containerId}" 的圖表容器`);
            return null;
        }
        
        // 確保echarts已載入
        if (!window.echarts) {
            console.error('ECharts 庫未載入');
            return null;
        }
        
        // 預設選項
        const defaultOptions = {
            chartType: 'daily', // 'daily', 'weekly', 'monthly'
            showLegend: true,
            height: '300px'
        };
        
        const chartOptions = Object.assign({}, defaultOptions, options);
        
        // 設置容器高度
        container.style.height = chartOptions.height;
        
        // 初始化圖表
        const chart = window.echarts.init(container);
        
        // 根據圖表類型處理數據
        let chartData;
        let chartTitle;
        
        if (chartOptions.chartType === 'daily') {
            chartData = processDailySleepData(data);
            chartTitle = '每日睡眠分佈';
        } else if (chartOptions.chartType === 'weekly') {
            chartData = processWeeklySleepData(data);
            chartTitle = '每週睡眠趨勢';
        } else {
            chartData = processMonthlySleepData(data);
            chartTitle = '每月睡眠趨勢';
        }
        
        // 設置圖表配置
        const config = {
            title: {
                text: chartTitle,
                left: 'center',
                top: 0,
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'normal'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function(params) {
                    let tooltip = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].name}</div>`;
                    
                    params.forEach(param => {
                        tooltip += `<div style="display:flex;align-items:center;margin:3px 0;">
                            <span style="display:inline-block;width:10px;height:10px;background:${param.color};margin-right:5px;border-radius:50%;"></span>
                            <span style="margin-right:5px;">${param.seriesName}:</span>
                            <span style="font-weight:bold;">${param.value}</span>
                            <span style="margin-left:2px;">${param.seriesName.includes('次數') ? '次' : '小時'}</span>
                        </div>`;
                    });
                    
                    return tooltip;
                }
            },
            legend: {
                show: chartOptions.showLegend,
                bottom: 0,
                data: chartData.legend
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: chartOptions.showLegend ? '60px' : '30px',
                top: '60px',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: chartData.xAxis
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} ' + (chartOptions.chartType === 'daily' ? '小時' : '小時')
                }
            },
            series: chartData.series
        };
        
        // 應用主題
        const theme = getChartTheme();
        Object.assign(config, theme);
        
        // 設置圖表配置並渲染
        chart.setOption(config);
        
        // 設置響應式調整大小
        window.addEventListener('resize', () => {
            chart.resize();
        });
        
        return chart;
    };
    
    /**
     * 處理每日睡眠數據
     * @param {Array} data - 睡眠數據
     * @returns {Object} 處理後的圖表數據
     */
    const processDailySleepData = (data) => {
        // 按小時分組
        const hourlyData = {};
        
        // 初始化24小時數據
        for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, '0');
            hourlyData[hour] = 0; // 每小時的睡眠時間（小時）
        }
        
        // 統計數據
        data.forEach(item => {
            if (!item.startTime || !item.endTime) {
                return;
            }
            
            const startTime = new Date(item.startTime);
            const endTime = new Date(item.endTime);
            
            // 計算持續時間（毫秒）
            const duration = endTime - startTime;
            
            // 分配到各小時時段
            let currentTime = new Date(startTime);
            
            while (currentTime < endTime) {
                const hour = currentTime.getHours().toString().padStart(2, '0');
                
                // 計算這一小時中的睡眠時間（小時）
                const hourEnd = new Date(currentTime);
                hourEnd.setHours(currentTime.getHours() + 1, 0, 0, 0);
                
                const timeInThisHour = Math.min(hourEnd - currentTime, endTime - currentTime);
                const hoursInThisHour = timeInThisHour / (1000 * 60 * 60);
                
                hourlyData[hour] += hoursInThisHour;
                
                // 移至下一小時
                currentTime = hourEnd;
            }
        });
        
        // 準備圖表數據
        const xAxis = [];
        const sleepData = [];
        
        // 收集每個小時的數據
        for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, '0');
            xAxis.push(`${hour}:00`);
            
            // 保留2位小數
            sleepData.push(parseFloat(hourlyData[hour].toFixed(2)));
        }
        
        return {
            xAxis,
            legend: ['睡眠時間'],
            series: [
                {
                    name: '睡眠時間',
                    type: 'bar',
                    data: sleepData,
                    color: COLORS.sleep,
                    barWidth: '60%',
                    itemStyle: {
                        borderRadius: [5, 5, 0, 0]
                    }
                }
            ]
        };
    };
    
    /**
     * 處理每週睡眠數據
     * @param {Array} data - 睡眠數據
     * @returns {Object} 處理後的圖表數據
     */
    const processWeeklySleepData = (data) => {
        // 按日期分組
        const dailyData = {};
        
        // 獲取日期範圍
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 6); // 一週前
        
        // 初始化日期數據
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateString = formatDate(date);
            
            dailyData[dateString] = {
                totalSleep: 0,
                sleepCount: 0
            };
        }
        
        // 統計數據
        data.forEach(item => {
            if (!item.startTime || !item.endTime) {
                return;
            }
            
            const startTime = new Date(item.startTime);
            const endTime = new Date(item.endTime);
            
            // 計算持續時間（小時）
            const duration = (endTime - startTime) / (1000 * 60 * 60);
            
            // 使用開始日期來分組
            startTime.setHours(0, 0, 0, 0);
            
            // 只處理一週內的數據
            if (startTime < startDate || startTime > today) {
                return;
            }
            
            const dateString = formatDate(startTime);
            
            if (dailyData[dateString]) {
                dailyData[dateString].totalSleep += duration;
                dailyData[dateString].sleepCount++;
            }
        });
        
        // 準備圖表數據
        const xAxis = [];
        const totalSleepData = [];
        const sleepCountData = [];
        
        // 收集每日的數據
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateString = formatDate(date);
            
            xAxis.push(formatShortDate(date));
            
            const dayData = dailyData[dateString];
            totalSleepData.push(parseFloat(dayData.totalSleep.toFixed(2)));
            sleepCountData.push(dayData.sleepCount);
        }
        
        return {
            xAxis,
            legend: ['睡眠時間', '睡眠次數'],
            series: [
                {
                    name: '睡眠時間',
                    type: 'bar',
                    data: totalSleepData,
                    color: COLORS.sleep,
                    barWidth: '40%',
                    itemStyle: {
                        borderRadius: [5, 5, 0, 0]
                    }
                },
                {
                    name: '睡眠次數',
                    type: 'line',
                    data: sleepCountData,
                    yAxisIndex: 1,
                    color: COLORS.primary,
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: {
                        width: 2
                    }
                }
            ]
        };
    };
    
    /**
     * 處理每月睡眠數據
     * @param {Array} data - 睡眠數據
     * @returns {Object} 處理後的圖表數據
     */
    const processMonthlySleepData = (data) => {
        // 與週數據處理類似，但按週分組
        // 按週分組
        const weeklyData = {};
        
        // 獲取日期範圍
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 29); // 30天前
        
        // 初始化週數據
        for (let i = 0; i < 5; i++) {
            const weekStart = new Date(startDate);
            weekStart.setDate(startDate.getDate() + i * 7);
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            const weekKey = `W${i + 1}`;
            
            weeklyData[weekKey] = {
                totalSleep: 0,
                sleepCount: 0,
                avgDailySleep: 0,
                startDate: weekStart,
                endDate: weekEnd
            };
        }
        
        // 統計數據
        data.forEach(item => {
            if (!item.startTime || !item.endTime) {
                return;
            }
            
            const startTime = new Date(item.startTime);
            const endTime = new Date(item.endTime);
            
            // 計算持續時間（小時）
            const duration = (endTime - startTime) / (1000 * 60 * 60);
            
            // 使用開始日期來分組
            const date = new Date(startTime);
            date.setHours(0, 0, 0, 0);
            
            // 只處理一個月內的數據
            if (date < startDate || date > today) {
                return;
            }
            
            // 確定週數
            let weekKey = '';
            for (const key in weeklyData) {
                const week = weeklyData[key];
                if (date >= week.startDate && date <= week.endDate) {
                    weekKey = key;
                    break;
                }
            }
            
            if (!weekKey) return;
            
            const weekData = weeklyData[weekKey];
            weekData.totalSleep += duration;
            weekData.sleepCount++;
        });
        
        // 計算每週平均每日睡眠時間
        for (const weekKey in weeklyData) {
            const week = weeklyData[weekKey];
            // 除以7天獲得平均每日睡眠時間
            week.avgDailySleep = week.totalSleep / 7;
        }
        
        // 準備圖表數據
        const xAxis = [];
        const avgDailySleepData = [];
        const sleepCountData = [];
        
        // 收集每週的數據
        for (let i = 0; i < 5; i++) {
            const weekKey = `W${i + 1}`;
            const week = weeklyData[weekKey];
            
            // 格式化週標籤
            const weekLabel = `${formatMonthDay(week.startDate)}-${formatMonthDay(week.endDate)}`;
            xAxis.push(weekLabel);
            
            avgDailySleepData.push(parseFloat(week.avgDailySleep.toFixed(2)));
            sleepCountData.push(week.sleepCount);
        }
        
        return {
            xAxis,
            legend: ['平均每日睡眠', '睡眠次數'],
            series: [
                {
                    name: '平均每日睡眠',
                    type: 'bar',
                    data: avgDailySleepData,
                    color: COLORS.sleep,
                    barWidth: '40%',
                    itemStyle: {
                        borderRadius: [5, 5, 0, 0]
                    }
                },
                {
                    name: '睡眠次數',
                    type: 'line',
                    data: sleepCountData,
                    yAxisIndex: 1,
                    color: COLORS.primary,
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: {
                        width: 2
                    }
                }
            ]
        };
    };
    
    /**
     * 創建尿布更換統計圖表
     * @param {String} containerId - 容器元素ID
     * @param {Array} data - 尿布更換數據
     * @param {Object} options - 圖表選項
     * @returns {Object} ECharts實例
     */
    const createDiaperChart = (containerId, data, options = {}) => {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`找不到ID為 "${containerId}" 的圖表容器`);
            return null;
        }
        
        // 確保echarts已載入
        if (!window.echarts) {
            console.error('ECharts 庫未載入');
            return null;
        }
        
        // 預設選項
        const defaultOptions = {
            chartType: 'daily', // 'daily', 'weekly', 'monthly'
            showLegend: true,
            height: '300px'
        };
        
        const chartOptions = Object.assign({}, defaultOptions, options);
        
        // 設置容器高度
        container.style.height = chartOptions.height;
        
        // 初始化圖表
        const chart = window.echarts.init(container);
        
        // 根據圖表類型處理數據
        let chartData;
        let chartTitle;
        
        if (chartOptions.chartType === 'daily') {
            chartData = processDailyDiaperData(data);
            chartTitle = '每日尿布更換分佈';
        } else if (chartOptions.chartType === 'weekly') {
            chartData = processWeeklyDiaperData(data);
            chartTitle = '每週尿布更換趨勢';
        } else {
            chartData = processMonthlyDiaperData(data);
            chartTitle = '每月尿布更換趨勢';
        }
        
        // 設置圖表配置
        const config = {
            title: {
                text: chartTitle,
                left: 'center',
                top: 0,
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'normal'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function(params) {
                    let tooltip = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].name}</div>`;
                    
                    params.forEach(param => {
                        tooltip += `<div style="display:flex;align-items:center;margin:3px 0;">
                            <span style="display:inline-block;width:10px;height:10px;background:${param.color};margin-right:5px;border-radius:50%;"></span>
                            <span style="margin-right:5px;">${param.seriesName}:</span>
                            <span style="font-weight:bold;">${param.value}</span>
                            <span style="margin-left:2px;">次</span>
                        </div>`;
                    });
                    
                    return tooltip;
                }
            },
            legend: {
                show: chartOptions.showLegend,
                bottom: 0,
                data: chartData.legend
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: chartOptions.showLegend ? '60px' : '30px',
                top: '60px',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: chartData.xAxis
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} 次'
                }
            },
            series: chartData.series
        };
        
        // 應用主題
        const theme = getChartTheme();
        Object.assign(config, theme);
        
        // 設置圖表配置並渲染
        chart.setOption(config);
        
        // 設置響應式調整大小
        window.addEventListener('resize', () => {
            chart.resize();
        });
        
        return chart;
    };
    
    /**
     * 處理每日尿布數據
     * @param {Array} data - 尿布數據
     * @returns {Object} 處理後的圖表數據
     */
    const processDailyDiaperData = (data) => {
        // 按小時分組
        const hourlyData = {};
        
        // 初始化24小時數據
        for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, '0');
            hourlyData[hour] = {
                wet: 0,
                dirty: 0,
                mixed: 0
            };
        }
        
        // 統計數據
        data.forEach(item => {
            const date = new Date(item.timestamp);
            const hour = date.getHours().toString().padStart(2, '0');
            
            if (!hourlyData[hour]) {
                hourlyData[hour] = {
                    wet: 0,
                    dirty: 0,
                    mixed: 0
                };
            }
            
            const hourData = hourlyData[hour];
            
            // 根據尿布類型統計
            switch (item.type) {
                case 'wet':
                    hourData.wet++;
                    break;
                    
                case 'dirty':
                    hourData.dirty++;
                    break;
                    
                case 'mixed':
                    hourData.mixed++;
                    break;
            }
        });
        
        // 準備圖表數據
        const xAxis = [];
        const wetData = [];
        const dirtyData = [];
        const mixedData = [];
        
        // 收集每個小時的數據
        for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, '0');
            xAxis.push(`${hour}:00`);
            
            const hourData = hourlyData[hour];
            wetData.push(hourData.wet);
            dirtyData.push(hourData.dirty);
            mixedData.push(hourData.mixed);
        }
        
        return {
            xAxis,
            legend: ['尿濕', '大便', '混合'],
            series: [
                {
                    name: '尿濕',
                    type: 'bar',
                    stack: 'total',
                    data: wetData,
                    color: COLORS.wetDiaper
                },
                {
                    name: '大便',
                    type: 'bar',
                    stack: 'total',
                    data: dirtyData,
                    color: COLORS.dirtyDiaper
                },
                {
                    name: '混合',
                    type: 'bar',
                    stack: 'total',
                    data: mixedData,
                    color: COLORS.mixedDiaper
                }
            ]
        };
    };
    
    /**
     * 處理每週尿布數據
     * @param {Array} data - 尿布數據
     * @returns {Object} 處理後的圖表數據
     */
    const processWeeklyDiaperData = (data) => {
        // 按日期分組
        const dailyData = {};
        
        // 獲取日期範圍
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 6); // 一週前
        
        // 初始化日期數據
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateString = formatDate(date);
            
            dailyData[dateString] = {
                wet: 0,
                dirty: 0,
                mixed: 0
            };
        }
        
        // 統計數據
        data.forEach(item => {
            const date = new Date(item.timestamp);
            date.setHours(0, 0, 0, 0);
            
            // 只處理一週內的數據
            if (date < startDate || date > today) {
                return;
            }
            
            const dateString = formatDate(date);
            
            if (!dailyData[dateString]) {
                dailyData[dateString] = {
                    wet: 0,
                    dirty: 0,
                    mixed: 0
                };
            }
            
            const dayData = dailyData[dateString];
            
            // 根據尿布類型統計
            switch (item.type) {
                case 'wet':
                    dayData.wet++;
                    break;
                    
                case 'dirty':
                    dayData.dirty++;
                    break;
                    
                case 'mixed':
                    dayData.mixed++;
                    break;
            }
        });
        
        // 準備圖表數據
        const xAxis = [];
        const wetData = [];
        const dirtyData = [];
        const mixedData = [];
        
        // 收集每日的數據
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateString = formatDate(date);
            
            xAxis.push(formatShortDate(date));
            
            const dayData = dailyData[dateString];
            wetData.push(dayData.wet);
            dirtyData.push(dayData.dirty);
            mixedData.push(dayData.mixed);
        }
        
        return {
            xAxis,
            legend: ['尿濕', '大便', '混合'],
            series: [
                {
                    name: '尿濕',
                    type: 'bar',
                    stack: 'total',
                    data: wetData,
                    color: COLORS.wetDiaper
                },
                {
                    name: '大便',
                    type: 'bar',
                    stack: 'total',
                    data: dirtyData,
                    color: COLORS.dirtyDiaper
                },
                {
                    name: '混合',
                    type: 'bar',
                    stack: 'total',
                    data: mixedData,
                    color: COLORS.mixedDiaper
                }
            ]
        };
    };
    
    /**
     * 處理每月尿布數據
     * @param {Array} data - 尿布數據
     * @returns {Object} 處理後的圖表數據
     */
    const processMonthlyDiaperData = (data) => {
        // 按週分組
        const weeklyData = {};
        
        // 獲取日期範圍
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 29); // 30天前
        
        // 初始化週數據
        for (let i = 0; i < 5; i++) {
            const weekStart = new Date(startDate);
            weekStart.setDate(startDate.getDate() + i * 7);
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            const weekKey = `W${i + 1}`;
            
            weeklyData[weekKey] = {
                wet: 0,
                dirty: 0,
                mixed: 0,
                startDate: weekStart,
                endDate: weekEnd
            };
        }
        
        // 統計數據
        data.forEach(item => {
            const date = new Date(item.timestamp);
            date.setHours(0, 0, 0, 0);
            
            // 只處理一個月內的數據
            if (date < startDate || date > today) {
                return;
            }
            
            // 確定週數
            let weekKey = '';
            for (const key in weeklyData) {
                const week = weeklyData[key];
                if (date >= week.startDate && date <= week.endDate) {
                    weekKey = key;
                    break;
                }
            }
            
            if (!weekKey) return;
            
            const weekData = weeklyData[weekKey];
            
            // 根據尿布類型統計
            switch (item.type) {
                case 'wet':
                    weekData.wet++;
                    break;
                    
                case 'dirty':
                    weekData.dirty++;
                    break;
                    
                case 'mixed':
                    weekData.mixed++;
                    break;
            }
        });
        
        // 準備圖表數據
        const xAxis = [];
        const wetData = [];
        const dirtyData = [];
        const mixedData = [];
        
        // 收集每週的數據
        for (let i = 0; i < 5; i++) {
            const weekKey = `W${i + 1}`;
            const week = weeklyData[weekKey];
            
            // 格式化週標籤
            const weekLabel = `${formatMonthDay(week.startDate)}-${formatMonthDay(week.endDate)}`;
            xAxis.push(weekLabel);
            
            wetData.push(week.wet);
            dirtyData.push(week.dirty);
            mixedData.push(week.mixed);
        }
        
        return {
            xAxis,
            legend: ['尿濕', '大便', '混合'],
            series: [
                {
                    name: '尿濕',
                    type: 'bar',
                    stack: 'total',
                    data: wetData,
                    color: COLORS.wetDiaper
                },
                {
                    name: '大便',
                    type: 'bar',
                    stack: 'total',
                    data: dirtyData,
                    color: COLORS.dirtyDiaper
                },
                {
                    name: '混合',
                    type: 'bar',
                    stack: 'total',
                    data: mixedData,
                    color: COLORS.mixedDiaper
                }
            ]
        };
    };
    
    /**
     * 創建生長數據圖表
     * @param {String} containerId - 容器元素ID
     * @param {Array} data - 生長數據
     * @param {Object} options - 圖表選項
     * @returns {Object} ECharts實例
     */
    const createGrowthChart = (containerId, data, options = {}) => {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`找不到ID為 "${containerId}" 的圖表容器`);
            return null;
        }
        
        // 確保echarts已載入
        if (!window.echarts) {
            console.error('ECharts 庫未載入');
            return null;
        }
        
        // 預設選項
        const defaultOptions = {
            chartType: 'weight', // 'weight', 'height', 'head'
            showReference: true,
            showPercentiles: true,
            height: '400px'
        };
        
        const chartOptions = Object.assign({}, defaultOptions, options);
        
        // 設置容器高度
        container.style.height = chartOptions.height;
        
        // 初始化圖表
        const chart = window.echarts.init(container);
        
        // 根據圖表類型處理數據
        let chartData;
        let chartTitle;
        
        if (chartOptions.chartType === 'weight') {
            chartData = processWeightData(data, chartOptions);
            chartTitle = '體重變化趨勢';
        } else if (chartOptions.chartType === 'height') {
            chartData = processHeightData(data, chartOptions);
            chartTitle = '身高變化趨勢';
        } else {
            chartData = processHeadCircumferenceData(data, chartOptions);
            chartTitle = '頭圍變化趨勢';
        }
        
        // 設置圖表配置
        const config = {
            title: {
                text: chartTitle,
                left: 'center',
                top: 0,
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'normal'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'line'
                },
                formatter: function(params) {
                    let tooltip = '';
                    
                    if (params.length > 0) {
                        tooltip += `<div style="font-weight:bold;margin-bottom:5px;">${params[0].name}</div>`;
                        
                        params.forEach(param => {
                            if (param.seriesName.includes('百分位')) {
                                return; // 跳過百分位線的顯示
                            }
                            
                            tooltip += `<div style="display:flex;align-items:center;margin:3px 0;">
                                <span style="display:inline-block;width:10px;height:10px;background:${param.color};margin-right:5px;border-radius:50%;"></span>
                                <span style="margin-right:5px;">${param.seriesName}:</span>
                                <span style="font-weight:bold;">${param.value}</span>
                                <span style="margin-left:2px;">${getUnitByChartType(chartOptions.chartType)}</span>
                            </div>`;
                        });
                    }
                    
                    return tooltip;
                }
            },
            legend: {
                show: true,
                bottom: 0,
                data: chartData.legend.filter(name => !name.includes('百分位')) // 過濾掉百分位線
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '60px',
                top: '60px',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: chartData.xAxis,
                axisLabel: {
                    formatter: '{value} 月齡'
                },
                boundaryGap: false
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: `{value} ${getUnitByChartType(chartOptions.chartType)}`
                }
            },
            series: chartData.series
        };
        
        // 應用主題
        const theme = getChartTheme();
        Object.assign(config, theme);
        
        // 設置圖表配置並渲染
        chart.setOption(config);
        
        // 設置響應式調整大小
        window.addEventListener('resize', () => {
            chart.resize();
        });
        
        return chart;
    };
    
    /**
     * 處理體重數據
     * @param {Array} data - 生長數據
     * @param {Object} options - 圖表選項
     * @returns {Object} 處理後的圖表數據
     */
    const processWeightData = (data, options) => {
        // 按年齡分組並排序
        const sortedData = [...data].sort((a, b) => {
            return calculateAgeInMonths(a.date) - calculateAgeInMonths(b.date);
        });
        
        // 提取數據
        const xAxis = sortedData.map(item => calculateAgeInMonths(item.date));
        const weightData = sortedData.map(item => item.weight);
        
        // 準備圖表數據
        const series = [
            {
                name: '體重',
                type: 'line',
                data: weightData,
                color: COLORS.growth,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: {
                    width: 2
                }
            }
        ];
        
        // 添加參考數據
        if (options.showReference) {
            // 這裡可以添加參考數據，例如WHO標準體重
            // ...
        }
        
        return {
            xAxis,
            legend: ['體重'],
            series
        };
    };
    
    /**
     * 處理身高數據
     * @param {Array} data - 生長數據
     * @param {Object} options - 圖表選項
     * @returns {Object} 處理後的圖表數據
     */
    const processHeightData = (data, options) => {
        // 按年齡分組並排序
        const sortedData = [...data].sort((a, b) => {
            return calculateAgeInMonths(a.date) - calculateAgeInMonths(b.date);
        });
        
        // 提取數據
        const xAxis = sortedData.map(item => calculateAgeInMonths(item.date));
        const heightData = sortedData.map(item => item.height);
        
        // 準備圖表數據
        const series = [
            {
                name: '身高',
                type: 'line',
                data: heightData,
                color: COLORS.growth,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: {
                    width: 2
                }
            }
        ];
        
        // 添加參考數據
        if (options.showReference) {
            // 這裡可以添加參考數據，例如WHO標準身高
            // ...
        }
        
        return {
            xAxis,
            legend: ['身高'],
            series
        };
    };
    
    /**
     * 處理頭圍數據
     * @param {Array} data - 生長數據
     * @param {Object} options - 圖表選項
     * @returns {Object} 處理後的圖表數據
     */
    const processHeadCircumferenceData = (data, options) => {
        // 按年齡分組並排序
        const sortedData = [...data].sort((a, b) => {
            return calculateAgeInMonths(a.date) - calculateAgeInMonths(b.date);
        });
        
        // 提取數據
        const xAxis = sortedData.map(item => calculateAgeInMonths(item.date));
        const headData = sortedData.map(item => item.headCircumference);
        
        // 準備圖表數據
        const series = [
            {
                name: '頭圍',
                type: 'line',
                data: headData,
                color: COLORS.growth,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: {
                    width: 2
                }
            }
        ];
        
        // 添加參考數據
        if (options.showReference) {
            // 這裡可以添加參考數據，例如WHO標準頭圍
            // ...
        }
        
        return {
            xAxis,
            legend: ['頭圍'],
            series
        };
    };
    
    /**
     * 計算月齡
     * @param {String} dateString - 日期字符串
     * @returns {Number} 月齡
     */
    const calculateAgeInMonths = (dateString) => {
        // 使用兒童出生日期來計算月齡
        const date = new Date(dateString);
        const birthDate = BabyTracker.App.getActiveChild()?.birthDate;
        
        if (!birthDate) {
            return 0;
        }
        
        const birth = new Date(birthDate);
        
        // 計算月份差異
        let months = (date.getFullYear() - birth.getFullYear()) * 12;
        months += date.getMonth() - birth.getMonth();
        
        // 調整天數
        if (date.getDate() < birth.getDate()) {
            months--;
        }
        
        return Math.max(0, months);
    };
    
    /**
     * 根據圖表類型獲取單位
     * @param {String} chartType - 圖表類型
     * @returns {String} 單位
     */
    const getUnitByChartType = (chartType) => {
        switch (chartType) {
            case 'weight':
                return 'kg';
            case 'height':
                return 'cm';
            case 'head':
                return 'cm';
            default:
                return '';
        }
    };
    
    /**
     * 格式化日期為 YYYY-MM-DD
     * @param {Date} date - 日期
     * @returns {String} 格式化後的日期
     */
    const formatDate = (date) => {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    };
    
    /**
     * 格式化日期為 MM/DD
     * @param {Date} date - 日期
     * @returns {String} 格式化後的日期
     */
    const formatShortDate = (date) => {
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
    };
    
    /**
     * 格式化日期為 MM-DD
     * @param {Date} date - 日期
     * @returns {String} 格式化後的日期
     */
    const formatMonthDay = (date) => {
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    };
    
    // 公開API
    return {
        createFeedingChart,
        createSleepChart,
        createDiaperChart,
    createGrowthChart,
    getChartTheme,
    COLORS
};
