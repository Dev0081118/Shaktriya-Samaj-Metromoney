import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import axe from 'axe-core';
import App from './App';
import { ToastProvider } from './context/ToastContext';

// Hoist mocks
const { authState, apiMock } = vi.hoisted(() => ({
  authState: {
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn()
  },
  apiMock: vi.fn()
}));

vi.mock('./context/AuthContext', () => ({
  useAuth: () => authState,
  AuthProvider: ({ children }) => children
}));

vi.mock('./services/api', () => ({
  api: (...args) => apiMock(...args),
  assetUrl: (path) => path
}));

vi.mock('./motion/useGsapReveal', () => ({
  useGsapReveal: () => {},
  default: () => {}
}));

describe('Application Core Journeys & Route Guarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = null;
    authState.loading = false;
    apiMock.mockResolvedValue({ data: {} });
  });

  test('Homepage renders successfully with heritage branding', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MemoryRouter>
    );

    // Look for heading or key elements on home
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1 })
      ).toBeInTheDocument();
    });
  });

  test('Login route renders email and password inputs with accessible labels', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/login']}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email|mobile/i);
    expect(emailInput).toBeInTheDocument();

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeInTheDocument();

    // Verify axe-core accessibility scan
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false } // JSDOM lacks real layout computation for CSS color contrast
      }
    });
    expect(results.violations).toEqual([]);
  });

  test('Registration route renders required legal consent controls', async () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('checkbox', { name: /terms of use/i })).toBeRequired();
    expect(screen.getByRole('checkbox', { name: /privacy policy/i })).toBeRequired();
  });

  test('Protected member routes redirect unauthenticated visitors to login', async () => {
    authState.user = null;

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  test('Unauthorized member cannot access restricted administrative routes and is redirected to role home', async () => {
    authState.user = {
      _id: 'user-member-1',
      role: 'member',
      email: 'member@example.com'
    };

    apiMock.mockResolvedValue({
      data: {
        profile: { firstName: 'Siddhraj', completionPercentage: 80 },
        membership: { plan: { name: 'Free', slug: 'free' } },
        newInterestsCount: 0,
        mutualMatchesCount: 0,
        shortlistCount: 0,
        unreadNotificationsCount: 0,
        profileViewsLast30Days: 0,
        recommendedProfiles: []
      }
    });

    render(
      <MemoryRouter initialEntries={['/admin/customers']}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MemoryRouter>
    );

    // Member should be redirected to /dashboard and NOT see admin panels
    await waitFor(() => {
      expect(screen.queryByText(/customer 360/i)).not.toBeInTheDocument();
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });

  test('Authenticated member can access discovery page safely', async () => {
    authState.user = {
      _id: 'user-member-1',
      role: 'member',
      email: 'member@example.com'
    };

    apiMock.mockImplementation((path) => {
      if (path.includes('/profiles/discover')) {
        return Promise.resolve({
          data: {
            profiles: [
              {
                _id: 'candidate-1',
                profileId: 'KSM200001',
                firstName: 'Anjali',
                age: 25,
                height: 165,
                profilePhoto: '',
                location: { nativeDistrict: 'Jamnagar', nativeState: 'Gujarat' },
                community: { clan: 'Chauhan', gotra: 'Vatsa', vansh: 'Agnivanshi' },
                education: { highestEducation: 'B.Tech' },
                career: { occupation: 'Software Engineer' }
              }
            ],
            total: 1,
            page: 1,
            limit: 12
          }
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter initialEntries={['/discover']}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Anjali')).toBeInTheDocument();
    });
  });

  test('Handles unavailable API responses gracefully without crashing', async () => {
    authState.user = {
      _id: 'user-member-1',
      role: 'member',
      email: 'member@example.com'
    };

    apiMock.mockRejectedValue(new Error('Network service unavailable.'));

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/network service unavailable/i)).toBeInTheDocument();
    });
  });
});
