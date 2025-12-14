-- 1. Create users profile table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  nik text UNIQUE NOT NULL,
  address text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('Infrastruktur', 'Sosial', 'Kebersihan', 'Keamanan', 'Pelayanan Publik')),
  priority text NOT NULL DEFAULT 'Sedang' CHECK (priority IN ('Tinggi', 'Sedang', 'Rendah')),
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Solved')),
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view complaints" ON complaints;
DROP POLICY IF EXISTS "Users can create their own complaints" ON complaints;
DROP POLICY IF EXISTS "Users can update their own complaints" ON complaints;
DROP POLICY IF EXISTS "Admins can update any complaint" ON complaints;
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;

-- 6. RLS Policies for users table
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 7. RLS Policies for complaints table
CREATE POLICY "Anyone can view complaints"
  ON complaints FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own complaints"
  ON complaints FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own complaints"
  ON complaints FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any complaint"
  ON complaints FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 8. RLS Policies for comments table
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_complaint_id ON comments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 10. Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_complaints_updated_at ON complaints;
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 12. Create function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, nik, address, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'nik', '0000000000000000'),
    COALESCE(NEW.raw_user_meta_data->>'address', '-'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create trigger for auto-create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 14. Insert sample admin user (OPTIONAL - untuk testing)
-- Password default: Admin123!
-- GANTI PASSWORD INI SETELAH LOGIN PERTAMA KALI!
/*
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  'admin@desanamboudik.id',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  '{"full_name": "Admin Desa", "nik": "1234567890123456", "address": "Kantor Desa", "role": "admin"}'::jsonb,
  'authenticated',
  'authenticated'
);
*/
