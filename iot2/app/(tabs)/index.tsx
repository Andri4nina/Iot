import React, { useEffect, useState, useRef } from 'react';
import { Button, StyleSheet, Text, View, Animated } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { LightSensor } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';

export default function HomeScreen() {
  const [lightIntensity, setLightIntensity] = useState<number | null>(null);
  const [lightOn, setLightOn] = useState<boolean>(false);
  const [bulbLight, setBulbLight] = useState<number>(50);
  
  const sliderValue = useRef<number>(bulbLight);
  const ws = useRef<WebSocket | null>(null);
  const lastLightOn = useRef(lightOn);
  const lastBulbLight = useRef(bulbLight);
  const turnOffTimer = useRef<NodeJS.Timeout | null>(null);


  // Animation pour l'ampoule
  const bulbOpacity = useRef(new Animated.Value(lightOn ? 1 : 0)).current;

  // ✅ Fonction pour envoyer les données au WebSocket
  const sendData = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const data = {
        illuminance: lightIntensity,
        lightOn: lastLightOn.current,
        bulbLight: lastBulbLight.current,
      };
      ws.current.send(JSON.stringify(data));
      console.log('Données envoyées:', data);
    }
  };

  // ✅ Gestion de l'allumage/extinction de la lumière
  const toggleLight = () => {
    setLightOn((prev) => {
      const newState = !prev;
      lastLightOn.current = newState;
      
      Animated.timing(bulbOpacity, {
        toValue: newState ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      sendData(); // Envoyer immédiatement après le changement
      return newState;
    });
  };

  // ✅ Initialisation du capteur de lumière
  useEffect(() => {
    (async () => {
      const isAvailable = await LightSensor.isAvailableAsync();
      if (isAvailable) {
        LightSensor.setUpdateInterval(1000);
        const subscription = LightSensor.addListener((data) => {
          setLightIntensity(data.illuminance);
        });
        return () => subscription.remove();
      } else {
        console.warn("Le capteur de lumière n'est pas disponible.");
      }
    })();
  }, []);

  // ✅ Connexion WebSocket
  useEffect(() => {
    ws.current = new WebSocket('ws://192.168.88.106:5000');
    ws.current.onopen = () => console.log('WebSocket connecté');
    ws.current.onmessage = (event) => console.log('Données reçues:', event.data);
    ws.current.onerror = (error) => console.error('WebSocket erreur:', error);
    ws.current.onclose = () => console.log('WebSocket déconnecté');

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // ✅ Envoi des données quand `lightIntensity` change
  useEffect(() => {
    sendData();
  }, [lightIntensity]);

// Allumer automatiquement la lumière si l'intensité est basse
useEffect(() => {
  if (lightIntensity !== null && lightIntensity < 50 && !lightOn) {
    // Allumer immédiatement si lumière trop basse
    setLightOn(true);
    lastLightOn.current = true;

    Animated.timing(bulbOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    sendData();

    // Annuler un éventuel timer d'extinction en attente
    if (turnOffTimer.current) {
      clearTimeout(turnOffTimer.current);
      turnOffTimer.current = null;
    }
  } 
  else if (lightIntensity !== null && lightIntensity >= 100 && lightOn) {
    // Démarrer un timer de 10 secondes avant d'éteindre
    if (!turnOffTimer.current) {
      turnOffTimer.current = setTimeout(() => {
        setLightOn(false);
        lastLightOn.current = false;

        Animated.timing(bulbOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();

        sendData();
        turnOffTimer.current = null; // Réinitialiser le timer
      }, 5000); // 10 secondes
    }
  }
}, [lightIntensity]);



  // ✅ Gestion du slider
  const handleSliderChange = (value: number) => {
    sliderValue.current = value;
  };

  const handleSliderComplete = () => {
    setBulbLight(sliderValue.current);
    lastBulbLight.current = sliderValue.current;
    sendData();
  };

  // ✅ Gestion des couleurs en fonction de la lumière
  const getTextColor = () => {
    if (lightIntensity === null) return styles.defaultText;
    if (lightIntensity < 50) return styles.lowLightText;
    if (lightIntensity <= 200) return styles.mediumLightText;
    return styles.highLightText;
  };

  const getButtonColor = () => {
    if (lightIntensity === null) return '#007BFF';
    if (lightIntensity < 50) return '#FF3B30';
    if (lightIntensity <= 200) return '#FF9500';
    return '#34C759';
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.gradientContainer}
    >
      {/* Affichage de la lumière extérieure */}
      <ThemedView style={styles.container}>
        <Text style={[styles.text, getTextColor()]}>
          Intensité Lumineuse Extérieure :{' '}
          {lightIntensity !== null ? `${lightIntensity.toFixed(2)} lux` : 'Mesure en cours...'}
        </Text>
      </ThemedView>

      {/* Ampoule animée */}
      <ThemedView style={styles.container}>
        <View style={styles.bulbContainer}>
          <Animated.View
            style={[
              styles.bulb,
              {
                opacity: bulbOpacity,
                backgroundColor: lightOn ? '#FFFF00' : '#CCCCCC',
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

      {/* Slider pour l'intensité de l'ampoule */}
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
  defaultText: { color: 'black' },
  lowLightText: { color: '#FF3B30' },
  mediumLightText: { color: '#FF9500' },
  highLightText: { color: '#34C759' },
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
