"use client";

import Link from "next/link";
import { motion } from "motion/react";
import Image from "next/image";
import { fredoka } from "@/utils/fonts";

export default function NotFound() {
  return (
    <div className="relative flex items-center justify-center w-full h-screen overflow-hidden bg-gray-900">
      <div className="absolute inset-0 z-0">
        <Image
          src={"/gronscape-hero.jpg"}
          alt="University of Groningen Campus"
          width={128}
          height={128}
          className="object-cover w-full h-full"
        />

        {/* Glass-like dark overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative z-10 px-6 text-center  ${fredoka.className}`}
      >
        <h1
          className={`font-extrabold text-transparent text-7xl bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 drop-shadow-lg`}
        >
          404
        </h1>
        <p className="mt-4 text-lg text-white/80">
          Oops! The page you’re looking for doesn’t exist.
        </p>

        <Link
          href="/"
          className="inline-block px-6 py-3 mt-6 font-semibold text-white transition-transform duration-300 border shadow-md rounded-2xl bg-black/40 backdrop-blur-md border-white/20 hover:scale-105"
        >
          Go Home
        </Link>
      </motion.div>
    </div>
  );
}
