#include <WiFi.h>
#include <ArduinoWebsockets.h>

using namespace websockets;

const char* ssid = "Wokwi-GUEST";
const char* password = "";

const char* wsServerUrl = "ws://192.168.88.106:5000";  // Adresse WebSocket du serveur Node.js

WebsocketsClient wsClient;  // Créer l'objet WebsocketsClient

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
            Serial.print("📩 Données reçues: ");
            Serial.println(message.data());
        });
    } else {
        Serial.println("❌ Échec de la connexion WebSocket !");
    }
}

void loop() {
    wsClient.poll();  // Maintenir la connexion WebSocket active
}
