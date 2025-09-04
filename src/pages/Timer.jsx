import React, { useEffect, useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { AppShell } from '../components/ui/AppShell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ProgressCircle } from '../components/ui/ProgressCircle'
import { 
  Play, 
  Pause, 
  Square, 
  Clock,
  Target,
  Calendar,
  Droplets
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

export const Timer = () => {
  const { 
    currentFast, 
    isTimerRunning, 
    startFastingSession, 
    endFastingSession 
  } = useApp()
  const { userProfile } = useAuth()
  
  const [currentTime, setCurrentTime] = useState(new Date())
  const [fastingProgress, setFastingProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState('')
  const [timeRemaining, setTimeRemaining] = useState('')
  const [nextMealTime, setNextMealTime] = useState('')

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Calculate fasting metrics
  useEffect(() => {
    if (currentFast && isTimerRunning) {
      const startTime = new Date(currentFast.startTime)
      const now = new Date()
      const elapsed = (now - startTime) / (1000 * 60 * 60) // hours
      const target = userProfile?.currentFastingPlan?.fastingHours || 16
      
      // Progress percentage
      const progress = Math.min((elapsed / target) * 100, 100)
      setFastingProgress(progress)
      
      // Elapsed time display
      const hours = Math.floor(elapsed)
      const minutes = Math.floor((elapsed % 1) * 60)
      setElapsedTime(`${hours}h ${minutes}m`)
      
      // Time remaining
      const remaining = Math.max(target - elapsed, 0)
      const remainingHours = Math.floor(remaining)
      const remainingMinutes = Math.floor((remaining % 1) * 60)
      setTimeRemaining(`${remainingHours}h ${remainingMinutes}m`)
      
      // Next meal time
      if (userProfile?.currentFastingPlan?.startTime) {
        const today = new Date()
        const [hours, minutes] = userProfile.currentFastingPlan.startTime.split(':')
        const mealTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes)
        
        // If meal time has passed today, show tomorrow's meal time
        if (mealTime < now) {
          mealTime.setDate(mealTime.getDate() + 1)
        }
        
        setNextMealTime(format(mealTime, 'h:mm a'))
      }
    }
  }, [currentTime, currentFast, isTimerRunning, userProfile])

  const handleStartFast = async () => {
    if (userProfile?.currentFastingPlan) {
      await startFastingSession(userProfile.currentFastingPlan)
    }
  }

  const handleEndFast = async () => {
    await endFastingSession()
  }

  const fastingTips = [
    "Stay hydrated - drink plenty of water",
    "Black coffee and tea are your friends",
    "Keep busy to avoid thinking about food",
    "Listen to your body and rest if needed",
    "Remember why you started this journey"
  ]

  const getCurrentTip = () => {
    const tipIndex = Math.floor(Date.now() / (1000 * 60 * 60)) % fastingTips.length
    return fastingTips[tipIndex]
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Fasting Timer
          </h1>
          <p className="text-white/70">
            {currentFast && isTimerRunning 
              ? "Stay strong! You're doing great." 
              : "Ready to start your fasting journey?"
            }
          </p>
        </div>

        {/* Main Timer Display */}
        <Card variant="elevated" className="text-center space-y-8">
          {currentFast && isTimerRunning ? (
            <>
              {/* Progress Circle */}
              <ProgressCircle 
                progress={fastingProgress} 
                size={200}
                strokeWidth={12}
                className="mx-auto"
              >
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-white">
                    {elapsedTime}
                  </div>
                  <div className="text-white/60 text-sm">
                    elapsed
                  </div>
                  <div className="text-accent font-semibold">
                    {Math.floor(fastingProgress)}%
                  </div>
                </div>
              </ProgressCircle>

              {/* Time Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <Clock className="h-6 w-6 text-primary mx-auto" />
                  <div className="text-sm text-white/60">Started</div>
                  <div className="font-semibold text-white">
                    {format(new Date(currentFast.startTime), 'h:mm a')}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Target className="h-6 w-6 text-secondary mx-auto" />
                  <div className="text-sm text-white/60">Target</div>
                  <div className="font-semibold text-white">
                    {userProfile?.currentFastingPlan?.fastingHours || 16}h
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Calendar className="h-6 w-6 text-accent mx-auto" />
                  <div className="text-sm text-white/60">Next meal</div>
                  <div className="font-semibold text-white">
                    {nextMealTime}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                size="lg" 
                variant="secondary"
                onClick={handleEndFast}
                className="w-full md:w-auto"
              >
                <Square className="h-5 w-5 mr-2" />
                End Fast
              </Button>
            </>
          ) : (
            <>
              {/* No Active Fast */}
              <div className="space-y-6">
                <div className="text-8xl">⏱️</div>
                
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">
                    Ready to Fast?
                  </h2>
                  
                  {userProfile?.currentFastingPlan && (
                    <div className="space-y-2">
                      <div className="text-xl font-semibold text-accent">
                        {userProfile.currentFastingPlan.schedule}
                      </div>
                      <div className="text-white/70">
                        {userProfile.currentFastingPlan.fastingHours} hours of fasting
                      </div>
                      <div className="text-white/60 text-sm">
                        Eating window: {userProfile.currentFastingPlan.startTime} - {userProfile.currentFastingPlan.endTime}
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  size="lg" 
                  onClick={handleStartFast}
                  className="w-full md:w-auto"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Fasting
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Stats & Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Status */}
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Droplets className="h-5 w-5 mr-2 text-accent" />
              Hydration Reminder
            </h3>
            
            <div className="space-y-3">
              <p className="text-white/80 text-sm">
                Stay hydrated during your fast. Water, black coffee, and plain tea are great options.
              </p>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-white/70 text-sm">Daily water goal</span>
                <span className="font-semibold text-accent">8 glasses</span>
              </div>
            </div>
          </Card>

          {/* Tip of the Hour */}
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              💡 Fasting Tip
            </h3>
            
            <p className="text-white/80 text-sm">
              {getCurrentTip()}
            </p>
            
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-accent text-xs font-medium">
                Pro Tip: The tip changes every hour to keep you motivated!
              </p>
            </div>
          </Card>
        </div>

        {/* Current Time Display */}
        <Card className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-white">Current Time</h3>
          <div className="text-4xl font-bold text-white">
            {format(currentTime, 'h:mm:ss a')}
          </div>
          <div className="text-white/60">
            {format(currentTime, 'EEEE, MMMM do, yyyy')}
          </div>
        </Card>
      </div>
    </AppShell>
  )
}