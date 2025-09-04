import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
})

export const generateFastingPlan = async (userProfile) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'system',
          content: `You are a professional intermittent fasting coach. Create personalized fasting schedules based on user data. Respond with a JSON object containing:
          {
            "fastingHours": number,
            "eatingHours": number,
            "schedule": "description",
            "startTime": "HH:MM",
            "endTime": "HH:MM",
            "rationale": "explanation",
            "tips": ["tip1", "tip2", "tip3"]
          }`
        },
        {
          role: 'user',
          content: `Create a fasting plan for: Age: ${userProfile.age}, Gender: ${userProfile.gender}, Weight: ${userProfile.weight}kg, Goal: ${userProfile.goal}, Wake time: ${userProfile.wakeTime}, Sleep time: ${userProfile.sleepTime}`
        }
      ],
      temperature: 0.7,
    })

    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error('Error generating fasting plan:', error)
    // Fallback plan
    return {
      fastingHours: 16,
      eatingHours: 8,
      schedule: "16:8 Intermittent Fasting",
      startTime: "12:00",
      endTime: "20:00",
      rationale: "A balanced approach suitable for beginners",
      tips: ["Stay hydrated during fasting", "Start with black coffee or tea", "Listen to your body"]
    }
  }
}

export const getChatbotResponse = async (userMessage, context) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'system',
          content: `You are a supportive intermittent fasting coach. Help users with their daily check-ins and provide encouraging advice. Keep responses concise and supportive. If the user reports challenges, provide practical suggestions.`
        },
        {
          role: 'user',
          content: `User context: ${JSON.stringify(context)}. User says: "${userMessage}"`
        }
      ],
      temperature: 0.8,
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('Error getting chatbot response:', error)
    return "I'm here to support you on your fasting journey. How are you feeling today?"
  }
}

export const transcribeAudio = async (audioBlob) => {
  try {
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper-1')

    const response = await openai.audio.transcriptions.create({
      file: audioBlob,
      model: 'whisper-1',
    })

    return response.text
  } catch (error) {
    console.error('Error transcribing audio:', error)
    return "Could not transcribe audio"
  }
}

export const analyzeMood = async (journalText) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'system',
          content: `Analyze the mood and sentiment of journal entries. Respond with a JSON object:
          {
            "mood": "positive/neutral/negative",
            "energy": "high/medium/low",
            "keywords": ["keyword1", "keyword2"],
            "summary": "brief insight"
          }`
        },
        {
          role: 'user',
          content: journalText
        }
      ],
      temperature: 0.3,
    })

    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error('Error analyzing mood:', error)
    return {
      mood: "neutral",
      energy: "medium",
      keywords: [],
      summary: "Unable to analyze mood"
    }
  }
}