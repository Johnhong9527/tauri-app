import {useState, useCallback, useEffect} from "react";
import reactLogo from "../../assets/react.svg";
import {invoke} from "core";
// import {createDir, BaseDirectory} from '@tauri-apps/plugin-fs';
// Create the `$APPDATA/users` directory
import {  homeDir } from '@tauri-apps/api/path';
// import "./App.css";

function Home() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [filePath, setFilePath] = useState("");

  useEffect(() => {
    init();
  }, [])

  async function init() {
    const files = await invoke('file_path', {name: '/'})
    console.log(20, files);
  }
  // const inputOther:InputHTMLAttributes

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", {name}));
  }

  async function importFilePath() {
    const homeDirPath = await homeDir();
    // console.log('filePath', BaseDirectory);
    setGreetMsg(await invoke("file_path", {name: `homeDirPath: ${homeDirPath}`   }));
    // await createDir('users', { dir: BaseDirectory.AppData, recursive: true });
    // debugger
    // // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    // setGreetMsg(await invoke("greet", { name }));
  }

  const uploader = useCallback((node: HTMLInputElement) => {
    node?.setAttribute('webkitdirectory', '');
    node?.setAttribute('directory', '');
    node?.setAttribute('multiple', '');
  }, []);

  function showRealPath(e: any) {
    console.log(3131, e.target.value);
  }

  // @ts-ignore
  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer noopener">
          <img src="/vite.svg" className="logo vite" alt="Vite logo"/>
        </a>
        <a href="https://tauri.app" target="_blank" rel="noreferrer noopener">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo"/>
        </a>
        <a href="https://reactjs.org" target="_blank" rel="noreferrer noopener">
          <img src={reactLogo} className="logo react" alt="React logo"/>
        </a>
      </div>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <div className="row">
        <div>
          <input
            id="greet-input"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Enter a name..."
          />
          <button type="button" onClick={() => greet()}>
            Greet
          </button>
        </div>
        <div>
          <div>import file path</div>
          <input placeholder="请选择" type="file" ref={uploader} onFocus={showRealPath} onChange={(e) => {
            console.log('6262626262file', e);
            console.log('6262626262file', uploader);
          }}/>
          <button type="button" onClick={() => importFilePath()}>
            importFilePath
          </button>
        </div>
      </div>
      <p>{greetMsg}</p>
    </div>
  );
}

export default Home;
