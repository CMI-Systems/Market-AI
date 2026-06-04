function MarketOverviewPanel() {
  const indices = [
    { name: "S&P 500", price: "5,321.41", change: "+0.85%" },
    { name: "NASDAQ 100", price: "18,825.73", change: "+1.06%" },
    { name: "DOW JONES", price: "39,872.99", change: "+0.84%" },
    { name: "RUSSELL 2000", price: "2,094.34", change: "+0.90%" },
  ];

  return (
    <div className="panel market-overview-panel">
      <h2>Market Overview</h2>
      <p>Major Index Intelligence</p>

      <div className="market-overview-list">
        {indices.map((item) => (
          <div className="market-overview-row" key={item.name}>
            <span>{item.name}</span>
            <strong>{item.price}</strong>
            <em>{item.change}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MarketOverviewPanel;