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
  regular: true
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
  
  // 複数日イベントのバーを追加
  addMultiDayEventBars(grid, year, month);
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
  cell.dataset.date = date.toISOString().split('T')[0];
  
  // 日付番号
  const dayNumber = document.createElement('div');
  dayNumber.className = 'day-number';
  dayNumber.textContent = date.getDate();
  cell.appendChild(dayNumber);
  
  // イベントリスト
  const eventsList = document.createElement('div');
  eventsList.className = 'events-list';
  
  // 単日イベントを取得して表示
  const events = getSingleDayEventsForDate(date);
  events.forEach(event => {
    const eventElement = createEventElement(event);
    if (eventElement) {
      eventsList.appendChild(eventElement);
    }
  });
  
  cell.appendChild(eventsList);
  
  return cell;
}

// ============================================
// 単日イベント取得（定期配信のみ）
// ============================================

function getSingleDayEventsForDate(date) {
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
  
  // 時刻順にソート
  events.sort((a, b) => {
    return a.start_time.localeCompare(b.start_time);
  });
  
  return events;
}

// ============================================
// イベント要素の作成（定期配信）
// ============================================

function createEventElement(event) {
  if (event.type === 'regular') {
    const eventItem = document.createElement('a');
    eventItem.className = 'event-item regular';
    eventItem.href = event.link;
    eventItem.target = '_blank';
    eventItem.rel = 'noopener noreferrer';
    
    const time = document.createElement('span');
    time.className = 'event-time';
    time.textContent = `${formatTime(event.start_time)}-${formatTime(event.end_time)} `;
    
    eventItem.appendChild(time);
    eventItem.appendChild(document.createTextNode(event.title));
    
    return eventItem;
  }
  
  return null;
}

// ============================================
// 複数日イベントのバー追加
// ============================================

function addMultiDayEventBars(grid, year, month) {
  if (!calendarData || !calendarData.events) return;
  
  // グリッドから日付セルを取得（曜日ヘッダーを除く）
  const dayCells = Array.from(grid.children).filter(cell => 
    cell.classList.contains('calendar-day')
  );
  
  // 週ごとにグループ化
  const weeks = [];
  for (let i = 0; i < dayCells.length; i += 7) {
    weeks.push(dayCells.slice(i, i + 7));
  }
  
  // 各イベントを処理
  calendarData.events.forEach((event, eventIndex) => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    const color = event.color || '#CD5C5C'; // デフォルト色
    
    // 各週について処理
    weeks.forEach((week, weekIndex) => {
      const weekStart = new Date(week[0].dataset.date);
      const weekEnd = new Date(week[6].dataset.date);
      
      // このイベントがこの週に表示されるか確認
      if (endDate >= weekStart && startDate <= weekEnd) {
        // バーの開始と終了を計算
        let barStart = 0;
        let barEnd = 6;
        
        for (let i = 0; i < 7; i++) {
          const cellDate = new Date(week[i].dataset.date);
          if (cellDate < startDate) {
            barStart = i + 1;
          }
          if (cellDate > endDate) {
            barEnd = i - 1;
            break;
          }
        }
        
        // バーを追加
        if (barStart <= barEnd) {
          const isStart = startDate >= weekStart;
          const isEnd = endDate <= weekEnd;
          
          // 最初のセルにバーを追加
          const startCell = week[barStart];
          const eventBar = document.createElement('div');
          eventBar.className = 'event-bar';
          eventBar.style.gridColumn = `${barStart + 1} / ${barEnd + 2}`;
          eventBar.style.gridRow = `${weekIndex + 2}`;
          
          const eventBarContent = document.createElement('a');
          eventBarContent.className = 'event-bar-content';
          eventBarContent.href = event.link;
          eventBarContent.target = '_blank';
          eventBarContent.rel = 'noopener noreferrer';
          eventBarContent.style.backgroundColor = color;
          
          // 開始日のみタイトルと時刻を表示
          if (isStart) {
            const startDateTime = new Date(event.start);
            const time = document.createElement('span');
            time.className = 'event-time';
            time.textContent = `${formatTimeFromDate(startDateTime)} `;
            eventBarContent.appendChild(time);
            eventBarContent.appendChild(document.createTextNode(event.title));
          }
          
          eventBar.appendChild(eventBarContent);
          
          // バーをグリッドに直接追加
          // イベントリストの後に挿入
          const eventsList = startCell.querySelector('.events-list');
          if (eventsList) {
            eventsList.appendChild(eventBar);
          }
        }
      }
    });
  });
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
