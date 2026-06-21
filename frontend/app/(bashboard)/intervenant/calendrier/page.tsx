'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
    Calendar as CalendarIcon,
    Clock,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    CalendarRange,
    ListTodo,
    AlertCircle,
    Construction,
    Sparkles, 
    Bell,
    CirclePlus,
} from 'lucide-react'
import { useState } from 'react'

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [view, setView] = useState<'month' | 'week' | 'day'>('month')

    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

    const monthName = months[currentMonth.getMonth()]
    const year = currentMonth.getFullYear()

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    }

    const upcomingEvents: typeof Array[] = []
 
    const getEventTypeColor = (type: string) => {
        const colors = {
            deadline: 'bg-danger/10 text-danger border-danger/20',
            task: 'bg-primary/10 text-primary border-primary/20',
            meeting: 'bg-secondary/10 text-secondary border-secondary/20',
        }
        return colors[type as keyof typeof colors] || colors.task
    }

    const getEventIcon = (type: string) => {
        const icons = {
            deadline: <AlertCircle className="w-3 h-3" />,
            task: <ListTodo className="w-3 h-3" />,
            meeting: <Clock className="w-3 h-3" />,
        }
        return icons[type as keyof typeof icons] || icons.task
    }

    return (
        <div className="space-y-6 p-4 md:p-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
                        Mon Calendrier
                    </h1>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
                        Gérez vos échéances, tâches et rendez-vous
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <CalendarRange className="w-4 h-4" />
                        Vue d'ensemble
                    </Button>
                    <Button size="sm" className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Nouvel événement
                    </Button>
                </div>
            </div>


            <Card className="border-2 border-warning/20 bg-warning/5">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-warning/10 rounded-lg">
                            <Construction className="w-6 h-6 text-warning" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-text-primary dark:text-text-primary-dark flex items-center gap-2">
                                Calendrier en construction
                                <Sparkles className="w-4 h-4 text-warning" />
                            </h3>
                            <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
                                Le calendrier complet des intervenants est en cours de développement.
                                Les fonctionnalités suivantes seront disponibles prochainement :
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    Vue mois/semaine/jour avec navigation
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    Synchronisation avec les échéances des dossiers
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    Tâches planifiées et rappels automatiques
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    Export et intégration avec Outlook/Google Calendar
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                    Notifications en temps réel des changements
                                </li>
                            </ul>
                            <div className="mt-3 flex gap-2">
                                <Button size="sm" variant="outline" className="text-xs">
                                    Être notifié du lancement
                                </Button>
                                <Button size="sm" variant="ghost" className="text-xs">
                                    Voir la roadmap
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-primary" />
                                {monthName} {year}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={prevMonth}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs">
                                    Aujourd'hui
                                </Button>
                                <Button variant="outline" size="sm" onClick={nextMonth}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        
                        <div className="flex gap-2 mb-4">
                            {['month', 'week', 'day'].map((v) => (
                                <Button
                                    key={v}
                                    variant={view === v ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setView(v as 'month' | 'week' | 'day')}
                                    className="capitalize"
                                >
                                    {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Jour'}
                                </Button>
                            ))}
                        </div>

                        
                        <div className="relative">
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {days.map((day) => (
                                    <div key={day} className="text-center text-xs font-medium text-text-secondary py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: 35 }, (_, i) => {
                                    const day = i + 1
                                    const isToday = day === 15
                                    const hasEvent = [2, 5, 8, 12, 15, 18, 22, 25, 28].includes(day)

                                    return (
                                        <div
                                            key={i}
                                            className={`
                        aspect-square p-1 rounded-lg border border-border dark:border-border-dark
                        hover:bg-background dark:hover:bg-background-dark transition-colors cursor-pointer
                        ${isToday ? 'bg-primary/10 border-primary' : ''}
                        ${day > 30 ? 'opacity-30' : ''}
                      `}
                                        >
                                            <div className="flex flex-col items-center h-full">
                                                <span className={`
                          text-sm font-medium
                          ${isToday ? 'text-primary' : 'text-text-primary dark:text-text-primary-dark'}
                          ${day > 30 ? 'opacity-50' : ''}
                        `}>
                                                    {day}
                                                </span>
                                                {hasEvent && day <= 30 && (
                                                    <div className="flex gap-0.5 mt-auto">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-danger"></div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                    
                            <div className="absolute inset-0 bg-background/50 dark:bg-background-dark/50 backdrop-blur-[2px] flex items-center justify-center rounded-lg">
                                <div className="text-center p-6 bg-surface dark:bg-surface-dark rounded-xl shadow-lg border border-border dark:border-border-dark max-w-sm">
                                    <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Construction className="w-6 h-6 text-primary" />
                                    </div>
                                    <h4 className="font-semibold text-text-primary dark:text-text-primary-dark">
                                        Calendrier interactif en cours de développement
                                    </h4>
                                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-2">
                                        La vue complète du calendrier avec toutes les interactions sera disponible dans une prochaine version.
                                    </p>
                                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-text-secondary">
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
                                            Échéances
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                            Tâches
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                            Réunions
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Événements à venir
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 grow">
                        {upcomingEvents.length === 0 && (
                            <div className="text-center py-8 text-text-secondary">
                                <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Aucun événement pour le moment</p>
                            </div>
                        )}

                        <Button variant="outline" className="w-full mt-2">
                            Voir tous les événements
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </CardContent>
                </Card>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4 px-4">
                    <div className="p-2 bg-primary/10 text-primary rounded-md">
                        <CalendarIcon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <p className="font-medium text-text-primary">Synchroniser mon agenda</p>
                        <p className="text-xs text-text-secondary">Connecter à Outlook/Google</p>
                    </div>
                </Button>

                <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4 px-4">
                    <div className="p-2 bg-secondary/10 text-secondary rounded-md">
                        <ListTodo className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <p className="font-medium text-text-primary">Voir mes tâches</p>
                        <p className="text-xs text-text-secondary">Tâches planifiées et à venir</p>
                    </div>
                </Button>

                <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4 px-4">
                    <div className="p-2 bg-success/10 text-success rounded-md">
                        <Bell className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <p className="font-medium text-text-primary">Configurer les rappels</p>
                        <p className="text-xs text-text-secondary">Notifications et alertes</p>
                    </div>
                </Button>
            </div>
        </div>
    )
}