"use client";
import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; // Slim version for smaller size

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine); // Use slim version instead of full
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        background: {
          color: "#1a202c", // Deep dark background
        },
        particles: {
          number: { value: 60 },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: {
            value: 0.5,
            random: false,
            anim: { enable: true, speed: 0.5 },
          },
          size: { value: 2 },
          move: { enable: true, speed: 0.6 },
        },
        links: {
            enable: true,
            distance: 150, // Max distance for connecting lines
            color: "#ffffff",
            opacity: 0.4,
            width: 1,
          },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "" },
            resize: true,
          },
        },
      }}
    />
  );
}
