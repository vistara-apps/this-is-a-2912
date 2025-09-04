import React, { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import { Mic, MicOff, Square, Play, Pause, Trash2 } from 'lucide-react'
import { Button } from './Button'

export const VoiceRecorder = ({ 
  onRecordingComplete,
  onTranscriptionComplete,
  className,
  maxDuration = 300, // 5 minutes default
  ...props 
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [error, setError] = useState(null)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const audioRef = useRef(null)
  const timerRef = useRef(null)
  const streamRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // Timer for recording duration
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording, isPaused, maxDuration])

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })
      
      streamRef.current = stream
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        
        setAudioBlob(audioBlob)
        setAudioUrl(url)
        
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob)
        }
        
        // Cleanup stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorderRef.current.start(1000) // Collect data every second
      setIsRecording(true)
      setDuration(0)
    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Could not access microphone. Please check permissions.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
    }
  }

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setCurrentTime(0)
    setIsPlaying(false)
    setError(null)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getWaveformBars = () => {
    // Simple animated waveform visualization
    const bars = []
    for (let i = 0; i < 20; i++) {
      const height = isRecording && !isPaused 
        ? Math.random() * 100 + 20 
        : 20
      bars.push(
        <div
          key={i}
          className={clsx(
            'bg-accent rounded-full transition-all duration-150',
            isRecording && !isPaused && 'animate-pulse'
          )}
          style={{
            width: '3px',
            height: `${height}%`,
            animationDelay: `${i * 50}ms`
          }}
        />
      )
    }
    return bars
  }

  return (
    <div className={clsx('space-y-4', className)} {...props}>
      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-4">
        {!isRecording && !audioBlob && (
          <Button
            onClick={startRecording}
            size="lg"
            className="flex items-center space-x-2"
          >
            <Mic className="h-5 w-5" />
            <span>Start Recording</span>
          </Button>
        )}

        {isRecording && (
          <>
            <Button
              onClick={pauseRecording}
              variant="secondary"
              size="lg"
              className="flex items-center space-x-2"
            >
              {isPaused ? (
                <>
                  <Play className="h-5 w-5" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="h-5 w-5" />
                  <span>Pause</span>
                </>
              )}
            </Button>

            <Button
              onClick={stopRecording}
              variant="outline"
              size="lg"
              className="flex items-center space-x-2"
            >
              <Square className="h-5 w-5" />
              <span>Stop</span>
            </Button>
          </>
        )}
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">
              {isPaused ? 'Paused' : 'Recording'}
            </span>
          </div>
          
          <div className="text-2xl font-bold text-white">
            {formatTime(duration)}
          </div>

          {/* Waveform Visualization */}
          <div className="flex items-end justify-center space-x-1 h-16">
            {getWaveformBars()}
          </div>

          <div className="text-white/60 text-sm">
            Max duration: {formatTime(maxDuration)}
          </div>
        </div>
      )}

      {/* Playback Controls */}
      {audioBlob && !isRecording && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-white mb-2">
              Recording Complete
            </div>
            <div className="text-white/60 text-sm">
              Duration: {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={playAudio}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Play</span>
                </>
              )}
            </Button>

            <Button
              onClick={deleteRecording}
              variant="outline"
              className="flex items-center space-x-2 text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>

            <Button
              onClick={startRecording}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Mic className="h-4 w-4" />
              <span>Record Again</span>
            </Button>
          </div>

          {/* Hidden audio element for playback */}
          <audio
            ref={audioRef}
            src={audioUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}

export default VoiceRecorder
