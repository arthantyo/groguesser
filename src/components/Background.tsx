import Image from "next/image";

export function Background() {
  return (
    <div className="absolute inset-0 z-0">
      <Image
        width={900}
        height={900}
        src={"/gronscape-hero.jpg"}
        alt="campus-illustration"
        className="object-cover w-full h-full"
      />

      {/* Glass-like dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
    </div>
  );
}
