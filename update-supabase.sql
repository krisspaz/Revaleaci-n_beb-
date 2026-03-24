-- Script para agregar la tabla de votos de invitados con nombres
-- Copia y pega todo esto en Supabase -> SQL Editor -> New Query, y presiona RUN

CREATE TABLE IF NOT EXISTS guest_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  vote TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Si deseas activar el realtime en caso de que quieras mostrar un muro de nombres en vivo después:
-- ALTER PUBLICATION supabase_realtime ADD TABLE guest_votes;
