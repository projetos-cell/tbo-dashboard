-- Novos campos para proposta interativa com fluxo D3D
-- introduction: texto rico de apresentação antes do escopo
-- show_d3d_flow: flag para exibir pipeline D3D na proposta pública
-- payment_conditions: JSONB com opções de pagamento estruturadas

ALTER TABLE proposals ADD COLUMN IF NOT EXISTS introduction text;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS show_d3d_flow boolean DEFAULT false;
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS payment_conditions jsonb DEFAULT '[]'::jsonb;
