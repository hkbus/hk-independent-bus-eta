import React, { useContext } from 'react'
import AppContext from '../AppContext'
import { FixedSizeList } from 'react-window'
import memorize from 'memoize-one'
import RouteInputPad from './route-board/RouteInputPad'
import RouteRow from './route-board/RouteRow'

const createItemData = memorize((routeList) => ({routeList}))

const RouteList = () => {
  const { routeList, searchRoute } = useContext ( AppContext )
  const targetRouteList = Object.entries(routeList).filter(
    ([routeNo, {stops, co}]) => routeNo.startsWith(searchRoute.toUpperCase()) && 
      (stops[co[0]] == null || stops[co[0]].length > 0)
  )

  const itemData = createItemData(targetRouteList)
  return (
    <FixedSizeList
      height={330}
      itemCount={targetRouteList.length}
      itemSize={60}
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