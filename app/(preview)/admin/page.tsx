
"use client";

import { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, MessageSquare, Coins, TrendingUp } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  totalTokensUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Conversation {
  id: string;
  userId: string;
  prompt: string;
  response: string;
  tokensUsed: number;
  createdAt: Date;
}

interface Stats {
  totalUsers: number;
  totalTokens: number;
  totalConversations: number;
}

export default function AdminPage() {
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // All hooks at top level
  const [userFilter, setUserFilter] = useState("");
  const [conversationFilter, setConversationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [resourceContent, setResourceContent] = useState("");
  const [resourceStatus, setResourceStatus] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalTokens: 0, totalConversations: 0 });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ email: "", name: "", isAdmin: false });
  const [loading, setLoading] = useState(true);
  // ...existing code...

  // All functions outside render
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/stats")
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserConversations = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/conversations/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        setSelectedUser(userId);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const createUser = async () => {
    if (!newUser.email) return;

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setNewUser({ email: "", name: "", isAdmin: false });
        fetchData();
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleCreateResource = async () => {
    setResourceStatus(null);
    if (!resourceContent.trim()) {
      setResourceStatus("Content is required.");
      return;
    }
    try {
      const res = await fetch("/api/admin/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: resourceContent })
      });
      const data = await res.json();
      setResourceStatus(data.message || "Resource created.");
      setResourceContent("");
    } catch (err) {
      setResourceStatus("Error creating resource.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  // Sidebar menu items
  const menuItems = [
    { label: "Dashboard", icon: TrendingUp },
    { label: "Users", icon: Users },
    { label: "Resources", icon: Coins },
    { label: "Conversations", icon: MessageSquare },
    { label: "Settings", icon: null },
    { label: "LLM Model", icon: null },
    { label: "Profile", icon: null },
    { label: "Projects", icon: null, children: [
      { label: "NOUN", icon: null },
      { label: "Train Station", icon: null },
      { label: "Community", icon: null },
    ]},
  ];


  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className={`fixed z-40 inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-0 shadow-lg lg:shadow-none`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <span className="font-bold text-lg text-blue-700 dark:text-blue-400">Admin Panel</span>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.label}>
              <button
                className={`flex items-center w-full px-3 py-2 rounded-lg text-left transition-colors ${selectedMenu === item.label ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
                onClick={() => {
                  setSelectedMenu(item.label);
                  if (item.label !== "Projects") setSelectedProject(null);
                }}
              >
                {item.icon && <item.icon className="w-5 h-5 mr-2" />}
                <span>{item.label}</span>
              </button>
              {/* Always render children, but only highlight if Projects is selected */}
              {item.children && (
                <div className={`ml-6 mt-2 space-y-1 ${selectedMenu === "Projects" ? "" : "hidden"}`}>
                  {item.children.map(child => (
                    <button
                      key={child.label}
                      className={`block w-full px-3 py-1 rounded text-left transition-colors ${selectedProject === child.label ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                      onClick={() => {
                        setSelectedProject(child.label);
                        setSelectedMenu("Projects");
                      }}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64">
        <button className="lg:hidden mb-4" onClick={() => setSidebarOpen(true)}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        {/* Render content based on selectedMenu */}
        {/* Main content rendering logic */}
        {selectedMenu === "Dashboard" && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalConversations}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tokens Used</CardTitle>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
                <h2 className="font-semibold mb-2">Users vs Conversations</h2>
                <Bar
                  data={{
                    labels: ["Users", "Conversations", "Tokens"],
                    datasets: [
                      {
                        label: "Count",
                        data: [stats.totalUsers, stats.totalConversations, stats.totalTokens],
                        backgroundColor: ["#3b82f6", "#10b981", "#f59e42"],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
                <h2 className="font-semibold mb-2">Tokens Distribution</h2>
                <Doughnut
                  data={{
                    labels: ["Tokens Used", "Users", "Conversations"],
                    datasets: [
                      {
                        data: [stats.totalTokens, stats.totalUsers, stats.totalConversations],
                        backgroundColor: ["#f59e42", "#3b82f6", "#10b981"],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
              </div>
            </div>
          </div>
        )}
        {selectedMenu === "Users" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Users Management</h1>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <Input
                placeholder="Filter by name or email..."
                value={userFilter}
                onChange={e => setUserFilter(e.target.value)}
                className="max-w-xs"
              />
              <Input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="max-w-xs"
              />
            </div>
            {/* Create User Form */}
            <div className="space-y-3 p-4 border rounded-lg mb-6">
              <h3 className="font-semibold">Create New User</h3>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={newUser.isAdmin}
                  onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                />
                <Label htmlFor="isAdmin">Admin privileges</Label>
              </div>
              <Button onClick={createUser} className="w-full">
                Create User
              </Button>
            </div>
            {/* Users List with filter and management */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users
                .filter(user => {
                  const match =
                    user.name?.toLowerCase().includes(userFilter.toLowerCase()) ||
                    user.email.toLowerCase().includes(userFilter.toLowerCase());
                  const dateMatch = dateFilter
                    ? new Date(user.createdAt).toISOString().slice(0, 10) === dateFilter
                    : true;
                  return match && dateMatch;
                })
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div onClick={() => { fetchUserConversations(user.id); setUserDetails(user); }}>
                      <div className="font-medium">{user.name || user.email}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">
                        {user.totalTokensUsed.toLocaleString()} tokens used
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {user.isAdmin && <Badge variant="secondary">Admin</Badge>}
                      <Badge variant="outline" className="text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Badge>
                      <Button size="sm" variant="destructive" onClick={() => {
                        // Delete user (demo only, implement API as needed)
                        setUsers(users.filter(u => u.id !== user.id));
                        setUserDetails(null);
                      }}>Delete</Button>
                    </div>
                  </div>
                ))}
            </div>
            {/* User details modal (simple inline) */}
            {userDetails && (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
                  <h2 className="font-bold text-xl mb-2">User Details</h2>
                  <div className="mb-2">Name: {userDetails.name}</div>
                  <div className="mb-2">Email: {userDetails.email}</div>
                  <div className="mb-2">Admin: {userDetails.isAdmin ? "Yes" : "No"}</div>
                  <div className="mb-2">Tokens Used: {userDetails.totalTokensUsed.toLocaleString()}</div>
                  <div className="mb-2">Created: {new Date(userDetails.createdAt).toLocaleString()}</div>
                  <Button onClick={() => setUserDetails(null)} className="mt-2 w-full">Close</Button>
                </div>
              </div>
            )}
          </div>
        )}
        {selectedMenu === "Resources" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">RAG Resources</h1>
            <Card>
              <CardHeader>
                <CardTitle>Add RAG Resource</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label htmlFor="resource-content">Resource Content</Label>
                <Input
                  id="resource-content"
                  value={resourceContent}
                  onChange={e => setResourceContent(e.target.value)}
                  placeholder="Paste or type your knowledge/document here..."
                />
                <Button onClick={handleCreateResource} className="w-full">Add Resource</Button>
                {resourceStatus && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">{resourceStatus}</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        {selectedMenu === "Conversations" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">User Conversations</h1>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <Input
                placeholder="Filter by prompt or response..."
                value={conversationFilter}
                onChange={e => setConversationFilter(e.target.value)}
                className="max-w-xs"
              />
            </div>
            {selectedUser ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {conversations
                  .filter(conv =>
                    conv.prompt.toLowerCase().includes(conversationFilter.toLowerCase()) ||
                    conv.response.toLowerCase().includes(conversationFilter.toLowerCase())
                  )
                  .map((conv) => (
                    <div key={conv.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {conv.tokensUsed} tokens
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(conv.createdAt).toLocaleString()}
                        </span>
                        <Button size="sm" variant="destructive" onClick={() => {
                          // Delete conversation (demo only, implement API as needed)
                          setConversations(conversations.filter(c => c.id !== conv.id));
                        }}>Delete</Button>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Prompt:</div>
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {conv.prompt.length > 100 
                            ? `${conv.prompt.substring(0, 100)}...` 
                            : conv.prompt}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Response:</div>
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {conv.response.length > 150 
                            ? `${conv.response.substring(0, 150)}...` 
                            : conv.response}
                        </div>
                      </div>
                    </div>
                  ))}
                {conversations.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No conversations found for this user.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Click on a user to view their conversations
              </div>
            )}
          </div>
        )}
        {/* Placeholder for other menu pages */}
        {selectedMenu === "Settings" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label htmlFor="theme">Theme</Label>
                <select id="theme" className="w-full p-2 border rounded">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
                <Label htmlFor="notifications">Notifications</Label>
                <select id="notifications" className="w-full p-2 border rounded">
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
                <Button className="w-full">Save Settings</Button>
              </CardContent>
            </Card>
          </div>
        )}
        {selectedMenu === "LLM Model" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">LLM Model Management</h1>
            <Card>
              <CardHeader>
                <CardTitle>Switch or Chain LLM Models</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label htmlFor="llm-model">Select Model</Label>
                <select id="llm-model" className="w-full p-2 border rounded">
                  <option value="gpt-4">GPT-4</option>
                  <option value="llama-3">LLaMA-3</option>
                  <option value="mixtral">Mixtral</option>
                </select>
                <Label htmlFor="chain">Chain Models</Label>
                <input type="text" id="chain" className="w-full p-2 border rounded" placeholder="e.g. GPT-4 -> LLaMA-3" />
                <Button className="w-full">Apply Model Settings</Button>
              </CardContent>
            </Card>
          </div>
        )}
        {selectedMenu === "Profile" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            <Card>
              <CardHeader>
                <CardTitle>Admin Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label htmlFor="admin-name">Name</Label>
                <Input id="admin-name" placeholder="Your Name" />
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" placeholder="your@email.com" />
                <Label htmlFor="admin-password">Password</Label>
                <Input id="admin-password" type="password" placeholder="New Password" />
                <Button className="w-full">Update Profile</Button>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Project pages, only if Projects is selected */}
        {selectedMenu === "Projects" && selectedProject === "NOUN" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">NOUN School Project</h1>
            <Card>
              <CardHeader>
                <CardTitle>NOUN Project Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label htmlFor="noun-resource">Add Resource</Label>
                <Input id="noun-resource" placeholder="Type resource for NOUN..." />
                <Button className="w-full">Add Resource</Button>
                <Label htmlFor="noun-chatbot">Chatbot Status</Label>
                <div className="p-2 border rounded bg-gray-50 dark:bg-gray-900">Online</div>
                <Button className="w-full">Restart Chatbot</Button>
              </CardContent>
            </Card>
          </div>
        )}
        {selectedMenu === "Projects" && selectedProject === "Train Station" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Train Station Project</h1>
            <Card>
              <CardHeader>
                <CardTitle>Train Station Project Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label htmlFor="ts-resource">Add Resource</Label>
                <Input id="ts-resource" placeholder="Type resource for Train Station..." />
                <Button className="w-full">Add Resource</Button>
                <Label htmlFor="ts-chatbot">Chatbot Status</Label>
                <div className="p-2 border rounded bg-gray-50 dark:bg-gray-900">Online</div>
                <Button className="w-full">Restart Chatbot</Button>
              </CardContent>
            </Card>
          </div>
        )}
        {selectedMenu === "Projects" && selectedProject === "Community" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Community Project</h1>
            <Card>
              <CardHeader>
                <CardTitle>Community Project Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label htmlFor="community-resource">Add Resource</Label>
                <Input id="community-resource" placeholder="Type resource for Community..." />
                <Button className="w-full">Add Resource</Button>
                <Label htmlFor="community-chatbot">Chatbot Status</Label>
                <div className="p-2 border rounded bg-gray-50 dark:bg-gray-900">Online</div>
                <Button className="w-full">Restart Chatbot</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
