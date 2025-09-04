import React, { useState, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import { AppShell } from '../components/ui/AppShell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { transcribeAudio, analyzeMood } from '../config/openai'
import { 
  Mic, 
  MicOff, 
  Send, 
  BookOpen,
  Calendar,
  Smile,
  Meh,
  Frown
} from 'lucide-react'
import { format } from 'date-fns'

export const Journal = () => {
  const { journalEntries, addJournalEntry } = useApp()
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [transcription, setTranscription] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedMood, setSelectedMood] = useState('')
  const [loading, setLoading] = useState(false)
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const moodOptions = [
    { value: 'positive', icon: Smile, label: 'Great', color: 'text-green-400' },
    { value: 'neutral', icon: Meh, label: 'Okay', color: 'text-blue-400' },
    { value: 'negative', icon: Frown, label: 'Tough', color: 'text-yellow-400' },
  ]

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleTranscribe = async () => {
    if (!audioBlob) return

    setLoading(true)
    try {
      const text = await transcribeAudio(audioBlob)
      setTranscription(text)
    } catch (error) {
      console.error('Transcription error:', error)
      setTranscription('Could not transcribe audio. Please try again or enter text manually.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const entryText = transcription || notes
    if (!entryText.trim() && !selectedMood) return

    setLoading(true)
    try {
      let moodAnalysis = null
      
      if (entryText.trim()) {
        moodAnalysis = await analyzeMood(entryText)
      }

      const entryData = {
        mood: selectedMood || moodAnalysis?.mood || 'neutral',
        notes: entryText.trim(),
        transcribedText: transcription,
        moodAnalysis,
        voiceRecordingUrl: audioBlob ? 'blob-data' : null // In real app, upload to Firebase Storage
      }

      await addJournalEntry(entryData)
      
      // Reset form
      setTranscription('')
      setNotes('')
      setSelectedMood('')
      setAudioBlob(null)
      
    } catch (error) {
      console.error('Error saving journal entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMoodIcon = (mood) => {
    const option = moodOptions.find(opt => opt.value === mood)
    return option ? option.icon : Meh
  }

  const getMoodColor = (mood) => {
    const option = moodOptions.find(opt => opt.value === mood)
    return option ? option.color : 'text-blue-400'
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Journal
          </h1>
          <p className="text-white/70">
            Record your thoughts and track how fasting affects your well-being
          </p>
        </div>

        {/* Journal Entry Form */}
        <Card variant="elevated" className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            New Entry
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mood Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/80">
                How are you feeling?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => setSelectedMood(mood.value)}
                    className={`p-4 rounded-lg border transition-all duration-150 ${
                      selectedMood === mood.value
                        ? 'border-primary bg-primary/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center space-y-2">
                      <mood.icon className={`h-8 w-8 mx-auto ${mood.color}`} />
                      <div className="text-white text-sm font-medium">{mood.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Recording */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-white/80">
                Voice Recording (Optional)
              </label>
              
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant={isRecording ? "secondary" : "outline"}
                  onClick={isRecording ? stopRecording : startRecording}
                  className="flex items-center space-x-2"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      <span>Stop Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      <span>Start Recording</span>
                    </>
                  )}
                </Button>

                {audioBlob && !transcription && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTranscribe}
                    disabled={loading}
                  >
                    {loading ? 'Transcribing...' : 'Transcribe'}
                  </Button>
                )}
              </div>

              {isRecording && (
                <div className="flex items-center space-x-2 text-red-400">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Recording in progress...</span>
                </div>
              )}
            </div>

            {/* Transcription Display */}
            {transcription && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">
                  Transcription
                </label>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/80 text-sm">{transcription}</p>
                </div>
              </div>
            )}

            {/* Manual Notes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did your fast go? Any insights or feelings to record..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={loading || (!transcription && !notes.trim() && !selectedMood)}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Entry'}
            </Button>
          </form>
        </Card>

        {/* Recent Entries */}
        <Card className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Entries
          </h2>

          {journalEntries.length > 0 ? (
            <div className="space-y-4">
              {journalEntries.slice(0, 10).map((entry) => {
                const MoodIcon = getMoodIcon(entry.mood)
                return (
                  <div 
                    key={entry.id} 
                    className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MoodIcon className={`h-5 w-5 ${getMoodColor(entry.mood)}`} />
                        <span className="text-white/80 text-sm font-medium">
                          {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                        </span>
                      </div>
                      <span className="text-white/60 text-sm">
                        {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
                      </span>
                    </div>

                    {entry.notes && (
                      <p className="text-white/80 text-sm">{entry.notes}</p>
                    )}

                    {entry.moodAnalysis?.summary && (
                      <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                        <p className="text-accent text-xs">
                          AI Insight: {entry.moodAnalysis.summary}
                        </p>
                      </div>
                    )}

                    {entry.voiceRecordingUrl && (
                      <div className="flex items-center space-x-2 text-white/60">
                        <Mic className="h-4 w-4" />
                        <span className="text-xs">Voice recording available</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center space-y-4 py-8">
              <div className="text-6xl">📖</div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">No entries yet</h3>
                <p className="text-white/60 text-sm">
                  Start journaling to track your fasting journey and mood patterns
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  )
}