import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import ProfileOverviewSection from './ProfileOverviewSection';

describe('ProfileOverviewSection', () => {
  test('navigates to the tournament detail page from each tournament card', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route
            path="/profile"
            element={
              <ProfileOverviewSection
                authenticatedMember={{
                  id: 1,
                  email: 'player@mail.com',
                  tag: 'PlayerOne',
                  specialty: 'TACTICIAN',
                  token: 'token',
                  role: 'MEMBER',
                  teamId: 4,
                }}
                editingSpecialty={false}
                newSpecialty=""
                onCancelEditSpecialty={() => undefined}
                onEditSpecialty={() => undefined}
                onSpecialtyChange={() => undefined}
                onUpdateSpecialty={() => undefined}
                specialtyErrorMessage=""
                specialtyLoading={false}
                specialtySuccessMessage=""
                teamName="TEAM_ALPHA"
                mode="tournaments"
                tournaments={[
                  {
                    id: 42,
                    name: 'Vinci Cup',
                    startDate: '2026-04-18T10:00:00',
                    endDate: '2026-04-20T18:00:00',
                    status: 'INSCRIPTION',
                  },
                ]}
              />
            }
          />
          <Route path="/tournaments/:id" element={<div>Tournoi detail</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Vinci Cup'));
    fireEvent.click(screen.getByRole('button', { name: /voir le tournoi/i }));

    expect(screen.getByText('Tournoi detail')).toBeTruthy();
  });
});
