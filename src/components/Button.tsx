import { fredoka } from "@/utils/fonts";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: "filled" | "glass";
};

const Button = ({ children, variant = "filled", ...rest }: ButtonProps) => {
  const baseClasses = `
    cursor-pointer
    relative
    inline-flex
    items-center
    justify-center
    px-8
    py-4
    rounded-2xl
    text-lg
    font-bold
    shadow-lg
    transition-all
    duration-300
    overflow-hidden
    ${fredoka.className}
  `;

  const filledClasses = `
    border border-white/20 bg-purple-400/70
    text-white
    hover:scale-105
    hover:shadow-2xl
  `;

  const glassClasses = `
    text-white
    bg-white/10
    backdrop-blur-sm
    border border-white/20
    hover:shadow-lg
  `;

  return (
    <button
      {...rest}
      className={`${baseClasses} ${
        variant === "filled" ? filledClasses : glassClasses
      }`}
    >
      {/* Shimmer overlay */}
      <span className="absolute inset-0 transition-opacity duration-300 opacity-0  bg-gradient-to-r from-white/20 via-white/10 to-white/20 hover:opacity-30 rounded-2xl" />
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;
