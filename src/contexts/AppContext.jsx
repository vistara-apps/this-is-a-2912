import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  doc
} from 'firebase/firestore'
import { db } from '../config/firebase'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

const initialState = {
  fastingSessions: [],
  journalEntries: [],
  currentFast: null,
  isTimerRunning: false,
  dailyCheckIn: null,
  loading: false,
  error: null
}

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_FASTING_SESSIONS':
      return { ...state, fastingSessions: action.payload }
    case 'SET_JOURNAL_ENTRIES':
      return { ...state, journalEntries: action.payload }
    case 'SET_CURRENT_FAST':
      return { ...state, currentFast: action.payload }
    case 'SET_TIMER_RUNNING':
      return { ...state, isTimerRunning: action.payload }
    case 'SET_DAILY_CHECKIN':
      return { ...state, dailyCheckIn: action.payload }
    case 'ADD_FASTING_SESSION':
      return { 
        ...state, 
        fastingSessions: [action.payload, ...state.fastingSessions] 
      }
    case 'ADD_JOURNAL_ENTRY':
      return { 
        ...state, 
        journalEntries: [action.payload, ...state.journalEntries] 
      }
    default:
      return state
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const { currentUser } = useAuth()

  // Subscribe to fasting sessions
  useEffect(() => {
    if (!currentUser) return

    const q = query(
      collection(db, 'fastingSessions'),
      where('userId', '==', currentUser.uid),
      orderBy('startTime', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      dispatch({ type: 'SET_FASTING_SESSIONS', payload: sessions })
    })

    return unsubscribe
  }, [currentUser])

  // Subscribe to journal entries
  useEffect(() => {
    if (!currentUser) return

    const q = query(
      collection(db, 'journalEntries'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: entries })
    })

    return unsubscribe
  }, [currentUser])

  const startFastingSession = async (planDetails) => {
    if (!currentUser) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const sessionData = {
        userId: currentUser.uid,
        startTime: new Date().toISOString(),
        endTime: null,
        duration: null,
        status: 'active',
        planDetails,
        createdAt: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'fastingSessions'), sessionData)
      
      const sessionWithId = {
        id: docRef.id,
        ...sessionData
      }
      
      dispatch({ type: 'SET_CURRENT_FAST', payload: sessionWithId })
      dispatch({ type: 'SET_TIMER_RUNNING', payload: true })
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const endFastingSession = async () => {
    if (!state.currentFast) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const endTime = new Date().toISOString()
      const startTime = new Date(state.currentFast.startTime)
      const duration = Math.floor((new Date(endTime) - startTime) / (1000 * 60 * 60)) // hours

      const sessionRef = doc(db, 'fastingSessions', state.currentFast.id)
      await updateDoc(sessionRef, {
        endTime,
        duration,
        status: 'completed',
        updatedAt: new Date().toISOString()
      })

      dispatch({ type: 'SET_CURRENT_FAST', payload: null })
      dispatch({ type: 'SET_TIMER_RUNNING', payload: false })
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const addJournalEntry = async (entryData) => {
    if (!currentUser) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const journalData = {
        userId: currentUser.uid,
        timestamp: new Date().toISOString(),
        ...entryData
      }

      await addDoc(collection(db, 'journalEntries'), journalData)
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const value = {
    ...state,
    dispatch,
    startFastingSession,
    endFastingSession,
    addJournalEntry
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}