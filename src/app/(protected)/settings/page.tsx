"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  timezone: string;
}

interface Goal {
  _id: string;
  categoryId: { _id: string; name: string; icon: string; color: string };
  dailyMinutes: number;
}

interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [goalCategoryId, setGoalCategoryId] = useState("");
  const [goalMinutes, setGoalMinutes] = useState("");
  const [message, setMessage] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#64748B");

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/goals").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([meData, goalsData, catsData]) => {
      if (meData.success) {
        setUser(meData.data.user);
        setName(meData.data.user.name);
        setTimezone(meData.data.user.timezone);
      }
      if (goalsData.success) setGoals(goalsData.data.goals);
      if (catsData.success) setCategories(catsData.data.categories);
    }).finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, timezone }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Profile updated");
        setUser(data.data.user);
      } else {
        setMessage(data.error.message);
      }
    } catch {
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddGoal() {
    if (!goalCategoryId || !goalMinutes) return;
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: goalCategoryId, dailyMinutes: parseInt(goalMinutes) }),
    });
    const data = await res.json();
    if (data.success) {
      setGoals((prev) => {
        const existing = prev.find((g) => g.categoryId._id === goalCategoryId);
        if (existing) return prev.map((g) => g.categoryId._id === goalCategoryId ? { ...g, dailyMinutes: parseInt(goalMinutes) } : g);
        return [...prev, data.data.goal];
      });
      setGoalCategoryId("");
      setGoalMinutes("");
    }
  }

  async function handleDeleteGoal(goalId: string) {
    await fetch(`/api/goals/${goalId}`, { method: "DELETE" });
    setGoals((prev) => prev.filter((g) => g._id !== goalId));
  }

  async function handleAddCategory() {
    if (!newCatName) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName, color: newCatColor }),
    });
    const data = await res.json();
    if (data.success) {
      setCategories((prev) => [...prev, data.data.category]);
      setNewCatName("");
      setNewCatColor("#64748B");
      setShowAddCategory(false);
    }
  }

  async function handleDeleteCategory(catId: string) {
    await fetch(`/api/categories/${catId}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c._id !== catId));
  }

  if (loading) return <div className="p-6 text-zinc-500 text-sm">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold mb-1">Settings</h1>
        <p className="text-sm text-zinc-500">Manage your profile, categories, and goals</p>
      </div>

      {message && (
        <div className="bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 rounded-lg px-4 py-3">{message}</div>
      )}

      <section>
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-3">Profile</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500" />
          </div>
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Email</label>
            <input value={user?.email || ""} disabled className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-500" />
          </div>
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500">
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
              <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
            </select>
          </div>
          <button onClick={handleSaveProfile} disabled={saving} className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Categories</h2>
          <button onClick={() => setShowAddCategory(!showAddCategory)} className="text-xs text-zinc-400 hover:text-white transition-colors">+ Add Category</button>
        </div>
        {showAddCategory && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3 flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs text-zinc-500 mb-1">Name</label>
              <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Color</label>
              <input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)} className="w-10 h-10 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
            </div>
            <button onClick={handleAddCategory} className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors">Add</button>
          </div>
        )}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
          {categories.map((cat) => (
            <div key={cat._id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-sm">{cat.name}</span>
              </div>
              <button onClick={() => handleDeleteCategory(cat._id)} className="text-xs text-zinc-500 hover:text-red-400 transition-colors">Remove</button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-3">Daily Goals</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs text-zinc-500 mb-1">Category</label>
              <select value={goalCategoryId} onChange={(e) => setGoalCategoryId(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="w-32">
              <label className="block text-xs text-zinc-500 mb-1">Minutes/day</label>
              <input type="number" value={goalMinutes} onChange={(e) => setGoalMinutes(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500" placeholder="60" />
            </div>
            <button onClick={handleAddGoal} className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors">Add</button>
          </div>
        </div>
        {goals.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
            {goals.map((goal) => (
              <div key={goal._id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: goal.categoryId?.color }} />
                  <span className="text-sm">{goal.categoryId?.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-zinc-300">{Math.floor(goal.dailyMinutes / 60)}h {goal.dailyMinutes % 60}m</span>
                  <button onClick={() => handleDeleteGoal(goal._id)} className="text-xs text-zinc-500 hover:text-red-400 transition-colors">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
