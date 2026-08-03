import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { TOPIC_SCENARIOS } from '../config/topicScenarios'
import { TOPICS } from '../config/topics'
import { QuizHeader } from './topicQuiz/QuizHeader'
import { QuizTabs } from './topicQuiz/QuizTabs'
import { ScenariosList } from './topicQuiz/ScenariosList'
import { QuestionCard } from './topicQuiz/QuestionCard'
import { ResultsView } from './topicQuiz/ResultsView'
import { useTopicQuiz } from './topicQuiz/useTopicQuiz'
import { TOPIC_TITLES } from './topicQuiz/constants'

export const TopicQuizPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'quiz' | 'scenarios'>('quiz')

  const topicTitle = slug ? TOPIC_TITLES[slug] ?? slug : ''
  const topicData = TOPICS.find(t => t.slug === slug)
  const scenarios = slug ? (TOPIC_SCENARIOS[slug] ?? []) : []

  const quiz = useTopicQuiz(slug, topicTitle)
  const goToChat = () => navigate(`/concept/${slug}`)

  if (!quiz.allQuestions || quiz.allActiveQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-text-muted text-lg mb-4">Quiz not available for this topic yet.</p>
          <button onClick={() => navigate('/learn')} className="text-accent hover:text-accent-hover text-sm transition-colors">
            ← Back to Learning Hub
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <QuizHeader
          topicTitle={topicTitle}
          topicData={topicData}
          userLevel={quiz.userLevel}
          questionCount={quiz.allActiveQuestions.length}
          onBack={() => navigate(topicData?.hasContent ? `/learn/${slug}` : '/learn')}
          onChat={goToChat}
        />

        <QuizTabs active={activeTab} onChange={setActiveTab} quizCount={quiz.allActiveQuestions.length} scenarioCount={scenarios.length} />

        {activeTab === 'scenarios' && (
          <ScenariosList scenarios={scenarios} onAskAI={(q) => navigate(`/concept/${slug}`, { state: { question: q } })} />
        )}

        {activeTab === 'quiz' && (
          <AnimatePresence mode="wait">
            {!quiz.showResults ? (
              <motion.div key={`quiz-${quiz.quizKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <QuestionCard
                  question={quiz.currentQuestion}
                  index={quiz.currentIndex}
                  total={quiz.allActiveQuestions.length}
                  hasAnswered={quiz.hasAnswered}
                  selectedOption={quiz.selectedOption}
                  isCorrect={quiz.isCorrect}
                  isLast={quiz.currentIndex >= quiz.allActiveQuestions.length - 1}
                  generating={quiz.generating}
                  generateError={quiz.generateError}
                  onAnswer={quiz.handleAnswer}
                  onNext={quiz.handleNext}
                  onFinish={() => quiz.setShowResults(true)}
                  onGenerateMore={async () => { await quiz.generateMore(); quiz.setCurrentIndex(i => i + 1) }}
                />
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <ResultsView
                  topicTitle={topicTitle}
                  questions={quiz.allActiveQuestions}
                  answers={quiz.answers}
                  score={quiz.score}
                  answeredCount={quiz.answeredCount}
                  grade={quiz.grade}
                  gradeColor={quiz.gradeColor}
                  onRetake={quiz.handleRetake}
                  onChat={goToChat}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
