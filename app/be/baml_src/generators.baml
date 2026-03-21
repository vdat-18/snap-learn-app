// =============================================================
// BAML Generator Configuration
// =============================================================
// Configures code generation for the Python backend.
// Run `baml-cli generate` to regenerate baml_client/.
// =============================================================

generator target {
  // Generate Pydantic v2 models (matches FastAPI + Pydantic v2 stack)
  output_type "python/pydantic"

  // Output directory relative to baml_src/
  // Places baml_client/ at app/be/baml_client/
  output_dir "../"

  // Async-first — matches FastAPI async/await architecture
  default_client_mode "async"

  // Pin to installed baml-py version for reproducibility
  version "0.220.0"
}
