import React, { useContext, useEffect, useState } from 'react'
import AppContext from '../AppContext'
import {
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Snackbar,
  Typography
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import GetAppIcon from '@material-ui/icons/GetApp'
import BuildIcon from '@material-ui/icons/Build'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import LocationOffIcon from '@material-ui/icons/LocationOff'
import { useTranslation } from 'react-i18next'
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn'
import DataUsageIcon from '@material-ui/icons/DataUsage'
import Battery20Icon from '@material-ui/icons/Battery20'
import BatteryStdIcon from '@material-ui/icons/BatteryStd'
import DeleteIcon from '@material-ui/icons/Delete'
import GitHubIcon from '@material-ui/icons/GitHub'
import ShareIcon from '@material-ui/icons/Share'
import TelegramIcon from '@material-ui/icons/Telegram'
import { vibrate, setSeoHeader } from '../utils'
import Brightness7Icon from '@material-ui/icons/Brightness7';
import NightsStayIcon from '@material-ui/icons/NightsStay';
import InstallDialog from '../components/settings/InstallDialog'

const Settings = () => {
  const { 
    AppTitle,
    db: {schemaVersion, versionMd5, updateTime}, renewDb,
    geoPermission, updateGeoPermission,
    resetUsageRecord,
    colorMode, toggleColorMode,
    energyMode, toggleEnergyMode
  } = useContext ( AppContext )
  const [ updating, setUpdating ] = useState(false)
  const [ showGeoPermissionDenied, setShowGeoPermissionDenied ] = useState(false)
  const [ isCopied, setIsCopied ] = useState(false)
  const [ isOpenInstallDialog, setIsOpenInstallDialog] = useState(false)

  const { t, i18n } = useTranslation()
  useStyles()

  useEffect(() => {
    setSeoHeader({
      title: t('設定') + ' - ' +t(AppTitle),
      description: t('setting-page-description'),
      lang: i18n.language
    })
    setUpdating(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateTime, i18n.language])

  return (
    <Paper className={"settings-root"} square elevation={0}>
      <Typography component="h1" variant="srOnly">{`${t('設定')} - ${t(AppTitle)}`}</Typography>
      <List>
        {window.matchMedia('(display-mode: standalone)').matches ? null : <ListItem
          button
          onClick={() => {vibrate(1);setTimeout(() => setIsOpenInstallDialog(true), 0)}}
        >
          <ListItemAvatar>
            <Avatar><GetAppIcon /></Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={<ListPrimaryText>{t("安裝")}</ListPrimaryText>} 
            secondary={t('安裝巴士預報 App 到裝置')} 
            secondaryTypographyProps={{component: 'h3', variant: 'body2'}}
          />
        </ListItem>}
        <ListItem
          button
          onClick={() => {vibrate(1);setUpdating(true);renewDb()}}
        >
          <ListItemAvatar>
            <Avatar><BuildIcon /></Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={<ListPrimaryText>{t("架構版本")+": "+schemaVersion+" - "+versionMd5.substr(0,6)}</ListPrimaryText>} 
            secondary={t('更新時間') + ": " + (new Date(updateTime)).toLocaleString().slice(0,20).replace(',',' ')} 
            secondaryTypographyProps={{component: 'h3', variant: 'body2'}}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => {
            vibrate(1)
            if ( geoPermission === 'granted' ) {
              updateGeoPermission('closed')
            } else {
              updateGeoPermission('opening', () => {
                setShowGeoPermissionDenied(true)
              })
            }
          }}
        >
          <ListItemAvatar>
            <Avatar>{geoPermission === 'granted' ? <LocationOnIcon /> : <LocationOffIcon />}</Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={<ListPrimaryText>{t("地理位置定位功能")}</ListPrimaryText>} 
            secondary={t(geoPermission === 'granted' ? '開啟' : ( geoPermission === 'opening' ? '開啟中...' : '關閉' )) } 
            secondaryTypographyProps={{component: 'h3', variant: 'body2'}}
          />
        </ListItem>
        <ListItem
          button
          onClick={() => {
            vibrate(1)
            toggleColorMode()
          }}
        >
          <ListItemAvatar>
            <Avatar>{colorMode === 'dark' ? <NightsStayIcon /> : <Brightness7Icon />}</Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={t("黑夜模式")} 
            secondary={t(colorMode === 'dark' ? '開啟' : '關閉')} 
          />
        </ListItem>
        <ListItem
          button
          onClick={() => {
            vibrate(1)
            toggleEnergyMode()
          }}
        >
          <ListItemAvatar>
            <Avatar>{energyMode ? <Battery20Icon /> : <BatteryStdIcon />}</Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={t("省電模式")} 
            secondary={t(energyMode ? '開啟' : '關閉') + ' - ' + t('地圖功能')} 
          />
        </ListItem>
        <ListItem
          button
          onClick={() => {vibrate(1);resetUsageRecord()}}
        >
          <ListItemAvatar>
            <Avatar><DeleteIcon /></Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={<ListPrimaryText>{t("一鍵清空用戶記錄")}</ListPrimaryText>} 
            secondary={t("包括鎖定和常用報時")}
            secondaryTypographyProps={{component: 'h3', variant: 'body2'}}
          />
        </ListItem>
        <Divider />
        <ListItem
          button
          onClick={() => {
            vibrate(1)
            if ( navigator.clipboard ) {
              navigator.clipboard.writeText(`${window.location.hostname}${process.env.PUBLIC_URL}`)
              .then(() => {
                setIsCopied(true)
              })
            }
          }}
        >
          <ListItemAvatar>
            <Avatar><ShareIcon /></Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={<ListPrimaryText>{t("複製應用程式鏈結")}</ListPrimaryText>} 
            secondary={t('經不同媒介分享給親友') } 
            secondaryTypographyProps={{component: 'h3', variant: 'body2'}}
          />
        </ListItem>
        <ListItem
          button
          component='a'
          href={`https://t.me/hkbusapp`}
          target="_blank"
          onClick={() => {vibrate(1)}}
        >
          <ListItemAvatar>
            <Avatar><TelegramIcon /></Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={<ListPrimaryText>{t("Telegram 交流區")}</ListPrimaryText>} 
            secondary={t('歡迎意見及技術交流') } 
            secondaryTypographyProps={{component: 'h3', variant: 'body2'}}
          />
        </ListItem>
        <ListItem
          button
          component='a'
          href={`https://donate.612fund.hk/${i18n.language}/`}
          target="_blank"
          onClick={() => {vibrate(1)}}
        >
          <ListItemAvatar>
            <Avatar><MonetizationOnIcon /></Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={<ListPrimaryText>{t("捐款支持")}</ListPrimaryText>} 
            secondary={t('請捐款到 612 人道支援基金') } 
            secondaryTypographyProps={{component: 'h3', variant: 'body2'}}
          />
        </ListItem>
        <Divider />
        <ListItem
          button
          component={'a'}
          href={`https://github.com/hkbus/hk-independent-bus-eta`}
          target="_blank"
          onClick={() => {vibrate(1)}}
        >
          <ListItemAvatar>
            <Avatar><GitHubIcon /></Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={<ListPrimaryText>Source code</ListPrimaryText>}
            secondary={"GPL-3.0 License"}
            secondaryTypographyProps={{component: 'h3', variant: 'body2'}}
          />
        </ListItem>
        <ListItem
          button
          component={'a'}
          href={`https://www.flaticon.com/free-icon/double-decker_1032967`}
          target="_blank"
          onClick={() => {vibrate(1)}}
        >
          <ListItemAvatar>
            <Avatar className={"settings-icon"} src="/logo128.png" alt="App Logo"></Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={<ListPrimaryText>{t("圖標來源")}</ListPrimaryText>} 
            secondary={"Freepik from Flaticon"}
            secondaryTypographyProps={{component: 'h3', variant: 'body2'}}
          />
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <Avatar><DataUsageIcon /></Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={<ListPrimaryText>{t("交通資料來源")}</ListPrimaryText>} 
            secondary={t('資料一線通') + "  https://data.gov.hk" } 
            secondaryTypographyProps={{component: 'h3', variant: 'body2'}}
          />
        </ListItem>
      </List>
      <Snackbar
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
        open={updating}
        message={t('資料更新中')+'...'}
      />
      <Snackbar
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
        open={showGeoPermissionDenied}
        autoHideDuration={1500}
        onClose={(e, reason) => {
          setShowGeoPermissionDenied(false)
        }}
        message={t('無法獲得地理位置定位功能權限')}
      />
      <Snackbar
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
        open={isCopied}
        autoHideDuration={1500}
        onClose={(event, reason) => {
          setIsCopied(false);
        }}
        message={t('鏈結已複製到剪貼簿')}
      />
      <InstallDialog
        open={isOpenInstallDialog}
        handleClose={() => setIsOpenInstallDialog(false)}
      />
    </Paper>
  )
}

const ListPrimaryText = ({children}) => {
  return (
    <Typography component="h2" variant="body1">{children}</Typography>
  )
}

export default Settings

const useStyles = makeStyles ( theme => ({
  "@global": {
    ".settings-root": {
      background: theme.palette.type === 'dark' ? theme.palette.background.default : 'white',
      height: 'calc(100vh - 120px)',
      overflowY: "scroll",
      '& .MuiAvatar-colorDefault': {
        color: theme.palette.type === 'dark' ? theme.palette.background.default : 'white'
      }
    },
    ".settings-icon": {
      filter: theme.palette.type === 'dark' ? 'grayscale(100%) brightness(0.5)' : 'none'
    }
  }
}))
