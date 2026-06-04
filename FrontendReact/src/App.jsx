import { Routes, Route } from "react-router-dom";

import CommandCenter from "./pages/CommandCenter";

import SystemBoot from "./pages/SystemBoot";
import GlobalScan from "./pages/GlobalScan";
import DataStreams from "./pages/DataStreams";
import Newsletter from "./pages/Newsletter";
import MarketPulse from "./pages/MarketPulse";

import TacticalBrain from "./pages/TacticalBrain";
import BehavioralBrain from "./pages/BehavioralBrain";
import FailsafeBrain from "./pages/FailsafeBrain";

import Watchlists from "./pages/Watchlists";
import Alerts from "./pages/Alerts";
import Signals from "./pages/Signals";
import ReplayCenter from "./pages/ReplayCenter";
import TradingJournal from "./pages/TradingJournal";
import Archives from "./pages/Archives";

import Profiles from "./pages/Profiles";
import Subscriptions from "./pages/Subscriptions";
import SystemSettings from "./pages/SystemSettings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<CommandCenter />} />

      <Route path="/system-boot" element={<SystemBoot />} />
      <Route path="/global-scan" element={<GlobalScan />} />
      <Route path="/data-streams" element={<DataStreams />} />
      <Route path="/newsletter" element={<Newsletter />} />
      <Route path="/market-pulse" element={<MarketPulse />} />

      <Route path="/tactical-brain" element={<TacticalBrain />} />
      <Route path="/behavioral-brain" element={<BehavioralBrain />} />
      <Route path="/failsafe-brain" element={<FailsafeBrain />} />

      <Route path="/watchlists" element={<Watchlists />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/signals" element={<Signals />} />
      <Route path="/replay-center" element={<ReplayCenter />} />
      <Route path="/trading-journal" element={<TradingJournal />} />
      <Route path="/archives" element={<Archives />} />

      <Route path="/profiles" element={<Profiles />} />
      <Route path="/subscriptions" element={<Subscriptions />} />
      <Route path="/settings" element={<SystemSettings />} />
    </Routes>
  );
}

export default App;