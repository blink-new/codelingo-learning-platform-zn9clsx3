import { useState } from 'react'
import Dashboard from './components/Dashboard'
import LessonInterface from './components/LessonInterface'

type AppState = 'dashboard' | 'lesson'

function App() {
  const [currentView, setCurrentView] = useState<AppState>('dashboard')
  const [selectedCourse, setSelectedCourse] = useState<string>('')

  const handleStartLesson = (courseId: string) => {
    setSelectedCourse(courseId)
    setCurrentView('lesson')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    setSelectedCourse('')
  }

  return (
    <div className="min-h-screen">
      {currentView === 'dashboard' && (
        <Dashboard onStartLesson={handleStartLesson} />
      )}
      
      {currentView === 'lesson' && selectedCourse && (
        <LessonInterface 
          courseId={selectedCourse} 
          onBack={handleBackToDashboard} 
        />
      )}
    </div>
  )
}

export default App