import { useState } from 'react';
import { dateKey, MONTH_NAMES } from '../utils';

/**
 * mode='select': el cliente elige rango de retiro/devolución (from/to controlados por el padre).
 * mode='manage': Gaby bloquea/libera días sueltos (onToggleBlock).
 */
export default function Calendar({ mode, blockedKeys, from, to, onPick, onToggleBlock, initialYear, initialMonth }) {
  const today = new Date();
  const [year, setYear] = useState(initialYear ?? today.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? today.getMonth());

  const nav = (delta) => {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m);
    setYear(y);
  };

  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const blockedSet = new Set(blockedKeys || []);

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(<div key={'sp' + i} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = dateKey(year, month, d);
    const isPast = key < todayKey;
    const isBlocked = blockedSet.has(key);
    let cls = 'cal-day';
    let onClick;
    if (isPast) {
      cls += ' cal-past';
    } else if (isBlocked) {
      cls += ' cal-blocked';
      if (mode === 'manage') { cls += ' cal-clickable'; onClick = () => onToggleBlock(key); }
    } else {
      cls += ' cal-free cal-clickable';
      onClick = mode === 'manage' ? () => onToggleBlock(key) : () => onPick(key);
    }
    if (mode === 'select') {
      if (from === key) cls += ' cal-selected-start';
      if (to === key) cls += ' cal-selected-end';
      if (from && to && key > from && key < to) cls += ' cal-in-range';
    }
    cells.push(<div key={key} className={cls} onClick={onClick}>{d}</div>);
  }

  return (
    <div className="cal-wrap">
      <div className="cal-head">
        <div className="cal-nav" onClick={() => nav(-1)}>‹</div>
        <div className="cal-title">{MONTH_NAMES[month]} {year}</div>
        <div className="cal-nav" onClick={() => nav(1)}>›</div>
      </div>
      <div className="cal-grid">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => <div className="cal-dow" key={d}>{d}</div>)}
        {cells}
      </div>
    </div>
  );
}
