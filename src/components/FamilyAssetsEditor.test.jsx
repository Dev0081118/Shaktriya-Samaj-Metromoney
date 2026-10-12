import {
  fireEvent,
  render,
  screen
} from '@testing-library/react';

import {
  describe,
  expect,
  test,
  vi
} from 'vitest';

import FamilyAssetsEditor from './FamilyAssetsEditor';

describe(
  'FamilyAssetsEditor',
  () => {
    test(
      'can enable agricultural land',
      () => {
        const onChange =
          vi.fn();

        render(
          <FamilyAssetsEditor
            value={{}}
            onChange={
              onChange
            }
            visibility="Private"
            onVisibilityChange={
              vi.fn()
            }
            stateOptions={[
              'Gujarat'
            ]}
          />
        );

        fireEvent.click(
          screen.getByRole(
            'checkbox',
            {
              name:
                /family owns agricultural land/i
            }
          )
        );

        expect(
          onChange
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            agricultureLand:
              expect.objectContaining({
                hasLand:
                  true
              })
          })
        );
      }
    );

    test(
      'can add residential property',
      () => {
        const onChange =
          vi.fn();

        render(
          <FamilyAssetsEditor
            value={{}}
            onChange={
              onChange
            }
            visibility="Private"
            onVisibilityChange={
              vi.fn()
            }
            stateOptions={[
              'Gujarat'
            ]}
          />
        );

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /^add property$/i
            }
          )
        );

        expect(
          onChange
        ).toHaveBeenCalled();

        const payload =
          onChange.mock
            .calls[0][0];

        expect(
          payload
            .residentialProperties
        ).toHaveLength(
          1
        );
      }
    );
  }
);