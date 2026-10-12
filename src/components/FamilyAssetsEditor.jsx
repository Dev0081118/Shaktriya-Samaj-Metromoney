import {
  Plus,
  Trash2
} from 'lucide-react';

const fieldClass =
  'w-full border border-[#ddd0c1] bg-[#fffdf8] px-[15px] py-[14px] text-[14px] text-[#191614] outline-none focus:border-[#681d25] focus:shadow-[0_0_0_3px_#681d2510]';

const labelClass =
  'grid gap-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#5e4e46]';

const buttonClass =
  'inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[99px] border border-[#cbb8a4] bg-transparent px-4 text-[11px] font-extrabold text-[#431318] transition hover:bg-white';

const cardClass =
  'relative mt-4 border border-[#ddd0c1] bg-[#fffdf8] p-4';

const gridClass =
  'grid grid-cols-2 gap-4 max-[680px]:grid-cols-1';

const ownershipOptions = [
  'Self Owned',
  'Family Owned',
  'Joint Family',
  'Ancestral',
  'Leased',
  'Partnership',
  'Other'
];

const propertyTypes = [
  'House',
  'Bungalow',
  'Flat',
  'Farm House',
  'Other'
];

const otherPropertyTypes = [
  'Plot',
  'Shop',
  'Office',
  'Warehouse',
  'Factory',
  'Commercial Property',
  'Other'
];

const areaUnits = [
  'Sq Ft',
  'Sq Yard',
  'Vigha',
  'Acre',
  'Hectare'
];

const landUnits = [
  'Vigha',
  'Acre',
  'Hectare'
];

const landTypes = [
  'Irrigated',
  'Non-Irrigated',
  'Mixed',
  'Other'
];

const visibilityOptions = [
  'AcceptedInterests',
  'MutualMatches',
  'Private'
];

const emptyAgricultureLand =
  () => ({
    hasLand:
      false,

    approximateArea:
      '',

    unit:
      'Vigha',

    village:
      '',

    taluka:
      '',

    district:
      '',

    state:
      '',

    landType:
      '',

    ownershipType:
      '',

    notes:
      ''
  });

const emptyResidentialProperty =
  () => ({
    propertyName:
      '',

    propertyType:
      'House',

    ownershipType:
      '',

    cityVillage:
      '',

    district:
      '',

    state:
      '',

    approximateArea:
      '',

    areaUnit:
      'Sq Ft',

    isPrimaryResidence:
      false,

    notes:
      ''
  });

const emptyOtherProperty =
  () => ({
    propertyName:
      '',

    propertyType:
      'Plot',

    ownershipType:
      '',

    cityVillage:
      '',

    district:
      '',

    state:
      '',

    approximateArea:
      '',

    areaUnit:
      'Sq Ft',

    notes:
      ''
  });

const emptyBusinessAsset =
  () => ({
    assetName:
      '',

    assetType:
      '',

    ownershipType:
      '',

    location:
      '',

    description:
      ''
  });

const asArray =
  (
    value
  ) =>
    Array.isArray(
      value
    )
      ? value
      : [];

const normalizeAssets =
  (
    value = {}
  ) => {
    const agricultureLand = {
      ...emptyAgricultureLand(),
      ...(value.agricultureLand ||
        {})
    };

    let residentialProperties =
      asArray(
        value.residentialProperties
      ).map(
        (
          item
        ) => ({
          ...emptyResidentialProperty(),
          ...item
        })
      );

    if (
      residentialProperties.length ===
        0 &&
      (
        value.primaryResidenceType ||
        value.propertySummary
      )
    ) {
      residentialProperties = [
        {
          ...emptyResidentialProperty(),

          propertyName:
            'Family Residence',

          propertyType:
            value.primaryResidenceType ||
            'House',

          notes:
            value.propertySummary ||
            ''
        }
      ];
    }

    let businessAssets =
      asArray(
        value.businessAssets
      ).map(
        (
          item
        ) => ({
          ...emptyBusinessAsset(),
          ...item
        })
      );

    if (
      businessAssets.length ===
        0 &&
      value.businessAssetsSummary
    ) {
      businessAssets = [
        {
          ...emptyBusinessAsset(),

          assetName:
            'Family Business Assets',

          description:
            value.businessAssetsSummary
        }
      ];
    }

    return {
      ...value,

      agricultureLand,

      residentialProperties,

      otherProperties:
        asArray(
          value.otherProperties
        ).map(
          (
            item
          ) => ({
            ...emptyOtherProperty(),
            ...item
          })
        ),

      businessAssets,

      assetSummary:
        value.assetSummary ||
        ''
    };
  };

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  min,
  placeholder,
  multiline = false
}) {
  return (
    <label
      className={
        labelClass
      }
    >
      {label}

      {multiline ? (
        <textarea
          className={
            fieldClass
          }
          rows="3"
          value={
            value ??
            ''
          }
          placeholder={
            placeholder
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target
                .value
            )
          }
        />
      ) : (
        <input
          className={
            fieldClass
          }
          type={
            type
          }
          min={
            min
          }
          value={
            value ??
            ''
          }
          placeholder={
            placeholder
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target
                .value
            )
          }
        />
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select'
}) {
  return (
    <label
      className={
        labelClass
      }
    >
      {label}

      <select
        className={
          fieldClass
        }
        value={
          value ??
          ''
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
      >
        <option value="">
          {placeholder}
        </option>

        {options.map(
          (
            option
          ) => (
            <option
              key={
                option
              }
              value={
                option
              }
            >
              {option}
            </option>
          )
        )}
      </select>
    </label>
  );
}

function CollectionHeader({
  title,
  description,
  buttonLabel,
  onAdd
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h4 className="font-['Cormorant_Garamond'] text-[24px] font-medium text-[#431318]">
          {title}
        </h4>

        <p className="mt-1 max-w-[560px] text-[10px] leading-5 text-[#756a60]">
          {description}
        </p>
      </div>

      <button
        type="button"
        className={
          buttonClass
        }
        onClick={
          onAdd
        }
      >
        <Plus
          size={
            14
          }
        />

        {buttonLabel}
      </button>
    </div>
  );
}

function RemoveButton({
  label,
  onClick
}) {
  return (
    <button
      type="button"
      aria-label={
        label
      }
      className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-[#ddd0c1] bg-[#fffdf8] text-[#681d25]"
      onClick={
        onClick
      }
    >
      <Trash2
        size={
          14
        }
      />
    </button>
  );
}

export default function FamilyAssetsEditor({
  value,
  onChange,
  visibility = 'Private',
  onVisibilityChange,
  stateOptions = []
}) {
  const assets =
    normalizeAssets(
      value
    );

  const setAgriculture =
    (
      key,
      nextValue
    ) => {
      onChange({
        ...assets,

        agricultureLand: {
          ...assets
            .agricultureLand,

          [key]:
            nextValue
        }
      });
    };

  const updateCollection =
    (
      collection,
      index,
      key,
      nextValue
    ) => {
      const next = [
        ...assets[
          collection
        ]
      ];

      next[
        index
      ] = {
        ...next[
          index
        ],

        [key]:
          nextValue
      };

      onChange({
        ...assets,

        [collection]:
          next
      });
    };

  const addCollection =
    (
      collection,
      emptyItem
    ) => {
      onChange({
        ...assets,

        [collection]: [
          ...assets[
            collection
          ],

          emptyItem()
        ]
      });
    };

  const removeCollection =
    (
      collection,
      index
    ) => {
      onChange({
        ...assets,

        [collection]:
          assets[
            collection
          ].filter(
            (
              _,
              itemIndex
            ) =>
              itemIndex !==
              index
          )
      });
    };

  return (
    <div className="mt-8 border-t border-[#ddd0c1] pt-7">
      <div className="mb-6">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#91683f]">
          Private family information
        </p>

        <h3 className="mt-1 font-['Cormorant_Garamond'] text-[30px] font-medium text-[#431318]">
          Family Assets / પરિવારની સંપત્તિ
        </h3>

        <p className="mt-2 max-w-[650px] text-[11px] leading-6 text-[#756a60]">
          Add agricultural land, family houses, plots,
          commercial property and business assets. Exact
          market value is intentionally not required.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-4 max-[680px]:grid-cols-1">
        <SelectField
          label="Asset visibility"
          value={
            visibility
          }
          onChange={
            onVisibilityChange
          }
          options={
            visibilityOptions
          }
        />

        <InputField
          label="Overall asset summary"
          multiline
          value={
            assets.assetSummary
          }
          placeholder="Example: 25 Vigha ancestral land, family bungalow and commercial property."
          onChange={(
            nextValue
          ) =>
            onChange({
              ...assets,

              assetSummary:
                nextValue
            })
          }
        />
      </div>

      <div className="border-t border-[#eee3d7] pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-['Cormorant_Garamond'] text-[24px] font-medium text-[#431318]">
              Agricultural Land / ખેતીની જમીન
            </h4>

            <p className="mt-1 text-[10px] leading-5 text-[#756a60]">
              Mention approximate area, ownership and
              location.
            </p>
          </div>

          <label className="flex items-center gap-2 text-[11px] font-bold text-[#431318]">
            <input
              type="checkbox"
              checked={
                !!assets
                  .agricultureLand
                  .hasLand
              }
              onChange={(
                event
              ) =>
                setAgriculture(
                  'hasLand',
                  event.target
                    .checked
                )
              }
            />

            Family owns agricultural land
          </label>
        </div>

        {assets
          .agricultureLand
          .hasLand && (
          <div className={`${gridClass} mt-5`}>
            <InputField
              label="Total land area"
              type="number"
              min="0"
              value={
                assets
                  .agricultureLand
                  .approximateArea
              }
              onChange={(
                nextValue
              ) =>
                setAgriculture(
                  'approximateArea',
                  nextValue
                )
              }
            />

            <SelectField
              label="Land unit"
              value={
                assets
                  .agricultureLand
                  .unit
              }
              onChange={(
                nextValue
              ) =>
                setAgriculture(
                  'unit',
                  nextValue
                )
              }
              options={
                landUnits
              }
            />

            <SelectField
              label="Land type"
              value={
                assets
                  .agricultureLand
                  .landType
              }
              onChange={(
                nextValue
              ) =>
                setAgriculture(
                  'landType',
                  nextValue
                )
              }
              options={
                landTypes
              }
            />

            <SelectField
              label="Ownership"
              value={
                assets
                  .agricultureLand
                  .ownershipType
              }
              onChange={(
                nextValue
              ) =>
                setAgriculture(
                  'ownershipType',
                  nextValue
                )
              }
              options={
                ownershipOptions
              }
            />

            <InputField
              label="Village"
              value={
                assets
                  .agricultureLand
                  .village
              }
              onChange={(
                nextValue
              ) =>
                setAgriculture(
                  'village',
                  nextValue
                )
              }
            />

            <InputField
              label="Taluka"
              value={
                assets
                  .agricultureLand
                  .taluka
              }
              onChange={(
                nextValue
              ) =>
                setAgriculture(
                  'taluka',
                  nextValue
                )
              }
            />

            <InputField
              label="District"
              value={
                assets
                  .agricultureLand
                  .district
              }
              onChange={(
                nextValue
              ) =>
                setAgriculture(
                  'district',
                  nextValue
                )
              }
            />

            <SelectField
              label="State"
              value={
                assets
                  .agricultureLand
                  .state
              }
              onChange={(
                nextValue
              ) =>
                setAgriculture(
                  'state',
                  nextValue
                )
              }
              options={
                stateOptions
              }
            />

            <InputField
              label="Land notes"
              multiline
              value={
                assets
                  .agricultureLand
                  .notes
              }
              onChange={(
                nextValue
              ) =>
                setAgriculture(
                  'notes',
                  nextValue
                )
              }
            />
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-[#eee3d7] pt-6">
        <CollectionHeader
          title="Residential Properties / રહેણાંક મિલકત"
          description="Add family house, bungalow, flat or farm house."
          buttonLabel="Add property"
          onAdd={() =>
            addCollection(
              'residentialProperties',
              emptyResidentialProperty
            )
          }
        />

        {assets.residentialProperties.map(
          (
            property,
            index
          ) => (
            <div
              className={
                cardClass
              }
              key={`residential-${index}`}
            >
              <RemoveButton
                label={`Remove residential property ${index + 1}`}
                onClick={() =>
                  removeCollection(
                    'residentialProperties',
                    index
                  )
                }
              />

              <div className={`${gridClass} pr-10`}>
                <InputField
                  label="Property name"
                  value={
                    property.propertyName
                  }
                  placeholder="Rana House"
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'residentialProperties',
                      index,
                      'propertyName',
                      nextValue
                    )
                  }
                />

                <SelectField
                  label="Property type"
                  value={
                    property.propertyType
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'residentialProperties',
                      index,
                      'propertyType',
                      nextValue
                    )
                  }
                  options={
                    propertyTypes
                  }
                />

                <SelectField
                  label="Ownership"
                  value={
                    property.ownershipType
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'residentialProperties',
                      index,
                      'ownershipType',
                      nextValue
                    )
                  }
                  options={
                    ownershipOptions
                  }
                />

                <InputField
                  label="Village / City"
                  value={
                    property.cityVillage
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'residentialProperties',
                      index,
                      'cityVillage',
                      nextValue
                    )
                  }
                />

                <InputField
                  label="District"
                  value={
                    property.district
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'residentialProperties',
                      index,
                      'district',
                      nextValue
                    )
                  }
                />

                <SelectField
                  label="State"
                  value={
                    property.state
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'residentialProperties',
                      index,
                      'state',
                      nextValue
                    )
                  }
                  options={
                    stateOptions
                  }
                />

                <InputField
                  label="Approximate area"
                  type="number"
                  min="0"
                  value={
                    property.approximateArea
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'residentialProperties',
                      index,
                      'approximateArea',
                      nextValue
                    )
                  }
                />

                <SelectField
                  label="Area unit"
                  value={
                    property.areaUnit
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'residentialProperties',
                      index,
                      'areaUnit',
                      nextValue
                    )
                  }
                  options={
                    areaUnits
                  }
                />

                <label className="flex items-center gap-3 text-[11px] font-bold text-[#431318]">
                  <input
                    type="checkbox"
                    checked={
                      !!property.isPrimaryResidence
                    }
                    onChange={(
                      event
                    ) =>
                      updateCollection(
                        'residentialProperties',
                        index,
                        'isPrimaryResidence',
                        event.target
                          .checked
                      )
                    }
                  />

                  Primary family residence
                </label>

                <InputField
                  label="Property notes"
                  multiline
                  value={
                    property.notes
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'residentialProperties',
                      index,
                      'notes',
                      nextValue
                    )
                  }
                />
              </div>
            </div>
          )
        )}
      </div>

      <div className="mt-8 border-t border-[#eee3d7] pt-6">
        <CollectionHeader
          title="Other Properties / અન્ય મિલકતો"
          description="Add plots, shops, offices, warehouses, factories or commercial properties."
          buttonLabel="Add other property"
          onAdd={() =>
            addCollection(
              'otherProperties',
              emptyOtherProperty
            )
          }
        />

        {assets.otherProperties.map(
          (
            property,
            index
          ) => (
            <div
              className={
                cardClass
              }
              key={`other-${index}`}
            >
              <RemoveButton
                label={`Remove other property ${index + 1}`}
                onClick={() =>
                  removeCollection(
                    'otherProperties',
                    index
                  )
                }
              />

              <div className={`${gridClass} pr-10`}>
                <InputField
                  label="Property name"
                  value={
                    property.propertyName
                  }
                  placeholder="Family Plot"
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'otherProperties',
                      index,
                      'propertyName',
                      nextValue
                    )
                  }
                />

                <SelectField
                  label="Property type"
                  value={
                    property.propertyType
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'otherProperties',
                      index,
                      'propertyType',
                      nextValue
                    )
                  }
                  options={
                    otherPropertyTypes
                  }
                />

                <SelectField
                  label="Ownership"
                  value={
                    property.ownershipType
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'otherProperties',
                      index,
                      'ownershipType',
                      nextValue
                    )
                  }
                  options={
                    ownershipOptions
                  }
                />

                <InputField
                  label="Village / City"
                  value={
                    property.cityVillage
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'otherProperties',
                      index,
                      'cityVillage',
                      nextValue
                    )
                  }
                />

                <InputField
                  label="District"
                  value={
                    property.district
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'otherProperties',
                      index,
                      'district',
                      nextValue
                    )
                  }
                />

                <SelectField
                  label="State"
                  value={
                    property.state
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'otherProperties',
                      index,
                      'state',
                      nextValue
                    )
                  }
                  options={
                    stateOptions
                  }
                />

                <InputField
                  label="Approximate area"
                  type="number"
                  min="0"
                  value={
                    property.approximateArea
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'otherProperties',
                      index,
                      'approximateArea',
                      nextValue
                    )
                  }
                />

                <SelectField
                  label="Area unit"
                  value={
                    property.areaUnit
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'otherProperties',
                      index,
                      'areaUnit',
                      nextValue
                    )
                  }
                  options={
                    areaUnits
                  }
                />

                <InputField
                  label="Property notes"
                  multiline
                  value={
                    property.notes
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'otherProperties',
                      index,
                      'notes',
                      nextValue
                    )
                  }
                />
              </div>
            </div>
          )
        )}
      </div>

      <div className="mt-8 border-t border-[#eee3d7] pt-6">
        <CollectionHeader
          title="Business Assets / વ્યવસાયિક સંપત્તિ"
          description="Add family business, factory, commercial assets or major business holdings."
          buttonLabel="Add business asset"
          onAdd={() =>
            addCollection(
              'businessAssets',
              emptyBusinessAsset
            )
          }
        />

        {assets.businessAssets.map(
          (
            asset,
            index
          ) => (
            <div
              className={
                cardClass
              }
              key={`business-${index}`}
            >
              <RemoveButton
                label={`Remove business asset ${index + 1}`}
                onClick={() =>
                  removeCollection(
                    'businessAssets',
                    index
                  )
                }
              />

              <div className={`${gridClass} pr-10`}>
                <InputField
                  label="Asset / Business name"
                  value={
                    asset.assetName
                  }
                  placeholder="Rana Agro"
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'businessAssets',
                      index,
                      'assetName',
                      nextValue
                    )
                  }
                />

                <InputField
                  label="Asset type"
                  value={
                    asset.assetType
                  }
                  placeholder="Trading business / Factory / Shop"
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'businessAssets',
                      index,
                      'assetType',
                      nextValue
                    )
                  }
                />

                <SelectField
                  label="Ownership"
                  value={
                    asset.ownershipType
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'businessAssets',
                      index,
                      'ownershipType',
                      nextValue
                    )
                  }
                  options={
                    ownershipOptions
                  }
                />

                <InputField
                  label="Location"
                  value={
                    asset.location
                  }
                  placeholder="Rajkot, Gujarat"
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'businessAssets',
                      index,
                      'location',
                      nextValue
                    )
                  }
                />

                <InputField
                  label="Description"
                  multiline
                  value={
                    asset.description
                  }
                  onChange={(
                    nextValue
                  ) =>
                    updateCollection(
                      'businessAssets',
                      index,
                      'description',
                      nextValue
                    )
                  }
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}