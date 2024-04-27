import { Box, SxProps, Theme, Typography } from "@mui/material";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Plotly from "plotly.js-basic-dist";
import createPlotlyComponent from "react-plotly.js/factory";
import EmotionContext, { CheckInOptions } from "../../context/EmotionContext";

const Plot = createPlotlyComponent(Plotly);

const EmotionChart = () => {
  const { t } = useTranslation();
  const { checkIns } = useContext(EmotionContext);

  const countData = useMemo(() => {
    const tmp = checkIns.filter(
      ({ ts }) => ts >= Date.now() - 28 * 24 * 60 * 60 * 1000
    );
    return {
      happiness: CheckInOptions.happiness.map((v) =>
        tmp.reduce((acc, { happiness }) => acc + (happiness === v ? 1 : 0), 0)
      ),
      moodScene: CheckInOptions.moodScene.map((v) =>
        tmp.reduce((acc, { moodScene }) => acc + (moodScene === v ? 1 : 0), 0)
      ),
      gratitudeObj: CheckInOptions.gratitudeObj.map((v) =>
        tmp.reduce(
          (acc, { gratitudeObj }) => acc + (gratitudeObj === v ? 1 : 0),
          0
        )
      ),
      gratitudeCnt: checkIns
        .reduce(
          (acc, { gratitudeCnt: v }) => {
            if (!v) return acc;
            if (v === "5+") return [acc[0] + 5, "+"] as [number, string];
            return [acc[0] + parseInt(v), acc[1]] as [number, string];
          },
          [0, ""] as [number, string]
        )
        .join(""),
    };
  }, [checkIns]);

  return (
    <Box sx={rootSx}>
      <Typography variant="body1">{t("In the past 4 weeks, ...")}</Typography>
      <Plot
        data={[
          {
            values: countData.happiness,
            labels: CheckInOptions.happiness,
            type: "pie",
            hoverinfo: "label+percent",
            hole: 0.4,
            showlegend: false,
            textposition: "inside",
            domain: { column: 1 },
          },
        ]}
        layout={{
          width: 380,
          height: 340,
          title: t("How happy were you?"),
          annotations: [
            {
              text: CheckInOptions.happiness[
                countData.happiness.indexOf(Math.max(...countData.happiness))
              ],
              showarrow: false,
              font: {
                size: 40,
              },
              x: 0.5,
              y: 0.5,
            },
          ],
        }}
        config={{ displayModeBar: false }}
      />
      <Plot
        data={[
          {
            values: countData.moodScene,
            labels: CheckInOptions.moodScene.map((v) => t(v)),
            type: "pie",
            hoverinfo: "label+percent",
            hole: 0.4,
            showlegend: false,
            textposition: "inside",
            domain: { column: 1 },
          },
        ]}
        layout={{
          width: 380,
          height: 340,
          title: t("What environment made you feel most profound?"),
          annotations: [
            {
              text: t(
                CheckInOptions.moodScene[
                  countData.moodScene.indexOf(Math.max(...countData.moodScene))
                ]
              ),
              showarrow: false,
              font: {
                size: 20,
              },
              x: 0.5,
              y: 0.5,
            },
          ],
        }}
        config={{ displayModeBar: false }}
      />
      <Plot
        data={[
          {
            values: countData.gratitudeObj,
            labels: CheckInOptions.gratitudeObj.map((v) => t(v)),
            type: "pie",
            hoverinfo: "label+percent",
            hole: 0.4,
            showlegend: false,
            textposition: "inside",
            domain: { column: 1 },
          },
        ]}
        layout={{
          width: 380,
          height: 340,
          title: t("What are you most grateful for?"),
          annotations: [
            {
              text: t(
                CheckInOptions.gratitudeObj[
                  countData.gratitudeObj.indexOf(
                    Math.max(...countData.gratitudeObj)
                  )
                ]
              ),
              showarrow: false,
              font: {
                size: 20,
              },
              x: 0.5,
              y: 0.5,
            },
          ],
        }}
        config={{ displayModeBar: false }}
      />
      <Typography variant="h6">
        {t("There are also ")}
        {countData.gratitudeCnt}
        {t(" things worth being grateful")}
      </Typography>
    </Box>
  );
};

export default EmotionChart;

const rootSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "start",
  flex: 1,
  gap: 4,
  p: 2,
};
