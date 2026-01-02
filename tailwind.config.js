module.exports = {
  theme: {
    extend: {
      keyframes: {
        blink: {
          "0%, 50%, 100%": { borderColor: "white" },
          "25%, 75%": { borderColor: "transparent" },
        },
        "blink-fast": {
          "0%, 25%, 50%, 75%, 100%": { borderColor: "white" },
          "12.5%, 37.5%, 62.5%, 87.5%": { borderColor: "transparent" },
        },
      },
      animation: {
        blink: "blink 1s infinite",
        "blink-fast": "blink-fast 0.5s infinite",
      },
    },
  },
};
