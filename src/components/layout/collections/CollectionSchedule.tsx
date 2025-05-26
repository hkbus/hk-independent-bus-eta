import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  SxProps,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileTimePicker as TimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  AddCircle as AddIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";

// Context
import CollectionContext from "../../../CollectionContext";

const CollectionSchedule = () => {
  const { t } = useTranslation();
  const {
    collections,
    collectionIdx,
    updateCollectionSchedule,
    addCollectionSchedule,
    removeCollectionSchedule,
    savedEtas,
  } = useContext(CollectionContext);

  const [newCollection, setNewCollection] = useState([
    {
      name: t("常用"),
      list: savedEtas,
      schedules: [],
    },
    ...collections,
  ]);

  const newCollectionIdx = useMemo(
    () => (collectionIdx !== null ? collectionIdx + 1 : null),
    [collectionIdx]
  );

  useEffect(() => {
    setNewCollection([
      {
        name: t("常用"),
        list: savedEtas,
        schedules: [],
      },
      ...collections,
    ]);
  }, [collections, savedEtas, t]);

  if (newCollectionIdx === null) {
    return null;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={rootSx}>
        {newCollection[newCollectionIdx].schedules.length > 0 ? (
          <>
            {newCollection[newCollectionIdx].schedules.map(
              (daySchedule, idx) => (
                <Box key={`schedule-${idx}`} sx={daySx}>
                  <IconButton
                    size="small"
                    onClick={() => removeCollectionSchedule(idx)}
                  >
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                  <TextField
                    variant="standard"
                    value={daySchedule.day}
                    select
                    size="small"
                    onChange={({ target: { value } }) =>
                      updateCollectionSchedule(idx, "day", parseInt(value))
                    }
                  >
                    {/* Start with mon-sun, then holiday */}
                    {[...Array(7).keys(), -1]
                      .map((i) => (i === -1 ? -1 : (i + 1) % 7))
                      .map((_weekday) => (
                        <MenuItem
                          key={`option-${idx}-${_weekday}`}
                          value={_weekday}
                        >
                          {_weekday === -1
                            ? t("public-holiday")
                            : t(`weekday-${_weekday}`)}
                        </MenuItem>
                      ))}
                  </TextField>
                  <TimePicker
                    sx={{ flex: 0.45 }}
                    slotProps={{
                      textField: {
                        size: "small",
                        variant: "standard",
                      },
                    }}
                    value={dayjs(
                      `1991-12-02${daySchedule.start.hour}:${daySchedule.start.minute}`
                    )}
                    onChange={(v: any) =>
                      updateCollectionSchedule(idx, "start", {
                        hour: v.$H,
                        minute: v.$m,
                      })
                    }
                  />
                  -
                  <TimePicker
                    sx={{ flex: 0.45 }}
                    slotProps={{
                      textField: {
                        size: "small",
                        variant: "standard",
                      },
                    }}
                    value={dayjs(
                      `1991-12-02T${daySchedule.end.hour}:${daySchedule.end.minute}`
                    )}
                    onChange={(v: any) =>
                      updateCollectionSchedule(idx, "end", {
                        hour: v.$H,
                        minute: v.$m,
                      })
                    }
                  />
                </Box>
              )
            )}
          </>
        ) : (
          <Typography sx={{ marginTop: 5 }} fontWeight={700}>
            {t("missing_schedule")}
          </Typography>
        )}

        <Button onClick={() => addCollectionSchedule()}>
          <AddIcon />
        </Button>
      </Box>
    </LocalizationProvider>
  );
};

export default CollectionSchedule;

const rootSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
  fontSize: "0.8em !important",
  textAlign: "center",
};

const daySx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 0.5,
};
