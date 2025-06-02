// frontend/src/components/chat/MessageInput.tsx
"use client";

import React from 'react';

// Icon definitions (defined once)
const PaperclipIconSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3.375 3.375 0 1112.81 8.42l-7.693 7.693a.375.375 0 01-.53-.53l7.693-7.693a2.25 2.25 0 00-3.182-3.182L4.929 15.929a4.5 4.5 0 006.364 6.364l7.693-7.693a.375.375 0 01.53.53z" />
  </svg>
);
PaperclipIconSvg.displayName = 'PaperclipIcon';

const PaperAirplaneIconSvg = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);
PaperAirplaneIconSvg.displayName = 'PaperAirplaneIcon';


interface MessageInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ input, handleInputChange, handleSubmit }) => {

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(event);
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    handleSubmit(event);
    const textarea = document.getElementById('message-input-textarea') as HTMLTextAreaElement | null;
    if (textarea) {
        setTimeout(() => { if (textarea.value === '') textarea.style.height = 'auto'; }, 0);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const form = event.currentTarget.closest('form');
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }
  };

  return (
        <form
          onSubmit={onFormSubmit}
          // Applied card background, specific shadow, top rounding, and top border.
          className="bg-white dark:bg-slate-800 p-3 md:p-4 mt-auto shadow-soft-lift-up rounded-t-lg border-t border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-end space-x-2 md:space-x-3">
            <button type="button" className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label="Upload image (disabled)" disabled > <PaperclipIconSvg className="w-5 h-5 md:w-6 md:h-6" /> </button>
            <textarea id="message-input-textarea" value={input} onChange={handleTextareaChange} onKeyDown={handleKeyDown} placeholder="Type your message..."
              className="flex-grow p-2.5 text-sm md:text-base border-slate-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none
                         bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white dark:placeholder-slate-400"
              rows={1} style={{ overflowY: 'hidden' }} />
            <button type="submit" disabled={!input.trim()} className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Send message" > <PaperAirplaneIconSvg className="w-5 h-5 md:w-6 md:h-6" /> </button>
          </div>
        </form>
  );
};

export default MessageInput;
