import {
  FAMILY_TYPES,
  FAMILY_VALUES,
  SMOKING_OPTIONS,
  DRINKING_OPTIONS
} from '../../data/profileOptions';

const IMPORTANCE_OPTIONS = [
  'Low',
  'Medium',
  'High',
  'Must Have'
];

const fieldClass =
  'w-full border border-[#ddd0c1] bg-[#fffdf8] px-[15px] py-[14px] text-[14px] text-[#191614] outline-none transition focus:border-[#681d25] focus:shadow-[0_0_0_3px_#681d2510]';

const labelClass =
  'grid gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#5e4e46]';

const sectionClass =
  'grid gap-5 border border-[#e2d5c7] bg-[#faf6f0] p-5';

const titleClass =
  "font-['Cormorant_Garamond'] text-[27px] font-medium text-[#431318]";

const csv =
  (
    value
  ) =>
    Array.isArray(
      value
    )
      ? value.join(
          ', '
        )
      : value ||
        '';

function ImportanceField({
  value,
  onChange
}) {
  return (
    <label
      className={
        labelClass
      }
    >
      Importance

      <select
        className={
          fieldClass
        }
        value={
          value ||
          'Medium'
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
      >
        {IMPORTANCE_OPTIONS.map(
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

function RangeFields({
  title,
  minLabel,
  maxLabel,
  minValue,
  maxValue,
  min,
  max,
  unit,
  importance,
  onMinChange,
  onMaxChange,
  onImportanceChange
}) {
  return (
    <section
      className={
        sectionClass
      }
    >
      <div>
        <h3
          className={
            titleClass
          }
        >
          {title}
        </h3>

        {unit && (
          <p className="mt-1 text-[10px] text-[#8b7d72]">
            {unit}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 max-[800px]:grid-cols-1">
        <label
          className={
            labelClass
          }
        >
          {minLabel}

          <input
            className={
              fieldClass
            }
            type="number"
            min={
              min
            }
            max={
              max
            }
            value={
              minValue ??
              ''
            }
            onChange={(
              event
            ) =>
              onMinChange(
                event.target.value
              )
            }
          />
        </label>

        <label
          className={
            labelClass
          }
        >
          {maxLabel}

          <input
            className={
              fieldClass
            }
            type="number"
            min={
              min
            }
            max={
              max
            }
            value={
              maxValue ??
              ''
            }
            onChange={(
              event
            ) =>
              onMaxChange(
                event.target.value
              )
            }
          />
        </label>

        <ImportanceField
          value={
            importance
          }
          onChange={
            onImportanceChange
          }
        />
      </div>
    </section>
  );
}

function CsvField({
  title,
  label,
  value,
  placeholder,
  importance,
  onChange,
  onImportanceChange
}) {
  return (
    <section
      className={
        sectionClass
      }
    >
      <h3
        className={
          titleClass
        }
      >
        {title}
      </h3>

      <div className="grid grid-cols-[minmax(0,1fr)_220px] gap-4 max-[767px]:grid-cols-1">
        <label
          className={
            labelClass
          }
        >
          {label}

          <input
            className={
              fieldClass
            }
            value={
              csv(
                value
              )
            }
            placeholder={
              placeholder
            }
            onChange={(
              event
            ) =>
              onChange(
                event.target.value
              )
            }
          />
        </label>

        <ImportanceField
          value={
            importance
          }
          onChange={
            onImportanceChange
          }
        />
      </div>
    </section>
  );
}

function SelectCsvField({
  title,
  label,
  value,
  options,
  importance,
  onChange,
  onImportanceChange
}) {
  return (
    <section
      className={
        sectionClass
      }
    >
      <h3
        className={
          titleClass
        }
      >
        {title}
      </h3>

      <div className="grid grid-cols-[minmax(0,1fr)_220px] gap-4 max-[767px]:grid-cols-1">
        <label
          className={
            labelClass
          }
        >
          {label}

          <select
            multiple
            className={`${fieldClass} min-h-[130px]`}
            value={
              Array.isArray(
                value
              )
                ? value
                : []
            }
            onChange={(
              event
            ) =>
              onChange(
                Array.from(
                  event.target
                    .selectedOptions
                ).map(
                  (
                    option
                  ) =>
                    option.value
                )
              )
            }
          >
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

        <ImportanceField
          value={
            importance
          }
          onChange={
            onImportanceChange
          }
        />
      </div>
    </section>
  );
}

function PropertyField({
  label,
  value,
  importance,
  onChange,
  onImportanceChange
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_220px] gap-4 max-[767px]:grid-cols-1">
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
            value ||
            'Any'
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
        >
          <option value="Any">
            No preference
          </option>

          <option value="Yes">
            Yes
          </option>

          <option value="No">
            No
          </option>
        </select>
      </label>

      <ImportanceField
        value={
          importance
        }
        onChange={
          onImportanceChange
        }
      />
    </div>
  );
}

export default function PartnerPreferencesForm({
  value = {},
  onChange
}) {
  const update =
    (
      key,
      nextValue
    ) => {
      onChange({
        ...value,

        [
          key
        ]:
          nextValue
      });
    };

  const updateImportance =
    (
      key,
      nextValue
    ) => {
      onChange({
        ...value,

        importance: {
          ...(
            value.importance ||
            {}
          ),

          [
            key
          ]:
            nextValue
        }
      });
    };

  const updateIncome =
    (
      key,
      nextValue
    ) => {
      onChange({
        ...value,

        incomePreferences: {
          ...(
            value.incomePreferences ||
            {}
          ),

          [
            key
          ]:
            nextValue
        }
      });
    };

  const updateProperty =
    (
      key,
      nextValue
    ) => {
      onChange({
        ...value,

        propertyPreferences: {
          ownResidence:
            'Any',

          agricultureLand:
            'Any',

          businessAssets:
            'Any',

          ...(
            value.propertyPreferences ||
            {}
          ),

          [
            key
          ]:
            nextValue
        }
      });
    };

  return (
    <div className="grid gap-6">
      <section
        className={
          sectionClass
        }
      >
        <div>
          <h3
            className={
              titleClass
            }
          >
            Preferred gender
          </h3>

          <p className="mt-1 text-[10px] leading-5 text-[#8b7d72]">
            This decides the primary recommendation pool.
          </p>
        </div>

        <label
          className={
            labelClass
          }
        >
          Gender

          <select
            className={
              fieldClass
            }
            value={
              value.preferredGender ||
              ''
            }
            onChange={(
              event
            ) =>
              update(
                'preferredGender',
                event.target.value
              )
            }
          >
            <option value="">
              Select
            </option>

            <option value="Female">
              Female
            </option>

            <option value="Male">
              Male
            </option>
          </select>
        </label>
      </section>

      <RangeFields
        title="Age"
        minLabel="Minimum age"
        maxLabel="Maximum age"
        minValue={
          value.ageMin
        }
        maxValue={
          value.ageMax
        }
        min={
          18
        }
        max={
          80
        }
        importance={
          value.importance
            ?.age
        }
        onMinChange={(
          nextValue
        ) =>
          update(
            'ageMin',
            nextValue
          )
        }
        onMaxChange={(
          nextValue
        ) =>
          update(
            'ageMax',
            nextValue
          )
        }
        onImportanceChange={(
          nextValue
        ) =>
          updateImportance(
            'age',
            nextValue
          )
        }
      />

      <RangeFields
        title="Height"
        minLabel="Minimum height"
        maxLabel="Maximum height"
        minValue={
          value.heightMin
        }
        maxValue={
          value.heightMax
        }
        min={
          100
        }
        max={
          250
        }
        unit="Centimetres"
        importance={
          value.importance
            ?.height
        }
        onMinChange={(
          nextValue
        ) =>
          update(
            'heightMin',
            nextValue
          )
        }
        onMaxChange={(
          nextValue
        ) =>
          update(
            'heightMax',
            nextValue
          )
        }
        onImportanceChange={(
          nextValue
        ) =>
          updateImportance(
            'height',
            nextValue
          )
        }
      />

      <RangeFields
        title="Body weight"
        minLabel="Minimum weight"
        maxLabel="Maximum weight"
        minValue={
          value.weightMin
        }
        maxValue={
          value.weightMax
        }
        min={
          30
        }
        max={
          250
        }
        unit="Kilograms"
        importance={
          value.importance
            ?.weight
        }
        onMinChange={(
          nextValue
        ) =>
          update(
            'weightMin',
            nextValue
          )
        }
        onMaxChange={(
          nextValue
        ) =>
          update(
            'weightMax',
            nextValue
          )
        }
        onImportanceChange={(
          nextValue
        ) =>
          updateImportance(
            'weight',
            nextValue
          )
        }
      />

      <CsvField
        title="Marital status"
        label="Accepted marital statuses"
        value={
          value.acceptedMaritalStatuses
        }
        placeholder="Never Married, Divorced, Widowed"
        importance={
          value.importance
            ?.maritalStatus
        }
        onChange={(
          nextValue
        ) =>
          update(
            'acceptedMaritalStatuses',
            nextValue
          )
        }
        onImportanceChange={(
          nextValue
        ) =>
          updateImportance(
            'maritalStatus',
            nextValue
          )
        }
      />

      <section
        className={
          sectionClass
        }
      >
        <h3
          className={
            titleClass
          }
        >
          Remarriage
        </h3>

        <label
          className={
            labelClass
          }
        >
          Willing to consider remarriage

          <select
            className={
              fieldClass
            }
            value={
              value.willingForRemarriage ||
              'Open to Discuss'
            }
            onChange={(
              event
            ) =>
              update(
                'willingForRemarriage',
                event.target.value
              )
            }
          >
            <option value="Yes">
              Yes
            </option>

            <option value="No">
              No
            </option>

            <option value="Open to Discuss">
              Open to Discuss
            </option>
          </select>
        </label>
      </section>

      <section
        className={
          sectionClass
        }
      >
        <div>
          <h3
            className={
              titleClass
            }
          >
            Native location
          </h3>

          <p className="mt-1 text-[10px] leading-5 text-[#8b7d72]">
            Only native matrimonial location is used.
            Exact residential address is never used for matching.
          </p>
        </div>

        <label
          className={
            labelClass
          }
        >
          Native states

          <input
            className={
              fieldClass
            }
            value={
              csv(
                value.states
              )
            }
            onChange={(
              event
            ) =>
              update(
                'states',
                event.target.value
              )
            }
            placeholder="Gujarat, Rajasthan"
          />
        </label>

        <label
          className={
            labelClass
          }
        >
          Native district / place

          <input
            className={
              fieldClass
            }
            value={
              csv(
                value.locations
              )
            }
            onChange={(
              event
            ) =>
              update(
                'locations',
                event.target.value
              )
            }
            placeholder="Rajkot, Jamnagar, Udaipur"
          />
        </label>

        <ImportanceField
          value={
            value.importance
              ?.location
          }
          onChange={(
            nextValue
          ) =>
            updateImportance(
              'location',
              nextValue
            )
          }
        />
      </section>

      <CsvField
        title="Surname / Shakh"
        label="Preferred Surname / Shakh"
        value={
          value.shakhPreferences
        }
        placeholder="Jadeja, Gohil, Jhala"
        importance={
          value.importance
            ?.shakh
        }
        onChange={(
          nextValue
        ) =>
          update(
            'shakhPreferences',
            nextValue
          )
        }
        onImportanceChange={(
          nextValue
        ) =>
          updateImportance(
            'shakh',
            nextValue
          )
        }
      />

      <CsvField
        title="Gotra"
        label="Preferred Gotra"
        value={
          value.gotraPreferences
        }
        placeholder="Kashyap, Vashishtha"
        importance={
          value.importance
            ?.gotra
        }
        onChange={(
          nextValue
        ) =>
          update(
            'gotraPreferences',
            nextValue
          )
        }
        onImportanceChange={(
          nextValue
        ) =>
          updateImportance(
            'gotra',
            nextValue
          )
        }
      />

      <CsvField
        title="Kul / Vansh"
        label="Preferred Kul / Vansh"
        value={
          value.vanshPreferences
        }
        placeholder="Suryavanshi, Chandravanshi"
        importance={
          value.importance
            ?.vansh
        }
        onChange={(
          nextValue
        ) =>
          update(
            'vanshPreferences',
            nextValue
          )
        }
        onImportanceChange={(
          nextValue
        ) =>
          updateImportance(
            'vansh',
            nextValue
          )
        }
      />

      <CsvField
        title="Education"
        label="Preferred education"
        value={
          value.educationPreferences
        }
        placeholder="B.E., MBA, MBBS"
        importance={
          value.importance
            ?.education
        }
        onChange={(
          nextValue
        ) =>
          update(
            'educationPreferences',
            nextValue
          )
        }
        onImportanceChange={(
          nextValue
        ) =>
          updateImportance(
            'education',
            nextValue
          )
        }
      />

      <CsvField
        title="Profession"
        label="Preferred occupation / profession"
        value={
          value.occupationPreferences
        }
        placeholder="Engineer, Doctor, Business"
        importance={
          value.importance
            ?.occupation
        }
        onChange={(
          nextValue
        ) =>
          update(
            'occupationPreferences',
            nextValue
          )
        }
        onImportanceChange={(
          nextValue
        ) =>
          updateImportance(
            'occupation',
            nextValue
          )
        }
      />

      <section
        className={
          sectionClass
        }
      >
        <h3
          className={
            titleClass
          }
        >
          Annual income
        </h3>

        <div className="grid grid-cols-3 gap-4 max-[800px]:grid-cols-1">
          <label
            className={
              labelClass
            }
          >
            Minimum income

            <input
              className={
                fieldClass
              }
              type="number"
              min="0"
              value={
                value
                  .incomePreferences
                  ?.min ??
                ''
              }
              onChange={(
                event
              ) =>
                updateIncome(
                  'min',
                  event.target.value
                )
              }
            />
          </label>

          <label
            className={
              labelClass
            }
          >
            Maximum income

            <input
              className={
                fieldClass
              }
              type="number"
              min="0"
              value={
                value
                  .incomePreferences
                  ?.max ??
                ''
              }
              onChange={(
                event
              ) =>
                updateIncome(
                  'max',
                  event.target.value
                )
              }
            />
          </label>

          <ImportanceField
            value={
              value.importance
                ?.income
            }
            onChange={(
              nextValue
            ) =>
              updateImportance(
                'income',
                nextValue
              )
            }
          />
        </div>
      </section>

      <CsvField
        title="Diet"
        label="Preferred diet"
        value={
          value.dietPreferences
        }
        placeholder="Vegetarian, Jain"
        importance={
          value.importance
            ?.diet
        }
        onChange={(
          nextValue
        ) =>
          update(
            'dietPreferences',
            nextValue
          )
        }
        onImportanceChange={(
          nextValue
        ) =>
          updateImportance(
            'diet',
            nextValue
          )
        }
      />

      <SelectCsvField
        title="Family type"
        label="Preferred family type"
        value={
          value.familyTypePreferences
        }
        options={
          FAMILY_TYPES
        }
        importance={
          value.importance
            ?.familyType
        }
        onChange={(
          nextValue
        ) =>
          update(
            'familyTypePreferences',
            nextValue
          )
        }
        onImportanceChange={(
          nextValue
        ) =>
          updateImportance(
            'familyType',
            nextValue
          )
        }
      />

      <SelectCsvField
        title="Family values"
        label="Preferred family values"
        value={
          value.familyValuePreferences
        }
        options={
          FAMILY_VALUES
        }
        importance={
          value.importance
            ?.familyValues
        }
        onChange={(
          nextValue
        ) =>
          update(
            'familyValuePreferences',
            nextValue
          )
        }
        onImportanceChange={(
          nextValue
        ) =>
          updateImportance(
            'familyValues',
            nextValue
          )
        }
      />

      <SelectCsvField
        title="Smoking"
        label="Smoking preference"
        value={
          value.smokingPreferences
        }
        options={
          SMOKING_OPTIONS
        }
        importance={
          value.importance
            ?.smoking
        }
        onChange={(
          nextValue
        ) =>
          update(
            'smokingPreferences',
            nextValue
          )
        }
        onImportanceChange={(
          nextValue
        ) =>
          updateImportance(
            'smoking',
            nextValue
          )
        }
      />

      <SelectCsvField
        title="Drinking"
        label="Drinking preference"
        value={
          value.drinkingPreferences
        }
        options={
          DRINKING_OPTIONS
        }
        importance={
          value.importance
            ?.drinking
        }
        onChange={(
          nextValue
        ) =>
          update(
            'drinkingPreferences',
            nextValue
          )
        }
        onImportanceChange={(
          nextValue
        ) =>
          updateImportance(
            'drinking',
            nextValue
          )
        }
      />

      <section
        className={
          sectionClass
        }
      >
        <div>
          <h3
            className={
              titleClass
            }
          >
            Property & family assets
          </h3>

          <p className="mt-1 text-[10px] leading-5 text-[#8b7d72]">
            Private asset information may participate in
            server-side matching without exposing raw details.
          </p>
        </div>

        <PropertyField
          label="Own residential property"
          value={
            value
              .propertyPreferences
              ?.ownResidence
          }
          importance={
            value.importance
              ?.ownResidence
          }
          onChange={(
            nextValue
          ) =>
            updateProperty(
              'ownResidence',
              nextValue
            )
          }
          onImportanceChange={(
            nextValue
          ) =>
            updateImportance(
              'ownResidence',
              nextValue
            )
          }
        />

        <PropertyField
          label="Agricultural land"
          value={
            value
              .propertyPreferences
              ?.agricultureLand
          }
          importance={
            value.importance
              ?.agricultureLand
          }
          onChange={(
            nextValue
          ) =>
            updateProperty(
              'agricultureLand',
              nextValue
            )
          }
          onImportanceChange={(
            nextValue
          ) =>
            updateImportance(
              'agricultureLand',
              nextValue
            )
          }
        />

        <PropertyField
          label="Business assets"
          value={
            value
              .propertyPreferences
              ?.businessAssets
          }
          importance={
            value.importance
              ?.businessAssets
          }
          onChange={(
            nextValue
          ) =>
            updateProperty(
              'businessAssets',
              nextValue
            )
          }
          onImportanceChange={(
            nextValue
          ) =>
            updateImportance(
              'businessAssets',
              nextValue
            )
          }
        />
      </section>

      <CsvField
        title="Marriage timeline"
        label="Preferred marriage timeline"
        value={
          value.marriageTimeline
        }
        placeholder="Within 6 months, Within 1 year"
        importance={
          value.importance
            ?.marriageTimeline
        }
        onChange={(
          nextValue
        ) =>
          update(
            'marriageTimeline',
            nextValue
          )
        }
        onImportanceChange={(
          nextValue
        ) =>
          updateImportance(
            'marriageTimeline',
            nextValue
          )
        }
      />

      <section
        className={
          sectionClass
        }
      >
        <h3
          className={
            titleClass
          }
        >
          Additional expectations
        </h3>

        <label
          className={
            labelClass
          }
        >
          Notes

          <textarea
            className={`${fieldClass} min-h-[130px] resize-y`}
            maxLength={
              1500
            }
            value={
              value.additionalPreferences ||
              ''
            }
            onChange={(
              event
            ) =>
              update(
                'additionalPreferences',
                event.target.value
              )
            }
            placeholder="Any other expectations..."
          />
        </label>
      </section>

      <div className="border border-[#c9b18f] bg-[#c49b700b] p-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#681d25]">
          Importance levels
        </p>

        <div className="mt-3 grid gap-2 text-[10px] leading-5 text-[#756a60]">
          <p>
            <strong>Low:</strong>{' '}
            small effect on recommendation ranking.
          </p>

          <p>
            <strong>Medium:</strong>{' '}
            standard matching importance.
          </p>

          <p>
            <strong>High:</strong>{' '}
            strong effect on your match percentage.
          </p>

          <p>
            <strong>Must Have:</strong>{' '}
            candidate is excluded when the condition
            fails or cannot be verified.
          </p>
        </div>
      </div>
    </div>
  );
}