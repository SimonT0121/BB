/**
 * config.js - 應用程式配置文件
 * 
 * 此文件定義應用程式的各種常量設定，包括資料庫名稱、
 * 版本、預設值和配置選項等。
 * 
 * @author BabyGrow Team
 * @version 1.0.0
 */

'use strict';

/**
 * IndexedDB 資料庫名稱
 * @type {string}
 */
export const DB_NAME = 'babyGrowDB';

/**
 * IndexedDB 資料庫版本
 * 注意：每當資料庫結構有變更時，需要增加此版本號
 * @type {number}
 */
export const DB_VERSION = 1;

/**
 * Object Store 名稱列表
 * @type {Array<string>}
 */
export const STORE_NAMES = [
  'children',      // 兒童檔案
  'feeding',       // 餵食記錄
  'sleep',         // 睡眠記錄
  'diaper',        // 尿布更換記錄
  'health',        // 健康記錄
  'milestone',     // 發展里程碑
  'moodBehavior',  // 情緒與行為記錄
  'interactionLog',// 親子互動日記
  'settings'       // 應用程式設定
];

/**
 * 各年齡段發展里程碑參考標準
 * @type {Object}
 */
export const MILESTONE_REFERENCES = {
  '2months': [
    { type: 'social', label: '開始微笑回應他人' },
    { type: 'motor', label: '抬頭可以短暫維持' },
    { type: 'communication', label: '發出咕咕聲' }
  ],
  '4months': [
    { type: 'social', label: '自發性微笑' },
    { type: 'motor', label: '可以雙手抓住玩具' },
    { type: 'sensory', label: '開始認出熟悉的臉孔和物體' }
  ],
  '6months': [
    { type: 'motor', label: '翻身（從仰臥到俯臥）' },
    { type: 'motor', label: '開始坐立（有支撐）' },
    { type: 'food', label: '開始嘗試副食品' },
    { type: 'communication', label: '發出更多音節' }
  ],
  '9months': [
    { type: 'motor', label: '獨自坐立' },
    { type: 'motor', label: '爬行' },
    { type: 'communication', label: '理解簡單詞彙如「不要」、「掰掰」' },
    { type: 'social', label: '玩躲貓貓等互動遊戲' }
  ],
  '12months': [
    { type: 'motor', label: '扶物站立' },
    { type: 'motor', label: '可能邁出第一步' },
    { type: 'communication', label: '說出第一個詞彙（如「爸爸」、「媽媽」）' },
    { type: 'cognitive', label: '理解簡單指令' }
  ],
  '18months': [
    { type: 'motor', label: '獨立行走' },
    { type: 'motor', label: '可能開始爬樓梯' },
    { type: 'communication', label: '認識身體部位' },
    { type: 'cognitive', label: '拿筆塗鴉' }
  ],
  '24months': [
    { type: 'motor', label: '跑步' },
    { type: 'motor', label: '踢球' },
    { type: 'communication', label: '使用兩個詞組成簡單句子' },
    { type: 'cognitive', label: '開始分類物品' },
    { type: 'social', label: '模仿大人的行為' }
  ],
  '36months': [
    { type: 'motor', label: '踮腳走路' },
    { type: 'motor', label: '騎三輪車' },
    { type: 'communication', label: '說出完整句子' },
    { type: 'cognitive', label: '數到 10' },
    { type: 'social', label: '表達情感' }
  ]
};

/**
 * 情緒類型選項
 * @type {Array<Object>}
 */
export const MOOD_OPTIONS = [
  { value: 'happy', label: '開心', icon: 'fa-smile-beam' },
  { value: 'calm', label: '平靜', icon: 'fa-smile' },
  { value: 'tired', label: '疲倦', icon: 'fa-tired' },
  { value: 'fussy', label: '煩躁', icon: 'fa-frown' },
  { value: 'angry', label: '生氣', icon: 'fa-angry' },
  { value: 'scared', label: '害怕', icon: 'fa-grimace' },
  { value: 'uncomfortable', label: '不適', icon: 'fa-dizzy' },
  { value: 'crying', label: '哭泣', icon: 'fa-sad-tear' }
];

/**
 * 餵食方式選項
 * @type {Array<Object>}
 */
export const FEEDING_METHOD_OPTIONS = [
  { value: 'breast', label: '母乳' },
  { value: 'bottle', label: '奶瓶' },
  { value: 'formula', label: '配方奶' },
  { value: 'solidFood', label: '副食品' }
];

/**
 * 尿布類型選項
 * @type {Array<Object>}
 */
export const DIAPER_TYPE_OPTIONS = [
  { value: 'wet', label: '尿尿', icon: 'fa-tint' },
  { value: 'dirty', label: '便便', icon: 'fa-poo' },
  { value: 'mixed', label: '尿尿和便便', icon: 'fa-wind' },
  { value: 'dry', label: '乾爽（更換時間）', icon: 'fa-check' }
];

/**
 * 尿布狀況選項
 * @type {Array<Object>}
 */
export const DIAPER_CONDITION_OPTIONS = [
  { value: 'normal', label: '正常' },
  { value: 'loose', label: '稀便' },
  { value: 'hard', label: '硬便' },
  { value: 'mucus', label: '黏液' },
  { value: 'blood', label: '血絲' },
  { value: 'unusual', label: '異常顏色' }
];

/**
 * 健康記錄類型選項
 * @type {Array<Object>}
 */
export const HEALTH_RECORD_TYPES = [
  { value: 'weight', label: '體重', unit: 'kg', icon: 'fa-weight' },
  { value: 'height', label: '身高', unit: 'cm', icon: 'fa-ruler-vertical' },
  { value: 'temperature', label: '體溫', unit: '°C', icon: 'fa-thermometer-half' },
  { value: 'vaccine', label: '疫苗', icon: 'fa-syringe' },
  { value: 'medication', label: '用藥', icon: 'fa-pills' },
  { value: 'symptom', label: '症狀', icon: 'fa-stethoscope' },
  { value: 'doctor', label: '就醫紀錄', icon: 'fa-user-md' }
];

/**
 * 睡眠類型選項
 * @type {Array<Object>}
 */
export const SLEEP_TYPE_OPTIONS = [
  { value: 'night', label: '夜間睡眠' },
  { value: 'nap', label: '午睡' },
  { value: 'shortNap', label: '小睡' }
];

/**
 * 發展里程碑類型
 * @type {Array<Object>}
 */
export const MILESTONE_TYPES = [
  { value: 'motor', label: '運動能力', icon: 'fa-running' },
  { value: 'communication', label: '語言溝通', icon: 'fa-comments' },
  { value: 'cognitive', label: '認知發展', icon: 'fa-brain' },
  { value: 'social', label: '社交情緒', icon: 'fa-users' },
  { value: 'food', label: '飲食', icon: 'fa-utensils' },
  { value: 'other', label: '其他', icon: 'fa-star' }
];

/**
 * 親子反思提示問題
 * @type {Array<string>}
 */
export const REFLECTION_PROMPTS = [
  '今天與寶寶相處時，什麼時刻讓您感到最幸福？',
  '這週您注意到寶寶有什麼新的變化或能力？',
  '有什麼寶寶的小習慣或表情讓您覺得特別可愛？',
  '在照顧寶寶的過程中，您今天面臨了什麼挑戰？您是如何應對的？',
  '您覺得自己今天做得特別好的一件事是什麼？',
  '今天有沒有讓您感到困惑或擔憂的事情？',
  '如果可以重來，您今天會做出什麼不同的選擇？',
  '您對寶寶的未來有什麼期望或夢想？',
  '作為父母，您感覺自己有什麼成長或改變？',
  '今天有沒有瞬間讓您反思自己的教養方式？',
  '您從自己的父母那裡學到什麼育兒經驗，而您選擇繼承或改變的是什麼？',
  '您希望寶寶從您身上學到什麼最重要的品質或價值觀？',
  '今天您是如何表達對寶寶的愛的？',
  '您認為寶寶現在最需要您提供什麼？',
  '今天有什麼令您感到驕傲的親子互動時刻？',
  '您覺得自己需要什麼支持或資源來成為更好的父母？',
  '觀察寶寶的遊戲方式，您發現了什麼關於他/她性格的線索？',
  '您和伴侶在育兒理念上有什麼相同或不同之處？這如何影響您的親子關係？',
  '今天寶寶教會了您什麼？',
  '如果用一個詞來描述今天的親子時光，那會是什麼？為什麼？'
];

/**
 * 應用程式版本
 * @type {string}
 */
export const APP_VERSION = '1.0.0';

/**
 * 預設設定
 * @type {Object}
 */
export const DEFAULT_SETTINGS = {
  darkMode: false,
  notificationsEnabled: true,
  dataExportReminder: true,
  reminderFrequency: 'weekly',
  language: 'zh-TW'
};

/**
 * Service Worker 設定
 * @type {Object}
 */
export const SERVICE_WORKER_CONFIG = {
  enabled: true,
  cacheName: 'baby-grow-cache-v1',
  assetsToCache: [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/db.js',
    '/js/ui.js',
    '/js/config.js',
    '/assets/icons/baby-icon.png'
  ]
};