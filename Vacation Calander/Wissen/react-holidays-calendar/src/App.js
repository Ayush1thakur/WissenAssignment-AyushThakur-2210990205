import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./App.css";

const toIsoDate = (d) => d.toISOString().slice(0, 10);

function buildMonthMatrix(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const matrix = [];

  let week = new Array(7).fill(null);
  let day = 1;

  for (let i = 0; i < first.getDay(); i++) week[i] = null;
  for (let i = first.getDay(); i < 7; i++) {
    week[i] = new Date(year, monthIndex, day++);
  }
  matrix.push(week);

  while (day <= last.getDate()) {
    week = new Array(7).fill(null);
    for (let i = 0; i < 7 && day <= last.getDate(); i++) {
      week[i] = new Date(year, monthIndex, day++);
    }
    matrix.push(week);
  }
  return matrix;
}

function App() {
  const currentYear = new Date().getFullYear();
  const [country, setCountry] = useState("US");
  const [year, setYear] = useState(currentYear);
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [holidays, setHolidays] = useState(new Set());
  const [view, setView] = useState("monthly");

  useEffect(() => {
    async function fetchHolidays() {
      try {
        const resp = await axios.get(
          `http://localhost:5000/api/holidays/${country}/${year}`
        );
        const set = new Set((resp.data.holidays || []).map((h) => h.date));
        setHolidays(set);
      } catch (err) {
        console.error("Error fetching holidays", err);
      }
    }
    fetchHolidays();
  }, [country, year]);

  const monthMatrix = useMemo(
    () => buildMonthMatrix(year, monthIndex),
    [year, monthIndex]
  );

  const weekHasHoliday = (week) =>
    week.some((d) => d && holidays.has(toIsoDate(d)));

  const quarterStart = Math.floor(monthIndex / 3) * 3;
  const quarterMonths = [quarterStart, quarterStart + 1, quarterStart + 2];

  const renderMonth = (mIdx) => {
    const matrix = buildMonthMatrix(year, mIdx);
    return (
      <div style={{ margin: "10px" }}>
        <h3>
          {new Date(year, mIdx).toLocaleString("default", { month: "long" })}{" "}
          {year}
        </h3>
        <div className="week-header">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        {matrix.map((week, i) => {
          const hasHoliday = weekHasHoliday(week);
          return (
            <div
              key={i}
              className="week"
              style={{
                background: hasHoliday ? "lightgreen" : "darkgreen",
                color: hasHoliday ? "black" : "white",
              }}
            >
              {week.map((d, j) => (
                <div key={j} className="day">
                  {d && (
                    <>
                      <div>{d.getDate()}</div>
                      {holidays.has(toIsoDate(d)) && (
                        <div className="holiday">Holiday</div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <h1>Holiday Calendar</h1>
      <div>
        Country:{" "}
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value.toUpperCase())}
        />
        Year:{" "}
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
        <button onClick={() => setView("monthly")}>Monthly</button>
        <button onClick={() => setView("quarterly")}>Quarterly</button>
        <button onClick={() => setMonthIndex((m) => (m + 11) % 12)}>◀</button>
        <button onClick={() => setMonthIndex((m) => (m + 1) % 12)}>▶</button>
      </div>

      {view === "monthly" && renderMonth(monthIndex)}
      {view === "quarterly" && (
        <div style={{ display: "flex", gap: "20px" }}>
          {quarterMonths.map((m) => (
            <div key={m}>{renderMonth(m)}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
