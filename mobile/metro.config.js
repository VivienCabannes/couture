const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const sharedRoot = path.resolve(projectRoot, "../shared");

const config = getDefaultConfig(projectRoot);

// Watch the shared directory
config.watchFolders = [sharedRoot];

// Resolve node_modules from the mobile directory only
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];

// Rewrite @shared/* imports to the shared/src directory
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("@shared/")) {
    const rest = moduleName.slice("@shared/".length);
    return context.resolveRequest(
      context,
      path.resolve(sharedRoot, "src", rest),
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
