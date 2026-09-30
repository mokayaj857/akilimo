import { useEffect, useRef, useState } from "react";
import type { KenyanMarketPrice } from "@/lib/agritwin/types";

export type TapeBook = {
  last: number;
  open: number;
  flash: "up" | "down" | null;
  spark: number[];
};

function nudge(last: number, base: number) {
  const pull = (base - last) * 0.12;
  const jump = (Math.random() - 0.47) * 22;
  const raw = last + pull + jump;
  const stepped = Math.round(raw / 5) * 5;
  const lo = Math.round(base * 0.93);
  const hi = Math.round(base * 1.07);
  return Math.min(hi, Math.max(lo, stepped));
}

function seedSpark(base: number) {
  return Array.from({ length: 28 }, () => base);
}

function startBooks(markets: KenyanMarketPrice[]) {
  const books: Record<string, TapeBook> = {};
  for (const m of markets) {
    books[m.id] = {
      last: m.priceKes,
      open: m.priceKes,
      flash: null,
      spark: seedSpark(m.priceKes),
    };
  }
  return books;
}

export function useMarketTape(markets: KenyanMarketPrice[]) {
  const [books, setBooks] = useState(() => startBooks(markets));
  const [clock, setClock] = useState("00:00:00");
  const marketsRef = useRef(markets);
  marketsRef.current = markets;

  useEffect(() => {
    const stamp = () =>
      new Date().toLocaleTimeString("en-GB", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Africa/Nairobi",
      });
    setClock(stamp());
    const id = window.setInterval(() => setClock(stamp()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const list = marketsRef.current;
      if (!list.length) return;
      const hits = new Set<string>();
      hits.add(list[Math.floor(Math.random() * list.length)].id);
      if (Math.random() > 0.4) hits.add(list[Math.floor(Math.random() * list.length)].id);

      setBooks((prev) => {
        const next = { ...prev };
        for (const m of list) {
          if (!hits.has(m.id)) continue;
          const book = next[m.id] ?? {
            last: m.priceKes,
            open: m.priceKes,
            flash: null as TapeBook["flash"],
            spark: [m.priceKes],
          };
          const last = nudge(book.last, m.priceKes);
          if (last === book.last) continue;
          next[m.id] = {
            last,
            open: book.open,
            flash: last > book.last ? "up" : "down",
            spark: [...book.spark, last].slice(-40),
          };
        }
        return next;
      });

      window.setTimeout(() => {
        setBooks((prev) => {
          const next = { ...prev };
          for (const hid of hits) {
            if (next[hid]) next[hid] = { ...next[hid], flash: null };
          }
          return next;
        });
      }, 480);
    }, 720);

    return () => window.clearInterval(id);
  }, []);

  return { books, clock };
}
