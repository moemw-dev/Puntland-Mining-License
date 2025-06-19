// components/Clock.tsx
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

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
      <div className="py-2 px-4 cursor-default border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all">
        <Calendar className="h-4 w-4 text-gray-500" />
        {format(now, "PPpp")}
      </div>
    </div>
  );
}
