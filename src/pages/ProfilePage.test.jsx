import {
  render,
  screen
} from '@testing-library/react';

import {
  MemoryRouter,
  Route,
  Routes
} from 'react-router-dom';

import {
  beforeEach,
  describe,
  expect,
  test,
  vi
} from 'vitest';

import ProfilePage from './ProfilePage';

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
        path
      ) =>
        path ||
        ''
  })
);

const publicProfile = {
  _id:
    'profile-1',

  profileId:
    'KSM100001',

  profileFor:
    'Self',

  firstName:
    'Raj',

  middleName:
    'V',

  lastName:
    'Rana',

  age:
    28,

  /*
   * Public serializer should normally
   * remove this, but keeping it in this
   * fixture verifies the UI itself does
   * not display exact DOB for visitors.
   */
  dateOfBirth:
    '1998-05-14T00:00:00.000Z',

  height:
    178,

  bloodGroup:
    'B+',

  /*
   * Legacy value intentionally retained.
   * Dedicated-community UI must ignore it.
   */
  complexion:
    'Wheatish',

  maritalStatus:
    'Never Married',

  aboutMe:
    'Family-oriented software professional.',

  location: {
    city:
      'Rajkot',

    district:
      'Rajkot',

    state:
      'Gujarat',

    nativePlace:
      'Khirasara',

    nativeTaluka:
      'Lodhika',

    nativeDistrict:
      'Rajkot',

    nativeState:
      'Gujarat'
  },

  birthDetails: {
    timeOfBirth:
      '10:45',

    city:
      'Rajkot',

    district:
      'Rajkot',

    state:
      'Gujarat'
  },

  community: {
    /*
     * Legacy generic values intentionally
     * retained so the test guarantees the
     * new UI does not render them.
     */
    religion:
      'Hinduism',

    caste:
      'Rajput',

    name:
      'Rajput / Kshatriya',

    subCommunity:
      'Rajput',

    clan:
      'Rana',

    gotra:
      'Kashyap',

    vansh:
      'Suryavanshi',

    kulaDevi:
      'Ashapura Mata',

    ishtaDevta:
      'Mahadev',

    familyOrigin:
      'Traditional Rajput family from Saurashtra.'
  },

  education: {
    highestEducation:
      'Bachelor of Engineering',

    degree:
      'B.E.',

    specialization:
      'Information Technology',

    college:
      'VVP Engineering College',

    university:
      'GTU'
  },

  career: {
    occupationType:
      'Private Job',

    occupation:
      'Software Developer',

    designation:
      'Full Stack Developer',

    companyName:
      'Savvy Infotech',

    annualIncome:
      900000,

    workLocation: {
      city:
        'Rajkot',

      state:
        'Gujarat',

      country:
        'India'
    }
  },

  lifestyle: {
    diet:
      'Vegetarian',

    smoking:
      'No',

    drinking:
      'No',

    interests: [
      'Technology',
      'Travel'
    ]
  },

  family: {
    fatherName:
      'Father Rana',

    fatherOccupation:
      'Business',

    motherName:
      'Mother Rana',

    motherOccupation:
      'Homemaker',

    familyType:
      'Joint Family',

    familyLocation:
      'Rajkot',

    familyDescription:
      'Traditional family.',

    siblingDetails: []
  },

  maternalFamily: {
    maternalGrandfatherName:
      'Maternal Grandfather',

    maternalFamilySurname:
      'Jadeja',

    maternalVillage:
      'Gondal',

    maternalTaluka:
      'Gondal',

    maternalDistrict:
      'Rajkot',

    maternalState:
      'Gujarat',

    maternalClan:
      'Jadeja',

    notes:
      'Vashishtha'
  },

  maternalLineage: {
    selfMosal: {
      mamaName:
        'Mama Jadeja',

      familySurname:
        'Jadeja',

      clanSurname:
        'Jadeja',

      nativeVillage:
        'Gondal',

      district:
        'Rajkot',

      state:
        'Gujarat'
    }
  },

  astrology: {
    rashi:
      'Mesh',

    nakshatra:
      'Ashwini',

    manglik:
      'No'
  },

  verification: {
    adminVerified:
      true
  }
};

const renderPublicProfile =
  () =>
    render(
      <MemoryRouter
        initialEntries={[
          '/profile/KSM100001'
        ]}
      >
        <Routes>
          <Route
            path="/profile/:profileId"
            element={
              <ProfilePage />
            }
          />
        </Routes>
      </MemoryRouter>
    );

beforeEach(
  () => {
    apiMock.mockReset();

    notifyMock.mockReset();
  }
);

describe(
  'ProfilePage',
  () => {
    test(
      'renders Rajput-specific profile terminology and hides generic matrimony fields',
      async () => {
        apiMock.mockResolvedValue({
          data: {
            profile:
              publicProfile,

            actionState: {
              interestSent:
                false,

              shortlisted:
                false,

              contactRequest:
                null
            },

            compatibility: {
              score:
                82,

              matchedFactors: [
                'Location',
                'Education'
              ]
            }
          }
        });

        renderPublicProfile();

        expect(
          await screen.findByRole(
            'heading',
            {
              level:
                1,

              name:
                'Raj V Rana'
            }
          )
        ).toBeInTheDocument();

        /*
         * Dedicated Rajput / Kshatriya
         * terminology.
         */
        expect(
          screen.getByText(
            'Rajput lineage'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Shakh'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Rana'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Gotra'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Kashyap'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Kul / Vansh'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Suryavanshi'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Kuldevi'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Ashapura Mata'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Kuldevta'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Mahadev'
          )
        ).toBeInTheDocument();

        /*
         * Generic matrimony fields are
         * intentionally absent from the
         * dedicated-community UI.
         */
        expect(
          screen.queryByText(
            'Complexion'
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            'Religion'
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            'Caste'
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            'Community'
          )
        ).not.toBeInTheDocument();

        /*
         * Public visitors must not see the
         * exact DOB even if a malformed API
         * response accidentally contains it.
         */
        expect(
          screen.queryByText(
            /14 May 1998/i
          )
        ).not.toBeInTheDocument();

        /*
         * Age intentionally appears twice:
         * once in the hero summary and once
         * in Personal Details.
         */
        const ageValues =
          screen.getAllByText(
            '28 years'
          );

        expect(
          ageValues.length
        ).toBeGreaterThanOrEqual(
          2
        );

        expect(
          screen.getByText(
            'Mesh'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Ashwini'
          )
        ).toBeInTheDocument();
      }
    );

    test(
      'shows phone and WhatsApp only when contact has been unlocked',
      async () => {
        apiMock.mockResolvedValue({
          data: {
            profile: {
              ...publicProfile,

              contact: {
                phone:
                  '+919876543210',

                whatsappPhone:
                  '+919876543210',

                email:
                  'raj@example.com'
              }
            },

            actionState: {
              interestSent:
                true,

              shortlisted:
                false,

              contactRequest: {
                id:
                  'contact-request-1',

                status:
                  'Accepted',

                unlocked:
                  true,

                incoming:
                  false
              }
            }
          }
        });

        renderPublicProfile();

        await screen.findByRole(
          'heading',
          {
            level:
              1,

            name:
              'Raj V Rana'
          }
        );

        const phoneLink =
          screen.getByRole(
            'link',
            {
              name:
                /\+919876543210/i
            }
          );

        expect(
          phoneLink
        ).toHaveAttribute(
          'href',
          'tel:+919876543210'
        );

        const whatsappLinks =
          screen.getAllByRole(
            'link'
          ).filter(
            (
              link
            ) =>
              link.getAttribute(
                'href'
              ) ===
              'https://wa.me/919876543210'
          );

        expect(
          whatsappLinks.length
        ).toBeGreaterThan(
          0
        );

        expect(
          screen.getByText(
            'Contact information'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'raj@example.com'
          )
        ).toBeInTheDocument();
      }
    );

    test(
      'keeps contact hidden before the request is unlocked',
      async () => {
        apiMock.mockResolvedValue({
          data: {
            profile:
              publicProfile,

            actionState: {
              interestSent:
                true,

              shortlisted:
                false,

              contactRequest: {
                id:
                  'contact-request-1',

                status:
                  'Accepted',

                unlocked:
                  false,

                incoming:
                  false
              }
            }
          }
        });

        renderPublicProfile();

        await screen.findByRole(
          'heading',
          {
            level:
              1,

            name:
              'Raj V Rana'
          }
        );

        expect(
          screen.getByRole(
            'button',
            {
              name:
                /unlock contact/i
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.queryByRole(
            'link',
            {
              name:
                /\+919876543210/i
            }
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByRole(
            'link',
            {
              name:
                /whatsapp/i
            }
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            'Contact information'
          )
        ).not.toBeInTheDocument();
      }
    );
  }
);