import { NextPage } from "next";
import React from "react";
import Settings from "../../src/pages/Settings";
import { getStaticPaths, makeStaticProps } from "../../util/getStatic";
const SettingsContainer: NextPage = () => {
  return <Settings />;
};

export default SettingsContainer;

const getStaticProps = makeStaticProps();
export { getStaticPaths, getStaticProps };
