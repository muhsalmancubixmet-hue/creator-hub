import { useEffect, useRef } from "react";

export interface MapMarker { id: string; lat: number; lng: number; title: string; subtitle?: string }

/** Reusable global map (Leaflet + OpenStreetMap) with clustering and optional radius. Browser-only: Leaflet loads after mount. */
export function WorldMap({ markers, center, radiusKm, onSelect, className }: {
  markers: MapMarker[]; center?: { lat: number; lng: number } | null; radiusKm?: number;
  onSelect?: (id: string) => void; className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const state = useRef<{ L?: typeof import("leaflet"); map?: import("leaflet").Map; layer?: import("leaflet").LayerGroup; circle?: import("leaflet").Circle }>({});
  const selectRef = useRef(onSelect); selectRef.current = onSelect;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      (window as unknown as { L: typeof L }).L = L;
      await import("leaflet.markercluster");
      await import("leaflet/dist/leaflet.css");
      await import("leaflet.markercluster/dist/MarkerCluster.css");
      await import("leaflet.markercluster/dist/MarkerCluster.Default.css");
      if (cancelled || !el.current) return;
      const map = L.map(el.current, { worldCopyJump: true, minZoom: 2 }).setView([20, 10], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap contributors", maxZoom: 18 }).addTo(map);
      state.current = { L, map };
      sync();
    })();
    return () => { cancelled = true; state.current.map?.remove(); state.current = {}; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sync() {
    const { L, map } = state.current; if (!L || !map) return;
    state.current.layer?.remove(); state.current.circle?.remove();
    const icon = L.divIcon({ className: "", html: '<span class="map-pin"></span>', iconSize: [18, 18], iconAnchor: [9, 9] });
    const group = (L as unknown as { markerClusterGroup: () => import("leaflet").LayerGroup }).markerClusterGroup();
    markers.forEach(m => {
      const mk = L.marker([m.lat, m.lng], { icon, title: m.title });
      mk.bindTooltip(`<strong>${m.title}</strong>${m.subtitle ? `<br/>${m.subtitle}` : ""}`);
      mk.on("click", () => selectRef.current?.(m.id));
      group.addLayer(mk);
    });
    group.addTo(map); state.current.layer = group;
    if (center) {
      if (radiusKm) { state.current.circle = L.circle([center.lat, center.lng], { radius: radiusKm * 1000, color: "hsl(10 80% 60%)", weight: 1, fillOpacity: 0.08 }).addTo(map); map.fitBounds(state.current.circle.getBounds(), { maxZoom: 11 }); }
      else map.setView([center.lat, center.lng], 9);
    } else if (markers.length) map.fitBounds(L.latLngBounds(markers.map(m => [m.lat, m.lng])), { padding: [30, 30], maxZoom: 5 });
  }
  useEffect(sync, [markers, center, radiusKm]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={el} className={className} role="region" aria-label="World map" />;
}
