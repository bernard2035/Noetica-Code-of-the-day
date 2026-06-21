"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Home, Phone, Hash, Users, MapPin, Edit3, Shield, Mail, Save, X, Navigation, Image as ImageIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { getResidentProfile, updateResidentProfile } from "@/app/actions/resident";
import { searchPlaces, getPlaceDetails } from "@/app/actions/places";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Prevent Mapbox from trying to load in SSR
if (typeof window !== "undefined") {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
}

export default function ResidentProfilePage() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    name: session?.user?.name || "Resident",
    email: session?.user?.email || "",
    phoneNumber: "+234 800 123 4567",
    landlord: "Mr. Chukwudi O.",
    houseAddress: "Block 4, Flat 12A, Victoria Garden City",
    occupants: 3,
    uniqueId: "RES-9982X",
    securityFeeStatus: "PAID",
    lng: 3.3792,
    lat: 6.5244,
  });

  const [formData, setFormData] = useState(profile);

  useEffect(() => {
    if (session?.user) {
      setProfile(prev => ({
        ...prev,
        name: session.user.name || prev.name,
        email: session.user.email || prev.email,
      }));
      setFormData(prev => ({
        ...prev,
        name: session.user.name || prev.name,
        email: session.user.email || prev.email,
      }));
      if (session.user.image) {
        setProfileImage(session.user.image);
      }
    }
  }, [session]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getResidentProfile();
        if (data) {
          setProfile(prev => ({
            ...prev,
            landlord: data.landlord || prev.landlord,
            houseAddress: data.address || prev.houseAddress,
            occupants: data.occupantCount || prev.occupants,
            uniqueId: data.uniqueId || prev.uniqueId,
            securityFeeStatus: data.securityFeeStatus || prev.securityFeeStatus,
            lat: data.lat || prev.lat,
            lng: data.lng || prev.lng,
          }));
          setFormData(prev => ({
            ...prev,
            landlord: data.landlord || prev.landlord,
            houseAddress: data.address || prev.houseAddress,
            occupants: data.occupantCount || prev.occupants,
            uniqueId: data.uniqueId || prev.uniqueId,
            securityFeeStatus: data.securityFeeStatus || prev.securityFeeStatus,
            lat: data.lat || prev.lat,
            lng: data.lng || prev.lng,
          }));
        }
      } catch (err) {
        console.error("Failed to load resident profile", err);
      }
    }
    loadProfile();
  }, []);

  // Fetch user location when editing starts
  useEffect(() => {
    if (isEditing && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }, (error) => {
        console.warn("Geolocation error:", error.message);
      });
    }
  }, [isEditing]);

  // Initialize Map when showMap is toggled
  useEffect(() => {
    if (showMap && mapContainer.current && !map.current && typeof window !== "undefined") {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [formData.lng, formData.lat],
        zoom: 13,
      });

      marker.current = new mapboxgl.Marker({ color: "#3b82f6", draggable: true })
        .setLngLat([formData.lng, formData.lat])
        .addTo(map.current);

      marker.current.on('dragend', () => {
        const lngLat = marker.current?.getLngLat();
        if (lngLat) {
          setFormData(prev => ({ ...prev, lng: lngLat.lng, lat: lngLat.lat }));
        }
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    }

    return () => {
      if (!showMap && map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [showMap]);

  const handleSave = async () => {
    setProfile(formData);
    setIsEditing(false);
    setShowMap(false);

    try {
      await updateResidentProfile({
        landlord: formData.landlord,
        address: formData.houseAddress,
        lat: formData.lat,
        lng: formData.lng,
        occupantCount: Number(formData.occupants),
      });
    } catch (err) {
      console.error("Failed to update resident profile", err);
    }

    // Update global session state dynamically
    await update({
      name: formData.name,
      image: profileImage || session?.user?.image
    });
  };

  const handleAddressSearch = async (query: string) => {
    setFormData({ ...formData, houseAddress: query });
    if (!query) {
      setSuggestions([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await searchPlaces(
        query, 
        userLocation ? userLocation.lat : undefined, 
        userLocation ? userLocation.lng : undefined
      );
      if (res.success) {
        setSuggestions(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectAddress = async (prediction: any) => {
    const addressText = prediction.description;
    setFormData({ ...formData, houseAddress: addressText });
    setSuggestions([]);
    
    // Fetch coordinates from Google Places Details
    const detailsRes = await getPlaceDetails(prediction.place_id);
    if (detailsRes.success && detailsRes.location) {
      const { lat, lng } = detailsRes.location;
      setFormData(prev => ({ ...prev, houseAddress: addressText, lng, lat }));

      if (map.current && marker.current) {
        map.current.flyTo({ center: [lng, lat], zoom: 15 });
        marker.current.setLngLat([lng, lat]);
      }
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setShowMap(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setProfileImage(url);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-slate-900">Resident Profile</h1>
          <p className="text-slate-500 mt-1 text-sm">View and manage your personal estate information.</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-lime-600/20 text-lime-600 border border-lime-500/30 rounded-xl hover:bg-lime-600/30 transition-colors flex items-center text-sm font-medium"
          >
            <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
          </button>
        ) : (
          <div className="flex space-x-3">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center text-sm font-medium"
            >
              <X className="w-4 h-4 mr-2" /> Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-lime-600 text-slate-900 rounded-xl hover:bg-lime-500 transition-colors flex items-center text-sm font-medium shadow-[0_0_15px_rgba(132,204,22,0.4)]"
            >
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-sm p-6 rounded-xl border border-slate-200 flex flex-col items-center text-center relative overflow-hidden"
          >
            
            
            <div className="w-24 h-24 bg-lime-500/20 border border-lime-500/30 rounded-full flex items-center justify-center mb-4 relative z-10 shadow-[0_0_30px_rgba(132,204,22,0.2)] overflow-hidden group">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-lime-600">{profile.name.charAt(0)}</span>
              )}
              
              {isEditing && (
                <>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ImageIcon className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Change</span>
                  </button>
                </>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 font-outfit">{profile.name}</h2>
            <p className="text-sm text-slate-500 mb-4">{profile.uniqueId}</p>
            
            <div className="w-full flex justify-center mt-2">
              <span className="text-sm text-slate-500 font-medium">
                Security Fee: <span className="text-slate-900">{profile.securityFeeStatus}</span>
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Detailed Info Form */}
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white shadow-sm p-8 rounded-xl border border-slate-200"
          >
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 font-outfit">Personal Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center">
                  <User className="w-3.5 h-3.5 mr-1.5" /> Full Name
                </label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white border border-lime-500/50 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition-all shadow-[0_0_10px_rgba(132,204,22,0.1)]"
                  />
                ) : (
                  <div className="text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                    {profile.name}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center">
                  <Hash className="w-3.5 h-3.5 mr-1.5" /> Unique Resident ID
                </label>
                <div className="text-slate-500 bg-slate-100 px-4 py-3 rounded-xl border border-slate-200 font-mono cursor-not-allowed">
                  {profile.uniqueId} (Read Only)
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1.5" /> Email Address
                </label>
                {isEditing ? (
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white border border-lime-500/50 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition-all shadow-[0_0_10px_rgba(132,204,22,0.1)]"
                  />
                ) : (
                  <div className="text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                    {profile.email}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1.5" /> Phone Number
                </label>
                {isEditing ? (
                  <input 
                    type="tel" 
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full bg-white border border-lime-500/50 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition-all shadow-[0_0_10px_rgba(132,204,22,0.1)]"
                  />
                ) : (
                  <div className="text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                    {profile.phoneNumber}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white shadow-sm p-8 rounded-xl border border-slate-200"
          >
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 font-outfit">Housing Information</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1.5" /> House Address
                </label>
                {isEditing ? (
                  <div className="space-y-3 relative">
                    <input 
                      type="text" 
                      value={formData.houseAddress}
                      onChange={(e) => handleAddressSearch(e.target.value)}
                      className="w-full bg-white border border-lime-500/50 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition-all shadow-[0_0_10px_rgba(132,204,22,0.1)]"
                    />
                    
                    {/* Autocomplete Dropdown */}
                    <AnimatePresence>
                      {suggestions.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full top-12 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto"
                        >
                          {suggestions.map((prediction) => (
                            <div 
                              key={prediction.place_id}
                              onClick={() => selectAddress(prediction)}
                              className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors flex items-start gap-3"
                            >
                              <MapPin className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-slate-900 font-medium">
                                  {prediction.structured_formatting?.main_text || prediction.description}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {prediction.structured_formatting?.secondary_text || ""}
                                </p>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button 
                      onClick={() => setShowMap(!showMap)}
                      className="text-sm bg-lime-500/20 text-lime-600 px-4 py-2 rounded-xl border border-lime-500/30 hover:bg-lime-500/30 transition-colors flex items-center"
                    >
                      <Navigation className="w-4 h-4 mr-2" /> 
                      {showMap ? "Hide Map" : "Pin Location on Map"}
                    </button>
                    
                    {/* Mapbox Container */}
                    <AnimatePresence>
                      {showMap && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 250 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="w-full rounded-xl overflow-hidden border border-lime-500/30"
                        >
                          <div ref={mapContainer} className="w-full h-full" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 relative">
                    {profile.houseAddress}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center">
                    <Home className="w-3.5 h-3.5 mr-1.5" /> Landlord Name
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.landlord}
                      onChange={(e) => setFormData({...formData, landlord: e.target.value})}
                      className="w-full bg-white border border-lime-500/50 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition-all"
                    />
                  ) : (
                    <div className="text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                      {profile.landlord}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1.5" /> Number of Occupants
                  </label>
                  {isEditing ? (
                    <input 
                      type="number" 
                      value={formData.occupants}
                      onChange={(e) => setFormData({...formData, occupants: parseInt(e.target.value) || 0})}
                      className="w-full bg-white border border-lime-500/50 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-lime-500/50 transition-all"
                    />
                  ) : (
                    <div className="text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                      {profile.occupants}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
