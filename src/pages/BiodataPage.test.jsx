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
    name:
      'Rajput / Kshatriya',

    /*
     * Legacy field intentionally exists in
     * fixture but must not be rendered.
     */
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
    occupationType:
      'Private Job',

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
      'Joint Family',

    familyValues:
      'Traditional',

    familyLocation:
      'Gujarat',

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
      'Jadeja',

    maternalGotra:
      'Vashishtha'
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
      'renders the core Rajput matrimonial biodata fields using current terminology',
      async () => {
        render(
          <MemoryRouter>
            <BiodataPage />
          </MemoryRouter>
        );

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
          screen.queryByText(
            'Sub-Samaj'
          )
        ).not.toBeInTheDocument();

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
            'Mahadev'
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
            'GTU'
          )
        ).toBeInTheDocument();

        /*
         * New family fields.
         */
        expect(
          screen.getByText(
            'Family Values'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Traditional'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Family Residence State'
          )
        ).toBeInTheDocument();

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
      'sensitive lineage uses canonical maternal Gotra and updated sibling terminology',
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
                'Mosal Details'
            }
          )
        ).not.toBeInTheDocument();

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
                'Mosal Details'
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Maternal Gotra'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Vashishtha'
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
          screen.getByText(
            'Life Partner Name'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Jay Jadeja'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Life Partner Surname'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Sasariyu / Village'
          )
        ).toBeInTheDocument();

        const gondalLocations =
        screen.getAllByText(
            /Gondal.*Rajkot.*Gujarat/
        );

        expect(
        gondalLocations.length
        ).toBeGreaterThanOrEqual(
        1
        );
      }
    );

    test(
      'legacy maternal notes remain readable as a maternal Gotra fallback',
      async () => {
        apiMock.mockResolvedValue({
          data: {
            profile: {
              ...profile,

              maternalFamily: {
                ...profile.maternalFamily,

                maternalGotra:
                  undefined,

                notes:
                  'Legacy Gotra'
              }
            }
          }
        });

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
          screen.getByText(
            'Maternal Gotra'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Legacy Gotra'
          )
        ).toBeInTheDocument();
      }
    );

    test(
      'contact assets and astrology sections respect biodata privacy toggles',
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