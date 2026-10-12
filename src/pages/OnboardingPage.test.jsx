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
    name:
      'Rajput / Kshatriya',

    clan:
      'Rana',

    gotra:
      'Kashyap',

    vansh:
      'Suryavanshi',

    kulaDevi:
      'Ashapura Mata',

    /*
     * Legacy data deliberately remains in
     * the fixture. New UI must ignore it.
     */
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
      'GTU',

    educationDetails:
      'Engineering studies.'
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

    familyValues:
      'Traditional',

    /*
     * Legacy data. New UI must not render it.
     */
    familyLocation:
      'Gujarat',

    familyDescription:
      'Traditional family.',

    siblingDetails: [
      {
        relation:
          'Sister',

        name:
          'Sister Rana',

        education:
          'MBA',

        occupation:
          'Manager',

        maritalStatus:
          'Married',

        spouseName:
          'Jay Jadeja',

        spouseFamilySurname:
          'Jadeja',

        spouseVillage:
          'Gondal'
      }
    ]
  },

  maternalFamily: {
    maternalGrandfatherName:
      'Grandfather',

    maternalFamilySurname:
      'Legacy Jadeja',

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

  privacy: {
    fullNameVisibility:
      'RegisteredMembers',

    photoVisibility:
      'RegisteredMembers',

    incomeVisibility:
      'Private',

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
      'Private'
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
  },

  aboutMe:
    'Family-oriented software professional.',

  profilePhoto:
    '/profile.webp',

  galleryAssets:
    []
};

const preferences = {
  ageMin:
    22,

  ageMax:
    28,

  states: [
    'Gujarat',
    'Rajasthan'
  ],

  countries: [
    'India'
  ],

  dietPreferences: [
    'Vegetarian'
  ],

  communityPreferences: [
    'Jadeja'
  ],

  /*
   * Intentional old field. It must never
   * overwrite candidate maritalStatus.
   */
  maritalStatus: [
    'Divorced'
  ],

  acceptedMaritalStatuses: [
    'Divorced'
  ],

  willingForRemarriage:
    'Open to Discuss',

  locations: [
    'Rajkot'
  ],

  educationPreferences: [
    'Graduate'
  ],

  occupationPreferences: [
    'Professional'
  ],

  additionalPreferences:
    'Family oriented'
};

const mergeProfile =
  (
    submitted
  ) => ({
    ...profile,
    ...submitted,

    birthDetails: {
      ...profile.birthDetails,
      ...submitted.birthDetails
    },

    location: {
      ...profile.location,
      ...submitted.location
    },

    community: {
      ...profile.community,
      ...submitted.community
    },

    education: {
      ...profile.education,
      ...submitted.education
    },

    career: {
      ...profile.career,
      ...submitted.career,

      workLocation: {
        ...profile.career
          .workLocation,
        ...submitted.career
          ?.workLocation
      }
    },

    lifestyle: {
      ...profile.lifestyle,
      ...submitted.lifestyle
    },

    family: {
      ...profile.family,
      ...submitted.family
    },

    maternalFamily: {
      ...profile.maternalFamily,
      ...submitted.maternalFamily
    },

    maternalLineage: {
      ...profile.maternalLineage,
      ...submitted.maternalLineage
    },

    astrology: {
      ...profile.astrology,
      ...submitted.astrology
    },

    privacy: {
      ...profile.privacy,
      ...submitted.privacy
    },

    biodataPrivacy: {
      ...profile.biodataPrivacy,
      ...submitted.biodataPrivacy
    }
  });

const renderPage =
  () =>
    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

const saveCall =
  () =>
    apiMock.mock.calls
      .filter(
        (
          call
        ) =>
          call[0] ===
            '/profiles/me' &&
          call[1]
            ?.method ===
            'PATCH'
      )
      .at(
        -1
      );

const savePayload =
  () =>
    JSON.parse(
      saveCall()[1]
        .body
    );

const continueTo =
  async (
    heading
  ) => {
    fireEvent.click(
      screen.getByRole(
        'button',
        {
          name:
            /save & continue/i
        }
      )
    );

    return screen.findByRole(
      'heading',
      {
        level:
          1,

        name:
          heading
      }
    );
  };

beforeEach(
  () => {
    apiMock.mockReset();

    notifyMock.mockReset();

    localStorage.clear();

    apiMock.mockImplementation(
      (
        path,
        options = {}
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

        if (
          path ===
            '/profiles/me' &&
          options.method ===
            'PATCH'
        ) {
          const submitted =
            JSON.parse(
              options.body
            );

          return Promise.resolve({
            data: {
              profile:
                mergeProfile(
                  submitted
                )
            }
          });
        }

        if (
          path ===
            '/preferences' &&
          options.method ===
            'PUT'
        ) {
          return Promise.resolve({
            data: {
              preferences:
                JSON.parse(
                  options.body
                )
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
  'OnboardingPage profile flow',
  () => {
    test(
      'server profile wins over stale local draft and partner preference never overwrites candidate marital status',
      async () => {
        localStorage.setItem(
          'ksm_onboarding',
          JSON.stringify({
            firstName:
              'Wrong',

            maritalStatus:
              'Widowed'
          })
        );

        localStorage.setItem(
          'ksm_onboarding_step',
          '7'
        );

        renderPage();

        expect(
          await screen.findByRole(
            'heading',
            {
              level:
                1,

              name:
                /let us begin with the essentials/i
            }
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
            /marital status/i
          )
        ).toHaveValue(
          'Never Married'
        );

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
      'community step removes retired fields and supports custom Kul Vansh',
      async () => {
        renderPage();

        await screen.findByRole(
          'heading',
          {
            name:
              /let us begin with the essentials/i
          }
        );

        await continueTo(
          /your rajput heritage and lineage/i
        );

        expect(
          screen.queryByLabelText(
            /kuldevta/i
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByLabelText(
            /sub-samaj/i
          )
        ).not.toBeInTheDocument();

        const vansh =
          screen.getByLabelText(
            /^kul \/ vansh$/i
          );

        expect(
          vansh
        ).toHaveValue(
          'Suryavanshi'
        );

        fireEvent.change(
          vansh,
          {
            target: {
              value:
                'Other'
            }
          }
        );

        fireEvent.change(
          screen.getByLabelText(
            /other kul \/ vansh/i
          ),
          {
            target: {
              value:
                'Nagvanshi'
            }
          }
        );

        await continueTo(
          /lifestyle and personal introduction/i
        );

        expect(
          savePayload()
            .community
            .vansh
        ).toBe(
          'Nagvanshi'
        );

        expect(
          savePayload()
            .community
        ).not.toHaveProperty(
          'ishtaDevta'
        );
      }
    );

    test(
      'Diet Other and Employment Type Other save the entered values instead of the word Other',
      async () => {
        renderPage();

        await screen.findByRole(
          'heading',
          {
            name:
              /let us begin with the essentials/i
          }
        );

        await continueTo(
          /your rajput heritage and lineage/i
        );

        await continueTo(
          /lifestyle and personal introduction/i
        );

        const diet =
          screen.getByLabelText(
            /^diet$/i
          );

        fireEvent.change(
          diet,
          {
            target: {
              value:
                'Other'
            }
          }
        );

        fireEvent.change(
          screen.getByLabelText(
            /other diet/i
          ),
          {
            target: {
              value:
                'Satvik'
            }
          }
        );

        await continueTo(
          /academic background/i
        );

        expect(
          savePayload()
            .lifestyle
            .diet
        ).toBe(
          'Satvik'
        );

        await continueTo(
          /professional journey/i
        );

        const employmentType =
          screen.getByLabelText(
            /^employment type$/i
          );

        fireEvent.change(
          employmentType,
          {
            target: {
              value:
                'Other'
            }
          }
        );

        fireEvent.change(
          screen.getByLabelText(
            /other employment type/i
          ),
          {
            target: {
              value:
                'Defence Contractor'
            }
          }
        );

        await continueTo(
          /your family background/i
        );

        expect(
          savePayload()
            .career
            .occupationType
        ).toBe(
          'Defence Contractor'
        );
      }
    );

    test(
      'family and Mosal steps no longer render removed duplicate fields',
      async () => {
        renderPage();

        await screen.findByRole(
          'heading',
          {
            name:
              /let us begin with the essentials/i
          }
        );

        await continueTo(
          /your rajput heritage and lineage/i
        );

        await continueTo(
          /lifestyle and personal introduction/i
        );

        await continueTo(
          /academic background/i
        );

        await continueTo(
          /professional journey/i
        );

        await continueTo(
          /your family background/i
        );

        expect(
          screen.queryByLabelText(
            /family residence state/i
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByLabelText(
            /overall asset summary/i
          )
        ).not.toBeInTheDocument();

        await continueTo(
          /maternal family and lineage/i
        );

        expect(
          screen.queryByLabelText(
            /^maternal family surname$/i
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByLabelText(
            /maternal gotra/i
          )
        ).not.toBeInTheDocument();

        expect(
          screen.getByLabelText(
            /maternal surname \/ shakh/i
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
      }
    );

    test(
      'manual save does not write removed legacy fields',
      async () => {
        renderPage();

        await screen.findByRole(
          'heading',
          {
            name:
              /let us begin with the essentials/i
          }
        );

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /^save$/i
            }
          )
        );

        await waitFor(
          () => {
            expect(
              saveCall()
            ).toBeTruthy();
          }
        );

        const payload =
          savePayload();

        expect(
          payload.maritalStatus
        ).toBe(
          'Never Married'
        );

        expect(
          payload.family
            .familyValues
        ).toBe(
          'Traditional'
        );

        expect(
          payload.family
        ).not.toHaveProperty(
          'familyLocation'
        );

        expect(
          payload.community
        ).not.toHaveProperty(
          'ishtaDevta'
        );

        expect(
          payload.community
        ).not.toHaveProperty(
          'subCommunity'
        );

        expect(
          payload.maternalFamily
        ).not.toHaveProperty(
          'maternalFamilySurname'
        );

        expect(
          payload.maternalFamily
        ).not.toHaveProperty(
          'maternalGotra'
        );

        expect(
          payload.maternalLineage
            .fathersMosal
            .familySurname
        ).toBe(
          'Gohil'
        );

        expect(
          payload.maternalLineage
            .mothersMosal
            .familySurname
        ).toBe(
          'Chudasama'
        );
      }
    );

    test(
      'last step provides profile-view privacy controls matching the creation flow',
      async () => {
        renderPage();

        await screen.findByRole(
          'heading',
          {
            name:
              /let us begin with the essentials/i
          }
        );

        await continueTo(
          /your rajput heritage and lineage/i
        );

        await continueTo(
          /lifestyle and personal introduction/i
        );

        await continueTo(
          /academic background/i
        );

        await continueTo(
          /professional journey/i
        );

        await continueTo(
          /your family background/i
        );

        await continueTo(
          /maternal family and lineage/i
        );

        await continueTo(
          /traditional matching information/i
        );

        await continueTo(
          /complete your matrimonial presentation/i
        );

        expect(
          screen.queryByText(
            /include contact details/i
          )
        ).not.toBeInTheDocument();

        await continueTo(
          /review your match preferences and privacy/i
        );

        expect(
          screen.getByText(
            /final privacy review/i
          )
        ).toBeInTheDocument();

        expect(
          screen.getByLabelText(
            /^full name$/i
          )
        ).toHaveValue(
          'RegisteredMembers'
        );

        expect(
          screen.getByLabelText(
            /profile photos/i
          )
        ).toHaveValue(
          'RegisteredMembers'
        );

        expect(
          screen.getByLabelText(
            /annual income/i
          )
        ).toHaveValue(
          'Private'
        );

        expect(
          screen.getByLabelText(
            /^family details$/i
          )
        ).toHaveValue(
          'AcceptedInterests'
        );

        expect(
          screen.getByLabelText(
            /mosal \/ maternal family/i
          )
        ).toHaveValue(
          'AcceptedInterests'
        );

        expect(
          screen.getByLabelText(
            /sibling details/i
          )
        ).toHaveValue(
          'AcceptedInterests'
        );

        expect(
          screen.getByLabelText(
            /family assets/i
          )
        ).toHaveValue(
          'Private'
        );

        expect(
          screen.getByLabelText(
            /birth & horoscope/i
          )
        ).toHaveValue(
          'RegisteredMembers'
        );

        expect(
          screen.getByText(
            /phone and email require the contact-request/i
          )
        ).toBeInTheDocument();
      }
    );
  }
);