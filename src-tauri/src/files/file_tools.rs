// pub struct Site;
// mod FileStruct::{Site};

pub mod file_tools {
    use crate::files::file_struct::Site;
    pub fn get_base_path () -> Site {
        Site {
            domain: String::from("domain"),
            nation: String::from("nation")
        }
    }
}
