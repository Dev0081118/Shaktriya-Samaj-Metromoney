import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import axe from 'axe-core';
import OnboardingPage from './OnboardingPage';
import DiscoverPage from './DiscoverPage';
import BiodataPage from './BiodataPage';
import { ToastProvider } from '../context/ToastContext';

const apiMock = vi.fn();
const notifyMock = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      _id: 'user-1',
      id: 'user-1',
      email: 'member@example.com',
      phone: '+919876543210',
      phoneVerified: true,
      role: 'member',
      status: 'Active'
    }
  })
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => notifyMock,
  ToastProvider: ({ children }) => children
}));

vi.mock('../services/api', () => ({
  api: (...args) => apiMock(...args),
  assetUrl: (val) => val || ''
}));

vi.mock('../motion/useGsapReveal', () => ({
  useGsapReveal: () => {},
  default: () => {}
}));

describe('Automated Accessibility Verification (axe-core)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('OnboardingPage step forms maintain accessible controls and structure', async () => {
    apiMock.mockImplementation((path) => {
      if (path.includes('/profiles/me')) {
        return Promise.resolve({ data: { profile: null } });
      }
      if (path.includes('/preferences')) {
        return Promise.resolve({ data: { preferences: null } });
      }
      if (path.includes('/family-assets')) {
        return Promise.resolve({ data: { familyAssets: null } });
      }
      return Promise.resolve({ data: {} });
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <ToastProvider>
          <OnboardingPage />
        </ToastProvider>
      </MemoryRouter>
    );

    // Wait for step 1 to render
    await screen.findByRole('heading', {
      level: 1,
      name: /let us begin with the essentials/i
    });

    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false }
      }
    });

    expect(results.violations).toEqual([]);
  });

  test('DiscoverPage filter inputs, candidate cards, and pagination have no axe violations', async () => {
    apiMock.mockImplementation((path) => {
      if (path.includes('/entitlements')) {
        return Promise.resolve({
          data: {
            entitlements: { advancedSearch: true }
          }
        });
      }
      if (path.includes('/profiles/discover')) {
        return Promise.resolve({
          data: {
            profiles: [
              {
                _id: 'candidate-1',
                profileId: 'KSM100001',
                firstName: 'Meera',
                lastName: 'Rathore',
                age: 25,
                height: 162,
                location: { nativeState: 'Rajasthan', nativeDistrict: 'Jaipur' },
                education: { highestEducation: 'B.Tech' },
                career: { occupation: 'Software Engineer' },
                community: { clan: 'Rathore' }
              }
            ],
            pagination: {
              total: 1,
              page: 1,
              limit: 12,
              pages: 1
            }
          }
        });
      }
      return Promise.resolve({ data: {} });
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/discover']}>
        <ToastProvider>
          <DiscoverPage />
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Meera/i)).toBeInTheDocument();
    });

    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false }
      }
    });

    expect(results.violations).toEqual([]);
  });

  test('BiodataPage preview card, disclosure toggles, and print actions have no axe violations', async () => {
    apiMock.mockImplementation((path) => {
      if (path.includes('/profiles/me')) {
        return Promise.resolve({
          data: {
            profile: {
              profileId: 'KSM200002',
              firstName: 'Karan',
              lastName: 'Rathore',
              gender: 'Male',
              dateOfBirth: '1996-05-15',
              height: 178,
              maritalStatus: 'Never Married',
              location: {
                nativePlace: 'Jodhpur',
                nativeDistrict: 'Jodhpur',
                nativeState: 'Rajasthan'
              },
              community: {
                kuldevi: 'Chamunda Mata',
                gotra: 'Kashyap',
                clan: 'Rathore'
              },
              education: {
                highestEducation: 'Master of Technology',
                degree: 'M.Tech Computer Science'
              },
              career: {
                occupation: 'Tech Lead',
                annualIncome: 3500000,
                incomeCurrency: 'INR'
              },
              family: {
                fatherName: 'Vikram Singh Rathore',
                fatherOccupation: 'Government Officer',
                motherName: 'Sunita Kanwar',
                familyType: 'Nuclear',
                familyValues: 'Moderate'
              },
              biodataPrivacy: {
                includeSensitiveFamilyDetailsInBiodata: true,
                includeAstrologyInBiodata: true,
                includeContactDetailsInBiodata: true,
                includeAssetsInBiodata: true
              }
            }
          }
        });
      }
      return Promise.resolve({ data: {} });
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/biodata']}>
        <ToastProvider>
          <BiodataPage />
        </ToastProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Karan Rathore/i)[0]).toBeInTheDocument();
    });

    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false }
      }
    });

    expect(results.violations).toEqual([]);
  });
});
