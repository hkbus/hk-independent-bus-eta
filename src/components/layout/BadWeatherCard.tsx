import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Paper, styled } from '@mui/material';

const bull = (
  <Box
    component="span"
    sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
  >
    •
  </Box>
);

// const Root = styled(Card)(({ theme }) => ({
//     [`&.card`]: {
//       background:
//         theme.palette.mode === "dark"
//           ? theme.palette.background.default
//           : "white",
//       textAlign: "center",
//     },
//   }));

const inBadWeather = () =>{
    fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en').then(response => {
      if(response.ok){
        let blob = response.text();
        blob.then(data => {
          console.log("checking weather");
          const text = JSON.stringify(data);
          const adverseCode = /((\\"code\\":\\")+(TC8\w+|TC9|TC10|WRAINR|WRAINB))/gi;
          const match = text.match(adverseCode);
          if(match){
          }
        })
      }
    })
  }

export default function BasicCard() {
  return (
    <Card variant="outlined" sx={{m:0.2,display:inBadWeather ? "": "none"}}>
      <CardContent>
        <Typography>
        Services may be impacted by bad weather.<br/>Check <a href="https://www.td.gov.hk/en/special_news/spnews.htm">offical announcements</a> for more info.
        </Typography>
      </CardContent>
    </Card>
  );
}