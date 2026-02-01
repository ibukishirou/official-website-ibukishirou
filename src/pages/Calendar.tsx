import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import '../styles/calendar.css';

interface RegularScheduled {
  title: string;
  start_time: string;
  end_time: string;
  link: string;
  tags: string[];
  days: {
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
  };
  exclusion_dates?: string[];
}

interface Celebration {
  title: string;
  date: string;
  link: string;
  tags: string[];
}

interface CalendarEvent {
  title: string;
  start: string;
  end: string;
  link: string;
  tags: string[];
}

interface CalendarData {
  regular: {
    scheduled: RegularScheduled[];
    celebration: Celebration[];
  };
  events: CalendarEvent[];
}

interface ProcessedEvent {
  type: 'regular' | 'celebration' | 'event' | 'exclusion';
  title: string;
  link?: string;
  tags: string[];
  start_time?: string;
  end_time?: string;
  start?: string;
  end?: string;
  color?: string;
  sortTime: string;
  sortPriority: number;
  isStart?: boolean;
  isEnd?: boolean;
  isMultiDay?: boolean;
}

export default function Calendar() {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showRegular, setShowRegular] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const minDate = new Date();
  const maxDate = new Date();
  minDate.setMonth(currentDate.getMonth() - 6);
  maxDate.setMonth(currentDate.getMonth() + 6);

  useEffect(() => {
    // カレンダーデータの読み込み
    const loadCalendar = async () => {
      try {
        const response = await fetch('/data/calendar.json');
        const data: CalendarData = await response.json();
        setCalendarData(data);
      } catch (error) {
        console.error('カレンダーデータの読み込みに失敗しました:', error);
      }
    };
    loadCalendar();
  }, []);

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    return `${parseInt(hours, 10)}:${minutes}`;
  };

  const formatTimeFromDate = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // const formatDateTimeString = (date: Date): string => {
  //   const year = date.getFullYear();
  //   const month = date.getMonth() + 1;
  //   const day = date.getDate();
  //   return `${year}年${month}月${day}日`;
  // };

  const getColorFromTags = (tags: string[]): string => {
    if (!tags || tags.length === 0) return '#CD5C5C';
    
    const tagColorMap: { [key: string]: string } = {
      '配信': '#FF4500',
      '記念': '#dc143c',
      'メン限': '#FF0000',
      '動画': '#3131cc',
      'リアイベ': '#daa520',
      'グッズ': '#259925'
    };

    for (const tag of tags) {
      if (tagColorMap[tag]) {
        return tagColorMap[tag];
      }
    }
    
    return '#CD5C5C';
  };

  const isEventOnDate = (event: CalendarEvent, date: Date): boolean => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const eventStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const eventEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    return checkDate >= eventStartDate && checkDate <= eventEndDate;
  };

  const getEventsForDate = (date: Date): ProcessedEvent[] => {
    const events: ProcessedEvent[] = [];
    
    if (!calendarData) return events;

    // 定期配信のチェック
    if (calendarData.regular?.scheduled) {
      calendarData.regular.scheduled.forEach(regular => {
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
        const dateStr = formatDateString(date);
        
        const isExcluded = regular.exclusion_dates && regular.exclusion_dates.includes(dateStr);
        
        if (isExcluded) {
          events.push({
            type: 'exclusion',
            title: `${regular.title}休み`,
            tags: [],
            sortTime: '00:00:00',
            sortPriority: 0,
            color: '#808080'
          });
        } else if (regular.days[dayOfWeek as keyof typeof regular.days] && showRegular) {
          events.push({
            type: 'regular',
            title: regular.title,
            start_time: regular.start_time,
            end_time: regular.end_time,
            link: regular.link,
            tags: regular.tags || [],
            sortTime: regular.start_time,
            sortPriority: 2
          });
        }
      });
    }

    // 記念日のチェック
    if (calendarData.regular?.celebration) {
      calendarData.regular.celebration.forEach(celebration => {
        const [month, day] = celebration.date.split('-').map(Number);
        if (date.getMonth() + 1 === month && date.getDate() === day) {
          events.push({
            type: 'celebration',
            title: celebration.title,
            link: celebration.link,
            color: getColorFromTags(celebration.tags),
            tags: celebration.tags || [],
            sortTime: '00:00',
            sortPriority: 1
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
            sortTime: formatTimeFromDate(startDate),
            sortPriority: 3
          });
        }
      });
    }

    // 優先度と時刻順にソート
    events.sort((a, b) => {
      const priorityA = a.sortPriority !== undefined ? a.sortPriority : 999;
      const priorityB = b.sortPriority !== undefined ? b.sortPriority : 999;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return a.sortTime.localeCompare(b.sortTime);
    });

    return events;
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekdayClasses = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days: JSX.Element[] = [];
    
    // 曜日ヘッダー
    weekdays.forEach((day, index) => {
      days.push(
        <div key={`weekday-${index}`} className={`calendar-weekday ${weekdayClasses[index]}`}>
          {day}
        </div>
      );
    });
    
    // 前月の日付
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(renderDayCell(date, true));
    }
    
    // 当月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(renderDayCell(date, false));
    }
    
    // 次月の日付
    const totalCells = days.length - 7;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push(renderDayCell(date, true));
    }
    
    return days;
  };

  const renderDayCell = (date: Date, isOtherMonth: boolean) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const dayOfWeek = date.getDay();
    
    const classList = ['calendar-day'];
    if (isOtherMonth) classList.push('other-month');
    if (isToday) classList.push('today');
    if (dayOfWeek === 0) classList.push('sunday');
    if (dayOfWeek === 6) classList.push('saturday');
    
    const events = getEventsForDate(date);
    
    return (
      <div key={formatDateString(date)} className={classList.join(' ')} data-date={formatDateString(date)}>
        <div className="day-number">{date.getDate()}</div>
        <div className="events-list">
          {events.map((event, index) => renderEvent(event, index))}
        </div>
      </div>
    );
  };

  const renderEvent = (event: ProcessedEvent, index: number) => {
    if (event.type === 'celebration') {
      return (
        <div
          key={index}
          className="event-item celebration"
          style={{ backgroundColor: event.color, color: '#ffffff' }}
          onClick={() => event.link && window.open(event.link, '_blank')}
        >
          <div className="event-content-row">
            <div className="event-title">{event.title}</div>
            {event.tags.length > 0 && (
              <div className="event-tags">
                {event.tags.map((tag, i) => (
                  <span key={i} className="event-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    } else if (event.type === 'exclusion') {
      return (
        <div
          key={index}
          className="event-item"
          style={{ backgroundColor: event.color, cursor: 'default' }}
        >
          <div className="event-title">{event.title}</div>
        </div>
      );
    } else if (event.type === 'regular') {
      return (
        <div
          key={index}
          className="event-item regular"
          onClick={() => event.link && window.open(event.link, '_blank')}
        >
          <div className="event-time">
            {formatTime(event.start_time!)}-{formatTime(event.end_time!)}
          </div>
          <div className="event-content-row">
            <div className="event-title">{event.title}</div>
            {event.tags.length > 0 && (
              <div className="event-tags">
                {event.tags.map((tag, i) => (
                  <span key={i} className="event-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    } else if (event.type === 'event') {
      const startDate = event.start ? new Date(event.start) : new Date();
      const endDate = event.end ? new Date(event.end) : new Date();
      
      let timeText = '';
      if (event.isMultiDay) {
        if (event.isStart) {
          timeText = `${formatTimeFromDate(startDate)}~`;
        } else if (event.isEnd) {
          timeText = `~${formatTimeFromDate(endDate)}`;
        }
      } else {
        timeText = `${formatTimeFromDate(startDate)}-${formatTimeFromDate(endDate)}`;
      }
      
      return (
        <div
          key={index}
          className="event-item event"
          style={{ backgroundColor: event.color, color: '#ffffff' }}
          onClick={() => event.link && window.open(event.link, '_blank')}
        >
          {timeText && <div className="event-time">{timeText}</div>}
          <div className="event-content-row">
            <div className="event-title">{event.title}</div>
            {(event.isStart || event.isEnd || !event.isMultiDay) && event.tags.length > 0 && (
              <div className="event-tags">
                {event.tags.map((tag, i) => (
                  <span key={i} className="event-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };

  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    if (newDate >= minDate) {
      setCurrentDate(newDate);
    }
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    if (newDate <= maxDate) {
      setCurrentDate(newDate);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.changedTouches[0].screenX,
      y: e.changedTouches[0].screenY
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = {
      x: e.changedTouches[0].screenX,
      y: e.changedTouches[0].screenY
    };
    
    const horizontalDistance = touchEnd.x - touchStart.x;
    const verticalDistance = Math.abs(touchEnd.y - touchStart.y);
    
    if (verticalDistance > Math.abs(horizontalDistance)) {
      return;
    }
    
    const swipeThreshold = 50;
    
    if (horizontalDistance < -swipeThreshold) {
      nextMonth();
    } else if (horizontalDistance > swipeThreshold) {
      prevMonth();
    }
  };

  return (
    <>
      <Helmet>
        <title>イベントカレンダー - 伊吹しろう Official Website</title>
        <meta name="description" content="VTuber 伊吹しろうのイベントカレンダー。配信スケジュール、コラボイベント、特別企画などをチェック。" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="イベントカレンダー - 伊吹しろう Official Website" />
        <meta property="og:description" content="VTuber 伊吹しろうのイベントカレンダー。配信スケジュール、コラボイベント、特別企画などをチェック。" />
        <meta property="og:url" content="https://ulric.jp/calendar" />
        <meta property="og:image" content="https://ulric.jp/assets/img/ogp.webp" />
      </Helmet>

      <main>
        <section id="calendar-section">
          <h1 className="section-title">Calendar</h1>
          
          {/* フィルター */}
          <div className="calendar-filter">
            <label className="filter-item">
              <input 
                type="checkbox" 
                id="filter-regular"
                checked={showRegular}
                onChange={(e) => setShowRegular(e.target.checked)}
              />
              <span className="filter-label">
                <span className="filter-color regular"></span>
                定期配信を表示
              </span>
            </label>
          </div>

          {/* カレンダーナビゲーション */}
          <div className="calendar-nav">
            <button 
              id="prev-month" 
              className="nav-btn" 
              aria-label="前の月"
              onClick={prevMonth}
              disabled={new Date(currentDate.getFullYear(), currentDate.getMonth() - 1) < minDate}
            >
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <h2 id="current-month" className="current-month">
              {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
            </h2>
            <button 
              id="next-month" 
              className="nav-btn" 
              aria-label="次の月"
              onClick={nextMonth}
              disabled={new Date(currentDate.getFullYear(), currentDate.getMonth() + 1) > maxDate}
            >
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>

          {/* カレンダー本体 */}
          <div 
            id="calendar-container" 
            className="calendar-container"
            ref={calendarContainerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="calendar-grid">
              {renderCalendar()}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
