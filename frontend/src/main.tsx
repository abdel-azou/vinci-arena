import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './components/App/index.tsx';
import HomePage from './components/pages/HomePage.tsx';
import RegisterPage from './components/pages/RegisterPage.tsx';
import LoginPage from './components/pages/LoginPage.tsx';
import ProfilePage from './components/pages/ProfilePage.tsx';
import CreateTeamPage from './components/pages/CreateTeamPage.tsx';
import CreateTournamentPage from './components/pages/CreateTournamentPage.tsx';
import TeamPage from './components/pages/TeamPage.tsx';
import MyTeamPage from './components/pages/MyTeamPage.tsx';
import AdminPage from './components/pages/AdminPage.tsx';
import TournamentDetailPage from './components/pages/TournamentDetailPage.tsx';
import { MemberContextProvider } from './contexts/UserContext.tsx';
import { TeamProvider } from './contexts/TeamContext.tsx';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from './themes.ts';
import PublicProfilePage from './components/pages/PublicProfilePage.tsx';
import MembersPage from './components/pages/MembersPage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'create-team',
        element: <CreateTeamPage />,
      },
      {
        path: 'create-tournament',
        element: <CreateTournamentPage />,
      },
      {
        path: 'teams',
        element: <TeamPage />,
      },
      {
        path: 'team',
        element: <MyTeamPage />,
      },
      {
        path: 'gestion',
        element: <AdminPage />,
      },
      {
        path: 'admin',
        element: <AdminPage />,
      },
      {
        path: 'tournaments/:id',
        element: <TournamentDetailPage />,
      },
      {
        path: 'members',
        element: <MembersPage />,
      },
      {
        path: 'members/:id',
        element: <PublicProfilePage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MemberContextProvider>
        <TeamProvider>
          <RouterProvider router={router} />
        </TeamProvider>
      </MemberContextProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
