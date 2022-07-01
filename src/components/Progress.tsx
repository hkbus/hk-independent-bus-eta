import { styled } from "@mui/material/styles";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";

const ProgressWrapper = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  padding: `0 ${theme.spacing(2)}`,
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  width: "100%",
  borderRadius: 5,
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.background.default,
  },
}));

const Progress = () => {
  return (
    <ProgressWrapper>
      <ProgressBar />
    </ProgressWrapper>
  );
};
export default Progress;
