import { useContext, useEffect, useMemo, useRef, useState } from "react";
import DbContext from "../../../context/DbContext";
import {
  Box,
  Step,
  StepIconProps,
  StepLabel,
  Stepper,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { fetchEstJourneyTime } from "hk-bus-eta";
import {
  TripOrigin as TripOriginIcon,
  Lens as LensIcon,
} from "@mui/icons-material";
import useLanguage from "../../../hooks/useTranslation";
import { CircularProgress } from "../../Progress";

interface JourneyTimePanelProps {
  routeId: string;
  stopId: string;
}

const JourneyTimePanel = ({ routeId, stopId }: JourneyTimePanelProps) => {
  const {
    db: { routeList, stopList, holidays },
  } = useContext(DbContext);
  const lang = useLanguage();
  const route = routeList[routeId];
  const { t } = useTranslation();
  const stops = useMemo(() => Object.values(route.stops)[0], [route]);
  const [startSeq, setStartSeq] = useState(() =>
    Math.max(stops.indexOf(stopId), 0)
  );
  const [minutes, setMinutes] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = scrollRef.current;
    const step = stepRefs.current[startSeq];
    if (!container || !step) return;
    container.scrollTo({
      top:
        container.scrollTop +
        step.getBoundingClientRect().top -
        container.getBoundingClientRect().top,
      behavior: "smooth",
    });
  }, [startSeq]);

  useEffect(() => {
    const controller = new AbortController();
    setMinutes([]);
    setIsLoading(true);

    (async () => {
      let total = 0;
      for (let seq = startSeq; seq < stops.length - 1; ++seq) {
        const jt = await fetchEstJourneyTime({
          route,
          stopList,
          holidays,
          startSeq: seq,
          endSeq: seq + 1,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        total += jt;
        const cumulative = total;
        setMinutes((prev) => [...prev, cumulative]);
      }
    })()
      .catch((e) => {
        if (!controller.signal.aborted) console.error(e);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [route, stopList, holidays, stops, startSeq]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      pt={1}
      flex={1}
      overflow="hidden"
    >
      <Box
        ref={scrollRef}
        overflow="auto"
        flex={1}
        sx={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <Stepper orientation="vertical">
          {stops.map((stop, idx) => {
            const offset = idx - startSeq - 1;
            const optional =
              idx < startSeq ? null : idx === startSeq ? (
                <Typography variant="caption">{t("起點")}</Typography>
              ) : isLoading && offset === minutes.length ? (
                <CircularProgress sx={{ m: 0 }} size={16} />
              ) : (
                <Typography variant="subtitle1">
                  <Box component="span" sx={waitTimeSx}>
                    {minutes[offset] !== undefined
                      ? `${Math.round(minutes[offset])} `
                      : " - "}
                  </Box>
                  <Box component="span" sx={{ fontSize: "0.8em" }}>
                    {t("分鐘")}
                  </Box>
                </Typography>
              );
            return (
              <Step
                key={`${stop}-${idx}`}
                ref={(el: HTMLDivElement | null) => {
                  stepRefs.current[idx] = el;
                }}
                active={idx >= startSeq}
                onClick={() => setStartSeq(idx)}
              >
                <StepLabel
                  StepIconComponent={StepIcon}
                  optional={optional}
                  sx={idx < startSeq ? beforeStartSx : undefined}
                >
                  {stopList[stop].name[lang]}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Box>
    </Box>
  );
};

const StepIcon = ({ active, completed }: StepIconProps) => {
  if (active || completed) {
    return <LensIcon />;
  }
  return <TripOriginIcon />;
};

export default JourneyTimePanel;

const waitTimeSx: SxProps<Theme> = {
  fontSize: "1.1em",
  fontWeight: "700",
  color: "warning.main",
};

const beforeStartSx: SxProps<Theme> = {
  color: "text.disabled",
  "& .MuiStepLabel-label": {
    color: "text.disabled",
  },
};
