import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import AdminPage from './AdminPage';

const { api, notify } = vi.hoisted(() => ({ api: vi.fn(), notify: vi.fn() }));

vi.mock('../../services/api', () => ({ api, assetUrl: (path) => path }));
vi.mock('../../context/ToastContext', () => ({ useToast: () => notify }));
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'admin' } })
}));

const report = {
  _id: 'report-1',
  reason: 'Spam',
  description: 'Repeated promotional messages',
  status: 'Open',
  reporter: { email: 'reporter@example.com' },
  reportedProfile: { firstName: 'Asha' }
};

const renderReports = () =>
  render(
    <MemoryRouter initialEntries={['/admin/reports']}>
      <Routes>
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  api.mockReset();
  notify.mockReset();
});

test('does not offer the Open status as a report update', async () => {
  api.mockResolvedValue({ data: { reports: [report] } });
  renderReports();
  expect(await screen.findByText('Spam: Asha')).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Open' })).toBeDisabled();
});

test('keeps the previous status and reports the error when a report update fails', async () => {
  api.mockResolvedValueOnce({ data: { reports: [report] } });
  api.mockRejectedValueOnce(new Error('Invalid report status.'));
  renderReports();
  const select = await screen.findByRole('combobox');
  fireEvent.change(select, { target: { value: 'Reviewed' } });
  await waitFor(() =>
    expect(notify).toHaveBeenCalledWith('Invalid report status.', 'error')
  );
  expect(select).toHaveValue('Open');
});
