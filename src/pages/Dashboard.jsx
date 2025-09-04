import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { AppShell } from '../components/ui/AppShell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ProgressCircle } from '../components/ui/ProgressCircle'
import { getChatbotResponse } from '../config/openai'
import { 
  Timer, 
  TrendingUp, 
  MessageCircle, 
  Clock,
  Target,
  Calendar,
  Zap
} from 'lucide-react'
import { format, isToday } from 'date-fns'

export const Dashboard = () => {
  const { userProfile } = useAuth()
  const { fastingSessions, currentFast, isTimerRunning, startFastingSession } = useApp()
  const [chatMessage, setChatMessage] = useState('')
  const [chatResponse, setChatResponse] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [fastingProgress, setFastingProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState('')

  // Calculate fasting progress
  useEffect(() => {
    if (currentFast && isTimerRunning) {
      const updateProgress = () => {
        const startTime = new Date(currentFast.startTime)
        const now = new Date()
        const elapsed = (now - startTime) / (1000 * 60 * 60) // hours
        const target = userProfile?.currentFastingPlan?.fastingHours || 16
        
        const progress = Math.min((elapsed / target) * 100, 100)
        setFastingProgress(progress)
        
        const remaining = Math.max(target - elapsed, 0)
        const hours = Math.floor(remaining)
        const minutes = Math.floor((remaining % 1) * 60)
        setTimeRemaining(`${hours}h ${minutes}m remaining`)
      }

      updateProgress()
      const interval = setInterval(updateProgress, 60000) // Update every minute
      
      return () => clearInterval(interval)
    }
  }, [currentFast, isTimerRunning, userProfile])

  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatMessage.trim()) return

    setChatLoading(true)
    try {
      const response = await getChatbotResponse(chatMessage, {
        currentFast,
        fastingSessions: fastingSessions.slice(0, 5), // Last 5 sessions
        userProfile
      })
      setChatResponse(response)
      setChatMessage('')
    } catch (error) {
      console.error('Chat error:', error)
      setChatResponse("I'm here to help! How are you feeling about your fasting journey?")
    } finally {
      setChatLoading(false)
    }
  }

  const handleStartFast = async () => {
    if (userProfile?.currentFastingPlan) {
      await startFastingSession(userProfile.currentFastingPlan)
    }
  }

  const todaysSessions = fastingSessions.filter(session => 
    isToday(new Date(session.startTime))
  )

  const weeklyStats = {
    totalHours: fastingSessions
      .filter(session => {
        const sessionDate = new Date(session.startTime)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return sessionDate >= weekAgo && session.duration
      })
      .reduce((total, session) => total + (session.duration || 0), 0),
    
    averageDaily: Math.round(
      fastingSessions
        .filter(session => session.duration)
        .slice(0, 7)
        .reduce((sum, session) => sum + session.duration, 0) / 7
    ) || 0,
    
    streak: fastingSessions.filter(session => session.status === 'completed').length
  }

  if (!userProfile?.onboardingCompleted) {
    return (
      <AppShell>
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-white">Welcome to FastFlow!</h1>
          <p className="text-white/70">Complete your setup to get started with personalized fasting.</p>
          <Link to="/onboarding">
            <Button size="lg">Complete Setup</Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Welcome back! 👋
          </h1>
          <p className="text-white/70 text-lg">
            {currentFast 
              ? "You're currently fasting. Keep it up!" 
              : "Ready to start your next fast?"
            }
          </p>
        </div>

        {/* Current Fast Status */}
        <Card variant="elevated" className="text-center space-y-6">
          {currentFast && isTimerRunning ? (
            <>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Current Fast</h2>
                <ProgressCircle 
                  progress={fastingProgress} 
                  size={160}
                  className="mx-auto"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {Math.floor(fastingProgress)}%
                    </div>
                    <div className="text-white/60 text-sm">
                      {timeRemaining}
                    </div>
                  </div>
                </ProgressCircle>
                
                <div className="text-white/80">
                  Started at {format(new Date(currentFast.startTime), 'h:mm a')}
                </div>
              </div>
              
              <Link to="/timer">
                <Button size="lg" className="w-full">
                  <Timer className="h-5 w-5 mr-2" />
                  View Timer
                </Button>
              </Link>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Start Your Fast</h2>
                <div className="text-6xl">⏰</div>
                
                {userProfile.currentFastingPlan && (
                  <div className="space-y-2">
                    <div className="text-xl font-semibold text-accent">
                      {userProfile.currentFastingPlan.schedule}
                    </div>
                    <div className="text-white/70">
                      Eating window: {userProfile.currentFastingPlan.startTime} - {userProfile.currentFastingPlan.endTime}
                    </div>
                  </div>
                )}
              </div>
              
              <Button size="lg" onClick={handleStartFast} className="w-full">
                <Timer className="h-5 w-5 mr-2" />
                Start Fasting
              </Button>
            </>
          )}
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{weeklyStats.totalHours}h</div>
              <div className="text-white/60 text-sm">This week</div>
            </div>
          </Card>

          <Card className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/20">
              <Target className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{weeklyStats.averageDaily}h</div>
              <div className="text-white/60 text-sm">Daily average</div>
            </div>
          </Card>

          <Card className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20">
              <Zap className="h-6 w-6 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{weeklyStats.streak}</div>
              <div className="text-white/60 text-sm">Completed fasts</div>
            </div>
          </Card>
        </div>

        {/* AI Chatbot */}
        <Card variant="elevated" className="space-y-6">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6 text-accent" />
            <h2 className="text-xl font-bold text-white">Daily Check-in</h2>
          </div>

          {chatResponse && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white/80">{chatResponse}</p>
            </div>
          )}

          <form onSubmit={handleChatSubmit} className="space-y-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="How are you feeling today?"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={chatLoading}
              />
              <Button type="submit" disabled={chatLoading || !chatMessage.trim()}>
                {chatLoading ? 'Thinking...' : 'Send'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/progress">
            <Card className="p-6 hover:bg-white/5 transition-colors duration-150 cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">View Progress</h3>
                  <p className="text-white/60 text-sm">Track your fasting trends and insights</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/journal">
            <Card className="p-6 hover:bg-white/5 transition-colors duration-150 cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/20">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Journal Entry</h3>
                  <p className="text-white/60 text-sm">Record your thoughts and feelings</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </AppShell>
  )
}