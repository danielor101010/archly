import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { NotFound } from './pages/NotFound'
import { DashboardPage } from './pages/DashboardPage'
import { TopicList } from './features/learning/TopicList'
import { LearningRoom } from './features/learning/LearningRoom'
import { PracticeSetup } from './features/practice/PracticeSetup'
import { PracticeSession } from './features/practice/PracticeSession'
import { InterviewSetup } from './features/interview/InterviewSetup'
import { InterviewSession } from './features/interview/InterviewSession'
import { CvAnalysisPage } from './pages/CvAnalysisPage'
import { TopicQuizPage } from './pages/TopicQuizPage'
import ChallengesPage from './pages/ChallengesPage'
import { ProblemDescriptionPage } from './pages/ProblemDescriptionPage'
import { ConceptChatPage } from './pages/ConceptChatPage'
import { LanguagesPage } from './pages/LanguagesPage'
import { AllProblemsPage } from './pages/AllProblemsPage'
import { LanguageQuizPage } from './pages/LanguageQuizPage'
import { CvInterviewPage } from './pages/CvInterviewPage'
import { CodingInterviewPage } from './pages/CodingInterviewPage'
import ModelingPage from './pages/ModelingPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/learn" element={<TopicList />} />
        <Route path="/learn/:slug" element={<LearningRoom />} />
        <Route path="/practice" element={<PracticeSetup />} />
        <Route path="/practice/:problemId" element={<PracticeSession />} />
        <Route path="/interview" element={<InterviewSetup />} />
        <Route path="/interview/:problemId" element={<InterviewSession />} />
        <Route path="/cv-analysis" element={<CvAnalysisPage />} />
        <Route path="/quiz/:slug" element={<TopicQuizPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/cv-interview" element={<CvInterviewPage />} />
        <Route path="/coding-interview" element={<CodingInterviewPage />} />
        <Route path="/modeling" element={<ModelingPage />} />
        <Route path="/problem/:problemId" element={<ProblemDescriptionPage />} />
        <Route path="/concept/:slug" element={<ConceptChatPage />} />
        <Route path="/languages" element={<LanguagesPage />} />
        <Route path="/problems" element={<AllProblemsPage />} />
        <Route path="/languages/:slug" element={<LanguageQuizPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
