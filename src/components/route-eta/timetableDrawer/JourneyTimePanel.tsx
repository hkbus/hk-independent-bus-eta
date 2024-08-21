import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DbContext from "../../../context/DbContext";
import {
  Box,
  Divider,
  Icon,
  Step,
  StepIconProps,
  StepLabel,
  Stepper,
  SxProps,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { fetchEstJourneyTime } from "hk-bus-eta";
import {
  TripOrigin as TripOriginIcon,
  Lens as LensIcon,
  Flag as FlagIcon,
  FlagOutlined as FlagOutlinedIcon,
} from "@mui/icons-material";
import useLanguage from "../../../hooks/useTranslation";
import { CircularProgress } from "../../Progress";

interface JourneyTimePanelProps {
  routeId: string;
}

interface JourneyTimePanelState {
  isLoading: boolean;
  startSeq: number | null;
  endSeq: number | null;
  jt: number | null;
  choice: "start" | "end";
}

const JourneyTimePanel = ({ routeId }: JourneyTimePanelProps) => {
  const {
    db: { routeList, stopList },
  } = useContext(DbContext);
  const lang = useLanguage();
  const route = routeList[routeId];
  const { t } = useTranslation();
  const [state, setState] = useState<JourneyTimePanelState>(DEFAULT_STATE);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (state.startSeq === null || state.endSeq === null) {
      setState((prev) => ({
        ...prev,
        jt: route.jt !== null ? Math.round(parseFloat(route.jt)) : null,
      }));
      return;
    }
    abortController.current?.abort();
    abortController.current = new AbortController();

    setState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    fetchEstJourneyTime({
      route,
      startSeq: state.startSeq,
      endSeq: state.endSeq,
      stopList,
      batchSize: Math.min(Math.ceil((state.endSeq - state.startSeq) / 3), 6),
      signal: abortController.current.signal,
    }).then((jt) => {
      setState((prev) => ({
        ...prev,
        jt,
        isLoading: false,
      }));
    });
  }, [route, state.endSeq, state.startSeq, stopList]);

  const stops = useMemo(() => {
    return Object.values(route.stops)[0];
  }, [route]);

  const handlePickStop = useCallback(
    (idx: number) => () => {
      setState((prev) => {
        let _startSeq = prev.startSeq;
        let _endSeq = prev.endSeq;
        let _choice = prev.choice;
        if (prev.choice === "start") {
          if (prev.startSeq === idx) _startSeq = null;
          else {
            _startSeq = idx;
          }
          if (_endSeq !== null && idx >= _endSeq) {
            _endSeq = null;
          }
          if (_startSeq !== null && _endSeq === null) _choice = "end";
        } else {
          if (prev.endSeq === idx) _endSeq = null;
          else {
            _endSeq = idx;
          }
          if (_startSeq !== null && idx <= _startSeq) {
            _startSeq = null;
          }
          if (_endSeq !== null && _startSeq === null) _choice = "start";
        }

        return {
          ...prev,
          startSeq: _startSeq,
          endSeq: _endSeq,
          choice: _choice,
        };
      });
    },
    []
  );

  const handlePickChoice = useCallback(
    (choice: JourneyTimePanelState["choice"]) => () => {
      setState((prev) => ({
        ...prev,
        choice,
      }));
    },
    []
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      pt={1}
      flex={1}
      overflow="hidden"
    >
      <Box display="flex" flexDirection="column" gap={1} p={1}>
        <Box display="flex" gap={1} onClick={handlePickChoice("start")}>
          <Icon color={state.choice === "start" ? "primary" : undefined}>
            {state.choice === "start" ? <FlagIcon /> : <FlagOutlinedIcon />}
          </Icon>
          <TextField
            variant="standard"
            value={
              state.startSeq !== null
                ? stopList[stops[state.startSeq]].name[lang]
                : ""
            }
            fullWidth
            placeholder={t("起點")}
            focused={state.choice === "start"}
            sx={{ pointerEvents: "none" }}
          />
        </Box>
        <Box display="flex" gap={1} onClick={handlePickChoice("end")}>
          <Icon color={state.choice === "end" ? "primary" : undefined}>
            {state.choice === "end" ? <FlagIcon /> : <FlagOutlinedIcon />}
          </Icon>
          <TextField
            variant="standard"
            value={
              state.endSeq !== null
                ? stopList[stops[state.endSeq]].name[lang]
                : ""
            }
            fullWidth
            placeholder={t("目的地")}
            focused={state.choice === "end"}
            sx={{ pointerEvents: "none" }}
          />
        </Box>
      </Box>
      <Box sx={jtContainerSx}>
        <Typography variant="subtitle1">{t("車程")}</Typography>
        <Typography variant="subtitle1">
          {state.isLoading ? (
            <CircularProgress sx={{ m: 0 }} size={16} />
          ) : (
            `${state.jt ?? " - "} ${t("分鐘")}`
          )}
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box overflow="auto" flex={1}>
        <Stepper orientation="vertical">
          {stops.map((stop, idx) => (
            <Step
              key={stop}
              active={isStepActive(idx, state.startSeq, state.endSeq)}
              onClick={handlePickStop(idx)}
            >
              <StepLabel StepIconComponent={StepIcon}>
                {stopList[stop].name[lang]}
              </StepLabel>
            </Step>
          ))}
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

const DEFAULT_STATE: JourneyTimePanelState = {
  startSeq: null,
  endSeq: null,
  jt: null,
  choice: "start",
  isLoading: false,
};

const jtContainerSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  width: "80%",
};

const isStepActive = (
  idx: number,
  start: number | null,
  end: number | null
) => {
  if (start === idx || end === idx) return true;
  if (start !== null && end !== null) {
    return start < idx && idx < end;
  }
  return false;
};
