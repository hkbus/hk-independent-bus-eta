import {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from "next/document";
import Script from "next/script";
import Document from "next/document";
import i18nextConfig from "../next-i18next.config";
import createEmotionServer from "@emotion/server/create-instance";
import createEmotionCache from "../src/createEmotionCache";
import React from "react";

class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const originalRenderPage = ctx.renderPage;
    const cache = createEmotionCache();
    const { extractCriticalToChunks } = createEmotionServer(cache);
    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App: any) =>
          function EnhanceApp(props) {
            return <App emotionCache={cache} {...props} />;
          },
      });
    const initialProps = await Document.getInitialProps(ctx);
    // This is important. It prevents Emotion to render invalid HTML.
    // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
    const emotionStyles = extractCriticalToChunks(initialProps.html);
    const emotionStyleTags = emotionStyles.styles.map((style) => (
      <style
        data-emotion={`${style.key} ${style.ids.join(" ")}`}
        key={style.key}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: style.css }}
      />
    ));

    return {
      ...initialProps,
      styles: emotionStyleTags,
    };
  }
  render() {
    const props = this.props;
    const currentLocale =
      (props.__NEXT_DATA__.query.locale as string) ||
      i18nextConfig.i18n.defaultLocale;

    return (
      <Html lang={currentLocale}>
        <Head>
          <meta charSet="utf-8" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="canonical" href="https://hkbus.app/" />
          <link rel="alternative" hrefLang="en" href="https://hkbus.app/en" />
          <link
            rel="alternative"
            hrefLang="zh-Hant"
            href="https://hkbus.app/zh"
          />
          <link
            rel="alternative"
            hrefLang="x-default"
            href="https://hkbus.app/zh"
          />
          <meta name="theme-color" content="#000000" />
          <link rel="preconnect" href="https://cdn.jsdelivr.net" />
          <link
            rel="preload"
            href="https://cdn.jsdelivr.net/gh/chiron-fonts/chiron-sans-hk-pro@1.010/build/webfont/css/vf.css"
            as="style"
          />
          <link
            rel="preload"
            href="https://cdn.jsdelivr.net/gh/chiron-fonts/chiron-sans-hk-pro@1.010/build/webfont/css/vf-italic.css"
            as="style"
          />
          <link
            rel="preload"
            href="https://cdn.jsdelivr.net/npm/@fontsource/oswald@4.5.1/latin.css"
            as="style"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/gh/chiron-fonts/chiron-sans-hk-pro@1.010/build/webfont/css/vf.css"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/gh/chiron-fonts/chiron-sans-hk-pro@1.010/build/webfont/css/vf-italic.css"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@fontsource/oswald@4.5.1/latin.css"
          />
          <meta
            name="description"
            content="無廣告手機應用程式查閱巴士線、車站、預計到達時間，路線盡包九龍巴士(九巴)、龍運巴士、新世界第一巴士(新巴)、城巴、新大嶼山巴士、專線小巴 - 巴士到站預報 App"
          />
          <link rel="apple-touch-icon" href="/logo192.png" />
          <link rel="manifest" href="/manifest.json" />
          <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-GHB6RFYM15"
          ></Script>
          <Script
            id="google-tag"
            strategy="lazyOnload"
          >{`const analytics = JSON.parse(localStorage.getItem("analytics")) ?? true;
    if (analytics) {
      window.dataLayer = window.dataLayer || [];

      function gtag() {
        dataLayer.push(arguments);
      }

      gtag("js", new Date());

      gtag("config", "G-GHB6RFYM15");
    }`}</Script>
          {props.styles}
          <style>{`
            html, body, #__next {
              height: 100%;
            }
          `}</style>
        </Head>
        <body style={{ overscrollBehaviorY: "none", backgroundColor: "#000" }}>
          <noscript>You need to enable JavaScript to run this app.</noscript>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
export default MyDocument;
