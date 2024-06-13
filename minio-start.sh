#!/bin/sh

# Si les variables d'environnement ne sont pas définies, envoyer un message d'erreur
if [ -z "$MINIO_ROOT_USER" ] || [ -z "$MINIO_ROOT_PASSWORD" ] || [ -z "$MINIO_BUCKET_NAME" ]; then
  echo "Les variables d'environnement MINIO_ROOT_USER, MINIO_ROOT_PASSWORD et MINIO_BUCKET_NAME doivent être définies"
  exit 1
fi

# Démarrer MinIO en arrière-plan
minio server /data --console-address ":9001" &

# Attendre que MinIO soit prêt
echo "Attente de MinIO pendant 2 secondes afin d'être sûr de son fonctionnement..."
sleep 2

echo "MinIO est prêt, création du bucket..."

# Configurer mc et créer le bucket
mc alias set myminio http://localhost:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}
mc mb myminio/${MINIO_BUCKET_NAME}

# Garder le conteneur actif en avant-plan
wait
