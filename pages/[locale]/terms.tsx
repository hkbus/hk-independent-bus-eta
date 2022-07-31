import { NextPage } from "next";
import React from "react";
import TermsAndConditions from "../../src/pages/TermsAndConditions";
import { getStaticPaths, makeStaticProps } from "../../util/getStatic";
const TermsAndConditionsContainer: NextPage = () => {
  return <TermsAndConditions />;
};

export default TermsAndConditionsContainer;

const getStaticProps = makeStaticProps();
export { getStaticPaths, getStaticProps };
