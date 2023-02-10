import React, { useEffect } from "react";
import { Typography } from "@mui/material";

interface RedirectPageProps {
  url: string;
}

const RedirectPage = ({ url }: RedirectPageProps) => {
  useEffect(() => {
    window.location.replace(url);
  }, [url]);

  return <Typography variant="body1">Redirecting...</Typography>;
};

export default RedirectPage;
