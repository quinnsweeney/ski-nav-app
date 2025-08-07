import { useEffect, useState } from "react";
import type { DeviceOrientationEventWithCompass } from "../types";

const useDeviceOrientation = () => {
    const [heading, setHeading] = useState<number | null>(null);
    const [permissionGranted, setPermissionGranted] = useState(false);

    const handleOrientation = (event: DeviceOrientationEventWithCompass) => {
        if (event.webkitCompassHeading) { // For iOS Safari
            setHeading(event.webkitCompassHeading);
        } else if (event.alpha !== null) { // For other browsers
            setHeading(360 - event.alpha);
        }
    };

    const requestPermission = () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            (DeviceOrientationEvent as any).requestPermission()
                .then((permissionState: string) => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                        setPermissionGranted(true);
                    }
                });
        } else {
            // It's not iOS 13+, or permission is not required
            window.addEventListener('deviceorientation', handleOrientation);
            setPermissionGranted(true);
        }
    };

    useEffect(() => {
        // Cleanup listener on unmount
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, []);

    return { heading, requestPermission, permissionGranted };
};

export default useDeviceOrientation;