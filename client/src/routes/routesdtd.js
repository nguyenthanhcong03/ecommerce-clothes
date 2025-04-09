import { useRouteRender } from 'hooks';
import { AboutPage, HomePage, LoginPage, ThemePage } from 'page';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

export const AUTHENTICATION_ROUTERS = {
  HOME: '/',
  ABOUT: '/about',
  THEME: '/themes'
};

export const UN_AUTHENTICATION_ROUTERS = {
  LOGIN: '/login'
};

export const ROUTERS = {
  ...AUTHENTICATION_ROUTERS,
  ...UN_AUTHENTICATION_ROUTERS
};

export const MainRouter = () => {
  const router = createBrowserRouter([
    {
      path: ROUTERS.HOME,
      element: useRouteRender(<HomePage />)
    },
    {
      path: ROUTERS.ABOUT,
      element: useRouteRender(<AboutPage />)
    },
    {
      path: ROUTERS.THEME,
      element: useRouteRender(<ThemePage />)
    },
    {
      path: ROUTERS.LOGIN,
      element: useRouteRender(<LoginPage />)
    }
  ]);
  return <RouterProvider router={router} />;
};
