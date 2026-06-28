use tauri::http::Response;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let client = reqwest::blocking::Client::builder()
    .user_agent("CsupaszivKalandok/1.0 (https://csupaszivkalandok.hu/)")
    .build()
    .expect("failed to build reqwest client");

  tauri::Builder::default()
    .register_uri_scheme_protocol("osm-tile", move |_app, request| {
      let path = request.uri().path();
      let url = format!("https://a.tile.openstreetmap.org{}", path);
      
      let req = client.get(&url)
        .header("Referer", "https://csupaszivkalandok.hu/");
      
      match req.send() {
        Ok(mut resp) => {
          let status = resp.status().as_u16();
          let mut builder = Response::builder().status(status);
          
          if let Some(content_type) = resp.headers().get("content-type") {
            if let Ok(content_type_str) = content_type.to_str() {
              builder = builder.header("content-type", content_type_str);
            }
          }
          
          let mut bytes = Vec::new();
          if resp.copy_to(&mut bytes).is_ok() {
            builder.body(bytes).unwrap()
          } else {
            Response::builder().status(500).body(Vec::new()).unwrap()
          }
        }
        Err(_) => {
          Response::builder().status(500).body(Vec::new()).unwrap()
        }
      }
    })
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
