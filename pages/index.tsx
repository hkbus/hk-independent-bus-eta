import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { useEffect } from "react";

import { makeStaticProps } from "../util/getStatic";
const IndexPage: NextPage = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace("/" + (localStorage.getItem("lang") ?? "zh"));
  });
  return (
    <>
      <Head>
        <title>巴士到站預報 App</title>
      </Head>
    </>
  );
};

export default IndexPage;

const getStaticProps = makeStaticProps();
export { getStaticProps };
