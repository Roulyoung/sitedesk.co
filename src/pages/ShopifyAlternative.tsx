import PlatformMigrationPage from "@/components/platform/PlatformMigrationPage";
import { getPlatformMigrationConfig } from "@/lib/platformMigrationConfigs";

const config = getPlatformMigrationConfig("shopify");

const ShopifyAlternative = () => {
  if (!config) return null;
  return <PlatformMigrationPage config={config} />;
};

export default ShopifyAlternative;
