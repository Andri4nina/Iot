#include <WiFi.h>
#include <ArduinoWebsockets.h>

using namespace websockets;

const char* ssid = "Wokwi-GUEST";
const char* password = "";

const char* wsServer = "ws://192.168.43.56:5000";  // Adresse WebSocket du serveur Node.js

WebsocketsClient wsClient;

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
    if (wsClient.connect(wsServer)) {
        Serial.println("✅ Connexion WebSocket réussie !");
        wsClient.send("Hello from ESP32!");
    } else {
        Serial.println("❌ Échec de la connexion WebSocket !");
    }
}

void loop() {
    wsClient.poll();  // Maintenir la connexion WebSocket active
}
