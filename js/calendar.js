// ============================================
// イベントカレンダー - メインロジック
// ============================================

let calendarData = null;
let currentDate = new Date();
let minDate = new Date();
let maxDate = new Date();

// 前後6ヶ月の範囲を設定
minDate.setMonth(currentDate.getMonth() - 6);
maxDate.setMonth(currentDate.getMonth() + 6);

// フィルター状態
let filters = {
  regular: false
};

// ============================================
// スワイプ機能のための変数
// ============================================

let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;
const swipeThreshold = 50; // スワイプと認識する最小距離（ピクセル）

// ============================================
// 初期化
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // カレンダーデータを読み込み
    const response = await fetch('data/calendar.json');
    calendarData = await response.json();
    
    console.log('Calendar data loaded:', calendarData);
    
    // フィルターイベントリスナー
    const filterRegular = document.getElementById('filter-regular');
    if (filterRegular) {
      filterRegular.addEventListener('change', (e) => {
        filters.regular = e.target.checked;
        renderCalendar(currentDate);
      });
    }
    
    // ナビゲーションボタン
    document.getElementById('prev-month').addEventListener('click', () => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      if (newDate >= minDate) {
        currentDate = newDate;
        renderCalendar(currentDate);
        updateNavigationButtons();
      }
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      if (newDate <= maxDate) {
        currentDate = newDate;
        renderCalendar(currentDate);
        updateNavigationButtons();
      }
    });
    
    // スワイプイベントリスナー（SPビュー用）
    const calendarContainer = document.getElementById('calendar-container');
    
    calendarContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      // touchstartでもpreventDefaultを呼ぶことで、より早い段階でブラウザジェスチャーをブロック
      e.preventDefault();
    }, { passive: false });
    
    calendarContainer.addEventListener('touchmove', (e) => {
      // 常にpreventDefaultを呼び、ブラウザのデフォルト動作を完全にブロック
      // touch-action: pan-y と併用することで二重の保護
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });
    
    calendarContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      e.preventDefault();
      handleSwipe();
    }, { passive: false });
    
    // 初回レンダリング
    renderCalendar(currentDate);
    updateNavigationButtons();
    
  } catch (error) {
    console.error('カレンダーデータの読み込みに失敗しました:', error);
    document.getElementById('calendar-container').innerHTML = 
      '<p style="text-align: center; color: var(--color-text-secondary);">カレンダーデータの読み込みに失敗しました。</p>';
  }
});

// ============================================
// スワイプ処理
// ============================================

function handleSwipe() {
  const horizontalDistance = touchEndX - touchStartX;
  const verticalDistance = Math.abs(touchEndY - touchStartY);
  
  // 垂直方向の動きが大きい場合はスワイプとして処理しない（スクロール優先）
  if (verticalDistance > Math.abs(horizontalDistance)) {
    return;
  }
  
  // 左スワイプ（次の月へ）
  if (horizontalDistance < -swipeThreshold) {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    if (newDate <= maxDate) {
      animateCalendarTransition('left');
      setTimeout(() => {
        currentDate = newDate;
        renderCalendar(currentDate);
        updateNavigationButtons();
      }, 150);
    }
  }
  
  // 右スワイプ（前の月へ）
  if (horizontalDistance > swipeThreshold) {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    if (newDate >= minDate) {
      animateCalendarTransition('right');
      setTimeout(() => {
        currentDate = newDate;
        renderCalendar(currentDate);
        updateNavigationButtons();
      }, 150);
    }
  }
}

// ============================================
// カレンダー切り替えアニメーション
// ============================================

function animateCalendarTransition(direction) {
  const container = document.getElementById('calendar-container');
  
  if (direction === 'left') {
    container.classList.add('swipe-left');
  } else if (direction === 'right') {
    container.classList.add('swipe-right');
  }
  
  // アニメーション終了後にクラスを削除
  setTimeout(() => {
    container.classList.remove('swipe-left', 'swipe-right');
  }, 300);
}

// ============================================
// カレンダーレンダリング
// ============================================

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  console.log('Rendering calendar for:', year, month + 1);
  
  // 月のタイトルを更新
  document.getElementById('current-month').textContent = 
    `${year}年 ${month + 1}月`;
  
  // カレンダーグリッドを生成
  const container = document.getElementById('calendar-container');
  const grid = document.createElement('div');
  grid.className = 'calendar-grid';
  
  // 曜日ヘッダー
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekdayClasses = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  weekdays.forEach((day, index) => {
    const weekdayCell = document.createElement('div');
    weekdayCell.className = `calendar-weekday ${weekdayClasses[index]}`;
    weekdayCell.textContent = day;
    grid.appendChild(weekdayCell);
  });
  
  // 月の最初の日と最後の日を取得
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  // 前月の日付を埋める
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayCell = createDayCell(
      new Date(year, month - 1, prevMonthLastDay - i),
      true
    );
    grid.appendChild(dayCell);
  }
  
  // 当月の日付
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = createDayCell(new Date(year, month, day), false);
    grid.appendChild(dayCell);
  }
  
  // 次月の日付を埋める（グリッドを完成させる）
  const totalCells = grid.children.length - 7; // 曜日ヘッダーを除く
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let day = 1; day <= remainingCells; day++) {
    const dayCell = createDayCell(new Date(year, month + 1, day), true);
    grid.appendChild(dayCell);
  }
  
  container.innerHTML = '';
  container.appendChild(grid);
}

// ============================================
// 日付セルの作成
// ============================================

function createDayCell(date, isOtherMonth) {
  const cell = document.createElement('div');
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const dayOfWeek = date.getDay();
  
  // クラス設定
  cell.className = 'calendar-day';
  if (isOtherMonth) cell.classList.add('other-month');
  if (isToday) cell.classList.add('today');
  if (dayOfWeek === 0) cell.classList.add('sunday');
  if (dayOfWeek === 6) cell.classList.add('saturday');
  
  // データ属性として日付を保存
  cell.dataset.date = formatDateString(date);
  
  // 日付番号
  const dayNumber = document.createElement('div');
  dayNumber.className = 'day-number';
  dayNumber.textContent = date.getDate();
  cell.appendChild(dayNumber);
  
  // イベントリスト
  const eventsList = document.createElement('div');
  eventsList.className = 'events-list';
  
  // すべてのイベント（定期配信 + 特別イベント）を取得
  const allEvents = getEventsForDate(date);
  
  allEvents.forEach(event => {
    const eventElement = createEventElement(event);
    if (eventElement) {
      eventsList.appendChild(eventElement);
    }
  });
  
  cell.appendChild(eventsList);
  
  return cell;
}

// ============================================
// 日付のイベント取得（定期配信 + 特別イベント）
// ============================================

function getEventsForDate(date) {
  const events = [];
  
  if (!calendarData) return events;
  
  // 定期配信のチェック
  if (calendarData.regular && calendarData.regular.scheduled && filters.regular) {
    calendarData.regular.scheduled.forEach(regular => {
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
      if (regular.days[dayOfWeek]) {
        events.push({
          type: 'regular',
          title: regular.title,
          start_time: regular.start_time,
          end_time: regular.end_time,
          link: regular.link,
          tags: regular.tags || [],
          sortTime: regular.start_time
        });
      }
    });
  }
  
  // 記念日のチェック（毎年表示、フィルター対象外）
  if (calendarData.regular && calendarData.regular.celebration) {
    calendarData.regular.celebration.forEach(celebration => {
      const [month, day] = celebration.date.split('-').map(Number);
      if (date.getMonth() + 1 === month && date.getDate() === day) {
        events.push({
          type: 'celebration',
          title: celebration.title,
          link: celebration.link,
          color: getColorFromTags(celebration.tags),
          tags: celebration.tags || [],
          sortTime: '00:00' // 記念日は終日イベントなので一番上に表示
        });
      }
    });
  }
  
  // 特別イベントのチェック
  if (calendarData.events) {
    calendarData.events.forEach(event => {
      if (isEventOnDate(event, date)) {
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        const dateStr = formatDateString(date);
        const startDateStr = formatDateString(startDate);
        const endDateStr = formatDateString(endDate);
        
        events.push({
          type: 'event',
          title: event.title,
          start: event.start,
          end: event.end,
          link: event.link,
          color: getColorFromTags(event.tags),
          tags: event.tags || [],
          isStart: dateStr === startDateStr,
          isEnd: dateStr === endDateStr,
          isMultiDay: startDateStr !== endDateStr,
          sortTime: formatTimeFromDate(startDate)
        });
      }
    });
  }
  
  // 時刻順にソート
  events.sort((a, b) => {
    return a.sortTime.localeCompare(b.sortTime);
  });
  
  return events;
}

// ============================================
// イベントが指定日付に該当するか確認
// ============================================

function isEventOnDate(event, date) {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  
  // 日付のみで比較（時刻は無視）
  const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const eventStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const eventEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  
  return checkDate >= eventStartDate && checkDate <= eventEndDate;
}

// ============================================
// イベント要素の作成
// ============================================

function createEventElement(event) {
  if (event.type === 'celebration') {
    // 記念日
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item celebration';
    eventItem.style.backgroundColor = event.color;
    eventItem.style.color = '#ffffff';
    
    // タイトルとタグの行
    const contentRow = document.createElement('div');
    contentRow.className = 'event-content-row';
    
    // タイトル
    const titleDiv = document.createElement('div');
    titleDiv.className = 'event-title';
    titleDiv.textContent = event.title;
    contentRow.appendChild(titleDiv);
    
    // タグ表示
    if (event.tags && event.tags.length > 0) {
      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'event-tags';
      event.tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'event-tag';
        tagSpan.textContent = tag;
        tagsDiv.appendChild(tagSpan);
      });
      contentRow.appendChild(tagsDiv);
    }
    
    eventItem.appendChild(contentRow);
    
    // クリックイベント
    eventItem.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        showEventModal(event);
      } else {
        window.open(event.link, '_blank');
      }
    });
    
    return eventItem;
    
  } else if (event.type === 'regular') {
    // 定期配信
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item regular';
    
    // 時刻（上部）
    const timeDiv = document.createElement('div');
    timeDiv.className = 'event-time';
    timeDiv.textContent = `${formatTime(event.start_time)}-${formatTime(event.end_time)}`;
    eventItem.appendChild(timeDiv);
    
    // タイトルとタグの行
    const contentRow = document.createElement('div');
    contentRow.className = 'event-content-row';
    
    // タイトル
    const titleDiv = document.createElement('div');
    titleDiv.className = 'event-title';
    titleDiv.textContent = event.title;
    contentRow.appendChild(titleDiv);
    
    // タグ表示
    if (event.tags && event.tags.length > 0) {
      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'event-tags';
      event.tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'event-tag';
        tagSpan.textContent = tag;
        tagsDiv.appendChild(tagSpan);
      });
      contentRow.appendChild(tagsDiv);
    }
    
    eventItem.appendChild(contentRow);
    
    // クリックイベント
    eventItem.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        showEventModal(event);
      } else {
        window.open(event.link, '_blank');
      }
    });
    
    return eventItem;
    
  } else if (event.type === 'event') {
    // 特別イベント
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item event';
    eventItem.style.backgroundColor = event.color;
    eventItem.style.color = '#ffffff';
    
    // 時刻（上部）- 複数日イベントの場合は開始/終了を区別
    const timeDiv = document.createElement('div');
    timeDiv.className = 'event-time';
    
    if (event.isMultiDay) {
      if (event.isStart) {
        // 開始日: "時刻~"
        const startDate = new Date(event.start);
        timeDiv.textContent = `${formatTimeFromDate(startDate)}~`;
      } else if (event.isEnd) {
        // 終了日: "~時刻"
        const endDate = new Date(event.end);
        timeDiv.textContent = `~${formatTimeFromDate(endDate)}`;
      } else {
        // 中間日: 時刻なし
        timeDiv.textContent = '';
      }
    } else {
      // 単日イベント: "開始-終了"
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      timeDiv.textContent = `${formatTimeFromDate(startDate)}-${formatTimeFromDate(endDate)}`;
    }
    
    if (timeDiv.textContent) {
      eventItem.appendChild(timeDiv);
    }
    
    // タイトルとタグの行
    const contentRow = document.createElement('div');
    contentRow.className = 'event-content-row';
    
    // タイトル
    const titleDiv = document.createElement('div');
    titleDiv.className = 'event-title';
    titleDiv.textContent = event.title;
    contentRow.appendChild(titleDiv);
    
    // タグ表示（開始日、終了日、または単日イベントで表示）
    if ((event.isStart || event.isEnd || !event.isMultiDay) && event.tags && event.tags.length > 0) {
      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'event-tags';
      event.tags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'event-tag';
        tagSpan.textContent = tag;
        tagsDiv.appendChild(tagSpan);
      });
      contentRow.appendChild(tagsDiv);
    }
    
    eventItem.appendChild(contentRow);
    
    // クリックイベント
    eventItem.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        showEventModal(event);
      } else {
        window.open(event.link, '_blank');
      }
    });
    
    return eventItem;
  }
  
  return null;
}

// ============================================
// モーダル表示
// ============================================

function showEventModal(event) {
  // モーダルが既に存在する場合は削除
  const existingModal = document.querySelector('.event-modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }
  
  // モーダルオーバーレイを作成
  const overlay = document.createElement('div');
  overlay.className = 'event-modal-overlay';
  
  // モーダル本体
  const modal = document.createElement('div');
  modal.className = 'event-modal';
  
  // 閉じるボタン
  const closeBtn = document.createElement('button');
  closeBtn.className = 'event-modal-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  });
  modal.appendChild(closeBtn);
  
  // 時刻（上部に表示、年月日も含める）
  const timeDiv = document.createElement('div');
  timeDiv.className = 'event-modal-time';
  
  if (event.type === 'celebration') {
    // 記念日の場合は終日イベントとして表示
    timeDiv.textContent = '終日';
  } else if (event.type === 'regular') {
    // 定期配信の場合は曜日から日付を取得する必要があるため、現在の日付を使用
    const today = new Date();
    timeDiv.textContent = `${formatDateTimeString(today)} ${formatTime(event.start_time)} ~ ${formatTime(event.end_time)}`;
  } else if (event.type === 'event') {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    if (event.isMultiDay) {
      // 複数日予定の場合は常に「開始日時 ~ 終了日時」形式で表示
      timeDiv.textContent = `${formatDateTimeString(startDate)} ${formatTimeFromDate(startDate)} ~ ${formatDateTimeString(endDate)} ${formatTimeFromDate(endDate)}`;
    } else {
      // 1日で終わる予定は現在の仕様のまま
      timeDiv.textContent = `${formatDateTimeString(startDate)} ${formatTimeFromDate(startDate)} ~ ${formatTimeFromDate(endDate)}`;
    }
  }
  
  modal.appendChild(timeDiv);
  
  // タイトルとタグの行
  const contentRow = document.createElement('div');
  contentRow.className = 'event-modal-content-row';
  
  // タイトル
  const titleDiv = document.createElement('div');
  titleDiv.className = 'event-modal-title';
  titleDiv.textContent = event.title;
  contentRow.appendChild(titleDiv);
  
  // タグ
  if (event.tags && event.tags.length > 0) {
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'event-modal-tags';
    event.tags.forEach(tag => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'event-modal-tag';
      tagSpan.textContent = tag;
      tagsDiv.appendChild(tagSpan);
    });
    contentRow.appendChild(tagsDiv);
  }
  
  modal.appendChild(contentRow);
  
  // 詳細ボタン
  const detailBtn = document.createElement('a');
  detailBtn.className = 'event-modal-button';
  detailBtn.textContent = '詳細を見る';
  detailBtn.href = event.link;
  detailBtn.target = '_blank';
  detailBtn.rel = 'noopener noreferrer';
  // 予定の色を背景色として適用
  if (event.color) {
    detailBtn.style.backgroundColor = event.color;
  }
  modal.appendChild(detailBtn);
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  // アニメーション用に少し遅延
  setTimeout(() => {
    overlay.classList.add('active');
  }, 10);
  
  // オーバーレイクリックで閉じる
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    }
  });
}

// ============================================
// タグから色を取得
// ============================================

function getColorFromTags(tags) {
  if (!tags || tags.length === 0) {
    return '#CD5C5C'; // デフォルト色
  }
  
  // タグごとの色マッピング（優先度順）
  const tagColorMap = {
    '配信': '#FF4500',      // オレンジレッド
    '記念': '#dc143c',      // 深紅色
    'メン限': '#FF0000',    // 赤色
    'コラボ': '#0000ff',    // 青色
    'マダミス': '#0000ff',  // 青色
    'TRPG': '#0000ff',      // 青色
    'リアイベ': '#228b22',  // フォレストグリーン
    '企業コラボ': '#228b22' // フォレストグリーン
  };
  
  // 最初にマッチしたタグの色を返す
  for (const tag of tags) {
    if (tagColorMap[tag]) {
      return tagColorMap[tag];
    }
  }
  
  // マッチしない場合はデフォルト色
  return '#CD5C5C';
}

// ============================================
// ユーティリティ関数
// ============================================

function formatTime(timeString) {
  // "07:30" -> "7:30" のように先頭の0を削除
  const [hours, minutes] = timeString.split(':');
  return `${parseInt(hours, 10)}:${minutes}`;
}

function formatTimeFromDate(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateTimeString(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');
  
  // 前の月ボタン
  const prevMonth = new Date(currentDate);
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  prevBtn.disabled = prevMonth < minDate;
  
  // 次の月ボタン
  const nextMonth = new Date(currentDate);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextBtn.disabled = nextMonth > maxDate;
}
