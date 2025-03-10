import React, { useEffect, useState, useRef } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { LightSensor } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient'; // Pour le fond dégradé
import Slider from '@react-native-community/slider'; // Importer le Slider

export default function HomeScreen() {
  const [lightIntensity, setLightIntensity] = useState(null); // Lumière extérieure mesurée
  const [lightOn, setLightOn] = useState(false); // État de l'ampoule (allumée/éteinte)
  const [bulbLight, setBulbLight] = useState(50); // Intensité lumineuse de l'ampoule (0-100%)
  const sliderValue = useRef(bulbLight); // Référence pour garder la valeur de l'intensité de l'ampoule stable

  const toggleLight = () => {
    setLightOn((prev) => !prev); // Alterner l'état de la lumière
  };

  useEffect(() => {
    // Configurer le capteur de lumière
    LightSensor.setUpdateInterval(1000); // Mettre à jour toutes les secondes

    const subscription = LightSensor.addListener((data) => {
      // L'intensité lumineuse est donnée par la propriété `illuminance` (en lux)
      setLightIntensity(data.illuminance);
    });

    // Nettoyer l'écouteur lors du démontage du composant
    return () => {
      subscription.remove();
    };
  }, []);

  // Définir la couleur du texte en fonction de l'intensité lumineuse extérieure
  const getTextColor = () => {
    if (lightIntensity === null) {
      return styles.defaultText; // Couleur par défaut si la mesure est en cours
    } else if (lightIntensity < 50) {
      return styles.lowLightText; // Rouge pour une faible intensité lumineuse
    } else if (lightIntensity >= 50 && lightIntensity <= 200) {
      return styles.mediumLightText; // Orange pour une intensité lumineuse moyenne
    } else {
      return styles.highLightText; // Vert pour une intensité lumineuse élevée
    }
  };

  // Définir la couleur du bouton en fonction de l'intensité lumineuse extérieure
  const getButtonColor = () => {
    if (lightIntensity === null) {
      return '#007BFF'; // Couleur par défaut (bleu)
    } else if (lightIntensity < 50) {
      return '#FF3B30'; // Rouge pour une faible intensité lumineuse
    } else if (lightIntensity >= 50 && lightIntensity <= 200) {
      return '#FF9500'; // Orange pour une intensité lumineuse moyenne
    } else {
      return '#34C759'; // Vert pour une intensité lumineuse élevée
    }
  };

  // Mettre à jour l'intensité lumineuse de l'ampoule en fonction du slider
  const handleSliderChange = (value) => {
    sliderValue.current = value; // Mettre à jour la valeur du slider dans la référence
  };

  // Pour améliorer la fluidité de l'animation entre les changements
  const handleSliderComplete = () => {
    setBulbLight(sliderValue.current); // Mettre à jour l'intensité lumineuse lorsque le slider est complet
  };
  
  

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']} // Fond dégradé
      style={styles.gradientContainer}
    >
      {/* Affichage de la lumière extérieure */}
      <ThemedView style={styles.container}>
        <Text style={[styles.text, getTextColor()]}>
          Intensité Lumineuse Extérieure :{' '}
          {lightIntensity !== null ? `${lightIntensity.toFixed(2)} lux` : 'Mesure en cours...'}
        </Text>
      </ThemedView>

      {/* Contrôle de l'ampoule */}
      <ThemedView style={styles.container}>
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

      {/* Slider pour régler l'intensité lumineuse de l'ampoule */}
      <ThemedView style={styles.container}>
        <Text style={styles.text}>Intensité de l'ampoule :</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={bulbLight}
          onValueChange={handleSliderChange}
          onSlidingComplete={handleSliderComplete} // Finaliser le changement uniquement après avoir relâché le slider
          minimumTrackTintColor="#007BFF"
          maximumTrackTintColor="#CCCCCC"
          thumbTintColor="#007BFF"
          disabled={!lightOn} // Désactiver le slider si l'ampoule est éteinte
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fond semi-transparent
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
    color: 'black', // Couleur par défaut
  },
  lowLightText: {
    color: '#FF3B30', // Rouge pour une faible intensité lumineuse
  },
  mediumLightText: {
    color: '#FF9500', // Orange pour une intensité lumineuse moyenne
  },
  highLightText: {
    color: '#34C759', // Vert pour une intensité lumineuse élevée
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
});
