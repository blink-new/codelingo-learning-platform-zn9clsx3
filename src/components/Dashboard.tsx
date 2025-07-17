import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'
import { 
  Code2, 
  Database, 
  FileCode, 
  Flame, 
  Trophy, 
  Heart,
  Star,
  Zap,
  Target,
  Calendar,
  Info
} from 'lucide-react'
import { blink } from '../lib/blink'

interface UserProgress {
  id: string
  userId: string
  language: string
  xp: number
  streak: number
  hearts: number
  level: number
  lessonsCompleted: number
  totalLessons: number
  lastActive: string
}

interface Course {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  totalLessons: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
}

const courses: Course[] = [
  {
    id: 'react',
    name: 'React',
    description: 'Learn modern React development with hooks, components, and state management',
    icon: <Code2 className="w-8 h-8" />,
    color: 'bg-blue-500',
    totalLessons: 45,
    difficulty: 'Intermediate'
  },
  {
    id: 'sql',
    name: 'SQL',
    description: 'Master database queries, joins, and data manipulation',
    icon: <Database className="w-8 h-8" />,
    color: 'bg-green-500',
    totalLessons: 35,
    difficulty: 'Beginner'
  },
  {
    id: 'python',
    name: 'Python',
    description: 'Build applications with Python fundamentals and advanced concepts',
    icon: <FileCode className="w-8 h-8" />,
    color: 'bg-yellow-500',
    totalLessons: 50,
    difficulty: 'Beginner'
  }
]

export default function Dashboard({ onStartLesson }: { onStartLesson: (courseId: string) => void }) {
  const [user, setUser] = useState<any>(null)
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      if (state.user) {
        loadUserProgress(state.user.id)
      }
    })
    
    return unsubscribe
  }, [])

  const loadUserProgress = async (userId: string) => {
    try {
      const progress = await blink.db.userProgress.list({
        where: { userId },
        orderBy: { lastActive: 'desc' }
      })
      setUserProgress(progress)
    } catch (error) {
      console.error('Failed to load user progress:', error)
      // Fallback to localStorage for demo purposes
      const localProgress = localStorage.getItem(`userProgress_${userId}`)
      if (localProgress) {
        setUserProgress(JSON.parse(localProgress))
      } else {
        // Initialize with default progress for demo
        const defaultProgress: UserProgress[] = [
          {
            id: 'demo-react',
            userId,
            language: 'react',
            xp: 45,
            streak: 3,
            hearts: 5,
            level: 2,
            lessonsCompleted: 3,
            totalLessons: 45,
            lastActive: new Date().toISOString()
          },
          {
            id: 'demo-sql',
            userId,
            language: 'sql',
            xp: 25,
            streak: 1,
            hearts: 4,
            level: 1,
            lessonsCompleted: 2,
            totalLessons: 35,
            lastActive: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          }
        ]
        setUserProgress(defaultProgress)
        localStorage.setItem(`userProgress_${userId}`, JSON.stringify(defaultProgress))
      }
    }
  }

  const getProgressForCourse = (courseId: string): UserProgress | null => {
    return userProgress.find(p => p.language === courseId) || null
  }

  const getTotalXP = () => {
    return userProgress.reduce((total, progress) => total + progress.xp, 0)
  }

  const getCurrentStreak = () => {
    return Math.max(...userProgress.map(p => p.streak), 0)
  }

  const getTotalHearts = () => {
    return Math.max(...userProgress.map(p => p.hearts), 5)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your learning journey...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Code2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome to CodeLingo</CardTitle>
            <CardDescription>
              Sign in to start your coding journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => blink.auth.login()} 
              className="w-full"
              size="lg"
            >
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">CodeLingo</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Streak */}
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-orange-600">{getCurrentStreak()}</span>
              </div>
              
              {/* Hearts */}
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500 fill-current" />
                <span className="font-semibold text-red-600">{getTotalHearts()}</span>
              </div>
              
              {/* XP */}
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-yellow-600">{getTotalXP()} XP</span>
              </div>
              
              {/* Profile */}
              <Avatar>
                <AvatarFallback className="bg-primary text-white">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600">
            Continue your coding journey and level up your skills
          </p>
        </div>

        {/* Demo Mode Notice */}
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Demo Mode Active</p>
                <p className="text-sm opacity-90">Your progress is saved locally. Database will be connected soon for persistent storage.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Challenge Banner */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Daily Challenge</h3>
                <p className="opacity-90">Complete today's challenge to earn bonus XP!</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-1" />
                  <p className="text-sm">+50 XP</p>
                </div>
                <Button variant="secondary" size="lg">
                  Start Challenge
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const progress = getProgressForCourse(course.id)
            const progressPercentage = progress 
              ? (progress.lessonsCompleted / progress.totalLessons) * 100 
              : 0

            return (
              <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${course.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                      {course.icon}
                    </div>
                    <Badge variant="secondary">{course.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-xl">{course.name}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  {progress ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{progress.lessonsCompleted}/{progress.totalLessons} lessons</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>Level {progress.level}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span>{progress.xp} XP</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => onStartLesson(course.id)}
                        className="w-full"
                        size="lg"
                      >
                        Continue Learning
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center py-4">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Ready to start?</p>
                      </div>
                      
                      <Button 
                        onClick={() => onStartLesson(course.id)}
                        className="w-full"
                        size="lg"
                      >
                        Start Course
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stats Section */}
        {userProgress.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{getTotalXP()}</p>
                  <p className="text-sm text-gray-600">Total XP Earned</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{getCurrentStreak()}</p>
                  <p className="text-sm text-gray-600">Day Streak</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{userProgress.reduce((total, p) => total + p.lessonsCompleted, 0)}</p>
                  <p className="text-sm text-gray-600">Lessons Completed</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
