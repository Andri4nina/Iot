import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { LightSensor } from "expo-sensors";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
  const [lightIntensity, setLightIntensity] = useState(null); // Initialisé à null pour gérer l'état initial

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

  // Définir la couleur du texte en fonction de l'intensité lumineuse
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

  return (
    <ThemedView style={styles.container}>
      <Text style={[styles.text, getTextColor()]}>
        Intensité Lumineuse :{" "}
        {lightIntensity !== null ? `${lightIntensity} lux` : "Mesure en cours..."}
      </Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  defaultText: {
    color: "black", // Couleur par défaut
  },
  lowLightText: {
    color: "red", // Rouge pour une faible intensité lumineuse
  },
  mediumLightText: {
    color: "orange", // Orange pour une intensité lumineuse moyenne
  },
  highLightText: {
    color: "green", // Vert pour une intensité lumineuse élevée
  },
});