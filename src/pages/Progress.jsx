import React, { useMemo } from 'react'
import { useApp } from '../contexts/AppContext'
import { AppShell } from '../components/ui/AppShell'
import { Card } from '../components/ui/Card'
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Calendar,
  Award,
  Zap
} from 'lucide-react'
import { format, subDays, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns'

export const Progress = () => {
  const { fastingSessions, journalEntries } = useApp()

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const now = new Date()
    const lastWeek = subDays(now, 7)
    const lastMonth = subDays(now, 30)

    // Filter sessions by time periods
    const weekSessions = fastingSessions.filter(session => 
      new Date(session.startTime) >= lastWeek && session.duration
    )
    const monthSessions = fastingSessions.filter(session => 
      new Date(session.startTime) >= lastMonth && session.duration
    )
    const completedSessions = fastingSessions.filter(session => 
      session.status === 'completed'
    )

    // Weekly stats
    const weeklyTotal = weekSessions.reduce((sum, session) => sum + session.duration, 0)
    const weeklyAverage = weekSessions.length > 0 ? weeklyTotal / 7 : 0

    // Monthly stats
    const monthlyTotal = monthSessions.reduce((sum, session) => sum + session.duration, 0)
    const monthlyAverage = monthSessions.length > 0 ? monthlyTotal / 30 : 0

    // Streak calculation
    let currentStreak = 0
    const sortedSessions = [...completedSessions].sort((a, b) => 
      new Date(b.startTime) - new Date(a.startTime)
    )
    
    for (let i = 0; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].startTime)
      const expectedDate = subDays(now, i)
      
      if (format(sessionDate, 'yyyy-MM-dd') === format(expectedDate, 'yyyy-MM-dd')) {
        currentStreak++
      } else {
        break
      }
    }

    // Longest fast
    const longestFast = Math.max(...completedSessions.map(s => s.duration || 0), 0)

    // Success rate
    const totalAttempts = fastingSessions.length
    const successRate = totalAttempts > 0 ? (completedSessions.length / totalAttempts) * 100 : 0

    return {
      weeklyTotal: Math.round(weeklyTotal),
      weeklyAverage: Math.round(weeklyAverage * 10) / 10,
      monthlyTotal: Math.round(monthlyTotal),
      monthlyAverage: Math.round(monthlyAverage * 10) / 10,
      currentStreak,
      longestFast,
      successRate: Math.round(successRate),
      totalCompleted: completedSessions.length
    }
  }, [fastingSessions])

  // Weekly chart data
  const weeklyChartData = useMemo(() => {
    const days = []
    const now = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i)
      const dayName = format(date, 'EEE')
      
      const daySessions = fastingSessions.filter(session => {
        const sessionDate = new Date(session.startTime)
        return format(sessionDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && session.duration
      })
      
      const totalHours = daySessions.reduce((sum, session) => sum + session.duration, 0)
      
      days.push({
        day: dayName,
        hours: totalHours,
        date: format(date, 'MMM d')
      })
    }
    
    return days
  }, [fastingSessions])

  // Mood trends from journal entries
  const moodTrends = useMemo(() => {
    const recent = journalEntries.slice(0, 7)
    const moodCounts = { positive: 0, neutral: 0, negative: 0 }
    
    recent.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
      }
    })
    
    const total = Object.values(moodCounts).reduce((sum, count) => sum + count, 0)
    return total > 0 ? {
      positive: Math.round((moodCounts.positive / total) * 100),
      neutral: Math.round((moodCounts.neutral / total) * 100),
      negative: Math.round((moodCounts.negative / total) * 100)
    } : { positive: 0, neutral: 0, negative: 0 }
  }, [journalEntries])

  const maxHours = Math.max(...weeklyChartData.map(d => d.hours), 1)

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Your Progress
          </h1>
          <p className="text-white/70">
            Track your fasting journey and celebrate your achievements
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.currentStreak}</div>
              <div className="text-white/60 text-sm">Day streak</div>
            </div>
          </Card>

          <Card className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/20">
              <Clock className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.longestFast}h</div>
              <div className="text-white/60 text-sm">Longest fast</div>
            </div>
          </Card>

          <Card className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20">
              <Target className="h-6 w-6 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.successRate}%</div>
              <div className="text-white/60 text-sm">Success rate</div>
            </div>
          </Card>

          <Card className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20">
              <Award className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalCompleted}</div>
              <div className="text-white/60 text-sm">Completed fasts</div>
            </div>
          </Card>
        </div>

        {/* Weekly Chart */}
        <Card variant="elevated" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Weekly Overview
            </h2>
            <div className="text-white/60 text-sm">
              Total: {stats.weeklyTotal}h this week
            </div>
          </div>

          <div className="space-y-4">
            {weeklyChartData.map((day, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium text-sm">{day.day}</span>
                  <span className="text-white/60 text-sm">{day.hours}h</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(day.hours / maxHours) * 100}%` }}
                  />
                </div>
                <div className="text-white/40 text-xs">{day.date}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Analysis */}
          <Card className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Time Analysis
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Weekly average</span>
                <span className="font-semibold text-white">{stats.weeklyAverage}h/day</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">Monthly average</span>
                <span className="font-semibold text-white">{stats.monthlyAverage}h/day</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <span className="text-white/70">This month total</span>
                <span className="font-semibold text-white">{stats.monthlyTotal}h</span>
              </div>
            </div>
          </Card>

          {/* Mood Trends */}
          <Card className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Zap className="h-5 w-5 mr-2 text-secondary" />
              Mood Trends
            </h3>

            {journalEntries.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Positive</span>
                    <span className="font-semibold text-green-400">{moodTrends.positive}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full"
                      style={{ width: `${moodTrends.positive}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Neutral</span>
                    <span className="font-semibold text-blue-400">{moodTrends.neutral}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full"
                      style={{ width: `${moodTrends.neutral}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Challenging</span>
                    <span className="font-semibold text-yellow-400">{moodTrends.negative}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${moodTrends.negative}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                  <p className="text-secondary text-xs">
                    Based on your last {Math.min(journalEntries.length, 7)} journal entries
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="text-4xl">📝</div>
                <p className="text-white/60 text-sm">
                  Start journaling to track your mood trends
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Achievements */}
        <Card variant="elevated" className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Award className="h-5 w-5 mr-2 text-secondary" />
            Achievements
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${stats.currentStreak >= 7 ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
              <div className="text-center space-y-2">
                <div className="text-2xl">🔥</div>
                <div className="font-semibold text-white">Week Warrior</div>
                <div className="text-white/60 text-sm">
                  {stats.currentStreak >= 7 ? 'Unlocked!' : `${stats.currentStreak}/7 days`}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${stats.longestFast >= 24 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10'}`}>
              <div className="text-center space-y-2">
                <div className="text-2xl">⏰</div>
                <div className="font-semibold text-white">Time Master</div>
                <div className="text-white/60 text-sm">
                  {stats.longestFast >= 24 ? 'Unlocked!' : `${stats.longestFast}/24 hours`}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${stats.totalCompleted >= 10 ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/10'}`}>
              <div className="text-center space-y-2">
                <div className="text-2xl">🏆</div>
                <div className="font-semibold text-white">Consistency King</div>
                <div className="text-white/60 text-sm">
                  {stats.totalCompleted >= 10 ? 'Unlocked!' : `${stats.totalCompleted}/10 fasts`}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}