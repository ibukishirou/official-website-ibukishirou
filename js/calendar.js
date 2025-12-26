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
  regular: true,
  events: true
};

// ============================================
// 初期化
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // カレンダーデータを読み込み
    const response = await fetch('data/calendar.json');
    calendarData = await response.json();
    
    // フィルターイベントリスナー
    document.getElementById('filter-regular').addEventListener('change', (e) => {
      filters.regular = e.target.checked;
      renderCalendar(currentDate);
    });
    
    document.getElementById('filter-events').addEventListener('change', (e) => {
      filters.events = e.target.checked;
      renderCalendar(currentDate);
    });
    
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
// カレンダーレンダリング
// ============================================

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  
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
  
  // 日付番号
  const dayNumber = document.createElement('div');
  dayNumber.className = 'day-number';
  dayNumber.textContent = date.getDate();
  cell.appendChild(dayNumber);
  
  // イベントリスト
  const eventsList = document.createElement('div');
  eventsList.className = 'events-list';
  
  // イベントを取得して表示
  const events = getEventsForDate(date);
  events.forEach(event => {
    const eventElement = createEventElement(event, date);
    if (eventElement) {
      eventsList.appendChild(eventElement);
    }
  });
  
  cell.appendChild(eventsList);
  
  return cell;
}

// ============================================
// 日付のイベント取得
// ============================================

function getEventsForDate(date) {
  const events = [];
  
  if (!calendarData) return events;
  
  // 定期配信のチェック
  if (calendarData.regular && filters.regular) {
    calendarData.regular.forEach(regular => {
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
      if (regular.days[dayOfWeek]) {
        events.push({
          type: 'regular',
          title: regular.title,
          start_time: regular.start_time,
          end_time: regular.end_time,
          link: regular.link,
          date: date
        });
      }
    });
  }
  
  // イベントのチェック
  if (calendarData.events && filters.events) {
    calendarData.events.forEach(event => {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      
      // 日付のみで比較（時刻は無視）
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const eventStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const eventEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      if (checkDate >= eventStartDate && checkDate <= eventEndDate) {
        events.push({
          type: 'event',
          title: event.title,
          start: event.start,
          end: event.end,
          link: event.link,
          date: date,
          isStart: checkDate.getTime() === eventStartDate.getTime(),
          isEnd: checkDate.getTime() === eventEndDate.getTime(),
          isMultiDay: eventStartDate.getTime() !== eventEndDate.getTime()
        });
      }
    });
  }
  
  // 時刻順にソート
  events.sort((a, b) => {
    const timeA = getEventStartTime(a);
    const timeB = getEventStartTime(b);
    return timeA.localeCompare(timeB);
  });
  
  return events;
}

// ============================================
// イベント要素の作成
// ============================================

function createEventElement(event, date) {
  if (event.type === 'regular') {
    // 定期配信
    const eventItem = document.createElement('a');
    eventItem.className = `event-item regular ${filters.regular ? '' : 'hidden'}`;
    eventItem.href = event.link;
    eventItem.target = '_blank';
    eventItem.rel = 'noopener noreferrer';
    
    const time = document.createElement('span');
    time.className = 'event-time';
    time.textContent = `${event.start_time}-${event.end_time}`;
    
    eventItem.appendChild(time);
    eventItem.appendChild(document.createTextNode(event.title));
    
    return eventItem;
    
  } else if (event.type === 'event') {
    // 単発イベント
    if (event.isMultiDay) {
      // 複数日イベント（バー表示）
      const eventBar = document.createElement('div');
      eventBar.className = 'event-bar';
      
      const eventBarContent = document.createElement('a');
      eventBarContent.className = `event-bar-content ${filters.events ? '' : 'hidden'}`;
      eventBarContent.href = event.link;
      eventBarContent.target = '_blank';
      eventBarContent.rel = 'noopener noreferrer';
      
      // バーの位置を決定
      if (event.isStart && event.isEnd) {
        eventBarContent.classList.add('single');
      } else if (event.isStart) {
        eventBarContent.classList.add('start');
      } else if (event.isEnd) {
        eventBarContent.classList.add('end');
      } else {
        eventBarContent.classList.add('middle');
      }
      
      // 開始日のみタイトルと時刻を表示
      if (event.isStart) {
        const startDate = new Date(event.start);
        const time = document.createElement('span');
        time.className = 'event-time';
        time.textContent = `${formatTime(startDate)} `;
        eventBarContent.appendChild(time);
        eventBarContent.appendChild(document.createTextNode(event.title));
      } else {
        eventBarContent.appendChild(document.createTextNode(''));
      }
      
      eventBar.appendChild(eventBarContent);
      return eventBar;
      
    } else {
      // 単日イベント
      const eventItem = document.createElement('a');
      eventItem.className = `event-item event ${filters.events ? '' : 'hidden'}`;
      eventItem.href = event.link;
      eventItem.target = '_blank';
      eventItem.rel = 'noopener noreferrer';
      
      const startDate = new Date(event.start);
      const time = document.createElement('span');
      time.className = 'event-time';
      time.textContent = `${formatTime(startDate)} `;
      
      eventItem.appendChild(time);
      eventItem.appendChild(document.createTextNode(event.title));
      
      return eventItem;
    }
  }
  
  return null;
}

// ============================================
// ユーティリティ関数
// ============================================

function getEventStartTime(event) {
  if (event.type === 'regular') {
    return event.start_time;
  } else if (event.type === 'event') {
    const date = new Date(event.start);
    return formatTime(date);
  }
  return '00:00';
}

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
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
