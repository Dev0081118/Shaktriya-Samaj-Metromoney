import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import MembershipPage from './MembershipPage';
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../context/ToastContext', () => ({ useToast: () => vi.fn() }));
vi.mock('../services/api', () => ({
  api: vi.fn(() =>
    Promise.resolve({
      data: {
        plans: [
          {
            name: 'Free',
            slug: 'free',
            price: 0,
            durationDays: 365,
            features: { interestLimit: 5 }
          },
          {
            name: 'Premium',
            slug: 'premium',
            price: 4999,
            durationDays: 180,
            features: { advancedSearch: true }
          }
        ]
      }
    })
  )
}));
test('renders server-provided plan benefits and public signup actions', async () => {
  render(
    <MemoryRouter>
      <MembershipPage publicView />
    </MemoryRouter>
  );
  expect(
    await screen.findByRole('heading', { name: 'Premium' })
  ).toBeInTheDocument();
  expect(screen.getByText('Advanced search')).toBeInTheDocument();
  expect(
    screen.getAllByRole('button', { name: /Create profile/i })
  ).toHaveLength(2);
});
