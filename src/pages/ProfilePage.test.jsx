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
        value
      ) =>
        value ||
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

  dateOfBirth:
    '1998-05-14T00:00:00.000Z',

  height:
    178,

  bloodGroup:
    'B+',

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
      'Nagvanshi',

    kulaDevi:
      'Ashapura Mata',

    ishtaDevta:
      'Mahadev',

    familyOrigin:
      'Legacy family introduction'
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
      'Defence Contractor',

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
      'Satvik',

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

    familyValues:
      'Traditional',

    familyLocation:
      'Gujarat',

    familyDescription:
      'Traditional family.',

    siblingDetails:
      []
  },

  maternalFamily: {
    maternalGrandfatherName:
      'Maternal Grandfather',

    maternalFamilySurname:
      'Legacy Jadeja',

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

    maternalGotra:
      'Legacy Vashishtha'
  },

  maternalLineage: {
    fathersMosal: {
      grandmotherName:
        'Paternal Grandmother',

      familySurname:
        'Gohil',

      nativeVillage:
        'Bhavnagar',

      district:
        'Bhavnagar',

      state:
        'Gujarat'
    },

    mothersMosal: {
      grandmotherName:
        'Maternal Grandmother',

      familySurname:
        'Chudasama',

      nativeVillage:
        'Junagadh',

      district:
        'Junagadh',

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
      'renders current Rajput profile fields and hides removed legacy fields',
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

        expect(
          screen.getByText(
            'Rajput lineage'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Surname'
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
            'Nagvanshi'
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
            'Defence Contractor'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Satvik'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Family values'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Traditional'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Maternal Shakh'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Jadeja'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Father's Mosal"
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Mother's Mosal"
          )
        ).toBeInTheDocument();

        expect(
          screen.queryByText(
            'Kuldevta'
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            'Mahadev'
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            'Family Residence State'
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            'Maternal Gotra'
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            'Legacy Vashishtha'
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            'Maternal Family Surname'
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            'Legacy Jadeja'
          )
        ).not.toBeInTheDocument();

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
            'Sub-Samaj'
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            /14 May 1998/i
          )
        ).not.toBeInTheDocument();

        expect(
          screen.getAllByText(
            '28 years'
          ).length
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
      'shows phone and WhatsApp only when contact is unlocked',
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

        expect(
          screen.getByRole(
            'link',
            {
              name:
                /\+919876543210/i
            }
          )
        ).toHaveAttribute(
          'href',
          'tel:+919876543210'
        );

        const whatsappLinks =
          screen
            .getAllByRole(
              'link'
            )
            .filter(
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
      'keeps contact hidden before accepted request is unlocked',
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
          screen.queryByText(
            'Contact information'
          )
        ).not.toBeInTheDocument();
      }
    );
  }
);