import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import CharacterSelector from '../CharacterSelector'
import ChatArea from '../ChatArea'
import MessageInput from '../MessageInput'
import { useChat, UseChatReturn } from '@/hooks/useChat'
//import { Message as VercelAIMessage } from 'ai'
import { Message as CustomMessage } from '../ChatMessage'

// Mock the useChat hook
jest.mock('@/hooks/useChat')

const mockUseChatDefaultValues: UseChatReturn = {
  messages: [],
  input: '',
  isLoading: false,
  error: null,
  handleInputChange: jest.fn(),
  handleSubmit: jest.fn(),
  selectedCharacter: { id: 'chandler', name: 'Chandler Bing', avatarUrl: '/characters/chandler/avatar.png' }
}

// Helper function to set up the mock
const setupMockUseChat = (override: Partial<UseChatReturn>): UseChatReturn => {
  const mockValues = { ...mockUseChatDefaultValues, ...override };
  (useChat as jest.Mock).mockReturnValue(mockValues);
  return mockValues;
}

// Component to render for testing
const TestChatComponent: React.FC<UseChatReturn> = (props) => {
  return (
    <div>
      <CharacterSelector /> 
      <ChatArea messages={props.messages} isLoading={props.isLoading} error={props.error} />
      <MessageInput
        input={props.input}
        handleInputChange={props.handleInputChange}
        handleSubmit={props.handleSubmit}
        handleFileChange={jest.fn()}
        imagePreviewUrl={null}
        onRemoveImage={jest.fn()}
      />
    </div>
  );
};

describe('Chat Flow Integration', () => {
  let currentMockState: UseChatReturn;

  beforeEach(() => {
    jest.clearAllMocks();
    currentMockState = setupMockUseChat({});
  })

  it('renders initial empty state correctly', () => {
    render(<TestChatComponent {...currentMockState} />);
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
    expect(screen.getByText(/chandler bing/i)).toBeInTheDocument();
  })

  it('handles complete message flow', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TestChatComponent {...currentMockState} />);

    // User types a message
    const inputElement = screen.getByPlaceholderText(/type your message/i);
    await act(async () => {
      await user.type(inputElement, 'Hello Chandler!');
      // Simulate input change in mock by updating the state that MessageInput uses
      // In a real scenario, useChat.handleInputChange would update useChat.input
      // For testing, we directly set the mock input and re-render.
      currentMockState = setupMockUseChat({ ...currentMockState, input: 'Hello Chandler!' });
    });
    rerender(<TestChatComponent {...currentMockState} />);
    expect(inputElement).toHaveValue('Hello Chandler!');

    // User submits the message
    const form = screen.getByTestId('message-form');
    await act(async () => {
      fireEvent.submit(form);
    });
    // handleSubmit in the mock is called
    expect(currentMockState.handleSubmit).toHaveBeenCalled(); 

    // Simulate response from the hook by updating messages and clearing input
    const updatedMessages: CustomMessage[] = [
      { id: '1', text: 'Hello Chandler!', sender: 'user' },
      {
        id: '2',
        text: 'Could I BE any more excited to chat?',
        sender: 'character',
        characterName: 'Chandler'
      }
    ];
    act(() => {
      currentMockState = setupMockUseChat({ ...currentMockState, messages: updatedMessages, input: '' });
    });
    rerender(<TestChatComponent {...currentMockState} />);

    // Verify messages are displayed and input is cleared
    expect(screen.getByText('Hello Chandler!')).toBeInTheDocument();
    expect(screen.getByText('Could I BE any more excited to chat?')).toBeInTheDocument();
    expect(inputElement).toHaveValue('');
  })

  it('handles loading states correctly', () => {
    // Mock messages should be in the CustomMessage format, as expected by ChatArea via the mock hook
    const mockInitialUserMessagesAsCustom: CustomMessage[] = [
      { id: '1', text: 'Hello', sender: 'user' },
    ];

    act(() => {
      currentMockState = setupMockUseChat({
        messages: mockInitialUserMessagesAsCustom, // Use CustomMessage[] for the mock
        isLoading: true,
        input: '',
      });
    });

    render(<TestChatComponent {...currentMockState} />); 

    expect(screen.getByText(/chandler is typing.../i)).toBeInTheDocument();
    const sendButton = screen.getByRole('button', { name: /send message/i });
    expect(sendButton).toBeDisabled();
  })

  it('handles error states correctly', () => {
    act(() => {
      currentMockState = setupMockUseChat({ 
        ...currentMockState,
        error: 'Failed to send message',
        messages: [{ id: '1', text: 'Hello', sender: 'user' } as CustomMessage]
      });
    });
    render(<TestChatComponent {...currentMockState} />);

    expect(screen.getByText(/failed to send message/i)).toBeInTheDocument();
    const inputElement = screen.getByPlaceholderText(/type your message/i);
    expect(inputElement).not.toBeDisabled();
  })

  it('maintains conversation context', () => {
    const contextMessages: CustomMessage[] = [
      { id: '1', text: 'How are you?', sender: 'user' },
      {
        id: '2',
        text: "I'm doing great! Could I BE any better?",
        sender: 'character',
        characterName: 'Chandler'
      }
    ];
    act(() => {
      currentMockState = setupMockUseChat({ ...currentMockState, messages: contextMessages });
    });
    render(<TestChatComponent {...currentMockState} />);

    expect(screen.getByText('How are you?')).toBeInTheDocument();
    expect(screen.getByText("I'm doing great! Could I BE any better?")).toBeInTheDocument();
  })
}) 