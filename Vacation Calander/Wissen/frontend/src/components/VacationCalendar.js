import React, { useState, useEffect } from 'react';
import './VacationCalendar.css';

const VacationCalendar = () => {
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [viewMode, setViewMode] = useState('quarterly');
  const [holidays, setHolidays] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const countries = {
    'US': 'United States',
    'GB': 'Great Britain',
    'CA': 'Canada'
  };

  useEffect(() => {
    fetchHolidays();
  }, [selectedCountry]);

  const fetchHolidays = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/holidays/${selectedCountry}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setHolidays(data.holidays || []);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setHolidays([]);
    }
  };


  const getMonthData = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    while (current <= lastDay || days.length < 42) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
      if (days.length >= 42) break;
    }

    return days;
  };

  const getWeekHolidayCount = (weekDays) => {
    let count = 0;
    weekDays.forEach(day => {
      const dayStr = day.toISOString().split('T')[0];
      const holiday = holidays.find(h => h.date === dayStr);
      if (holiday) count++;
    });
    return count;
  };

  const getHolidayForDate = (date) => {
    const dayStr = date.toISOString().split('T')[0];
    return holidays.find(h => h.date === dayStr);
  };

  const renderMonthCalendar = (year, month, isLarge = false) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const days = getMonthData(year, month);
    const weeks = [];

    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    const dayHeaders = dayNames.map(day =>
      React.createElement('div', { key: day, className: 'day-header' }, day)
    );

    const weekRows = weeks.map((week, weekIndex) => {
      const holidayCount = getWeekHolidayCount(week);
      const weekClass = holidayCount === 1 ? 'light-green' :
        holidayCount > 1 ? 'dark-green' : '';

      const dayElements = week.map((day, dayIndex) => {
        const holiday = getHolidayForDate(day);
        const isCurrentMonth = day.getMonth() === month;

        return React.createElement(
          'div',
          {
            key: dayIndex,
            className: `calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${holiday ? 'holiday-date' : ''}`
          },
          React.createElement('span', { className: 'day-number' }, day.getDate()),
          holiday && React.createElement(
            'div',
            { className: 'holiday-type' },
            holiday.federal ? 'Federal' : 'Local'
          )
        );
      });

      return React.createElement(
        'div',
        { key: weekIndex, className: `calendar-week ${weekClass}` },
        ...dayElements
      );
    });

    return React.createElement(
      'div',
      { className: `calendar-month ${isLarge ? 'large' : 'small'}`, key: `${year}-${month}` },
      React.createElement(
        'div',
        { className: 'month-header' },
        React.createElement('h3', null, `${monthNames[month]} ${year}`)
      ),
      React.createElement(
        'div',
        { className: 'calendar-grid' },
        React.createElement('div', { className: 'day-headers' }, ...dayHeaders),
        ...weekRows
      )
    );
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateQuarter = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction * 3));
    setCurrentDate(newDate);
  };

  const getCurrentQuarterMonths = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const quarterStart = Math.floor(month / 3) * 3;

    return [
      { year, month: quarterStart },
      { year, month: quarterStart + 1 },
      { year, month: quarterStart + 2 }
    ];
  };

  const countryOptions = Object.entries(countries).map(([code, name]) =>
    React.createElement('option', { key: code, value: code }, name)
  );

  const legendItems = [
    { color: 'light-green-legend', text: '1 Holiday This Week' },
    { color: 'dark-green-legend', text: '2+ Holidays This Week' },
    { color: 'holiday-date-legend', text: 'Holiday Date' }
  ].map((item, index) =>
    React.createElement(
      'div',
      { key: index, className: 'legend-item' },
      React.createElement('div', { className: `legend-color ${item.color}` }),
      React.createElement('span', null, item.text)
    )
  );

  return React.createElement(
    'div',
    { className: 'vacation-calendar' },
    React.createElement(
      'header',
      { className: 'calendar-header' },
      React.createElement('h1', null, 'Vacation Calendar'),
      React.createElement(
        'div',
        { className: 'controls' },
        React.createElement(
          'div',
          { className: 'country-selector' },
          React.createElement(
            'select',
            {
              value: selectedCountry,
              onChange: (e) => setSelectedCountry(e.target.value),
              className: 'country-dropdown'
            },
            ...countryOptions
          )
        ),
        React.createElement(
          'div',
          { className: 'view-controls' },
          React.createElement(
            'button',
            {
              className: `view-btn ${viewMode === 'quarterly' ? 'active' : ''}`,
              onClick: () => setViewMode('quarterly')
            },
            'Quarterly'
          ),
          React.createElement(
            'button',
            {
              className: `view-btn ${viewMode === 'monthly' ? 'active' : ''}`,
              onClick: () => setViewMode('monthly')
            },
            'Monthly'
          )
        ),
        React.createElement(
          'div',
          { className: 'legend' },
          ...legendItems
        )
      )
    ),
    React.createElement(
      'main',
      { className: 'calendar-content' },
      viewMode === 'quarterly' ? React.createElement(
        'div',
        { className: 'quarterly-view' },
        React.createElement(
          'div',
          { className: 'view-header' },
          React.createElement(
            'button',
            { onClick: () => navigateQuarter(-1), className: 'nav-btn' },
            '<'
          ),
          React.createElement(
            'h2',
            null,
            `Q${Math.floor(currentDate.getMonth() / 3) + 1} ${currentDate.getFullYear()} Mini-Months`
          ),
          React.createElement(
            'button',
            { onClick: () => navigateQuarter(1), className: 'nav-btn' },
            '>'
          )
        ),
        React.createElement(
          'div',
          { className: 'quarters-container' },
          ...getCurrentQuarterMonths().map(({ year, month }) =>
            renderMonthCalendar(year, month, false)
          )
        )
      ) : React.createElement(
        'div',
        { className: 'monthly-view' },
        React.createElement(
          'div',
          { className: 'view-header' },
          React.createElement(
            'button',
            { onClick: () => navigateMonth(-1), className: 'nav-btn' },
            '<'
          ),
          React.createElement(
            'h2',
            null,
            currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          ),
          React.createElement(
            'button',
            { onClick: () => navigateMonth(1), className: 'nav-btn' },
            '>'
          )
        ),
        React.createElement(
          'div',
          { className: 'month-container' },
          renderMonthCalendar(currentDate.getFullYear(), currentDate.getMonth(), true)
        )
      )
    )
  );
};

export default VacationCalendar;