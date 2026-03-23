-- Copia y pega todo esto en Supabase -> SQL Editor -> New Query, y presiona RUN

-- 1. Crear tabla de votos
CREATE TABLE IF NOT EXISTS votes (
  id INT PRIMARY KEY,
  boy INT DEFAULT 0,
  girl INT DEFAULT 0
);

-- 2. Insertar fila inicial si no existe
INSERT INTO votes (id, boy, girl) VALUES (1, 0, 0) ON CONFLICT (id) DO NOTHING;

-- 3. Activar Supabase Realtime para la tabla votes (para que se actualice en vivo)
ALTER PUBLICATION supabase_realtime ADD TABLE votes;

-- 4. Crear función segura para incrementar atómicamente los votos (RPC)
CREATE OR REPLACE FUNCTION increment_vote(row_id INT, gender_column TEXT)
RETURNS void AS $$
BEGIN
  IF gender_column = 'boy' THEN
    UPDATE votes SET boy = boy + 1 WHERE id = row_id;
  ELSIF gender_column = 'girl' THEN
    UPDATE votes SET girl = girl + 1 WHERE id = row_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
