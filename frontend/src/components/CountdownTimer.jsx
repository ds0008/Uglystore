import { useState, useEffect } from "react";

export default function CountdownTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (timeLeft.total <= 0) return <span className="text-red-500 font-semibold">Ended</span>;

  return (
    <div className="flex gap-2">
      {[
        { label: "D", value: timeLeft.days },
        { label: "H", value: timeLeft.hours },
        { label: "M", value: timeLeft.minutes },
        { label: "S", value: timeLeft.seconds },
      ].map(({ label, value }) => (
        <div key={label} className="bg-black text-white px-2.5 py-1.5 rounded-lg text-center min-w-[44px]">
          <span className="text-lg font-bold tabular-nums">{String(value).padStart(2, "0")}</span>
          <span className="text-[10px] block text-white/60">{label}</span>
        </div>
      ))}
    </div>
  );
}

function getTimeLeft(endTime) {
  const total = new Date(endTime).getTime() - Date.now();
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}
