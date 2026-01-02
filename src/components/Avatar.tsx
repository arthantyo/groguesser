import { generateAvatar } from "@/utils/pfp";

export default function AvatarImage({ seed }: { seed: string }) {
  const svg = generateAvatar({ seed, size: 128 });
  const base64 = `data:image/svg+xml;base64,${Buffer.from(svg).toString(
    "base64"
  )}`;

  return (
    <img
      className={"w-14 h-14 rounded-full border border-white/30 flex-shrink-0"}
      src={base64}
      alt="Avatar"
      width={128}
      height={128}
    />
  );
}
