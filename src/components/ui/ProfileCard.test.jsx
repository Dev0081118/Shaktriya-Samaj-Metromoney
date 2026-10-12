import {
  fireEvent,
  render,
  screen
} from '@testing-library/react';

import {
  MemoryRouter
} from 'react-router-dom';

import {
  describe,
  expect,
  test,
  vi
} from 'vitest';

import ProfileCard from './ProfileCard';

vi.mock(
  '../../services/api',
  () => ({
    assetUrl:
      (
        value
      ) =>
        value ||
        ''
  })
);

const profile = {
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
    city:
      'Ahmedabad',

    district:
      'Ahmedabad',

    state:
      'Gujarat',

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

  verification: {
    adminVerified:
      true
  },

  compatibility: {
    score:
      89
  }
};

const renderCard =
  (
    props = {}
  ) =>
    render(
      <MemoryRouter>
        <ProfileCard
          profile={{
            ...profile,
            ...props.profile
          }}
          onShortlist={
            props.onShortlist
          }
          onInterest={
            props.onInterest
          }
        />
      </MemoryRouter>
    );

describe(
  'ProfileCard',
  () => {
    test(
      'shows native district and state instead of private current city',
      () => {
        renderCard();

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

        expect(
          screen.getByText(
            'Jadeja · Suryavanshi'
          )
        ).toBeInTheDocument();
      }
    );

    test(
      'locks shortlist and interest actions when already used',
      () => {
        const onShortlist =
          vi.fn();

        const onInterest =
          vi.fn();

        renderCard({
          profile: {
            shortlisted:
              true,

            interestSent:
              true,

            interestStatus:
              'Pending'
          },

          onShortlist,

          onInterest
        });

        const shortlist =
          screen.getByRole(
            'button',
            {
              name:
                'Profile shortlisted'
            }
          );

        expect(
          shortlist
        ).toBeDisabled();

        expect(
          screen.getByText(
            'Shortlisted'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Interest pending'
          )
        ).toBeInTheDocument();

        fireEvent.click(
          shortlist
        );

        expect(
          onShortlist
        ).not.toHaveBeenCalled();

        expect(
          onInterest
        ).not.toHaveBeenCalled();
      }
    );

    test(
      'shows accepted interest state',
      () => {
        renderCard({
          profile: {
            interestSent:
              true,

            interestStatus:
              'Accepted'
          }
        });

        expect(
          screen.getAllByText(
            /Interest accepted/i
          ).length
        ).toBeGreaterThanOrEqual(
          1
        );
      }
    );

    test(
      'calls actions for a fresh recommendation',
      () => {
        const onShortlist =
          vi.fn();

        const onInterest =
          vi.fn();

        renderCard({
          profile: {
            shortlisted:
              false,

            interestSent:
              false,

            interestStatus:
              null
          },

          onShortlist,

          onInterest
        });

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /Shortlist/i
            }
          )
        );

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /Express interest/i
            }
          )
        );

        expect(
          onShortlist
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          onShortlist
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            _id:
              'profile-1'
          })
        );

        expect(
          onInterest
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          onInterest
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            _id:
              'profile-1'
          })
        );
      }
    );

    test(
      'links to profile detail page',
      () => {
        renderCard();

        expect(
          screen.getByRole(
            'link',
            {
              name:
                /View profile/i
            }
          )
        ).toHaveAttribute(
          'href',
          '/profile/KSM100001'
        );
      }
    );
  }
);