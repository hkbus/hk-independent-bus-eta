import { useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  Divider,
  IconButton,
  SxProps,
  Theme,
} from "@mui/material";
import {
  Close as CloseIcon,
  ArrowBackIosNew as BackIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import OptionsList from "./OptionsList";
import UserContentManagement from "./UserContentManagement";
import AppearanceSettings from "./AppearanceSettings";

interface PersonalizeModalProps {
  open: boolean;
  onClose: () => void;
}

type TabType = "options" | "manage" | "appearance";

const PersonalizeDialog = ({ open, onClose }: PersonalizeModalProps) => {
  const [tab, setTab] = useState<TabType>("options");
  const { t } = useTranslation();

  const handleClose = () => {
    onClose();
    setTab("options");
  };

  return (
    <Dialog
      PaperProps={{
        sx: DialogSx,
      }}
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={DialogTitleSx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {tab !== "options" && (
            <IconButton onClick={() => setTab("options")}>
              <BackIcon />
            </IconButton>
          )}
          {t(tab === "options" ? "個性化設定" : "")}
          {t(tab === "manage" ? "管理收藏" : "")}
          {t(tab === "appearance" ? "外觀" : "")}
        </Box>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      {tab === "options" && (
        <OptionsList
          goToManage={() => setTab("manage")}
          goToAppearance={() => setTab("appearance")}
        />
      )}
      {tab === "manage" && <UserContentManagement />}
      {tab === "appearance" && <AppearanceSettings />}
    </Dialog>
  );
};

export default PersonalizeDialog;

const DialogSx: SxProps<Theme> = {
  height: "100%",
};

const DialogTitleSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
};
