export function generateSignal(ema9, ema21) {
  const a = ema9.at(-1)?.value;
  const b = ema21.at(-1)?.value;

  if (!a || !b) return "WAIT";

  if (a > b) return "BULLISH";
  if (a < b) return "BEARISH";

  return "NEUTRAL";
}