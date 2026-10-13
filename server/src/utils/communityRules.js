const cleanSurname =
  (
    value
  ) =>
    typeof value ===
      'string'
      ? value
          .trim()
          .replace(
            /\s+/g,
            ' '
          )
          .toLowerCase()
      : '';

const escapeRegex =
  (
    value
  ) =>
    String(
      value
    ).replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

/*
 * In this application community.clan is the canonical
 * Rajput Surname / Shakh field.
 *
 * lastName is kept only as a fallback for old/incomplete
 * records where community.clan is not available.
 */
export const getCanonicalSurname =
  (
    profile
  ) =>
    cleanSurname(
      profile?.community
        ?.clan
    ) ||
    cleanSurname(
      profile?.lastName
    );

/*
 * Same Surname / Shakh members are treated as belonging
 * to the same family branch for matrimonial discovery.
 *
 * The comparison is:
 * - case insensitive
 * - whitespace insensitive
 *
 * Examples:
 * Rana === rana
 * Rana === " RANA "
 */
export const isSameSurname =
  (
    firstProfile,
    secondProfile
  ) => {
    const first =
      getCanonicalSurname(
        firstProfile
      );

    const second =
      getCanonicalSurname(
        secondProfile
      );

    /*
     * Missing data must not automatically reject a
     * candidate. We reject only when BOTH surnames are
     * known and equal.
     */
    return Boolean(
      first &&
      second &&
      first ===
        second
    );
  };

/*
 * MongoDB-level exclusion used by Discover and Dashboard.
 *
 * community.clan is checked first because that is our
 * canonical Surname / Shakh field.
 *
 * lastName is checked only for candidate records where
 * community.clan is missing/blank.
 *
 * This is important because old/test data can have a
 * generic lastName while still having a valid clan.
 */
export const sameSurnameMongoExclusion =
  (
    viewerProfile
  ) => {
    const surname =
      getCanonicalSurname(
        viewerProfile
      );

    if (
      !surname
    ) {
      return {};
    }

    const exactSurname =
      new RegExp(
        `^\\s*${escapeRegex(
          surname
        )}\\s*$`,
        'i'
      );

    return {
      $nor: [
        {
          'community.clan':
            exactSurname
        },

        {
          $and: [
            {
              $or: [
                {
                  'community.clan': {
                    $exists:
                      false
                  }
                },

                {
                  'community.clan':
                    null
                },

                {
                  'community.clan':
                    /^\s*$/
                }
              ]
            },

            {
              lastName:
                exactSurname
            }
          ]
        }
      ]
    };
  };