import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

// Icons from Lucide React
import { 
  Heart, 
  Upload, 
  Brain, 
  FileText, 
  Award, 
  Activity,
  Moon,
  Droplets,
  Dumbbell,
  Smile,
  Plus,
  BarChart3,
  Shield,
  Zap,
  Sparkles
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Main App Component
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Check if user exists in localStorage
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

// Landing Page Component
const LandingPage = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Hero Section */}
      <motion.div 
        className="relative z-10 container mx-auto px-6 py-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Navigation */}
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

        {/* Hero Content */}
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

        {/* Features Grid */}
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

        {/* Hero Image */}
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

// Feature Card Component
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

// Auth Modal Component
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
      if (isLogin) {
        // For demo purposes, create a new user instead of actual login
        const response = await axios.post(`${API}/users`, {
          name: formData.name,
          email: formData.email,
          age: formData.age ? parseInt(formData.age) : null
        });
        onUserLogin(response.data);
      } else {
        // Create new user
        const response = await axios.post(`${API}/users`, {
          name: formData.name,
          email: formData.email,
          age: formData.age ? parseInt(formData.age) : null
        });
        onUserLogin(response.data);
      }
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

// Dashboard Component
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
            <HabitsTab userId={user.id} />
          </TabsContent>
          
          <TabsContent value="paperwork">
            <PaperworkTab userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ dashboardData, userId }) => {
  if (!dashboardData) return <div>Loading...</div>;

  return (
    <div className="space-y-8" data-testid="overview-tab">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Records" 
          value={dashboardData.recent_records?.length || 0} 
          icon={FileText}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard 
          title="Tokens Earned" 
          value={dashboardData.tokens_earned_total || 0} 
          icon={Zap}
          gradient="from-yellow-500 to-orange-500"
        />
        <StatCard 
          title="Health Score" 
          value="85%" 
          icon={Heart}
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard 
          title="Streak Days" 
          value={dashboardData.recent_habits?.length || 0} 
          icon={Award}
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Medical Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recent_records?.slice(0, 3).map((record) => (
                <div key={record.id} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">{record.filename}</p>
                      <p className="text-slate-300 text-sm">{record.ai_summary?.substring(0, 100)}...</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      Analyzed
                    </Badge>
                  </div>
                </div>
              )) || <p className="text-slate-400">No records uploaded yet</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              Health Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-500/30">
                <h4 className="text-cyan-300 font-medium mb-2">AI Recommendation</h4>
                <p className="text-white text-sm">Based on your recent habits, consider increasing your daily water intake to 8+ glasses for optimal hydration.</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                <h4 className="text-green-300 font-medium mb-2">Achievement</h4>
                <p className="text-white text-sm">Great job maintaining your exercise routine! You've earned bonus tokens this week.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Medical Records Tab Component
const MedicalRecordsTab = ({ userId }) => {
  const [records, setRecords] = useState([]);
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // For demo purposes, we'll simulate file content
      const content = `Medical Report: ${file.name}\nPatient data and medical information would be extracted here.`;
      
      await axios.post(`${API}/medical-records`, {
        user_id: userId,
        filename: file.name,
        content: content
      });
      
      toast.success('Medical record uploaded and analyzed!');
      fetchRecords();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload record');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="medical-records-tab">
      {/* Upload Section */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Upload Medical Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-white mb-4">Drop your medical records here or click to browse</p>
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.txt,.doc,.docx"
              data-testid="file-upload-input"
            />
            <Button 
              onClick={() => document.getElementById('file-upload').click()}
              disabled={uploading}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
              data-testid="upload-btn"
            >
              {uploading ? 'Analyzing...' : 'Choose File'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      <div className="grid gap-6">
        {records.map((record) => (
          <Card key={record.id} className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white">{record.filename}</CardTitle>
                  <p className="text-slate-400 text-sm">
                    Uploaded: {new Date(record.upload_date).toLocaleDateString()}
                  </p>
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                  <Brain className="h-3 w-3 mr-1" />
                  AI Analyzed
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-cyan-300 font-medium mb-2">AI Summary</h4>
                <p className="text-white text-sm bg-white/5 p-3 rounded">{record.ai_summary}</p>
              </div>
              <div>
                <h4 className="text-yellow-300 font-medium mb-2">Risk Assessment</h4>
                <p className="text-white text-sm bg-white/5 p-3 rounded">{record.risk_assessment}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Habits Tab Component
const HabitsTab = ({ userId }) => {
  const [habits, setHabits] = useState([]);
  const [todayHabit, setTodayHabit] = useState({
    sleep_hours: '',
    exercise_minutes: '',
    water_glasses: '',
    mood_rating: '',
    notes: ''
  });

  useEffect(() => {
    fetchHabits();
  }, [userId]);

  const fetchHabits = async () => {
    try {
      const response = await axios.get(`${API}/habits/${userId}`);
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/habits`, {
        user_id: userId,
        ...todayHabit,
        sleep_hours: todayHabit.sleep_hours ? parseFloat(todayHabit.sleep_hours) : null,
        exercise_minutes: todayHabit.exercise_minutes ? parseInt(todayHabit.exercise_minutes) : null,
        water_glasses: todayHabit.water_glasses ? parseInt(todayHabit.water_glasses) : null,
        mood_rating: todayHabit.mood_rating ? parseInt(todayHabit.mood_rating) : null,
      });
      
      toast.success('Habits logged! Tokens awarded for healthy choices.');
      setTodayHabit({
        sleep_hours: '',
        exercise_minutes: '',
        water_glasses: '',
        mood_rating: '',
        notes: ''
      });
      fetchHabits();
    } catch (error) {
      console.error('Error logging habits:', error);
      toast.error('Failed to log habits. You might have already logged today.');
    }
  };

  return (
    <div className="space-y-6" data-testid="habits-tab">
      {/* Log Today's Habits */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Log Today's Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sleep" className="text-white flex items-center">
                  <Moon className="h-4 w-4 mr-2" />
                  Sleep Hours
                </Label>
                <Input
                  id="sleep"
                  type="number"
                  step="0.5"
                  value={todayHabit.sleep_hours}
                  onChange={(e) => setTodayHabit({...todayHabit, sleep_hours: e.target.value})}
                  placeholder="7.5"
                  data-testid="sleep-input"
                />
              </div>
              
              <div>
                <Label htmlFor="exercise" className="text-white flex items-center">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Exercise Minutes
                </Label>
                <Input
                  id="exercise"
                  type="number"
                  value={todayHabit.exercise_minutes}
                  onChange={(e) => setTodayHabit({...todayHabit, exercise_minutes: e.target.value})}
                  placeholder="30"
                  data-testid="exercise-input"
                />
              </div>
              
              <div>
                <Label htmlFor="water" className="text-white flex items-center">
                  <Droplets className="h-4 w-4 mr-2" />
                  Water Glasses
                </Label>
                <Input
                  id="water"
                  type="number"
                  value={todayHabit.water_glasses}
                  onChange={(e) => setTodayHabit({...todayHabit, water_glasses: e.target.value})}
                  placeholder="8"
                  data-testid="water-input"
                />
              </div>
              
              <div>
                <Label htmlFor="mood" className="text-white flex items-center">
                  <Smile className="h-4 w-4 mr-2" />
                  Mood (1-5)
                </Label>
                <Input
                  id="mood"
                  type="number"
                  min="1"
                  max="5"
                  value={todayHabit.mood_rating}
                  onChange={(e) => setTodayHabit({...todayHabit, mood_rating: e.target.value})}
                  placeholder="4"
                  data-testid="mood-input"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes" className="text-white">Notes</Label>
              <Textarea
                id="notes"
                value={todayHabit.notes}
                onChange={(e) => setTodayHabit({...todayHabit, notes: e.target.value})}
                placeholder="How are you feeling today?"
                data-testid="notes-input"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
              data-testid="log-habits-btn"
            >
              <Award className="h-4 w-4 mr-2" />
              Log Habits & Earn Tokens
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Habits History */}
      <div className="grid gap-4">
        {habits.map((habit) => (
          <Card key={habit.id} className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-white font-medium">{habit.date}</h3>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  +{habit.tokens_earned} tokens
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-slate-300">
                  <Moon className="h-4 w-4 inline mr-1" />
                  Sleep: {habit.sleep_hours || 'N/A'}h
                </div>
                <div className="text-slate-300">
                  <Dumbbell className="h-4 w-4 inline mr-1" />
                  Exercise: {habit.exercise_minutes || 'N/A'}min
                </div>
                <div className="text-slate-300">
                  <Droplets className="h-4 w-4 inline mr-1" />
                  Water: {habit.water_glasses || 'N/A'} glasses
                </div>
                <div className="text-slate-300">
                  <Smile className="h-4 w-4 inline mr-1" />
                  Mood: {habit.mood_rating || 'N/A'}/5
                </div>
              </div>
              {habit.notes && (
                <p className="text-slate-400 text-sm mt-2 italic">{habit.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Paperwork Tab Component
const PaperworkTab = ({ userId }) => {
  const [formType, setFormType] = useState('admission');
  const [hospitalName, setHospitalName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedForm, setGeneratedForm] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    
    try {
      const response = await axios.post(`${API}/paperwork`, {
        user_id: userId,
        form_type: formType,
        hospital_name: hospitalName,
        doctor_name: doctorName
      });
      
      setGeneratedForm(response.data);
      toast.success('Smart paperwork generated successfully!');
    } catch (error) {
      console.error('Paperwork generation error:', error);
      toast.error('Failed to generate paperwork');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="paperwork-tab">
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
              <select
                id="formType"
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white"
                data-testid="form-type-select"
              >
                <option value="admission">Hospital Admission</option>
                <option value="discharge">Discharge Summary</option>
                <option value="referral">Doctor Referral</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="hospital" className="text-white">Hospital Name</Label>
              <Input
                id="hospital"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="City General Hospital"
                required
                data-testid="hospital-input"
              />
            </div>
            
            <div>
              <Label htmlFor="doctor" className="text-white">Doctor Name (Optional)</Label>
              <Input
                id="doctor"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Dr. Smith"
                data-testid="doctor-input"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
              disabled={generating}
              data-testid="generate-paperwork-btn"
            >
              {generating ? 'Generating...' : 'Generate Smart Paperwork'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generatedForm && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Generated {generatedForm.form_type} Form</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white/5 p-4 rounded-lg">
              <pre className="text-white text-sm whitespace-pre-wrap">{generatedForm.content}</pre>
            </div>
            <div className="mt-4 flex gap-3">
              <Button className="bg-green-500 hover:bg-green-600" data-testid="share-btn">
                Share with Hospital
              </Button>
              <Button variant="outline" data-testid="download-btn">
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, gradient }) => (
  <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-r ${gradient}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default App;