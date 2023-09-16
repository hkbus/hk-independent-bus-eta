import React, { useEffect, useState } from "react";
import { Link, Paper, SxProps, Theme, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface NoticeType {
  ChinShort: string;
  ChinText: string;
  CountofDistricts: string;
  CurrentStatus: string;
  EngShort: string;
  EngText: string;
  IncidentRefNo: string;
  ListOfDistrict: string;
  ReferenceDate: string;
  msgID: string;
}

const Notice = () => {
  const {
    i18n: { language },
  } = useTranslation();
  const [notices, setNotices] = useState<NoticeType[]>([]);

  useEffect(() => {
    fetch("https://resource.data.one.gov.hk/td/en/specialtrafficnews.xml")
      .then((response) => response.text())
      .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
      .then((data) => setNotices(xmlToJson(data)));
  }, []);

  return (
    <Paper sx={paperSx} square elevation={0}>
      {notices.map(({ msgID, ChinText, EngText, ReferenceDate }) => (
        <Paper key={msgID} elevation={5} sx={noticeContainerSx}>
          <Typography variant="body2" sx={{ alignSelf: "flex-end" }}>
            {ReferenceDate}
          </Typography>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => (
                <Typography variant="body1" {...props} />
              ),
              a: ({ node, ...props }) => <Link sx={linkSx} {...props} />,
            }}
          >
            {language === "zh" ? ChinText : EngText}
          </ReactMarkdown>
        </Paper>
      ))}
    </Paper>
  );
};

export default Notice;

const paperSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  width: "100%",
  flex: 1,
  textAlign: "left",
  p: 1,
  gap: 2,
};

const noticeContainerSx: SxProps<Theme> = {
  p: 2,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const linkSx: SxProps<Theme> = {
  color: (t) =>
    t.palette.mode === "dark" ? t.palette.primary.main : t.palette.primary.dark,
};

const xmlToJson = (root: Document): NoticeType[] => {
  return Array.from(root.querySelectorAll("message"))
    .map((msg) => Array.from(msg.querySelectorAll("*")))
    .map((nodes) =>
      nodes.reduce((acc, node) => {
        acc[node.tagName] = node.textContent;
        return acc;
      }, {} as NoticeType)
    );
};
