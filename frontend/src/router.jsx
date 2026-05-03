import { createBrowserRouter } from 'react-router-dom';
import Layout        from './components/layout/Layout';
import CabinetLayout from './components/layout/CabinetLayout';
import AdminLayout   from './components/layout/AdminLayout';

// Public pages
import Home          from './pages/Home';
import Catalog       from './pages/Catalog';
import Service       from './pages/Service';
import KnowledgeBase from './pages/KnowledgeBase';
import KBArticle     from './pages/KnowledgeBase/Article';
import News          from './pages/News';
import NewsArticle   from './pages/News/Article';
import Corporate     from './pages/Corporate';
import Contacts      from './pages/Contacts';
import Subsidiary    from './pages/Subsidiary';
import Profile       from './pages/Cabinet/Profile';
import Applications  from './pages/Cabinet/Applications';
import ApplicationDetail from './pages/Cabinet/ApplicationDetail';
import Documents     from './pages/Cabinet/Documents';
import Notifications from './pages/Cabinet/Notifications';

// Cabinet — user personal area
import Dashboard          from './pages/Cabinet/Dashboard';
import Calculators        from './pages/Cabinet/Calculators';
import Bookings           from './pages/Cabinet/Bookings';

// Admin cabinet
import AdminDashboard     from './pages/Admin/Dashboard';
import AdminUsers         from './pages/Admin/Users';
import AdminServices      from './pages/Admin/Services';
import AdminContent       from './pages/Admin/Content';
import AdminApplications  from './pages/Admin/Applications';
import AdminAnalytics     from './pages/Admin/Analytics';
import AdminDirectories   from './pages/Admin/Directories';
import AdminLogs          from './pages/Admin/Logs';
import FormBuilder        from './pages/Admin/FormBuilder';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,                  element: <Home /> },
      { path: 'catalog',              element: <Catalog /> },
      { path: 'catalog/:slug',        element: <Service /> },
      { path: 'knowledge-base',       element: <KnowledgeBase /> },
      { path: 'knowledge-base/:slug', element: <KBArticle /> },
      { path: 'news',                 element: <News /> },
      { path: 'news/:slug',           element: <NewsArticle /> },
      { path: 'corporate',            element: <Corporate /> },
      { path: 'contacts',             element: <Contacts /> },
      { path: 'subsidiary/:id',       element: <Subsidiary /> },
      { path: 'cabinet',              element: <CabinetLayout />, 
        children: [
          { index: true, element: <Profile /> },
          { path: 'profile', element: <Profile /> },
          { path: 'applications', element: <Applications /> },
          { path: 'applications/:id', element: <ApplicationDetail /> },
          { path: 'documents', element: <Documents /> },
          { path: 'notifications', element: <Notifications /> },
        ]
      },
    ],
  },

  // ── Personal cabinet (/cabinet/...) ───────────────────────────────────────
  {
    path: '/cabinet',
    element: <CabinetLayout />,
    children: [
      // /cabinet  →  dashboard
      { index: true,                         element: <Dashboard /> },

      // Applications
      { path: 'applications',                element: <Applications /> },
      { path: 'applications/:id',            element: <ApplicationDetail /> },

      // Documents (uploaded/received per application or standalone)
      { path: 'documents',                   element: <Documents /> },

      // Notifications
      { path: 'notifications',               element: <Notifications /> },

      // Profile (personal data + company details)
      { path: 'profile',                     element: <Profile /> },

      // Calculators & cost estimators
      { path: 'calculators',                 element: <Calculators /> },

      // Online bookings / queue reservations
      { path: 'bookings',                    element: <Bookings /> },
    ],
  },

  // ── Admin cabinet (/admin/...) ────────────────────────────────────────────
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true,                         element: <AdminDashboard /> },
      { path: 'admin/forms/new',   element: <FormBuilder /> },
      { path: 'admin/forms/:id',   element: <FormBuilder /> },
      // /admin  →  admin dashboard
      

      // User management
      { path: 'users',                       element: <AdminUsers /> },

      // Service catalogue management
      { path: 'services',                    element: <AdminServices /> },

      // Content management (pages, news, KB, banners)
      { path: 'content',                     element: <AdminContent /> },

      // Application monitoring (read-only overview)
      { path: 'applications',                element: <AdminApplications /> },

      // Analytics & exports
      { path: 'analytics',                   element: <AdminAnalytics /> },

      // System directories / dictionaries
      { path: 'directories',                 element: <AdminDirectories /> },

      // Audit logs
      { path: 'logs',                        element: <AdminLogs /> },
    ],
  },
]);