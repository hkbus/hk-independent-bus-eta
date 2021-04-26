import React, { useContext } from 'react'
import { 
  Box,
  Button,
  Grid
} from '@material-ui/core'
import {
  makeStyles
} from '@material-ui/styles'
import BackspaceOutlinedIcon from '@material-ui/icons/BackspaceOutlined';

import AppContext from '../AppContext'
import { useTranslation } from 'react-i18next';

const KeyButton = ({k, handleClick, disabled = false}) => {
  const classes = useStyles()
  const { t } = useTranslation()
  return (
    <Button 
      size="large"
      variant="contained" 
      className={classes.button}
      onClick={() => handleClick(k)}
      disabled={disabled}
    >
      {k === 'b' ? <BackspaceOutlinedIcon/> : 
        k === '-' ? t('取消') : k}
    </Button>
  )
}

const RouteNumPad = () => {
  const { searchRoute, updateSearchRouteByButton, possibleChar } = useContext( AppContext )

  return (
    <Grid container spacing={0}>
    {
      '789456123-0b'.split('').map( k => (
        <Grid item xs={4} key={'input-'+k}>
          <KeyButton
            k={k}
            handleClick={updateSearchRouteByButton}
            disabled={
              (k === 'b' && searchRoute === '') 
              || ( !'b-'.includes(k) && !possibleChar.includes(k))
              || ( k === '-' && searchRoute === '' )
            }
          />
        </Grid>
      ))
    }
    </Grid>
  )
}

const RouteAlphabetPad = () => {
  const { updateSearchRouteByButton, possibleChar } = useContext( AppContext )
  
  return (
    <Grid container spacing={1}>
      {
        possibleChar.filter(k => isNaN(k)).map(k => (
          <Grid item xs={12} key={'input-'+k}>
            <KeyButton
              k={k}
              handleClick={updateSearchRouteByButton}
            />
          </Grid>
        )) 
      }
    </Grid>
  )
}

const RouteInputPad = () => {

  const classes = useStyles()
  const padding = 0

  return (
    <Box className={classes.boxContainer} padding={padding}>
      <Box className={classes.numPadContainer} padding={padding}>
        <RouteNumPad />
      </Box>
      <Box className={classes.alphabetPadContainer} padding={padding}>
        <RouteAlphabetPad />
      </Box>
    </Box>
  )
}

export default RouteInputPad

const useStyles = makeStyles(theme => ({
  boxContainer: {
    display: 'flex',
    flexDirection: 'row',
    height: '180px',
    justifyContent: 'space-around'
  },
  numPadContainer: {
    width: '60%',
  },
  alphabetPadContainer: {
    width: '20%',
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'scroll'
  },
  button: {
    width: '100%',
    height: 42,
    borderRadius: 'unset'
  }
}))