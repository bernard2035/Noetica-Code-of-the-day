"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, MapPin, DollarSign, Search, Loader2, Save } from "lucide-react";
import { searchPlaces, getPlaceDetails } from "@/app/actions/places";
import { getEstateSettings, updateEstateSettings } from "@/app/actions/settings";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [fee, setFee] = useState<string>("0");
  const [address, setAddress] = useState<string>("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const result = await getEstateSettings();
        if (result.success && result.data) {
          setFee(result.data.defaultSecurityFee.toString());
          setAddress(result.data.estateAddress || "");
          setLat(result.data.estateLat);
          setLng(result.data.estateLng);
        }
      } catch (error) {
        console.error("Error loading settings", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        const res = await searchPlaces(searchQuery);
        if (res.success) {
          setSuggestions(res.data);
        }
        setIsSearching(false);
      } else {
        setSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectPlace = async (placeId: string, description: string) => {
    setSearchQuery("");
    setSuggestions([]);
    setAddress(description);
    
    setIsSearching(true);
    const res = await getPlaceDetails(placeId);
    if (res.success && res.location) {
      setLat(res.location.lat);
      setLng(res.location.lng);
    }
    setIsSearching(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    const formData = new FormData();
    formData.append("defaultSecurityFee", fee);
    formData.append("estateAddress", address);
    if (lat) formData.append("estateLat", lat.toString());
    if (lng) formData.append("estateLng", lng.toString());

    try {
      const result = await updateEstateSettings(formData);
      if (result.success) {
        setMessage("Settings updated successfully!");
        router.refresh();
      }
    } catch (error) {
      setMessage("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-lime-500" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-slate-900">Estate Settings</h1>
          <p className="text-slate-500 mt-1 text-sm">Configure global estate parameters and location.</p>
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-lg border border-slate-200">
        <form onSubmit={handleSave} className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center text-slate-800">
              <DollarSign className="w-5 h-5 mr-2 text-lime-600" /> Security Fee Configuration
            </h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Default Monthly Security Fee (NGN)</label>
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400">₦</span>
                </div>
                <input
                  type="number"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500 outline-none transition-all text-slate-900"
                  placeholder="e.g. 10000"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center text-slate-800">
              <MapPin className="w-5 h-5 mr-2 text-lime-600" /> Estate Location
            </h3>
            
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Search for Estate Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <Search className="w-4 h-4 text-slate-400" />}
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500 outline-none transition-all text-slate-900"
                    placeholder="Search address or landmark..."
                  />
                  {suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                      {suggestions.map((place) => (
                        <button
                          key={place.place_id}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 text-sm text-slate-700"
                          onClick={() => handleSelectPlace(place.place_id, place.description)}
                        >
                          {place.description}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Selected Address</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 min-h-[48px] flex items-center">
                  {address || <span className="text-slate-400 italic">No address selected</span>}
                </div>
              </div>
              
              {(lat !== null && lng !== null) && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Latitude</label>
                    <input type="text" readOnly value={lat} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-sm outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Longitude</label>
                    <input type="text" readOnly value={lng} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-sm outline-none" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {message && (
            <div className="p-3 rounded-xl bg-lime-50 border border-lime-200 text-lime-700 text-sm font-medium">
              {message}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
