import type {
  GetStaticProps,
  GetStaticPaths,
  GetStaticPropsContext,
} from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import i18nextConfig from "../next-i18next.config";

export const getI18nPaths = () =>
  i18nextConfig.i18n.locales.map((lng) => ({
    params: {
      locale: lng,
    },
  }));

export const getStaticPaths: GetStaticPaths = () => ({
  fallback: false,
  paths: getI18nPaths(),
});

export async function getI18nProps(ctx: GetStaticPropsContext, ns?: string[]) {
  const locale = (ctx?.params?.locale ?? "zh") as string;
  let props = {
    ...(await serverSideTranslations(locale, ns ?? ["translation"])),
  };
  return props;
}

export const makeStaticProps = (ns = ["translation"]): GetStaticProps => {
  return async (ctx) => {
    return {
      props: await getI18nProps(ctx, ns),
    };
  };
};
