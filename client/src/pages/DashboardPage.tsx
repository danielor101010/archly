import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, LogOut } from 'lucide-react'
import { useUserStore } from '../stores/userStore'
import { sendWS } from '../lib/ws'
import { useWeaknessAnalysis } from '../hooks/useWeaknessAnalysis'
import { ThemeToggle } from '../components/ThemeToggle'
import { TOPICS } from '../config/topics'
import { LANGUAGES } from '../config/languages'
import { PROBLEMS } from '../config/problems'
import { LevelDropdown } from './dashboard/LevelDropdown'
import { StatsRow } from './dashboard/StatsRow'
import { ProgressPanel } from './dashboard/ProgressPanel'
import { WeaknessesPanel } from './dashboard/WeaknessesPanel'
import { RecentSessions } from './dashboard/RecentSessions'
import { CvSection } from './dashboard/CvSection'
import { SignedOutView } from './dashboard/SignedOutView'
import { getInitials } from './dashboard/helpers'

export const DashboardPage = () => {
  const navigate = useNavigate()
  const {
    name, level, sessionsCompleted, totalTokensUsed, solvedProblems, setLevel,
    cvText, cvSkills, cvProblems, isAnalyzingCv, setCvText, setAnalyzingCv,
    sessionHistory, quizProgress, avatar, googleId, email, signOut,
  } = useUserStore()
  const weaknesses = useWeaknessAnalysis()

  if (!name) return <SignedOutView />

  const quizzedTopics     = TOPICS.filter(t => quizProgress[`topic-${t.slug}`])
  const quizzedLangs      = LANGUAGES.filter(l => quizProgress[`lang-${l.slug}`])
  const solvedProblemList = PROBLEMS.filter(p => solvedProblems.includes(p.id))

  return (
    <div className="min-h-screen bg-page">
      <div className="border-b border-border-subtle bg-page/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-text-subtle hover:text-text-secondary text-sm transition-colors">
            <ArrowLeft size={14} /> <span className="hidden sm:inline">Home</span>
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 text-text-primary font-semibold text-sm pointer-events-none">Profile</span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">

        <div className="bg-surface border border-border-subtle rounded-lg p-5 flex items-center gap-4">
          {googleId && avatar
            ? <img src={avatar} alt={name} className="w-14 h-14 rounded-full object-cover border-2 border-border-default shrink-0" referrerPolicy="no-referrer" />
            : <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-white text-xl font-bold shrink-0">{getInitials(name)}</div>
          }
          <div className="flex-1 min-w-0">
            <p className="text-text-primary font-bold text-lg leading-tight truncate">{name}</p>
            {googleId && <p className="text-text-subtle text-xs mt-0.5">{email ?? ''}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <LevelDropdown value={level} onChange={setLevel} />
            <button onClick={signOut} title="Sign out"
              className="w-8 h-8 rounded-md bg-surface-elevated hover:bg-surface border border-border-subtle text-text-subtle hover:text-text-secondary flex items-center justify-center transition-colors">
              <LogOut size={13} />
            </button>
          </div>
        </div>

        <StatsRow solvedCount={solvedProblems.length} sessionsCompleted={sessionsCompleted} totalTokensUsed={totalTokensUsed} />

        <ProgressPanel
          quizProgress={quizProgress}
          quizzedTopics={quizzedTopics}
          quizzedLangs={quizzedLangs}
          solvedProblemList={solvedProblemList}
          totalProblems={PROBLEMS.length}
          totalTopics={TOPICS.length}
          totalLangs={LANGUAGES.length}
          onNavigate={navigate}
        />

        {sessionHistory.length >= 3 && <WeaknessesPanel weaknesses={weaknesses} sessionCount={sessionHistory.length} />}
        {sessionHistory.length > 0 && <RecentSessions sessions={sessionHistory} />}

        <CvSection
          cvText={cvText}
          cvSkills={cvSkills}
          cvProblems={cvProblems}
          isAnalyzingCv={isAnalyzingCv}
          onCvTextChange={setCvText}
          onAnalyze={() => { if (!cvText.trim() || isAnalyzingCv) return; setAnalyzingCv(true); sendWS('ANALYZE_CV', { cvText, userLevel: level }) }}
        />

        <button onClick={() => navigate('/practice')}
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-md transition-colors">
          Start Practicing <ArrowRight size={16} />
        </button>

      </div>
    </div>
  )
}
