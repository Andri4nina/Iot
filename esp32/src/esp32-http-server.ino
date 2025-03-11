#include <WiFi.h>
#include <ArduinoWebsockets.h>

using namespace websockets;

const char* ssid = "Wokwi-GUEST";
const char* password = "";

const char* wsClient = "ws://192.168.88.106:5000";

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

    } else {
        Serial.println("❌ Échec de la connexion WebSocket !");
    }

    Serial.println("En attente du message...");
wsClient.onMessage([](WebsocketsMessage message) {
    Serial.print("📩 Données reçues: ");
    Serial.println(message.data());
});
Serial.println("Message reçu, affiché ci-dessus.");

}

void loop() {
    wsClient.poll();  // Maintenir la connexion WebSocket active
}
