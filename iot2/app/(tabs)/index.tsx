import React, { useEffect, useState, useRef } from 'react';
import { Button, StyleSheet, Text, View, Animated } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { LightSensor } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';

export default function HomeScreen() {
  const [lightIntensity, setLightIntensity] = useState(null);
  const [lightOn, setLightOn] = useState(false);
  const [bulbLight, setBulbLight] = useState(50);
  const sliderValue = useRef(bulbLight);

  // Animation pour l'effet d'ampoule
  const bulbOpacity = useRef(new Animated.Value(0)).current;

  const toggleLight = () => {
    setLightOn((prev) => !prev);
    // Animation pour l'effet d'ampoule
    Animated.timing(bulbOpacity, {
      toValue: lightOn ? 0 : 1, // Allume ou éteint l'ampoule
      duration: 300, // Durée de l'animation
      useNativeDriver: true, // Utilise le pilote natif pour de meilleures performances
    }).start();
  };

  useEffect(() => {
    LightSensor.setUpdateInterval(1000);

    const subscription = LightSensor.addListener((data) => {
      setLightIntensity(data.illuminance);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const getTextColor = () => {
    if (lightIntensity === null) {
      return styles.defaultText;
    } else if (lightIntensity < 50) {
      return styles.lowLightText;
    } else if (lightIntensity >= 50 && lightIntensity <= 200) {
      return styles.mediumLightText;
    } else {
      return styles.highLightText;
    }
  };

  const getButtonColor = () => {
    if (lightIntensity === null) {
      return '#007BFF';
    } else if (lightIntensity < 50) {
      return '#FF3B30';
    } else if (lightIntensity >= 50 && lightIntensity <= 200) {
      return '#FF9500';
    } else {
      return '#34C759';
    }
  };

  const handleSliderChange = (value) => {
    sliderValue.current = value;
  };

  const handleSliderComplete = () => {
    setBulbLight(sliderValue.current);
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.gradientContainer}
    >
      <ThemedView style={styles.container}>
        <Text style={[styles.text, getTextColor()]}>
          Intensité Lumineuse Extérieure :{' '}
          {lightIntensity !== null ? `${lightIntensity.toFixed(2)} lux` : 'Mesure en cours...'}
        </Text>
      </ThemedView>

      <ThemedView style={styles.container}>
        {/* Effet d'ampoule */}
        <View style={styles.bulbContainer}>
          <Animated.View
            style={[
              styles.bulb,
              {
                opacity: bulbOpacity, // Contrôle l'opacité de l'ampoule
                backgroundColor: lightOn ? '#FFFF00' : '#CCCCCC', // Couleur de l'ampoule
              },
            ]}
          />
        </View>

        <View style={styles.lightStatusContainer}>
          <Text style={[styles.text, styles.lightStatusText]}>
            {lightOn ? 'Lumière allumée' : 'Lumière éteinte'}
          </Text>
        </View>
        <Button
          title={lightOn ? 'Éteindre la lumière' : 'Allumer la lumière'}
          onPress={toggleLight}
          color={getButtonColor()}
        />
      </ThemedView>

      <ThemedView style={styles.container}>
        <Text style={styles.text}>Intensité de l'ampoule :</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={bulbLight}
          onValueChange={handleSliderChange}
          onSlidingComplete={handleSliderComplete}
          minimumTrackTintColor="#007BFF"
          maximumTrackTintColor="#CCCCCC"
          thumbTintColor="#007BFF"
          disabled={!lightOn}
        />
      </ThemedView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  defaultText: {
    color: 'black',
  },
  lowLightText: {
    color: '#FF3B30',
  },
  mediumLightText: {
    color: '#FF9500',
  },
  highLightText: {
    color: '#34C759',
  },
  lightStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  lightStatusText: {
    fontSize: 18,
    color: '#333',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 10,
  },
  bulbContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  bulb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#000',
  },
});