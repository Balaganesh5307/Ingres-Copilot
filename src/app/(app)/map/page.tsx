"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Info, Loader2, ChevronDown, ChevronRight, Navigation, Database, FilterX } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";

import { ComponentType } from "react";

// Dynamically import Leaflet map components
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false });

// This component uses Leaflet hooks and must be rendered inside MapContainer
const MapUpdater = dynamic(() => import("./MapUpdater").then((mod) => mod.default), { ssr: false }) as ComponentType<{ selectedState: string | null; geoJsonData: any }>;

const legendItems = [
  { label: "Safe", color: "bg-emerald-500", hex: "#10b981", desc: "Safe" },
  { label: "Semi-Critical", color: "bg-yellow-500", hex: "#eab308", desc: "Semi-Critical" },
  { label: "Critical", color: "bg-orange-500", hex: "#f97316", desc: "Critical" },
  { label: "Over-Exploited", color: "bg-red-500", hex: "#ef4444", desc: "Over-Exploited" },
  { label: "No Data", color: "bg-neutral-500", hex: "#3f3f46", desc: "Data not available" },
];

export default function MapPage() {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [mapData, setMapData] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [districtData, setDistrictData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const queryState = searchParams.get("state");
  const queryCategory = searchParams.get("category");

  useEffect(() => {
    if (queryState) {
      setSelectedState(queryState);
    }
  }, [queryState]);
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const geoRes = await fetch("/india-states.geojson");
        if (!geoRes.ok) throw new Error("Failed to load map data");
        const geoJson = await geoRes.json();
        
        const apiRes = await fetch("http://127.0.0.1:8000/api/v1/analytics/map-data");
        if (!apiRes.ok) throw new Error("Failed to fetch analytics data");
        const apiData = await apiRes.json();
        
        setGeoJsonData(geoJson);
        setMapData(apiData.states || []);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedState) {
      setDistrictData([]);
      setExpandedDistrict(null);
      return;
    }
    async function loadDistricts() {
      try {
        setDistrictLoading(true);
        const res = await fetch(`http://127.0.0.1:8000/api/v1/analytics/map-data/districts/${selectedState}`);
        if (!res.ok) throw new Error("Failed to load district data");
        const data = await res.json();
        setDistrictData(data.districts || []);
        setExpandedDistrict(null); // reset expansion on state change
      } catch (err) {
        console.error("District fetch error:", err);
      } finally {
        setDistrictLoading(false);
      }
    }
    loadDistricts();
  }, [selectedState]);

  const getStateStats = (stateName: string) => {
    return mapData.find(s => s.state.toLowerCase() === stateName.toLowerCase());
  };

  const getStyle = (feature: any) => {
    const stateName = feature.properties.NAME_1 || feature.properties.name || feature.properties.st_nm;
    const stats = getStateStats(stateName);
    
    let color = "#1e293b"; // Darker blue-gray for no data
    let matchesCategoryFilter = true;
    
    if (stats && stats.dominantCategory) {
      const legend = legendItems.find(l => l.label === stats.dominantCategory);
      if (legend) color = legend.hex;
      
      if (queryCategory) {
         matchesCategoryFilter = stats.dominantCategory.toLowerCase() === queryCategory.toLowerCase();
         if (!matchesCategoryFilter) {
           color = "#1e293b"; // Dim non-matching states
         }
      }
    } else if (queryCategory) {
      matchesCategoryFilter = false;
    }

    const isSelected = selectedState === stateName;

    return {
      fillColor: color,
      weight: isSelected ? 3 : (queryCategory && matchesCategoryFilter ? 2 : 1.5),
      opacity: 1,
      color: isSelected ? "#06b6d4" : (queryCategory && matchesCategoryFilter ? "#ffffff" : "#ffffff40"),
      dashArray: isSelected ? "" : "4 4",
      fillOpacity: isSelected ? 0.9 : (queryCategory && matchesCategoryFilter ? 0.8 : 0.4)
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const stateName = feature.properties.NAME_1 || feature.properties.name || feature.properties.st_nm;
    const stats = getStateStats(stateName);
    
    layer.on({
      mouseover: (e: any) => {
        if (selectedState !== stateName) {
          const l = e.target;
          l.setStyle({
            weight: 3,
            color: "#06b6d4",
            dashArray: "",
            fillOpacity: 0.8
          });
          l.bringToFront();
        }
      },
      mouseout: (e: any) => {
        const l = e.target;
        // Reset to derived style (which accounts for whether it's selected)
        l.setStyle(getStyle(feature));
      },
      click: () => {
        setSelectedState(stateName);
      }
    });

    let popupContent = `<div style="font-family: inherit; color: #f8fafc;"><strong style="font-size: 14px; color: #38bdf8;">${stateName}</strong><br/>`;
    if (stats) {
      popupContent += `<span style="font-size: 12px; margin-top: 4px; display: block;">Risk: <span style="font-weight: bold;">${stats.dominantCategory || 'N/A'}</span></span>`;
      popupContent += `<span style="font-size: 12px; display: block;">Units: ${stats.totalAssessmentUnits}</span>`;
      popupContent += `<span style="font-size: 12px; display: block;">Year: ${stats.latestAssessmentYear}</span></div>`;
    } else {
      popupContent += `<span style="font-size: 12px; display: block; opacity: 0.7;">No data available</span></div>`;
    }
    layer.bindTooltip(popupContent, {
      className: 'custom-leaflet-tooltip',
      direction: 'top',
      opacity: 0.95
    });
  };

  return (
    <div className="flex flex-col h-full p-4 gap-6 max-w-[1400px] mx-auto w-full relative min-h-[calc(100vh-4rem)]">
      {/* Background Glows */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text mb-2 flex items-center gap-4">
            Interactive Map
            {queryCategory && (
              <span className="text-sm font-semibold tracking-wide px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full flex items-center shadow-lg">
                Filtered: {queryCategory}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">Geospatial analysis of groundwater extraction and health.</p>
        </div>
        {queryCategory && (
          <Button variant="outline" size="sm" onClick={() => router.push('/map')} className="text-xs border-border/30 hover:bg-black/5">
            <FilterX className="w-4 h-4 mr-2" /> Clear Filter
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[500px]">
          <div className="flex flex-col items-center gap-4 text-primary">
            <div className="w-16 h-16 relative flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
              <Navigation className="w-6 h-6 animate-pulse" />
            </div>
            <p className="font-semibold tracking-wider text-sm uppercase">Loading Geospatial Data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center min-h-[500px]">
          <div className="flex flex-col items-center gap-4 text-destructive p-8 glass-card border-destructive/20 rounded-2xl">
            <Info className="w-10 h-10 animate-bounce" />
            <div className="text-center">
              <p className="font-bold text-lg mb-1">Map Initialization Failed</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6 flex-1 min-h-0">
          
          {/* Left Panel: State Selection */}
          <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-4 h-[300px] lg:h-auto order-2 lg:order-1">
            <Card className="glass-card border-slate-200/60 flex-1 flex flex-col shadow-xl">
              <CardHeader className="pb-3 border-b border-border/20">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Regions
                </CardTitle>
                <CardDescription>Select a state to view details</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0 relative">
                <ScrollArea className="h-full px-3 py-3">
                  <div className="space-y-1.5 pr-3">
                    {/* Sort states with data first, then alphabetical */}
                    {geoJsonData?.features
                      ?.map((f: any) => f.properties.NAME_1 || f.properties.name || f.properties.st_nm)
                      .filter((val: string, i: number, arr: string[]) => arr.indexOf(val) === i)
                      .sort((a: string, b: string) => {
                        const hasDataA = getStateStats(a) ? 1 : 0;
                        const hasDataB = getStateStats(b) ? 1 : 0;
                        if (hasDataA !== hasDataB) return hasDataB - hasDataA;
                        return a.localeCompare(b);
                      })
                      .map((state: string) => {
                        const hasData = !!getStateStats(state);
                        return (
                          <Button 
                            key={state}
                            variant="ghost"
                            className={`w-full justify-start h-10 px-3 rounded-lg transition-all duration-300 ${
                              selectedState === state 
                                ? "bg-primary text-primary-foreground font-semibold shadow-[0_0_15px_rgba(var(--primary),0.3)]" 
                                : "hover:bg-primary/15 text-muted-foreground hover:text-foreground"
                            }`}
                            onClick={() => setSelectedState(state)}
                          >
                            <div className={`w-2 h-2 rounded-full mr-3 shrink-0 ${
                              hasData 
                                ? selectedState === state ? "bg-white" : "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" 
                                : "bg-muted-foreground/30"
                            }`} />
                            <span className={`truncate ${!hasData ? 'opacity-50' : ''}`}>{state}</span>
                          </Button>
                        )
                    })}
                  </div>
                </ScrollArea>
                {/* Gradient overlay for scroll indication */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
              </CardContent>
            </Card>
          </div>

          {/* Center Panel: The Map */}
          <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-4 relative z-0 order-1 lg:order-2 h-[500px] lg:h-auto">
            <Card className="glass-card border-slate-200/60 flex-1 relative overflow-hidden flex flex-col rounded-2xl shadow-2xl p-1">
              <div className="flex-1 w-full h-full min-h-[500px] z-0 rounded-xl overflow-hidden relative border border-slate-200/60 shadow-inner">
                {/* Ensure CSR only map rendering */}
                {typeof window !== "undefined" && (
                  <MapContainer center={[22.5937, 78.9629]} zoom={4.5} scrollWheelZoom={true} className="w-full h-full bg-white/10 z-0 custom-leaflet-container">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                      className="map-tiles-filter"
                    />
                    {geoJsonData && (
                      <GeoJSON 
                        key={selectedState} // Force re-render of GeoJSON to apply dynamic styling instantly
                        data={geoJsonData} 
                        style={getStyle}
                        onEachFeature={onEachFeature}
                      />
                    )}
                    <MapUpdater selectedState={selectedState} geoJsonData={geoJsonData} />
                  </MapContainer>
                )}
              </div>
              
              {/* Legend inside map view */}
              <div className="absolute bottom-6 left-6 p-4 rounded-2xl glass border border-slate-200/60 z-[1000] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Groundwater Status</h4>
                <div className="flex flex-col gap-2.5">
                  {legendItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color} shadow-[0_0_10px_currentColor]`} />
                      <div className="text-xs font-medium text-foreground/90">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel: District Details */}
          <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-4 relative z-10 order-3 h-[400px] lg:h-auto">
            <Card className="glass-card border-slate-200/60 flex-1 flex flex-col shadow-xl">
              <CardHeader className="pb-3 border-b border-border/20 bg-primary/5">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  {selectedState ? selectedState : "State Details"} <Info className="w-4 h-4 ml-auto opacity-50" />
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedState ? (getStateStats(selectedState) ? `Assessment Year: ${getStateStats(selectedState).latestAssessmentYear}` : "No data available") : "Select a state to view details"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea className="h-full px-4 pb-4">
                  {districtLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-primary">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-xs font-medium uppercase tracking-wider">Loading Districts...</span>
                    </div>
                  ) : !selectedState ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/60 gap-4">
                      <MapPin className="w-12 h-12 opacity-20" />
                      <p className="text-sm text-center px-4 leading-relaxed">
                        Select a state on the map to view detailed district-level health metrics.
                      </p>
                    </div>
                  ) : districtData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/60 gap-4">
                      <Database className="w-12 h-12 opacity-20" />
                      <p className="text-sm text-center px-4 leading-relaxed">
                        No groundwater assessment data available for {selectedState}.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-4">
                      {/* State Summary Block */}
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 shadow-inner">
                         <div className="text-xs font-bold uppercase tracking-wider text-primary/70 mb-3">State Summary</div>
                         <div className="flex justify-between items-center mb-2">
                           <span className="text-sm text-muted-foreground">Total Units</span>
                           <span className="font-bold text-lg">{getStateStats(selectedState)?.totalAssessmentUnits}</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span className="text-sm text-muted-foreground">Dominant Risk</span>
                           <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md border shadow-sm ${
                              getStateStats(selectedState)?.dominantCategory === 'Critical' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]' :
                              getStateStats(selectedState)?.dominantCategory === 'Over-Exploited' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]' :
                              getStateStats(selectedState)?.dominantCategory === 'Semi-Critical' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]' :
                              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                           }`}>{getStateStats(selectedState)?.dominantCategory}</span>
                         </div>
                      </motion.div>

                      {/* Districts List */}
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 mt-6 px-1">District Breakdown</div>
                      <div className="space-y-2.5">
                        {districtData.map((dist, i) => (
                          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} key={i} className="rounded-xl border border-slate-200/60 bg-background/40 hover:bg-black/5 hover:border-slate-300 transition-all duration-300 overflow-hidden shadow-md">
                            
                            {/* District Header (Clickable) */}
                            <div 
                              className="p-3.5 cursor-pointer flex flex-col"
                              onClick={() => setExpandedDistrict(expandedDistrict === dist.district ? null : dist.district)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-[15px] flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${expandedDistrict === dist.district ? 'bg-primary text-primary-foreground' : 'bg-black/5 text-muted-foreground'}`}>
                                    {expandedDistrict === dist.district ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                                  </div>
                                  {dist.district}
                                </span>
                                <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded border ${
                                  dist.riskCategory === 'Critical' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                  dist.riskCategory === 'Over-Exploited' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                  dist.riskCategory === 'Semi-Critical' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}>
                                  {dist.riskCategory || 'Unknown'}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground pl-8">
                                <span>Assessment Units</span>
                                <span className="font-bold text-foreground/80">{dist.assessmentUnitCount}</span>
                              </div>
                            </div>

                            {/* Assessment Units Expanded Details */}
                            {expandedDistrict === dist.district && (
                              <div className="p-3 pt-0 border-t border-border/20 bg-black/5 backdrop-blur-sm">
                                 <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 mt-3 flex items-center gap-2">
                                   <div className="h-px bg-black/10 flex-1"/> Units <div className="h-px bg-black/10 flex-1"/>
                                 </div>
                                 <div className="space-y-2">
                                   {dist.assessmentUnits && dist.assessmentUnits.map((unit: any, idx: number) => (
                                     <div key={idx} className="bg-white/50 rounded-lg p-3 border border-slate-200/60 text-xs shadow-inner">
                                       <div className="font-bold text-primary/90 mb-2 pb-2 border-b border-border/20 text-[13px]">{unit.assessmentUnit}</div>
                                       <div className="space-y-1.5">
                                         <div className="flex justify-between items-center">
                                           <span className="text-muted-foreground">Category</span>
                                           <span className={`font-semibold ${
                                              unit.category === 'Critical' ? 'text-orange-400' :
                                              unit.category === 'Over-Exploited' ? 'text-red-400' :
                                              unit.category === 'Semi-Critical' ? 'text-yellow-400' :
                                              'text-emerald-400'
                                           }`}>{unit.category}</span>
                                         </div>
                                         <div className="flex justify-between items-center">
                                           <span className="text-muted-foreground">Assessment Year</span>
                                           <span className="font-medium text-foreground/90">{unit.assessmentYear}</span>
                                         </div>
                                       </div>
                                     </div>
                                   ))}
                                 </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

        </div>
      )}
    </div>
  );
}
