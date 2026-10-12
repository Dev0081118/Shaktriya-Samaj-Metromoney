import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';

import {
  MemoryRouter
} from 'react-router-dom';

import {
  beforeEach,
  describe,
  expect,
  test,
  vi
} from 'vitest';

import DashboardPage from './DashboardPage';

const apiMock =
  vi.fn();

const notifyMock =
  vi.fn();

vi.mock(
  '../context/ToastContext',
  () => ({
    useToast:
      () =>
        notifyMock
  })
);

vi.mock(
  '../services/api',
  () => ({
    api:
      (
        ...args
      ) =>
        apiMock(
          ...args
        ),

    assetUrl:
      (
        value
      ) =>
        value ||
        ''
  })
);

const baseDashboard = {
  profile: {
    _id:
      'my-profile',

    profileId:
      'KSM100000',

    firstName:
      'Raj',

    profilePhoto:
      ''
  },

  profileCompletion:
    100,

  profileStatus:
    'active',

  lifecycleStatus:
    'Active',

  newInterestsCount:
    3,

  mutualMatchesCount:
    2,

  shortlistCount:
    4,

  unreadNotificationsCount:
    5,

  profileViewsLast30Days:
    18,

  membership: {
    plan: {
      name:
        'Premium',

      slug:
        'premium'
    },

    subscription: {
      status:
        'Active',

      startsAt:
        '2026-10-01T00:00:00.000Z',

      endsAt:
        '2027-04-01T00:00:00.000Z'
    },

    features: {
      interestLimit:
        30,

      contactViewLimit:
        10,

      advancedSearch:
        true,

      profileBoost:
        true,

      prioritySupport:
        false,

      relationshipManager:
        false
    },

    usage: {
      interestsUsed:
        6,

      contactViewsUsed:
        2,

      interestsRemaining:
        24,

      contactViewsRemaining:
        8
    }
  },

  recommendedProfiles: [
    {
      _id:
        'candidate-1',

      profileId:
        'KSM100001',

      firstName:
        'Priya',

      age:
        26,

      height:
        165,

      profilePhoto:
        '',

      location: {
        city:
          'Ahmedabad',

        nativeDistrict:
          'Rajkot',

        nativeState:
          'Gujarat'
      },

      education: {
        highestEducation:
          'MBA'
      },

      career: {
        occupation:
          'Consultant'
      },

      community: {
        clan:
          'Jadeja',

        vansh:
          'Suryavanshi'
      },

      compatibility: {
        score:
          89
      },

      shortlisted:
        true,

      interestSent:
        true,

      interestStatus:
        'Pending'
    },

    {
      _id:
        'candidate-2',

      profileId:
        'KSM100002',

      firstName:
        'Kavya',

      age:
        25,

      height:
        162,

      profilePhoto:
        '',

      location: {
        nativeDistrict:
          'Jamnagar',

        nativeState:
          'Gujarat'
      },

      education: {
        highestEducation:
          'B.E.'
      },

      career: {
        occupation:
          'Engineer'
      },

      community: {
        clan:
          'Gohil',

        vansh:
          'Agnivanshi'
      },

      compatibility: {
        score:
          84
      },

      shortlisted:
        false,

      interestSent:
        false,

      interestStatus:
        null
    }
  ]
};

const renderDashboard =
  () =>
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

beforeEach(
  () => {
    apiMock.mockReset();

    notifyMock.mockReset();

    apiMock.mockImplementation(
      (
        path,
        options = {}
      ) => {
        if (
          path ===
            '/dashboard'
        ) {
          return Promise.resolve({
            data:
              structuredClone(
                baseDashboard
              )
          });
        }

        if (
          path ===
            '/interests' &&
          options.method ===
            'POST'
        ) {
          return Promise.resolve({
            data: {}
          });
        }

        if (
          path ===
            '/shortlist' &&
          options.method ===
            'POST'
        ) {
          return Promise.resolve({
            data: {}
          });
        }

        return Promise.resolve({
          data: {}
        });
      }
    );
  }
);

describe(
  'DashboardPage',
  () => {
    test(
      'renders actionable dashboard stats and membership usage',
      async () => {
        renderDashboard();

        expect(
  (
    await screen.findAllByText(
      'Premium Plan'
    )
  ).length
).toBeGreaterThanOrEqual(
  2
);

        expect(
          screen.getByText(
            'Interests remaining'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            '24'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Contact unlocks remaining'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            '8'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'link',
            {
              name:
                /Profiles waiting for your response/i
            }
          )
        ).toHaveAttribute(
          'href',
          '/interests'
        );

        expect(
          screen.getByRole(
            'link',
            {
              name:
                /Accepted connections and active matches/i
            }
          )
        ).toHaveAttribute(
          'href',
          '/matches'
        );

        expect(
          screen.getByRole(
            'link',
            {
              name:
                /Profiles you saved for later/i
            }
          )
        ).toHaveAttribute(
          'href',
          '/shortlisted'
        );

        expect(
          screen.getByRole(
            'link',
            {
              name:
                /Unread account and match updates/i
            }
          )
        ).toHaveAttribute(
          'href',
          '/notifications'
        );

        expect(
          screen.getByText(
            'Advanced Search'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Profile Boost'
          )
        ).toBeInTheDocument();
      }
    );

    test(
      'renders recommendation relationship state returned by dashboard API',
      async () => {
        renderDashboard();

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                'Priya'
            }
          )
        ).toBeInTheDocument();

        expect(
  screen.getAllByText(
    'Shortlisted'
  ).length
).toBeGreaterThanOrEqual(
  2
);

        expect(
          screen.getByText(
            'Interest pending'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'button',
            {
              name:
                'Profile shortlisted'
            }
          )
        ).toBeDisabled();

        expect(
          screen.getByText(
            'Rajkot, Gujarat'
          )
        ).toBeInTheDocument();

        expect(
          screen.queryByText(
            'Ahmedabad'
          )
        ).not.toBeInTheDocument();
      }
    );

    test(
      'expressing interest updates recommendation state without reloading dashboard',
      async () => {
        renderDashboard();

        await screen.findByRole(
          'heading',
          {
            name:
              'Kavya'
          }
        );

        const buttons =
          screen.getAllByRole(
            'button',
            {
              name:
                /Express interest/i
            }
          );

        fireEvent.click(
          buttons[0]
        );

        await waitFor(
          () => {
            expect(
              apiMock
            ).toHaveBeenCalledWith(
              '/interests',
              expect.objectContaining({
                method:
                  'POST'
              })
            );
          }
        );

        await waitFor(
          () => {
            expect(
              screen.getAllByText(
                /Interest sent/i
              ).length
            ).toBeGreaterThan(
              0
            );
          }
        );
      }
    );

    test(
      'shortlisting a recommendation updates the dashboard count and locks the card action',
      async () => {
        renderDashboard();

        await screen.findByRole(
          'heading',
          {
            name:
              'Kavya'
          }
        );

        const shortlistButtons =
          screen.getAllByRole(
            'button',
            {
              name:
                /Shortlist/i
            }
          );

        const available =
          shortlistButtons.find(
            (
              button
            ) =>
              !button.disabled
          );

        fireEvent.click(
          available
        );

        await waitFor(
          () => {
            expect(
              apiMock
            ).toHaveBeenCalledWith(
              '/shortlist',
              expect.objectContaining({
                method:
                  'POST'
              })
            );
          }
        );

        await waitFor(
          () => {
            expect(
              screen.getAllByText(
                'Shortlisted'
              ).length
            ).toBeGreaterThanOrEqual(
              2
            );
          }
        );

        expect(
          screen.getAllByRole(
            'button',
            {
              name:
                'Profile shortlisted'
            }
          ).length
        ).toBeGreaterThanOrEqual(
          2
        );
      }
    );

    test(
      'shows profile creation actions when member has no matrimonial profile',
      async () => {
        apiMock.mockImplementation(
          (
            path
          ) => {
            if (
              path ===
              '/dashboard'
            ) {
              return Promise.resolve({
                data: {
                  profile:
                    null,

                  profileCompletion:
                    0,

                  profileStatus:
                    'not_created',

                  recommendedProfiles:
                    [],

                  membership: {
                    plan: {
                      name:
                        'Free',

                      slug:
                        'free'
                    },

                    features:
                      {},

                    usage: {
                      interestsUsed:
                        0,

                      contactViewsUsed:
                        0,

                      interestsRemaining:
                        5,

                      contactViewsRemaining:
                        0
                    }
                  }
                }
              });
            }

            return Promise.resolve({
              data: {}
            });
          }
        );

        renderDashboard();

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                /Create your matrimonial profile/i
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'link',
            {
              name:
                /Start profile/i
            }
          )
        ).toHaveAttribute(
          'href',
          '/onboarding'
        );

        expect(
          screen.getByRole(
            'link',
            {
              name:
                /View plans/i
            }
          )
        ).toHaveAttribute(
          'href',
          '/membership'
        );
      }
    );

    test(
      'uses the real preferences route in quick actions',
      async () => {
        renderDashboard();

        await screen.findByText(
          'Tune preferences'
        );

        expect(
          screen.getByRole(
            'link',
            {
              name:
                /Tune preferences/i
            }
          )
        ).toHaveAttribute(
          'href',
          '/preferences'
        );
      }
    );
  }
);