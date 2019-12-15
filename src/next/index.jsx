import React from 'react';
import { parse as parseCookie } from 'cookie';
import nextSession from '../index';

// eslint-disable-next-line import/prefer-default-export
export function withSession(App, options) {
  class WithSession extends React.Component {
    constructor(props) {
      super(props);
      this.session = props.session || this.session || undefined;
    }

    static async getInitialProps(appCtx) {
      const { ctx } = appCtx;

      let appProps = { pageProps: {} };

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

      ctx.session = (ctx.req && ctx.req.session) || this.session || {};

      if (App.getInitialProps) {
        appProps = await App.getInitialProps(appCtx);
      }

      return { session: ctx.session, ...appProps };
    }

    render() {
      return <App {...this.props} session={this.session} />;
    }
  }

  WithSession.displayName = `withSession(${App.displayName ||
    App.name ||
    'Component'})`;
  return WithSession;
}
