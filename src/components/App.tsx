import React, { useState, useRef, useEffect } from 'react';
import { XR, GeolocationSession, GeolocationAnchor, useGeolocationBackend } from '@omnidotdev/rdk';
import { Canvas } from '@react-three/fiber';
import * as LT from 'locar-tiler';
import GeoDataRenderer from './GeoDataRenderer';
import { FeatureCollection, GeoState, LineGeometry } from '../../types/hikar';

export default function App() {

    console.log("render");
    
    const START_POS = { lat: 51.05, lon: -0.72 };
    const demApplier = useRef<LT.DemApplier | null>(null);
    const [geoState, setGeoState] = useState<GeoState>({ pois: [], ways: [], elev: 0});
    const { locar } = useGeolocationBackend();
   
     useEffect(() => {
        const demTiler = new LT.DemTiler("/dem/{z}/{x}/{y}.png"), jsonTiler = new LT.JsonTiler("/map/{z}/{x}/{y}.json?layers=poi,ways&outProj=4326");
        demApplier.current = new LT.DemApplier(demTiler, jsonTiler);
    }, []);
    
    return <Canvas gl={{antialias: false, powerPreference: "default"}}>
        <ambientLight intensity={1.0} />
        <directionalLight position={[10, 10, 10]} intensity={2} />
        <XR>
        <GeolocationSession options={{ fakeLat: START_POS.lat, fakeLon: START_POS.lon, onGpsUpdate: (pos, distMoved) => {
            onPosUpdated({lat: pos.coords.latitude, lon: pos.coords.longitude});
        }}}>
        <GeolocationAnchor
            latitude={START_POS.lat + 0.0005} 
            longitude={START_POS.lon}>
        <mesh scale={1}>
        <boxGeometry args={[10, 10, 10]} />
        <meshStandardMaterial color="red" />
        </mesh>
        </GeolocationAnchor>
        <GeoDataRenderer geoState={geoState} />
        </GeolocationSession>
        </XR>
        </Canvas>;

    async function onPosUpdated(pos: LT.LonLat) {
        if(demApplier.current === null) return;
        const lonLat =  new LT.LonLat(pos.lon, pos.lat);
        const newData = await demApplier.current.updateByLonLat(
            lonLat
        );
        const elev = demApplier.current.demTiler.getElevationFromLonLat(lonLat) ?? 0;
          
        const allPois = [], allWays = [];
        for(let tile of newData) {
            for(let poiData of (tile.data as FeatureCollection).features) {
                switch(poiData.geometry.type) {
                    case "Point":
                        allPois.push({
                            position: new LT.LonLat(
                                poiData.geometry.coordinates[0],
                                poiData.geometry.coordinates[1],
                            ),
                            altitude: poiData.geometry.coordinates[2] as number ?? 0,
                            name: poiData.properties.name || "",
                            type: poiData.properties.place || poiData.properties.natural || poiData.properties.amenity,
                            id: poiData.properties.osm_id
                        });
                        break;
                    case "LineString":
                         if(poiData.properties.access !== "private") {
                            const way = {
                                name: poiData.properties.name || "",
                                type: poiData.properties.designation || poiData.properties.highway,
                                id: `${tile.tile.x}:${tile.tile.y}:${poiData.properties.osm_id}`, // ways can duplicate across tiles so include tile x and y in the ID
                                coordinates:  (poiData.geometry as LineGeometry).coordinates.map(
                                    (lonLat: [number, number, number?]) : [number, number, number] => {
                                        return [lonLat[0],  lonLat[1],  lonLat[2] || 0];
                                    })
                            };
                            if(way.coordinates.length >= 2) {
                                console.log(way.coordinates);
                                allWays.push(way);
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
        }   
        setGeoState({pois: allPois, ways: allWays, elev});
    }
}


