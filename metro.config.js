const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Recognize 3D model formats as static assets so they can be `require`d.
config.resolver.assetExts.push('glb', 'gltf', 'bin', 'hdr');

// Force a single resolved path for `three` so that expo-three, @react-three/fiber,
// @react-three/drei, and our own components all share the exact same instance.
// Without this, Metro can resolve different export entry points (CJS vs ESM)
// to separate module records and trigger R3F's
// "Multiple instances of Three.js being imported" warning, which silently
// breaks rendering on device.
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  three: path.resolve(__dirname, 'node_modules/three'),
};

module.exports = config;
