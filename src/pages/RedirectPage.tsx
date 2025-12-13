import { useContext, useEffect } from "react";
import { Typography } from "@mui/material";
import AppContext from "../context/AppContext";

interface RedirectPageProps {
  url: string;
}

const RedirectPage = ({ url }: RedirectPageProps) => {
  const { openUrl } = useContext(AppContext)
  useEffect(() => {
    openUrl(url)

  }, [openUrl, url]);

  return <Typography variant="body1">Redirecting...</Typography>;
};

export default RedirectPage;
