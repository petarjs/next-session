import React from 'react';
import { parse as parseCookie } from 'cookie';
import nextSession from '../index';

// eslint-disable-next-line import/prefer-default-export
export function withSession(Page, options) {
  const strategy = options.strategy || 'hybrid';
  const WithSession = props => <Page {...props} />;
  if (strategy === 'hybrid') {
    WithSession.getInitialProps = async ctx => {
      let pageProps = {};
      if (ctx.req && ctx.res) {
        ctx.req.cookies =
          ctx.req.cookies ||
          (ctx.req.headers &&
            typeof ctx.req.headers.cookie === 'string' &&
            parseCookie(ctx.req.headers.cookie)) ||
          {};
        await new Promise(resolve => {
          nextSession(options)(ctx.req, ctx.res, resolve);
        });
      }
      ctx.session = (ctx.req && ctx.req.session) || undefined;
      if (Page.getInitialProps) {
        pageProps = await Page.getInitialProps(ctx);
      }
      return { session: ctx.session, ...pageProps };
    };
  }
  WithSession.displayName = `withSession(${Page.displayName ||
    Page.name ||
    'Component'})`;
  return WithSession;
}
