import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { userEvent } from '@testing-library/user-event';
import { server } from '@/test/mswUtils.ts';
import { renderRoute } from '@/test/routerUtils.tsx';

describe('notification route', () => {
  it.each(['token', 'delivery'] as const)(
    'does not report success for an invalid %s response',
    async (stage) => {
      let posts = 0;
      server.use(
        http.get('/api/user/me', () =>
          HttpResponse.json({
            email: 'signed-in@example.test',
            iamId: null,
            id: 'user-1',
            name: 'Taylor',
            roles: [],
          })
        ),
        http.post('/api/notification/table', () => {
          posts += 1;
          return HttpResponse.json({ to: null });
        })
      );
      const { cleanup } = renderRoute({ initialPath: '/notification' });
      try {
        if (stage === 'token') {
          server.use(
            http.get('/api/notification/antiforgery', () =>
              HttpResponse.json({ requestToken: '' })
            )
          );
        }
        await userEvent
          .setup()
          .click(
            await screen.findByRole('button', {
              name: 'Send Table Example Email',
            })
          );
        expect(
          await screen.findByText(
            'The server returned an invalid response. Please try again.'
          )
        ).toBeInTheDocument();
        expect(
          screen.queryByText(/^Table example email sent to/)
        ).not.toBeInTheDocument();
        expect(posts).toBe(stage === 'token' ? 0 : 1);
        expect(
          screen.getByRole('button', { name: 'Send Table Example Email' })
        ).toBeEnabled();
      } finally {
        cleanup();
      }
    }
  );

  beforeEach(() => {
    server.use(
      http.get('/api/notification/antiforgery', () =>
        HttpResponse.json({ requestToken: 'test-antiforgery-token' })
      )
    );
  });

  it.each(['success', 'failure'] as const)(
    'shares overlapping token requests and fetches a fresh token after %s',
    async (outcome) => {
      const user = userEvent.setup();
      let releaseToken!: () => void;
      const tokenResponseReady = new Promise<void>((resolve) => {
        releaseToken = resolve;
      });
      let tokenRequests = 0;
      const posts: { endpoint: string; token: string | null }[] = [];

      server.use(
        http.get('/api/user/me', () =>
          HttpResponse.json({
            email: 'signed-in@example.com',
            iamId: null,
            id: 'user-1',
            name: 'Taylor',
            roles: [],
          })
        ),
        http.get('/api/notification/antiforgery', async () => {
          const requestNumber = ++tokenRequests;
          if (requestNumber === 1) {
            await tokenResponseReady;
            if (outcome === 'failure') {
              return new HttpResponse('Token acquisition failed', {
                status: 503,
              });
            }
          }
          return HttpResponse.json({ requestToken: `token-${requestNumber}` });
        }),
        http.post('/api/notification/:endpoint', ({ params, request }) => {
          posts.push({
            endpoint: String(params.endpoint),
            token: request.headers.get('RequestVerificationToken'),
          });
          return HttpResponse.json({ to: 'preview@example.com' });
        })
      );

      const { cleanup } = renderRoute({ initialPath: '/notification' });

      try {
        await user.click(
          await screen.findByRole('button', {
            name: 'Send Table Example Email',
          })
        );
        await user.click(
          screen.getByRole('button', { name: 'Send Notification Email' })
        );
        expect(
          screen.getByRole('button', { name: /Sending Table Example/ })
        ).toBeDisabled();
        expect(
          screen.getByRole('button', { name: /Submitting/ })
        ).toBeDisabled();

        releaseToken();

        if (outcome === 'failure') {
          expect(
            await screen.findAllByText('Token acquisition failed')
          ).toHaveLength(2);
          expect(posts).toEqual([]);
        } else {
          expect(
            await screen.findByText(/^Notification email sent to/)
          ).toBeInTheDocument();
          expect(
            await screen.findByText(/^Table example email sent to/)
          ).toBeInTheDocument();
          expect(posts).toEqual(
            expect.arrayContaining([
              { endpoint: 'default', token: 'token-1' },
              { endpoint: 'table', token: 'token-1' },
            ])
          );
          expect(posts).toHaveLength(2);
        }
        expect(tokenRequests).toBe(1);

        await user.click(
          screen.getByRole('button', { name: 'Send Table Example Email' })
        );
        expect(
          await screen.findByText(/^Table example email sent to/)
        ).toBeInTheDocument();
        expect(tokenRequests).toBe(2);
        expect(posts.at(-1)).toEqual({ endpoint: 'table', token: 'token-2' });
      } finally {
        releaseToken();
        cleanup();
      }
    }
  );

  it('renders the notification pipeline details and sends a notification email', async () => {
    let postedBody: Record<string, unknown> | undefined;

    server.use(
      http.get('/api/user/me', () =>
        HttpResponse.json({
          email: 'signed-in@example.com',
          iamId: null,
          id: 'user-1',
          name: 'Taylor',
          roles: [],
        })
      ),
      http.post('/api/notification/default', async ({ request }) => {
        expect(request.headers.get('RequestVerificationToken')).toBe(
          'test-antiforgery-token'
        );
        postedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ to: 'preview@example.com' });
      })
    );

    const { cleanup } = renderRoute({ initialPath: '/notification' });

    try {
      expect(
        await screen.findByText(
          'Razor templates, MJML, and SMTP in one shared flow'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /server\/Examples\/Notifications\/Views\/DefaultNotification_mjml\.cshtml/
        )
      ).toBeInTheDocument();

      fireEvent.input(screen.getByPlaceholderText('Enter subject'), {
        target: { value: 'Client test subject' },
      });
      fireEvent.input(screen.getByPlaceholderText('Enter email header'), {
        target: { value: 'Client test header' },
      });
      fireEvent.input(
        screen.getByPlaceholderText('Write the body of the notification email'),
        {
          target: { value: 'Client test message' },
        }
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Send Notification Email' })
      );

      expect(
        await screen.findByText('preview@example.com')
      ).toBeInTheDocument();
      expect(postedBody).toMatchObject({
        header: 'Client test header',
        message: 'Client test message',
        subject: 'Client test subject',
        to: '',
      });
    } finally {
      cleanup();
    }
  });

  it('sends an explicit recipient when the to field is filled in', async () => {
    let postedBody: Record<string, unknown> | undefined;

    server.use(
      http.get('/api/user/me', () =>
        HttpResponse.json({
          email: 'signed-in@example.com',
          iamId: null,
          id: 'user-1',
          name: 'Taylor',
          roles: [],
        })
      ),
      http.post('/api/notification/default', async ({ request }) => {
        expect(request.headers.get('RequestVerificationToken')).toBe(
          'test-antiforgery-token'
        );
        postedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ to: 'explicit@example.com' });
      })
    );

    const { cleanup } = renderRoute({ initialPath: '/notification' });

    try {
      await screen.findByText(
        'Razor templates, MJML, and SMTP in one shared flow'
      );

      fireEvent.input(
        screen.getByPlaceholderText('Leave blank to use the current user'),
        { target: { value: 'explicit@example.com' } }
      );
      fireEvent.input(screen.getByPlaceholderText('Enter subject'), {
        target: { value: 'Test subject' },
      });
      fireEvent.input(screen.getByPlaceholderText('Enter email header'), {
        target: { value: 'Test header' },
      });
      fireEvent.input(
        screen.getByPlaceholderText('Write the body of the notification email'),
        { target: { value: 'Test message' } }
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Send Notification Email' })
      );

      expect(
        await screen.findByText('explicit@example.com')
      ).toBeInTheDocument();
      expect(postedBody).toMatchObject({
        to: 'explicit@example.com',
      });
    } finally {
      cleanup();
    }
  });

  it('surfaces API errors from the notification endpoint', async () => {
    server.use(
      http.get('/api/user/me', () =>
        HttpResponse.json({
          email: 'signed-in@example.com',
          iamId: null,
          id: 'user-1',
          name: 'Taylor',
          roles: [],
        })
      ),
      http.post(
        '/api/notification/default',
        () =>
          new HttpResponse(
            'The notification endpoint is only available in development.',
            {
              status: 404,
            }
          )
      )
    );

    const { cleanup } = renderRoute({ initialPath: '/notification' });

    try {
      await screen.findByText(
        'Razor templates, MJML, and SMTP in one shared flow'
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Send Notification Email' })
      );

      expect(
        await screen.findByText(
          'The notification endpoint is only available in development.'
        )
      ).toBeInTheDocument();
    } finally {
      cleanup();
    }
  });

  it('posts five dummy rows to the table notification endpoint', async () => {
    let postedBody: Record<string, unknown> | undefined;

    server.use(
      http.get('/api/user/me', () =>
        HttpResponse.json({
          email: 'signed-in@example.com',
          iamId: null,
          id: 'user-1',
          name: 'Taylor',
          roles: [],
        })
      ),
      http.post('/api/notification/table', async ({ request }) => {
        expect(request.headers.get('RequestVerificationToken')).toBe(
          'test-antiforgery-token'
        );
        postedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ to: 'signed-in@example.com' });
      })
    );

    const { cleanup } = renderRoute({ initialPath: '/notification' });

    try {
      await screen.findByText(
        'Razor templates, MJML, and SMTP in one shared flow'
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Send Table Example Email' })
      );

      expect(
        await screen.findByText(/table example email sent to/i)
      ).toBeInTheDocument();
      expect(postedBody).toMatchObject({
        header: 'Five-row statement example',
        subject: 'Table notification example',
        to: '',
        totalAmount: 950,
      });
      expect(postedBody?.rows).toEqual([
        {
          amount: 125,
          details: 'Stakeholder interviews and scope alignment',
          title: 'Discovery workshop',
        },
        {
          amount: 240,
          details: 'Wireframes, review, and component specs',
          title: 'UI design',
        },
        {
          amount: 180,
          details: 'Route wiring and shared component integration',
          title: 'Frontend build',
        },
        {
          amount: 95,
          details: 'Notification endpoint and MJML template data',
          title: 'Backend API',
        },
        {
          amount: 310,
          details: 'Template verification and regression checks',
          title: 'QA pass',
        },
      ]);
    } finally {
      cleanup();
    }
  });
});
