const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const sharedDir = path.resolve(__dirname, "../shared/src");

// Watch the shared directory for changes
config.watchFolders = [sharedDir];

// Resolve @shared/* imports to ../shared/src/*
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("@shared/")) {
    const rest = moduleName.slice("@shared/".length);
    const newModuleName = path.join(sharedDir, rest);
    return context.resolveRequest(context, newModuleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
