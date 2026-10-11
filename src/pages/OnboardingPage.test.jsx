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

  /*
   * Candidate's real marital status.
   */
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

    /*
     * Existing DB key remains clan.
     * UI presents this as Surname.
     */
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

    /*
     * Regression coverage for newly
     * supported family values.
     */
    familyValues:
      'Traditional',

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
      'Jadeja',

    /*
     * Canonical field.
     */
    maternalGotra:
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

  privacy: {
    photoVisibility:
      'RegisteredMembers',

    contactVisibility:
      'MutualMatches',

    incomeVisibility:
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
    'Family-oriented software professional.'
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
   * Intentional legacy field.
   *
   * This MUST NOT overwrite the
   * candidate's own maritalStatus.
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

const renderPage =
  () =>
    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

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
              profile: {
                ...profile,

                ...submitted,

                community: {
                  ...profile.community,
                  ...submitted.community
                },

                birthDetails: {
                  ...profile.birthDetails,
                  ...submitted.birthDetails
                },

                location: {
                  ...profile.location,
                  ...submitted.location
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
              }
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

            occupation:
              'Wrong Job'
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
          screen.getByText(
            /step\s+1\s+of 10/i
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
      'legacy partner preference maritalStatus never overwrites candidate marital status',
      async () => {
        renderPage();

        await screen.findByRole(
          'heading',
          {
            name:
              /let us begin with the essentials/i
          }
        );

        /*
         * Candidate = Never Married.
         * Legacy preference = Divorced.
         *
         * Candidate value must win.
         */
        expect(
          screen.getByLabelText(
            /marital status/i
          )
        ).toHaveValue(
          'Never Married'
        );

        expect(
          screen.queryByText(
            /private marital context/i
          )
        ).not.toBeInTheDocument();
      }
    );

    test(
      'existing profile restores surname based Samaj and personal fields correctly',
      async () => {
        renderPage();

        await screen.findByRole(
          'heading',
          {
            name:
              /let us begin with the essentials/i
          }
        );

        expect(
          screen.getByLabelText(
            /marital status/i
          )
        ).toHaveValue(
          'Never Married'
        );

        expect(
          screen.queryByLabelText(
            /complexion/i
          )
        ).not.toBeInTheDocument();

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /save & continue/i
            }
          )
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                /your rajput heritage and lineage/i
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.queryByLabelText(
            /^religion$/i
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByLabelText(
            /^caste$/i
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByLabelText(
            /sub-samaj/i
          )
        ).not.toBeInTheDocument();

        expect(
          screen.getByLabelText(
            /^surname$/i
          )
        ).toHaveValue(
          'Other'
        );

        expect(
          screen.getByLabelText(
            /surname - other/i
          )
        ).toHaveValue(
          'Rana'
        );

        expect(
          screen.getByLabelText(
            /^gotra$/i
          )
        ).toHaveValue(
          'Kashyap'
        );

        expect(
          screen.getByLabelText(
            /kul \/ vansh/i
          )
        ).toHaveValue(
          'Suryavanshi'
        );

        expect(
          screen.getByLabelText(
            /kuldevi/i
          )
        ).toHaveValue(
          'Ashapura Mata'
        );

        expect(
          screen.getByLabelText(
            /kuldevta/i
          )
        ).toHaveValue(
          'Mahadev'
        );

        expect(
          screen.getByLabelText(
            /native village \/ vatan/i
          )
        ).toHaveValue(
          'Khirasara'
        );

        expect(
          screen.getByLabelText(
            /native state/i
          )
        ).toHaveValue(
          'Gujarat'
        );

        expect(
          screen.getByLabelText(
            /family introduction/i
          )
        ).toHaveValue(
          'Traditional Rajput family.'
        );

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /save & continue/i
            }
          )
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                /lifestyle and personal introduction/i
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByLabelText(
            /birth time/i
          )
        ).toHaveValue(
          '10:45'
        );

        expect(
          screen.getByLabelText(
            /birth place/i
          )
        ).toHaveValue(
          'Rajkot'
        );

        expect(
          screen.getByLabelText(
            /birth district/i
          )
        ).toHaveValue(
          'Rajkot'
        );

        expect(
          screen.getByLabelText(
            /birth state/i
          )
        ).toHaveValue(
          'Gujarat'
        );

        expect(
          screen.getByLabelText(
            /blood group/i
          )
        ).toHaveValue(
          'B+'
        );

        expect(
          screen.getByLabelText(
            /birth state/i
          ).tagName
        ).toBe(
          'SELECT'
        );
      }
    );

    test(
      'changing marital status is included in the PATCH payload and does not revert to default',
      async () => {
        renderPage();

        await screen.findByRole(
          'heading',
          {
            name:
              /let us begin with the essentials/i
          }
        );

        const maritalStatus =
          screen.getByLabelText(
            /marital status/i
          );

        expect(
          maritalStatus
        ).toHaveValue(
          'Never Married'
        );

        fireEvent.change(
          maritalStatus,
          {
            target: {
              value:
                'Divorced'
            }
          }
        );

        expect(
          maritalStatus
        ).toHaveValue(
          'Divorced'
        );

        expect(
          screen.getByText(
            /private marital context/i
          )
        ).toBeInTheDocument();

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /save & continue/i
            }
          )
        );

        await waitFor(
          () => {
            const saveCall =
              apiMock.mock.calls.find(
                (
                  call
                ) =>
                  call[0] ===
                    '/profiles/me' &&
                  call[1]
                    ?.method ===
                    'PATCH'
              );

            expect(
              saveCall
            ).toBeTruthy();

            const payload =
              JSON.parse(
                saveCall[1].body
              );

            expect(
              payload.maritalStatus
            ).toBe(
              'Divorced'
            );

            expect(
              payload.maritalHistory
                .status
            ).toBe(
              'Divorced'
            );

            expect(
              payload.maritalHistory
                .isRemarriage
            ).toBe(
              true
            );
          }
        );

        expect(
          await screen.findByRole(
            'heading',
            {
              name:
                /your rajput heritage and lineage/i
            }
          )
        ).toBeInTheDocument();

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /go back/i
            }
          )
        );

        expect(
          await screen.findByLabelText(
            /marital status/i
          )
        ).toHaveValue(
          'Divorced'
        );
      }
    );

    test(
      'existing profile save includes family values and canonical maternal Gotra without Sub-Samaj',
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
                '/profiles/me' &&
              call[1]
                ?.method ===
                'PATCH'
          );

        const payload =
          JSON.parse(
            saveCall[1].body
          );

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
            .familyLocation
        ).toBe(
          'Gujarat'
        );

        expect(
          payload.maternalFamily
            .maternalGotra
        ).toBe(
          'Vashishtha'
        );

        expect(
          payload.maternalFamily
        ).not.toHaveProperty(
          'notes'
        );

        expect(
          payload.community
        ).not.toHaveProperty(
          'subCommunity'
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

        expect(
          payload.family
            .siblingDetails[0]
            .spouseName
        ).toBe(
          'Jay Jadeja'
        );

        expect(
          payload.family
            .siblingDetails[0]
            .spouseFamilySurname
        ).toBe(
          'Jadeja'
        );
      }
    );

    test(
      'existing profile uses PATCH and preserves active visibility when manually saved',
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
                '/profiles/me' &&
              call[1]
                ?.method ===
                'PATCH'
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
          payload.maritalStatus
        ).toBe(
          'Never Married'
        );

        expect(
          payload.community
            .gotra
        ).toBe(
          'Kashyap'
        );

        expect(
          payload.community
            .name
        ).toBe(
          'Rajput / Kshatriya'
        );

        expect(
          payload.community
            .clan
        ).toBe(
          'Rana'
        );

        expect(
          payload.education
            .university
        ).toBe(
          'GTU'
        );

        expect(
          payload.visibility
        ).toBe(
          'active'
        );

        expect(
          payload
        ).not.toHaveProperty(
          'complexion'
        );

        expect(
          payload.community
        ).not.toHaveProperty(
          'religion'
        );

        expect(
          payload.community
        ).not.toHaveProperty(
          'caste'
        );

        expect(
          payload.community
        ).not.toHaveProperty(
          'subCommunity'
        );
      }
    );
  }
);