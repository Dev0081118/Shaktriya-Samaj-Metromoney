import { StrictMode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import AdminOperationsPage from './AdminOperationsPage';

const { api, notify } = vi.hoisted(() => ({ api: vi.fn(), notify: vi.fn() }));

vi.mock('../../services/api', () => ({ api }));
vi.mock('../../context/ToastContext', () => ({ useToast: () => notify }));
vi.mock('../../components/AdminNav', () => ({ default: () => null }));

const ticket = {
  _id: 'ticket-1',
  category: 'Account',
  name: 'Asha',
  email: 'asha@example.com',
  message: 'Unable to update my profile.',
  priority: 'Normal',
  status: 'Open',
  createdAt: new Date().toISOString()
};

beforeEach(() => {
  api.mockReset();
  notify.mockReset();
});

test('mounts and unmounts without throwing in StrictMode', async () => {
  api.mockResolvedValue({ data: { tickets: [ticket] } });
  const { unmount } = render(
    <StrictMode>
      <MemoryRouter>
        <AdminOperationsPage type="support" />
      </MemoryRouter>
    </StrictMode>
  );
  expect(await screen.findByText(/Asha/)).toBeInTheDocument();
  expect(() => unmount()).not.toThrow();
});

test('reports the server error when a support ticket update fails', async () => {
  api.mockImplementation((path) =>
    path === '/admin/support'
      ? Promise.resolve({ data: { tickets: [ticket] } })
      : Promise.reject(new Error('Support ticket not found.'))
  );
  render(
    <MemoryRouter>
      <AdminOperationsPage type="support" />
    </MemoryRouter>
  );
  const select = await screen.findByRole('combobox');
  fireEvent.change(select, { target: { value: 'Closed' } });
  await waitFor(() =>
    expect(notify).toHaveBeenCalledWith('Support ticket not found.', 'error')
  );
  expect(select).toHaveValue('Open');
});

test('reports the server error when saving system settings fails', async () => {
  api.mockImplementation((path, options) =>
    path === '/admin/settings' && !options
      ? Promise.resolve({
          data: {
            settings: { platformName: 'KSHATRIYA', maxPhotos: 5 },
            providers: {}
          }
        })
      : Promise.reject(new Error('Maximum photos must be between 1 and 20.'))
  );
  render(
    <MemoryRouter>
      <AdminOperationsPage type="settings" />
    </MemoryRouter>
  );
  await screen.findByDisplayValue('KSHATRIYA');
  fireEvent.change(screen.getByLabelText('Maximum photos'), {
    target: { value: '0' }
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save settings' }));
  await waitFor(() =>
    expect(notify).toHaveBeenCalledWith(
      'Maximum photos must be between 1 and 20.',
      'error'
    )
  );
});
