import { createBrowserRouter } from 'react-router-dom';
import Layout        from './components/layout/Layout';
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
    ],
  },
]);
