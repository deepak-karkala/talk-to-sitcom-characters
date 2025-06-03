import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import CharacterSelector from '../CharacterSelector'

describe('CharacterSelector', () => {
  it('renders the component title', () => {
    render(<CharacterSelector />)
    expect(screen.getByText('Select a Character')).toBeInTheDocument()
  })

  it('renders Chandler Bing character option', () => {
    render(<CharacterSelector />)
    expect(screen.getByText('Chandler Bing')).toBeInTheDocument()
    expect(screen.getByAltText('Chandler Bing')).toBeInTheDocument()
  })

  it('has correct button attributes for selected character', () => {
    render(<CharacterSelector />)
    const button = screen.getByRole('button', { name: /select chandler bing/i })
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(button).toHaveAttribute('tabIndex', '0')
  })

  it('applies correct styling classes for the selected character', () => {
    render(<CharacterSelector />)
    const button = screen.getByRole('button', { name: /select chandler bing/i })
    
    // Check for classes that should be present on the selected character button
    const expectedClasses = [
      'p-1',
      'rounded-lg',
      'cursor-pointer',
      'transition-all',
      'duration-200',
      'ease-in-out',
      'transform',
      'ring-2',
      'ring-blue-500'
      // 'hover:scale-105' is also part of the base, but might be tricky with conditional classes.
      // It's better to test hover effects with simulate hover if critical.
    ];
    expectedClasses.forEach(cls => expect(button).toHaveClass(cls));

    // Check for classes that should NOT be present on the selected character button
    expect(button).not.toHaveClass('opacity-70');
    expect(button).not.toHaveClass('hover:opacity-100');
  })

  it('is keyboard accessible', async () => {
    const user = userEvent.setup()
    render(<CharacterSelector />)
    const button = screen.getByRole('button', { name: /select chandler bing/i })
    await user.tab()
    expect(button).toHaveFocus()
  })
}) 