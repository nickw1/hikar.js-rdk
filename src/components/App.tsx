import React, { useRef, useEffect, Suspense } from 'react';
import { XR, GeolocationSession } from '@omnidotdev/rdk';
import { Canvas } from '@react-three/fiber';
import * as LT from 'locar-tiler';
import GeoDataRenderer from './GeoDataRenderer';
import LoadingMsg from './LoadingMsg';
import { FeatureCollection, LineGeometry } from '../../types/hikar';
import { useStore } from '../../hooks/store';

export default function App() {

    const START_POS = { lat: 50.9, lon: -1.4 };
    const demApplier = useRef<LT.DemApplier | null>(null);
    const { addPoi, addWay, setElev } = useStore();
   
     useEffect(() => {
        const demTiler = new LT.DemTiler("/dem/{z}/{x}/{y}.png"), jsonTiler = new LT.JsonTiler("/map/{z}/{x}/{y}.json?layers=poi,ways&outProj=4326");
        demApplier.current = new LT.DemApplier(demTiler, jsonTiler);
    }, []);
    
    return (
        <Suspense fallback={<LoadingMsg />}>
            <Canvas gl={{antialias: false, powerPreference: "default"}}>
                <ambientLight intensity={1.0} />
                <directionalLight position={[10, 10, 10]} intensity={2} />
                <XR>
                    <GeolocationSession options={{ fakeLat: START_POS.lat, fakeLon: START_POS.lon,
                        onGpsUpdate: (pos, distMoved) => {
                            onPosUpdated({lat: pos.coords.latitude, lon: pos.coords.longitude}, distMoved);
                    }}}>
                        <GeoDataRenderer />
                    </GeolocationSession>
                </XR>
            </Canvas>
        </Suspense>
    );

    async function onPosUpdated(pos: LT.LonLat, distMoved: number) {
        console.log(`onPosUpdated(): ${pos.lon} ${pos.lat} distMoved ${distMoved}`);
        if(demApplier.current === null || distMoved == 0) return;
        const lonLat =  new LT.LonLat(pos.lon, pos.lat);
        const newData = await demApplier.current.updateByLonLat(
            lonLat
        );
        const elev = demApplier.current.demTiler.getElevationFromLonLat(lonLat) ?? 0;
        console.log(`elev: ${elev}`);
        setElev(elev);
        for(let tile of newData) {
            for(let poiData of (tile.data as FeatureCollection).features) {
                switch(poiData.geometry.type) {
                    case "Point":
                        addPoi({
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
                                name: poiData.properties.name || null,
                                type: poiData.properties.designation || poiData.properties.highway,
                                id: `${tile.tile.x}:${tile.tile.y}:${poiData.properties.osm_id}`, // ways can duplicate across tiles so include tile x and y in the ID
                                coordinates:  (poiData.geometry as LineGeometry).coordinates.map(
                                    (lonLat: [number, number, number?]) : [number, number, number] => {
                                        return [lonLat[0],  lonLat[1],  lonLat[2] || 0];
                                    })
                            };
                            if(way.coordinates.length >= 2) {
                                addWay(way);
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
        }   
    }
}
