import {
  render,
  screen
} from '@testing-library/react';

import {
  MemoryRouter
} from 'react-router-dom';

import {
  expect,
  test,
  vi
} from 'vitest';

import MembershipPage from './MembershipPage';

vi.mock(
  '../context/AuthContext',
  () => ({
    useAuth:
      () => ({
        user:
          null
      })
  })
);

vi.mock(
  '../context/ToastContext',
  () => ({
    useToast:
      () =>
        vi.fn()
  })
);

vi.mock(
  '../services/api',
  () => ({
    api:
      vi.fn(() =>
        Promise.resolve({
          data: {
            plans: [
              {
                name:
                  'Premium',

                slug:
                  'premium',

                price:
                  549,

                durationDays:
                  30,

                features: {
                  interestLimit:
                    30,

                  contactViewLimit:
                    10,

                  advancedSearch:
                    true,

                  profileBoost:
                    true
                }
              },

              {
                name:
                  'Assisted',

                slug:
                  'assisted',

                price:
                  749,

                durationDays:
                  30,

                features: {
                  interestLimit:
                    50,

                  contactViewLimit:
                    20,

                  advancedSearch:
                    true,

                  profileBoost:
                    true,

                  prioritySupport:
                    true,

                  relationshipManager:
                    true
                }
              }
            ]
          }
        })
      )
  })
);

test(
  'renders both paid membership plans',
  async () => {
    render(
      <MemoryRouter>
        <MembershipPage
          publicView
        />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole(
        'heading',
        {
          name:
            'Premium'
        }
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole(
        'heading',
        {
          name:
            'Assisted'
        }
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /₹549/
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /₹749/
      )
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole(
        'button',
        {
          name:
            /Create profile/i
        }
      )
    ).toHaveLength(
      2
    );
  }
);