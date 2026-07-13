import { Route } from "react-router-dom";
import { Routes } from "@datadog/browser-rum-react/react-router-v7";

import ProtectedRoute from "./components/ProtectedRoute";
import CommandCenter from "./pages/CommandCenter";
import Login from "./pages/Login";
import UpdatePassword from "./pages/UpdatePassword";

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

function protect(page) {
  return <ProtectedRoute>{page}</ProtectedRoute>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/" element={protect(<CommandCenter />)} />
      <Route path="/command-center" element={protect(<CommandCenter />)} />

      <Route path="/system-boot" element={protect(<SystemBoot />)} />
      <Route path="/global-scan" element={protect(<GlobalScan />)} />
      <Route path="/data-streams" element={protect(<DataStreams />)} />
      <Route path="/newsletter" element={protect(<Newsletter />)} />
      <Route path="/market-pulse" element={protect(<MarketPulse />)} />

      <Route path="/tactical-brain" element={protect(<TacticalBrain />)} />
      <Route path="/behavioral-brain" element={protect(<BehavioralBrain />)} />
      <Route path="/failsafe-brain" element={protect(<FailsafeBrain />)} />

      <Route path="/watchlists" element={protect(<Watchlists />)} />
      <Route path="/alerts" element={protect(<Alerts />)} />
      <Route path="/signals" element={protect(<Signals />)} />
      <Route path="/replay-center" element={protect(<ReplayCenter />)} />
      <Route path="/trading-journal" element={protect(<TradingJournal />)} />
      <Route path="/archives" element={protect(<Archives />)} />

      <Route path="/profiles" element={protect(<Profiles />)} />
      <Route path="/subscriptions" element={protect(<Subscriptions />)} />
      <Route path="/system-settings" element={protect(<SystemSettings />)} />
      <Route path="/settings" element={protect(<SystemSettings />)} />
    </Routes>
  );
}

export default App;
