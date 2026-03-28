import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { GeoDataRendererProps} from '../../types/hikar';
import { GeolocationAnchor } from '@omnidotdev/rdk';

export default function PoiRenderer({ geoState } : GeoDataRendererProps) {
  
    const { camera } = useThree();
 
    useEffect(() => {
        camera.position.setY(geoState.elev);
    }, [geoState.elev]);

    return (
        <>
        { geoState.pois.map(poi =>  {
            console.log(`map: POI lon ${poi.position.lon} lat ${poi.position.lat} alt =${poi.altitude}`)
            return (
                <GeolocationAnchor key={`p${poi.id}`} latitude={poi.position.lat} longitude={poi.position.lon} altitude={poi.altitude}>
                    <mesh scale={1}>
                        <boxGeometry args={[10, 10, 10]} />
                        <meshStandardMaterial color="blue" />
                    </mesh>
                </GeolocationAnchor>
         )} ) }
        </>
    )

}