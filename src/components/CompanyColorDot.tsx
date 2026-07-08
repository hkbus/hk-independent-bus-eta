import { Box } from "@mui/material";
import { Company } from "hk-bus-eta";
import { getLineColor } from "../utils";

interface CompanyColorDotProps {
  companies: Company[];
  route: string;
}

// A small swatch in the operator's line colour (KMB red, CTB yellow, GMB green,
// …) so companies are distinguishable at a glance. Reuses getLineColor — the
// same mapping the route map already uses — and carries a faint outline so pale
// colours (e.g. CTB yellow) stay visible on the white list background.
const CompanyColorDot = ({ companies, route }: CompanyColorDotProps) => (
  <Box
    component="span"
    aria-hidden="true"
    sx={{
      display: "inline-block",
      verticalAlign: "middle",
      flexShrink: 0,
      width: 8,
      height: 8,
      marginRight: 0.5,
      borderRadius: "50%",
      backgroundColor: getLineColor(companies, route),
      border: "1px solid rgba(0, 0, 0, 0.2)",
    }}
  />
);

export default CompanyColorDot;
