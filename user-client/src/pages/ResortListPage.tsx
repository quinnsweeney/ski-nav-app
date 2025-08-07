import { useEffect, useState } from "react";
import type { Resort } from "../types";
import api from "../api";
import {
  CircularProgress,
  Box,
  Grid,
  Card,
  CardCover,
  CardContent,
  Typography,
  Button,
} from "@mui/joy";
import { Link } from "react-router-dom";
import slugify from "../utils/slugify";

export default function ResortListPage() {
  const [resorts, setResorts] = useState<Resort[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get('/resorts')
            .then(res => setResorts(res.data))
            .catch(err => console.error("Failed to fetch resorts", err))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ px: { xs: 0, md: 2 } }}>
            <Button component={Link} to="/" variant="outlined" sx={{ mb: 2 }}>
                Back to Home
            </Button>
            <Typography level="h2" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
                Choose a Ski Area
            </Typography>
            <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                {resorts.map(resort => (
                    <Grid xs={12} sm={6} key={resort.id}>
                        <Card 
                            component={Link} 
                            to={`/${slugify(resort.name)}`} 
                            sx={{ 
                                textDecoration: 'none', 
                                '--Card-radius': (theme) => theme.vars.radius.lg,
                                '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s' }
                            }}
                        >
                            <CardCover
                                sx={{
                                    background:
                                        'linear-gradient(to top, rgba(81, 158, 202, 0.8), rgba(46, 130, 199, 0.09) 120px)',
                                }}
                            />
                            <CardContent sx={{ justifyContent: 'flex-end' }}>
                                <Typography level="h3" textColor="#fff">
                                    {resort.name}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
