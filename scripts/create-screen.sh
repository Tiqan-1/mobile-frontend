#!/bin/bash

# Check if screen name is provided
if [ -z "$1" ]; then
    echo "Please provide a screen name"
    echo "Usage: ./create-screen.sh ScreenName"
    exit 1
fi

SCREEN_NAME=$1
SCREEN_DIR="src/screens/${SCREEN_NAME}"
TEMPLATE_DIR="src/screens/templates"

# Create screen directory
mkdir -p "$SCREEN_DIR"

# Create index.tsx file
cat > "$SCREEN_DIR/index.tsx" << EOL
import React from 'react';
import { StyleSheet } from 'react-native';

import ScreenTemplate from '../templates/ScreenTemplate';

const ${SCREEN_NAME} = () => {
  return (
    <ScreenTemplate title="${SCREEN_NAME}">
      {/* Add your screen content here */}
    </ScreenTemplate>
  );
};

export default ${SCREEN_NAME};

const styles = StyleSheet.create({});
EOL

# Create styles.ts file
cat > "$SCREEN_DIR/styles.ts" << EOL
import { StyleSheet } from 'react-native';

export default StyleSheet.create({});
EOL

# Create types.ts file
cat > "$SCREEN_DIR/types.ts" << EOL
export interface ${SCREEN_NAME}Props {
  // Add your props here
}
EOL

echo "Screen ${SCREEN_NAME} created successfully!" 