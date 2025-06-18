// components/Clock.tsx
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function ClockHeader() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000); // update every second

    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <div className="text-sm text-gray-500">
      {format(now, "PPpp")} {/* Example: Jun 18, 2025 at 10:05 AM */}
    </div>
  );
}
