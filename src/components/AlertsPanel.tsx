"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Alert {
  id: string;
  type: "price" | "news" | "technical";
  symbol: string;
  condition: string;
  value: string;
  active: boolean;
}

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlert, setNewAlert] = useState<Partial<Alert>>({
    type: "price",
    symbol: "",
    condition: "above",
    value: "",
    active: true,
  });

  useEffect(() => {
    // Load alerts from localStorage
    const savedAlerts = localStorage.getItem("marketAlerts");
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
  }, []);

  const saveAlerts = (updatedAlerts: Alert[]) => {
    localStorage.setItem("marketAlerts", JSON.stringify(updatedAlerts));
    setAlerts(updatedAlerts);
  };

  const handleAddAlert = () => {
    if (!newAlert.symbol || !newAlert.value) return;

    const alert: Alert = {
      id: Date.now().toString(),
      type: newAlert.type as "price" | "news" | "technical",
      symbol: newAlert.symbol,
      condition: newAlert.condition || "above",
      value: newAlert.value,
      active: true,
    };

    const updatedAlerts = [...alerts, alert];
    saveAlerts(updatedAlerts);
    setShowAddForm(false);
    setNewAlert({
      type: "price",
      symbol: "",
      condition: "above",
      value: "",
      active: true,
    });
  };

  const handleDeleteAlert = (id: string) => {
    const updatedAlerts = alerts.filter((alert) => alert.id !== id);
    saveAlerts(updatedAlerts);
  };

  const toggleAlert = (id: string) => {
    const updatedAlerts = alerts.map((alert) =>
      alert.id === id ? { ...alert, active: !alert.active } : alert
    );
    saveAlerts(updatedAlerts);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-md rounded-lg shadow-lg border border-white/10 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          Market Alerts
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
        >
          Add Alert
        </motion.button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-black/20 rounded-md"
          >
            <div className="space-y-4">
              <div className="flex space-x-4">
                <select
                  value={newAlert.type}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, type: e.target.value as any })
                  }
                  className="bg-black/40 rounded px-3 py-2 w-1/3"
                >
                  <option value="price">Price Alert</option>
                  <option value="news">News Alert</option>
                  <option value="technical">Technical Alert</option>
                </select>
                <input
                  type="text"
                  placeholder="Symbol (e.g., AAPL)"
                  value={newAlert.symbol}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, symbol: e.target.value })
                  }
                  className="bg-black/40 rounded px-3 py-2 w-2/3"
                />
              </div>
              <div className="flex space-x-4">
                <select
                  value={newAlert.condition}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, condition: e.target.value })
                  }
                  className="bg-black/40 rounded px-3 py-2 w-1/3"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                  <option value="equals">Equals</option>
                </select>
                <input
                  type="text"
                  placeholder="Value"
                  value={newAlert.value}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, value: e.target.value })
                  }
                  className="bg-black/40 rounded px-3 py-2 w-2/3"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleAddAlert}
                  className="px-4 py-2 bg-green-500 rounded-md hover:bg-green-600 transition-colors w-1/2"
                >
                  Create Alert
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-500 rounded-md hover:bg-gray-600 transition-colors w-1/2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`p-4 rounded-md ${
                alert.active ? "bg-black/20" : "bg-black/10"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      alert.type === "price"
                        ? "bg-blue-500/20 text-blue-300"
                        : alert.type === "news"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-purple-500/20 text-purple-300"
                    }`}
                  >
                    {alert.type}
                  </span>
                  <h4 className="font-semibold mt-2">
                    {alert.symbol} {alert.condition} {alert.value}
                  </h4>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`p-2 rounded ${
                      alert.active ? "bg-green-500/20" : "bg-gray-500/20"
                    }`}
                  >
                    {alert.active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-2 rounded bg-red-500/20 text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {alerts.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No alerts set. Click "Add Alert" to create one.
          </div>
        )}
      </div>
    </motion.div>
  );
}
