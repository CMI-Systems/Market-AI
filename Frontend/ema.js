export function calculateEMA(data, period) {
  if (!Array.isArray(data) || data.length === 0) return [];

  const multiplier = 2 / (period + 1);

  let ema = [];
  let prev = data[0].close ?? 0;

  for (let i = 0; i < data.length; i++) {
    const price = data[i].close ?? 0;

    const current =
      i === 0
        ? price
        : (price - prev) * multiplier + prev;

    ema.push({
      time: data[i].time,
      value: Number(current.toFixed(2))
    });

    prev = current;
  }

  return ema;
}

export function generateSignal(ema9, ema21) {
  const last9 = ema9?.[ema9.length - 1]?.value ?? 0;
  const last21 = ema21?.[ema21.length - 1]?.value ?? 0;

  if (last9 > last21) return "🔥 Bullish Momentum";
  if (last9 < last21) return "❄️ Bearish Momentum";

  return "⚖️ Neutral / Compression";
}