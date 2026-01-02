"use client";

import { fredoka } from "@/utils/fonts";
import { useEffect, useRef, useState } from "react";
import { Map } from "./Map";
import { CheckCircle2 } from "lucide-react";
import PanoramaViewer from "@/components/PanoramaViewer";
import RoundPanel from "./RoundPanel";
import MapToggleButton from "./MapToggleButton";
import Timer, { TimerHandle } from "./BorderTime";
import { Background } from "@/components/Background";
import GameOverModal from "./GameOverModal";
import ScoreDisplay from "./ResultDisplay";
import { GameLocation, GameSessionStatus } from "../../../utils/game";
import {
  useGameStoreCurrentRoundData,
  useGameStoreLoading,
  useGameStoreMethods,
  useGameStoreSession,
} from "../../../store/game";
import AvatarImage from "../../../components/Avatar";
import { useAuthStoreMethods, useAuthStoreProfile } from "../../../store/auth";
import Link from "next/link";

export default function GameHUD() {
  const currentRoundData = useGameStoreCurrentRoundData();
  const loading = useGameStoreLoading();
  const session = useGameStoreSession();

  const userProfile = useAuthStoreProfile();
  const { getProfile, setUsername } = useAuthStoreMethods();

  const mapRef = useRef<any>(null);
  const timerRef = useRef<TimerHandle>(null);
  const {
    timeout,
    setSession,
    guess: guessLandmark,
    fetchCurrentRound,
  } = useGameStoreMethods();
  const [roundAnswer, setRoundAnswer] = useState<{
    scoreReceived: number;
    distanceFromTarget: number;
    accuracy: number;
  } | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeEnded, setTimeEnded] = useState(false);
  const [guess, setGuess] = useState<GameLocation | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  // const [currentRoundData, setCurrentRoundData] = useState<{
  //   duration: number;
  //   imageUrl: string;
  //   label: string;
  // } | null>(null);

  useEffect(() => {
    if (session && session.status !== GameSessionStatus.ENDED) {
      fetchCurrentRound();
    }
  }, [session?.id]);

  useEffect(() => {
    async function fetchProfile() {
      if (!userProfile) {
        getProfile();
        return;
      }

      try {
        const res = await fetch(`/api/player/${userProfile.id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error("Something went wrong");
        }

        setUsername(data.data.username);
      } catch (error) {
        console.error("Something went wrong, ", error);
      }
    }

    fetchProfile();
  }, [userProfile?.id]);

  // if (loading) {
  //   return <>{LoaderOverlay}</>;
  // }

  if (!session) {
    return (
      <div
        className={`relative flex items-center justify-center w-full h-screen bg-gray-900 ${fredoka.className}`}
      >
        <Background />
        <div className="z-10 flex flex-col items-center text-center">
          <h1
            className={`font-extrabold text-transparent text-7xl bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 drop-shadow-lg`}
          >
            404
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Start a game session from the menu!
          </p>
          <Link
            href="/menu"
            className="inline-block px-6 py-3 mt-6 font-semibold text-white transition-transform duration-300 border shadow-md rounded-2xl bg-black/40 backdrop-blur-md border-white/20 hover:scale-105"
          >
            Back to menu
          </Link>
        </div>
      </div>
    );
  }

  const currentRoundIndex = session.currentRound;

  async function handleSubmitClick() {
    if (!showResult && guess) {
      try {
        const result = await guessLandmark({ guess });

        mapRef.current?.revealAnswer(guess, {
          longitude: result.landmark.longitude,
          latitude: result.landmark.latitude,
        } as GameLocation);

        setRoundAnswer({
          // longitude: result.landmark.longitude,
          // latitude: result.landmark.latitude,
          scoreReceived: result.scoreReceived,
          distanceFromTarget: result.distanceFromTarget,
          accuracy: result.accuracy,
        });

        setTotalScore((prev) => prev + result.scoreReceived);

        setShowResult(true);
      } catch (err: any) {
        console.error(err);
      }
    } else {
      if (!session?.id) return;

      const nextRoundIndex = session.currentRound;

      if (nextRoundIndex >= session.rounds.length) {
        // End session if last round
        setSession({
          ...session,
          currentRound: session.currentRound,
          status: GameSessionStatus.ENDED,
        });
        return;
      }

      setSession({
        ...session,
        currentRound: nextRoundIndex,
      });

      setShowResult(false);
      setGuess(null);
      setIsCorrect(false);
      setShowMap(false);
      setRoundAnswer(null);

      mapRef.current?.clearMarkers?.();

      if (timeEnded) {
        timerRef.current?.reset();
        setTimeEnded(false);
      }

      try {
        fetchCurrentRound();
      } catch (err) {
        console.error("Error loading next round:", err);
      }
    }
  }

  function handleGuess(coords: GameLocation) {
    setGuess(coords);
  }

  function handleViewMap() {
    setShowMap((prev) => !prev);
  }

  async function handleTimeUp() {
    // if (!session?.id) return;
    // // TODO: call the timeout api!
    // const result = await fetch(`/api/session/${session.id}/timeout`);
    // if (!result.ok) throw new Error("Failed to fetch round");

    // const data = await result.json();

    const data = await timeout();

    setTimeEnded(true);

    setShowMap(true);
    mapRef.current?.revealAnswer(guess, {
      longitude: data.landmark.longitude,
      latitude: data.landmark.latitude,
    } as GameLocation);

    setRoundAnswer({
      scoreReceived: 0,
      distanceFromTarget: 0,
      accuracy: 0,
    });

    setShowResult(true);
  }

  return (
    <div className="relative flex flex-col w-full h-screen px-6 pb-4 overflow-hidden bg-gray-900">
      <Background />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-8 py-4 border shadow-md bg-black/40 backdrop-blur-md rounded-b-3xl border-white/20">
        <div className="flex flex-col items-start gap-4 text-white md:flex-row md:items-center">
          <div
            className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 ${fredoka.className}`}
          >
            GroGuesser
          </div>
        </div>

        {/* Timer */}
        {currentRoundData && (
          <Timer
            ref={timerRef}
            key={currentRoundIndex}
            totalTime={currentRoundData.duration}
            onFinish={handleTimeUp}
            running={!showResult}
          />
        )}

        {/* Profile */}
        <div className="flex items-center gap-2">
          <span className={`text-white font-semibold ${fredoka.className}`}>
            {userProfile?.username || "Guest"}
          </span>
          <AvatarImage seed={userProfile?.username || "Guest"} />
        </div>
      </div>

      {/* Map Area */}
      <div className="relative flex flex-1 mt-4 overflow-hidden border shadow-lg rounded-2xl border-white/20">
        <div className="absolute inset-0 z-0 bg-black/50 backdrop-blur-sm" />
        <MapToggleButton showMap={showMap} onClick={handleViewMap} />
        <RoundPanel
          score={totalScore}
          currentRound={currentRoundIndex + 1}
          roundResults={session.rounds.map((r: any) => r.result)}
        />
        <PanoramaViewer imagePath={currentRoundData?.imageUrl || ""} />

        {/* Map overlay */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            showMap
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <Map
            ref={mapRef}
            onGuess={handleGuess}
            revealAnswer={showResult}
            guess={guess}
            round={currentRoundIndex}
          />
        </div>

        {showResult && !timeEnded && guess != null && roundAnswer != null && (
          <ScoreDisplay
            accuracy={roundAnswer.accuracy}
            distanceFromTarget={roundAnswer.distanceFromTarget}
            score={roundAnswer.accuracy}
          />
        )}
      </div>

      {/* Submit Button */}
      <div className="absolute z-10 transform -translate-x-1/2 bottom-8 left-1/2">
        <button
          onClick={handleSubmitClick}
          disabled={!guess && !showResult}
          className={`px-6 py-2 rounded-3xl cursor-pointer
           bg-green-700 text-white font-bold
           shadow-md hover:bg-green-800
           hover:shadow-lg hover:scale-105
           active:scale-95 transition-all duration-300 ease-out
           disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {showResult ? "Continue" : "Submit"}
        </button>
      </div>
      {/*
      <HeartsDisplay
        // total={session.maxHearts}
        total={5}
        remaining={session.hearts}
      /> */}

      {showResult && timeEnded && (
        <div className="absolute z-10 px-4 py-2 text-center text-white transform -translate-x-1/2 shadow-lg bottom-24 left-1/2 bg-black/70 rounded-xl">
          <p>Time's up! You get no score lol.</p>
        </div>
      )}

      {isCorrect && (
        <div className="absolute inset-0 flex items-center justify-center">
          <CheckCircle2 className="w-48 h-48 text-green-400" />
        </div>
      )}

      {session.status == GameSessionStatus.ENDED && (
        <GameOverModal roundResults={session.rounds} />
      )}

      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <svg
            className="w-16 h-16 text-white animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </div>
      )}
    </div>
  );
}
