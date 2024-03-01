import {
  Box,
  Button,
  SxProps,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  QueryStats as QueryStatsIcon,
} from "@mui/icons-material";
import { useCallback, useContext, useMemo, useState } from "react";
import EmotionContext, {
  CheckInOptions,
  EmotionCheckIn,
} from "../../EmotionContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const CheckIn = () => {
  const [state, setState] = useState<EmotionCheckIn>(DEFAULT_STATE);
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const { isRemind, addCheckin, lastCheckIn, updateLastCheckIn } =
    useContext(EmotionContext);

  const isDone = useMemo(
    () => state.happiness && state.moodScene && state.gratitudeObj,
    [state]
  );

  const handleSubmit = useCallback(() => {
    addCheckin({ ...state, ts: Date.now() });
  }, [state, addCheckin]);

  const handleUpdate = useCallback(
    (v: EmotionCheckIn["gratitudeCnt"] | null) => {
      updateLastCheckIn({ ...lastCheckIn, gratitudeCnt: v });
    },
    [updateLastCheckIn, lastCheckIn]
  );

  if (!isRemind) {
    return (
      <Box sx={rootSx}>
        <AccessTimeIcon fontSize="large" />
        <Typography variant="h6">
          {t("I have recorded your mood ")}
          {lastCheckIn.happiness}
          {t(" recently")}
        </Typography>
        <Typography variant="h6">
          {t("The place most profound you is ")}
          <u>{t(lastCheckIn.moodScene)}</u>
        </Typography>
        <Typography variant="h6">
          {t("And, what makes you most grateful is ")}
          <u>{t(lastCheckIn.gratitudeObj)}</u>
        </Typography>
        <Box sx={questionContainerSx}>
          <Typography variant="body1" alignSelf="flex-start" textAlign="start">
            {t("How many things are there to be grateful?")}
          </Typography>
          <ToggleButtonGroup
            size="large"
            value={lastCheckIn.gratitudeCnt}
            onChange={(_, v) => handleUpdate(v)}
            exclusive
          >
            {CheckInOptions.gratitudeCnt.map((v, idx) => (
              <ToggleButton value={v} key={`gratitudeCnt-${idx}`}>
                <Typography variant="h6">{v}</Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        <Button
          variant="outlined"
          onClick={() => navigate(`/${i18n.language}/emotion/chart`)}
          endIcon={<QueryStatsIcon />}
        >
          {t("Review")}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={rootSx}>
      <Box sx={questionContainerSx}>
        <Typography variant="body1" alignSelf="flex-start" textAlign="start">
          1. {t("How happy were you in the past 24 hours?")}
        </Typography>
        <ToggleButtonGroup
          size="large"
          value={state.happiness}
          onChange={(_, v) => setState((prev) => ({ ...prev, happiness: v }))}
          exclusive
        >
          {CheckInOptions.happiness.map((v, idx) => (
            <ToggleButton value={v} key={`happiness-${idx}`}>
              <Typography variant="h6">{v}</Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <Box sx={questionContainerSx}>
        <Typography variant="body1" alignSelf="flex-start" textAlign="start">
          2.{" "}
          {t(
            "What environment made you feel most profound in the past 24 hours?"
          )}
        </Typography>
        <ToggleButtonGroup
          size="large"
          value={state.moodScene}
          onChange={(_, v) => setState((prev) => ({ ...prev, moodScene: v }))}
          exclusive
          sx={{ flexWrap: "wrap", mx: 1 }}
        >
          {CheckInOptions.moodScene.map((v, idx) => (
            <ToggleButton
              value={v}
              key={`moodScene-${idx}`}
              sx={{ flexBasis: "33.3333%" }}
            >
              <Typography variant="h6">{t(v)}</Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <Box sx={questionContainerSx}>
        <Typography variant="body1" alignSelf="flex-start" textAlign="start">
          3. {t("What are you most grateful for in the past 24 hours?")}
        </Typography>
        <ToggleButtonGroup
          size="large"
          value={state.gratitudeObj}
          onChange={(_, v) =>
            setState((prev) => ({ ...prev, gratitudeObj: v }))
          }
          exclusive
          sx={{ flexWrap: "wrap", mx: 1 }}
        >
          {CheckInOptions.gratitudeObj.map((v, idx) => (
            <ToggleButton
              value={v}
              key={`gratitudeObj-${idx}`}
              sx={{ flexBasis: "33.3333%" }}
            >
              <Typography variant="h6">{t(v)}</Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <Box sx={questionContainerSx}>
        <Typography variant="body1" alignSelf="flex-start" textAlign="start">
          3. {t("What are you most grateful for in the past 24 hours?")}
        </Typography>
        <ToggleButtonGroup
          size="large"
          value={state.gratitudeObj}
          onChange={(_, v) =>
            setState((prev) => ({ ...prev, gratitudeObj: v }))
          }
          exclusive
          sx={{ flexWrap: "wrap", mx: 1 }}
        >
          {CheckInOptions.gratitudeCnt.map((v, idx) => (
            <ToggleButton value={v} key={`gratituteCnt-${idx}`}>
              <Typography variant="h6">{v}</Typography>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <Button variant="outlined" disabled={!isDone} onClick={handleSubmit}>
        OK
      </Button>
    </Box>
  );
};

export default CheckIn;

const DEFAULT_STATE: EmotionCheckIn = {
  ts: 0,
};

const rootSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flex: 1,
  gap: 4,
  p: 2,
};

const questionContainerSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 1,
  mx: 2,
};
