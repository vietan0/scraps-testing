---
id: example-react-router
title: React Router
---

This example demonstrates React Router v6.4 and above. For previous versions see below.

```jsx
// App.jsx
import {
  createBrowserRouter,
  Form,
  Link,
  Outlet,
  redirect,
  RouterProvider,
  useLoaderData,
  useLocation,
} from 'react-router-dom';

// Method to introduce an artificial delay
export function sleep(n = 500) {
  return new Promise((r) => setTimeout(r, n));
}

// Loader to return after a small delay
export async function homeLoader() {
  await sleep();
  return {
    message: 'home',
  };
}

// Action to get user input
export async function aboutAction({ request }) {
  await sleep();
  let formData = await request.formData();
  let name = formData.get('name');
  console.log(name);
  // Call an async method to add and so on
  return redirect('/');
}

export const About = () => {
  return (
    <>
      <div>You are on the about page</div>
      <Form method="post">
        <input name="person" placeholder="Name" />
        <button type="submit">Submit</button>
      </Form>
    </>
  );
};

export const Home = () => {
  let data = useLoaderData();
  return <div>You are {data.message}</div>;
};

export const NoMatch = () => <div>No match</div>;

export const LocationDisplay = () => {
  const location = useLocation();

  return <div data-testid="location-display">{location.pathname}</div>;
};

export const Layout = () => (
  <div>
    <Link to="/">Home</Link>
    <Link to="/about">About</Link>
    <Outlet />
    <LocationDisplay />
  </div>
);

export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
        loader: homeLoader,
      },
      {
        path: '/about',
        element: <About />,
        action: aboutAction,
      },
      {
        path: '*',
        element: <NoMatch />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

const App = () => <RouterProvider router={router}></RouterProvider>;

export default App;
```

```jsx
// App.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';
import {
  createBrowserRouter,
  createMemoryRouter,
  RouterProvider,
} from 'react-router-dom';
import { routes } from './App';

test('full app rendering/navigating', async () => {
  const router = createBrowserRouter(routes);
  render(<RouterProvider router={router}></RouterProvider>);

  const user = userEvent.setup();
  // We need to wait for the loader data and then assert presence
  expect(await screen.findByText(/you are home/i)).toBeInTheDocument();

  // verify page content for expected route after navigating
  await user.click(screen.getByText(/about/i));
  expect(screen.getByText(/you are on the about page/i)).toBeInTheDocument();
});

test('landing on a bad page', () => {
  const badRoute = '/some/bad/route';
  const router = createMemoryRouter(routes, { initialEntries: [badRoute] });

  // use createMemoryRouter when you want to manually control the history
  render(<RouterProvider router={router}></RouterProvider>);

  // verify navigation to "no match" route
  expect(screen.getByText(/no match/i)).toBeInTheDocument();
});

test('rendering a component that uses useLocation', () => {
  const route = '/some-route';
  const router = createMemoryRouter(routes, { initialEntries: [route] });

  // use createMemoryRouter when you want to manually control the history
  render(<RouterProvider router={router}></RouterProvider>);

  // verify location display is rendered
  expect(screen.getByTestId('location-display')).toHaveTextContent(route);
});
```

Refer to [this working example](https://stackblitz.com/edit/vitejs-vite-dnutcg?file=src%2FApp.test.jsx,src%2FApp.jsx)

## Testing Library and React Router v6

```jsx
// app.js
import React from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';

const About = () => <div>You are on the about page</div>;
const Home = () => <div>You are home</div>;
const NoMatch = () => <div>No match</div>;

export const LocationDisplay = () => {
  const location = useLocation();

  return <div data-testid="location-display">{location.pathname}</div>;
};

export const App = () => (
  <div>
    <Link to="/">Home</Link>

    <Link to="/about">About</Link>

    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/about" element={<About />} />

      <Route path="*" element={<NoMatch />} />
    </Routes>

    <LocationDisplay />
  </div>
);
```

```jsx
// app.test.js
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';
import { App, LocationDisplay } from './app';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

test('full app rendering/navigating', async () => {
  render(<App />, { wrapper: BrowserRouter });
  const user = userEvent.setup();

  // verify page content for default route
  expect(screen.getByText(/you are home/i)).toBeInTheDocument();

  // verify page content for expected route after navigating
  await user.click(screen.getByText(/about/i));
  expect(screen.getByText(/you are on the about page/i)).toBeInTheDocument();
});

test('landing on a bad page', () => {
  const badRoute = '/some/bad/route';

  // use <MemoryRouter> when you want to manually control the history
  render(
    <MemoryRouter initialEntries={[badRoute]}>
      <App />
    </MemoryRouter>,
  );

  // verify navigation to "no match" route
  expect(screen.getByText(/no match/i)).toBeInTheDocument();
});

test('rendering a component that uses useLocation', () => {
  const route = '/some-route';

  // use <MemoryRouter> when you want to manually control the history
  render(
    <MemoryRouter initialEntries={[route]}>
      <LocationDisplay />
    </MemoryRouter>,
  );

  // verify location display is rendered
  expect(screen.getByTestId('location-display')).toHaveTextContent(route);
});
```

## Reducing boilerplate

1. If you find yourself adding Router components to your tests a lot, you may
   want to create a helper function that wraps around `render`.

```jsx
// test utils file
const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: BrowserRouter }),
  };
};
```

```jsx
// app.test.js
test('full app rendering/navigating', async () => {
  const { user } = renderWithRouter(<App />);
  expect(screen.getByText(/you are home/i)).toBeInTheDocument();

  await user.click(screen.getByText(/about/i));

  expect(screen.getByText(/you are on the about page/i)).toBeInTheDocument();
});

test('landing on a bad page', () => {
  renderWithRouter(<App />, { route: '/something-that-does-not-match' });

  expect(screen.getByText(/no match/i)).toBeInTheDocument();
});

test('rendering a component that uses useLocation', () => {
  const route = '/some-route';
  renderWithRouter(<LocationDisplay />, { route });

  expect(screen.getByTestId('location-display')).toHaveTextContent(route);
});
```
