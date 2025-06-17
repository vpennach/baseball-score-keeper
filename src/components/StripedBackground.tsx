import React from 'react';
import { View, StyleSheet } from 'react-native';

const STRIPE_HEIGHT = 40; // Height of each stripe

export default function StripedBackground() {
  return (
    <View style={styles.container}>
      {Array.from({ length: 20 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.stripe,
            {
              backgroundColor: index % 2 === 0 ? '#2E7D32' : '#4CAF50',
              top: index * STRIPE_HEIGHT,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  stripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: STRIPE_HEIGHT,
  },
}); 