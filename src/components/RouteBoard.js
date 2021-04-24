import React, { useContext } from 'react'
import {
  Card,
  CardActionArea,
  CardContent,
  Container,
  Typography
} from '@material-ui/core'
import {
  makeStyles
} from '@material-ui/styles'
import AppContext from '../AppContext'
import { useTranslation } from 'react-i18next'
import { FixedSizeList as List, areEqual } from 'react-window'
import memorize from 'memoize-one'
import RouteInputPad from './RouteInputPad'
import { Link } from  'react-router-dom'

const RouteRow = React.memo(( {data, index, style} ) => {
  const { i18n } = useTranslation()
  const { routeList } = data
  const route = routeList[index]
  
  return (
    <Link to={'/'+i18n.language+'/route/'+route[0]}>
      <Card variant="outlined" key={route[0]} style={style}>
        <CardActionArea>
          <CardContent>
            <Typography variant="h5">{route[0].replace(/\+.*/, '')}</Typography>
            <Typography variant="subtitle2">{route[1].orig[i18n.language]} ➔ {route[1].dest[i18n.language]}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  )
}, areEqual)

const createItemData = memorize((routeList) => ({routeList}))

const RouteList = () => {
  const { routeList, searchRoute } = useContext(AppContext)
  const targetRouteList = Object.entries(routeList).filter(
    element => element[0].startsWith(searchRoute.toUpperCase())
  ) 

  const itemData = createItemData(targetRouteList)
  return (
    <List
      height={300}
      itemCount={targetRouteList.length}
      itemSize={85}
      width="100%"
      itemData={itemData}
    >
        {RouteRow}
    </List>
  )
}

const RouteBoard = () => {
  const classes = useStyles()

  return (
    <>
      <RouteList />
      <hr/>
      <RouteInputPad />
    </>
  )
}

export default RouteBoard

const useStyles = makeStyles(theme => ({
  container: {
    background: 'white'
  }
}))