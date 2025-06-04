import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ChatMessage, { Message } from '../ChatMessage'

describe('ChatMessage', () => {
  const userMessage: Message = {
    id: '1',
    text: 'Hello there!',
    sender: 'user'
  }

  const characterMessage: Message = {
    id: '2',
    text: 'Could I BE any more excited to chat?',
    sender: 'character',
    characterName: 'Chandler',
    avatarUrl: '/chandler.jpg'
  }

  it('renders a user message correctly', () => {
    render(<ChatMessage message={userMessage} />)
    
    // Check if message text is present
    expect(screen.getByText(userMessage.text)).toBeInTheDocument()
    
    // Check if it has the user message styling
    const messageContainer = screen.getByText(userMessage.text).closest('div')
    expect(messageContainer).toHaveClass('bg-blue-500', 'text-white')
    
    // User messages shouldn't show character name
    expect(screen.queryByText('Chandler')).not.toBeInTheDocument()
  })

  it('renders a character message correctly', () => {
    render(<ChatMessage message={characterMessage} />)
    
    // Check if message text and character name are present
    expect(screen.getByText(characterMessage.text)).toBeInTheDocument()
    expect(screen.getByText(characterMessage.characterName!)).toBeInTheDocument()
    
    // Check if it has the character message styling
    const messageContainer = screen.getByText(characterMessage.text).closest('div')
    expect(messageContainer).toHaveClass('bg-gray-300', 'dark:bg-gray-600')
  })

  it('handles messages without character name', () => {
    const messageWithoutName: Message = {
      id: '3',
      text: 'Anonymous message',
      sender: 'character'
    }
    
    render(<ChatMessage message={messageWithoutName} />)
    
    // Message text should be present
    expect(screen.getByText(messageWithoutName.text)).toBeInTheDocument()
    
    // No character name should be shown
    expect(screen.queryByTestId('character-name')).not.toBeInTheDocument()
  })

  // Edge cases
  it('handles empty message text', () => {
    const emptyMessage: Message = {
      id: '4',
      text: '',
      sender: 'user'
    }
    
    render(<ChatMessage message={emptyMessage} />)
    const messageContainer = screen.getByTestId('message-container')
    expect(messageContainer).toBeInTheDocument()
    expect(messageContainer).toHaveClass('flex', 'mb-3')
  })

  it('handles very long messages without breaking layout', () => {
    const longMessage: Message = {
      id: '5',
      text: 'a'.repeat(1000), // Very long message
      sender: 'user'
    }
    
    render(<ChatMessage message={longMessage} />)
    const messageContainer = screen.getByText(longMessage.text).closest('div')
    expect(messageContainer).toHaveClass('break-words')
  })

  it('handles messages with special characters', () => {
    const specialCharsMessage: Message = {
      id: '6',
      text: '<script>alert("XSS")</script>',
      sender: 'user'
    }
    
    render(<ChatMessage message={specialCharsMessage} />)
    expect(screen.getByText(specialCharsMessage.text)).toBeInTheDocument()
    // Text should be rendered as-is, not executed as HTML
    expect(document.querySelector('script')).not.toBeInTheDocument()
  })

  it('handles messages with multiple lines', () => {
    const multilineMessage: Message = {
      id: '7',
      text: 'Line 1\nLine 2\nLine 3',
      sender: 'character',
      characterName: 'Chandler'
    }
    
    render(<ChatMessage message={multilineMessage} />)
    // Use a custom function to match text content with newlines
    const textElement = screen.getByText((content) => {
      return content.includes('Line 1') && 
             content.includes('Line 2') && 
             content.includes('Line 3')
    })
    expect(textElement).toBeInTheDocument()
    expect(screen.getByText('Chandler')).toBeInTheDocument()
  })

  it('applies responsive width classes correctly', () => {
    render(<ChatMessage message={userMessage} />)
    const messageContainer = screen.getByText(userMessage.text).closest('div')
    expect(messageContainer).toHaveClass('max-w-2xl', 'md:max-w-3xl', 'lg:max-w-4xl')
  })
}) 