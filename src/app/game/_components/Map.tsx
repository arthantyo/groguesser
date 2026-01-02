import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { GameLocation } from "../../../utils/game";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface MapProps {
  onGuess: (coords: GameLocation) => void;
  revealAnswer?: boolean;
  guess?: GameLocation | null;
  round: number;
}

export const Map = forwardRef(
  ({ onGuess, revealAnswer, guess, round }: MapProps, ref) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const guessMarker = useRef<mapboxgl.Marker | null>(null);
    const targetMarker = useRef<mapboxgl.Marker | null>(null);

    const centerTarget: GameLocation = { longitude: 6.5318, latitude: 53.2408 };
    const offsetLat = 0.007;
    const offsetLng = 0.01;

    useImperativeHandle(ref, () => ({
      revealAnswer(userGuess: GameLocation | null, answer: GameLocation) {
        if (!map.current) return;
        const m = map.current;

        m.flyTo({
          center: [answer.longitude, answer.latitude],
          zoom: 14.5,
          speed: 1.2,
          curve: 1.4,
          essential: true,
        });

        targetMarker.current = new mapboxgl.Marker({ color: "green" })
          .setLngLat([answer.longitude, answer.latitude])
          .addTo(m);

        if (userGuess != null) {
          guessMarker.current = new mapboxgl.Marker({ color: "red" })
            .setLngLat([userGuess.longitude, userGuess.latitude])
            .addTo(m);

          // Draw line from guess → answer
          if (m.getLayer("line-layer")) m.removeLayer("line-layer");
          if (m.getSource("line")) m.removeSource("line");

          m.addSource("line", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: [
                  [userGuess.longitude, userGuess.latitude],
                  [answer.longitude, answer.latitude],
                ],
              },
            },
          });
          m.addLayer({
            id: "line-layer",
            type: "line",
            source: "line",
            layout: {},
            paint: {
              "line-color": "#00ffff",
              "line-width": 3,
              "line-dasharray": [2, 2],
            },
          });
        }
      },
      clearMarkers() {
        if (!map.current) return;
        if (guessMarker.current) {
          guessMarker.current.remove();
          guessMarker.current = null;
        }
        if (targetMarker.current) {
          targetMarker.current.remove();
          targetMarker.current = null;
        }

        const m = map.current;
        // Remove previous line
        if (m.getLayer("line-layer")) m.removeLayer("line-layer");
        if (m.getSource("line")) m.removeSource("line");
      },
    }));

    // Initialize map once
    useEffect(() => {
      if (!mapContainer.current || map.current) return;

      const m = new mapboxgl.Map({
        container: mapContainer.current,
        center: [centerTarget.longitude, centerTarget.latitude],
        zoom: 15,
        pitch: 0,
        bearing: 0,
        dragRotate: false,
        pitchWithRotate: false,
        maxZoom: 20,
        minZoom: 12,
      });

      const bounds: [mapboxgl.LngLatLike, mapboxgl.LngLatLike] = [
        [centerTarget.longitude - offsetLng, centerTarget.latitude - offsetLat],
        [centerTarget.longitude + offsetLng, centerTarget.latitude + offsetLat],
      ];
      m.setMaxBounds(bounds);

      map.current = m;
    }, []);

    // Handle map click for guesses
    useEffect(() => {
      if (!map.current) return;

      const m = map.current;

      const handleClick = (e: any) => {
        const coords: GameLocation = {
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
        };
        onGuess(coords);

        if (guessMarker.current) guessMarker.current.remove();

        guessMarker.current = new mapboxgl.Marker({ color: "red" })
          .setLngLat([coords.longitude, coords.latitude])
          .addTo(m);
      };

      if (!revealAnswer) {
        m.on("click", handleClick);
      }

      return () => {
        m.off("click", handleClick);
      };
    }, [revealAnswer, onGuess]);

    // Reset guess & target markers when round changes
    // useEffect(() => {
    //   if (!map.current) return;
    //   if (guessMarker.current) {
    //     guessMarker.current.remove();
    //     guessMarker.current = null;
    //   }
    //   if (targetMarker.current) {
    //     targetMarker.current.remove();
    //     targetMarker.current = null;
    //   }

    //   const m = map.current;
    //   // Remove previous line
    //   if (m.getLayer("line-layer")) m.removeLayer("line-layer");
    //   if (m.getSource("line")) m.removeSource("line");
    // }, [round]);

    // 🔁 Auto-clear markers whenever the round changes
    useEffect(() => {
      if (!map.current) return;

      // Remove guess marker
      if (guessMarker.current) {
        guessMarker.current.remove();
        guessMarker.current = null;
      }

      // Remove target marker
      if (targetMarker.current) {
        targetMarker.current.remove();
        targetMarker.current = null;
      }

      // Remove connecting line
      const m = map.current;
      if (m.getLayer("line-layer")) m.removeLayer("line-layer");
      if (m.getSource("line")) m.removeSource("line");
    }, [round]);

    return <div ref={mapContainer} className="w-full h-full" />;
  }
);
