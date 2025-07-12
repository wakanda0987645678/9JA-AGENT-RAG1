
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Camera, Save, ArrowLeft, MessageSquare, Clock, Zap, Calendar, Mail, Shield, Trophy, Gift, Copy, Check, Star, Coins } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  preferences: string | null;
  isAdmin: boolean;
  totalTokensUsed: number;
  points: number;
  referralCode: string;
  totalReferrals: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UserStats {
  totalQuestions: number;
  totalLogins: number;
  creditsUsed: number;
  lastLogin: Date;
  memberSince: Date;
  averageSessionLength: string;
  favoriteTopics: string[];
}

interface ReferralStats {
  totalReferrals: number;
  totalPointsFromReferrals: number;
}

interface PointTransaction {
  id: string;
  type: string;
  points: number;
  description: string;
  createdAt: Date;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
    bio: "",
    preferences: "{}"
  });

  const currentUserId = "mock-user-id";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Mock profile data with referral system
        const mockProfile: UserProfile = {
          id: currentUserId,
          email: "user@example.com",
          name: "John Doe",
          avatar: null,
          bio: "AI enthusiast and developer passionate about creating innovative solutions",
          preferences: JSON.stringify({ 
            theme: "auto", 
            notifications: true,
            language: "en",
            emailUpdates: false 
          }),
          isAdmin: false,
          totalTokensUsed: 12500,
          points: 2450,
          referralCode: "JOHN2024",
          totalReferrals: 8,
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date()
        };

        const mockStats: UserStats = {
          totalQuestions: 47,
          totalLogins: 23,
          creditsUsed: 12500,
          lastLogin: new Date(),
          memberSince: new Date("2024-01-15"),
          averageSessionLength: "12 min",
          favoriteTopics: ["Programming", "AI", "Web Development"]
        };

        const mockReferralStats: ReferralStats = {
          totalReferrals: 8,
          totalPointsFromReferrals: 400
        };

        const mockTransactions: PointTransaction[] = [
          { id: "1", type: "referral", points: 50, description: "Referral bonus", createdAt: new Date() },
          { id: "2", type: "earned", points: 25, description: "Daily login bonus", createdAt: new Date() },
          { id: "3", type: "spent", points: -100, description: "Premium feature unlock", createdAt: new Date() },
          { id: "4", type: "bonus", points: 200, description: "Weekly challenge completion", createdAt: new Date() },
        ];
        
        setProfile(mockProfile);
        setStats(mockStats);
        setReferralStats(mockReferralStats);
        setPointTransactions(mockTransactions);
        setFormData({
          name: mockProfile.name || "",
          avatar: mockProfile.avatar || "",
          bio: mockProfile.bio || "",
          preferences: mockProfile.preferences || "{}"
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
          ...formData
        })
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const copyReferralCode = () => {
    if (profile?.referralCode) {
      const referralLink = `${window.location.origin}?ref=${profile.referralCode}`;
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPointsColor = (type: string) => {
    switch (type) {
      case 'earned': return 'text-green-600 dark:text-green-400';
      case 'referral': return 'text-blue-600 dark:text-blue-400';
      case 'bonus': return 'text-purple-600 dark:text-purple-400';
      case 'spent': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile || !stats || !referralStats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
          </div>
          <Badge variant={profile.isAdmin ? "default" : "secondary"} className="hidden sm:flex">
            {profile.isAdmin ? (
              <>
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </>
            ) : (
              <>
                <User className="w-3 h-3 mr-1" />
                User
              </>
            )}
          </Badge>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-4 lg:mb-6 border-b border-gray-200 dark:border-gray-700">
          {["overview", "referrals", "points", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-sm font-medium capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-4">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col items-center space-y-3 lg:space-y-4">
                  {/* Avatar */}
                  <div className="relative">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="Profile"
                        className="w-20 lg:w-24 h-20 lg:h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                      />
                    ) : (
                      <div className="w-20 lg:w-24 h-20 lg:h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                        <span className="text-white font-bold text-xl lg:text-2xl">
                          {profile.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-1 -right-1 h-7 w-7 lg:h-8 lg:w-8 rounded-full shadow-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Camera className="w-3 h-3 lg:w-4 lg:h-4" />
                    </Button>
                  </div>

                  {/* User Info */}
                  <div className="text-center space-y-1">
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
                      {profile.name || "Anonymous User"}
                    </h3>
                    <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {profile.email}
                    </p>
                    {profile.bio && (
                      <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 mt-2 lg:mt-3 leading-relaxed">
                        {profile.bio}
                      </p>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="w-full grid grid-cols-3 gap-3 lg:gap-4 pt-3 lg:pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-lg lg:text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.totalQuestions}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg lg:text-2xl font-bold text-green-600 dark:text-green-400">
                        {profile.points.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg lg:text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {profile.totalReferrals}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Referrals</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-4 lg:space-y-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <>
                {/* Activity Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
                  <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <CardContent className="p-3 lg:p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Total Questions</p>
                          <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalQuestions}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <CardContent className="p-3 lg:p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Avg Session</p>
                          <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">{stats.averageSessionLength}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <CardContent className="p-3 lg:p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Total Logins</p>
                          <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLogins}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Account Details */}
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <CardHeader className="pb-3 lg:pb-4">
                    <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
                      <Trophy className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500" />
                      <span>Account Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 lg:space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                      <div className="flex justify-between items-center p-2 lg:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Member Since:</span>
                        <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(stats.memberSince).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 lg:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Last Login:</span>
                        <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(stats.lastLogin).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 lg:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Credits Used:</span>
                        <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">
                          {stats.creditsUsed.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 lg:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Account Type:</span>
                        <Badge variant={profile.isAdmin ? "default" : "secondary"}>
                          {profile.isAdmin ? "Admin" : "User"}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Favorite Topics */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Favorite Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {stats.favoriteTopics.map((topic, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Referrals Tab */}
            {activeTab === "referrals" && (
              <>
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Gift className="w-5 h-5 text-green-500" />
                      <span>Referral Program</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Your Referral Code</h3>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border rounded text-sm font-mono">
                          {window.location.origin}?ref={profile.referralCode}
                        </code>
                        <Button
                          onClick={copyReferralCode}
                          size="sm"
                          variant="outline"
                          className="flex items-center space-x-1"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? "Copied!" : "Copy"}</span>
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        Earn 50 points for each successful referral!
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {referralStats.totalReferrals}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Referrals</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {referralStats.totalPointsFromReferrals}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Points Earned</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Points Tab */}
            {activeTab === "points" && (
              <>
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Coins className="w-5 h-5 text-yellow-500" />
                        <span>Points Balance</span>
                      </div>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {profile.points.toLocaleString()} pts
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">Recent Transactions</h4>
                      <div className="space-y-2">
                        {pointTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {transaction.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className={`text-sm font-semibold ${getPointsColor(transaction.type)}`}>
                              {transaction.points > 0 ? '+' : ''}{transaction.points} pts
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your name"
                          className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="avatar" className="text-gray-700 dark:text-gray-300">Avatar URL</Label>
                        <Input
                          id="avatar"
                          value={formData.avatar}
                          onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                          placeholder="https://example.com/avatar.jpg"
                          className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300">Bio</Label>
                      <textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none h-20"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={saving} 
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Save className="w-4 h-4" />
                        <span>{saving ? "Saving..." : "Save Changes"}</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
