import React from 'react';
import { parse as parseCookie } from 'cookie';
import nextSession from '../index';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

// eslint-disable-next-line import/prefer-default-export
export function withSession(Page, options) {
  const WithSession = props => <Page {...props} />;
  WithSession.displayName = `withSession(${getDisplayName(Page)})`;
  if (Page.getInitialProps)
    WithSession.getInitialProps = context => {
      const ctx = context.ctx || context;
      if (typeof window !== 'undefined') return Page.getInitialProps(ctx);
      ctx.req.cookies =
        ctx.req.cookies ||
        (ctx.req.headers &&
          typeof ctx.req.headers.cookie === 'string' &&
          parseCookie(ctx.req.headers.cookie)) ||
        {};
      return new Promise(resolve => {
        nextSession(options)(ctx.req, ctx.res, resolve);
      }).then(() => {
        ctx.session = (ctx.req && ctx.req.session) || undefined;
        return Page.getInitialProps(ctx);
      });
    };
  return WithSession;
}
