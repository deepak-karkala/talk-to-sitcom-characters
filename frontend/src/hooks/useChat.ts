import { useState, useCallback } from 'react'

export interface Message {
  id: string
  text: string
  sender: 'user' | 'character'
  characterName?: string
  avatarUrl?: string
}

export interface Character {
  id: string
  name: string
  avatarUrl: string
}

export interface UseChatReturn {
  messages: Message[]
  input: string
  isLoading: boolean
  error: string | null
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  selectedCharacter: Character | null
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCharacter] = useState<Character>({
    id: 'chandler',
    name: 'Chandler Bing',
    avatarUrl: '/characters/chandler/avatar.png'
  })

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value)
    },
    []
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!input.trim()) return

      try {
        setIsLoading(true)
        setError(null)

        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          text: input.trim(),
          sender: 'user'
        }
        setMessages(prev => [...prev, userMessage])
        setInput('')

        // TODO: Add API call to get character response
        // For now, just simulate a response
        await new Promise(resolve => setTimeout(resolve, 1000))

        const characterMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Could I BE any more excited to chat?',
          sender: 'character',
          characterName: selectedCharacter.name,
          avatarUrl: selectedCharacter.avatarUrl
        }
        setMessages(prev => [...prev, characterMessage])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message')
      } finally {
        setIsLoading(false)
      }
    },
    [input, selectedCharacter]
  )

  return {
    messages,
    input,
    isLoading,
    error,
    handleInputChange,
    handleSubmit,
    selectedCharacter
  }
} 