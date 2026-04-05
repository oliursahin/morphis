fn main() {
  // Load .env so option_env!() picks up keys at compile time
  if let Ok(path) = std::fs::canonicalize("../.env") {
    if let Ok(contents) = std::fs::read_to_string(&path) {
      for line in contents.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
          continue;
        }
        if let Some((key, value)) = line.split_once('=') {
          let key = key.trim();
          let value = value.trim();
          if !value.is_empty() && std::env::var(key).is_err() {
            println!("cargo:rustc-env={key}={value}");
          }
        }
      }
      println!("cargo:rerun-if-changed=../.env");
    }
  }
  tauri_build::build()
}
