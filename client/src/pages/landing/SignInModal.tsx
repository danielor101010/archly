import { motion, AnimatePresence } from 'framer-motion'
import { GoogleSignIn } from '../../components/GoogleSignIn'

interface SignInModalProps {
  open: boolean
  onClose: () => void
}

export const SignInModal = ({ open, onClose }: SignInModalProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.18 }}
          className="bg-surface-elevated border border-border-default rounded-lg p-8 w-full max-w-sm mx-4 shadow-xl"
        >
          <h2 className="text-lg font-semibold text-text-primary mb-1">Sign in to continue</h2>
          <p className="text-text-muted text-sm mb-6">You need an account to access this feature.</p>
          <GoogleSignIn onSuccess={onClose} />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)
