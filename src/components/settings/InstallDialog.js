import React from 'react'
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useTranslation } from 'react-i18next'

const InstallDialog = ({open, handleClose}) => {
  
  const { t } = useTranslation()
  useStyles()
  
  return (
    <Dialog open={open} onClose={handleClose} className={"installDialog-dialog"}>
      <DialogTitle className={"installDialog-title"}>{t('安裝步驟')}</DialogTitle>
      <DialogContent>
        <Box className={"installDialog-section"}>
          <Typography variant="h5">iOS:</Typography>
          <br/>
          <Typography variant="body1">1. {t("用 Safari 開")}</Typography>
          <Typography variant="body1">2. {t("分享")}</Typography>
          <Typography variant="body1">3. {t("加至主畫面")}</Typography>
        </Box>
        <hr/>
        <Box className={"installDialog-section"}>
          <Typography variant="h5">Android:</Typography>
          <br/>
          <Typography variant="body1">1. {t("用 Chrome 開")}</Typography>
          <Typography variant="body1">2. {t("右上選項")}</Typography>
          <Typography variant="body1">3. {t("新增至主畫面 / 安裝應用程式")}</Typography>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

const useStyles = makeStyles(theme => ({
  '@global': {
    '.installDialog-dialog': {
      '& .MuiPaper-root': {
        width: '100%',
        marginTop: '90px',
        height: '50vh'
      }
    },
    '.installDialog-title': {
      backgroundColor: theme.palette.type === 'dark' ? theme.palette.background.default : theme.palette.primary.main,
      color: theme.palette.type === 'dark' ? theme.palette.primary.main: theme.palette.text.primary,
    },
    '.installDialog-section': {
      height: '40%',
      paddingTop: '10px'
    }
  }
}))

export default InstallDialog