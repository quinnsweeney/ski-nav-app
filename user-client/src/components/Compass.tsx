import { Box, Typography } from "@mui/joy";
import NavigationIcon from '@mui/icons-material/Navigation';

interface CompassProps {
    distance: number; // in metres
    bearing: number; // in degrees
    deviceHeading: number | null; // device's current heading, if available
}

export default function Compass({ distance, bearing, deviceHeading }: CompassProps) {
    const formattedDistance = distance < 1000
        ? `${Math.round(distance)} m`
        : `${(distance / 1000).toFixed(1)} km`;

    const rotation = deviceHeading !== null ? bearing - deviceHeading : bearing;


    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2, p: 2, backgroundColor: 'neutral.100', borderRadius: 'md' }}>
            <NavigationIcon sx={{ transform: `rotate(${rotation}deg)`, fontSize: 40, color: 'primary.500', transition: 'transform 0.2s' }} />
            <Typography level="h4">{formattedDistance}</Typography>
            <Typography level="body-sm">to next point</Typography>
        </Box>
    );
}