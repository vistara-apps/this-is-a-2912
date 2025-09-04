import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AppShell } from '../components/ui/AppShell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { generateFastingPlan } from '../config/openai'
import { 
  User, 
  Target, 
  Clock, 
  Crown,
  Zap,
  Bell,
  Shield
} from 'lucide-react'

export const Settings = () => {
  const { userProfile, updateUserProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    age: userProfile?.age || '',
    gender: userProfile?.gender || '',
    weight: userProfile?.weight || '',
    goal: userProfile?.goal || '',
    sleepTime: userProfile?.sleepTime || '',
    wakeTime: userProfile?.wakeTime || ''
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await updateUserProfile(formData)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegeneratePlan = async () => {
    setLoading(true)
    
    try {
      const newPlan = await generateFastingPlan(formData)
      await updateUserProfile({ 
        ...formData,
        currentFastingPlan: newPlan 
      })
    } catch (error) {
      console.error('Error regenerating plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'plan', label: 'Fasting Plan', icon: Target },
    { id: 'subscription', label: 'Subscription', icon: Crown },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Settings
          </h1>
          <p className="text-white/70">
            Customize your FastFlow experience
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <Card variant="elevated" className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="25"
                />
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <Input
                label="Weight (kg)"
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="70"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">
                  Primary Goal
                </label>
                <select
                  value={formData.goal}
                  onChange={(e) => handleInputChange('goal', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select goal</option>
                  <option value="Fat Loss">Fat Loss</option>
                  <option value="Increased Energy">Increased Energy</option>
                  <option value="Gut Health">Gut Health</option>
                  <option value="Mental Clarity">Mental Clarity</option>
                  <option value="General Wellness">General Wellness</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Wake Time"
                  type="time"
                  value={formData.wakeTime}
                  onChange={(e) => handleInputChange('wakeTime', e.target.value)}
                />
                
                <Input
                  label="Sleep Time"
                  type="time"
                  value={formData.sleepTime}
                  onChange={(e) => handleInputChange('sleepTime', e.target.value)}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </Card>
        )}

        {activeTab === 'plan' && (
          <Card variant="elevated" className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Current Fasting Plan
            </h2>

            {userProfile?.currentFastingPlan ? (
              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-white/5 border border-white/10 space-y-4">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-accent">
                      {userProfile.currentFastingPlan.fastingHours}:{userProfile.currentFastingPlan.eatingHours}
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {userProfile.currentFastingPlan.schedule}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-white/60 text-sm">Eating Window</div>
                      <div className="font-semibold text-white">
                        {userProfile.currentFastingPlan.startTime} - {userProfile.currentFastingPlan.endTime}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-white/60 text-sm">Fasting Duration</div>
                      <div className="font-semibold text-white">
                        {userProfile.currentFastingPlan.fastingHours} hours
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Rationale:</h4>
                    <p className="text-white/80 text-sm">{userProfile.currentFastingPlan.rationale}</p>
                  </div>

                  {userProfile.currentFastingPlan.tips && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white">Tips:</h4>
                      <ul className="space-y-1">
                        {userProfile.currentFastingPlan.tips.map((tip, index) => (
                          <li key={index} className="text-white/80 text-sm flex items-start">
                            <span className="text-accent mr-2">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleRegeneratePlan}
                  disabled={loading}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {loading ? 'Regenerating...' : 'Regenerate Plan with AI'}
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4 py-8">
                <div className="text-6xl">🎯</div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">No plan found</h3>
                  <p className="text-white/60 text-sm">
                    Update your profile information and generate a new plan
                  </p>
                </div>
                <Button
                  onClick={handleRegeneratePlan}
                  disabled={loading}
                  size="lg"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Plan
                </Button>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'subscription' && (
          <Card variant="elevated" className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Crown className="h-5 w-5 mr-2" />
              Subscription
            </h2>

            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white">Current Plan</h3>
                    <p className="text-white/60 text-sm">
                      {userProfile?.subscriptionStatus === 'pro' ? 'Pro Plan' : 'Free Plan'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    userProfile?.subscriptionStatus === 'pro' 
                      ? 'bg-secondary/20 text-secondary' 
                      : 'bg-white/10 text-white/70'
                  }`}>
                    {userProfile?.subscriptionStatus === 'pro' ? 'Pro' : 'Free'}
                  </div>
                </div>

                {userProfile?.subscriptionStatus === 'free' && (
                  <div className="space-y-4">
                    <div className="text-white/80 text-sm">
                      Upgrade to Pro to unlock:
                    </div>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li className="flex items-center">
                        <span className="text-secondary mr-2">✓</span>
                        Advanced AI coaching and adaptive plans
                      </li>
                      <li className="flex items-center">
                        <span className="text-secondary mr-2">✓</span>
                        Voice journaling with mood analysis
                      </li>
                      <li className="flex items-center">
                        <span className="text-secondary mr-2">✓</span>
                        Detailed progress analytics
                      </li>
                      <li className="flex items-center">
                        <span className="text-secondary mr-2">✓</span>
                        Priority support
                      </li>
                    </ul>
                    
                    <Button size="lg" className="w-full">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Pro - $5/month
                    </Button>
                  </div>
                )}

                {userProfile?.subscriptionStatus === 'pro' && (
                  <div className="space-y-4">
                    <div className="text-white/80 text-sm">
                      You have access to all Pro features including AI coaching, voice journaling, and advanced analytics.
                    </div>
                    
                    <Button variant="outline" size="lg" className="w-full">
                      Manage Subscription
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card variant="elevated" className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </h2>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                  <div>
                    <h3 className="font-medium text-white">Fasting Reminders</h3>
                    <p className="text-white/60 text-sm">Get notified when it's time to start or end your fast</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                  <div>
                    <h3 className="font-medium text-white">Daily Check-ins</h3>
                    <p className="text-white/60 text-sm">Reminders to record your daily feelings and progress</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                  <div>
                    <h3 className="font-medium text-white">Achievement Alerts</h3>
                    <p className="text-white/60 text-sm">Celebrate your milestones and streaks</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                  <div>
                    <h3 className="font-medium text-white">Weekly Reports</h3>
                    <p className="text-white/60 text-sm">Summary of your fasting progress and insights</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-accent">Privacy Note</h4>
                    <p className="text-accent/80 text-sm">
                      Notifications are processed locally on your device. Your personal data is never shared with third parties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  )
}