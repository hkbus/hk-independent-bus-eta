import { NextPage } from "next";
import React from "react";
import Home from "../../src/pages/Home";
import { getStaticPaths, makeStaticProps } from "../../util/getStatic";
const HomeContainer: NextPage = () => {
  return <Home />;
};

export default HomeContainer;

const getStaticProps = makeStaticProps();
export { getStaticPaths, getStaticProps };
