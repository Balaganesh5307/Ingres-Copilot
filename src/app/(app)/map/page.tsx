"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Info, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  { label: "No Data", color: "bg-neutral-500", hex: "#737373", desc: "Data not available" },
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
    
    let color = "#737373"; // default No Data gray
    if (stats && stats.dominantCategory) {
      const legend = legendItems.find(l => l.label === stats.dominantCategory);
      if (legend) color = legend.hex;
    }

    const isSelected = selectedState === stateName;

    return {
      fillColor: color,
      weight: isSelected ? 3 : 1, // Highlight: thicker border
      opacity: 1,
      color: isSelected ? "white" : "white",
      dashArray: isSelected ? "" : "3",
      fillOpacity: isSelected ? 0.9 : 0.7 // Highlight: stronger fill
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
            color: "#fff",
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

    let popupContent = `<strong>${stateName}</strong><br/>`;
    if (stats) {
      popupContent += `Risk Category: ${stats.dominantCategory || 'N/A'}<br/>`;
      popupContent += `Assessment Units: ${stats.totalAssessmentUnits}<br/>`;
      popupContent += `Assessment Year: ${stats.latestAssessmentYear}`;
    } else {
      popupContent += `No data available`;
    }
    layer.bindTooltip(popupContent);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interactive Map</h1>
          <p className="text-muted-foreground mt-1">Geospatial analysis of groundwater extraction and health.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>Loading groundwater data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-red-500">
            <Info className="w-8 h-8" />
            <p>Unable to load map data. Please try again.</p>
            <p className="text-sm opacity-70">{error}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
          
          {/* Left Panel: State Selection */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <Card className="glass-card border-border/40 flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Regions</CardTitle>
                <CardDescription>Select a state to view details</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea className="h-full px-4 pb-4">
                  <div className="space-y-2">
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
                            variant={selectedState === state ? "default" : "ghost"}
                            className={`w-full justify-start ${selectedState === state ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "hover:bg-primary/10"}`}
                            onClick={() => setSelectedState(state)}
                          >
                            <MapPin className={`w-4 h-4 mr-2 ${hasData ? 'text-primary' : 'opacity-40'}`} /> 
                            <span className={!hasData ? 'opacity-50' : ''}>{state}</span>
                          </Button>
                        )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel: The Map */}
          <div className="lg:col-span-2 flex flex-col gap-4 relative z-0">
            <Card className="glass-card border-border/40 flex-1 relative overflow-hidden flex flex-col rounded-xl z-0">
              <div className="flex-1 w-full h-full min-h-[400px] z-0">
                {/* Ensure CSR only map rendering */}
                {typeof window !== "undefined" && (
                  <MapContainer center={[22.5937, 78.9629]} zoom={4.5} scrollWheelZoom={true} className="w-full h-full bg-slate-900/50 z-0">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-background/90 backdrop-blur-md border border-border/50 z-[1000] shadow-xl">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Groundwater Status Legend</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {legendItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color} shadow-[0_0_8px_currentColor]`} />
                      <div>
                        <div className="text-xs font-medium">{item.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel: District Details */}
          <div className="lg:col-span-1 flex flex-col gap-4 relative z-10">
            <Card className="glass-card border-border/40 flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {selectedState ? `${selectedState} Details` : "State Details"} <Info className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
                <CardDescription>
                  {selectedState ? (getStateStats(selectedState) ? `Assessment Year: ${getStateStats(selectedState).latestAssessmentYear}` : "No data available") : "Select a state to view details"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea className="h-full px-4 pb-4">
                  {districtLoading ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : !selectedState ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Please select a state on the map to view district-level health metrics.
                    </div>
                  ) : districtData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No groundwater assessment data available for {selectedState}.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* State Summary Block */}
                      <div className="p-3 mb-4 rounded-lg bg-primary/10 border border-primary/20">
                         <div className="font-semibold mb-2">State Summary</div>
                         <div className="flex justify-between text-sm mb-1">
                           <span className="text-muted-foreground">Total Units</span>
                           <span className="font-medium">{getStateStats(selectedState)?.totalAssessmentUnits}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                           <span className="text-muted-foreground">Risk Category</span>
                           <span className={`font-semibold ${
                              getStateStats(selectedState)?.dominantCategory === 'Critical' ? 'text-orange-500' :
                              getStateStats(selectedState)?.dominantCategory === 'Over-Exploited' ? 'text-red-500' :
                              getStateStats(selectedState)?.dominantCategory === 'Semi-Critical' ? 'text-yellow-500' :
                              'text-emerald-500'
                           }`}>{getStateStats(selectedState)?.dominantCategory}</span>
                         </div>
                      </div>

                      {/* Districts List */}
                      <div className="text-sm font-medium text-muted-foreground mb-2 mt-4 px-1">District Breakdown</div>
                      {districtData.map((dist, i) => (
                        <div key={i} className="rounded-lg border border-border/40 bg-background/30 transition-colors overflow-hidden">
                          
                          {/* District Header (Clickable) */}
                          <div 
                            className="p-3 hover:bg-primary/5 cursor-pointer flex flex-col"
                            onClick={() => setExpandedDistrict(expandedDistrict === dist.district ? null : dist.district)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold flex items-center gap-1">
                                {expandedDistrict === dist.district ? <ChevronDown className="w-4 h-4 text-muted-foreground"/> : <ChevronRight className="w-4 h-4 text-muted-foreground"/>}
                                {dist.district}
                              </span>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                dist.riskCategory === 'Critical' ? 'bg-orange-500/20 text-orange-400' :
                                dist.riskCategory === 'Over-Exploited' ? 'bg-red-500/20 text-red-400' :
                                dist.riskCategory === 'Semi-Critical' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {dist.riskCategory || 'Unknown'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground pl-5">
                              <span>Assessment Units</span>
                              <span className="font-medium text-foreground">{dist.assessmentUnitCount}</span>
                            </div>
                          </div>

                          {/* Assessment Units Expanded Details */}
                          {expandedDistrict === dist.district && (
                            <div className="p-3 pt-0 border-t border-border/20 bg-background/50">
                               <div className="text-xs font-semibold text-muted-foreground mb-2 mt-2">▼ Assessment Units</div>
                               <div className="space-y-3">
                                 {dist.assessmentUnits && dist.assessmentUnits.map((unit: any, idx: number) => (
                                   <div key={idx} className="bg-background rounded-md p-2 border border-border/40 text-xs">
                                     <div className="font-medium mb-1 text-sm">{unit.assessmentUnit}</div>
                                     <div className="text-muted-foreground flex justify-between mb-0.5">
                                       <span>Category:</span>
                                       <span className={`font-semibold ${
                                          unit.category === 'Critical' ? 'text-orange-500' :
                                          unit.category === 'Over-Exploited' ? 'text-red-500' :
                                          unit.category === 'Semi-Critical' ? 'text-yellow-500' :
                                          'text-emerald-500'
                                       }`}>{unit.category}</span>
                                     </div>
                                     <div className="text-muted-foreground flex justify-between mb-0.5">
                                       <span>Assessment Year:</span>
                                       <span>{unit.assessmentYear}</span>
                                     </div>
                                     <div className="text-muted-foreground flex justify-between mb-0.5">
                                       <span>Stage of Extraction:</span>
                                       <span>Data not available</span>
                                     </div>
                                     <div className="mt-2 text-[10px] text-muted-foreground opacity-80 pt-1 border-t border-border/30">
                                       Source: {unit.source} <br/>
                                       Page: {unit.sourcePage}
                                     </div>
                                   </div>
                                 ))}
                               </div>
                            </div>
                          )}
                        </div>
                      ))}
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
