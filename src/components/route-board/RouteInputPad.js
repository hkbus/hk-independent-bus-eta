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
import AppContext from '../../AppContext'
import { useTranslation } from 'react-i18next';

const KeyButton = ({k, handleClick, disabled = false, className}) => {
  const classes = useStyles()
  const { t } = useTranslation()
  return (
    <Button 
      size="large"
      variant="contained" 
      className={`${classes.button} ${className}`}
      onClick={() => handleClick(k)}
      disabled={disabled}
    >
      {k === 'b' ? <BackspaceOutlinedIcon/> : 
        k === '-' ? <div className={classes.cancelButton}>{t('取消')}</div> : k}
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
  const classes = useStyles()

  return (
    <Grid container spacing={1}>
      {
        possibleChar.filter(k => isNaN(k)).map(k => (
          <Grid item xs={12} key={'input-'+k}>
            <KeyButton
              k={k}
              handleClick={updateSearchRouteByButton}
              className={classes.alphabetButton}
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
    height: 'calc(100vh - 330px - 112px)',
    paddingTop: 'calc(50vh - 165px - 56px - 88px)',
    paddingBottom: 'calc(50vh - 165px - 56px - 88px)',
    justifyContent: 'space-around'
  },
  numPadContainer: {
    width: '60%',
  },
  alphabetPadContainer: {
    width: '20%',
    height: '176px',
    overflowX: 'hidden',
    overflowY: 'scroll'
  },
  button: {
    width: '100%',
    height: '44px',
    fontSize: '1.2em',
    borderRadius: 'unset'
  },
  cancelButton: {
    fontSize: '0.8em',
  },
  alphabetButton: {
    height: '42px'
  }
}))
