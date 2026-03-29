import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { GeoDataRendererProps} from '../../types/hikar';
import { GeolocationAnchor, GeoLine } from '@omnidotdev/rdk';


const wayColours = new Map<string,string>([
    ["footway" , "green"],
    ["path" , "green"],
    ["bridleway", "brown"],
    ["byway" , "red"],
    ["cycleway", "blue"],
    ["public_footpath", "green"],
    ["public_bridleway" , "brown"],
    ["byway_open_to_all_traffic","red"],
    ["restricted_byway","magenta"]
]);
    

export default function PoiRenderer({ geoState } : GeoDataRendererProps) {
  
    const { camera } = useThree();
 
    useEffect(() => {
        console.log(`Setting elev to ${geoState.elev}`)
        camera.position.setY(geoState.elev + 50); // aerial view for now for demo purposes
    }, [geoState.elev]);

    return (
        <>
        { geoState.pois.map(poi =>  {
            return (
                <GeolocationAnchor key={`p${poi.id}`} latitude={poi.position.lat} longitude={poi.position.lon} altitude={poi.altitude}>
                    <mesh scale={1}>
                        <boxGeometry args={[10, 10, 10]} />
                        <meshStandardMaterial color="blue" />
                    </mesh>
                </GeolocationAnchor>
            )
         })}
         { geoState.ways.map(way => {
            return(
                <GeoLine key={`w${way.id}`} coordinates={way.coordinates} color={wayColours.get(way.type) || 'lightgray'} lineWidth={5} />
            )
         })}
        </>
    )

}