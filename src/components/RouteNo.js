import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const RouteNo = ({ routeNo }) => {
    const classes = useStyles()
    return (
        <>{routeNo.split('').map(char => (
            <span className={classes[char >= '0' && char <= '9' ? 'routeDigit' : 'routeAlpha']}>{char}</span>
        ))}</>
    )
}

export default RouteNo

const useStyles = makeStyles(theme => ({
    routeDigit: {
        fontSize: '1.2rem',
        fontFamily: '"Oswald", sans-serif'
    },
    routeAlpha: {
        fontSize: '0.85rem',
        fontFamily: '"Oswald", sans-serif'
    }
}))