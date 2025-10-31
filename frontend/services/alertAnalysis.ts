/**
 * Environmental Alert Analysis Service
 * Determines disease/pest risks based on weather conditions and seasonal patterns
 */

export interface EnvironmentalAlert {
  disease: string;
  severity: "high" | "medium" | "low";
  description: string;
  remedialPlan: string;
  confidence: number;
  conditions: {
    temperature: number;
    humidity: number;
    season: string;
    inMonsoon: boolean;
  };
}

/**
 * Determine if current location and month are in monsoon season
 */
const isMonsoon = (latitude: number, month: number): boolean => {
  // Northern Hemisphere (India, Pakistan, Bangladesh, etc.)
  if (latitude > 0) {
    return month >= 6 && month <= 9; // June to September
  }
  // Southern Hemisphere
  else {
    return month >= 12 || month <= 3; // December to March
  }
};

/**
 * Get current season based on latitude and month
 */
const getSeason = (latitude: number, month: number): string => {
  const inMonsoon = isMonsoon(latitude, month);

  if (inMonsoon) return "Monsoon";

  // Northern Hemisphere
  if (latitude > 0) {
    if (month >= 3 && month <= 5) return "Summer";
    if (month >= 10 && month <= 11) return "Autumn";
    return "Winter";
  }
  // Southern Hemisphere (seasons are reversed)
  else {
    if (month >= 3 && month <= 5) return "Autumn";
    if (month >= 6 && month <= 8) return "Winter";
    if (month >= 9 && month <= 11) return "Spring";
    return "Summer";
  }
};

/**
 * Analyze environmental conditions and return disease/pest alerts
 */
export const analyzeEnvironmentalConditions = (
  temperature: number,
  humidity: number,
  latitude: number,
  month: number = new Date().getMonth() + 1
): EnvironmentalAlert[] => {
  const alerts: EnvironmentalAlert[] = [];
  const inMonsoon = isMonsoon(latitude, month);
  const season = getSeason(latitude, month);

  // High Risk: Sooty Mould / Gall Midge (Monsoon + High Humidity + Warm)
  if (humidity >= 70 && temperature >= 25 && temperature <= 35 && inMonsoon) {
    alerts.push({
      disease: "Sooty Mould / Gall Midge",
      severity: "high",
      description:
        "High humidity and warm temperatures during monsoon create ideal conditions for fungal growth (sooty mould) and gall midge infestation. These pests thrive in moist environments and can severely impact leaf health and fruit yield.",
      remedialPlan:
        "• Wash leaves with mild soap solution or water spray to remove honeydew\n" +
        "• Control sap-sucking pests (aphids, mealybugs, whiteflies) immediately\n" +
        "• Prune and destroy all galled shoots caused by gall midge\n" +
        "• Apply neem-based insecticides (1500-2000 ppm) every 7-10 days\n" +
        "• Use copper-based fungicides if fungal growth is severe\n" +
        "• Ensure proper air circulation by pruning dense canopy\n" +
        "• Avoid overhead irrigation during monsoon",
      confidence: 95,
      conditions: { temperature, humidity, season, inMonsoon },
    });
  }

  // High Risk: Anthracnose (High Humidity + Warm/Hot + Any Season)
  // if (humidity >= 75 && temperature >= 24 && temperature <= 32) {
  //   alerts.push({
  //     disease: "Anthracnose",
  //     severity: "high",
  //     description:
  //       "Very high humidity with warm temperatures creates perfect conditions for anthracnose fungus. This disease causes leaf spots, twig dieback, and fruit rot, particularly during flowering and fruit development stages.",
  //     remedialPlan:
  //       "• Remove and destroy all infected plant parts immediately\n" +
  //       "• Apply copper oxychloride (0.3%) or mancozeb (0.25%) spray\n" +
  //       "• Spray carbendazim (0.1%) at 15-day intervals during critical periods\n" +
  //       "• Improve air circulation through selective pruning\n" +
  //       "• Avoid wetting foliage during irrigation\n" +
  //       "• Collect and destroy fallen leaves and fruits\n" +
  //       "• Apply preventive sprays before flowering and after fruit set",
  //     confidence: 92,
  //     conditions: { temperature, humidity, season, inMonsoon },
  //   });
  // }

  // Medium Risk: Powdery Mildew (Moderate Humidity + Warm)
  // if (
  //   humidity >= 50 &&
  //   humidity < 75 &&
  //   temperature >= 24 &&
  //   temperature <= 32
  // ) {
  //   alerts.push({
  //     disease: "Powdery Mildew",
  //     severity: "medium",
  //     description:
  //       "Moderate humidity with warm temperatures favors powdery mildew development. This fungus appears as white powdery coating on leaves, flowers, and young fruits, reducing photosynthesis and fruit quality.",
  //     remedialPlan:
  //       "• Spray wettable sulphur (0.2%) at first sign of infection\n" +
  //       "• Apply triadimefon (0.1%) or hexaconazole (0.1%) if severe\n" +
  //       "• Remove heavily infected leaves and panicles\n" +
  //       "• Ensure adequate spacing between trees for air movement\n" +
  //       "• Apply potassium-rich fertilizers to strengthen plant resistance\n" +
  //       "• Monitor regularly during flowering stage\n" +
  //       "• Avoid excessive nitrogen fertilization",
  //     confidence: 85,
  //     conditions: { temperature, humidity, season, inMonsoon },
  //   });
  // }

  // Medium Risk: Cutting Weevil (Warm + Moderate Humidity)
  if (
    temperature >= 28 &&
    temperature <= 35 &&
    humidity >= 50 &&
    humidity < 70
  ) {
    alerts.push({
      disease: "Cutting Weevil",
      severity: "medium",
      description:
        "Warm temperatures with moderate humidity trigger cutting weevil activity. Adult weevils damage shoots and leaves by cutting them in a characteristic manner, while larvae bore into twigs causing wilting.",
      remedialPlan:
        "• Remove and destroy all damaged shoots immediately\n" +
        "• Apply neem oil (1500 ppm) or azadirachtin (0.03%) spray\n" +
        "• Use chlorpyrifos (0.05%) targeting adults on foliage\n" +
        "• Install light traps to monitor and control adult populations\n" +
        "• Maintain tree health through proper irrigation and nutrition\n" +
        "• Collect and destroy fallen infested twigs\n" +
        "• Apply prophylactic sprays during new flush emergence",
      confidence: 80,
      conditions: { temperature, humidity, season, inMonsoon },
    });
  }

  // Medium Risk: Mango Hopper (Warm + Low to Moderate Humidity)
  // if (
  //   temperature >= 26 &&
  //   temperature <= 34 &&
  //   humidity >= 40 &&
  //   humidity < 65
  // ) {
  //   alerts.push({
  //     disease: "Mango Hopper",
  //     severity: "medium",
  //     description:
  //       "Warm, relatively dry conditions favor mango hopper populations. These sap-sucking insects damage flowers and young fruits, secrete honeydew leading to sooty mould, and can cause significant yield loss.",
  //     remedialPlan:
  //       "• Spray imidacloprid (0.005%) or thiamethoxam (0.005%) at panicle emergence\n" +
  //       "• Apply dimethoate (0.06%) if population is high\n" +
  //       "• Use neem oil (1500 ppm) as organic alternative\n" +
  //       "• Install yellow sticky traps to monitor populations\n" +
  //       "• Avoid water stress to trees during flowering\n" +
  //       "• Remove alternate host plants near orchard\n" +
  //       "• Time sprays during early morning or evening",
  //     confidence: 82,
  //     conditions: { temperature, humidity, season, inMonsoon },
  //   });
  // }

  // Low Risk: Bacterial Canker (Cool + High Humidity)
  // if (temperature >= 15 && temperature <= 25 && humidity >= 70) {
  //   alerts.push({
  //     disease: "Bacterial Canker",
  //     severity: "low",
  //     description:
  //       "Cool temperatures with high humidity may promote bacterial canker. This disease causes dark lesions on leaves, stems, and fruits, but is less aggressive than fungal diseases.",
  //     remedialPlan:
  //       "• Prune infected branches 15-20 cm below visible symptoms\n" +
  //       "• Apply copper-based bactericides (0.3%) as preventive spray\n" +
  //       "• Disinfect pruning tools with 70% alcohol between cuts\n" +
  //       "• Improve drainage to reduce excess moisture\n" +
  //       "• Avoid mechanical injuries to tree\n" +
  //       "• Apply bordeaux mixture (1%) during dormant season\n" +
  //       "• Remove and burn all infected plant material",
  //     confidence: 70,
  //     conditions: { temperature, humidity, season, inMonsoon },
  //   });
  // }

  // Low Risk: Stem End Rot (Warm + Any Humidity - Post Harvest)
  // if (temperature >= 25 && temperature <= 32) {
  //   alerts.push({
  //     disease: "Stem End Rot Risk",
  //     severity: "low",
  //     description:
  //       "Current warm temperatures increase risk of post-harvest stem end rot. While this primarily affects harvested fruits, field prevention measures during this period are important.",
  //     remedialPlan:
  //       "• Apply pre-harvest fungicide spray 10-15 days before harvest\n" +
  //       "• Use proper harvesting techniques with 10-15 cm stem retention\n" +
  //       "• Dip harvested fruits in carbendazim (0.1%) + borax (1%) solution\n" +
  //       "• Ensure clean harvesting equipment and containers\n" +
  //       "• Handle fruits carefully to avoid injuries\n" +
  //       "• Store fruits in cool, well-ventilated area\n" +
  //       "• Remove overripe or damaged fruits from orchard",
  //     confidence: 65,
  //     conditions: { temperature, humidity, season, inMonsoon },
  //   });
  // }

  // Default: General Monitoring
  if (alerts.length === 0) {
    alerts.push({
      disease: "No Immediate Threats - Maintain Vigilance",
      severity: "low",
      description:
        "Current environmental conditions do not match typical patterns for major mango pests or diseases. However, conditions can change rapidly, and emerging threats should be monitored.",
      remedialPlan:
        "• Conduct regular weekly inspections of leaves, shoots, and fruits\n" +
        "• Monitor weather forecasts for sudden changes\n" +
        "• Maintain proper tree nutrition and irrigation\n" +
        "• Ensure good orchard hygiene by removing fallen debris\n" +
        "• Keep records of any unusual symptoms or pest sightings\n" +
        "• Stay updated with local agricultural advisories\n" +
        "• Prepare preventive spray schedule for changing seasons",
      confidence: 60,
      conditions: { temperature, humidity, season, inMonsoon },
    });
  }

  // Sort by severity (high -> medium -> low) and confidence
  return alerts.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.confidence - a.confidence;
  });
};

/**
 * Get environmental condition status
 */
export const getEnvironmentalStatus = (
  temperature: number,
  humidity: number
): {
  status: "optimal" | "warning" | "critical";
  message: string;
} => {
  // Critical conditions
  if (humidity >= 75 && temperature >= 25 && temperature <= 32) {
    return {
      status: "critical",
      message: "High disease risk! Immediate preventive action recommended.",
    };
  }

  // Warning conditions
  if (
    (humidity >= 60 && temperature >= 24) ||
    humidity >= 70 ||
    temperature >= 35
  ) {
    return {
      status: "warning",
      message:
        "Moderate risk. Monitor trees closely and apply preventive measures.",
    };
  }

  // Optimal conditions
  return {
    status: "optimal",
    message: "Conditions are favorable. Continue regular monitoring.",
  };
};
