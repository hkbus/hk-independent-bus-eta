import {
  Box,
  Divider,
  List,
  ListItem,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import RouteOffiicalUrlBtn from "../timetableDrawer/RouteOfficialUrlBtn";
import { isHoliday } from "../../../timetable";
import DbContext from "../../../context/DbContext";

interface TimeTableProps {
  routeId: string;
}

const TimeTable = ({ routeId }: TimeTableProps) => {
  const { t } = useTranslation();
  const {
    db: { routeList, holidays },
  } = useContext(DbContext);
  const { freq } = routeList[routeId];

  const isTodayHoliday = useMemo(
    () => isHoliday(holidays, new Date()),
    [holidays]
  );

  return (
    <>
      <List sx={{ flex: 1, overflow: "auto" }}>
        {freq &&
          Object.entries(freq).map(([serviceId, dayFreq]) => (
            <ListItem key={serviceId} sx={entriesSx}>
              <Typography variant="subtitle1">
                {t(ServiceIds[serviceId])}
              </Typography>
              {Object.entries(dayFreq)
                .sort((a, b) => (a[0] < b[0] ? -1 : 1))
                .map(([start, details]) => (
                  <Box
                    key={`${serviceId}-${start}`}
                    sx={
                      isCurrentTimeslot(
                        start,
                        details,
                        serviceId,
                        isTodayHoliday
                      )
                        ? highlightContainerSx
                        : freqContainerSx
                    }
                  >
                    <Typography variant="body1">
                      {start} {details ? `- ${details[0]}` : ""}
                    </Typography>
                    {details ? (
                      <Typography variant="body1">
                        {parseInt(details[1], 10) / 60}
                        {t("分鐘")}
                      </Typography>
                    ) : (
                      <></>
                    )}
                  </Box>
                ))}
            </ListItem>
          ))}
      </List>
      <Divider sx={{ width: "80%", my: 2 }} />
      <RouteOffiicalUrlBtn routeId={routeId} />
    </>
  );
};

export default TimeTable;

export const ServiceIds: Record<string, string> = {
  31: "星期一至五",
  287: "星期一至五",
  415: "星期一至五",
  63: "星期一至六",
  319: "星期一至六",
  447: "星期一至六",
  416: "星期六至日",
  480: "星期六至日",
  266: "星期二至四",
  271: "星期一至四",
  272: "星期五",
  288: "星期六",
  320: "星期日及公眾假期",
  448: "星期日及公眾假期",
  511: "所有日子",
  111: "除星期三外",
  1: "星期一",
  2: "星期二",
  4: "星期三",
  8: "星期四",
  16: "星期五",
  32: "星期六",
  64: "星期日",
  257: "星期一",
  258: "星期二",
  260: "星期三",
  264: "星期四",
  999: "未知日子",
};

const ServiceMaps: Record<
  string,
  [boolean, boolean, boolean, boolean, boolean, boolean, boolean]
> = {
  31: [false, true, true, true, true, true, false], // "星期一至五"
  287: [false, true, true, true, true, true, false], // "星期一至五"
  415: [false, true, true, true, true, true, false], // "星期一至五"
  63: [false, true, true, true, true, true, true], // "星期一至六"
  319: [false, true, true, true, true, true, true], // "星期一至六"
  447: [false, true, true, true, true, true, true], // "星期一至六"
  416: [true, false, false, false, false, false, true], // "星期六至日"
  480: [true, false, false, false, false, false, true], // "星期六至日"
  266: [false, false, true, true, true, false, false], // "星期二至四",
  271: [false, true, true, true, true, false, false], // "星期一至四",
  272: [false, false, false, false, false, true, false], // "星期五"
  288: [false, false, false, false, false, false, true], // "星期六",
  320: [true, false, false, false, false, false, false], // "星期日及公眾假期",
  448: [true, false, false, false, false, false, false], // "星期日及公眾假期",
  511: [true, true, true, true, true, true, true], // "所有日子",
  111: [true, true, true, false, true, true, true], // "除星期三外",
  1: [false, true, false, false, false, false, false], // "星期一",
  2: [false, false, true, false, false, false, false], // "星期二",
  4: [false, false, false, true, false, false, false], // "星期三",
  8: [false, false, false, false, true, false, false], // "星期四",
  16: [false, false, false, false, false, true, false], // "星期五",
  32: [false, false, false, false, false, false, true], // "星期六",
  64: [true, false, false, false, false, false, false], // "星期日",
  257: [false, true, false, false, false, false, false], // "星期一",
  258: [false, false, true, false, false, false, false], // "星期二",
  260: [false, false, false, true, false, false, false], // "星期三",
  264: [false, false, false, false, true, false, false], // "星期四",
  999: [false, false, false, false, false, false, false], // "未知日子",
};

const entriesSx: SxProps<Theme> = {
  flexDirection: "column",
  alignItems: "flex-start",
};

const freqContainerSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  width: "80%",
};

const highlightContainerSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  width: "80%",
  color: (t) => t.palette.primary.main,
  borderBottom: "1px solid",
};

const isMatchServiceId = (serviceId: string, isHoliday: boolean): boolean => {
  const day = new Date().getDay();
  if (
    ServiceMaps[serviceId] &&
    (ServiceMaps[serviceId][day] || (ServiceMaps[serviceId][0] && isHoliday))
  ) {
    return true;
  }
  return false;
};

const isCurrentTimeslot = (
  start: string,
  details: [string, string] | null,
  serviceId: string,
  isHoliday: boolean
): boolean => {
  if (!isMatchServiceId(serviceId, isHoliday)) return false;
  const date = new Date();
  const ts = `${date.getHours().toString().padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}`;
  if (details) {
    return start <= ts && ts <= details[0];
  }
  return false;
};
