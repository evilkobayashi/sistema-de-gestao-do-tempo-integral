-- Supabase PostgreSQL Schema - Sistema de Gestão do Tempo Integral (Ensino Fundamental 1º ao 9º Ano)

CREATE TABLE IF NOT EXISTS public.municipios (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    uf VARCHAR(2) NOT NULL DEFAULT 'RJ',
    secretaria_nome TEXT DEFAULT 'Secretaria Municipal de Educação',
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.escolas (
    id SERIAL PRIMARY KEY,
    municipio_id INT REFERENCES public.municipios(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    segmento TEXT DEFAULT 'Ensino Fundamental (1º ao 9º ano)',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.oficinas (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    eixo_bncc TEXT DEFAULT 'Recomposição de Aprendizagem', -- e.g., Letramento, Raciocínio Lógico, Robótica, Esportes, Cultura Digital
    segmento TEXT DEFAULT 'Ensino Fundamental (1º ao 9º ano)',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.oficineiros (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE,
    email TEXT,
    telefone TEXT,
    max_horas_semanais NUMERIC(4,1) DEFAULT 40.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.turnos (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL
);

INSERT INTO public.turnos (id, nome) VALUES 
(1, 'Manhã'), 
(2, 'Tarde'), 
(3, 'Integral') 
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.lotacoes (
    id SERIAL PRIMARY KEY,
    escola_id INT REFERENCES public.escolas(id) ON DELETE CASCADE,
    turno_id INT REFERENCES public.turnos(id),
    turma TEXT NOT NULL, -- e.g., '1º Ano A', '5º Ano B', '7º Ano C', '9º Ano A'
    oficina_id INT REFERENCES public.oficinas(id) ON DELETE CASCADE,
    oficineiro_id INT REFERENCES public.oficineiros(id) ON DELETE CASCADE,
    horas_aula NUMERIC(4,1) NOT NULL DEFAULT 0.0,
    horas_planejamento NUMERIC(4,1) NOT NULL DEFAULT 0.0,
    dias TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lotacoes_oficineiro ON public.lotacoes(oficineiro_id);
CREATE INDEX IF NOT EXISTS idx_lotacoes_escola ON public.lotacoes(escola_id);
CREATE INDEX IF NOT EXISTS idx_lotacoes_turno ON public.lotacoes(turno_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oficinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oficineiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotacoes ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated and public client app
CREATE POLICY "Allow read access" ON public.municipios FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.escolas FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.oficinas FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.oficineiros FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.lotacoes FOR SELECT USING (true);
