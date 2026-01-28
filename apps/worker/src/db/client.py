import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load file .env
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Pastikan SUPABASE_URL dan SUPABASE_KEY ada di file .env")

# Inisialisasi Client
supabase: Client = create_client(url, key)

print("Koneksi Supabase Berhasil Diinisialisasi")