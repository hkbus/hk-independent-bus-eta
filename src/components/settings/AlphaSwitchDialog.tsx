import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { STABLE_SITE } from "../../site";

interface Props {
  open: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
}

const AlphaSwitchDialog = ({ open, handleClose, handleConfirm }: Props) => {
  const { t } = useTranslation();
  const stable = new URL(STABLE_SITE).host;
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{t("切換至實驗版本？")}</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <p>
            {t("實驗版本是此應用程式的早期版本，用於在正式推出前試用新改動。")}
          </p>
          <ul>
            <li>
              {t(
                "實驗版本可能包含重大改動：路線可能無法載入、到站時間可能不準確，或部分功能可能失效。請勿在趕時間的行程中依賴它。"
              )}
            </li>
            <li>
              {t(
                "切換後，開啟 {{stable}} 會帶你前往實驗版本，直至你在其設定中關閉此選項。",
                { stable }
              )}
            </li>
            <li>
              {t(
                "實驗版本一開始是空白的，並有獨立的設定和收藏。你在其中的更改只會保留在實驗版本。"
              )}
            </li>
            <li>
              {t(
                "切換不會刪除或改動你在 {{stable}} 上已儲存的路線、收藏及設定；切換回來時，它們會保持原樣。",
                { stable }
              )}
            </li>
          </ul>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("取消切換")}</Button>
        <Button onClick={handleConfirm} color="warning">
          {t("切換至實驗版本")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlphaSwitchDialog;
