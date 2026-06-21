"use server";

export async function searchPlaces(query: string, lat?: number, lng?: number) {
  if (!query) return { success: true, data: [] };

  try {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:ng&key=${key}`;
    
    // Bias the results toward the user's exact location if provided
    if (lat && lng) {
      url += `&location=${lat},${lng}&radius=20000`; // 20km radius bias
    }

    const res = await fetch(url);
    const data = await res.json();
    
    if (data.status === "OK" || data.status === "ZERO_RESULTS") {
      return { success: true, data: data.predictions || [] };
    } else {
      console.error("Google Places Error:", data);
      return { success: false, message: data.error_message || "Failed to fetch places" };
    }
  } catch (err) {
    console.error(err);
    return { success: false, message: "Server error" };
  }
}

export async function getPlaceDetails(placeId: string) {
  try {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${key}`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.status === "OK") {
      return { success: true, location: data.result?.geometry?.location }; // { lat, lng }
    } else {
      console.error("Google Place Details Error:", data);
      return { success: false, message: data.error_message || "Failed to fetch place details" };
    }
  } catch (err) {
    console.error(err);
    return { success: false, message: "Server error" };
  }
}
