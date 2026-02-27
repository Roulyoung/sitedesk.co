import PlatformMigrationPage from "@/components/platform/PlatformMigrationPage";
import { getPlatformMigrationConfig } from "@/lib/platformMigrationConfigs";

const config = getPlatformMigrationConfig("prestashop");

const PrestashopAlternative = () => {
  if (!config) return null;
  return <PlatformMigrationPage config={config} />;
};

export default PrestashopAlternative;
