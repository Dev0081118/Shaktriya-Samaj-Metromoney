import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  expect,
  test,
  vi
} from 'vitest';

import { getNavigationForRole } from '../../config/navigation';
import i18n from '../../i18n';
import AppSidebar from './AppSidebar';

const renderSidebar = ({
  role = 'member',
  path,
  onLogout = vi.fn()
} = {}) => {
  const variant =
    role === 'member'
      ? 'member'
      : role === 'relationship_manager'
        ? 'manager'
        : 'admin';

  const initialPath =
    path ||
    (role === 'member'
      ? '/dashboard'
      : role === 'relationship_manager'
        ? '/manager'
        : '/admin');

  return render(
    <MemoryRouter
      initialEntries={[
        initialPath
      ]}
    >
      <AppSidebar
        variant={variant}
        sections={getNavigationForRole(
          role
        )}
        identity={{
          initial: 'A',
          primary:
            'account@example.com',
          secondary: role
        }}
        badges={{
          notifications: 3
        }}
        onLogout={onLogout}
      />
    </MemoryRouter>
  );
};

test(
  'member sees member links, notification count, and no admin links',
  () => {
    renderSidebar();

    expect(
      screen.getByRole(
        'link',
        {
          name: 'Dashboard'
        }
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole(
        'link',
        {
          name:
            /Notifications/
        }
      )
    ).toHaveTextContent('3');

    expect(
      screen.queryByRole(
        'link',
        {
          name: 'Revenue'
        }
      )
    ).not.toBeInTheDocument();
  }
);

test.each([
  [
    'moderator',
    [
      'Moderation',
      'Reports'
    ],
    [
      'Customers',
      'Revenue',
      'System Settings'
    ]
  ],
  [
    'admin',
    [
      'Customers',
      'Support',
      'Payments'
    ],
    [
      'Revenue',
      'System Settings'
    ]
  ],
  [
    'super_admin',
    [
      'Revenue',
      'Plans',
      'System Settings',
      'Audit Logs'
    ],
    []
  ]
])(
  '%s receives only its authorized administration links',
  (
    role,
    visible,
    hidden
  ) => {
    renderSidebar({ role });

    visible.forEach(
      (name) => {
        expect(
          screen.getByRole(
            'link',
            { name }
          )
        ).toBeInTheDocument();
      }
    );

    hidden.forEach(
      (name) => {
        expect(
          screen.queryByRole(
            'link',
            { name }
          )
        ).not.toBeInTheDocument();
      }
    );
  }
);

test(
  'relationship manager receives the assigned-client workspace link only',
  () => {
    renderSidebar({
      role:
        'relationship_manager'
    });

    expect(
      screen.getByRole(
        'link',
        {
          name:
            'Your assigned clients'
        }
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByRole(
        'link',
        {
          name: 'Customers'
        }
      )
    ).not.toBeInTheDocument();
  }
);

test(
  'active route is exposed with aria-current',
  () => {
    renderSidebar({
      path:
        '/notifications'
    });

    expect(
      screen.getByRole(
        'link',
        {
          name:
            /Notifications/
        }
      )
    ).toHaveAttribute(
      'aria-current',
      'page'
    );
  }
);

test(
  'logout delegates to the existing logout handler',
  () => {
    const onLogout =
      vi.fn();

    renderSidebar({
      onLogout
    });

    fireEvent.click(
      screen.getByRole(
        'button',
        {
          name:
            'Sign out'
        }
      )
    );

    expect(
      onLogout
    ).toHaveBeenCalledOnce();
  }
);

test(
  'mobile drawer opens and closes from its controls',
  () => {
    renderSidebar();

    const trigger =
      screen.getByRole(
        'button',
        {
          name:
            'Open navigation menu'
        }
      );

    fireEvent.click(
      trigger
    );

    expect(
      trigger
    ).toHaveAttribute(
      'aria-expanded',
      'true'
    );

    expect(
      document.querySelector(
        '.app-sidebar'
      )
    ).toHaveClass(
      'is-mobile-open'
    );

    fireEvent.click(
      screen.getAllByRole(
        'button',
        {
          name:
            'Close navigation menu'
        }
      )[0]
    );

    expect(
      trigger
    ).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  }
);

test(
  'Escape closes the mobile drawer',
  () => {
    renderSidebar();

    fireEvent.click(
      screen.getByRole(
        'button',
        {
          name:
            'Open navigation menu'
        }
      )
    );

    fireEvent.keyDown(
      document,
      {
        key:
          'Escape'
      }
    );

    expect(
      document.querySelector(
        '.app-sidebar'
      )
    ).not.toHaveClass(
      'is-mobile-open'
    );
  }
);

test(
  'translated labels update immediately after a language change',
  async () => {
    renderSidebar();

    await act(
      async () => {
        await i18n.changeLanguage(
          'gu'
        );
      }
    );

    await waitFor(
      () => {
        expect(
          screen.getByRole(
            'link',
            {
              name:
                'ડેશબોર્ડ'
            }
          )
        ).toBeInTheDocument();
      }
    );
  }
);