import { describe, expect, it, vi } from 'vitest';
import { act, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mswUtils.ts';
import { renderRoute } from '@/test/routerUtils.tsx';

describe('fetch route', () => {
  it.each(['/fetch', '/table-export'])(
    'shows denied weather access on %s without a loading spinner or automatic retries',
    async (initialPath) => {
      let requests = 0;
      server.use(
        http.get('/api/user/me', () =>
          HttpResponse.json({
            email: null,
            iamId: null,
            id: 'user-1',
            name: null,
            roles: [],
          })
        ),
        http.get('/api/weatherforecast', () => {
          requests += 1;
          return new HttpResponse(null, { status: 403 });
        })
      );
      const { cleanup } = renderRoute({ initialPath });
      try {
        expect(await screen.findByRole('alert')).toHaveTextContent(
          'Your account cannot access weather forecasts.'
        );
        expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
        expect(requests).toBe(1);
      } finally {
        cleanup();
      }
    }
  );

  it.each(['/fetch', '/table-export'])(
    'recovers from a failed request on %s when the user retries',
    async (initialPath) => {
      let requests = 0;
      const user = userEvent.setup();
      server.use(
        http.get('/api/user/me', () =>
          HttpResponse.json({
            email: '',
            iamId: null,
            id: 'user-1',
            name: '',
            roles: [],
          })
        ),
        http.get('/api/weatherforecast', () =>
          ++requests === 1
            ? new HttpResponse(null, { status: 503 })
            : HttpResponse.json([
                {
                  date: '2024-07-04',
                  summary: 'Recovered',
                  temperatureC: 25,
                  temperatureF: 77,
                },
              ])
        )
      );
      const { cleanup } = renderRoute({ initialPath });
      try {
        expect(await screen.findByRole('alert')).toHaveTextContent(
          'Could not load weather forecasts.'
        );
        await user.click(screen.getByRole('button', { name: 'Try again' }));
        expect(await screen.findByText('Recovered')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      } finally {
        cleanup();
      }
    }
  );

  it.each([[], { unexpected: 'object' }])(
    'distinguishes empty results from malformed data: %j',
    async (data) => {
      server.use(
        http.get('/api/user/me', () =>
          HttpResponse.json({
            email: '',
            iamId: null,
            id: 'user-1',
            name: '',
            roles: [],
          })
        ),
        http.get('/api/weatherforecast', () => HttpResponse.json(data))
      );
      const { cleanup } = renderRoute({ initialPath: '/fetch' });
      try {
        if (Array.isArray(data)) {
          expect(
            await screen.findByText('No weather forecasts are available.')
          ).toBeInTheDocument();
          expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        } else {
          expect(await screen.findByRole('alert')).toHaveTextContent(
            'Could not load weather forecasts.'
          );
        }
      } finally {
        cleanup();
      }
    }
  );

  it('hides the previous account weather while a new account loads', async () => {
    const firstUser = {
      email: '',
      iamId: null,
      id: 'user-1',
      name: '',
      roles: [],
    };
    let requests = 0;
    let release!: () => void;
    const ready = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      http.get('/api/user/me', () => HttpResponse.json(firstUser)),
      http.get('/api/weatherforecast', async () => {
        const current = ++requests;
        if (current > 1) {
          await ready;
        }
        return HttpResponse.json([
          {
            date: '2024-07-04',
            summary: current === 1 ? 'First account' : 'Second account',
            temperatureC: 25,
            temperatureF: 77,
          },
        ]);
      })
    );
    const { cleanup, queryClient } = renderRoute({ initialPath: '/fetch' });
    try {
      expect(await screen.findByText('First account')).toBeInTheDocument();
      await act(async () => {
        queryClient.setQueryData(['users', 'me'], {
          ...firstUser,
          id: 'user-2',
        });
      });
      await screen.findByText(/Loading/);
      expect(screen.queryByText('First account')).not.toBeInTheDocument();
      release();
      expect(await screen.findByText('Second account')).toBeInTheDocument();
    } finally {
      release();
      cleanup();
    }
  });

  it('renders the not-authorized state when the signed-in user is forbidden', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const consoleWarn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    let weatherRequestCount = 0;

    server.use(
      http.get('/api/user/me', () => new HttpResponse(null, { status: 403 })),
      http.get('/api/weatherforecast', () => {
        weatherRequestCount += 1;
        return HttpResponse.json([]);
      })
    );

    let cleanup: (() => void) | undefined;

    try {
      ({ cleanup } = renderRoute({ initialPath: '/fetch' }));
      expect(
        await screen.findByRole('heading', { name: 'Access unavailable' })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'You are signed in, but your account is not authorized to use this application.'
        )
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('heading', { name: 'Weather forecast' })
      ).not.toBeInTheDocument();
      expect(weatherRequestCount).toBe(0);
    } finally {
      consoleError.mockRestore();
      consoleWarn.mockRestore();
      cleanup?.();
    }
  });

  it('renders weather data returned by the API', async () => {
    // arrange
    const forecasts = [
      {
        date: '2024-07-04',
        summary: 'Sunny',
        temperatureC: 25,
        temperatureF: 77,
      },
    ];

    let weatherRequestCount = 0;
    let userRequestCount = 0;

    server.use(
      http.get('/api/weatherforecast', () => {
        weatherRequestCount += 1;
        return HttpResponse.json(forecasts);
      }),
      http.get('/api/user/me', () => {
        userRequestCount += 1;
        return HttpResponse.json({
          email: 'user@example.test',
          iamId: null,
          id: 'user-1',
          name: 'User',
          roles: [],
        });
      })
    );

    // act
    const { cleanup } = renderRoute({ initialPath: '/fetch' });

    // Assert the rendered output
    try {
      expect(await screen.findByText('Weather forecast')).toBeInTheDocument();
      expect(await screen.findByText('Sunny')).toBeInTheDocument();
      expect(weatherRequestCount).toBe(1);
      expect(userRequestCount).toBe(1);
    } finally {
      cleanup();
    }
  });
});
