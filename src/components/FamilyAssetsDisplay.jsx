const joinValues = (
  values,
  separator = ', '
) =>
  values
    .filter(
      (
        value
      ) =>
        value !==
          undefined &&
        value !==
          null &&
        value !==
          ''
    )
    .join(
      separator
    );

const asArray =
  (
    value
  ) =>
    Array.isArray(
      value
    )
      ? value
      : [];

const hasContent =
  (
    assets
  ) =>
    !!(
      assets?.agricultureLand
        ?.hasLand ||
      asArray(
        assets?.residentialProperties
      ).length ||
      asArray(
        assets?.otherProperties
      ).length ||
      asArray(
        assets?.businessAssets
      ).length ||
      assets?.assetSummary ||
      assets?.primaryResidenceType ||
      assets?.propertySummary ||
      assets?.businessAssetsSummary
    );

function AssetCard({
  title,
  subtitle,
  lines = []
}) {
  const visibleLines =
    lines.filter(
      Boolean
    );

  return (
    <article className="break-inside-avoid border border-[#ded0c1] bg-[#fffdfa] p-4">
      <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#91683f]">
        {subtitle}
      </p>

      <h3 className="mt-1 font-['Cormorant_Garamond'] text-[22px] font-medium text-[#431318]">
        {title ||
          'Not named'}
      </h3>

      {visibleLines.map(
        (
          line,
          index
        ) => (
          <p
            className="mt-2 text-[10px] leading-5 text-[#6f6259]"
            key={`${line}-${index}`}
          >
            {line}
          </p>
        )
      )}
    </article>
  );
}

function AssetsBody({
  assets
}) {
  const agriculture =
    assets.agricultureLand;

  const residential =
    asArray(
      assets.residentialProperties
    );

  const otherProperties =
    asArray(
      assets.otherProperties
    );

  const businessAssets =
    asArray(
      assets.businessAssets
    );

  return (
    <div className="space-y-5">
      {assets.assetSummary && (
        <p className="text-[11px] leading-6 text-[#6f6259]">
          {assets.assetSummary}
        </p>
      )}

      {agriculture
        ?.hasLand && (
        <AssetCard
          subtitle="Agricultural Land"
          title={
            joinValues(
              [
                agriculture
                  .approximateArea,

                agriculture.unit
              ],
              ' '
            ) ||
            'Agricultural land'
          }
          lines={[
            joinValues(
              [
                agriculture.landType,
                agriculture.ownershipType
              ],
              ' • '
            ),

            joinValues([
              agriculture.village,
              agriculture.taluka,
              agriculture.district,
              agriculture.state
            ]),

            agriculture.notes
          ]}
        />
      )}

      {residential.length >
        0 && (
        <div>
          <h4 className="mb-3 font-['Cormorant_Garamond'] text-[22px] font-medium text-[#431318]">
            Residential Properties
          </h4>

          <div className="grid grid-cols-2 gap-3 max-[650px]:grid-cols-1">
            {residential.map(
              (
                property,
                index
              ) => (
                <AssetCard
                  key={`residential-${index}`}
                  subtitle={
                    property.isPrimaryResidence
                      ? 'Primary Residence'
                      : 'Residential Property'
                  }
                  title={
                    property.propertyName ||
                    property.propertyType
                  }
                  lines={[
                    joinValues(
                      [
                        property.propertyType,
                        property.ownershipType
                      ],
                      ' • '
                    ),

                    property.approximateArea
                      ? joinValues(
                          [
                            property.approximateArea,
                            property.areaUnit
                          ],
                          ' '
                        )
                      : '',

                    joinValues([
                      property.cityVillage,
                      property.district,
                      property.state
                    ]),

                    property.notes
                  ]}
                />
              )
            )}
          </div>
        </div>
      )}

      {otherProperties.length >
        0 && (
        <div>
          <h4 className="mb-3 font-['Cormorant_Garamond'] text-[22px] font-medium text-[#431318]">
            Other Properties
          </h4>

          <div className="grid grid-cols-2 gap-3 max-[650px]:grid-cols-1">
            {otherProperties.map(
              (
                property,
                index
              ) => (
                <AssetCard
                  key={`other-${index}`}
                  subtitle="Property"
                  title={
                    property.propertyName ||
                    property.propertyType
                  }
                  lines={[
                    joinValues(
                      [
                        property.propertyType,
                        property.ownershipType
                      ],
                      ' • '
                    ),

                    property.approximateArea
                      ? joinValues(
                          [
                            property.approximateArea,
                            property.areaUnit
                          ],
                          ' '
                        )
                      : '',

                    joinValues([
                      property.cityVillage,
                      property.district,
                      property.state
                    ]),

                    property.notes
                  ]}
                />
              )
            )}
          </div>
        </div>
      )}

      {businessAssets.length >
        0 && (
        <div>
          <h4 className="mb-3 font-['Cormorant_Garamond'] text-[22px] font-medium text-[#431318]">
            Business Assets
          </h4>

          <div className="grid grid-cols-2 gap-3 max-[650px]:grid-cols-1">
            {businessAssets.map(
              (
                asset,
                index
              ) => (
                <AssetCard
                  key={`business-${index}`}
                  subtitle="Business Asset"
                  title={
                    asset.assetName ||
                    asset.assetType
                  }
                  lines={[
                    joinValues(
                      [
                        asset.assetType,
                        asset.ownershipType
                      ],
                      ' • '
                    ),

                    asset.location,

                    asset.description
                  ]}
                />
              )
            )}
          </div>
        </div>
      )}

      {residential.length ===
        0 &&
        (
          assets.primaryResidenceType ||
          assets.propertySummary
        ) && (
          <AssetCard
            subtitle="Legacy Property Information"
            title={
              assets.primaryResidenceType ||
              'Family property'
            }
            lines={[
              assets.propertySummary
            ]}
          />
        )}

      {businessAssets.length ===
        0 &&
        assets.businessAssetsSummary && (
          <AssetCard
            subtitle="Legacy Business Information"
            title="Family business assets"
            lines={[
              assets.businessAssetsSummary
            ]}
          />
        )}
    </div>
  );
}

export default function FamilyAssetsDisplay({
  assets,
  mode = 'profile'
}) {
  if (
    !hasContent(
      assets
    )
  ) {
    return null;
  }

  if (
    mode ===
    'biodata'
  ) {
    return (
      <section className="mt-8 break-inside-avoid border-t border-[#d9c9b8] pt-6">
        <h2 className="font-['Cormorant_Garamond'] text-[28px] font-medium text-[#681d25]">
          Family Assets
        </h2>

        <div className="mt-5">
          <AssetsBody
            assets={
              assets
            }
          />
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-[#ddd0c1] py-10">
      <div className="grid grid-cols-[185px_minmax(0,1fr)] gap-[35px] max-[767px]:grid-cols-1 max-[767px]:gap-4">
        <header>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
            Private family information
          </p>

          <h2 className="mt-2 font-['Cormorant_Garamond'] text-[32px] font-medium text-[#291a17]">
            Family assets
          </h2>
        </header>

        <AssetsBody
          assets={
            assets
          }
        />
      </div>
    </section>
  );
}