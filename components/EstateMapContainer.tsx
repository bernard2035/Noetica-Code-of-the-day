"use client";

import { useEffect, useState } from "react";
import { getEstateSettings } from "@/app/actions/settings";
import EstateMap from "@/components/EstateMap";

export default function EstateMapContainer() {
  const [lat, setLat] = useState(6.5244);
  const [lng, setLng] = useState(3.3792);

  useEffect(() => {
    async function loadSettings() {
      try {
        const result = await getEstateSettings();
        if (result.success && result.data && result.data.estateLat && result.data.estateLng) {
          setLat(result.data.estateLat);
          setLng(result.data.estateLng);
        }
      } catch (error) {
        console.error("Failed to load estate settings for map", error);
      }
    }
    loadSettings();
  }, []);

  return <EstateMap lat={lat} lng={lng} />;
}
