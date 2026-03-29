import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { GeolocationAnchor, GeoLine } from '@omnidotdev/rdk';
import { useStore } from '../../hooks/store';


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
    

//export default function PoiRenderer({ geoState } : GeoDataRendererProps) {
export default function PoiRenderer() {
  
    const { camera } = useThree();
    const { pois, ways, elev } = useStore();
 
    useEffect(() => {
        console.log(`Setting elev to ${elev}`)
        camera.position.setY(elev + 50); // aerial view for now for demo purposes
    }, [elev]);

    return (
        <>
        { pois.map(poi =>  {
            return (
                <GeolocationAnchor key={`p${poi.id}`} latitude={poi.position.lat} longitude={poi.position.lon} altitude={poi.altitude}>
                    <mesh scale={1}>
                        <boxGeometry args={[10, 10, 10]} />
                        <meshStandardMaterial color="blue" />
                    </mesh>
                </GeolocationAnchor>
            )
         })}
         { ways.map(way => {
            return(
                <GeoLine key={`w${way.id}`} coordinates={way.coordinates} color={wayColours.get(way.type) || 'lightgray'} lineWidth={5} />
            )
         })}
        </>
    )

}