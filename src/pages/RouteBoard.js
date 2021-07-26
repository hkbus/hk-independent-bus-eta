import React, { useContext, useEffect } from 'react'
import AppContext from '../AppContext'
import { makeStyles } from '@material-ui/core/styles'
import { FixedSizeList } from 'react-window'
import AutoSizer from "react-virtualized-auto-sizer"
import memorize from 'memoize-one'
import RouteInputPad from '../components/route-list/RouteInputPad'
import RouteRow from '../components/route-list/RouteRow'
import { useTranslation } from 'react-i18next'
import { setSeoHeader } from '../utils'

const createItemData = memorize((routeList) => ({routeList}))

const RouteList = () => {
  const { AppTitle, db: {routeList}, searchRoute } = useContext ( AppContext )
  const targetRouteList = Object.entries(routeList).filter(
    ([routeNo, {stops, co}]) => routeNo.startsWith(searchRoute.toUpperCase()) && 
      (stops[co[0]] == null || stops[co[0]].length > 0)
  )
  const { t, i18n } = useTranslation()
  useStyles()

  useEffect(() => {
    setSeoHeader ({
      title: t('搜尋') + ' - ' + t(AppTitle),
      description: t('route-board-page-description'),
      lang: i18n.language
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language])

  const itemData = createItemData(targetRouteList)

  return (
    <div className={"routeBoard-list"}>
      <AutoSizer>
        {({height, width}) => (
          <FixedSizeList
            height={height * 0.98}
            itemCount={targetRouteList.length}
            itemSize={56}
            width={width}
            itemData={itemData}
            className={"routeBoard-root"}
          >
            {RouteRow}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  )
}

const RouteBoard = () => {
  return (
    <>
      <RouteList />
      <RouteInputPad />
    </>
  )
}

export default RouteBoard

const useStyles = makeStyles(theme => ({
  "@global": {
    ".routeBoard-root": {
      background: theme.palette.type === 'dark' ? theme.palette.background.default : 'white', 
    },
    ".routeBoard-list": {
      flex: '1 1 auto'
    }
  }
}))