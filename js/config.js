'use strict';

/**
 * @fileoverview 應用程式配置文件
 * @author BabyLog 開發團隊
 * @version 1.0.0
 */

/**
 * 應用程式配置常量
 */
export const APP_CONFIG = {
  /**
   * 應用程式名稱
   */
  APP_NAME: '寶貝日誌',
  
  /**
   * IndexedDB 數據庫名稱
   */
  DB_NAME: 'babylogDB',
  
  /**
   * IndexedDB 數據庫版本
   */
  DB_VERSION: 1,
  
  /**
   * 本地存儲鍵名
   */
  STORAGE_KEYS: {
    /**
     * 首次使用標記
     */
    FIRST_USE: 'babylog_first_use',
    
    /**
     * 主題設置
     */
    THEME: 'babylog_theme',
    
    /**
     * 選定的孩子 ID
     */
    SELECTED_CHILD: 'babylog_selected_child'
  },
  
  /**
   * 反思提示列表
   */
  REFLECTION_PROMPTS: [
    '今天您和寶寶之間有什麼特別的互動讓您感到開心？',
    '您注意到寶寶今天學會了什麼新技能或表現出什麼新的行為？',
    '當寶寶哭鬧時，您發現哪些安撫方法特別有效？',
    '在照顧寶寶的過程中，今天您感到最具挑戰性的是什麼？',
    '您今天有沒有為自己留出一些時間？如果有，您做了什麼？',
    '今天有沒有一個與寶寶相處的時刻，讓您感到特別感恩？',
    '您發現寶寶對什麼特別感興趣或感到好奇？',
    '您今天如何鼓勵寶寶的探索和學習？',
    '您注意到寶寶的睡眠模式有什麼變化嗎？',
    '寶寶的飲食喜好或習慣有什麼新的發現？',
    '您今天學到了什麼關於育兒的新知識或技巧？',
    '您如何在忙碌的育兒生活中照顧自己的情緒健康？',
    '您今天與伴侶或其他家人如何分擔育兒責任？',
    '您想對未來的自己分享什麼關於今天的育兒經驗？',
    '如果可以重來，您今天會做什麼不同的選擇？',
    '您如何平衡工作（或其他責任）和照顧寶寶？',
    '您和寶寶今天有哪些愉快的遊戲或活動？',
    '您如何描述今天寶寶的整體情緒狀態？',
    '您發現哪些環境或情況會讓寶寶感到特別開心或安靜？',
    '您對寶寶的成長發展有什麼新的觀察或思考？'
  ],
  
  /**
   * 里程碑類別
   */
  MILESTONE_CATEGORIES: [
    {
      id: 'motor',
      name: '運動技能',
      milestones: [
        { id: 'head_control', name: '抬頭', typical_age: '1-4月' },
        { id: 'roll_over', name: '翻身', typical_age: '4-6月' },
        { id: 'sit_without_support', name: '獨坐', typical_age: '6-8月' },
        { id: 'crawl', name: '爬行', typical_age: '7-10月' },
        { id: 'stand_with_assistance', name: '扶站', typical_age: '8-10月' },
        { id: 'stand_alone', name: '獨站', typical_age: '9-12月' },
        { id: 'walk_with_assistance', name: '扶走', typical_age: '9-12月' },
        { id: 'walk_alone', name: '獨走', typical_age: '12-16月' },
        { id: 'climb_stairs', name: '爬樓梯', typical_age: '18-24月' },
        { id: 'run', name: '跑步', typical_age: '18-24月' },
        { id: 'kick_ball', name: '踢球', typical_age: '24-30月' },
        { id: 'jump', name: '跳躍', typical_age: '24-36月' }
      ]
    },
    {
      id: 'language',
      name: '語言能力',
      milestones: [
        { id: 'coo', name: '咕咕聲', typical_age: '1-3月' },
        { id: 'laugh', name: '笑聲', typical_age: '3-4月' },
        { id: 'babble', name: '牙牙學語', typical_age: '4-6月' },
        { id: 'respond_to_name', name: '對名字有反應', typical_age: '5-9月' },
        { id: 'understand_no', name: '理解"不"', typical_age: '6-12月' },
        { id: 'first_word', name: '第一個詞', typical_age: '9-14月' },
        { id: 'follow_simple_directions', name: '遵循簡單指示', typical_age: '12-18月' },
        { id: 'point_to_objects', name: '指物', typical_age: '12-18月' },
        { id: 'use_2_word_phrases', name: '兩詞句', typical_age: '18-24月' },
        { id: 'name_familiar_objects', name: '命名熟悉物品', typical_age: '18-24月' },
        { id: 'use_pronouns', name: '使用代詞', typical_age: '24-36月' },
        { id: 'three_word_sentences', name: '三詞句', typical_age: '24-36月' }
      ]
    },
    {
      id: 'social',
      name: '社交情感',
      milestones: [
        { id: 'social_smile', name: '社交性微笑', typical_age: '1-3月' },
        { id: 'recognize_parents', name: '認出父母', typical_age: '2-4月' },
        { id: 'stranger_anxiety', name: '陌生人焦慮', typical_age: '6-10月' },
        { id: 'separation_anxiety', name: '分離焦慮', typical_age: '8-14月' },
        { id: 'imitate_actions', name: '模仿行為', typical_age: '8-12月' },
        { id: 'play_peek_a_boo', name: '玩躲貓貓', typical_age: '6-10月' },
        { id: 'wave_bye', name: '揮手再見', typical_age: '8-12月' },
        { id: 'show_affection', name: '表達情感', typical_age: '9-15月' },
        { id: 'play_alongside_others', name: '平行遊戲', typical_age: '18-24月' },
        { id: 'show_empathy', name: '表現同理心', typical_age: '24-36月' },
        { id: 'engage_in_pretend_play', name: '假裝遊戲', typical_age: '24-36月' },
        { id: 'take_turns', name: '輪流玩耍', typical_age: '30-42月' }
      ]
    },
    {
      id: 'cognitive',
      name: '認知發展',
      milestones: [
        { id: 'follow_moving_objects', name: '追視移動物體', typical_age: '1-3月' },
        { id: 'recognize_familiar_faces', name: '認出熟悉的臉', typical_age: '2-4月' },
        { id: 'reach_for_objects', name: '伸手拿物品', typical_age: '3-5月' },
        { id: 'find_partially_hidden_objects', name: '找到部分隱藏的物體', typical_age: '5-8月' },
        { id: 'explore_objects', name: '探索物體', typical_age: '6-10月' },
        { id: 'object_permanence', name: '物體恆存', typical_age: '8-12月' },
        { id: 'cause_and_effect', name: '因果關係', typical_age: '8-12月' },
        { id: 'functional_play', name: '功能性遊戲', typical_age: '12-18月' },
        { id: 'sort_shapes', name: '分類形狀', typical_age: '18-24月' },
        { id: 'complete_simple_puzzles', name: '完成簡單拼圖', typical_age: '24-36月' },
        { id: 'understand_counting', name: '理解計數', typical_age: '24-36月' },
        { id: 'recognize_colors', name: '辨認顏色', typical_age: '30-42月' }
      ]
    },
    {
      id: 'self_help',
      name: '自理能力',
      milestones: [
        { id: 'hold_bottle', name: '握住奶瓶', typical_age: '3-6月' },
        { id: 'eat_finger_food', name: '吃手指食物', typical_age: '8-12月' },
        { id: 'drink_from_cup', name: '用杯子喝水', typical_age: '12-18月' },
        { id: 'use_spoon', name: '使用湯匙', typical_age: '15-24月' },
        { id: 'take_off_simple_clothes', name: '脫簡單衣物', typical_age: '18-24月' },
        { id: 'show_interest_in_toilet', name: '對廁所有興趣', typical_age: '18-30月' },
        { id: 'wash_hands', name: '洗手', typical_age: '24-30月' },
        { id: 'put_on_simple_clothes', name: '穿簡單衣物', typical_age: '24-36月' },
        { id: 'brush_teeth_with_help', name: '在幫助下刷牙', typical_age: '24-36月' },
        { id: 'daytime_potty_trained', name: '白天如廁訓練完成', typical_age: '24-48月' }
      ]
    }
  ],
  
  /**
   * 健康記錄類別
   */
  HEALTH_CATEGORIES: [
    {
      id: 'vaccination',
      name: '疫苗接種',
      fields: [
        { id: 'vaccine_name', name: '疫苗名稱', type: 'select', required: true, options: [] },
        { id: 'dose_number', name: '劑次', type: 'number', required: true },
        { id: 'location', name: '接種地點', type: 'text', required: false },
        { id: 'provider', name: '醫護人員', type: 'text', required: false },
        { id: 'reaction', name: '反應', type: 'textarea', required: false }
      ]
    },
    {
      id: 'medication',
      name: '用藥記錄',
      fields: [
        { id: 'medication_name', name: '藥物名稱', type: 'text', required: true },
        { id: 'dosage', name: '劑量', type: 'text', required: true },
        { id: 'frequency', name: '頻率', type: 'text', required: false },
        { id: 'reason', name: '原因', type: 'text', required: false },
        { id: 'prescriber', name: '處方醫生', type: 'text', required: false },
        { id: 'notes', name: '備註', type: 'textarea', required: false }
      ]
    },
    {
      id: 'illness',
      name: '疾病記錄',
      fields: [
        { id: 'symptom', name: '症狀', type: 'text', required: true },
        { id: 'temperature', name: '體溫', type: 'text', required: false },
        { id: 'started', name: '開始時間', type: 'datetime-local', required: false },
        { id: 'ended', name: '結束時間', type: 'datetime-local', required: false },
        { id: 'treatment', name: '治療', type: 'textarea', required: false },
        { id: 'notes', name: '備註', type: 'textarea', required: false }
      ]
    },
    {
      id: 'checkup',
      name: '體檢記錄',
      fields: [
        { id: 'provider', name: '醫生/醫院', type: 'text', required: true },
        { id: 'weight', name: '體重', type: 'text', required: false },
        { id: 'height', name: '身高', type: 'text', required: false },
        { id: 'head_circumference', name: '頭圍', type: 'text', required: false },
        { id: 'notes', name: '備註', type: 'textarea', required: false }
      ]
    },
    {
      id: 'allergy',
      name: '過敏記錄',
      fields: [
        { id: 'allergen', name: '過敏原', type: 'text', required: true },
        { id: 'reaction', name: '反應', type: 'text', required: true },
        { id: 'severity', name: '嚴重程度', type: 'select', required: false, options: [
          { value: 'mild', label: '輕微' },
          { value: 'moderate', label: '中等' },
          { value: 'severe', label: '嚴重' }
        ]},
        { id: 'notes', name: '備註', type: 'textarea', required: false }
      ]
    }
  ],
  
  /**
   * 疫苗類型列表
   */
  VACCINES: [
    { id: 'bcg', name: 'BCG (卡介苗)' },
    { id: 'hepb', name: 'B型肝炎疫苗' },
    { id: 'dtap', name: 'DTaP (白喉、破傷風、百日咳)' },
    { id: 'ipv', name: 'IPV (小兒麻痺)' },
    { id: 'hib', name: 'Hib (b型嗜血桿菌)' },
    { id: 'pcv', name: 'PCV (肺炎鏈球菌)' },
    { id: 'rv', name: 'RV (輪狀病毒)' },
    { id: 'mmr', name: 'MMR (麻疹、腮腺炎、德國麻疹)' },
    { id: 'var', name: 'VAR (水痘)' },
    { id: 'hepa', name: 'A型肝炎疫苗' },
    { id: 'flu', name: '流感疫苗' },
    { id: 'jev', name: '日本腦炎疫苗' },
    { id: 'other', name: '其他' }
  ]
};

// 將疫苗列表添加到健康記錄類別中
APP_CONFIG.HEALTH_CATEGORIES.find(category => category.id === 'vaccination')
  .fields.find(field => field.id === 'vaccine_name')
  .options = APP_CONFIG.VACCINES.map(vaccine => ({ value: vaccine.id, label: vaccine.name }));

/**
 * 獲取指定 ID 的里程碑類別
 * @param {string} categoryId - 類別 ID
 * @returns {Object|null} 里程碑類別對象或 null
 */
export function getMilestoneCategory(categoryId) {
  return APP_CONFIG.MILESTONE_CATEGORIES.find(category => category.id === categoryId) || null;
}

/**
 * 獲取指定類別中指定 ID 的里程碑
 * @param {string} categoryId - 類別 ID
 * @param {string} milestoneId - 里程碑 ID
 * @returns {Object|null} 里程碑對象或 null
 */
export function getMilestone(categoryId, milestoneId) {
  const category = getMilestoneCategory(categoryId);
  if (!category) return null;
  
  return category.milestones.find(milestone => milestone.id === milestoneId) || null;
}

/**
 * 獲取指定 ID 的健康記錄類別
 * @param {string} categoryId - 類別 ID
 * @returns {Object|null} 健康記錄類別對象或 null
 */
export function getHealthCategory(categoryId) {
  return APP_CONFIG.HEALTH_CATEGORIES.find(category => category.id === categoryId) || null;
}

/**
 * 獲取指定 ID 的疫苗
 * @param {string} vaccineId - 疫苗 ID
 * @returns {Object|null} 疫苗對象或 null
 */
export function getVaccine(vaccineId) {
  return APP_CONFIG.VACCINES.find(vaccine => vaccine.id === vaccineId) || null;
}