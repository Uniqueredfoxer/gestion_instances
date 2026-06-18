'use client'

import { useAuth } from '@/app/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { 
  CheckSquare, 
  Clock,
  Award,
  TrendingUp,
  FileText,
  Calendar,
  AlertCircle,
  Play,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

// Mock data
const stats = {
  assignedTasks: 12,
  completedTasks: 8,
  inProgressTasks: 3,
  pendingTasks: 1,
  completionRate: 67,
  onTimeRate: 85,
  activeDossiers: 4,
  totalHoursLogged: 42.5,
}

const tasks = [
  { 
    id: 1, 
    title: 'Review Q3 budget proposals', 
    status: 'In Progress', 
    priority: 'High',
    due: '2026-06-20',
    dossier: 'DT-2026-0089',
    progress: 60
  },
  { 
    id: 2, 
    title: 'Update employee handbook', 
    status: 'Not Started', 
    priority: 'Medium',
    due: '2026-07-01',
    dossier: 'DT-2026-0092',
    progress: 0
  },
  { 
    id: 3, 
    title: 'Complete security audit', 
    status: 'Waiting Validation', 
    priority: 'Critical',
    due: '2026-06-15',
    dossier: 'DT-2026-0076',
    progress: 95
  },
  { 
    id: 4, 
    title: 'Prepare monthly report', 
    status: 'Completed', 
    priority: 'Medium',
    due: '2026-06-05',
    dossier: 'DT-2026-0083',
    progress: 100
  },
]

const recentActivity = [
  { id: 1, action: 'Completed task: Review Q3 reports', time: '2 hours ago' },
  { id: 2, action: 'Updated dossier DT-2026-0089', time: '4 hours ago' },
  { id: 3, action: 'Logged 2.5 hours on security audit', time: '5 hours ago' },
]

export default function AgentDashboard() {
  const { user } = useAuth();
    console.log(user)

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            My Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.prenom}! Here's your task overview
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="sm">
            <Play className="w-4 h-4 mr-2" />
            Start New Task
          </Button>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assigned Tasks</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.assignedTasks}</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <CheckSquare className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-success-500 mt-1">{stats.completionRate}%</p>
                <p className="text-xs text-success-500 mt-1">↑ 8% this month</p>
              </div>
              <div className="p-3 bg-success-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-warning-500 mt-1">{stats.inProgressTasks}</p>
              </div>
              <div className="p-3 bg-warning-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-warning-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hours Logged</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.totalHoursLogged}h</p>
                <p className="text-xs text-muted-foreground mt-1">This week</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <Clock className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="p-3 rounded-lg bg-muted">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          task.priority === 'Critical' && "bg-error-500/10 text-error-500",
                          task.priority === 'High' && "bg-warning-500/10 text-warning-500",
                          task.priority === 'Medium' && "bg-primary-50 text-primary-600"
                        )}>
                          {task.priority}
                        </span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          task.status === 'Completed' && "bg-success-500/10 text-success-500",
                          task.status === 'In Progress' && "bg-warning-500/10 text-warning-500",
                          task.status === 'Not Started' && "bg-muted-foreground/10 text-muted-foreground",
                          task.status === 'Waiting Validation' && "bg-primary-50 text-primary-600"
                        )}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground mt-1">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {task.dossier} • Due: {task.due}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-600 rounded-full transition-all duration-500"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{task.progress}%</span>
                      </div>
                      {task.status !== 'Completed' && (
                        <Button size="sm" variant="outline" className="mt-2">
                          Update
                        </Button>
                      )}
                      {task.status === 'Completed' && (
                        <CheckCircle className="w-5 h-5 text-success-500 mt-2" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="link" className="w-full mt-4 text-sm">
              View All Tasks
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">On-Time Rate</p>
                  <p className="text-2xl font-bold text-success-500 mt-1">{stats.onTimeRate}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Active Dossiers</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stats.activeDossiers}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Tasks Alert */}
          {stats.pendingTasks > 0 && (
            <Card className="border-warning-500/20 bg-warning-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning-500" />
                  <div>
                    <p className="text-sm font-medium text-warning-500">Pending Tasks</p>
                    <p className="text-xs text-muted-foreground">
                      You have {stats.pendingTasks} task awaiting your attention
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}