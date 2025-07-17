import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'
import { 
  ArrowLeft, 
  Heart, 
  Zap, 
  Check, 
  X, 
  Play,
  RotateCcw,
  Lightbulb,
  Code2
} from 'lucide-react'
import { blink } from '../lib/blink'

interface Lesson {
  id: string
  courseId: string
  title: string
  type: 'multiple-choice' | 'code-completion' | 'drag-drop' | 'code-writing'
  question: string
  code?: string
  options?: string[]
  correctAnswer: string | number
  explanation: string
  xpReward: number
  difficulty: 'easy' | 'medium' | 'hard'
}

interface LessonInterfaceProps {
  courseId: string
  onBack: () => void
}

// Sample lessons data
const sampleLessons: Record<string, Lesson[]> = {
  react: [
    {
      id: 'react-1',
      courseId: 'react',
      title: 'React Components Basics',
      type: 'multiple-choice',
      question: 'What is the correct way to create a functional component in React?',
      options: [
        'function MyComponent() { return <div>Hello</div>; }',
        'const MyComponent = () => { return <div>Hello</div>; }',
        'class MyComponent extends Component { render() { return <div>Hello</div>; } }',
        'Both A and B are correct'
      ],
      correctAnswer: 3,
      explanation: 'Both function declarations and arrow functions are valid ways to create functional components in React.',
      xpReward: 10,
      difficulty: 'easy'
    },
    {
      id: 'react-2',
      courseId: 'react',
      title: 'JSX Syntax',
      type: 'code-completion',
      question: 'Complete the JSX code to render a button with click handler:',
      code: `function Button() {
  const handleClick = () => {
    alert('Clicked!');
  };
  
  return (
    <button ___={handleClick}>
      Click me
    </button>
  );
}`,
      correctAnswer: 'onClick',
      explanation: 'The onClick prop is used to handle click events in React JSX.',
      xpReward: 15,
      difficulty: 'easy'
    },
    {
      id: 'react-3',
      courseId: 'react',
      title: 'State Management',
      type: 'code-writing',
      question: 'Write a React component that manages a counter state with increment and decrement buttons:',
      correctAnswer: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
}`,
      explanation: 'This component uses the useState hook to manage counter state and provides buttons to increment and decrement the value.',
      xpReward: 25,
      difficulty: 'medium'
    }
  ],
  sql: [
    {
      id: 'sql-1',
      courseId: 'sql',
      title: 'Basic SELECT Query',
      type: 'multiple-choice',
      question: 'Which SQL statement is used to retrieve data from a database?',
      options: ['GET', 'SELECT', 'RETRIEVE', 'FETCH'],
      correctAnswer: 1,
      explanation: 'SELECT is the SQL statement used to query and retrieve data from database tables.',
      xpReward: 10,
      difficulty: 'easy'
    },
    {
      id: 'sql-2',
      courseId: 'sql',
      title: 'WHERE Clause',
      type: 'code-completion',
      question: 'Complete the SQL query to select users older than 18:',
      code: `SELECT * FROM users
_____ age > 18;`,
      correctAnswer: 'WHERE',
      explanation: 'The WHERE clause is used to filter records based on specified conditions.',
      xpReward: 15,
      difficulty: 'easy'
    }
  ],
  python: [
    {
      id: 'python-1',
      courseId: 'python',
      title: 'Python Variables',
      type: 'multiple-choice',
      question: 'Which of the following is a valid Python variable name?',
      options: ['2variable', 'my-variable', 'my_variable', 'class'],
      correctAnswer: 2,
      explanation: 'Python variable names can contain letters, numbers, and underscores, but cannot start with a number or use hyphens.',
      xpReward: 10,
      difficulty: 'easy'
    },
    {
      id: 'python-2',
      courseId: 'python',
      title: 'Python Functions',
      type: 'code-writing',
      question: 'Write a Python function that takes two numbers and returns their sum:',
      correctAnswer: `def add_numbers(a, b):
    return a + b`,
      explanation: 'This function uses the def keyword to define a function that takes two parameters and returns their sum.',
      xpReward: 20,
      difficulty: 'easy'
    }
  ]
}

export default function LessonInterface({ courseId, onBack }: LessonInterfaceProps) {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState<string | number>('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [hearts, setHearts] = useState(5)
  const [xp, setXp] = useState(0)
  const [user, setUser] = useState<any>(null)

  const lessons = sampleLessons[courseId] || []
  const currentLesson = lessons[currentLessonIndex]

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
    })
    return unsubscribe
  }, [])

  const handleSubmit = () => {
    if (!currentLesson) return

    const correct = userAnswer === currentLesson.correctAnswer
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setXp(prev => prev + currentLesson.xpReward)
      // Save progress to database
      saveProgress(true)
    } else {
      setHearts(prev => Math.max(0, prev - 1))
      saveProgress(false)
    }
  }

  const saveProgress = async (correct: boolean) => {
    if (!user) return

    try {
      // Update user progress in database
      const existingProgress = await blink.db.userProgress.list({
        where: { userId: user.id, language: courseId }
      })

      if (existingProgress.length > 0) {
        const progress = existingProgress[0]
        await blink.db.userProgress.update(progress.id, {
          xp: progress.xp + (correct ? currentLesson.xpReward : 0),
          hearts: correct ? progress.hearts : Math.max(0, progress.hearts - 1),
          lessonsCompleted: correct ? progress.lessonsCompleted + 1 : progress.lessonsCompleted,
          lastActive: new Date().toISOString()
        })
      } else {
        await blink.db.userProgress.create({
          userId: user.id,
          language: courseId,
          xp: correct ? currentLesson.xpReward : 0,
          streak: 1,
          hearts: correct ? 5 : 4,
          level: 1,
          lessonsCompleted: correct ? 1 : 0,
          totalLessons: lessons.length,
          lastActive: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  const handleNext = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1)
      setUserAnswer('')
      setShowResult(false)
      setIsCorrect(false)
    } else {
      // Course completed
      onBack()
    }
  }

  const handleRetry = () => {
    setUserAnswer('')
    setShowResult(false)
    setIsCorrect(false)
  }

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">No lessons available</h2>
            <p className="text-gray-600 mb-6">This course is coming soon!</p>
            <Button onClick={onBack}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progressPercentage = ((currentLessonIndex + 1) / lessons.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1 max-w-md">
                <Progress value={progressPercentage} className="h-3" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {currentLessonIndex + 1}/{lessons.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500 fill-current" />
                <span className="font-semibold text-red-600">{hearts}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-yellow-600">{xp} XP</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{currentLesson.title}</CardTitle>
              <Badge variant={currentLesson.difficulty === 'easy' ? 'secondary' : currentLesson.difficulty === 'medium' ? 'default' : 'destructive'}>
                {currentLesson.difficulty}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <p className="text-lg font-medium">{currentLesson.question}</p>

              {/* Multiple Choice */}
              {currentLesson.type === 'multiple-choice' && currentLesson.options && (
                <div className="space-y-3">
                  {currentLesson.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={userAnswer === index ? "default" : "outline"}
                      className="w-full text-left justify-start h-auto p-4"
                      onClick={() => setUserAnswer(index)}
                      disabled={showResult}
                    >
                      <span className="mr-3 font-mono">{String.fromCharCode(65 + index)}.</span>
                      <span className="code-font text-sm">{option}</span>
                    </Button>
                  ))}
                </div>
              )}

              {/* Code Completion */}
              {currentLesson.type === 'code-completion' && currentLesson.code && (
                <div className="space-y-4">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{currentLesson.code.replace('___', `___`)}</pre>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Fill in the blank:</span>
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                      placeholder="Type your answer..."
                      disabled={showResult}
                    />
                  </div>
                </div>
              )}

              {/* Code Writing */}
              {currentLesson.type === 'code-writing' && (
                <div className="space-y-4">
                  <Textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Write your code here..."
                    className="font-mono text-sm min-h-[200px]"
                    disabled={showResult}
                  />
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Code2 className="w-4 h-4" />
                    <span>Write clean, readable code</span>
                  </div>
                </div>
              )}

              {/* Result */}
              {showResult && (
                <Card className={`border-2 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                        {isCorrect ? <Check className="w-5 h-5 text-white" /> : <X className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                          {isCorrect ? 'Correct!' : 'Incorrect'}
                        </h3>
                        <p className={`text-sm mt-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {currentLesson.explanation}
                        </p>
                        {isCorrect && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium text-yellow-600">+{currentLesson.xpReward} XP</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Hint
                  </Button>
                </div>

                <div className="flex space-x-2">
                  {showResult ? (
                    <>
                      {!isCorrect && (
                        <Button variant="outline" onClick={handleRetry}>
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                      )}
                      <Button onClick={handleNext}>
                        {currentLessonIndex < lessons.length - 1 ? 'Next' : 'Complete'}
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={handleSubmit}
                      disabled={!userAnswer}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Submit
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}