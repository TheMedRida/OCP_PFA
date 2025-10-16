# Système intelligent de gestion des interventions avec intégration IoT et maintenance prédictive

## 📋 Aperçu du Projet

Une plateforme intelligente de maintenance prédictive qui combine l'intégration de données de capteurs IoT, la surveillance en temps réel et l'apprentissage automatique pour prédire les défaillances d'équipements avant qu'elles ne se produisent. Développé pour le Groupe OCP, leader mondial des phosphates.

**Présenté par :** Mohamed Rida Lajghal  
**Sous la supervision :** M. El ARCHI Nabil, PR. LYAQINI Soufiane  
**Date :** 15 septembre 2025

## 🎯 Objectifs

- **Anticiper les pannes** grâce aux données des capteurs (IoT)
- **Digitaliser les processus** de gestion des interventions
- **Analyser en temps réel** avec l'Intelligence Artificielle
- **Réduire les arrêts imprévus** et les coûts de maintenance

## 🏢 Contexte du Projet

### Le Défi Industriel
- Arrêts imprévus des machines = Coûts énormes pour l'industrie (OCP)
- Maintenance souvent réactive : on intervient après la panne
- Gestion manuelle des interventions (papier/Excel) peu pratique et limitée
- Données capteurs non exploitées pour la prédiction
- Pas de plateforme centralisée combinant gestion et prédiction

### La Solution : Maintenance Prédictive 4.0
Une plateforme unifiée qui combine le streaming de données en temps réel, les prédictions par apprentissage automatique et la gestion complète des interventions dans une interface unique.

## 🏗️ Architecture du Système

### Stack Technologique

**Backend :**
- Spring Boot
- Apache Kafka (streaming de données en temps réel)
- ONNX Runtime (inférence ML)
- MySQL (persistance des données)

**Frontend :**
- React
- Recharts (visualisations de données)

**Machine Learning :**
- LightGBM (optimisé et converti en ONNX)
- Inférence temps réel avec faible latence

## 🔬 Approche d'Apprentissage Automatique

### Cadrage du Problème
**Classification Binaire Supervisée**
- **Objectif :** Prédire une défaillance (failure occurrence = 1)
- **Entrée :** 93 caractéristiques techniques et opérationnelles
- **Sortie :** 2 classes (0: « Normal », 1: « Défaillance imminente »)

### Dataset : Siemens Smart Manufacturing Lab
- **Période :** Janvier 2022 - Janvier 2025 (3 années complètes)
- **Fréquence :** 1 mesure toutes les 60 secondes
- **Volume :** 1.5+ millions d'enregistrements
- **Origine :** Capteurs industriels réels (CNC, presses hydrauliques)

### Caractéristiques Principales
- Vibrations (X, Y, Z)
- Température moteur
- Pression hydraulique
- Niveau d'usure outils
- Taux de production
- Conditions environnementales
- Latence réseau
- État des équipements
- Historique maintenance
- Occurrence de défaillances

### Modèles Testés
- Random Forest (Base + Optimisé)
- Extra Trees (Base + Optimisé)
- XGBoost (Base + Optimisé)
- **LightGBM (Base + Optimisé)** ✓ Retenu
- HistGradientBoosting (Base + Optimisé)

### Modèle Sélectionné : LightGBM (Optimisé)

**Métriques de Performance :**
- **F1-Score :** 97.7%
- **Précision :** 98.5%
- **Rappel :** 97.0%
- **ROC AUC :** 0.9935
- **Latence :** < 60 ms
- **Taille :** 7.2 MB

## ⚡ Workflow de Prédiction Temps Réel

1. **Ingestion des Données :** Les capteurs IoT envoient des données vers les topics Kafka
2. **Traitement de Flux :** Les consommateurs Kafka traitent les données entrantes
3. **Feature Engineering :** Transformation des données brutes en features ML
4. **Inférence ML :** ONNX Runtime exécute les prédictions du modèle LightGBM
5. **Génération d'Alertes :** Le système génère des alertes selon les probabilités de défaillance
6. **Mise à Jour Dashboard :** Visualisation temps réel actualisée pour tous les utilisateurs

## 💻 Fonctionnalités de la Plateforme

### Dashboard Temps Réel
Accessible à tous les rôles avec :
- **Données Capteurs :** Visualisation temps réel, état des machines, alertes actuelles
- **Prédictions ML :** Probabilités défaillance, historique des prédictions, niveaux de criticité
- **État du Parc :** Santé des équipements, statistiques globales, indicateurs KPI

### Interface Administrateur
Gestion complète des interventions et des utilisateurs :
- **Gestion des Utilisateurs :** Créer/modifier/supprimer des comptes, assigner les rôles (Technicien, Utilisateur), envoyer les emails d'activation
- **Supervision des Interventions :** Voir toutes les interventions, assigner/réassigner aux techniciens, supprimer les interventions

### Interface Utilisateur
- Créer une nouvelle demande d'intervention
- Voir le statut des demandes
- Consulter l'historique

### Interface Technicien
- Liste des interventions assignées
- Marquer comme « Terminé »
- Historique des interventions assignées

## 🔐 Sécurité

- Contrôle d'accès basé sur les rôles (RBAC)
- Authentification et autorisation sécurisées
- Système sécurisé avec rôles et permissions

## 🚀 Perspectives d'Évolution

### Évolutions Techniques
- **WebSockets** pour du vrai temps réel
- **Application mobile** pour les techniciens
- **Notifications en temps réel** (push notifications)
- **Intégration** avec les systèmes OCP existants

### Évolutions IA Avancées
- **Prédiction du Type de Maintenance :** Prédire le type de maintenance nécessaire (réparation, remplacement, nettoyage)
- **Classification du Type de Défaillance :** Identifier les types spécifiques de défaillances
- **RUL (Remaining Useful Life) :** Estimation par séries temporelles

## 📊 Réalisations Clés

✅ Une plateforme complète de maintenance prédictive  
✅ Des prédictions précises (97.7%) et rapides (<60ms)  
✅ Une interface simple pour tous les utilisateurs  
✅ Une intégration temps réel avec Kafka et ONNX  
✅ Un système sécurisé avec rôles et permissions  

## 🛠️ Défis Techniques Résolus

### Intégration de flux de données temps réel hétérogènes
Architecture modulaire avec Kafka pour le streaming

### Prédiction fiable des défaillances avec faible latence
Modèles ML optimisés pour l'inférence temps réel

### Orchestration de workflows métier complexes
Interface unifiée pour tous les acteurs (Admin, Technicien, Utilisateur)

## 📚 Bibliographie

1. Apache Kafka Documentation - https://kafka.apache.org/documentation/
2. Ke, G. et al. (2017). LightGBM: A Highly Efficient Gradient Boosting Decision Tree. Advances in Neural Information Processing Systems.
3. ONNX Runtime Documentation (2023) - https://onnxruntime.ai/docs/
4. Spring Boot Documentation (2023) - https://spring.io/projects/spring-boot
5. Siemens Smart Manufacturing Lab (2024). Industrial AI Research Program Dataset. Kaggle.
---

**Note :** Ce système représente une solution complète Industrie 4.0 pour la maintenance prédictive, combinant architecture logicielle moderne, traitement de données en temps réel et techniques d'apprentissage automatique de pointe.

---

> *“Vers une maintenance intelligente, prédictive et connectée.”*
