// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { priority, loading, ...rest } = props;
    // next/image priority prop translates to loading="eager" on the img tag
    // if loading is also passed, it takes precedence.
    const determinedLoading = loading || (priority ? "eager" : undefined);
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...rest} loading={determinedLoading} />;
  }
}))

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn()

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} 