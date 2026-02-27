import PlatformMigrationPage from "@/components/platform/PlatformMigrationPage";
import { getPlatformMigrationConfig } from "@/lib/platformMigrationConfigs";

const config = getPlatformMigrationConfig("lightspeed");

const LightspeedAlternative = () => {
  if (!config) return null;
  return <PlatformMigrationPage config={config} />;
};

export default LightspeedAlternative;
