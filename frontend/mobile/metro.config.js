const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const sharedDir = path.resolve(__dirname, "../shared/src");
const mobileModules = path.resolve(__dirname, "node_modules");

// Watch the shared directory for changes
config.watchFolders = [sharedDir];

// Resolve packages from mobile's node_modules when imported from shared code
config.resolver.nodeModulesPaths = [mobileModules];

// Resolve @shared/* imports to ../shared/src/*
// Stub out desktop-only Tauri packages so shared code can import them
// without breaking the React Native bundle.
const tauriStub = path.resolve(__dirname, "tauri-stub.js");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("@tauri-apps/")) {
    return { type: "sourceFile", filePath: tauriStub };
  }
  if (moduleName.startsWith("@shared/")) {
    const rest = moduleName.slice("@shared/".length);
    const newModuleName = path.join(sharedDir, rest);
    return context.resolveRequest(context, newModuleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
