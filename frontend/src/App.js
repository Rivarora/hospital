import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import './App.css';

// Import Shadcn UI components
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

// Icons from Lucide React
import { 
  Heart, Upload, Brain, FileText, Award, Activity, Moon, Droplets, Dumbbell, Smile,
  Plus, BarChart3, Shield, Zap, Sparkles, TrendingUp, Target, Calendar, Clock,
  Download, Share2, Star, Trash2, Eye, Apple, Scale, Gauge, Timer, Footprints,
  Utensils, Brain as Meditation, Stethoscope, AlertCircle, CheckCircle2,
  FileUp, X, Settings, MoreVertical
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Color schemes for charts
const CHART_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

// Main App Component
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('healthsync_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleUserLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('healthsync_user', JSON.stringify(user));
    setShowAuth(false);
    toast.success('Welcome to HealthSync!');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('healthsync_user');
    toast.success('Logged out successfully');
  };

  return (
    <div className="App">
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route 
            path="/" 
            element={
              currentUser ? (
                <Dashboard user={currentUser} onLogout={handleLogout} />
              ) : (
                <LandingPage onGetStarted={() => setShowAuth(true)} />
              )
            } 
          />
        </Routes>
        
        {showAuth && (
          <AuthModal 
            onClose={() => setShowAuth(false)} 
            onUserLogin={handleUserLogin} 
          />
        )}
      </Router>
    </div>
  );
}

// Landing Page Component (keeping existing)
const LandingPage = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      <motion.div 
        className="relative z-10 container mx-auto px-6 py-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <nav className="flex justify-between items-center mb-20">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Heart className="h-8 w-8 text-cyan-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              HealthSync
            </span>
          </motion.div>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              variant="outline" 
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 transition-all duration-300"
              data-testid="get-started-btn"
              onClick={onGetStarted}
            >
              Get Started
            </Button>
          </motion.div>
        </nav>

        <div className="text-center mb-20">
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
              Your Health,
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI-Powered
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Revolutionize your healthcare with AI-driven medical records, smart paperwork automation, 
            and gamified wellness tracking. Your complete health companion.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button 
              size="lg" 
              className="px-8 py-6 text-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-2xl"
              data-testid="start-journey-btn"
              onClick={onGetStarted}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Your Health Journey
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-6 text-lg border-2 border-slate-600 text-slate-300 hover:bg-slate-800 transition-all duration-300"
            >
              <Activity className="mr-2 h-5 w-5" />
              See Demo
            </Button>
          </motion.div>
        </div>

        <motion.div 
          className="grid md:grid-cols-3 gap-8 mb-20"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <FeatureCard 
            icon={Brain}
            title="AI Health Analysis"
            description="Advanced AI analyzes your medical records and provides personalized health insights and risk assessments."
            delay={1.1}
          />
          <FeatureCard 
            icon={FileText}
            title="Smart Paperwork"
            description="Automatically generate medical forms and share them with healthcare providers instantly."
            delay={1.2}
          />
          <FeatureCard 
            icon={Award}
            title="Wellness Rewards"
            description="Earn tokens for healthy habits and redeem them for consultations, courses, and more."
            delay={1.3}
          />
        </motion.div>

        <motion.div 
          className="relative mx-auto max-w-4xl"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1655754508224-cbfaaf02cc0a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxmdXR1cmlzdGljJTIwbWVkaWNhbCUyMHRlY2hub2xvZ3l8ZW58MHx8fHwxNzU4NjU2MDIwfDA&ixlib=rb-4.1.0&q=85" 
              alt="Futuristic Medical Technology"
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm"></div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay, duration: 0.8 }}
  >
    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-300 text-center">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

// Auth Modal Component (keeping existing)
const AuthModal = ({ onClose, onUserLogin }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/users`, {
        name: formData.name,
        email: formData.email,
        age: formData.age ? parseInt(formData.age) : null
      });
      onUserLogin(response.data);
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Join HealthSync'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              data-testid="name-input"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              data-testid="email-input"
            />
          </div>
          
          <div>
            <Label htmlFor="age">Age (Optional)</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
              data-testid="age-input"
            />
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              disabled={loading}
              data-testid="auth-submit-btn"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              data-testid="auth-cancel-btn"
            >
              Cancel
            </Button>
          </div>
        </form>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </motion.div>
  );
};

// Enhanced Dashboard Component
const Dashboard = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/${user.id}`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your health dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white" data-testid="patient-dashboard">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-cyan-400" />
            <span className="text-2xl font-bold">HealthSync</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="font-semibold">{dashboardData?.user?.tokens || 0} Tokens</span>
            </div>
            <div className="flex items-center space-x-2">
              <Gauge className="h-5 w-5 text-green-400" />
              <span className="font-semibold">{Math.round(dashboardData?.user?.health_score || 85)}% Health Score</span>
            </div>
            <div className="flex items-center space-x-3">
              <span>Welcome, {user.name}!</span>
              <Button variant="outline" size="sm" onClick={onLogout} data-testid="logout-btn">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white/10 backdrop-blur-md p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="records" className="data-[state=active]:bg-cyan-500">
              <FileText className="h-4 w-4 mr-2" />
              Medical Records
            </TabsTrigger>
            <TabsTrigger value="habits" className="data-[state=active]:bg-cyan-500">
              <Activity className="h-4 w-4 mr-2" />
              Health Habits
            </TabsTrigger>
            <TabsTrigger value="paperwork" className="data-[state=active]:bg-cyan-500">
              <Shield className="h-4 w-4 mr-2" />
              Smart Paperwork
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab dashboardData={dashboardData} userId={user.id} />
          </TabsContent>
          
          <TabsContent value="records">
            <MedicalRecordsTab userId={user.id} />
          </TabsContent>
          
          <TabsContent value="habits">
            <EnhancedHabitsTab userId={user.id} />
          </TabsContent>
          
          <TabsContent value="paperwork">
            <EnhancedPaperworkTab userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Enhanced Overview Tab
const OverviewTab = ({ dashboardData, userId }) => {
  if (!dashboardData) return <div>Loading...</div>;

  const healthScore = dashboardData.user?.health_score || 85;
  const habitStreak = dashboardData.habit_streak || 0;

  return (
    <div className="space-y-8" data-testid="overview-tab">
      {/* Enhanced Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard 
          title="Medical Records" 
          value={dashboardData.recent_records?.length || 0} 
          icon={FileText}
          gradient="from-blue-500 to-cyan-500"
          subtitle="documents uploaded"
        />
        <StatCard 
          title="Health Score" 
          value={`${Math.round(healthScore)}%`} 
          icon={Gauge}
          gradient="from-green-500 to-emerald-500"
          subtitle="overall wellness"
        />
        <StatCard 
          title="Token Balance" 
          value={dashboardData.user?.tokens || 0} 
          icon={Zap}
          gradient="from-yellow-500 to-orange-500"
          subtitle="earned rewards"
        />
        <StatCard 
          title="Habit Streak" 
          value={`${habitStreak} days`} 
          icon={Target}
          gradient="from-purple-500 to-pink-500"
          subtitle="consistency"
        />
      </div>

      {/* Enhanced Activity Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Medical Records */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Medical Records
              </div>
              <Badge className="bg-blue-500/20 text-blue-300">
                {dashboardData.recent_records?.length || 0} files
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.recent_records?.slice(0, 3).map((record) => (
              <div key={record.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-medium text-sm">{record.filename}</p>
                    <p className="text-slate-400 text-xs">
                      {new Date(record.upload_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    AI Analyzed
                  </Badge>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {record.ai_summary?.substring(0, 80)}...
                </p>
              </div>
            )) || <p className="text-slate-400 text-center py-8">No medical records uploaded yet</p>}
          </CardContent>
        </Card>

        {/* Health Insights & Goals */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              Health Insights & Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Health Score Visualization */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Overall Health Score</span>
                <span className="text-lg font-bold text-white">{Math.round(healthScore)}%</span>
              </div>
              <Progress value={healthScore} className="h-3" />
            </div>

            {/* AI Recommendations */}
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-500/30">
                <h4 className="text-cyan-300 font-medium mb-1 text-sm">AI Recommendation</h4>
                <p className="text-white text-xs">
                  Based on your recent activity, consider increasing daily water intake to boost your health score.
                </p>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                <h4 className="text-green-300 font-medium mb-1 text-sm">Achievement Unlocked!</h4>
                <p className="text-white text-xs">
                  {habitStreak > 0 ? 
                    `Great consistency! ${habitStreak}-day habit streak maintained.` : 
                    'Start logging your daily habits to build a healthy routine.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Habits Trend */}
      {dashboardData.recent_habits?.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              7-Day Habits Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dashboardData.recent_habits?.reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="tokens_earned" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  dot={{ fill: '#06b6d4', r: 4 }}
                  name="Tokens Earned"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Enhanced Medical Records Tab with File Upload
const MedicalRecordsTab = ({ userId }) => {
  const [records, setRecords] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, [userId]);

  const fetchRecords = async () => {
    try {
      const response = await axios.get(`${API}/medical-records/${userId}`);
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);

      const response = await axios.post(`${API}/upload-medical-record`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Medical record uploaded and analyzed successfully!');
      fetchRecords();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload record. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [userId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt', '.log'],
      'application/json': ['.json'],
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const deleteRecord = async (recordId) => {
    try {
      await axios.delete(`${API}/medical-records/${recordId}`);
      toast.success('Record deleted successfully');
      fetchRecords();
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  return (
    <div className="space-y-6" data-testid="medical-records-tab">
      {/* Enhanced Upload Section */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileUp className="h-5 w-5 mr-2" />
            Upload Medical Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
              ${isDragActive 
                ? 'border-cyan-400 bg-cyan-400/10' 
                : 'border-white/30 hover:border-cyan-400 hover:bg-white/5'
              }`}
          >
            <input {...getInputProps()} data-testid="file-upload-input" />
            <Upload className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">
              {isDragActive ? 'Drop your files here' : 'Drag & drop medical files'}
            </h3>
            <p className="text-slate-400 mb-4">
              Supports PDF, TXT, JSON, and image files (max 10MB)
            </p>
            <Button 
              disabled={uploading}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              data-testid="upload-btn"
            >
              {uploading ? (
                <>
                  <Timer className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Records Grid */}
      <div className="grid gap-6">
        {records.map((record) => (
          <Card key={record.id} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-white text-lg">{record.filename}</CardTitle>
                  <div className="flex items-center space-x-4 mt-2">
                    <p className="text-slate-400 text-sm">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {new Date(record.upload_date).toLocaleDateString()}
                    </p>
                    <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                      {record.file_type}
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-300 text-xs">
                      <Brain className="h-3 w-3 mr-1" />
                      AI Analyzed
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedRecord(selectedRecord?.id === record.id ? null : record)}
                    data-testid="view-record-btn"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => deleteRecord(record.id)}
                    className="text-red-400 hover:text-red-300"
                    data-testid="delete-record-btn"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {selectedRecord?.id === record.id && (
              <CardContent className="border-t border-white/10 pt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-cyan-300 font-medium mb-2 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Summary
                    </h4>
                    <p className="text-white text-sm bg-white/5 p-4 rounded-lg border border-white/10">
                      {record.ai_summary}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-yellow-300 font-medium mb-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Risk Assessment
                    </h4>
                    <p className="text-white text-sm bg-white/5 p-4 rounded-lg border border-white/10">
                      {record.risk_assessment}
                    </p>
                  </div>
                  {record.health_metrics && Object.keys(record.health_metrics).length > 1 && (
                    <div>
                      <h4 className="text-green-300 font-medium mb-2 flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Health Metrics
                      </h4>
                      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <pre className="text-white text-sm">
                          {JSON.stringify(record.health_metrics, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
        
        {records.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">No Medical Records Yet</h3>
            <p className="text-slate-400">Upload your first medical document to get started with AI analysis</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Habits Tab with Comprehensive Tracking
const EnhancedHabitsTab = ({ userId }) => {
  const [habits, setHabits] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [todayHabit, setTodayHabit] = useState({
    sleep_hours: '', exercise_minutes: '', steps_count: '', water_glasses: '',
    fruits_vegetables: '', calories_consumed: '', mood_rating: '', stress_level: '',
    meditation_minutes: '', weight: '', blood_pressure_systolic: '', 
    blood_pressure_diastolic: '', heart_rate: '', notes: ''
  });

  useEffect(() => {
    fetchHabits();
    fetchAnalytics();
  }, [userId]);

  const fetchHabits = async () => {
    try {
      const response = await axios.get(`${API}/habits/${userId}`);
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/habits/${userId}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const processedData = { user_id: userId };
      
      // Convert string inputs to appropriate types
      Object.entries(todayHabit).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          if (['sleep_hours', 'weight'].includes(key)) {
            processedData[key] = parseFloat(value);
          } else if (['exercise_minutes', 'steps_count', 'water_glasses', 'fruits_vegetables', 
                     'calories_consumed', 'mood_rating', 'stress_level', 'meditation_minutes',
                     'blood_pressure_systolic', 'blood_pressure_diastolic', 'heart_rate'].includes(key)) {
            processedData[key] = parseInt(value);
          } else {
            processedData[key] = value;
          }
        }
      });

      await axios.post(`${API}/habits`, processedData);
      
      toast.success('Habits logged successfully! Tokens awarded for healthy choices.');
      setTodayHabit({
        sleep_hours: '', exercise_minutes: '', steps_count: '', water_glasses: '',
        fruits_vegetables: '', calories_consumed: '', mood_rating: '', stress_level: '',
        meditation_minutes: '', weight: '', blood_pressure_systolic: '', 
        blood_pressure_diastolic: '', heart_rate: '', notes: ''
      });
      fetchHabits();
      fetchAnalytics();
    } catch (error) {
      console.error('Error logging habits:', error);
      toast.error('Failed to log habits. You might have already logged today.');
    }
  };

  const habitCategories = [
    {
      title: 'Physical Health',
      fields: [
        { key: 'sleep_hours', label: 'Sleep Hours', icon: Moon, placeholder: '7.5', type: 'number', step: '0.5' },
        { key: 'exercise_minutes', label: 'Exercise Minutes', icon: Dumbbell, placeholder: '30', type: 'number' },
        { key: 'steps_count', label: 'Steps Count', icon: Footprints, placeholder: '8000', type: 'number' },
        { key: 'water_glasses', label: 'Water Glasses', icon: Droplets, placeholder: '8', type: 'number' }
      ]
    },
    {
      title: 'Nutrition',
      fields: [
        { key: 'fruits_vegetables', label: 'Fruits & Vegetables (servings)', icon: Apple, placeholder: '5', type: 'number' },
        { key: 'calories_consumed', label: 'Calories Consumed', icon: Utensils, placeholder: '2000', type: 'number' }
      ]
    },
    {
      title: 'Mental Health',
      fields: [
        { key: 'mood_rating', label: 'Mood (1-5)', icon: Smile, placeholder: '4', type: 'number', min: '1', max: '5' },
        { key: 'stress_level', label: 'Stress Level (1-5)', icon: AlertCircle, placeholder: '2', type: 'number', min: '1', max: '5' },
        { key: 'meditation_minutes', label: 'Meditation Minutes', icon: Meditation, placeholder: '10', type: 'number' }
      ]
    },
    {
      title: 'Health Metrics',
      fields: [
        { key: 'weight', label: 'Weight (kg)', icon: Scale, placeholder: '70.5', type: 'number', step: '0.1' },
        { key: 'blood_pressure_systolic', label: 'BP Systolic', icon: Stethoscope, placeholder: '120', type: 'number' },
        { key: 'blood_pressure_diastolic', label: 'BP Diastolic', icon: Stethoscope, placeholder: '80', type: 'number' },
        { key: 'heart_rate', label: 'Heart Rate (bpm)', icon: Heart, placeholder: '72', type: 'number' }
      ]
    }
  ];

  return (
    <div className="space-y-6" data-testid="habits-tab">
      {/* Analytics Dashboard */}
      {analytics && (
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Days Logged</p>
                  <p className="text-xl font-bold text-white">{analytics.total_days_logged}</p>
                </div>
                <Calendar className="h-8 w-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Sleep</p>
                  <p className="text-xl font-bold text-white">{analytics.average_sleep?.toFixed(1) || 0}h</p>
                </div>
                <Moon className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Exercise</p>
                  <p className="text-xl font-bold text-white">{Math.round(analytics.average_exercise || 0)}min</p>
                </div>
                <Dumbbell className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Tokens</p>
                  <p className="text-xl font-bold text-white">{analytics.total_tokens_earned}</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Log Today's Habits */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Log Today's Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {habitCategories.map((category) => (
              <div key={category.title}>
                <h3 className="text-cyan-300 font-medium mb-3 text-lg">{category.title}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {category.fields.map((field) => {
                    const Icon = field.icon;
                    return (
                      <div key={field.key}>
                        <Label htmlFor={field.key} className="text-white flex items-center text-sm">
                          <Icon className="h-4 w-4 mr-2" />
                          {field.label}
                        </Label>
                        <Input
                          id={field.key}
                          type={field.type}
                          step={field.step}
                          min={field.min}
                          max={field.max}
                          value={todayHabit[field.key]}
                          onChange={(e) => setTodayHabit({...todayHabit, [field.key]: e.target.value})}
                          placeholder={field.placeholder}
                          className="mt-1"
                          data-testid={`${field.key}-input`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            <div>
              <Label htmlFor="notes" className="text-white">Notes & Reflections</Label>
              <Textarea
                id="notes"
                value={todayHabit.notes}
                onChange={(e) => setTodayHabit({...todayHabit, notes: e.target.value})}
                placeholder="How are you feeling today? Any additional notes..."
                className="mt-1"
                data-testid="notes-input"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              data-testid="log-habits-btn"
            >
              <Award className="h-4 w-4 mr-2" />
              Log Habits & Earn Tokens
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Habits History with Enhanced Display */}
      <div className="space-y-4">
        <h3 className="text-white text-xl font-semibold mb-4">Recent Activity</h3>
        {habits.map((habit) => (
          <Card key={habit.id} className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-medium text-lg">
                    {new Date(habit.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <p className="text-slate-400 text-sm">Health Score Impact: +{habit.health_score_impact?.toFixed(1) || 0}</p>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  +{habit.tokens_earned} tokens
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                {[
                  { icon: Moon, label: 'Sleep', value: habit.sleep_hours, unit: 'h' },
                  { icon: Dumbbell, label: 'Exercise', value: habit.exercise_minutes, unit: 'min' },
                  { icon: Steps, label: 'Steps', value: habit.steps_count, unit: '' },
                  { icon: Droplets, label: 'Water', value: habit.water_glasses, unit: 'glasses' },
                  { icon: Apple, label: 'Fruits/Veg', value: habit.fruits_vegetables, unit: 'servings' },
                  { icon: Smile, label: 'Mood', value: habit.mood_rating, unit: '/5' }
                ].map((metric) => {
                  const Icon = metric.icon;
                  if (!metric.value) return null;
                  
                  return (
                    <div key={metric.label} className="text-center p-3 bg-white/5 rounded-lg">
                      <Icon className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-400">{metric.label}</p>
                      <p className="text-sm font-medium text-white">
                        {metric.value}{metric.unit}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              {habit.notes && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg border-l-4 border-cyan-500">
                  <p className="text-slate-300 text-sm italic">"{habit.notes}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {habits.length === 0 && (
          <div className="text-center py-12">
            <Activity className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">No Habits Logged Yet</h3>
            <p className="text-slate-400">Start tracking your daily habits to earn tokens and improve your health score</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Smart Paperwork Tab
const EnhancedPaperworkTab = ({ userId }) => {
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    form_type: 'admission',
    hospital_name: '',
    doctor_name: '',
    appointment_date: '',
    medical_condition: '',
    insurance_info: ''
  });
  const [generating, setGenerating] = useState(false);
  const [generatedForm, setGeneratedForm] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, [userId]);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API}/paperwork-templates/${userId}`);
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    
    try {
      const response = await axios.post(`${API}/paperwork`, {
        user_id: userId,
        ...formData
      });
      
      setGeneratedForm(response.data);
      toast.success('Smart paperwork generated successfully!');
      fetchTemplates();
    } catch (error) {
      console.error('Paperwork generation error:', error);
      toast.error('Failed to generate paperwork');
    } finally {
      setGenerating(false);
    }
  };

  const toggleFavorite = async (templateId) => {
    try {
      await axios.post(`${API}/paperwork-templates/${templateId}/favorite`);
      fetchTemplates();
      toast.success('Template updated');
    } catch (error) {
      toast.error('Failed to update template');
    }
  };

  const downloadForm = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formTypes = [
    { value: 'admission', label: 'Hospital Admission Form' },
    { value: 'discharge', label: 'Discharge Summary' },
    { value: 'referral', label: 'Doctor Referral Letter' },
    { value: 'insurance', label: 'Insurance Claim Form' },
    { value: 'consent', label: 'Medical Consent Form' },
    { value: 'history', label: 'Medical History Form' }
  ];

  return (
    <div className="space-y-6" data-testid="paperwork-tab">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Form Generation */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Generate Smart Paperwork
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <Label htmlFor="formType" className="text-white">Form Type</Label>
                <Select 
                  value={formData.form_type} 
                  onValueChange={(value) => setFormData({...formData, form_type: value})}
                >
                  <SelectTrigger className="w-full mt-1" data-testid="form-type-select">
                    <SelectValue placeholder="Select form type" />
                  </SelectTrigger>
                  <SelectContent>
                    {formTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="hospital" className="text-white">Hospital/Clinic Name</Label>
                <Input
                  id="hospital"
                  value={formData.hospital_name}
                  onChange={(e) => setFormData({...formData, hospital_name: e.target.value})}
                  placeholder="City General Hospital"
                  required
                  className="mt-1"
                  data-testid="hospital-input"
                />
              </div>
              
              <div>
                <Label htmlFor="doctor" className="text-white">Doctor Name</Label>
                <Input
                  id="doctor"
                  value={formData.doctor_name}
                  onChange={(e) => setFormData({...formData, doctor_name: e.target.value})}
                  placeholder="Dr. Sarah Johnson"
                  className="mt-1"
                  data-testid="doctor-input"
                />
              </div>

              <div>
                <Label htmlFor="appointment" className="text-white">Appointment Date</Label>
                <Input
                  id="appointment"
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                  className="mt-1"
                  data-testid="appointment-input"
                />
              </div>

              <div>
                <Label htmlFor="condition" className="text-white">Medical Condition/Reason</Label>
                <Input
                  id="condition"
                  value={formData.medical_condition}
                  onChange={(e) => setFormData({...formData, medical_condition: e.target.value})}
                  placeholder="General consultation, follow-up, etc."
                  className="mt-1"
                  data-testid="condition-input"
                />
              </div>

              <div>
                <Label htmlFor="insurance" className="text-white">Insurance Information</Label>
                <Input
                  id="insurance"
                  value={formData.insurance_info}
                  onChange={(e) => setFormData({...formData, insurance_info: e.target.value})}
                  placeholder="Policy number, provider name"
                  className="mt-1"
                  data-testid="insurance-input"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={generating}
                data-testid="generate-paperwork-btn"
              >
                {generating ? (
                  <>
                    <Timer className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Smart Form
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Template Library */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Template Library
              </div>
              <Badge className="bg-blue-500/20 text-blue-300">
                {templates.length} templates
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {templates.map((template) => (
                <div key={template.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">{template.template_name}</h4>
                      <p className="text-slate-400 text-xs">
                        {template.form_type} • {new Date(template.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleFavorite(template.id)}
                        className={template.is_favorite ? 'text-yellow-400' : 'text-slate-400'}
                      >
                        <Star className={`h-3 w-3 ${template.is_favorite ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadForm(template.content, template.template_name)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {templates.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No templates yet</p>
                  <p className="text-slate-500 text-xs">Generate your first form to create a template</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated Form Display */}
      {generatedForm && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">
                Generated {generatedForm.form_type.charAt(0).toUpperCase() + generatedForm.form_type.slice(1)} Form
              </CardTitle>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => downloadForm(generatedForm.content, `${generatedForm.form_type}_form`)}
                  className="bg-green-500 hover:bg-green-600"
                  data-testid="download-btn"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600"
                  data-testid="share-btn"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white text-black p-6 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                {generatedForm.content}
              </pre>
            </div>
            <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <p className="text-cyan-300 text-sm">
                <CheckCircle2 className="h-4 w-4 inline mr-2" />
                Form generated successfully and saved to your template library. 
                You can download, share, or use this as a template for future forms.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Enhanced Stat Card Component
const StatCard = ({ title, value, icon: Icon, gradient, subtitle }) => (
  <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden hover:bg-white/15 transition-all">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white mb-1">{value}</p>
          {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-r ${gradient} flex-shrink-0`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default App;