import { Container, Typography, Grid, Card, CardActionArea, CardContent } from '@mui/material';
import { SatelliteAlt, Public } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 10, textAlign: 'center' }}>
      <Typography variant="h2" gutterBottom color="primary.main" fontWeight="bold">
        OrbitLens Platform
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 8, maxWidth: '600px', mx: 'auto' }}>
        A unified dashboard bridging space sustainability and Earth's climate monitoring.
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {/* Space Track Card */}
        <Grid item xs={12} sm={6} md={5}>
          <Card elevation={6} sx={{ borderRadius: 3, transition: '0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
            <CardActionArea onClick={() => navigate('/space')} sx={{ p: 5 }}>
              <SatelliteAlt sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <CardContent>
                <Typography variant="h4" gutterBottom>Space Traffic</Typography>
                <Typography variant="body1" color="text.secondary">
                  Visualize live orbital debris, active satellites, and predict high-risk collision zones.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        
        {/* Climate Watch Card */}
        <Grid item xs={12} sm={6} md={5}>
          <Card elevation={6} sx={{ borderRadius: 3, transition: '0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
            <CardActionArea onClick={() => navigate('/climate')} sx={{ p: 5 }}>
              <Public sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <CardContent>
                <Typography variant="h4" gutterBottom>Earth Sentinel</Typography>
                <Typography variant="body1" color="text.secondary">
                  Monitor live natural events and climate anomalies using aggregated NASA telemetry.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}