import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ClinicianPatient from '../ClinicianPatient'

// Mock the auth context so component sees a clinician user
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'clinician123' } })
}))

// Mock API client
const mockApi = {
  get: vi.fn(),
  post: vi.fn()
}
vi.mock('../../api/client', () => ({ api: mockApi }))

describe('ClinicianPatient', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  test('shows no consultations when API returns empty list', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })

    render(
      <MemoryRouter initialEntries={["/clinician/patient/patient123"]}>
        <Routes>
          <Route path="/clinician/patient/:user_id" element={<ClinicianPatient />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/No consultations found/i)).toBeInTheDocument()
    })
  })

  test('loads consultations and displays messages and AI summary when a consultation is selected', async () => {
    // First call: consultations list
    mockApi.get.mockResolvedValueOnce({ data: [
      { consultation_id: 'c1', first_message: 'Hello AI', last_updated: new Date().toISOString(), message_count: 2 }
    ] })

    // Second call: full consultation details
    mockApi.get.mockResolvedValueOnce({ data: {
      consultation: { consultation_id: 'c1' },
      messages: [ { role: 'user', content: 'hi', timestamp: '2025-11-01T12:00:00Z' } ],
      clinical_notes: [ { note: 'note 1', clinician_id: 'clinician123', timestamp: '2025-11-02T12:00:00Z' } ],
      ai_summary: { summary: 'This is a summary', recommendations: ['Rec 1', 'Rec 2'] }
    } })

    render(
      <MemoryRouter initialEntries={["/clinician/patient/patient123"]}>
        <Routes>
          <Route path="/clinician/patient/:user_id" element={<ClinicianPatient />} />
        </Routes>
      </MemoryRouter>
    )

    // Wait for consultations to render
    await waitFor(() => expect(screen.getByText(/Hello AI/)).toBeInTheDocument())

    // Click the consultation button
    fireEvent.click(screen.getByText(/Hello AI/))

    // Expect message content and AI summary to appear
    await waitFor(() => expect(screen.getByText(/This is a summary/)).toBeInTheDocument())
    expect(screen.getByText(/hi/)).toBeInTheDocument()
    expect(screen.getByText(/note 1/)).toBeInTheDocument()
  })

})
