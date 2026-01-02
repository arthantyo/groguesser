// Appwrite Database
export const appwriteConfig = {
  storage: {
    landmarkImages: {
      id: "",
    },
  },
  database: {
    main: {
      id: "68c474c0002b3cadd0da",
      tables: {
        landmark: {
          id: "landmarks",
        },
        round: {
          id: "rounds",
        },
        player: {
          id: "player",
        },
        gameSession: {
          id: "gamesession",
        },
      },
    },
  },
};
export const MAIN_DATABASE_ID = "68c474c0002b3cadd0da";

// Appwrite Collection
export const LANDMARK_COLLECTION_ID = "";
export const SESSION_COLLECTION_ID = "";
export const ROUND_COLLECTION_ID = "";
export const PLAYER_COLLECTION_ID = "";
// Appwrite Bucket
export const LANDMARK_IMAGES_BUCKET_ID = "";

export const isDevelopment = process.env.NODE_ENV === "development";
