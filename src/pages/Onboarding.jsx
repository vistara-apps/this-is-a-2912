import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { generateFastingPlan } from '../config/openai'
import { ChevronRight, ChevronLeft } from 'lucide-react'

const steps = [
  { title: 'Basic Information', description: 'Tell us about yourself' },
  { title: 'Health Goals', description: 'What do you want to achieve?' },
  { title: 'Schedule Preferences', description: 'When do you sleep and wake?' },
  { title: 'Your Plan', description: 'AI-generated fasting schedule' }
]

export const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weight: '',
    goal: '',
    sleepTime: '',
    wakeTime: ''
  })
  const [generatedPlan, setGeneratedPlan] = useState(null)
  
  const { updateUserProfile } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = async () => {
    if (currentStep === 2) {
      // Generate AI plan
      setLoading(true)
      try {
        const plan = await generateFastingPlan(formData)
        setGeneratedPlan(plan)
        setCurrentStep(currentStep + 1)
      } catch (error) {
        console.error('Failed to generate plan:', error)
      } finally {
        setLoading(false)
      }
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      await updateUserProfile({
        ...formData,
        currentFastingPlan: generatedPlan,
        onboardingCompleted: true
      })
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.age && formData.gender && formData.weight
      case 1:
        return formData.goal
      case 2:
        return formData.sleepTime && formData.wakeTime
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-primary text-white' 
                    : 'bg-white/10 text-white/50'
                }`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-1 mx-2 ${
                    index < currentStep ? 'bg-primary' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">
              {steps[currentStep].title}
            </h2>
            <p className="text-white/70">
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        <Card className="space-y-6">
          {/* Step Content */}
          {currentStep === 0 && (
            <div className="space-y-6">
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
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-white/80">
                What's your primary goal?
              </label>
              
              {['Fat Loss', 'Increased Energy', 'Gut Health', 'Mental Clarity', 'General Wellness'].map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleInputChange('goal', goal)}
                  className={`w-full p-4 rounded-lg text-left transition-all duration-150 ${
                    formData.goal === goal
                      ? 'bg-primary text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
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
            </div>
          )}

          {currentStep === 3 && generatedPlan && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-white">
                  Your Personalized Plan
                </h3>
                <div className="text-4xl font-bold text-accent">
                  {generatedPlan.fastingHours}:{generatedPlan.eatingHours}
                </div>
                <p className="text-white/80">
                  {generatedPlan.schedule}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-2">
                  <p className="text-white/70">Eating Window</p>
                  <p className="text-lg font-semibold text-white">
                    {generatedPlan.startTime} - {generatedPlan.endTime}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-white/70">Fasting Duration</p>
                  <p className="text-lg font-semibold text-white">
                    {generatedPlan.fastingHours} hours
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-white">Why this works for you:</h4>
                <p className="text-white/80 text-sm">{generatedPlan.rationale}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-white">Tips to get started:</h4>
                <ul className="space-y-2">
                  {generatedPlan.tips.map((tip, index) => (
                    <li key={index} className="text-white/80 text-sm flex items-start">
                      <span className="text-accent mr-2">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid() || loading}
                className="flex items-center space-x-2"
              >
                <span>{loading ? 'Generating...' : 'Next'}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <span>{loading ? 'Saving...' : 'Complete Setup'}</span>
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}