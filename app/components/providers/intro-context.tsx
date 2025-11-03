'use client'

import React from 'react'

type IntroContextValue = {
  introComplete: boolean
  markComplete: () => void
}

const IntroContext = React.createContext<IntroContextValue | undefined>(undefined)

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [introComplete, setIntroComplete] = React.useState(false)

  const markComplete = React.useCallback(() => {
    setIntroComplete(true)
  }, [])

  const value = React.useMemo(
    () => ({
      introComplete,
      markComplete,
    }),
    [introComplete, markComplete],
  )

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
}

export function useIntro() {
  const context = React.useContext(IntroContext)
  if (!context) {
    throw new Error('useIntro must be used within an IntroProvider')
  }
  return context
}
