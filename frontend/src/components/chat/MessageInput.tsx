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

const XCircleIconSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
XCircleIconSvg.displayName = 'XCircleIcon';

interface MessageInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreviewUrl: string | null;
  onRemoveImage: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  input,
  handleInputChange,
  handleSubmit,
  handleFileChange,
  imagePreviewUrl,
  onRemoveImage
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '0px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + 'px';
    }
  }, [input]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !imagePreviewUrl) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form && input.trim()) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    } else if (e.key === 'Enter' && !e.shiftKey && imagePreviewUrl && !input.trim()) {
       e.preventDefault();
       const form = e.currentTarget.closest('form');
       if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isSubmitDisabled = !input.trim() && !imagePreviewUrl;

  return (
    <div className="">
      {imagePreviewUrl && (
        <div className="mb-2 relative group w-24 h-24 border border-slate-300 dark:border-slate-600 rounded-md overflow-hidden">
          <img 
            src={imagePreviewUrl} 
            alt="Uploaded image" 
            data-testid="uploaded-image-preview"
            className="w-full h-full object-cover" 
          />
          <button 
            type="button"
            onClick={onRemoveImage}
            aria-label="Remove image"
            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <XCircleIconSvg className="w-5 h-5" />
          </button>
        </div>
      )}

      <form
        data-testid="message-form"
        onSubmit={handleSubmit}
      >
        <div className="flex items-end space-x-2 md:space-x-3">
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            data-testid="file-input"
          />
          <button
            type="button"
            onClick={triggerFileInput}
            aria-label="Upload image"
            className="p-2 text-slate-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <PaperclipIconSvg className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <textarea
            ref={textareaRef}
            id="message-input-textarea"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-grow p-2.5 text-sm md:text-base border-slate-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none bg-slate-50 dark:bg-neutral-700 text-slate-900 dark:text-neutral-100 dark:placeholder-neutral-400"
            style={{ overflowY: 'hidden' }}
          />

          <button
            type="submit"
            aria-label="Send message"
            disabled={isSubmitDisabled}
            className="p-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
          >
            <PaperAirplaneIconSvg className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
