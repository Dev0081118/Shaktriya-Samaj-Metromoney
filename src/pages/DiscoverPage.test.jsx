import {
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';

import {
  MemoryRouter,
  useLocation
} from 'react-router-dom';

import {
  beforeEach,
  describe,
  expect,
  test,
  vi
} from 'vitest';

import DiscoverPage from './DiscoverPage';

const apiMock =
  vi.fn();

const notifyMock =
  vi.fn();

let advancedSearch =
  false;

const profiles = [
  {
    _id:
      'profile-1',

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

      gotra:
        'Vashishtha',

      vansh:
        'Suryavanshi'
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
      'profile-2',

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

      gotra:
        'Kashyap',

      vansh:
        'Agnivanshi'
    },

    shortlisted:
      false,

    interestSent:
      false,

    interestStatus:
      null
  }
];

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

function LocationProbe() {
  const location =
    useLocation();

  return (
    <output data-testid="location">
      {location.search}
    </output>
  );
}

const renderDiscover =
  (
    initialEntry = '/discover'
  ) =>
    render(
      <MemoryRouter
        initialEntries={[
          initialEntry
        ]}
      >
        <DiscoverPage />

        <LocationProbe />
      </MemoryRouter>
    );

beforeEach(
  () => {
    advancedSearch =
      false;

    apiMock.mockReset();

    notifyMock.mockReset();

    apiMock.mockImplementation(
      (
        path,
        options = {}
      ) => {
        if (
          path ===
          '/entitlements'
        ) {
          return Promise.resolve({
            data: {
              entitlements: {
                advancedSearch
              }
            }
          });
        }

        if (
          path.startsWith(
            '/profiles/discover?'
          )
        ) {
          return Promise.resolve({
            data: {
              profiles:
                structuredClone(
                  profiles
                ),

              pagination: {
                page:
                  1,

                limit:
                  12,

                total:
                  2,

                totalPages:
                  1
              }
            }
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

        if (
          path.startsWith(
            '/shortlist/'
          ) &&
          options.method ===
            'DELETE'
        ) {
          return Promise.resolve({
            data: {}
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

        return Promise.resolve({
          data: {}
        });
      }
    );
  }
);

describe(
  'DiscoverPage',
  () => {
    test(
      'loads discovery and renders native profile location',
      async () => {
        renderDiscover();

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
          screen.getByText(
            'Rajkot, Gujarat'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Jamnagar, Gujarat'
          )
        ).toBeInTheDocument();

        expect(
          apiMock
        ).toHaveBeenCalledWith(
          expect.stringMatching(
            /^\/profiles\/discover\?/
          )
        );
      }
    );

    test(
      'applies native district and state filters and keeps them in URL',
      async () => {
        renderDiscover();

        await screen.findByRole(
          'heading',
          {
            name:
              'Priya'
          }
        );

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /Filters/i
            }
          )
        );

        fireEvent.change(
          screen.getByLabelText(
            /Native District/i
          ),
          {
            target: {
              value:
                'Rajkot'
            }
          }
        );

        fireEvent.change(
          screen.getByLabelText(
            /Native State/i
          ),
          {
            target: {
              value:
                'Gujarat'
            }
          }
        );

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /Apply filters/i
            }
          )
        );

        await waitFor(
          () => {
            expect(
              apiMock
            ).toHaveBeenCalledWith(
              expect.stringContaining(
                'district=Rajkot'
              )
            );
          }
        );

        expect(
          apiMock
        ).toHaveBeenCalledWith(
          expect.stringContaining(
            'state=Gujarat'
          )
        );

        await waitFor(
          () => {
            const location =
              screen.getByTestId(
                'location'
              );

            expect(
              location.textContent
            ).toContain(
              'district=Rajkot'
            );

            expect(
              location.textContent
            ).toContain(
              'state=Gujarat'
            );
          }
        );
      }
    );

    test(
      'free member sees advanced filters locked and advanced values are not sent',
      async () => {
        renderDiscover();

        await screen.findByRole(
          'heading',
          {
            name:
              'Priya'
          }
        );

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /Filters/i
            }
          )
        );

        expect(
          screen.getByRole(
            'link',
            {
              name:
                /Upgrade to unlock/i
            }
          )
        ).toHaveAttribute(
          'href',
          '/membership'
        );

        expect(
          screen.getByLabelText(
            /Surname \/ Shakh/i
          )
        ).toBeDisabled();

        expect(
          screen.getByLabelText(
            /Gotra/i
          )
        ).toBeDisabled();

        expect(
          screen.getByLabelText(
            /Kul \/ Vansh/i
          )
        ).toBeDisabled();
      }
    );

    test(
      'paid member can apply Shakh Gotra Vansh and diet filters',
      async () => {
        advancedSearch =
          true;

        renderDiscover();

        await screen.findByRole(
          'heading',
          {
            name:
              'Priya'
          }
        );

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /Filters/i
            }
          )
        );

        fireEvent.change(
          screen.getByLabelText(
            /Surname \/ Shakh/i
          ),
          {
            target: {
              value:
                'Jadeja'
            }
          }
        );

        fireEvent.change(
          screen.getByLabelText(
            /Gotra/i
          ),
          {
            target: {
              value:
                'Vashishtha'
            }
          }
        );

        fireEvent.change(
          screen.getByLabelText(
            /Kul \/ Vansh/i
          ),
          {
            target: {
              value:
                'Suryavanshi'
            }
          }
        );

        fireEvent.change(
          screen.getByLabelText(
            /^Diet$/i
          ),
          {
            target: {
              value:
                'Vegetarian'
            }
          }
        );

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /Apply filters/i
            }
          )
        );

        await waitFor(
          () => {
            const discoverCalls =
              apiMock.mock.calls
                .map(
                  (
                    [
                      path
                    ]
                  ) =>
                    path
                )
                .filter(
                  (
                    path
                  ) =>
                    typeof path ===
                      'string' &&
                    path.startsWith(
                      '/profiles/discover?'
                    )
                );

            const latest =
              discoverCalls[
                discoverCalls.length -
                  1
              ];

            expect(
              latest
            ).toContain(
              'clan=Jadeja'
            );

            expect(
              latest
            ).toContain(
              'gotra=Vashishtha'
            );

            expect(
              latest
            ).toContain(
              'vansh=Suryavanshi'
            );

            expect(
              latest
            ).toContain(
              'diet=Vegetarian'
            );
          }
        );
      }
    );

    test(
      'can remove an existing shortlist directly from discovery',
      async () => {
        renderDiscover();

        await screen.findByRole(
          'heading',
          {
            name:
              'Priya'
          }
        );

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /Remove from shortlist/i
            }
          )
        );

        await waitFor(
          () => {
            expect(
              apiMock
            ).toHaveBeenCalledWith(
              '/shortlist/profile-1',
              expect.objectContaining({
                method:
                  'DELETE'
              })
            );
          }
        );

        await waitFor(
          () => {
            expect(
              screen.getAllByRole(
                'button',
                {
                  name:
                    /Shortlist/i
                }
              ).length
            ).toBeGreaterThanOrEqual(
              1
            );
          }
        );

        expect(
          notifyMock
        ).toHaveBeenCalledWith(
          'Removed from shortlist.'
        );
      }
    );

    test(
      'fresh profile can be shortlisted and sent an interest',
      async () => {
        renderDiscover();

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

        const freshShortlist =
          shortlistButtons.find(
            (
              button
            ) =>
              button.getAttribute(
                'aria-label'
              ) !==
              'Remove from shortlist'
          );

        fireEvent.click(
          freshShortlist
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

        const interestButtons =
          screen.getAllByRole(
            'button',
            {
              name:
                /Express interest/i
            }
          );

        fireEvent.click(
          interestButtons[0]
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
      }
    );

    test(
      'restores filters supplied in the URL',
      async () => {
        renderDiscover(
          '/discover?district=Rajkot&state=Gujarat&ageMin=24'
        );

        await screen.findByRole(
          'heading',
          {
            name:
              'Priya'
          }
        );

        const discoverCall =
          apiMock.mock.calls.find(
            (
              [
                path
              ]
            ) =>
              typeof path ===
                'string' &&
              path.startsWith(
                '/profiles/discover?'
              )
          )?.[0];

        expect(
          discoverCall
        ).toContain(
          'district=Rajkot'
        );

        expect(
          discoverCall
        ).toContain(
          'state=Gujarat'
        );

        expect(
          discoverCall
        ).toContain(
          'ageMin=24'
        );
      }
    );
  }
);