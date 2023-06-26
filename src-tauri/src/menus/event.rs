use tauri::{WindowMenuEvent, Wry};
// use crate::files::{file_struct, file_tools};

pub fn m_event(event: WindowMenuEvent<Wry>) {
    match event.menu_item_id() {
        "quit" => {
            // if !file_sql::is_create("files") {
            //     file_sql::create("files");
            // }
            // // base_sqlite3::private_function();
            // println!("Message from Rust: {}", "quit");
            // let  label = tauri::Window::window::label();
            // println!("Message from Rust: {:?}", label);
            std::process::exit(0);
        }
        "close" => {
            // let mut event_1 = event;
            // let plant = Asparagus {};
            // println!("I'm growing {:?}!", plant);
            // println!("Message from Rust: {}", "close");
            // event.window().close().unwrap();
            // FileStruct::{Site};
            // let base: file_struct::Site = file_tools::file_tools::get_base_path();
            // println!("65:  {:?}", base);

            // 切换页面
            let window = event.window().clone();
            let result = window.emit("routing", "about");
            match result {
                Ok(_) => todo!(),
                Err(error) => println!("An error occurred: {}", error),
                
            }
        
            // 打开About
            // let AppHandle = event.window().app_handle();
            // // let handle = AppHandle();
            // WindowBuilder::new(
            //     &window_2,
            //     "about",
            //     WindowUrl::App("/about".into()),
            // );
            //
            // let mut window = tauri.window();
            // window
            //     .create_window(
            //         "acknowledgements".to_string(),
            //         WindowUrl::App("/about".into()),
            //         move |window_builder, webview_attributes| {
            //             (
            //                 window_builder.resizable(false).center().visible(true),
            //                 webview_attributes,
            //             )
            //         },
            //     )
            //     .unwrap();

            // tauri::Builder::default()
            //     // .menu(use_memu())
            //     // .on_menu_event(|event| {
            //     //     // 处理菜单事件
            //     //     m_event(event);
            //     // })
            //     .invoke_handler(tauri::generate_handler![])
            //     .run(tauri::generate_context!())
            //     .expect("error while running tauri application");


            // let window = WindowBuilder::new()
            //     .title("My Tauri App")
            //     .url("https://www.example.com")
            //     .build()
            //     .unwrap();
            // window.run();


            // WindowBuilder::new(
            //     app,
            //     "external",
            //     WindowUrl::External("http://yjmyzz.cnblogs.com/".parse().unwrap()),
            // )
        }
        _ => {}
    };
}
