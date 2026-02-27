import PlatformMigrationPage from "@/components/platform/PlatformMigrationPage";
import { getPlatformMigrationConfig } from "@/lib/platformMigrationConfigs";

const config = getPlatformMigrationConfig("magento");

const MagentoAlternative = () => {
  if (!config) return null;
  return <PlatformMigrationPage config={config} />;
};

export default MagentoAlternative;
