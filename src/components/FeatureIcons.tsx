import { Building, MapPin, Target, Trophy } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Explore Campus",
    from: "from-orange-500",
    to: "to-orange-400",
    textColor: "text-white",
    delay: "0s",
  },
  {
    icon: Building,
    title: "Guess Locations",
    from: "from-purple-500",
    to: "to-purple-400",
    textColor: "text-white",
    delay: "0.5s",
  },
  {
    icon: Trophy,
    title: "Compete & Win",
    from: "from-cyan-500",
    to: "to-cyan-400",
    textColor: "text-white",
    delay: "1s",
  },
];

const FeatureIcons = () => {
  return (
    <div className="flex justify-center gap-8 mb-12">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div key={index} className="text-center">
            <div
              className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center bg-gradient-to-r ${feature.from} ${feature.to} `}
              style={{ animationDelay: feature.delay }}
            >
              <Icon
                strokeWidth={1}
                className={`w-8 h-8 ${feature.textColor}`}
              />
            </div>
            <p className="text-sm font-medium text-gray-300">{feature.title}</p>
          </div>
        );
      })}
    </div>
  );
};

export default FeatureIcons;
