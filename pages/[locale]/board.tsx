import { NextPage } from "next";
import React from "react";
import RouteBoard from "../../src/pages/RouteBoard";
import { getStaticPaths, makeStaticProps } from "../../util/getStatic";
const RouteBoardContainer: NextPage = () => {
  return <RouteBoard />;
};

export default RouteBoardContainer;
const getStaticProps = makeStaticProps();
export { getStaticPaths, getStaticProps };
