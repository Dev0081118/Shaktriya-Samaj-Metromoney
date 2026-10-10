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

import OnboardingPage from './OnboardingPage';

const apiMock =
  vi.fn();

const notifyMock =
  vi.fn();

vi.mock(
  '../context/AuthContext',
  () => ({
    useAuth:
      () => ({
        user: {
          email:
            'raj@example.com',

          phone:
            '+919876543210',

          phoneVerified:
            true
        }
      })
  })
);

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

const profile = {
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

  gender:
    'Male',

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

  visibility:
    'active',

  birthDetails: {
    timeOfBirth:
      '10:45',

    city:
      'Rajkot',

    district:
      'Rajkot',

    state:
      'Gujarat',

    country:
      'India'
  },

  location: {
    city:
      'Rajkot',

    taluka:
      'Rajkot',

    district:
      'Rajkot',

    state:
      'Gujarat',

    country:
      'India',

    nativePlace:
      'Khirasara',

    nativeTaluka:
      'Lodhika',

    nativeDistrict:
      'Rajkot',

    nativeState:
      'Gujarat'
  },

  community: {
    religion:
      'Hinduism',

    caste:
      'Rajput',

    name:
      'Kshatriya',

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
      'Traditional Rajput family.'
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
      'GTU',

    educationDetails:
      'Engineering studies.'
  },

  career: {
    occupationType:
      'Job',

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
      'Joint',

    familyLocation:
      'Rajkot',

    familyDescription:
      'Traditional family.',

    siblingDetails: []
  },

  paternalFamily: {
    ancestralVillage:
      'Khirasara',

    nativePlace:
      'Khirasara',

    taluka:
      'Lodhika',

    district:
      'Rajkot',

    state:
      'Gujarat',

    familySurname:
      'Rana',

    clan:
      'Rana',

    gotra:
      'Kashyap'
  },

  maternalFamily: {
    maternalGrandfatherName:
      'Grandfather',

    maternalFamilySurname:
      'Jadeja',

    maternalNativePlace:
      'Gondal',

    maternalVillage:
      'Gondal',

    maternalTaluka:
      'Gondal',

    maternalDistrict:
      'Rajkot',

    maternalState:
      'Gujarat',

    maternalClan:
      'Jadeja'
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
    },

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

  contactDetails: {
    currentAddress: {
      addressLine1:
        'Kalawad Road',

      city:
        'Rajkot',

      district:
        'Rajkot',

      state:
        'Gujarat',

      pincode:
        '360005',

      country:
        'India'
    },

    guardianName:
      'Father Rana',

    guardianRelation:
      'Father',

    guardianPhone:
      '+919999999999',

    selfPhone:
      '+919876543210',

    email:
      'raj@example.com'
  },

  familyAssets: {
    agricultureLand: {
      hasLand:
        true,

      approximateArea:
        12,

      unit:
        'Vigha'
    },

    propertySummary:
      'Family property.',

    primaryResidenceType:
      'Owned House'
  },

  privacy: {
    photoVisibility:
      'RegisteredMembers',

    contactVisibility:
      'MutualMatches',

    incomeVisibility:
      'Private',

    familyVisibility:
      'RegisteredMembers',

    familyOverviewVisibility:
      'AcceptedInterests',

    maternalFamilyVisibility:
      'AcceptedInterests',

    siblingDetailsVisibility:
      'AcceptedInterests',

    assetVisibility:
      'Private',

    astrologyVisibility:
      'RegisteredMembers',

    contactAddressVisibility:
      'Private',

    fullNameVisibility:
      'RegisteredMembers'
  },

  biodataPrivacy: {
    includeSensitiveFamilyDetailsInBiodata:
      true,

    includeContactDetailsInBiodata:
      false,

    includeAstrologyInBiodata:
      true,

    includeAssetsInBiodata:
      false
  }
};

const preferences = {
  ageMin:
    22,

  ageMax:
    28,

  states: [
    'Gujarat'
  ]
};

beforeEach(
  () => {
    apiMock.mockReset();

    notifyMock.mockReset();

    localStorage.clear();

    apiMock.mockImplementation(
      (
        path
      ) => {
        if (
          path ===
          '/profiles/me?optional=true'
        ) {
          return Promise.resolve({
            data: {
              profile
            }
          });
        }

        if (
          path ===
          '/preferences?optional=true'
        ) {
          return Promise.resolve({
            data: {
              preferences
            }
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
  'OnboardingPage profile editing',
  () => {
    test(
      'server profile wins over stale local onboarding draft',
      async () => {
        localStorage.setItem(
          'ksm_onboarding',
          JSON.stringify({
            profileFor:
              'Self',

            firstName:
              '',

            dateOfBirth:
              '',

            city:
              'Wrong City',

            clan:
              'Wrong Clan',

            occupation:
              'Wrong Job'
          })
        );

        localStorage.setItem(
          'ksm_onboarding_step',
          '7'
        );

        render(
          <MemoryRouter>
            <OnboardingPage />
          </MemoryRouter>
        );

        expect(
          await screen.findByText(
            /who are you creating this profile for/i
          )
        ).toBeInTheDocument();

        /*
         * Existing server profile forces
         * the editor back to step 1 rather
         * than restoring stale step 8.
         */
        expect(
          screen.getByText(
            /step 1 of 10/i
          )
        ).toBeInTheDocument();

        /*
         * Existing profile mode removes the
         * stale browser onboarding draft.
         */
        expect(
          localStorage.getItem(
            'ksm_onboarding'
          )
        ).toBeNull();

        expect(
          localStorage.getItem(
            'ksm_onboarding_step'
          )
        ).toBeNull();
      }
    );

    test(
      'existing DOB and nested biodata fields are restored into the edit form',
      async () => {
        render(
          <MemoryRouter>
            <OnboardingPage />
          </MemoryRouter>
        );

        await screen.findByText(
          /who are you creating this profile for/i
        );

        /*
         * Step 1 -> verification.
         */
        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /continue/i
            }
          )
        );

        expect(
          await screen.findByText(
            /verify the account mobile number/i
          )
        ).toBeInTheDocument();

        /*
         * phoneVerified=true, so step 2
         * can continue without OTP work.
         */
        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /continue/i
            }
          )
        );

        expect(
          await screen.findByText(
            /tell us the essential details/i
          )
        ).toBeInTheDocument();

        expect(
          screen.getByLabelText(
            /first name/i
          )
        ).toHaveValue(
          'Raj'
        );

        expect(
          screen.getByLabelText(
            /date of birth/i
          )
        ).toHaveValue(
          '1998-05-14'
        );

        expect(
          screen.getByLabelText(
            /time of birth/i
          )
        ).toHaveValue(
          '10:45'
        );

        expect(
          screen.getByLabelText(
            /birth city/i
          )
        ).toHaveValue(
          'Rajkot'
        );

        expect(
          screen.getByLabelText(
            /blood group/i
          )
        ).toHaveValue(
          'B+'
        );

        /*
         * Continue to Rajput heritage.
         */
        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /continue/i
            }
          )
        );

        expect(
          await screen.findByText(
            /share lineage, vatan and community/i
          )
        ).toBeInTheDocument();

        expect(
          screen.getByLabelText(
            /gotra/i
          )
        ).toHaveValue(
          'Kashyap'
        );

        expect(
          screen.getByLabelText(
            /vansh/i
          )
        ).toHaveValue(
          'Suryavanshi'
        );

        expect(
          screen.getByLabelText(
            /kula devi/i
          )
        ).toHaveValue(
          'Ashapura Mata'
        );

        expect(
          screen.getByLabelText(
            /native village \/ vatan/i
          )
        ).toHaveValue(
          'Khirasara'
        );
      }
    );

    test(
      'editing an existing profile sends PATCH instead of creating another profile',
      async () => {
        render(
          <MemoryRouter>
            <OnboardingPage />
          </MemoryRouter>
        );

        await screen.findByText(
          /who are you creating this profile for/i
        );

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /save & exit/i
            }
          )
        );

        await waitFor(
          () => {
            expect(
              apiMock
            ).toHaveBeenCalledWith(
              '/profiles/me',
              expect.objectContaining({
                method:
                  'PATCH'
              })
            );
          }
        );

        const saveCall =
          apiMock.mock.calls.find(
            (
              call
            ) =>
              call[0] ===
              '/profiles/me'
          );

        const payload =
          JSON.parse(
            saveCall[1].body
          );

        expect(
          payload.dateOfBirth
        ).toBe(
          '1998-05-14'
        );

        expect(
          payload.community
            .gotra
        ).toBe(
          'Kashyap'
        );

        expect(
          payload.education
            .university
        ).toBe(
          'GTU'
        );

        expect(
          payload
            .maternalLineage
            .selfMosal
            .familySurname
        ).toBe(
          'Jadeja'
        );

        expect(
          payload.visibility
        ).toBe(
          'active'
        );
      }
    );
  }
);