import React, { useContext, useEffect } from 'react'
import AppContext from '../AppContext'
import { FixedSizeList } from 'react-window'
import memorize from 'memoize-one'
import RouteInputPad from './route-board/RouteInputPad'
import RouteRow from './route-board/RouteRow'
import { useTranslation } from 'react-i18next'

const createItemData = memorize((routeList) => ({routeList}))

const RouteList = () => {
  const { AppTitle, routeList, searchRoute } = useContext ( AppContext )
  const targetRouteList = Object.entries(routeList).filter(
    ([routeNo, {stops, co}]) => routeNo.startsWith(searchRoute.toUpperCase()) && 
      (stops[co[0]] == null || stops[co[0]].length > 0)
  )
  const { t } = useTranslation()

  useEffect(() => {
    document.title = t('搜尋') + ' - ' + t(AppTitle)
    document.querySelector('meta[name="description"]').setAttribute("content", t('巴士 App 路線搜尋介面'))
    document.querySelector('link[rel="canonical"]').setAttribute("href", `https://hkbus.app${window.location.pathname}`)
    document.querySelector('link[rel="alternative"][hreflang="en"]').setAttribute("href", `https://hkbus.app/en/search`)
    document.querySelector('link[rel="alternative"][hreflang="zh-Hant"]').setAttribute("href", 'https://hkbus.app/zh/search')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const itemData = createItemData(targetRouteList)
  return (
    <FixedSizeList
      height={330}
      itemCount={targetRouteList.length}
      itemSize={56}
      width="100%"
      itemData={itemData}
    >
        {RouteRow}
    </FixedSizeList>
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