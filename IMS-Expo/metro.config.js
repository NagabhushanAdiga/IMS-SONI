const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Use react-native condition so axios resolves to browser build (avoids crypto/http Node modules)
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['react-native', 'browser', 'require', 'import'];
config.resolver.unstable_conditionsByPlatform = {
  ios: ['react-native', 'browser'],
  android: ['react-native', 'browser'],
};

module.exports = config;
