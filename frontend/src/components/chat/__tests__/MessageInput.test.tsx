import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import MessageInput from '../MessageInput'

describe('MessageInput', () => {
  const mockHandleInputChange = jest.fn()
  const mockHandleSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders input field and send button', () => {
    render(
      <MessageInput 
        input=""
        handleInputChange={mockHandleInputChange}
        handleSubmit={mockHandleSubmit}
      />
    )

    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  it('handles text input changes', async () => {
    const user = userEvent.setup()
    render(
      <MessageInput 
        input=""
        handleInputChange={mockHandleInputChange}
        handleSubmit={mockHandleSubmit}
      />
    )

    const input = screen.getByPlaceholderText(/type your message/i)
    await user.type(input, 'Hello Chandler!')
    
    expect(mockHandleInputChange).toHaveBeenCalled()
  })

  it('disables send button when input is empty', () => {
    render(
      <MessageInput 
        input=""
        handleInputChange={mockHandleInputChange}
        handleSubmit={mockHandleSubmit}
      />
    )

    const sendButton = screen.getByRole('button', { name: /send message/i })
    expect(sendButton).toBeDisabled()
  })

  it('enables send button when input is not empty', () => {
    render(
      <MessageInput 
        input="Hello"
        handleInputChange={mockHandleInputChange}
        handleSubmit={mockHandleSubmit}
      />
    )

    const sendButton = screen.getByRole('button', { name: /send message/i })
    expect(sendButton).not.toBeDisabled()
  })

  it('handles form submission', async () => {
    render(
      <MessageInput 
        input="Hello Chandler!"
        handleInputChange={mockHandleInputChange}
        handleSubmit={mockHandleSubmit}
      />
    )

    const form = screen.getByTestId('message-form')
    fireEvent.submit(form)
    
    expect(mockHandleSubmit).toHaveBeenCalled()
  })

  it('handles Enter key press to submit', async () => {
    const user = userEvent.setup()
    render(
      <MessageInput 
        input="Hello"
        handleInputChange={mockHandleInputChange}
        handleSubmit={mockHandleSubmit}
      />
    )

    const textarea = screen.getByPlaceholderText(/type your message/i)
    await user.type(textarea, '{Enter}')
    
    expect(mockHandleSubmit).toHaveBeenCalled()
  })

  it('does not submit on Shift+Enter', async () => {
    const user = userEvent.setup()
    render(
      <MessageInput 
        input="Hello"
        handleInputChange={mockHandleInputChange}
        handleSubmit={mockHandleSubmit}
      />
    )

    const textarea = screen.getByPlaceholderText(/type your message/i)
    await user.type(textarea, '{Shift>}{Enter}{/Shift}')
    
    expect(mockHandleSubmit).not.toHaveBeenCalled()
  })

  it('handles very long input text', async () => {
    const longText = 'a'.repeat(1000)
    
    render(
      <MessageInput 
        input={longText}
        handleInputChange={mockHandleInputChange}
        handleSubmit={mockHandleSubmit}
      />
    )

    const textarea = screen.getByPlaceholderText(/type your message/i)
    expect(textarea).toHaveValue(longText)
    expect(textarea).toHaveClass('resize-none')
  })

  it('handles pasting text', async () => {
    const user = userEvent.setup()
    render(
      <MessageInput 
        input=""
        handleInputChange={mockHandleInputChange}
        handleSubmit={mockHandleSubmit}
      />
    )

    const textarea = screen.getByPlaceholderText(/type your message/i)
    await user.click(textarea)
    await user.paste('Pasted text')
    
    expect(mockHandleInputChange).toHaveBeenCalled()
  })

  it('handles rapid typing', async () => {
    render(
      <MessageInput 
        input=""
        handleInputChange={mockHandleInputChange}
        handleSubmit={mockHandleSubmit}
      />
    )

    const textarea = screen.getByPlaceholderText(/type your message/i)
    
    // Simulate rapid typing with fireEvent for better control
    fireEvent.change(textarea, { target: { value: 'F' } })
    fireEvent.change(textarea, { target: { value: 'Fa' } })
    fireEvent.change(textarea, { target: { value: 'Fas' } })
    fireEvent.change(textarea, { target: { value: 'Fast' } })
    
    expect(mockHandleInputChange).toHaveBeenCalled()
    expect(mockHandleInputChange.mock.calls.length).toBeGreaterThanOrEqual(4)
  })

  it('handles special characters input', async () => {
    render(
      <MessageInput 
        input=""
        handleInputChange={mockHandleInputChange}
        handleSubmit={mockHandleSubmit}
      />
    )

    const textarea = screen.getByPlaceholderText(/type your message/i)
    const specialChars = '!@#$%^&*()_+'
    
    fireEvent.change(textarea, { target: { value: specialChars } })
    expect(mockHandleInputChange).toHaveBeenCalled()
  })

  it('handles emoji input', async () => {
    render(
      <MessageInput 
        input=""
        handleInputChange={mockHandleInputChange}
        handleSubmit={mockHandleSubmit}
      />
    )

    const textarea = screen.getByPlaceholderText(/type your message/i)
    fireEvent.change(textarea, { target: { value: '👋 🎉 🎈' } })
    
    expect(mockHandleInputChange).toHaveBeenCalled()
  })

  it('maintains input state between renders', () => {
    const { rerender } = render(
      <MessageInput 
        input="Initial text"
        handleInputChange={mockHandleInputChange}
        handleSubmit={mockHandleSubmit}
      />
    )

    const textarea = screen.getByPlaceholderText(/type your message/i)
    expect(textarea).toHaveValue('Initial text')

    rerender(
      <MessageInput 
        input="Updated text"
        handleInputChange={mockHandleInputChange}
        handleSubmit={mockHandleSubmit}
      />
    )

    expect(textarea).toHaveValue('Updated text')
  })

  it('handles form submission prevention', async () => {
    const mockPreventDefault = jest.fn()
    const customHandleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      mockPreventDefault()
      mockHandleSubmit(event)
    }
    
    render(
      <MessageInput 
        input="Test"
        handleInputChange={mockHandleInputChange}
        handleSubmit={customHandleSubmit}
      />
    )

    const form = screen.getByTestId('message-form')
    fireEvent.submit(form)
    
    expect(mockPreventDefault).toHaveBeenCalled()
    expect(mockHandleSubmit).toHaveBeenCalled()
  })
}) 