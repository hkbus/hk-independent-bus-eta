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
  Snackbar
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import BuildIcon from '@material-ui/icons/Build'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import LocationOffIcon from '@material-ui/icons/LocationOff'
import { useTranslation } from 'react-i18next'
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn'
import DataUsageIcon from '@material-ui/icons/DataUsage'
import DeleteIcon from '@material-ui/icons/Delete'
import GitHubIcon from '@material-ui/icons/GitHub'
import ShareIcon from '@material-ui/icons/Share'
import moment from 'moment'

const Settings = () => {
  const { 
    schemaVersion, updateTime, geoPermission, 
    setGeoPermission, renewDb, resetUsageRecord
  } = useContext ( AppContext )
  const [ updating, setUpdating ] = useState(false)
  const [ isCopied, setIsCopied ] = useState(false)

  const { t, i18n } = useTranslation()
  const classes = useStyles()

  useEffect(() => {
    setUpdating(false)
  }, [updateTime])

  return (
    <Paper className={classes.root}>
      <List>
        <ListItem
          button
          onClick={() => {setUpdating(true);renewDb()}}
        >
          <ListItemAvatar>
            <Avatar><BuildIcon /></Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={t("架構版本")+": "+schemaVersion} 
            secondary={t('更新時間：') + " " + moment(updateTime).format('YYYY-MM-DD HH:mm:ss')} 
          />
        </ListItem>
        <ListItem
          button
          onClick={() => {
            if ( geoPermission === 'granted' ) {
              setGeoPermission('closed')
            } else {
              navigator.geolocation.getCurrentPosition(position => {
                setGeoPermission('granted')
              })
            }
          }}
        >
          <ListItemAvatar>
            <Avatar>{geoPermission === 'granted' ? <LocationOnIcon /> : <LocationOffIcon />}</Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={t("地理位置定位功能")} 
            secondary={t(geoPermission === 'granted' ? '開啟' : '關閉') } 
          />
        </ListItem>
        <ListItem
          button
          onClick={() => {resetUsageRecord()}}
        >
          <ListItemAvatar>
            <Avatar><DeleteIcon /></Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={t("一鍵清空用戶紀錄")} 
            secondary={t("包括鎖定和常用報時")}
          />
        </ListItem>
        <Divider />
        <ListItem
          button
          component='a'
          href={`https://github.com/chunlaw/hk-independent-bus-eta`}
          target="_blank"
        >
          <ListItemAvatar>
            <Avatar><GitHubIcon /></Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={"Source Code"} 
            secondary={"GPL-3.0 License"} 
          />
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <Avatar><DataUsageIcon /></Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={t("交通資料來源")} 
            secondary={t('資料一線通') + "  https://data.gov.hk" } 
          />
        </ListItem>
        <Divider />
        <ListItem
          button
          component='a'
          href={`https://donate.612fund.hk/${i18n.language}/`}
          target="_blank"
        >
          <ListItemAvatar>
            <Avatar><MonetizationOnIcon /></Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={t("捐款支持")} 
            secondary={t('請捐款到 612 人道支援基金') } 
          />
        </ListItem>
        <ListItem
          button
          onClick={() => {
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
            primary={t("複製應用程式鏈結")} 
            secondary={t('經不同媒介分享給親友') } 
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
        open={isCopied}
        autoHideDuration={3000}
        onClose={(event, reason) => {
          if (reason === 'clickaway') {
            return;
          }
          setIsCopied(false);
        }}
        message={t('鏈結已複製到剪貼簿')}
      />
    </Paper>
  )
}

export default Settings

const useStyles = makeStyles ( theme => ({
  root: {
    background: 'white',
    height: 'calc(100vh - 120px)'
  }
}))