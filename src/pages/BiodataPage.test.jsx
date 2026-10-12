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
        value
      ) =>
        value ||
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
      'Mahadev'
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
      'Legacy Jadeja',

    maternalVillage:
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

    residentialProperties: [
      {
        propertyName:
          'Rana House',

        propertyType:
          'Bungalow',

        ownershipType:
          'Family Owned',

        cityVillage:
          'Rajkot',

        district:
          'Rajkot',

        state:
          'Gujarat',

        isPrimaryResidence:
          true
      }
    ]
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
      'renders current core biodata fields and excludes removed legacy fields',
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
            'Gotra'
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
            'Family Values'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Traditional'
          )
        ).toBeInTheDocument();

        expect(
          screen.queryByText(
            'Sub-Samaj'
          )
        ).not.toBeInTheDocument();

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
      'sensitive lineage shows Maternal Shakh and Mosal but not removed maternal fields',
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
                'Mosal Details'
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Maternal Shakh'
          )
        ).toBeInTheDocument();

        expect(
  screen.getAllByText(
    'Jadeja'
  ).length
).toBeGreaterThanOrEqual(
  1
);

        expect(
          screen.getByText(
            'Maternal Native Place'
          )
        ).toBeInTheDocument();

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
          screen.getByRole(
            'heading',
            {
              name:
                'Extended Mosal'
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
            'Life Partner Surname'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Sasariyu / Village'
          )
        ).toBeInTheDocument();
      }
    );

    test(
      'contact assets and astrology owner-side print toggles work independently',
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
            '12 Vigha'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Rana House'
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