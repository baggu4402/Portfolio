// Project order, copy, categories, images, and links are managed here.
// images[0] is the cover; images.slice(1) appear below all project details.
// Replace each supplied 01.webp placeholder with your project image.
// Add 02.webp, 03.png, etc. to images and supply matching imageAlts.
// Paths are relative to index.html. Empty links and dates are not displayed.
window.PORTFOLIO_PROJECTS = [
  {
    id: "purrfect-parcel",
    title: "Purrfect Parcel",
    categories: ["Unity"],
    type: "Mobile Game",
    role: "Full Development & Release",
    description: "A mobile game developed with Unity. I handled the project from development through release on Android and iOS.",
    period: "",
    technologies: ["Unity", "C#", "Mobile", "Android", "iOS"],
    images: ["./assets/projects/purrfect-parcel/01.webp"],
    imageAlts: ["Purrfect Parcel project preview"],
    gif: "",
    technicalChallenges: [
      "Handled the game development process from implementation to mobile release.",
      "Prepared and released the project for mobile platforms.",
      "Managed the project structure and mobile build pipeline through the release stage."
    ],
    links: { github: "", video: "", demo: "", download: "", store: "" }
  },
  {
    id: "parcelknight",
    title: "ParcelKnight",
    categories: ["Unreal Engine"],
    type: "Multiplayer Game",
    role: "Multiplayer, Host/Client, Map & Trap Implementation",
    description: "An Unreal Engine multiplayer project focused on host-client cooperative gameplay.",
    period: "",
    technologies: ["Unreal Engine", "Multiplayer", "Host / Client"],
    images: ["./assets/projects/parcelknight/01.webp"],
    imageAlts: ["ParcelKnight project preview"],
    gif: "",
    technicalChallenges: [
      "Worked on multiplayer behavior between the host and connected clients.",
      "Implemented gameplay map elements and traps.",
      "Handled host/client gameplay interactions so multiplayer features behaved consistently during a session."
    ],
    links: { github: "", video: "https://www.youtube.com/watch?v=A5hnTB9aoWU", demo: "", download: "", store: "" }
  },
  {
    id: "animal-rider",
    title: "Animal Rider",
    categories: ["Unreal Engine"],
    type: "Cooperative Multiplayer Game",
    role: "Game Flow, Cargo System, GameMode & Multiplayer",
    description: "A cooperative Unreal Engine multiplayer project built around safely transporting cargo through the level.",
    period: "",
    technologies: ["Unreal Engine", "C++", "Replication", "Listen Server", "GameMode"],
    images: ["./assets/projects/animal-rider/01.webp"],
    imageAlts: ["Animal Rider project preview"],
    gif: "",
    technicalChallenges: [
      "Centralized the core game-flow rules in GameMode and managed match states such as Waiting, Playing, Cleared, and GameOver.",
      "Built a replicated cargo system with synchronized actor movement and server-authoritative cargo-loss handling.",
      "Used a Listen Server and handled important gameplay state changes on the server to keep multiplayer sessions consistent.",
      "Designed the core systems without unnecessary per-frame Tick logic."
    ],
    links: { github: "", video: "", demo: "", download: "", store: "" }
  },
  {
    id: "weathertwin",
    title: "WeatherTwin",
    categories: ["Unity", "Digital Twin"],
    type: "Digital Twin",
    role: "Full Development",
    description: "A Unity-based digital twin project that receives real-time weather data from the Korea Meteorological Administration (KMA) and visualizes it in a virtual environment.",
    period: "",
    technologies: ["Unity", "C#", "Digital Twin", "KMA Weather Data", "Real-time Data"],
    images: ["./assets/projects/weathertwin/01.webp"],
    imageAlts: ["WeatherTwin project preview"],
    gif: "",
    technicalChallenges: [
      "Connected real-time KMA weather observations to the Unity visualization.",
      "Kept the last valid weather state when a data update failed instead of immediately replacing it with invalid data.",
      "Implemented switching between a map view and a 3D environment while preserving the current application state.",
      "Mapped weather conditions to visual changes in the 3D environment, including surface wetness and weather information displays."
    ],
    links: { github: "https://github.com/baggu4402/WeatherTwin", video: "", demo: "", download: "", store: "" }
  }
];
