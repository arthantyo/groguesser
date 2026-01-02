import { randomUUID } from "crypto";
import { GameRound, Landmark } from "./game";

export const allLandmarksDummy: Landmark[] = [
  {
    label: "Eiffel Tower",
    location: { latitude: 48.8584, longitude: 2.2945 },
    imageUrl: "https://example.com/eiffel.jpg",
  },
  {
    label: "Great Wall",
    location: { latitude: 40.4319, longitude: 116.5704 },
    imageUrl: "https://example.com/wall.jpg",
  },
  {
    label: "Taj Mahal",
    location: { latitude: 27.1751, longitude: 78.0421 },
    imageUrl: "https://example.com/taj.jpg",
  },
  {
    label: "Colosseum",
    location: { latitude: 41.8902, longitude: 12.4922 },
    imageUrl: "https://example.com/colosseum.jpg",
  },
  {
    label: "Christ the Redeemer",
    location: { latitude: -22.9519, longitude: -43.2105 },
    imageUrl: "https://example.com/christ.jpg",
  },
  {
    label: "Sydney Opera House",
    location: { latitude: -33.8568, longitude: 151.2153 },
    imageUrl: "https://example.com/sydney.jpg",
  },
];
