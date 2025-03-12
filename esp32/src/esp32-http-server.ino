#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>  // Pour parser le JSON

using namespace websockets;

// Configuration WiFi et WebSocket
const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* wsServerUrl = "ws://192.168.88.106:5000";  // Adresse WebSocket du serveur Node.js

WebsocketsClient wsClient;  // Objet WebsocketsClient

// Déclaration des variables pour stocker les valeurs
float illuminance = 0.0;
bool lightOn = false;
int bulbLight = 0;
int previousBulbLight = -1;  // Pour éviter l'affichage répétitif

// Configuration de la LED
const int ledPin = 5;  // Broche connectée à la LED
const int pwmChannel = 0;  // Canal PWM (0-15)
const int pwmResolution = 8;  // Résolution PWM (8 bits = valeurs de 0 à 255)

// Configuration du LCD I2C
#define I2C_ADDR 0x27  // Adresse du module LCD I2C (peut être 0x3F)
LiquidCrystal_I2C lcd(I2C_ADDR, 16, 2);  // Écran LCD 16x2

void setup() {
    Serial.begin(115200);

    // Configuration du LCD
    lcd.init();
    lcd.backlight();
    lcd.setCursor(0, 0);
    lcd.print("Intensite");

    // Configurer la broche de la LED en sortie
    pinMode(ledPin, OUTPUT);

    // Configurer le PWM
    ledcSetup(pwmChannel, 5000, pwmResolution);  // Fréquence de 5 kHz, résolution de 8 bits
    ledcAttachPin(ledPin, pwmChannel);  // Attacher la broche LED au canal PWM

    // Connexion WiFi avec timeout
    Serial.print("Connexion au WiFi");
    WiFi.begin(ssid, password);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {  // 10 secondes max
        delay(500);
        Serial.print(".");
        attempts++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n✅ WiFi connecté");
    } else {
        Serial.println("\n❌ Échec de connexion WiFi");
    }

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

            // Extraire les données JSON
            illuminance = doc["illuminance"];
            lightOn = doc["lightOn"];
            bulbLight = doc["bulbLight"];

            // Afficher les valeurs extraites dans le moniteur série
            Serial.print("Illuminance: ");
            Serial.println(illuminance);
            Serial.print("lightOn: ");
            Serial.println(lightOn ? "true" : "false");
            Serial.print("bulbLight: ");
            Serial.println(bulbLight);

            // Mise à jour de l'affichage LCD uniquement si la valeur change
            if (bulbLight != previousBulbLight) {
                previousBulbLight = bulbLight;
                lcd.setCursor(0, 1);
                lcd.print("Ampoule:     ");  // Effacer ancienne valeur
                lcd.setCursor(11, 1);
                lcd.print(bulbLight);
                lcd.print("%");
            }

            // Contrôler la LED en fonction de bulbLight
            if (lightOn) {
                int brightness = map(bulbLight, 0, 100, 0, 255);  // Convertir 0-100 en 0-255
                ledcWrite(pwmChannel, brightness);
                Serial.println("LED allumée avec luminosité : " + String(brightness));
            } else {
                ledcWrite(pwmChannel, 0);
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
