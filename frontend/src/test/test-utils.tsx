import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Add any providers that your app needs here
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  )
}

function render(ui: React.ReactElement, options = {}) {
  return {
    ...rtlRender(ui, { wrapper: Providers, ...options }),
    // Add custom user-event instance
    user: userEvent.setup(),
  }
}

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { render } 