import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ChatArea from '../ChatArea'
import { Message } from '../ChatMessage'

describe('ChatArea', () => {
  const mockMessages: Message[] = [
    {
      id: '1',
      text: 'Hi Chandler!',
      sender: 'user'
    },
    {
      id: '2',
      text: 'Could I BE any more excited to chat?',
      sender: 'character',
      characterName: 'Chandler'
    }
  ]

  it('renders empty state correctly', () => {
    render(<ChatArea messages={[]} />)
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument()
  })

  it('renders messages correctly', () => {
    render(<ChatArea messages={mockMessages} />)
    expect(screen.getByText('Hi Chandler!')).toBeInTheDocument()
    expect(screen.getByText('Could I BE any more excited to chat?')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<ChatArea messages={mockMessages} isLoading={true} />)
    expect(screen.getByText(/chandler is thinking/i)).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(
      <ChatArea
        messages={mockMessages}
        error="Failed to send message"
      />
    )
    expect(screen.getByText('Failed to send message')).toBeInTheDocument()
  })

  it('maintains message order', () => {
    render(<ChatArea messages={mockMessages} />)
    const messageContainers = screen.getAllByTestId('message-container')
    
    // First message should be from user
    expect(messageContainers[0]).toHaveTextContent('Hi Chandler!')
    
    // Second message should be from Chandler
    expect(messageContainers[1]).toHaveTextContent('Could I BE any more excited to chat?')
  })
}) 