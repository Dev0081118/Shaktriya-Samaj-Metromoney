import {
  fireEvent,
  render,
  screen
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

import BiodataPage from './BiodataPage';

const apiMock =
  vi.fn();

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
  profileId:
    'KSM100001',

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

    clan:
      'Rana',

    gotra:
      'Kashyap',

    vansh:
      'Suryavanshi',

    kulaDevi:
      'Ashapura Mata',

    ishtaDevta:
      'Mahadev'
  },

  education: {
    highestEducation:
      'Bachelor of Engineering',

    degree:
      'B.E.',

    college:
      'VVP Engineering College',

    university:
      'GTU'
  },

  career: {
    occupation:
      'Software Developer',

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

        spouseFamilySurname:
          'Jadeja',

        spouseVillage:
          'Gondal',

        spouseDistrict:
          'Rajkot',

        spouseState:
          'Gujarat'
      }
    ]
  },

  paternalFamily: {
    familySurname:
      'Rana',

    clan:
      'Rana',

    gotra:
      'Kashyap',

    ancestralVillage:
      'Khirasara',

    district:
      'Rajkot',

    state:
      'Gujarat'
  },

  maternalFamily: {
    maternalGrandfatherName:
      'Maternal Grandfather',

    maternalFamilySurname:
      'Jadeja',

    maternalVillage:
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
      'Family residential property.',

    primaryResidenceType:
      'Owned House'
  },

  biodataPrivacy: {
    includeSensitiveFamilyDetailsInBiodata:
      false,

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

beforeEach(
  () => {
    apiMock.mockReset();

    apiMock.mockResolvedValue({
      data: {
        profile
      }
    });
  }
);

describe(
  'BiodataPage',
  () => {
    test(
      'renders the core master biodata fields from the owner profile',
      async () => {
        render(
          <MemoryRouter>
            <BiodataPage />
          </MemoryRouter>
        );

        /*
         * Full name appears both in the
         * document heading and Personal
         * Details. Target the semantic h1
         * so the assertion stays unambiguous.
         */
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
            'Marriage Bio-Data'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Rajput Heritage'
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Education & Career'
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Kashyap'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Suryavanshi'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Ashapura Mata'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'GTU'
          )
        ).toBeInTheDocument();

        /*
         * "Astrology" also exists as a
         * toolbar checkbox label, so verify
         * the actual biodata section heading.
         */
        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Astrology'
            }
          )
        ).toBeInTheDocument();

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
      'sensitive lineage contact and assets only appear when explicitly enabled',
      async () => {
        render(
          <MemoryRouter>
            <BiodataPage />
          </MemoryRouter>
        );

        await screen.findByRole(
          'heading',
          {
            level:
              1,

            name:
              'Raj V Rana'
          }
        );

        /*
         * Stored biodata privacy defaults:
         *
         * family lineage = OFF
         * contact details = OFF
         * assets = OFF
         * astrology = ON
         */
        expect(
          screen.queryByRole(
            'heading',
            {
              name:
                'Paternal Lineage'
            }
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByRole(
            'heading',
            {
              name:
                'Three-Generation Mosal'
            }
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByRole(
            'heading',
            {
              name:
                'Contact Details'
            }
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByRole(
            'heading',
            {
              name:
                'Family Assets'
            }
          )
        ).not.toBeInTheDocument();

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Astrology'
            }
          )
        ).toBeInTheDocument();

        /*
         * Enable sensitive family lineage.
         */
        fireEvent.click(
          screen.getByRole(
            'checkbox',
            {
              name:
                /family lineage/i
            }
          )
        );

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Paternal Lineage'
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Maternal Family'
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Three-Generation Mosal'
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Siblings & Marriage Relations'
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Self Mosal'
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                "Father's Mosal"
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                "Mother's Mosal"
            }
          )
        ).toBeInTheDocument();

        /*
         * Enable contact details.
         */
        fireEvent.click(
          screen.getByRole(
            'checkbox',
            {
              name:
                /contact details/i
            }
          )
        );

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Contact Details'
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            /360005/
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'raj@example.com'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            '+919999999999'
          )
        ).toBeInTheDocument();

        /*
         * Enable asset information.
         */
        fireEvent.click(
          screen.getByRole(
            'checkbox',
            {
              name:
                /family assets/i
            }
          )
        );

        expect(
          screen.getByRole(
            'heading',
            {
              name:
                'Family Assets'
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Owned House'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            '12 Vigha'
          )
        ).toBeInTheDocument();

        /*
         * Toggle astrology OFF and ensure
         * the printed section disappears,
         * while the checkbox itself remains.
         */
        fireEvent.click(
          screen.getByRole(
            'checkbox',
            {
              name:
                /^astrology$/i
            }
          )
        );

        expect(
          screen.queryByRole(
            'heading',
            {
              name:
                'Astrology'
            }
          )
        ).not.toBeInTheDocument();

        expect(
          screen.queryByText(
            'Mesh'
          )
        ).not.toBeInTheDocument();
      }
    );
  }
);