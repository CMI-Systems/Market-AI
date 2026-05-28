export class ChartEngine {
  constructor(container) {
    this.chart = LightweightCharts.createChart(container, {
      height: 420,
      layout: {
        background: { color: "#111827" },
        textColor: "#94a3b8"
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" }
      }
    });

    // ✅ correct v4 API
    this.candles = this.chart.addSeries(
      LightweightCharts.CandlestickSeries
    );

    this.ema9 = this.chart.addSeries(
      LightweightCharts.LineSeries,
      { color: "#3b82f6", lineWidth: 2 }
    );

    this.ema21 = this.chart.addSeries(
      LightweightCharts.LineSeries,
      { color: "#f59e0b", lineWidth: 2 }
    );
  }

  setCandles(data) {
    this.candles.setData(data);
  }

  setEMA(ema9, ema21) {
    this.ema9.setData(ema9);
    this.ema21.setData(ema21);
  }

  fit() {
    this.chart.timeScale().fitContent();
  }
}