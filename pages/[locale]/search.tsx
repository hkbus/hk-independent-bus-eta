import { NextPage } from "next";
import React from "react";
import RouteSearch from "../../src/pages/RouteSearch";
import { getStaticPaths, makeStaticProps } from "../../util/getStatic";
const RouteSearchContainer: NextPage = () => {
  return <RouteSearch />;
};

export default RouteSearchContainer;

const getStaticProps = makeStaticProps();
export { getStaticPaths, getStaticProps };
