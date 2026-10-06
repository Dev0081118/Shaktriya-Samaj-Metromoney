export const translateStatus = (
  t,
  value
) =>
  t(
    `status.${value}`,
    {
      defaultValue: value
    }
  );

export const translateRole = (
  t,
  value
) =>
  t(
    `roles.${value}`,
    {
      defaultValue: value
    }
  );

export const translateProfileFor = (
  t,
  value
) =>
  t(
    `profileFor.${value}`,
    {
      defaultValue: value
    }
  );

export const translateGender = (
  t,
  value
) =>
  t(
    `gender.${value}`,
    {
      defaultValue: value
    }
  );