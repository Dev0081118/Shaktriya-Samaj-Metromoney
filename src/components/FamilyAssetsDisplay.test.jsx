import {
  render,
  screen
} from '@testing-library/react';

import {
  describe,
  expect,
  test
} from 'vitest';

import FamilyAssetsDisplay from './FamilyAssetsDisplay';

const assets = {
  agricultureLand: {
    hasLand:
      true,

    approximateArea:
      25,

    unit:
      'Vigha',

    village:
      'Khirasara',

    district:
      'Rajkot',

    state:
      'Gujarat',

    landType:
      'Irrigated',

    ownershipType:
      'Ancestral'
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

      approximateArea:
        3500,

      areaUnit:
        'Sq Ft',

      isPrimaryResidence:
        true
    }
  ],

  otherProperties: [
    {
      propertyName:
        'Family Plot',

      propertyType:
        'Plot',

      ownershipType:
        'Joint Family',

      cityVillage:
        'Gondal',

      district:
        'Rajkot',

      state:
        'Gujarat'
    }
  ],

  businessAssets: [
    {
      assetName:
        'Rana Agro',

      assetType:
        'Trading Business',

      ownershipType:
        'Family Owned',

      location:
        'Rajkot, Gujarat',

      description:
        'Agricultural trading business'
    }
  ]
};

describe(
  'FamilyAssetsDisplay',
  () => {
    test(
      'renders structured family assets',
      () => {
        render(
          <FamilyAssetsDisplay
            assets={
              assets
            }
          />
        );

        expect(
          screen.getByText(
            '25 Vigha'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Rana House'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Family Plot'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Rana Agro'
          )
        ).toBeInTheDocument();
      }
    );

    test(
      'renders legacy asset data',
      () => {
        render(
          <FamilyAssetsDisplay
            assets={{
              primaryResidenceType:
                'Owned House',

              propertySummary:
                'Legacy family property.',

              businessAssetsSummary:
                'Legacy business assets.'
            }}
          />
        );

        expect(
          screen.getByText(
            'Owned House'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Legacy family property.'
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            'Legacy business assets.'
          )
        ).toBeInTheDocument();
      }
    );
  }
);