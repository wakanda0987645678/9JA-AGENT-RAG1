
"use client";

import { useState, useEffect } from "react";
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
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalTokens: 0, totalConversations: 0 });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ email: "", name: "", isAdmin: false });
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="secondary">Admin Panel</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Management */}
        <Card>
          <CardHeader>
            <CardTitle>Users Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create User Form */}
            <div className="space-y-3 p-4 border rounded-lg">
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

            {/* Users List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => fetchUserConversations(user.id)}
                >
                  <div>
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
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Conversations */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedUser ? "User Conversations" : "Select a user to view conversations"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {conversations.map((conv) => (
                  <div key={conv.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {conv.tokensUsed} tokens
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(conv.createdAt).toLocaleString()}
                      </span>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
