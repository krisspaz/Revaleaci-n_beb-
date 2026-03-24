-- Script para tracking avanzado: Visitas + Votos
-- Ejecuta esto en Supabase SQL Editor

-- 1. Eliminar la tabla anterior (si existe) para no tener datos duplicados
DROP TABLE IF EXISTS guest_votes;

-- 2. Crear la nueva tabla de invitados
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  vote TEXT, -- Será nulo al entrar, y se llenará con 'boy' o 'girl' al votar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Limpiar también los votos en caso de que necesiten reiniciarse
UPDATE votes SET boy = 0, girl = 0 WHERE id = 1;

-- Opcional: Activar Realtime para esta tabla si quieres ver en vivo cuando alguien entra
-- ALTER PUBLICATION supabase_realtime ADD TABLE guests;
