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

  // Définir le mode sombre ou clair en fonction de l'intensité lumineuse
  const textStyle = lightIntensity !== null && lightIntensity > 50 ? styles.lightText : styles.darkText;

  return (
    <ThemedView style={styles.container}>
      <Text style={[styles.text, textStyle]}>
        Intensité Lumineuse :{" "}
        {lightIntensity !== null ? `${lightIntensity.toFixed(2)} lux` : "Mesure en cours..."}
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
  lightText: {
    color: "red", // Texte noir pour le mode clair
  },
  darkText: {
    color: "red", // Texte blanc pour le mode sombre
  },
});