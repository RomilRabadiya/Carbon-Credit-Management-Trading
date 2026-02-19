import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon not showing
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    value: { lat: number; lng: number } | null;
    onChange: (lat: number, lng: number) => void;
}

function LocationMarker({ value, onChange }: LocationPickerProps) {
    const map = useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });

    useEffect(() => {
        if (value) {
            map.flyTo(value, map.getZoom());
        }
    }, [value, map]);

    return value === null ? null : (
        <Marker position={value}></Marker>
    );
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
    // Default to center of India if no value, or the value if present
    const center = value || { lat: 20.5937, lng: 78.9629 };

    return (
        <div className="h-[300px] w-full rounded-md border overflow-hidden relative z-0">
            <MapContainer
                center={center}
                zoom={5}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker value={value} onChange={onChange} />
            </MapContainer>
            <div className="absolute bottom-2 left-2 bg-white/80 p-2 rounded text-xs z-[1000] pointer-events-none">
                {value ? `Selected: ${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}` : "Click on map to select location"}
            </div>
        </div>
    );
}
