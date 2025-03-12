#include <WiFi.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>  // Pour parser le JSON

using namespace websockets;

const char* ssid = "Wokwi-GUEST";
const char* password = "";

const char* wsServerUrl = "ws://192.168.193.190:5000";  // Adresse WebSocket du serveur Node.js

WebsocketsClient wsClient;  // Créer l'objet WebsocketsClient

// Déclaration des variables pour stocker les valeurs extraites
float illuminance = 0.0;
bool lightOn = false;
int bulbLight = 0;

// Configuration de la LED
const int ledPin = 5;  // Broche connectée à la LED
const int pwmChannel = 0;  // Canal PWM (0-15)
const int pwmResolution = 8;  // Résolution PWM (8 bits = valeurs de 0 à 255)

void setup() {
    Serial.begin(115200);

    // Configurer la broche de la LED en sortie
    pinMode(ledPin, OUTPUT);

    // Configurer le PWM
    ledcSetup(pwmChannel, 5000, pwmResolution);  // Fréquence de 5 kHz, résolution de 8 bits
    ledcAttachPin(ledPin, pwmChannel);  // Attacher la broche LED au canal PWM

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
            bulbLight = doc["bulbLight"];       // Exemple de champ bulbLight

            // Afficher les valeurs extraites
            Serial.print("Illuminance: ");
            Serial.println(illuminance);
            Serial.print("lightOn: ");
            Serial.println(lightOn ? "true" : "false");
            Serial.print("bulbLight: ");
            Serial.println(bulbLight);

            // Contrôler la LED
            if (lightOn) {
                // Allumer la LED avec la luminosité définie par bulbLight
                int brightness = map(bulbLight, 0, 100, 0, 700);  // Convertir bulbLight (0-100) en valeur PWM (0-255)
                ledcWrite(pwmChannel, brightness);  // Appliquer la luminosité
                Serial.println("LED allumée avec luminosité : " + String(brightness));
            } else {
                // Éteindre la LED
                ledcWrite(pwmChannel, 0);  // Luminosité à 0
                Serial.println("LED éteinte");
            }
        });
    } else {
        Serial.println("❌ Échec de la connexion WebSocket !");
    }
}

void loop() {
    wsClient.poll();  // Maintenir la connexion WebSocket active
}