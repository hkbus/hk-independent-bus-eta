// work only after the API give the header "Access-Control-Allow-Origin: *"

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import AppContext from "../AppContext";

export interface Notice {
  incidentNo: string;
  heading: {
    en: string;
    zh: string;
  };
  detail: {
    en: string;
    zh: string;
  };
  date: string;
  status: {
    en: string;
    zh: string;
  };
  id: string;
  content: {
    en: string;
    zh: string;
  };
}

const useNotices = () => {
  const { isVisible } = useContext(AppContext);
  const [notices, setNotices] = useState<Notice[]>(
    JSON.parse(localStorage.getItem("notices") ?? "[]")
  );
  const isMounted = useRef<boolean>(false);

  const fetchData = useCallback(() => {
    if (!isVisible || navigator.userAgent === "prerendering") {
      // skip if prerendering
      setNotices([]);
      return new Promise((resolve) => resolve([]));
    }
    return fetch("https://www.td.gov.hk/tc/special_news/trafficnews.xml")
      .then((r) => r.text())
      .then((xml) => xmlToNotice(xml))
      .then((msgs) => {
        console.log(msgs);
        if (isMounted.current) {
          setNotices((prev) => {
            const newNotices = Object.values<Notice>(
              [...msgs, ...prev].reduce(
                (acc, cur) => {
                  acc[cur.id] = cur;
                  return acc;
                },
                {} as Record<string, Notice>
              )
            ).sort((a, b) => (a.date > b.date ? -1 : 1));

            localStorage.setItem("notices", JSON.stringify(newNotices));
            return newNotices;
          });
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, [isVisible]);

  useEffect(() => {
    isMounted.current = true;
    const fetchNotices = setInterval(() => {
      fetchData();
    }, 60000);

    fetchData();

    return () => {
      isMounted.current = false;
      clearInterval(fetchNotices);
    };
  }, [fetchData]);

  return notices;
};

export default useNotices;

const xmlToNotice = (xml: string): Notice[] => {
  let root = new window.DOMParser().parseFromString(xml, "text/xml");
  return Array.from(root.querySelectorAll("message"))
    .map((msg) => Array.from(msg.querySelectorAll("*")))
    .map((nodes) =>
      nodes.reduce(
        (acc, node) => {
          if (node.textContent === null) return acc;
          switch (node.tagName) {
            case "INCIDENT_NUMBER":
              acc.incidentNo = node.textContent;
              break;
            case "INCIDENT_HEADING_EN":
              acc.heading.en = node.textContent;
              break;
            case "INCIDENT_HEADING_CN":
              acc.heading.zh = node.textContent;
              break;
            case "INCIDENT_DETAIL_EN":
              acc.detail.en = node.textContent;
              break;
            case "INCIDENT_DETAIL_CN":
              acc.detail.zh = node.textContent;
              break;
            case "ANNOUNCEMENT_DATE":
              acc.date = node.textContent + "+0800";
              break;
            case "INCIDENT_STATUS_EN":
              acc.status.en = node.textContent;
              break;
            case "INCIDENT_STATUS_CN":
              acc.status.zh = node.textContent;
              break;
            case "ID":
              acc.id = node.textContent;
              break;
            case "CONTENT_EN":
              acc.content.en = node.textContent;
              break;
            case "CONTENT_CN":
              acc.content.zh = node.textContent;
              break;
          }
          return acc;
        },
        {
          incidentNo: "",
          heading: {
            en: "",
            zh: "",
          },
          detail: {
            en: "",
            zh: "",
          },
          date: "",
          status: {
            en: "",
            zh: "",
          },
          id: "",
          content: {
            en: "",
            zh: "",
          },
        } as Notice
      )
    );
};
