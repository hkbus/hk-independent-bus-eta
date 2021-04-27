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
import DeleteIcon from '@material-ui/icons/Delete';
import moment from 'moment'

const Settings = () => {
  const { 
    schemaVersion, updateTime, geoPermission, 
    updateGeoPermission, renewDb, resetUsageRecord
  } = useContext ( AppContext )
  const [ updating, setUpdating ] = useState(false)

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
              updateGeoPermission('closed')
            } else {
              navigator.geolocation.getCurrentPosition(position => {
                updateGeoPermission('granted')
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
        <Divider />
        <ListItem>
          <ListItemAvatar>
            <Avatar><DataUsageIcon /></Avatar>
          </ListItemAvatar>
          <ListItemText 
            primary={t("資料來源")} 
            secondary={t('資料一線通') + "  https://data.gov.hk" } 
          />
        </ListItem>
      </List>
      <Snackbar
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
        open={updating}
        message={t('資料更新中...')}
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