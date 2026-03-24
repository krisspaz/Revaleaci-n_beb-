-- Script para reiniciar los votos de la revelación de género
-- Cópialo y ejecútalo en Supabase -> SQL Editor -> New Query

-- 1. Reiniciar los contadores generales
UPDATE votes
SET boy = 0, girl = 0
WHERE id = 1;

-- 2. Eliminar el historial de votos de los invitados
TRUNCATE TABLE guest_votes;
