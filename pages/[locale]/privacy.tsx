import { NextPage } from "next";
import React from "react";
import PrivacyPolicy from "../../src/pages/PrivacyPolicy";
import { getStaticPaths, makeStaticProps } from "../../util/getStatic";
const PrivacyPolicyContainer: NextPage = () => {
  return <PrivacyPolicy />;
};

export default PrivacyPolicyContainer;

const getStaticProps = makeStaticProps();
export { getStaticPaths, getStaticProps };
