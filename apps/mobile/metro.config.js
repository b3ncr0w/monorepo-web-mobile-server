const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// Let Metro know where to resolve packages from and force workspace root
config.resolver = {
    ...config.resolver,
    nodeModulesPaths: [
        path.resolve(projectRoot, 'node_modules'),
        path.resolve(workspaceRoot, 'node_modules'),
    ],
    disableHierarchicalLookup: true,
    platforms: ['ios', 'android', 'web'],
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'],
    assetExts: [
        // Image formats
        'png', 'jpg', 'jpeg', 'gif', 'webp',
        // Font formats
        'ttf', 'otf', 'woff', 'woff2', 'eot',
    ],
    resolveRequest: (context, moduleName, platform) => {
        // Handle expo-router entry point specifically
        if (moduleName === './../../node_modules/expo-router/entry.js') {
            return {
                filePath: path.resolve(workspaceRoot, 'node_modules/expo-router/entry.js'),
                type: 'sourceFile',
            };
        }
        // Let Metro handle all other cases
        return context.resolveRequest(context, moduleName, platform);
    },
};

module.exports = config; 