fn main() {
    // Forward .env vars to rustc so env!() macros work at compile time
    if let Ok(path) = dotenvy::dotenv() {
        println!("cargo:rerun-if-changed={}", path.display());
    }
    for key in ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "UNSPLASH_ACCESS_KEY"] {
        if let Ok(val) = std::env::var(key) {
            println!("cargo:rustc-env={key}={val}");
        }
    }
    tauri_build::build()
}
