-- Initialize games platform database

-- Create platforms table first
CREATE TABLE IF NOT EXISTS platforms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    emulator_core VARCHAR(50),
    file_extensions JSONB,
    icon VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default platforms
INSERT INTO platforms (name, code, emulator_core, file_extensions, icon) VALUES
('PlayStation 1', 'ps1', 'mednafen_psx_hw', '["iso", "bin", "cue", "pbp"]', '/icons/ps1.png'),
('Nintendo 64', 'n64', 'mupen64plus_next', '["z64", "n64", "v64"]', '/icons/n64.png'),
('Super Nintendo', 'snes', 'snes9x', '["smc", "sfc", "fig", "swc"]', '/icons/snes.png'),
('Game Boy Advance', 'gba', 'mgba', '["gba", "zip"]', '/icons/gba.png'),
('Game Boy Color', 'gbc', 'gambatte', '["gbc", "gb", "zip"]', '/icons/gbc.png'),
('NES', 'nes', 'fceumm', '["nes", "unif", "unf"]', '/icons/nes.png'),
('Sega Genesis', 'genesis', 'genesis_plus_gx', '["md", "bin", "gen"]', '/icons/genesis.png'),
('Sega Dreamcast', 'dreamcast', 'flycast', '["cdi", "gdi", "chd"]', '/icons/dreamcast.png'),
('PlayStation 2', 'ps2', 'pcsx2', '["iso", "bin", "cue"]', '/icons/ps2.png'),
('PSP', 'psp', 'ppsspp', '["iso", "cso", "pbp"]', '/icons/psp.png')
ON CONFLICT (code) DO NOTHING;

-- Create games table
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    platform_id INTEGER NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
    description TEXT,
    release_year INTEGER,
    publisher VARCHAR(100),
    developer VARCHAR(100),
    genre VARCHAR(100),
    rom_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_hash VARCHAR(64),
    cover_image VARCHAR(500),
    screenshot_1 VARCHAR(500),
    screenshot_2 VARCHAR(500),
    screenshot_3 VARCHAR(500),
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    play_count INTEGER DEFAULT 0,
    favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_played TIMESTAMP
);

-- Create indexes for games
CREATE INDEX IF NOT EXISTS idx_games_title ON games(title);
CREATE INDEX IF NOT EXISTS idx_games_platform_id ON games(platform_id);
CREATE INDEX IF NOT EXISTS idx_games_genre ON games(genre);

-- Create game_requests table
CREATE TABLE IF NOT EXISTS game_requests (
    id SERIAL PRIMARY KEY,
    game_title VARCHAR(255) NOT NULL,
    platform_id INTEGER NOT NULL REFERENCES platforms(id),
    user_email VARCHAR(255),
    user_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'installing', 'installed', 'failed')),
    admin_notes TEXT,
    download_url VARCHAR(500),
    installation_progress INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    installed_at TIMESTAMP
);

-- Create index for requests
CREATE INDEX IF NOT EXISTS idx_requests_status ON game_requests(status);

-- Create save_states table
CREATE TABLE IF NOT EXISTS save_states (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id VARCHAR(100),
    slot INTEGER DEFAULT 0,
    file_path VARCHAR(500) NOT NULL,
    screenshot VARCHAR(500),
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for save states
CREATE INDEX IF NOT EXISTS idx_save_states_game_id ON save_states(game_id);
CREATE INDEX IF NOT EXISTS idx_save_states_user_id ON save_states(user_id);
