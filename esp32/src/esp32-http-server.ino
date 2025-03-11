#include <WiFi.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>  // Inclure la bibliothèque ArduinoJson

using namespace websockets;

const char* ssid = "Wokwi-GUEST";
const char* password = "";

const char* wsServerUrl = "ws://192.168.88.106:5000";  // Adresse WebSocket du serveur Node.js

WebsocketsClient wsClient;  // Créer l'objet WebsocketsClient

// Déclaration des variables pour stocker les valeurs extraites
float illuminance = 0.0;
bool lightOn = false;
int bulbLight = 0;

void setup() {
    Serial.begin(115200);

    // Connexion WiFi
    WiFi.begin(ssid, password);
    Serial.print("Connexion au WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connecté");

    // Connexion WebSocket
    if (wsClient.connect(wsServerUrl)) {
        Serial.println("✅ Connexion WebSocket réussie !");

        // Gestionnaire d'événements pour les messages reçus
        wsClient.onMessage([](WebsocketsMessage message) {
            // Créer un objet JSON pour analyser le message
            StaticJsonDocument<200> doc;
            DeserializationError error = deserializeJson(doc, message.data());

            if (error) {
                Serial.print("Échec de l'analyse du JSON: ");
                Serial.println(error.c_str());
                return;
            }

            // Extraire les données JSON dans les variables appropriées
            illuminance = doc["illuminance"];   // Exemple de champ illuminance
            lightOn = doc["lightOn"];           // Exemple de champ lightOn
            bulbLight = doc["bulbLight"];         // Exemple de champ bulbLight

            // Afficher les valeurs extraites
            Serial.print("Illuminance: ");
            Serial.println(illuminance);
            Serial.print("lightOn: ");
            Serial.println(lightOn ? "true" : "false");
            Serial.print("bulbLight: ");
            Serial.println(bulbLight);
        });
    } else {
        Serial.println("❌ Échec de la connexion WebSocket !");
    }
}

void loop() {
    wsClient.poll();  // Maintenir la connexion WebSocket active

    // Ici, tu peux utiliser les variables `illuminance`, `lighton` et `bublight` pour d'autres traitements.
    // Par exemple, tu pourrais les utiliser pour contrôler des appareils ou afficher les valeurs.
}
