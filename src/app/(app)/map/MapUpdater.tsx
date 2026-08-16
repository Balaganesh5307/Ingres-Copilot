"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface MapUpdaterProps {
  selectedState: string | null;
  geoJsonData: any;
}

export default function MapUpdater({ selectedState, geoJsonData }: MapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedState && geoJsonData) {
      const feature = geoJsonData.features.find((f: any) => {
        const name = f.properties.NAME_1 || f.properties.name || f.properties.st_nm;
        return name === selectedState;
      });
      
      if (feature) {
        const layer = L.geoJSON(feature);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20], animate: true, duration: 1.5 });
        }
      }
    }
  }, [selectedState, geoJsonData, map]);

  return null;
}
